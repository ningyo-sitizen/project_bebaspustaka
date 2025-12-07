//
// Controller BEPUS
//
const mssql = require('mssql');
const { opac, bebaspustaka } = require('../config');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// ====================== GET DATA ======================
exports.listTI = async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1;
      const search = req.query.search ? `%${req.query.search.toLowerCase()}%` : '%%';
      const isSelectAll = req.query.selectAll === 'true';

      const limit = !isSelectAll && req.query.all !== 'true'
          ? (parseInt(req.query.limit) || 10)
          : null;
      const offset = limit ? (page - 1) * limit : null;

      let query = `
          SELECT DISTINCT
              m.member_id AS nim,
              m.member_name AS nama,
              IFNULL(l.is_return, 1) AS pengembalian 
          FROM member m
          LEFT JOIN loan l ON l.member_id = m.member_id
          WHERE 
              m.inst_name IN ('Teknik Informatika dan Komputer', 'Teknik Informatika')
              AND m.register_date IS NOT NULL
              AND YEAR(m.register_date) BETWEEN 2019 AND 2025
              AND (LOWER(m.member_name) LIKE ? OR LOWER(m.member_id) LIKE ?)
          ORDER BY m.register_date ASC
      `;

      const params = [search, search];

      if (limit) {
          query += ` LIMIT ? OFFSET ?`;
          params.push(limit, offset);
      }

      const [rows] = await opac.query(query, params);

      // ------ INITIAL DATA STRUCTURE ─ FE COMPATIBLE ------
      let data = rows.map(m => ({
          id: m.nim,
          name: m.nama,
          nim: m.nim,

          pengembalian: m.pengembalian, // integer 1/0
          status_peminjaman:
              m.pengembalian === 1 ? "Sudah Dikembalikan" : "Belum Dikembalikan",

          // BEFORE BEPUS table merge:
          status_bepus: m.pengembalian === 1 ? "Pending" : "Tidak Bebas Pustaka",

          status: 0,                   // FE expects 0/1
          statusbebaspustakanya: 0,    // FE expects 0/1

          keterangan:
              m.pengembalian === 1
                  ? "Menunggu persetujuan"
                  : "Beli buku baru atau bayar Rp150.000",

          approved_at: null
      }));

      const pendingInserts = data
          .filter(d => d.status_bepus === "Pending")
          .map(d => [d.nim, d.name, "Pending", new Date()]);

      if (pendingInserts.length > 0) {
          const placeholders = pendingInserts.map(() => "(?, ?, ?, ?)").join(",");
          await bebaspustaka.query(
              `
              INSERT INTO bebas_pustaka (nim, nama_mahasiswa, status_pustaka_kompen, tanggal_approve)
              VALUES ${placeholders}
              ON DUPLICATE KEY UPDATE 
                  status_pustaka_kompen = VALUES(status_pustaka_kompen)
              `,
              pendingInserts.flat()
          );
      }

      // ------------ MERGE BEPUS STATUS ---------------------
      const [bepus] = await bebaspustaka.query(
          `
          SELECT nim, status_pustaka_kompen, tanggal_approve
          FROM bebas_pustaka
          WHERE nim IN (${data.map(() => "?").join(",")})
          `,
          data.map(d => d.nim)
      );

      const statusMap = Object.fromEntries(
          bepus.map(s => [s.nim, s])
      );

      data = data.map(d => {
          const s = statusMap[d.nim];
          if (!s) return d;

          return {
              ...d,

              status_bepus: s.status_pustaka_kompen,

              // FE needs numbers, not text
              statusbebaspustakanya:
                  s.status_pustaka_kompen === "Disetujui" ? 1 : 0,

              status:
                  s.status_pustaka_kompen === "Disetujui" ? 1 : 0,

              approved_at: s.tanggal_approve
          };
      });

      // ------------ PAGINATION COUNT -----------------------
      const [totalData] = await opac.query(
          `
          SELECT COUNT(DISTINCT m.member_id) AS total
          FROM member m
          WHERE 
              m.inst_name IN ('Teknik Informatika dan Komputer', 'Teknik Informatika')
              AND m.register_date IS NOT NULL
              AND YEAR(m.register_date) BETWEEN 2019 AND 2025
              AND (LOWER(m.member_name) LIKE ? OR LOWER(m.member_id) LIKE ?)
          `,
          [search, search]
      );

      res.json({
          success: true,
          selectAll: isSelectAll,
          total: totalData[0].total,
          page: limit ? page : "all",
          limit: limit || "all",
          data
      });

  } catch (err) {
      console.error("❌ Error listTI:", err);
      res.status(500).json({ success: false, error: err.message });
  }
};


// ====================== APPROVE ======================
exports.approve = async (req, res) => {
  try {
      const { nim } = req.body;
      if (!nim)
          return res.status(400).json({ success: false, message: "NIM wajib diisi" });

      // Update status
      await bebaspustaka.query(
          `
          UPDATE bebas_pustaka
          SET status_pustaka_kompen = 'Disetujui',
              tanggal_approve = NOW()
          WHERE nim = ?
      `,
          [nim]
      );

      // Ambil data baru
      const [updated] = await bebaspustaka.query(
          `
          SELECT nim, nama_mahasiswa, status_pustaka_kompen,
                 DATE_FORMAT(tanggal_approve, '%Y-%m-%d %H:%i') AS tanggal_approve
          FROM bebas_pustaka
          WHERE nim = ?
      `,
          [nim]
      );

      if (!updated.length)
          return res.status(500).json({ success: false, message: "Gagal mengambil data terbaru" });

      const row = updated[0];

      return res.json({
          success: true,
          message: "✔ Status berubah menjadi Disetujui",
          data: {
              id: row.nim,
              nim: row.nim,
              name: row.nama_mahasiswa,
              statusbebaspustakanya: 1,
              status: 1,
              status_bepus: row.status_pustaka_kompen,
              approved_at: row.tanggal_approve
          }
      });
  } catch (err) {
      console.error("❌ Error approve:", err);
      res.status(500).json({ success: false, message: "❌ Error menyimpan data approve" });
  }
};

