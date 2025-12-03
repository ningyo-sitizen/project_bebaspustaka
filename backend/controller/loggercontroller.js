const { bebaspustaka, opac } = require('../config');

exports.postUserInput = async (req, res) => {
    try {
        const { user_name, user_action, action_status, time } = req.body;

        const sql = `
            INSERT INTO logger (\`user\`, user_action, action_status, time)
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await bebaspustaka.query(sql, [
            user_name,
            user_action,
            action_status,
            time
        ]);

        return res.status(201).json({
            message: "logging berhasil"
        });

    } catch (error) {
        console.error("Logging error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getLog = async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const offset = (page - 1) * limit;
        
        

        const search = req.query.search || '';
        const sortBy = req.query.sortBy || 'time';
        const sortOrder = req.query.sortOrder || 'DESC';
        const startDate = req.query.startDate || null;
        const endDate = req.query.endDate || null;
        
        
        let whereClause = '';
        let queryParams = [];
        
        if (search) {
            whereClause = 'WHERE (`user` LIKE ? OR user_action LIKE ?)';
            queryParams.push(`%${search}%`, `%${search}%`);
        }
        
        if (startDate && endDate) {
            whereClause += whereClause ? ' AND ' : 'WHERE ';
            whereClause += 'DATE(time) BETWEEN ? AND ?';
            queryParams.push(startDate, endDate);
        }
        

        const countSql = `SELECT COUNT(*) as total FROM logger ${whereClause}`;
        const [countResult] = await bebaspustaka.query(countSql, queryParams);
        const totalRecords = countResult[0].total;
        const totalPages = Math.ceil(totalRecords / limit);
        
        const sql = `
            SELECT \`user\`, user_action, action_status, time 
            FROM logger 
            ${whereClause}
            ORDER BY ${sortBy} ${sortOrder}
            LIMIT ? OFFSET ?
        `;
        
        const [rows] = await bebaspustaka.query(sql, [...queryParams, limit, offset]);
        
        res.json({
            data: rows,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalRecords: totalRecords,
                limit: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (err) {
        console.log("SQL ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
}