const { opac, bebaspustaka } = require('../config');

let GENERATING = false;

function formatDateToMySQL(date) {
    const pad = n => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} `
        + `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

async function updateStatusesJoin() {
    console.log("[STATUS] Updating STATUS_peminjaman & STATUS_denda...");

    const sql = `
        UPDATE bebas_pustaka bp
        LEFT JOIN (
            SELECT member_id 
            FROM opac.loan 
            WHERE is_return = 0 AND return_date IS NULL
            GROUP BY member_id
        ) loan ON loan.member_id = bp.nim
        LEFT JOIN (
            SELECT member_id
            FROM opac.fines
            WHERE debet != credit
            GROUP BY member_id
        ) fin ON fin.member_id = bp.nim
        SET 
            bp.STATUS_peminjaman = CASE WHEN loan.member_id IS NULL THEN 1 ELSE 0 END,
            bp.STATUS_denda = CASE WHEN fin.member_id IS NULL THEN 1 ELSE 0 END
    `;
    await bebaspustaka.query(sql);

    console.log("[STATUS DONE]");
}

async function generateBebasPustakaData() {
    if (GENERATING) {
        console.log("[SKIP] Generate sudah berjalan!");
        return { inserted: 0, refreshed: false, message: "Skipped duplicate trigger" };
    }
    GENERATING = true;

    try {
        const year = new Date().getFullYear();
        const sixYearsAgo = year - 6;
        const today = new Date();

        console.log("[START] generateBebasPustakaData()");

        const [statusRows] = await bebaspustaka.query(`SELECT STATUS_bebas_pustaka, end_date FROM bebas_pustaka_time_range LIMIT 1`);

        // ================================
        // FIRST RUN – BELUM ADA TIME RANGE
        // ================================
        if (statusRows.length === 0) {
            console.log("[FIRST RUN] Belum ada time_range → insert pertama ke bebas_pustaka");

            const sqlInsert = `
                INSERT INTO bebas_pustaka (NIM, nama_mahasiswa, institusi, program_studi)
                SELECT DISTINCT member_id, member_name, inst_name, program_studi
                FROM opac.member
                WHERE inst_name IN ('Teknik Informatika dan Komputer', 'Teknik Informatika')
                AND register_date IS NOT NULL
                AND YEAR(register_date) BETWEEN ? AND ?
                ORDER BY register_date ASC
            `;

            console.log("[INSERT] Mulai insert data mahasiswa...");
            const [insertResult] = await bebaspustaka.query(sqlInsert, [sixYearsAgo, year]);
            console.log("[INSERT DONE] Rows inserted:", insertResult.affectedRows);

            await updateStatusesJoin();

            // insert visitor_count
            const [borowing] = await bebaspustaka.query(`
                SELECT DISTINCT NIM, nama_mahasiswa, institusi, program_studi
                FROM bebas_pustaka
                WHERE STATUS_peminjaman = 0 OR STATUS_denda = 0
            `);

            const mysqlDate = formatDateToMySQL(new Date());
            console.log("[VISITOR_INSERT] Mulai insert visitor_count...");

            for (const mhs of borowing) {
                console.log("[VISITOR] Insert:", mhs.NIM);
                await opac.query(
                    `INSERT INTO visitor_count (member_id, member_name, institution, program_studi, checkin_date)
                     VALUES (?, ?, ?, ?, ?)`,
                    [mhs.NIM, mhs.nama_mahasiswa, mhs.institusi, mhs.program_studi, mysqlDate]
                );
            }

            console.log("[VISITOR INSERT DONE] Total:", borowing.length);

            return {
                inserted: insertResult.affectedRows,
                refreshed: false,
                message: "Insert pertama berhasil + visitor_count terisi"
            };
        }

        // =============================
        // SUDAH ADA TIME RANGE
        // =============================

        const lastEnd = statusRows[0].end_date ? new Date(statusRows[0].end_date) : null;
        const expire = new Date(lastEnd);
        expire.setMonth(expire.getMonth() + 3);

        // ==================================================
        // > 3 BULAN → FULL REFRESH (TRUNCATE + INSERT ULANG)
        // ==================================================
        if (today > expire) {
            console.log("[REFRESH >3 BULAN] Lakukan full refresh!");

            const [memberList] = await opac.query(`
                SELECT DISTINCT member_id, member_name, inst_name, program_studi
                FROM member
                WHERE inst_name IN ('Teknik Informatika dan Komputer', 'Teknik Informatika')
                AND register_date IS NOT NULL
                AND YEAR(register_date) BETWEEN ? AND ?
            `, [sixYearsAgo, year]);

            console.log("[TRUNCATE] Truncate bebas_pustaka...");
            await bebaspustaka.query(`TRUNCATE TABLE bebas_pustaka`);
            await bebaspustaka.query(`ALTER TABLE bebas_pustaka AUTO_INCREMENT = 1`);

            console.log("[REFRESH INSERT] Insert ulang mahasiswa...");

            if (memberList.length > 0) {
                const insertSql = `
                    INSERT INTO bebas_pustaka (NIM, nama_mahasiswa, institusi, program_studi)
                    VALUES (?, ?, ?, ?)
                `;
                for (const m of memberList) {
                    console.log("[REFRESH] Insert:", m.member_id);
                    await bebaspustaka.query(insertSql, [
                        m.member_id, m.member_name, m.inst_name, m.program_studi
                    ]);
                }
            }

            console.log("[REFRESH DONE] Total:", memberList.length);

            await updateStatusesJoin();

            const [borowing] = await bebaspustaka.query(`
                SELECT DISTINCT NIM, nama_mahasiswa, institusi, program_studi
                FROM bebas_pustaka
                WHERE STATUS_peminjaman = 0 OR STATUS_denda = 0
            `);

            console.log("[VISITOR REFRESH] Insert visitor_count setelah refresh...");
            const mysqlDate = formatDateToMySQL(new Date());

            for (const m of borowing) {
                console.log("[VISITOR REFRESH] Insert:", m.NIM);
                await opac.query(
                    `INSERT INTO visitor_count (member_id, member_name, institution, program_studi, checkin_date)
                     VALUES (?, ?, ?, ?, ?)`,
                    [m.NIM, m.nama_mahasiswa, m.institusi, m.program_studi, mysqlDate]
                );
            }

            console.log("[VISITOR REFRESH DONE] Total:", borowing.length);

            return {
                inserted: memberList.length,
                refreshed: true,
                message: "Data berhasil di-refresh (lebih dari 3 bulan)"
            };
        }

        // ================================
        // < 3 BULAN → TIDAK DI-GENERATE
        // ================================
        console.log("[NO REFRESH] Kurang dari 3 bulan → tidak generate");
        return { inserted: 0, refreshed: false, message: "Tidak memenuhi kondisi insert/refresh" };

    } finally {
        GENERATING = false;
        console.log("[END] generateBebasPustakaData selesai.");
    }
}


