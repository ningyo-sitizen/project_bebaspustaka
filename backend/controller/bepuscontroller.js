//
// Controller BEPUS
//
const { opac, bebaspustaka } = require('../config');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// =====================================================
// =============== GET DATA BEPUS + SEARCH =============
// =====================================================

/**
 * listTI()
 * - Mengambil data BEPUS (Bebas Pustaka)
 * - Support:
 *   ✔ pagination
 *   ✔ pencarian (nim/nama)
 *   ✔ selectAll untuk export
 */
exports.listTI = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search ? '%${req.query.search.toLowerCase()}%' : '%%';
    const isSelectAll = req.query.isSelectAll === "true";

    // Jika select all → abaikan pagination
    let pageSize = isSelectAll ? 100000 : 15;
    let offset = (page - 1) * pageSize;

    let pool = await opac;

    // Hitung jumlah total data
    const totalQuery = await pool.request()
      .input('search', mssql.VarChar, search)
      .query(`
        SELECT COUNT(*) AS total
        FROM bebas_pustaka_ti
        WHERE LOWER(nama_mahasiswa) LIKE @search
           OR LOWER(nim) LIKE @search
      `);

    const totalRows = totalQuery.recordset[0].total;
    const totalPages = Math.ceil(totalRows / pageSize);

    // Ambil data
    const dataQuery = await pool.request()
      .input('search', mssql.VarChar, search)
      .query(`
        SELECT *
        FROM bebas_pustaka_ti
        WHERE LOWER(nama_mahasiswa) LIKE '${search}'
           OR LOWER(nim) LIKE '${search}'
        ORDER BY tanggal_pengajuan DESC
        OFFSET ${offset} ROWS
        FETCH NEXT ${pageSize} ROWS ONLY
      `);

    res.json({
      page,
      totalPages,
      totalRows,
      data: dataQuery.recordset
    });

  } catch (error) {
    console.error("Error listTI:", error);
    res.status(500).json({ error: "Error fetching BEPUS data" });
  }
};

// =====================================================
// ======================= APPROVE ======================
// =====================================================

/**
 * approve()
 * - Melakukan approve satu data
 * - Cek status pustaka dari database lain (DB opac)
 */
