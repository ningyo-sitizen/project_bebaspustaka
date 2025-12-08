const { opac, bebaspustaka } = require('../config');

exports.getAndInsertDataBebasPustaka = async (req, res) => {
    try {
        const today_year = new Date().getFullYear();
        const six_years_ago = today_year - 6;
        const today = new Date();

        const sql_get_last_date = `
            SELECT end_date 
            FROM bebas_pustaka_time_range
            ORDER BY id DESC LIMIT 1
        `;

        const sql_get_status = `
            SELECT STATUS_bebas_pustaka 
            FROM bebas_pustaka_time_range
        `;

        const [statusRows] = await bebaspustaka.query(sql_get_status);

        // ==== IF pertama: tidak ada status sama sekali ====
        if (statusRows.length === 0) {
            const sql_insert = `
                INSERT INTO bebaspustaka.bebas_pustaka
                (NIM, nama_mahasiswa, institusi, program_studi)
                SELECT DISTINCT 
                    member_id, 
                    member_name,
                    inst_name,
                    program_studi 
                FROM member
                WHERE inst_name IN ('Teknik Informatika dan Komputer', 'Teknik Informatika')
                    AND register_date IS NOT NULL
                    AND YEAR(register_date) BETWEEN ? AND ?
                ORDER BY register_date ASC
            `;

            const [insertResult] = await bebaspustaka.query(sql_insert, [
                six_years_ago,
                today_year
            ]);

            return res.json({
                success: true,
                message: "Data inserted",
                rows_added: insertResult.affectedRows
            });
        }

        const [dateRows] = await bebaspustaka.query(sql_get_last_date);

        if (dateRows.length > 0) {
            const endDate = new Date(dateRows[0].end_date);

            const endDatePlus3Months = new Date(endDate);
            endDatePlus3Months.setMonth(endDate.getMonth() + 3);

            if (today > endDatePlus3Months) {
                return res.json({
                    success: true,
                    message: "Sudah lebih dari 3 bulan lewat dari end_date",
                    end_date: endDate,
                    end_date_plus_3_months: endDatePlus3Months
                });
            }
        }

        return res.json({
            success: true,
            message: "Tidak memenuhi kondisi apa pun"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};