// ================================================================
// GET DATE
// ================================================================
exports.getDate = async (req, res) => {
    try {
        const [rows] = await bebaspustaka.query(`
            SELECT STATUS_bebas_pustaka, start_date, end_date
            FROM bebas_pustaka_time_range LIMIT 1
        `);

        if (rows.length === 0) {
            return res.json({ status: "empty", start_date: null, end_date: null });
        }

        const data = rows[0];

        const fmt = d => (d ? new Date(d).toISOString().split("T")[0] : null);

        const today = new Date();
        const endDate = new Date(data.end_date);

        if (today > endDate && data.STATUS_bebas_pustaka === "on_range") {
            console.log("[DATE] Status berubah → out_of_range");
            await bebaspustaka.query(`
                UPDATE bebas_pustaka_time_range SET STATUS_bebas_pustaka = 'out_of_range'
            `);
            data.STATUS_bebas_pustaka = "out_of_range";
        }

        return res.json({
            status: data.STATUS_bebas_pustaka,
            start_date: fmt(data.start_date),
            end_date: fmt(data.end_date)
        });

    } catch (err) {
        return res.status(500).json({ message: "Error getDate", error: err.message });
    }
};


// ================================================================
// SET DATE RANGE + GENERATE
// ================================================================
exports.setDateRangeAndGenerate = async (req, res) => {
    try {
        const { start_date, end_date } = req.body;

        if (!start_date || !end_date)
            return res.status(400).json({ success: false, message: "start_date & end_date wajib diisi!" });

        const [rows] = await bebaspustaka.query(`
            SELECT STATUS_bebas_pustaka, start_date, end_date
            FROM bebas_pustaka_time_range LIMIT 1
        `);

        // FIRST TIME RANGE INSERTED
        if (rows.length === 0) {
            console.log("[TIME_RANGE] Insert pertama time_range");

            const result = await generateBebasPustakaData();

            console.log("[TIME_RANGE INSERT] Insert time_range...");
            await bebaspustaka.query(`
                INSERT INTO bebas_pustaka_time_range (STATUS_bebas_pustaka, start_date, end_date)
                VALUES ('on_range', ?, ?)
            `, [start_date, end_date]);

            console.log("[TIME_RANGE INSERT DONE]");

            return res.json({
                success: true,
                message: "Tanggal disimpan + generate selesai",
                result
            });
            
        }
        
        // JIKA STATUS MASIH ON_RANGE → TIDAK BOLEH EDIT
if (rows[0].STATUS_bebas_pustaka === "on_range") {
    return res.status(400).json({
        success: false,
        message: "Tanggal tidak dapat diedit karena status masih ON RANGE"
    });
}


        // CHECK IF STATUS = out_of_range
        if (rows[0].STATUS_bebas_pustaka === "out_of_range") {
            const lastEnd = new Date(rows[0].end_date);
            const expire = new Date(lastEnd);
            expire.setMonth(expire.getMonth() + 3);

            const today = new Date();

            // > 3 bulan → generate full
            if (today > expire) {
                console.log("[OUT_OF_RANGE >3 BULAN] Full generate triggered");

                await bebaspustaka.query(`
                    UPDATE bebas_pustaka_time_range
                    SET STATUS_bebas_pustaka='on_range', start_date=?, end_date=?
                `, [start_date, end_date]);

                const result = await generateBebasPustakaData();

                return res.json({
                    success: true,
                    message: "Generate ulang berhasil (>3 bulan) dan tanggal disimpan",
                    result
                });
            }

            // < 3 bulan → hanya update + insert visitor_count
            console.log("[OUT_OF_RANGE <3 BULAN] Hanya update status + visitor_count");

            await bebaspustaka.query(`
                UPDATE bebas_pustaka_time_range
                SET STATUS_bebas_pustaka='on_range', start_date=?, end_date=?
            `, [start_date, end_date]);

            await updateStatusesJoin();

            const [borowing] = await bebaspustaka.query(`
                SELECT DISTINCT NIM, nama_mahasiswa, institusi, program_studi
                FROM bebas_pustaka
                WHERE STATUS_peminjaman = 0 OR STATUS_denda = 0
            `);

            console.log("[VISITOR <3 BULAN] Insert visitor_count...");

            const mysqlDate = formatDateToMySQL(new Date());
            for (const mhs of borowing) {
                console.log("[VISITOR INSERT <3 BULAN] Insert:", mhs.NIM);
                await opac.query(
                    `INSERT INTO visitor_count (member_id, member_name, institution, program_studi, checkin_date)
                     VALUES (?, ?, ?, ?, ?)`,
                    [mhs.NIM, mhs.nama_mahasiswa, mhs.institusi, mhs.program_studi, mysqlDate]
                );
            }

            console.log("[VISITOR INSERT <3 BULAN DONE] Total:", borowing.length);

            return res.json({
                success: true,
                message: `${borowing.length} mahasiswa masih status 0 → visitor_count diinsert.`,
                visitorsInserted: borowing.length
            });
        }

        // fallback update
        await bebaspustaka.query(`
            UPDATE bebas_pustaka_time_range
            SET start_date=?, end_date=?
        `, [start_date, end_date]);

        return res.json({
            success: true,
            message: "Tanggal diperbarui (tanpa generate karena kondisi tidak terpenuhi)"
        });

    } catch (err) {
        console.error("setDateRangeAndGenerate error:", err);
        return res.status(500).json({
            success: false,
            message: "Gagal set date range + generate",
            error: err.message
        });
    }
};


