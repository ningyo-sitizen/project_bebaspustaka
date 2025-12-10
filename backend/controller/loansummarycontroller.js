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

    if (!lembaga || lembaga.trim() === "") {
      return res.json({});
    }

    const lembagaList = lembaga.split(",").map(l => l.trim());

    if (lembagaList.length === 0) {
      return res.json({});
    }

    const placeholders = lembagaList.map(() => "?").join(",");
    const sql = `
      SELECT DISTINCT lembaga, programs_studi
      FROM summary_loan_jurusan
      WHERE lembaga IN (${placeholders})
      ORDER BY lembaga ASC, programs_studi ASC;
    `;

    const [rows] = await bebaspustaka.query(sql, lembagaList);

    const grouped = {};
    rows.forEach(r => {
      if (!grouped[r.lembaga]) grouped[r.lembaga] = [];
      grouped[r.lembaga].push(r.programs_studi);
    });

    res.json(grouped);

  } catch (err) {
    console.error("❌ Error getProgramStudi:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSummaryReport = async (req, res) => {
  try {
    const { tahun, lembaga, program, page: pageParam, limit: limitParam } = req.query;

    const page = parseInt(pageParam) || 1;
    const limit = parseInt(limitParam) || 7;
    const offset = (page - 1) * limit;

    const tahunList = tahun ? tahun.split(",").map(t => t.trim()) : [];
    const lembagaList = lembaga ? lembaga.split(",").map(l => l.trim()) : [];
    const programList = program ? program.split(",").map(p => p.trim()) : [];

    console.log("🔍 Filter params:", { tahunList, lembagaList, programList });

    const hasProgram = programList.length > 0;
    const hasLembaga = lembagaList.length > 0;
    const hasTahun = tahunList.length > 0;

    let sql = '';
    let groupBy = '';
    const params = [];

    if (hasProgram) {
      sql = `
        SELECT tahun, lembaga, programs_studi AS program, total_pinjam
        FROM summary_loan_jurusan
        WHERE 1=1
      `;
      groupBy = ` GROUP BY tahun, lembaga, programs_studi`;
    } else if (hasLembaga) {
      sql = `
        SELECT tahun, lembaga, SUM(total_pinjam) AS total_pinjam
        FROM summary_loan_jurusan
        WHERE 1=1
      `;
      groupBy = ` GROUP BY tahun, lembaga`;
    } else {
      sql = `
        SELECT tahun, SUM(total_pinjam) AS total_pinjam
        FROM summary_loan_jurusan
        WHERE 1=1
      `;
      groupBy = ` GROUP BY tahun`;
    }

    if (hasTahun) {
      const placeholders = tahunList.map(() => "?").join(",");
      sql += ` AND tahun IN (${placeholders})`;
      params.push(...tahunList);
    }

    if (hasLembaga) {
      const placeholders = lembagaList.map(() => "?").join(",");
      sql += ` AND lembaga IN (${placeholders})`;
      params.push(...lembagaList);
    }

    if (hasProgram) {
      const placeholders = programList.map(() => "?").join(",");
      sql += ` AND programs_studi IN (${placeholders})`;
      params.push(...programList);
    }

    sql += groupBy;
    sql += ` ORDER BY tahun ASC, lembaga ASC`;
    
    if (hasProgram) {
      sql += `, programs_studi ASC`;
    }

    console.log("📊 SQL Query:", sql);
    console.log("📊 Params:", params);

    // PERBAIKAN: Ambil SEMUA data untuk chart
    const [allRows] = await bebaspustaka.query(sql, params);

    console.log("📦 All Rows Count:", allRows.length);
    console.log("📦 Sample Data:", allRows.slice(0, 5));

    const totalRows = allRows.length;
    const totalPages = Math.ceil(totalRows / limit);
    
    // Paginate hanya untuk table, bukan untuk chart
    const paginatedRows = allRows.slice(offset, offset + limit);

    console.log("📄 Paginated:", {
      totalRows,
      totalPages,
      currentPage: page,
      showing: paginatedRows.length
    });

    return res.json({
      mode: "paged",
      page,
      limit,
      totalRows,
      totalPages,
      data: paginatedRows,      // Untuk table
      allData: allRows           // PENTING: Untuk chart (semua data)
    });

  } catch (err) {
    console.error("❌ Error getSummaryReport:", err);
    console.error("❌ Stack:", err.stack);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getLoanHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
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