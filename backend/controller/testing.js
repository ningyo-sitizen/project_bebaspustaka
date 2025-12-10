const { opac, bebaspustaka } = require('../config');

async function updateStatusesJoin() {
    const sql_update = `
        UPDATE bebaspustaka.bebas_pustaka bp
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

    await bebaspustaka.query(sql_update);
}


async function generateBebasPustakaData() {
    const today_year = new Date().getFullYear();
    const six_years_ago = today_year - 6;
    const today = new Date();

    const sql_get_last_date = `SELECT end_date FROM bebas_pustaka_time_range`;
    const sql_get_status = `SELECT STATUS_bebas_pustaka FROM bebas_pustaka_time_range`;

    const [statusRows] = await bebaspustaka.query(sql_get_status);

if (statusRows.length === 0) {

    const sql_insert_initial = `
        INSERT INTO bebaspustaka.bebas_pustaka 
        (NIM, nama_mahasiswa, institusi, program_studi)
        SELECT DISTINCT member_id, member_name, inst_name, program_studi
        FROM opac.member
        WHERE inst_name IN ('Teknik Informatika dan Komputer', 'Teknik Informatika')
        AND register_date IS NOT NULL
        AND YEAR(register_date) BETWEEN ? AND ?
        ORDER BY register_date ASC
    `;

    const [insertResult] = await bebaspustaka.query(sql_insert_initial, [
        six_years_ago, 
        today_year
    ]);

    await updateStatusesJoin();



    return {
        inserted: insertResult.affectedRows,
        refreshed: false,
        message: "Insert pertama berhasil + visitorcount terisi"
    };
}

    const [dateRows] = await bebaspustaka.query(sql_get_last_date);

    if (dateRows.length > 0) {
        const endDate = new Date(dateRows[0].end_date);
        const endDatePlus3Months = new Date(endDate);
        endDatePlus3Months.setMonth(endDatePlus3Months.getMonth() + 3);

        if (today > endDatePlus3Months) {

            await bebaspustaka.query(`TRUNCATE TABLE bebas_pustaka`);
            await bebaspustaka.query(`ALTER TABLE bebas_pustaka AUTO_INCREMENT = 1`);

            const sql_insert_refresh = `
                INSERT INTO bebaspustaka.bebas_pustaka 
                (NIM, nama_mahasiswa, institusi, program_studi)
                SELECT DISTINCT member_id, member_name, inst_name, program_studi
                FROM opac.member
                WHERE inst_name IN ('Teknik Informatika dan Komputer', 'Teknik Informatika')
                AND register_date IS NOT NULL
                AND YEAR(register_date) BETWEEN ? AND ?
                ORDER BY register_date ASC
            `;

            const [insertResult] = await bebaspustaka.query(sql_insert_refresh, [
                six_years_ago, 
                today_year
            ]);

            await updateStatusesJoin();

            return {
                inserted: insertResult.affectedRows,
                refreshed: true,
                message: "Data berhasil di-refresh (lebih dari 3 bulan)"
            };
        }
    }

    return {
        inserted: 0,
        refreshed: false,
        message: "Tidak memenuhi kondisi insert atau refresh"
    };
}

exports.getDate = async (req, res) => {
    try {
        const [rows] = await bebaspustaka.query(`
            SELECT STATUS_bebas_pustaka, start_date, end_date 
            FROM bebas_pustaka_time_range
            LIMIT 1
        `);

        if (rows.length === 0) {
            return res.json({
                status: "empty",
                start_date: null,
                end_date: null
            });
        }

        const data = rows[0];

        const formatDate = (date) => {
            if (!date) return null;
            return new Date(date).toISOString().split("T")[0];
        };

        const start = formatDate(data.start_date);
        const end = formatDate(data.end_date);

        const today = new Date();
        const endDateObj = new Date(data.end_date);

        if (today > endDateObj && data.STATUS_bebas_pustaka === "on_range") {
            await bebaspustaka.query(`
                UPDATE bebas_pustaka_time_range
                SET STATUS_bebas_pustaka = 'out_of_range'
            `);
            data.STATUS_bebas_pustaka = "out_of_range";
        }

        return res.json({
            status: data.STATUS_bebas_pustaka,
            start_date: start,
            end_date: end
        });

    } catch (err) {
        return res.status(500).json({
            message: "Error getDate",
            error: err.message
        });
    }
};



exports.setDateRangeAndGenerate = async (req, res) => {
    try {
        const { start_date, end_date } = req.body;

        if (!start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: "start_date dan end_date wajib diisi!"
            });
        }
        
        const [statusRows] = await bebaspustaka.query("SELECT STATUS_bebas_pustaka FROM bebas_pustaka_time_range");

        
        let result = null;
        if (statusRows.length === 0) {
            result = await generateBebasPustakaData();

            await bebaspustaka.query(
            `INSERT INTO bebas_pustaka_time_range 
            (STATUS_bebas_pustaka, start_date, end_date)
            VALUES ('on_range', ?, ?)`,
            [start_date, end_date]
        );
        
        return res.json({
            success: true,
            message: "Tanggal disimpan & generate selesai",
            result
        })
        }
        if(statusRows == "on_range"){
            return res.json({
                success: true,
                message: "masih dalam tanggal pengeceken tidak boleh diganti ganti",
                result
            })
        }
;

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Gagal set date range + generate",
            error: error.message
        });
    }
};


exports.getDataMahasiswa = async (req, res) => {
    try {
        const { 
            search = '', 
            page = 1, 
            limit = 10,
            sortBy = 'id', // default
            sortOrder = 'DESC' // default
        } = req.query;

        await updateStatusesJoin();

        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereClause = `WHERE 1=1`;
        let queryParams = [];

        if (search) {
            whereClause += ` AND (LOWER(nama_mahasiswa) LIKE LOWER(?) OR CAST(nim AS CHAR) LIKE ?)`;
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        const countQuery = `
            SELECT COUNT(*) as total
            FROM bebas_pustaka
            ${whereClause}
        `;
        const [countResult] = await bebaspustaka.query(countQuery, queryParams);
        const total = countResult[0].total;

        // Validasi sortBy untuk menghindari SQL Injection
        const allowedSortColumns = ['id', 'nim', 'nama_mahasiswa', 'institusi', 'program_studi', 'STATUS_peminjaman', 'STATUS_denda', 'STATUS_bebas_pustaka'];
        const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'id';
        const validSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const dataQuery = `
            SELECT 
                id,
                nim,
                nama_mahasiswa,
                institusi,
                program_studi,
                STATUS_peminjaman,
                STATUS_denda,
                STATUS_bebas_pustaka
            FROM bebas_pustaka
            ${whereClause}
            ORDER BY 
                (STATUS_peminjaman = 0 OR STATUS_denda = 0) DESC,
                ${validSortBy} ${validSortOrder}
            LIMIT ? OFFSET ?
        `;
        
        queryParams.push(parseInt(limit), offset);
        const [rows] = await bebaspustaka.query(dataQuery, queryParams);

        return res.json({
            success: true,
            data: rows,
            total: total,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (err) {
        console.error("Error getDataMahasiswa:", err);
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil data mahasiswa",
            error: err.message
        });
    }
};

exports.getAndInsertDataBebasPustaka = async (req, res) => {
    try {
        const result = await generateBebasPustakaData();

        return res.json({
            success: true,
            result
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal generate data",
            error: err.message
        });
    }
};
