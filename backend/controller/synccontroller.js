const { bebaspustaka, opac } = require("../config");

/* ===================== LOGGER ===================== */
async function writeLog(user, role, user_action, action_status, time) {
  await bebaspustaka.query(
    `INSERT INTO logger (\`user\`, role, user_action, action_status, time)
     VALUES (?, ?, ?, ?, ?)`,
    [user, role, user_action, action_status, time]
  );
}

/* ===================== STATUS HELPER ===================== */
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

/* ===================== GET LAST DATES ===================== */
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

/* ===================== DAILY SYNC (FIXED) ===================== */
async function syncDaily() {
    console.log("🔥 SYNC DAILY FIX VERSION AKTIF 🔥");
  const updates = [];

  const lastSummaryDate = await getLastDailySummaryDate();
  const lastVisitorDate = await getLastVisitorDate();
  if (!lastVisitorDate) return updates;

  // 🛡️ Guard: summary tidak boleh lebih maju
  if (lastSummaryDate && lastSummaryDate > lastVisitorDate) {
    throw new Error("Summary daily lebih maju dari data OPAC");
  }

  let startDate;
  if (lastSummaryDate) {
    startDate = new Date(lastSummaryDate);
    startDate.setDate(startDate.getDate() + 1);
  } else {
    startDate = new Date(lastVisitorDate);
  }

  const endDate = new Date(lastVisitorDate);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayStr = d.toISOString().slice(0, 10);

    const [rows] = await opac.query(`
      SELECT DATE(checkin_date) AS hari,
             COUNT(*) AS total_visitor,
             YEAR(checkin_date) AS year
      FROM visitor_count
      WHERE DATE(checkin_date) = ?
      GROUP BY DATE(checkin_date)
    `, [dayStr]);

    if (rows.length) {
      updates.push(dayStr);

      const r = rows[0];
      await bebaspustaka.query(`
        REPLACE INTO summary_daily_visitor (hari, total_visitor, year)
        VALUES (?, ?, ?)
      `, [r.hari, r.total_visitor, r.year]);
    }
  }

  // ❗ Status hanya naik jika ADA insert
  if (updates.length) {
    await setStatus("daily", updates[updates.length - 1]);
  }

  return updates;
}

/* ===================== WEEKLY SYNC ===================== */
async function syncWeekly() {
  const updates = [];

  const lastSummaryWeek = await getStatus("weekly");
  const lastVisitorDate = await getLastVisitorDate();
  if (!lastVisitorDate) return updates;
  if (lastSummaryWeek === lastVisitorDate) return updates;

  const [rows] = await opac.query(`
    SELECT 
      YEAR(checkin_date) AS year,
      WEEK(checkin_date, 1) AS week,
      COUNT(*) AS total_visitor,
      STR_TO_DATE(CONCAT(YEAR(checkin_date), WEEK(checkin_date,1), ' Monday'), '%X%V %W') AS start_week,
      DATE_ADD(
        STR_TO_DATE(CONCAT(YEAR(checkin_date), WEEK(checkin_date,1), ' Monday'), '%X%V %W'),
        INTERVAL 6 DAY
      ) AS end_week
    FROM visitor_count
    WHERE DATE(checkin_date) > ? AND DATE(checkin_date) <= ?
    GROUP BY year, week
  `, [lastSummaryWeek || "2000-01-01", lastVisitorDate]);

  const seen = new Set();
  for (const r of rows) {
    const key = `${r.year}-${r.week}`;
    if (seen.has(key)) continue;
    seen.add(key);



    updates.push(`W${r.week}-${r.year}`);
    await bebaspustaka.query(`
      REPLACE INTO summary_weekly_visitor
      (year, week, start_date, end_date, total_visitor)
      VALUES (?, ?, ?, ?, ?)
    `, [r.year, r.week, r.start_week, r.end_week, r.total_visitor]);
  }

  if (updates.length) {
    await setStatus("weekly", lastVisitorDate);
  }

  return updates;
}

