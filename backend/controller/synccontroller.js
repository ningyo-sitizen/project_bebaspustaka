const { bebaspustaka, opac } = require("../config");

// ===================== STATUS HELPER =====================
async function getStatus(key) {
    const [rows] = await bebaspustaka.query(
        "SELECT last_update FROM summary_status WHERE name = ?",
        [key]
    );
    return rows.length ? rows[0].last_update : null;
}

async function setStatus(key, value) {
    await bebaspustaka.query(
        "REPLACE INTO summary_status (name, last_update) VALUES (?, ?)",
        [key, value]
    );
}

// ===================== GET LAST DATES =====================
async function getLastDailySummaryDate() {
    const [rows] = await bebaspustaka.query(
        "SELECT MAX(hari) AS last_date FROM summary_daily_visitor"
    );
    return rows.length ? rows[0].last_date : null;
}

async function getLastVisitorDate() {
    const [rows] = await opac.query(
        "SELECT DATE(MAX(checkin_date)) AS last_date FROM visitor_count"
    );
    return rows.length ? rows[0].last_date : null;
}

// ===================== DAILY SYNC =====================
async function syncDaily() {
    const lastSummaryDate = await getLastDailySummaryDate();
    const lastVisitorDate = await getLastVisitorDate();
    if (!lastVisitorDate) return;

    let startDate = lastSummaryDate ? new Date(lastSummaryDate) : new Date(lastVisitorDate);
    startDate.setDate(startDate.getDate() + 1); // mulai dari hari setelah terakhir di summary
    const endDate = new Date(lastVisitorDate);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayStr = d.toISOString().slice(0, 10);

        const [rows] = await opac.query(
            `SELECT DATE(checkin_date) AS hari, COUNT(*) AS total_visitor, YEAR(checkin_date) AS year
             FROM visitor_count
             WHERE DATE(checkin_date) = ?
             GROUP BY DATE(checkin_date)`,
            [dayStr]
        );

        if (rows.length) {
            const r = rows[0];
            await bebaspustaka.query(
                `REPLACE INTO summary_daily_visitor (hari, total_visitor, year)
                 VALUES (?, ?, ?)`,
                [r.hari, r.total_visitor, r.year]
            );
        }
    }

    await setStatus("daily", endDate.toISOString().slice(0, 10));
}

// ===================== WEEKLY SYNC =====================
async function syncWeekly() {
    const lastSummaryWeek = await getStatus("weekly");
    const lastVisitorDate = await getLastVisitorDate();
    if (!lastVisitorDate) return;

    const lastDate = new Date(lastVisitorDate);
    const weekKey = `${lastDate.getFullYear()}-W${getISOWeek(lastDate)}`;
    if (lastSummaryWeek === weekKey) return;

    // ambil data weekly
    const [rows] = await opac.query(
        `SELECT 
            YEAR(checkin_date) AS year,
            WEEK(checkin_date, 1) AS week,
            COUNT(*) AS total_visitor,
            STR_TO_DATE(CONCAT(YEAR(checkin_date), WEEK(checkin_date,1), ' Monday'), '%X%V %W') AS start_week,
            DATE_ADD(STR_TO_DATE(CONCAT(YEAR(checkin_date), WEEK(checkin_date,1), ' Monday'), '%X%V %W'), INTERVAL 6 DAY) AS end_week
         FROM visitor_count
         WHERE DATE(checkin_date) BETWEEN ? AND ?
         GROUP BY year, week`,
        [lastSummaryWeek || "2000-01-01", lastVisitorDate]
    );

    for (let w of rows) {
        await bebaspustaka.query(
            `REPLACE INTO summary_weekly_visitor (year, week, start_date, end_date, total_visitor)
             VALUES (?, ?, ?, ?, ?)`,
            [w.year, w.week, w.start_week, w.end_week, w.total_visitor]
        );
    }

    await setStatus("weekly", weekKey);
}

// ===================== MONTHLY SYNC =====================
async function syncMonthly() {
    const lastSummaryMonth = await getStatus("monthly");
    const lastVisitorDate = await getLastVisitorDate();
    if (!lastVisitorDate) return;

    const lastDate = new Date(lastVisitorDate);
    const monthKey = `${lastDate.getFullYear()}-${lastDate.getMonth() + 1}`;
    if (lastSummaryMonth === monthKey) return;

    const y = lastDate.getFullYear();
    const m = lastDate.getMonth() + 1;

    const [rows] = await opac.query(
        `SELECT YEAR(checkin_date) AS year,
                MONTHNAME(checkin_date) AS month,
                COUNT(*) AS total_visitor
         FROM visitor_count
         WHERE YEAR(checkin_date) = ? AND MONTH(checkin_date) = ?
         GROUP BY YEAR(checkin_date), MONTH(checkin_date)`,
        [y, m]
    );

    if (rows.length) {
        const r = rows[0];
        await bebaspustaka.query(
            `REPLACE INTO summary_monthly_visitor (year, month, total_visitor)
             VALUES (?, ?, ?)`,
            [r.year, r.month, r.total_visitor]
        );
    }

    await setStatus("monthly", monthKey);
}

// ===================== YEARLY SYNC =====================
async function syncYearly() {
    const lastSummaryYear = await getStatus("yearly");
    const lastVisitorDate = await getLastVisitorDate();
    if (!lastVisitorDate) return;

    const y = new Date(lastVisitorDate).getFullYear();
    if (lastSummaryYear === String(y)) return;

    const [rows] = await opac.query(
        `SELECT YEAR(checkin_date) AS year, COUNT(*) AS total_visitor
         FROM visitor_count
         WHERE YEAR(checkin_date) = ?
         GROUP BY YEAR(checkin_date)`,
        [y]
    );

    if (rows.length) {
        await bebaspustaka.query(
            `REPLACE INTO summary_yearly_visitor (year, total_visitor)
             VALUES (?, ?)`,
            [rows[0].year, rows[0].total_visitor]
        );
    }

    await setStatus("yearly", String(y));
}

// ===================== LOAN DAILY SYNC =====================
async function syncLoanDaily() {
    const lastSummaryLoan = await getStatus("loan");
    const today = new Date().toISOString().slice(0, 10);
    if (lastSummaryLoan === today) return;

    const [rows] = await opac.query(
        `SELECT 
            NULLIF(member.inst_name,'') AS lembaga,
            NULLIF(member.program_studi,'') AS programs_studi,
            NULLIF(YEAR(member.register_date),0) AS tahun,
            COUNT(loan.loan_id) AS total_pinjam
         FROM loan
         JOIN member ON loan.member_id = member.member_id
         GROUP BY lembaga, programs_studi, tahun`
    );

    for (let r of rows) {
        await bebaspustaka.query(
            `REPLACE INTO summary_loan_jurusan (lembaga, programs_studi, tahun, total_pinjam)
             VALUES (?, ?, ?, ?)`,
            [r.lembaga, r.programs_studi, r.tahun, r.total_pinjam]
        );
    }

    await setStatus("loan", today);
}

// ===================== ISO WEEK HELPER =====================
function getISOWeek(date) {
    date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

// ===================== MAIN SYNC ROUTE =====================
exports.syncAllSummary = async (req, res) => {
    try {
        await syncDaily();
        await syncWeekly();
        await syncMonthly();
        await syncYearly();
        await syncLoanDaily();

        res.json({ success: true, message: "Summary updated successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
