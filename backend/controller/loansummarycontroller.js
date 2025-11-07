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

    console.log("📌 Request program studi dari lembaga:", lembaga);

    const sql = "SELECT DISTINCT programs_studi FROM summary_loan_jurusan WHERE lembaga = ?";
    const [rows] = await bebaspustaka.query(sql, [lembaga]);

    const program = rows.map(r => r.programs_studi);
    res.json(program);
  } catch (err) {
    console.error("❌ Error getProgramStudi:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSummaryReport = async (req, res) => {
  try {
    const { tahun, lembaga, program } = req.query;

    let sql = `
      SELECT tahun, lembaga, programs_studi, total_pinjam
      FROM summary_loan_jurusan
      WHERE 1=1
    `;

    const params = [];

    if (tahun) {
      sql += " AND tahun = ?";
      params.push(tahun);
    }

    if (lembaga) {
      sql += " AND lembaga = ?";
      params.push(lembaga);
    }

    if (program) {
      const programList = program.split(",");
      sql += ` AND programs_studi IN (${programList.map(() => "?").join(",")})`;
      params.push(...programList);
    }

    sql += " ORDER BY total_pinjam DESC";

    const [rows] = await bebaspustaka.query(sql, params);

    res.json(rows);
  } catch (err) {
    console.error("❌ Error getSummaryReport:", err);
    res.status(500).json({ message: "Server error" });
  }
};
