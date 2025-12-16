const { bebaspustaka, opac } = require('../config');

exports.getStatusPustaka = async (req, res) => {
    const { nim } = req.query;

    console.log("hit");
    console.log(nim);

    if (!nim) {
        return res.status(400).json({
            success: false,
            message: "NIM wajib dikirim"
        });
    }

    try {
        const sql_status = `
            SELECT STATUS_bebas_pustaka
            FROM bebas_pustaka
            WHERE nim = ?
            LIMIT 1
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

        const sql_time = `
            SELECT start_date, end_date
            FROM bebas_pustaka_time_range
            LIMIT 1
        `;

        const [rowsStatus] = await bebaspustaka.query(sql_status, [nim]);
        const [rowsLoan]   = await opac.query(sql_borrow, [nim]);
        const [rowsTime]   = await bebaspustaka.query(sql_time);

        let status = 'pending';

        if (rowsStatus.length > 0) {
            const rawStatus = rowsStatus[0].STATUS_bebas_pustaka;

            if (rawStatus !== null && rawStatus !== '') {
                status = rawStatus;
            }
        }

        return res.status(200).json({
            success: true,
            nim,
            status,
            loans: rowsLoan,        
            time: rowsTime || []    
        });

    } catch (error) {
        console.error("getStatusPustaka error:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server"
        });
    }
};
