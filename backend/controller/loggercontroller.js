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
