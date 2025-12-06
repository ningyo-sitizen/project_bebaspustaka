const { opac, bebaspustaka } = require("../config");


//buat approval dan ket
exports.getLoanHistoryByNim = async (req, res) => {
  try {
    const { nim } = req.params;
    console.log("req.params.nim =", nim); // buat debug

    if (!nim)
      return res.status(400).json({ success: false, message: "NIM Tidak bisa diambil" });

    const sql = `
      SELECT loan_id, member_id AS nim, item_code AS book, loan_date, due_date, is_return, return_date
      FROM loan
      WHERE member_id = ?
      ORDER BY 
        (is_return = 0 AND return_date IS NULL) DESC,
        is_return ASC
    `;

    const [rows] = await opac.query(sql, [nim]); // <-- ganti dari member_id ke nim

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

  } catch (err) {
    console.error("❌ Error getLoanHistoryByNim:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

