
const { opac, bebaspustaka } = require("../config");

exports.getLoanHistoryByNim = async (req, res) => {
  try {
    const { nim } = req.params;

    const sql = `
      SELECT 
        loan.loan_id,
        loan.member_id AS nim,
        loan.item_code,
        item.biblio_id,
        biblio.title AS book_name,
        loan.loan_date,
        loan.due_date,
        loan.is_return,
        loan.return_date
      FROM loan
      LEFT JOIN item ON loan.item_code = item.item_code
      LEFT JOIN biblio ON item.biblio_id = biblio.biblio_id
      WHERE loan.member_id = ?
      ORDER BY 
        (loan.is_return = 0 AND loan.return_date IS NULL) DESC,
        loan.is_return ASC;
    `;

    const [rows] = await opac.query(sql, [nim]);

    const history = rows.map(r => ({
      id: r.loan_id,
      nim: r.nim,
      item_code: r.item_code,
      biblio_id: r.biblio_id,
      book: r.book_name,
      loan_date: r.loan_date,
      due_date: r.due_date,
      return_date: r.return_date,
      tpinjam: r.loan_date ? r.loan_date.toISOString().split("T")[0] : null,
      wpinjam: r.loan_date ? r.loan_date.toISOString().split("T")[1]?.slice(0, 5) : null,
      tkembali: r.return_date ? r.return_date.toISOString().split("T")[0] : null,
      wkembali: r.return_date ? r.return_date.toISOString().split("T")[1]?.slice(0, 5) : null,
      statusbuku: r.is_return === 1 ? 1 : 0,
    }));

<<<<<<< HEAD
    res.json({ success: true, history });
    console.log(history)
=======
    return res.json({ success: true, history });

>>>>>>> fa15759a610bca240efe94e004ebb24c66bfb3af
  } catch (err) {
    console.error("❌ Error getLoanHistoryByNim:", err);
    return res.status(500).json({ success: false, message: "Server error" });
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