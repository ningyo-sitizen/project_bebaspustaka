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
    let yearParam = req.query.year || new Date().getFullYear().toString();
    
    // ✅ Pagination untuk TABLE saja
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const tableOnly = req.query.tableOnly === 'true'; // Flag untuk table-only request
    
    if (Array.isArray(yearParam)) {
      yearParam = yearParam.join("");
    }
    const years = yearParam.split(",").map((y) => y.trim());
    
    let sql = "";
    let countSql = "";
    let chartSql = ""; // 
    let params = [];
    
    console.log("year =", years);
    console.log("period = ", period);
    
    if (period === "daily") {
      chartSql = `
        SELECT year, DATE_FORMAT(hari, '%d-%m-%Y') as label, total_visitor 
        FROM summary_daily_visitor
        WHERE YEAR(hari) IN (?)
        ORDER BY hari
      `;
      
      countSql = `
        SELECT COUNT(*) as total
        FROM summary_daily_visitor
        WHERE YEAR(hari) IN (?)
      `;
      sql = `
        SELECT year, DATE_FORMAT(hari, '%d-%m-%Y') as label, total_visitor 
        FROM summary_daily_visitor
        WHERE YEAR(hari) IN (?)
        ORDER BY hari
        LIMIT ? OFFSET ?
      `;
      params = [years, limit, offset];
    }
    
    if (period === "weekly") {
      chartSql = `
        SELECT year, week as label, start_date, end_date, total_visitor 
        FROM summary_weekly_visitor
        WHERE year IN (?)
        ORDER BY year, week
      `;
      
      countSql = `
        SELECT COUNT(*) as total
        FROM summary_weekly_visitor
        WHERE year IN (?)
      `;
      sql = `
        SELECT year, week as label, start_date, end_date, total_visitor 
        FROM summary_weekly_visitor
        WHERE year IN (?)
        ORDER BY year, week
        LIMIT ? OFFSET ?
      `;
      params = [years, limit, offset];
    }
    
    if (period === "yearly") {
      chartSql = `
        SELECT year, CAST(year as CHAR) as label, total_visitor 
        FROM summary_yearly_visitor
        WHERE year IN (?)
        ORDER BY year
      `;
      
      countSql = `
        SELECT COUNT(*) as total
        FROM summary_yearly_visitor
        WHERE year IN (?)
      `;
      sql = `
        SELECT year, CAST(year as CHAR) as label, total_visitor 
        FROM summary_yearly_visitor
        WHERE year IN (?)
        ORDER BY year
        LIMIT ? OFFSET ?
      `;
      params = [years, limit, offset];
    }
    
    if (period === "monthly") {
      chartSql = `
        SELECT year, month as label, total_visitor 
        FROM summary_monthly_visitor
        WHERE year IN (?)
        ORDER BY year, month
      `;
      
      countSql = `
        SELECT COUNT(*) as total
        FROM summary_monthly_visitor
        WHERE year IN (?)
      `;
      sql = `
        SELECT year, month as label, total_visitor 
        FROM summary_monthly_visitor
        WHERE year IN (?)
        ORDER BY year, month
        LIMIT ? OFFSET ?
      `;
      params = [years, limit, offset];
    }
    
    const formatDate = (d) => {
      if (!d) return null;
      return new Date(d).toISOString().split("T")[0];
    };
    
    // ✅ Jika request untuk table saja (pagination)
    if (tableOnly) {
      const [[{ total }]] = await bebaspustaka.query(countSql, [years]);
      const totalPages = Math.ceil(total / limit);
      const [rows] = await bebaspustaka.query(sql, params);
      
      const groupedData = rows.reduce((acc, r) => {
        if (!acc[r.year]) acc[r.year] = [];
        acc[r.year].push({
          label: r.label,
          total_visitor: r.total_visitor,
          start_date: formatDate(r.start_date),
          end_date: formatDate(r.end_date)
        });
        return acc;
      }, {});
      
      return res.json({
        years: years,
        data: groupedData,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    }
    
    // ✅ Default: Return FULL data untuk chart (no pagination)
    const [chartRows] = await bebaspustaka.query(chartSql, [years]);
    
    const groupedChartData = chartRows.reduce((acc, r) => {
      if (!acc[r.year]) acc[r.year] = [];
      acc[r.year].push({
        label: r.label,
        total_visitor: r.total_visitor,
        start_date: formatDate(r.start_date),
        end_date: formatDate(r.end_date)
      });
      return acc;
    }, {});
    
    
    const [[{ total }]] = await bebaspustaka.query(countSql, [years]);
    
    res.json({
      years: years,
      data: groupedChartData,
      totalRecords: total,
      recordsPerYear: Object.keys(groupedChartData).reduce((acc, year) => {
        acc[year] = groupedChartData[year].length;
        return acc;
      }, {})
    });
    
  } catch (err) {
    console.error("❌ Error:", err);
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