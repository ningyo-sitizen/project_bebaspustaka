const {opac,bebaspustaka} = require("../config");

exports.getLoanHistoryByNim = async (req, res) => {
  try {
    const { nim } = req.params; 
    console.log("req.params.nim =", nim);
    
    if (!nim) {
      return res.status(400).json({ success: false, message: "NIM Tidak bisa diambil" });
    }

    const sql = `
      SELECT loan_id, member_id AS nim, item_code AS book, loan_date, due_date, is_return, return_date
      FROM loan
      WHERE member_id = ?
      ORDER BY 
        (is_return = 0 AND return_date IS NULL) DESC,
        is_return ASC
    `;
    
    const [rows] = await opac.query(sql, [nim]);
    
    const history = rows.map(r => ({
      id: r.loan_id,
      book: r.book,
      tpinjam: r.loan_date ? r.loan_date.toISOString().split("T")[0] : null,
      wpinjam: r.loan_date ? r.loan_date.toISOString().split("T")[1]?.slice(0, 5) : null,
      tkembali: r.return_date ? r.return_date.toISOString().split("T")[0] : null,
      wkembali: r.return_date ? r.return_date.toISOString().split("T")[1]?.slice(0, 5) : null,
      statusbuku: r.is_return === 1 ? 1 : 0
    }));
    
    res.json({ success: true, history });
    console.log(history)
  } catch (err) {
    console.error("❌ Error getLoanHistoryByNim:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getDataMahasiswa = async (req, res) => {
  try {
    const { nim } = req.query;
    console.log("Fetching mahasiswa with NIM:", nim);
    
    if (!nim) {
      return res.status(400).json({ message: "NIM parameter required" });
    }
    
    const sql = `SELECT member_id AS nim, member_name AS nama, inst_name, program_studi 
                 FROM member 
                 WHERE member_id = ?`;
    
    const [rows] = await opac.query(sql, [nim]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Mahasiswa tidak ditemukan" });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error("SQL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getStatusBebasPustaka = async (req, res) => {
  try {
    const { nim } = req.query;
    console.log("Fetching bebas pustaka status for NIM:", nim);
    
    if (!nim) {
      return res.status(400).json({ message: "NIM parameter required" });
    }
    
    const sql = `SELECT status_pustaka_kompen 
                 FROM bebas_pustaka 
                 WHERE nim = ?`;
    
    const [rows] = await bebaspustaka.query(sql, [nim]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Status tidak ditemukan" });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error("SQL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};