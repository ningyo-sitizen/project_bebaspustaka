const { bebaspustaka } = require('../config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.getYearlyVisitors = async (req, res) => {
  try {
    const sql = `
      SELECT * from summary_yearly_visitor
    `;

    const [rows] = await bebaspustaka.query(sql);

    res.status(200).json(rows);

  } catch (err) {
    console.error('❌ Error fetching yearly visitors:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMonthlyForLandingPage = async (req,res) => {
  try{
    const sql = ""
  }catch{

  }
}

exports.getDashboardDatVisitor = async (req, res) => {
  try {
    const period = req.query.period || "daily";
    const year = req.query.year || new Date().getFullYear();

    let sql = "";
    let params = [];

    if (period === "daily") {
      sql = `
        SELECT DATE_FORMAT(hari, '%d-%m-%Y') as label, total_visitor 
        FROM summary_daily_visitor
        WHERE YEAR(hari) = ?
        ORDER BY hari
      `;
      params = [year];
    }

    if (period === "weekly") {
      sql = `
        SELECT CONCAT('Week ', week, ' (', DATE_FORMAT(start_date,'%d %b'),' - ', DATE_FORMAT(end_date,'%d %b'), ')') as label,
               total_visitor 
        FROM summary_weekly_visitor
        WHERE year = ?
        ORDER BY week
      `;
      params = [year];
    }

    if (period === "yearly") {
      sql = `
        SELECT year as label, total_visitor 
        FROM summary_yearly_visitor
        ORDER BY year
      `;
    }

    const [rows] = await bebaspustaka.query(sql, params);

    res.json({
      labels: rows.map(r => r.label),
      data: rows.map(r => r.total_visitor)
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getYears = async (req, res) => {
  try {
    const sql = `
      SELECT DISTINCT YEAR(hari) AS year 
      FROM summary_daily_visitor
      WHERE YEAR(hari) IS NOT NULL
      ORDER BY year DESC
    `;

    const [rows] = await bebaspustaka.query(sql);

    const years = rows.map(r => r.year);
    res.json(years);

  } catch (err) {
    console.error("❌ Error fetching years:", err);
    res.status(500).json({ message: "Server error" });
  }
};