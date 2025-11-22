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

exports.getMonthlyForLandingPage = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();

    const sql = `
      SELECT month,total_visitor from bebaspustaka.summary_monthly_visitor where year = ?
    `;

    const [rows] = await bebaspustaka.query(sql, [year]);

    const labels = rows.map(r => r.month);
    const data = rows.map(r => r.total_visitor);

    res.json({ labels, data });

  } catch (err) {
    console.error('❌ Error fetching monthly visitors:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.getDashboardDatVisitor = async (req, res) => {
  try {
    const period = req.query.period || "daily";
    const yearParam = req.query.year || new Date().getFullYear().toString;

    if (Array.isArray(yearParam)) {
      yearParam = yearParam.join("");
    }

    const years = yearParam.split(",").map((y) => y.trim());
    let sql = "";
    let params = [];

    console.log("year =", years);
    console.log("period = ", period);

    if (period === "daily") {
      sql = `
        SELECT year,DATE_FORMAT(hari, '%d-%m-%Y') as label, total_visitor 
        FROM summary_daily_visitor
        WHERE YEAR(hari) IN (?)
        ORDER BY hari,hari
      `;
      params = [years];
    }

    if (period === "weekly") {
      sql = `
        SELECT year, week as label, start_date,end_date,
               total_visitor 
        FROM summary_weekly_visitor
        WHERE year IN (?)
        ORDER BY week
      `;
      params = [years];
    }

    if (period === "yearly") {
      sql = `
        SELECT year,cast(year as CHAR) as label, total_visitor 
        FROM summary_yearly_visitor
        where year IN (?)
        ORDER BY year,year
      `;
      params = [years]
    }

    if (period == "monthly") {
      sql = `
        SELECT year,month as label, total_visitor 
        FROM summary_monthly_visitor
        where year IN (?)
        ORDER BY year, month
      `;
      params = [years]
    }

    const [rows] = await bebaspustaka.query(sql, params);

    const formatDate = (d) => {
    if (!d) return null;
    return new Date(d).toISOString().split("T")[0];
}

    res.json({
      years: years,
      data: rows.reduce((acc, r) => {
        if (!acc[r.year]) acc[r.year] = [];
        acc[r.year].push({
          label: r.label,
          total_visitor: r.total_visitor,
          start_date:formatDate(r.start_date),
          end_date: formatDate(r.end_date)
        });
        return acc;
      }, {})
    });

    console.log(rows)
    


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