/* ===================== MONTHLY SYNC ===================== */
async function syncMonthly() {
  const updates = [];

  const lastSummaryMonth = await getStatus("monthly");
  const lastVisitorDate = await getLastVisitorDate();
  if (!lastVisitorDate) return updates;

  const d = new Date(lastVisitorDate);
  const monthKey = `${d.getFullYear()}-${d.getMonth() + 1}`;
  if (lastSummaryMonth === monthKey) return updates;

  const [rows] = await opac.query(`
    SELECT YEAR(checkin_date) AS year,
           MONTHNAME(checkin_date) AS month,
           COUNT(*) AS total_visitor
    FROM visitor_count
    WHERE YEAR(checkin_date) = ? AND MONTH(checkin_date) = ?
    GROUP BY YEAR(checkin_date), MONTH(checkin_date)
  `, [d.getFullYear(), d.getMonth() + 1]);

  if (rows.length) {
    const r = rows[0];
    updates.push(`${r.month} ${r.year}`);

    await bebaspustaka.query(`
      REPLACE INTO summary_monthly_visitor (year, month, total_visitor)
      VALUES (?, ?, ?)
    `, [r.year, r.month, r.total_visitor]);

    await setStatus("monthly", monthKey);
  }

  return updates;
}

/* ===================== YEARLY SYNC ===================== */
async function syncYearly() {
  const updates = [];

  const lastSummaryYear = await getStatus("yearly");
  const lastVisitorDate = await getLastVisitorDate();
  if (!lastVisitorDate) return updates;

  const year = new Date(lastVisitorDate).getFullYear();
  if (lastSummaryYear === String(year)) return updates;

  const [rows] = await opac.query(`
    SELECT YEAR(checkin_date) AS year,
           COUNT(*) AS total_visitor
    FROM visitor_count
    WHERE YEAR(checkin_date) = ?
    GROUP BY YEAR(checkin_date)
  `, [year]);

  if (rows.length) {
    updates.push(String(year));
    await bebaspustaka.query(`
      REPLACE INTO summary_yearly_visitor (year, total_visitor)
      VALUES (?, ?)
    `, [rows[0].year, rows[0].total_visitor]);

    await setStatus("yearly", String(year));
  }

  return updates;
}

/* ===================== LOAN DAILY SYNC ===================== */
async function syncLoanDaily() {
  const updates = [];
  const today = new Date().toISOString().slice(0, 10);

  const lastSummaryLoan = await getStatus("loan");
  if (lastSummaryLoan === today) return updates;

  const [rows] = await opac.query(`
    SELECT 
      NULLIF(member.inst_name,'') AS lembaga,
      NULLIF(member.program_studi,'') AS programs_studi,
      NULLIF(YEAR(member.register_date),0) AS tahun,
      COUNT(loan.loan_id) AS total_pinjam
    FROM loan
    JOIN member ON loan.member_id = member.member_id
    GROUP BY lembaga, programs_studi, tahun
  `);

  for (const r of rows) {
    await bebaspustaka.query(`
      REPLACE INTO summary_loan_jurusan
      (lembaga, programs_studi, tahun, total_pinjam)
      VALUES (?, ?, ?, ?)
    `, [r.lembaga, r.programs_studi, r.tahun, r.total_pinjam]);
  }

  updates.push(today);
  await setStatus("loan", today);

  return updates;
}

/* ===================== MAIN ROUTE ===================== */
exports.syncAllSummary = async (req, res) => {
  const user_name = "sistem";
  const role = "sistem";
  const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");

  try {
    const daily = await syncDaily();
    const weekly = await syncWeekly();
    const monthly = await syncMonthly();
    const yearly = await syncYearly();
    const loan = await syncLoanDaily();

    await writeLog(
      user_name,
      role,
      `Summary sync:
Daily   : ${daily.join(", ") || "-"}
Weekly  : ${weekly.join(", ") || "-"}
Monthly : ${monthly.join(", ") || "-"}
Yearly  : ${yearly.join(", ") || "-"}
Loan    : ${loan.join(", ") || "-"}`,
      "berhasil",
      timestamp
    );

    res.json({
      success: true,
      details: { daily, weekly, monthly, yearly, loan }
    });

  } catch (err) {
    await writeLog(
      user_name,
      role,
      "Summary sync",
      "gagal",
      timestamp
    );

    res.status(500).json({ success: false, error: err.message });
  }
};
