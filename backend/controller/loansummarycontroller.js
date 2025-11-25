const { bebaspustaka } = require('../config');
const { opac } = require('../config');

exports.getAngkatan = async (req, res) => {
  try {
    const sql = "SELECT DISTINCT tahun FROM summary_loan_jurusan ORDER BY tahun DESC";
    const [rows] = await bebaspustaka.query(sql);

    const years = rows.map(r => r.tahun);
    res.json(years);
  } catch (err) {
    console.error("❌ Error getAngkatan:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getLembaga = async (req, res) => {
  try {
    const sql = "SELECT DISTINCT lembaga FROM summary_loan_jurusan";
    const [rows] = await bebaspustaka.query(sql);

    const lembaga = rows.map(r => r.lembaga);
    res.json(lembaga);
  } catch (err) {
    console.error("❌ Error getLembaga:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProgramStudi = async (req, res) => {
  try {
    const { lembaga } = req.query;

    console.log("📌 lembaga diterima:", lembaga);

    if (!lembaga || lembaga.trim() === "") {
      console.log("⚠ lembaga kosong → return {}");
      return res.json({});
    }

    const lembagaList = lembaga.split(",").map(l => l.trim());
    console.log("📌 lembagaList:", lembagaList);

    if (lembagaList.length === 0) {
      return res.json({});
    }

    const placeholders = lembagaList.map(() => "?").join(",");
    const sql = `
      SELECT DISTINCT lembaga, programs_studi
      FROM summary_loan_jurusan
      WHERE lembaga IN (${placeholders})
      ORDER BY lembaga, programs_studi
    `;

    const [rows] = await bebaspustaka.query(sql, lembagaList);

    console.log("📌 rows:", rows);

    const grouped = {};
    rows.forEach(r => {
      if (!grouped[r.lembaga]) grouped[r.lembaga] = [];
      grouped[r.lembaga].push(r.programs_studi);
    });

    console.log("📦 grouped:", grouped);

    res.json(grouped);

  } catch (err) {
    console.error("❌ Error getProgramStudi:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getSummaryReport = async (req, res) => {
  try {
    const { tahun, lembaga, program } = req.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;

    const sort = req.query.sort || "desc";
    const sortDirection = sort === "asc" ? "ASC" : "DESC";

    const tahunList = tahun ? tahun.split(",") : [];
    const lembagaList = lembaga ? lembaga.split(",") : [];
    const programList = program ? program.split(",") : [];

    let sql = `
      SELECT tahun, lembaga, programs_studi AS program, total_pinjam
      FROM summary_loan_jurusan
      WHERE 1=1
    `;
    
    const params = [];
    let countSql = `SELECT COUNT(*) AS total FROM summary_loan_jurusan WHERE 1=1`;
    const countParams = [];

 
    if (tahunList.length > 0) {
      const placeholders = tahunList.map(() => "?").join(",");
      sql += ` AND tahun IN (${placeholders})`;
      countSql += ` AND tahun IN (${placeholders})`;
      params.push(...tahunList);
      countParams.push(...tahunList); 
    }

    if (lembagaList.length > 0) {
      const placeholders = lembagaList.map(() => "?").join(",");
      sql += ` AND lembaga IN (${placeholders})`;
      countSql += ` AND lembaga IN (${placeholders})`;
      params.push(...lembagaList);
      countParams.push(...lembagaList);
    }

    if (programList.length > 0) {
      const placeholders = programList.map(() => "?").join(",");
      sql += ` AND programs_studi IN (${placeholders})`;
      countSql += ` AND programs_studi IN (${placeholders})`;
      params.push(...programList);
      countParams.push(...programList); 
    }

    const [countRows] = await bebaspustaka.query(countSql, countParams);
    const totalRows = countRows[0].total;
    const totalPages = Math.ceil(totalRows / limit);

    sql += ` ORDER BY total_pinjam ${sortDirection}`;
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await bebaspustaka.query(sql, params);

    console.log("📊 Query result:", {
      totalRows,
      totalPages,
      currentPage: page,
      dataLength: rows.length
    });

    return res.json({
      mode: "paged",
      page,
      limit,
      sort,
      totalRows,
      totalPages,
      data: rows
    });

  } catch (err) {
    console.error("❌ Error getSummaryReport:", err);
    console.error("❌ Error details:", err.message);
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getLoanHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit) 
    const offset = (page - 1) * limit;

    const sql = `
      SELECT loan_id, member_id, item_code, loan_date, due_date, is_return, return_date
      FROM loan
      ORDER BY 
        (is_return = 0 AND return_date IS NULL) DESC,
        is_return ASC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await opac.query(sql, [limit, offset]);

    const data = rows.map(r => ({
      loan_id: r.loan_id,
      member_id: r.member_id,
      item_code: r.item_code,
      loan_date: r.loan_date ? r.loan_date.toISOString().split("T")[0] : null,
      due_date: r.due_date ? r.due_date.toISOString().split("T")[0] : null,
      return_date: r.return_date ? r.return_date.toISOString().split("T")[0] : null,

      is_return: r.is_return,

      status:
        r.is_return === 0 && r.return_date === null
          ? "Belum Dikembalikan"
          : "Sudah Dikembalikan",
    }));

    res.json({
      success: true,
      page,
      limit,
      data
    });

  } catch (err) {
    console.error("❌ Error getLoanHistory:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