// ====================== APPROVE BULK ======================
exports.approveBulk = async (req, res) => {
  try {
      const { data } = req.body;

      if (!data || !Array.isArray(data) || data.length === 0) {
          return res.status(400).json({ success: false, message: "Data approve bulk tidak valid" });
      }

      const nims = data.map(d => d.nim);

      // Update semua
      await bebaspustaka.query(
          `
          UPDATE bebas_pustaka
          SET status_pustaka_kompen = 'Disetujui',
              tanggal_approve = NOW()
          WHERE nim IN (${nims.map(() => "?").join(",")})
      `,
          nims
      );

      // Ambil ulang data yang berhasil diapprove
      const [rows] = await bebaspustaka.query(
          `
          SELECT nim, nama_mahasiswa, status_pustaka_kompen,
              DATE_FORMAT(tanggal_approve, '%Y-%m-%d %H:%i') AS tanggal_approve
          FROM bebas_pustaka
          WHERE nim IN (${nims.map(() => "?").join(",")})
      `,
          nims
      );

      const updatedData = rows.map(r => ({
          id: r.nim,
          nim: r.nim,
          name: r.nama_mahasiswa,
          statusbebaspustakanya: 1,
          status: 1,
          status_bepus: r.status_pustaka_kompen,
          approved_at: r.tanggal_approve
      }));

      return res.json({
          success: true,
          message: 'Berhasil approve ${data.length} mahasiswa',
          updated: updatedData
      });

  } catch (err) {
      console.error("❌ Error approveBulk:", err);
      res.status(500).json({ success: false, message: "❌ Error approve bulk" });
  }
};


// ====================== CHECK VISITOR ======================
exports.checkVisitor = async (req, res) => {
    try {
        const { nim } = req.params;
        if (!nim) return res.status(400).json({ success: false, message: "NIM wajib diisi" });

        const [member] = await opac.query(
            `SELECT member_id, member_name, inst_name FROM member WHERE member_id = ?`,
            [nim]
        );

        if (!member.length) {
            return res.status(404).json({ success: false, message: "Mahasiswa tidak ditemukan" });
        }

        const { member_id, member_name, inst_name } = member[0];

        const [visitor] = await opac.query(
            `SELECT COUNT(*) AS total_visit 
             FROM visitor_count 
             WHERE member_id = ? AND member_name = ? AND institution = ?`,
            [member_id, member_name, inst_name]
        );

        const status_visitor = visitor[0].total_visit > 0 ? "✔ Sudah Absen" : "❌ Belum Absen";

        res.json({
            success: true,
            nim,
            nama: member_name,
            institution: inst_name,
            total_kunjungan: visitor[0].total_visit,
            status_visitor
        });

    } catch (err) {
        console.error("❌ Error checkVisitor:", err);
        res.status(500).json({ success: false, message: "❌ Gagal mengecek status absensi" });
    }
};

// ====================== EXPORT PDF ======================
exports.exportPDF = async (req, res) => {
    try {
        const [data] = await bebaspustaka.query(`
            SELECT nim, nama_mahasiswa, status_pustaka_kompen,
            DATE_FORMAT(tanggal_approve, '%d-%m-%Y %H:%i') AS tanggal_approve	
            FROM bebas_pustaka
        `);

        if (!data.length) return res.status(400).send('⚠ Belum ada data untuk diexport.');

        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="bebas_pustaka.pdf"');
        doc.pipe(res);

        data.forEach((row, i) => {
            doc.fontSize(12).text(`${i + 1}. NIM       : ${row.nim}`);
            doc.text(`   Nama      : ${row.nama_mahasiswa}`);
            doc.text(`   Status    : ${row.status_pustaka_kompen}`);
            doc.text(`   Tgl Approve: ${row.tanggal_approve}`).moveDown();
        });

        doc.end();
    } catch (err) {
        console.error('❌ PDF Error:', err);
        res.status(500).send('❌ Gagal export PDF');
    }
};

// ====================== EXPORT EXCEL ======================
exports.exportExcel = async (req, res) => {
    try {
        const [data] = await bebaspustaka.query(`
            SELECT nim, nama_mahasiswa, status_pustaka_kompen,
            DATE_FORMAT(tanggal_approve, '%d-%m-%Y %H:%i') AS tanggal_approve	
            FROM bebas_pustaka
        `);

        if (!data.length) return res.status(400).send('⚠ Belum ada data untuk diexport.');

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Bebas Pustaka');

        sheet.columns = [
            { header: 'NIM', key: 'nim', width: 15 },
            { header: 'Nama Mahasiswa', key: 'nama_mahasiswa', width: 30 },
            { header: 'Status', key: 'status_pustaka_kompen', width: 20 },
            { header: 'Tanggal Approve', key: 'tanggal_approve', width: 25 }
        ];

        sheet.addRows(data);
        sheet.getRow(1).eachCell(cell => (cell.font = { bold: true }));

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="bebas_pustaka.xlsx"');

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error('❌ Excel Error:', err);
        res.status(500).send('❌ Gagal export Excel');
    }
};