// ================================================================
// GET DATA MAHASISWA
// ================================================================
exports.getDataMahasiswa = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 10, sortBy = 'id', sortOrder = 'DESC' } = req.query;

        await updateStatusesJoin();

        const offset = (page - 1) * limit;
        let where = `WHERE 1=1`;
        let params = [];

        if (search) {
            where += ` AND (LOWER(nama_mahasiswa) LIKE LOWER(?) OR CAST(nim AS CHAR) LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        const [count] = await bebaspustaka.query(
            `SELECT COUNT(*) AS total FROM bebas_pustaka ${where}`,
            params
        );

        const allowed = ['id', 'nim', 'nama_mahasiswa', 'institusi', 'program_studi', 'STATUS_peminjaman', 'STATUS_denda', 'STATUS_bebas_pustaka'];
        const sCol = allowed.includes(sortBy) ? sortBy : 'id';
        const sOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        params.push(Number(limit), Number(offset));

        const [data] = await bebaspustaka.query(`
            SELECT *
            FROM bebas_pustaka
            ${where}
            ORDER BY (STATUS_peminjaman = 0 OR STATUS_denda = 0) DESC,
                     ${sCol} ${sOrder}
            LIMIT ? OFFSET ?
        `, params);

        res.json({
            success: true,
            data,
            total: count[0].total,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(count[0].total / limit)
            }
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Gagal mengambil data mahasiswa",
            error: err.message
        });
    }
};


// ================================================================
// MANUAL GENERATE
// ================================================================
exports.getAndInsertDataBebasPustaka = async (req, res) => {
    try {
        const result = await generateBebasPustakaData();
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Gagal generate data",
            error: err.message
        });
    }
};
