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

    const tahunList = tahun ? tahun.split(",") : [];
    const lembagaList = lembaga ? lembaga.split(",") : [];
    const programList = program ? program.split(",") : [];

    let sql = `
      SELECT tahun, lembaga, programs_studi AS program, total_pinjam
      FROM summary_loan_jurusan
      WHERE 1=1
    `;

    const params = [];

    if (tahunList.length > 0) {
      sql += ` AND tahun IN (${tahunList.map(() => "?").join(",")})`;
      params.push(...tahunList);
    }

    if (lembagaList.length > 0) {
      sql += ` AND lembaga IN (${lembagaList.map(() => "?").join(",")})`;
      params.push(...lembagaList);
    }

    if (programList.length > 0) {
      sql += ` AND programs_studi IN (${programList.map(() => "?").join(",")})`;
      params.push(...programList);
    }

    const [rows] = await bebaspustaka.query(sql, params);

    if (!tahun && !lembaga && !program) {
      const group = {};

      rows.forEach(r => {
        if (!group[r.tahun]) group[r.tahun] = 0;
        group[r.tahun] += r.total_pinjam;
      });

      return res.json({
        mode: "default_year",
        years: Object.keys(group),
        data: Object.keys(group).reduce((acc, year) => {
          acc[year] = [{ total: group[year] }];
          return acc;
        }, {})
      });
    }


    if (tahunList.length > 0 && lembagaList.length === 0 && programList.length === 0) {
      const group = {};

      rows.forEach(r => {
        if (!group[r.tahun]) group[r.tahun] = {};
        if (!group[r.tahun][r.lembaga]) group[r.tahun][r.lembaga] = 0;
        group[r.tahun][r.lembaga] += r.total_pinjam;
      });

      return res.json({
        mode: "per_lembaga",
        years: tahunList,
        data: Object.keys(group).reduce((acc, year) => {
          acc[year] = Object.keys(group[year]).map(lem => ({
            lembaga: lem,
            total: group[year][lem]
          }));
          return acc;
        }, {})
      });
    }


if (lembagaList.length > 0) {
  const group = {};

  rows.forEach(r => {
    if (!group[r.tahun]) group[r.tahun] = {};
    
    const key = `${r.program}|${r.lembaga}`;
    
    if (!group[r.tahun][key]) {
      group[r.tahun][key] = {
        program: r.program,
        lembaga: r.lembaga,
        total: 0
      };
    }
    
    group[r.tahun][key].total += r.total_pinjam;
  });

  return res.json({
    mode: "per_program",
    years: tahunList,
    lembaga: lembagaList,
    data: Object.keys(group).reduce((acc, year) => {
      acc[year] = Object.values(group[year]);
      return acc;
    }, {})
  });
}

    res.json({
      mode: "raw",
      data: rows
    });

  } catch (err) {
    console.error("❌ Error getSummaryReport:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getLoanHistory = async (req,res) => {

}