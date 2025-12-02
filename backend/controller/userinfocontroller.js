const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { bebaspustaka } = require('../config');
const path = require('path');
const { error } = require('console');
require('dotenv').config({ path: __dirname + '/../.env' });

exports.updateUserInfo = async (req, res) => {
    const { id, name, username, newPassword } = req.body;

    console.log("hwhwhwhw")

    let sql = `UPDATE users SET `;
    const params = [];
    const updates = [];

    if (username && username !== "") {
        updates.push("username = ?");
        params.push(username);
    }

    if (name && name !== "") {
        updates.push("name = ?");
        params.push(name);
    }

    if (newPassword && newPassword !== "") {
        const hashed = await bcrypt.hash(newPassword, 10);
        updates.push("password = ?");
        params.push(hashed);
    }

    if (updates.length === 0) {
        return res.status(400).json({ message: "No fields to update" });
    }

    sql += updates.join(", ") + " WHERE user_id = ?";
    params.push(id);


    await bebaspustaka.query(sql, params);

    res.json({ message: "User updated successfully" });
};

exports.getUserInfo = async (req, res) => {
    try {
        const user_id = req.query.user_id;
        console.log("calling sql:", user_id);

        const sql = "SELECT user_id, username, name, role FROM users WHERE user_id = ?";
        const [rows] = await bebaspustaka.query(sql, [user_id]);

        console.log("HASIL:", rows);

        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(rows[0]);
    } catch (err) {
        console.log("SQL ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const sql = "SELECT user_id, username, name, role FROM users ORDER BY name ASC";
        const [rows] = await bebaspustaka.query(sql);
        
        console.log("Total users found:", rows.length);
        
        res.json(rows);
    } catch (err) {
        console.log("SQL ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deleteUser = async (req, res) => {
    const user_id = req.query.user_id;
    
    if (!user_id) {
        return res.status(400).json({ message: 'user_id required' });
    }
    
    try {
        const deleteSql = 'DELETE FROM users WHERE user_id = ?';
        await bebaspustaka.query(deleteSql, [user_id]);
        
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.register = async (req, res) => {
    const { name, username, password, role } = req.body;
    
    if (!name || !username || !password || !role) {
        return res.status(400).json({ message: 'All fields required' });
    }
    
    try {
        const checkSql = 'SELECT username FROM users WHERE username = ?';
        const [existing] = await bebaspustaka.query(checkSql, [username]);
        
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        
        const hashed = await bcrypt.hash(password, 10);
        
        const sql = 'INSERT INTO users (name, username, PASSWORD, role) VALUES (?, ?, ?, ?)';
        const [result] = await bebaspustaka.query(sql, [name, username, hashed, role]);
        
        const insertedId = result.insertId;
        
        res.status(201).json({ 
            message: 'User registered successfully',
            user: { 
                user_id: insertedId, 
                name, 
                username, 
                role 
            }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Database error' });
    }
};





