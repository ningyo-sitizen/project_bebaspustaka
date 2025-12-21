const { opac, bebaspustaka } = require('../config');
const PDFDocument = require("pdfkit");

const deleteOldData = async () => {
  try {
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    const fiveYearsAgoStr = fiveYearsAgo.toISOString().split('T')[0];

    const [oldRecords] = await bebaspustaka.query(
      `SELECT id, batch_id FROM approval_history_list WHERE input_date < ?`,
      [fiveYearsAgoStr]
    );

    if (oldRecords.length > 0) {
      console.log(`🗑️  Menghapus ${oldRecords.length} data yang lebih dari 5 tahun...`);

      const batchIds = oldRecords.map(r => r.batch_id);
      await bebaspustaka.query(
        `DELETE FROM approval_history WHERE batch_id IN (?)`,
        [batchIds]
      );

      await bebaspustaka.query(
        `DELETE FROM approval_history_list WHERE input_date < ?`,
        [fiveYearsAgoStr]
      );

      console.log(`✅ Berhasil menghapus data lama (sebelum ${fiveYearsAgoStr})`);
    }
  } catch (err) {
    console.error("❌ Error saat menghapus data lama:", err);
  }
};

exports.getListBebasPustaka = async(req, res) => {
  try {
    await deleteOldData();

    const sql_list = `
      SELECT id, batch_id, start_date, end_date, input_date 
      FROM bebaspustaka.approval_history_list 
      ORDER BY input_date DESC
    `;
    
    const [rows] = await bebaspustaka.query(sql_list);
    
    const data = rows.map(r => ({
      id: r.id,
      batch_id: r.batch_id,
      start_date: r.start_date,
      end_date: r.end_date,
      input_date: r.input_date
    }));

    return res.json({
      success: true,
      data: data
    });
  } catch(err) {
    console.error("❌ Error :", err);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data history"
    });
  }
};

exports.deleteHistoryApproval = async (req, res) => {
  
  const { id } = req.params;
  const { batch_id } = req.query;

  console.log(id)
  console.log(batch_id)

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

    await bebaspustaka.query(
      `DELETE FROM approval_history WHERE batch_id = ?`,
      [batch_id]
    );

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
    const { search = "", page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let countQuery = `
      SELECT COUNT(*) as total
      FROM approval_history
      WHERE batch_id = ?
    `;
    const countParams = [batch_id];

    if (search) {
      countQuery += `
        AND (
          nim LIKE ? OR
          nama_mahasiswa LIKE ? OR
          institusi LIKE ? OR
          program_studi LIKE ?
        )`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const [countResult] = await bebaspustaka.query(countQuery, countParams);
    const total = countResult[0].total;

    let dataQuery = `
      SELECT id, batch_id, nim, nama_mahasiswa, institusi, program_studi,
             STATUS_PINJAMAN, STATUS_bebas_pustaka, waktu_bebaspustaka, petugas_approve
      FROM approval_history
      WHERE batch_id = ?
    `;
    const dataParams = [batch_id];

    if (search) {
      dataQuery += `
        AND (
          nim LIKE ? OR
          nama_mahasiswa LIKE ? OR
          institusi LIKE ? OR
          program_studi LIKE ?
        )`;
      const searchPattern = `%${search}%`;
      dataParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    dataQuery += ` ORDER BY nama_mahasiswa ASC LIMIT ? OFFSET ?`;
    dataParams.push(parseInt(limit), offset);

    const [rows] = await bebaspustaka.query(dataQuery, dataParams);

    res.json({
      success: true,
      batch_id,
      total: total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: rows
    });
  } catch (err) {
    console.error("❌ getHistoryByBatch:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

exports.exportHistoryBatchPDF = async (req, res) => {
  try {
    const { batch_id } = req.params;

    const [batchInfo] = await bebaspustaka.query(
      `SELECT start_date, end_date, input_date 
       FROM approval_history_list 
       WHERE batch_id = ?`,
      [batch_id]
    );

    const [data] = await bebaspustaka.query(
      `SELECT nim, nama_mahasiswa, institusi, program_studi,
              STATUS_PINJAMAN, STATUS_bebas_pustaka, waktu_bebaspustaka, petugas_approve
       FROM approval_history
       WHERE batch_id = ?
       ORDER BY nama_mahasiswa ASC`,
      [batch_id]
    );

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data kosong"
      });
    }

    const doc = new PDFDocument({
      size: "A4",
      margin: 30
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="HISTORY_BEBAS_PUSTAKA_BATCH_${batch_id}.pdf"`
    );

    doc.pipe(res);

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("LAPORAN HISTORY BEBAS PUSTAKA", { align: "center" });

    doc
      .moveDown(0.5)
      .fontSize(11)
      .font("Helvetica")
      .text(`Batch ID : ${batch_id}`, { align: "center" });

    if (batchInfo && batchInfo.length > 0) {
      const batch = batchInfo[0];
      doc
        .fontSize(10)
        .text(`Periode: ${batch.start_date} s/d ${batch.end_date}`, { align: "center" })
        .text(`Tanggal Input: ${batch.input_date}`, { align: "center" });
    }

    doc.moveDown(2);

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

    drawRow(
      y,
      ["No", "NIM", "Nama Mahasiswa", "Program Studi", "Status"],
      true
    );
    y += rowHeight;

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

    doc
      .moveDown(2)
      .fontSize(10)
      .font("Helvetica")
      .text(`Total Data: ${data.length} mahasiswa`, { align: "right" });

    doc.end();
  } catch (err) {
    console.error("❌ exportHistoryBatchPDF Error:", err);
    res.status(500).json({
      success: false,
      message: "Gagal generate PDF"
    });
  }
};