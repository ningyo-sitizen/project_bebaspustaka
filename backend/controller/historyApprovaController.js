const { opac, bebaspustaka } = require('../config');
const PDFDocument = require("pdfkit");

exports.getListBebasPustaka = async(req,res) => {
    try{
        const sql_list = `
        SELECT id,batch_id,start_date,end_date,input_date from  bebaspustaka.approval_history_list
        `
        const [rows] = await bebaspustaka.query(sql_list)

    const data = rows.map(r => ({
      id : r.id,
      batch_id : r.batch_id,
      start_date : r.start_date,
      end_date : r.end_date,
      input_date : r.input_date
    }));

    return res.json({
      success: true,
      data: data
    });

    }catch(err){
        console.error("❌ Error :", err);
    }
}

exports.deleteHistoryApproval = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "ID history tidak boleh kosong"
    });
  }

  try {
    const [check] = await bebaspustaka.query(
      `SELECT id FROM approval_history_list WHERE id = ?`,
      [id]
    );

    if (check.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data history tidak ditemukan"
      });
    }

    // hapus data
    await bebaspustaka.query(
      `DELETE FROM approval_history_list WHERE id = ?`,
      [id]
    );

    return res.json({
      success: true,
      message: "History approval berhasil dihapus"
    });

  } catch (err) {
    console.error("❌ Error delete history:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus history approval"
    });
  }
};


exports.getHistoryByBatch = async (req, res) => {
  try {
    const { batch_id } = req.params;

    const [rows] = await bebaspustaka.query(
      `
      SELECT 
        id,
        batch_id,
        nim,
        nama_mahasiswa,
        institusi,
        program_studi,
        STATUS_PINJAMAN,
        STATUS_bebas_pustaka,
        waktu_bebaspustaka,
        petugas_approve
      FROM approval_history
      WHERE batch_id = ?
      ORDER BY nama_mahasiswa ASC
      `,
      [batch_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Batch tidak ditemukan"
      });
    }

    res.json({
      success: true,
      batch_id,
      total: rows.length,
      data: rows
    });
  } catch (err) {
    console.error("❌ getHistoryByBatch:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.exportHistoryBatchPDF = async (req, res) => {
  try {
    const { batch_id } = req.params;

    const [data] = await bebaspustaka.query(
      `
      SELECT 
        nim,
        nama_mahasiswa,
        institusi,
        program_studi,
        STATUS_PINJAMAN,
        STATUS_bebas_pustaka,
        waktu_bebaspustaka,
        petugas_approve
      FROM approval_history
      WHERE batch_id = ?
      ORDER BY nama_mahasiswa ASC
      `,
      [batch_id]
    );

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data kosong"
      });
    }

    /* ===================== PDF INIT ===================== */
    const doc = new PDFDocument({ size: "A4", margin: 30 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="HISTORY_BEBAS_PUSTAKA_BATCH_${batch_id}.pdf"`
    );
    doc.pipe(res);

    /* ===================== JUDUL ===================== */
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("LAPORAN HISTORY BEBAS PUSTAKA", { align: "center" });

    doc
      .moveDown(0.5)
      .fontSize(11)
      .font("Helvetica")
      .text(`Batch ID : ${batch_id}`, { align: "center" });

    doc.moveDown(2);

    /* ===================== SETUP TABLE ===================== */
    const startX = doc.x;
    let y = doc.y;
    const rowHeight = 20;

    const col = {
      no: 30,
      nim: 90,
      nama: 160,
      prodi: 150,
      status: 100
    };

    const drawRow = (y, row, isHeader = false) => {
      doc.font(isHeader ? "Helvetica-Bold" : "Helvetica").fontSize(9);

      let x = startX;
      Object.values(col).forEach((w, i) => {
        doc.rect(x, y, w, rowHeight).stroke();

        doc.text(row[i], x + 5, y + 5, {
          width: w - 10,
          align: "left"
        });

        x += w;
      });
    };

    /* ===================== HEADER ===================== */
    drawRow(
      y,
      ["No", "NIM", "Nama Mahasiswa", "Program Studi", "Status"],
      true
    );
    y += rowHeight;

    /* ===================== DATA ===================== */
    data.forEach((row, i) => {
      if (y + rowHeight > doc.page.height - 40) {
        doc.addPage();
        y = doc.y;

        drawRow(
          y,
          ["No", "NIM", "Nama Mahasiswa", "Program Studi", "Status"],
          true
        );
        y += rowHeight;
      }

      drawRow(y, [
        String(i + 1),
        String(row.nim),
        row.nama_mahasiswa,
        row.program_studi || "-",
        row.STATUS_bebas_pustaka || "-"
      ]);

      y += rowHeight;
    });

    doc.end();
  } catch (err) {
    console.error("❌ exportHistoryBatchPDF Error:", err);
    res.status(500).json({
      success: false,
      message: "Gagal generate PDF"
    });
  }
};