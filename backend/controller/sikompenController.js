const { json } = require('express');
const { bebaspustaka, opac } = require('../config');

exports.getStatusPustaka = async (req, res) => {
    const { nim } = req.query;
    console.log("hit");

    if (!nim) {
        return res.status(400).json({
            message: "NIM wajib dikirim"
        });
    }

    try {
        const sql = `
            SELECT STATUS_bebas_pustaka 
            FROM bebas_pustaka 
            WHERE nim = ?
        `;

        const sql_borrow = `
            SELECT 
                loan.member_id,
                loan.item_code,
                biblio.title,
                loan.loan_date,
                loan.due_date
            FROM loan
            LEFT JOIN item ON loan.item_code = item.item_code
            LEFT JOIN biblio ON item.biblio_id = biblio.biblio_id
            WHERE loan.member_id = ?
            ORDER BY 
                (loan.is_return = 0 AND loan.return_date IS NULL) DESC,
                loan.is_return ASC
        `;

        const [rows] = await bebaspustaka.query(sql, [nim]);

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Data mahasiswa tidak ditemukan"
            });
        }

        const [rows_info] = await opac.query(sql_borrow, [nim]);

        const loanInfo = rows_info.length > 0 ? rows_info[0] : null;

        return res.status(200).json({
            nim,
            status: rows[0].STATUS_bebas_pustaka,
            loans: rows_info 
        });

    } catch (error) {
        console.error("getStatusPustaka error:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan server"
        });
    }
};