exports.approve = async (req, res) => {
  try {
    const { id } = req.params;

    let poolOPAC = await opac;
    let poolBEPUS = await bebaspustaka;

    // Ambil data mahasiswa berdasarkan ID
    const selectQuery = await poolBEPUS.request()
      .input('id', mssql.Int, id)
      .query(`
        SELECT nim, nama_mahasiswa FROM bebas_pustaka_ti WHERE id = @id
      `);

    if (selectQuery.recordset.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    const nim = selectQuery.recordset[0].nim;

    // Cek status pustaka mahasiswa dari database OPAC
    const cekStatus = await poolOPAC.request()
      .input('nim', mssql.VarChar, nim)
      .query(`
        SELECT status_pustaka FROM mahasiswa WHERE nim = @nim
      `);

    if (cekStatus.recordset.length === 0) {
      return res.status(404).json({ message: "Data mahasiswa OPAC tidak ditemukan" });
    }

    const status_pustaka = cekStatus.recordset[0].status_pustaka;

    // Jika masih punya pinjaman → tidak boleh approve
    if (status_pustaka !== "Aman") {
      return res.status(400).json({
        message: "Mahasiswa masih memiliki kewajiban di perpustakaan"
      });
    }

    // Jika aman → approve
    const update = await poolBEPUS.request()
      .input('id', mssql.Int, id)
      .query(`
        UPDATE bebas_pustaka_ti
        SET status_peminjaman = 'Sudah Dikembalikan',
            tanggal_approve = GETDATE()
        WHERE id = @id
      `);

    res.json({
      message: "Berhasil diapprove"
    });

  } catch (error) {
    console.error("Error approve:", error);
    res.status(500).json({ error: "Gagal approve data" });
  }
};

// =====================================================
// ==================== APPROVE BULK ====================
// =====================================================

/**
 * approveBulk()
 * - Approve banyak data sekaligus
 * - Validasi tiap mahasiswa sama seperti approve()
 */
exports.approveBulk = async (req, res) => {
  try {
    const { ids } = req.body;

    let poolOPAC = await opac;
    let poolBEPUS = await bebaspustaka;

    let approved = [];
    let failed = [];

    for (const id of ids) {
      try {
        const selectQuery = await poolBEPUS.request()
          .input('id', mssql.Int, id)
          .query(`
            SELECT nim FROM bebas_pustaka_ti WHERE id = @id
          `);

        if (selectQuery.recordset.length === 0) {
          failed.push({ id, reason: "Data tidak ditemukan" });
          continue;
        }

        const nim = selectQuery.recordset[0].nim;

        // Cek status pustaka
        const cekStatus = await poolOPAC.request()
          .input('nim', mssql.VarChar, nim)
          .query(`
            SELECT status_pustaka FROM mahasiswa WHERE nim = @nim
          `);

        if (cekStatus.recordset[0].status_pustaka !== "Aman") {
          failed.push({ id, reason: "Masih memiliki pinjaman" });
          continue;
        }

        // Update jika aman
        await poolBEPUS.request()
          .input('id', mssql.Int, id)
          .query(`
            UPDATE bebas_pustaka_ti
            SET status_peminjaman = 'Sudah Dikembalikan',
                tanggal_approve = GETDATE()
            WHERE id = @id
          `);

        approved.push(id);

      } catch (err) {
        failed.push({ id, reason: "Error processing" });
      }
    }

    res.json({ approved, failed });

  } catch (error) {
    console.error("Error approveBulk:", error);
    res.status(500).json({ error: "Bulk approval gagal" });
  }
};

// =====================================================
// ===================== EXPORT PDF =====================
// =====================================================

exports.exportPDF = async (req, res) => {
  try {
    const selectedIds = req.body.ids;

    let pool = await bebaspustaka;

    // Ambil data berdasarkan ID yang dipilih
    const query = await pool.request().query(`
      SELECT *
      FROM bebas_pustaka_ti
      WHERE id IN (${selectedIds.join(",")})
      ORDER BY nama_mahasiswa ASC
    `);

    const data = query.recordset;

    // Mulai generate PDF
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=bepus.pdf");

    doc.pipe(res);

    doc.fontSize(18).text("Laporan Bebas Pustaka", { align: "center" });
    doc.moveDown();

    // Loop data → cetak ke PDF
    data.forEach((row, i) => {
      doc.fontSize(12).text('${i + 1}. NIM       : ${row.nim}');
      doc.text(`   Nama      : ${row.nama_mahasiswa}`);
      doc.text(`   Status    : ${row.status_pustaka_kompen}`);
      doc.text(`   Tgl Approve: ${row.tanggal_approve}`).moveDown();
    });

    doc.end();

  } catch (error) {
    console.error("Error exportPDF:", error);
    res.status(500).json({ error: "Gagal export PDF" });
  }
};

// =====================================================
// ==================== EXPORT EXCEL ====================
// =====================================================

exports.exportExcel = async (req, res) => {
  try {
    const selectedIds = req.body.ids;

    let pool = await bebaspustaka;

    const query = await pool.request().query(`
      SELECT *
      FROM bebas_pustaka_ti
      WHERE id IN (${selectedIds.join(",")})
      ORDER BY nama_mahasiswa ASC
    `);

    const data = query.recordset;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Bebas Pustaka");

    sheet.columns = [
      { header: "NIM", key: "nim", width: 15 },
      { header: "Nama", key: "nama_mahasiswa", width: 30 },
      { header: "Status", key: "status_pustaka_kompen", width: 25 },
      { header: "Tanggal Approve", key: "tanggal_approve", width: 25 }
    ];

    data.forEach(row => sheet.addRow(row));

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=bepus.xlsx"
    );
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error exportExcel:", error);
    res.status(500).json({ error: "Gagal export Excel" });
  }
};

// =====================================================
// ===================== CHECK VISITOR ==================
// =====================================================

/**
 * checkVisitor()
 * - Mengecek status pustaka mahasiswa dari DB OPAC
 * - Mengembalikan status + info lengkap
 */
exports.checkVisitor = async (req, res) => {
  try {
    const nim = req.params.nim;

    let poolOPAC = await opac;

    const result = await poolOPAC.request()
      .input('nim', mssql.VarChar, nim)
      .query(`
        SELECT nim, nama, status_pustaka
        FROM mahasiswa
        WHERE nim = @nim
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Mahasiswa tidak ditemukan" });
    }

    res.json({
      nim: result.recordset[0].nim,
      nama: result.recordset[0].nama,
      status: result.recordset[0].status_pustaka
    });

  } catch (error) {
    console.error("Error checkVisitor:", error);
    res.status(500).json({ error: "Gagal cek status visitor"});
}
};