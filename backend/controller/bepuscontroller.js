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

      let data = rows.map(m => ({
          id: m.nim,
          name: m.nama,
          nim: m.nim,
          pengembalian: m.pengembalian,
          status_peminjaman:
              m.pengembalian === 1 ? "Sudah Dikembalikan" : "Belum Dikembalikan",
          status_bepus: m.pengembalian === 1 ? "Pending" : "Tidak Bebas Pustaka",
          status: 0,
          statusbebaspustakanya: 0,
          keterangan:
              m.pengembalian === 1
                  ? "Menunggu persetujuan"
                  : "Beli buku baru atau bayar Rp150.000",
          approved_at: null
      }));

    // ==================================================================
    // ============= CEK PINJAMAN & DENDA — UPDATE STATUS ===============
    // ==================================================================
    for (let d of data) {

        // === CEK PINJAMAN ===
        const [loan] = await opac.query(`
            SELECT is_return
            FROM loan
            WHERE member_id = ?
        `, [d.member_id]);

        const masihPinjam = loan.some(l => l.is_return === 0);

        // === CEK DENDA — tabel fines di DB opac ===
        const [fineRows] = await opac.query(`
            SELECT COALESCE(SUM(debet - credit), 0) AS total_denda
            FROM fines
            WHERE member_id = ?
        `, [d.member_id]);

        const totalDenda = fineRows[0]?.total_denda || 0;

        // === DEFAULT STATUS ===
        d.status_peminjaman = "Sudah Dikembalikan";
        d.pengembalian = 1;
        d.status_bepus = "Bebas Pustaka";
        d.keterangan = "-";

        // === JIKA TIDAK PERNAH PINJAM ===
        if (loan.length === 0) {
            d.status_peminjaman = "Tidak Ada Peminjaman";
        }

        // === LOGIKA STATUS (PINJAMAN ATAU DENDA) ===
        if (masihPinjam || totalDenda > 0) {
            d.pengembalian = 0;
            d.status_peminjaman = masihPinjam ? "Belum Dikembalikan" : "Sudah Dikembalikan";
            d.status_bepus = "Tidak Bebas Pustaka";

            if (masihPinjam) {
                d.keterangan = "Masih memiliki pinjaman buku";
            } else {
                d.keterangan = `Memiliki denda Rp${totalDenda.toLocaleString()}`;
            }
        }

        d.total_denda = totalDenda;
    }


      // ==================================================================
      // ============= AUTO INSERT PENDING KE TABEL BEPUS ================
      // ==================================================================
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

      // ==================================================================
      // ======================= MERGE STATUS BEPUS =======================
      // ==================================================================
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
              statusbebaspustakanya:
                  s.status_pustaka_kompen === "Disetujui" ? 1 : 0,
              status:
                  s.status_pustaka_kompen === "Disetujui" ? 1 : 0,
              approved_at: s.tanggal_approve
          };
      });

      // ==================================================================
      // ===================== PAGINATION COUNT & RESPONSE =================
      // ==================================================================
      // Guard: jika data kosong, hindari query WHERE IN ()
      if (data.length === 0) {
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

        return res.json({
            success: true,
            selectAll: isSelectAll,
            total: totalData[0].total,
            page: limit ? page : "all",
            limit: limit || "all",
            data: []
        });
    }

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


// ====================== FILTER DATE (SET / GET) ======================
exports.setFilterDate = async (req, res) => {
try {
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate)
        return res.status(400).json({ success: false, message: "Tanggal wajib diisi" });

    // set lock duration (misal 24 jam)
    const lockTime = new Date();
    lockTime.setHours(lockTime.getHours() + 24);

    // bersihkan dan simpan
    await bebaspustaka.query(`DELETE FROM bepus_filter_date`);
    await bebaspustaka.query(
        `INSERT INTO bepus_filter_date (start_date, end_date, locked_until) VALUES (?, ?, ?)`,
        [startDate, endDate, lockTime]
    );

    res.json({ success: true, message: "Tanggal berhasil disimpan & dikunci 24 jam" });

} catch (err) {
    console.error("❌ setFilterDate Error:", err);
    res.status(500).json({ success: false, message: "Gagal menyimpan tanggal" });
}
};

exports.getFilterDate = async (req, res) => {
try {
    const [rows] = await bebaspustaka.query(`SELECT * FROM bepus_filter_date LIMIT 1`);
    if (!rows.length) return res.json({ success: true, filter_active: false });

    const today = new Date();
    const locked = today < new Date(rows[0].locked_until);

    res.json({
        success: true,
        filter_active: true,
        locked,
        start_date: rows[0].start_date,
        end_date: rows[0].end_date,
        locked_until: rows[0].locked_until
    });

} catch (err) {
    console.error("❌ getFilterDate Error:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil tanggal" });
}
};


// ====================== APPROVE SINGLE ======================
exports.approve = async (req, res) => {
try {
    const { nim } = req.body;
    if (!nim) return res.status(400).json({ success: false, message: "NIM wajib diisi" });

    // pastikan tidak punya pinjaman/denda (opsional: cek lagi sebelum approve)
    const [loan] = await opac.query(
        `SELECT is_return, fine_value FROM loan WHERE member_id = ?`,
        [nim]
    );
    const masihPinjam = loan.some(l => l.is_return === 0);
    const totalDenda = loan.reduce((a, b) => a + (b.fine_value || 0), 0);
    if (masihPinjam || totalDenda > 0) {
        return res.status(400).json({
            success: false,
            message: masihPinjam ? "Mahasiswa masih memiliki pinjaman buku" : `Mahasiswa memiliki denda Rp${totalDenda.toLocaleString()}`
        });
    }

    await bebaspustaka.query(
        `UPDATE bebas_pustaka SET status_pustaka_kompen = 'Disetujui', tanggal_approve = NOW() WHERE nim = ?`,
        [nim]
    );

    const [updated] = await bebaspustaka.query(
        `SELECT nim, nama_mahasiswa, status_pustaka_kompen, DATE_FORMAT(tanggal_approve, '%Y-%m-%d %H:%i') AS tanggal_approve FROM bebas_pustaka WHERE nim = ?`,
        [nim]
    );

    if (!updated.length) return res.status(500).json({ success: false, message: "Gagal mengambil data terbaru" });

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

    // cek pinjaman/denda untuk semua nim sebelum approve bulk
    const cekPromises = nims.map(nim => opac.query(`SELECT is_return, fine_value FROM loan WHERE member_id = ?`, [nim]));
    const cekResults = await Promise.all(cekPromises);

    const blocked = [];
    cekResults.forEach((r, idx) => {
        const loans = r[0];
        const masihPinjam = loans.some(l => l.is_return === 0);
        const totalDenda = loans.reduce((a, b) => a + (b.fine_value || 0), 0);
        if (masihPinjam || totalDenda > 0) blocked.push({ nim: nims[idx], masihPinjam, totalDenda });
    });

    if (blocked.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Beberapa mahasiswa tidak bisa diapprove karena masih pinjam / memiliki denda",
            blocked
        });
    }

    await bebaspustaka.query(
        `UPDATE bebas_pustaka SET status_pustaka_kompen = 'Disetujui', tanggal_approve = NOW() WHERE nim IN (${nims.map(() => "?").join(",")})`,
        nims
    );

    const [rows] = await bebaspustaka.query(
        `SELECT nim, nama_mahasiswa, status_pustaka_kompen, DATE_FORMAT(tanggal_approve, '%Y-%m-%d %H:%i') AS tanggal_approve FROM bebas_pustaka WHERE nim IN (${nims.map(() => "?").join(",")})`,
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
        message: `✔ Berhasil approve ${updatedData.length} mahasiswa`,
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

      if (!member.length) return res.status(404).json({ success: false, message: "Mahasiswa tidak ditemukan" });

      const { member_id, member_name, inst_name } = member[0];

      const [visitor] = await opac.query(
          `SELECT COUNT(*) AS total_visit FROM visitor_count WHERE member_id = ? AND member_name = ? AND institution = ?`,
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

// ====================== DETAIL TI ======================
exports.detailTI = async (req, res) => {
  try {
      const { nim } = req.params;
      if (!nim) return res.status(400).json({ success: false, message: "NIM wajib diisi" });

      const [rows] = await bebaspustaka.query(
          `SELECT * FROM bebas_pustaka WHERE nim = ?`,
          [nim]
      );

      if (!rows.length)
          return res.status(404).json({ success: false, message: "Data tidak ditemukan" });

      const data = rows[0];

      // cek pinjaman di OPAC
      const [loans] = await opac.query(
          `SELECT title, is_return, fine_value, DATE_FORMAT(loan_date, '%Y-%m-%d') AS loan_date 
           FROM loan 
           WHERE member_id = ?`,
          [nim]
      );

      const masihPinjam = loans.some(l => l.is_return === 0);
      const totalDenda = loans.reduce((a, b) => a + (b.fine_value || 0), 0);

      res.json({
          success: true,
          data: {
              ...data,
              pinjaman: loans,
              masihPinjam,
              totalDenda
          }
      });

  } catch (err) {
      console.error("❌ detailTI Error:", err);
      res.status(500).json({ success: false, message: "Gagal mengambil detail" });
  }
};


// ====================== CANCEL BEPUS ======================
exports.cancel = async (req, res) => {
  try {
      const { nim } = req.body;
      if (!nim) return res.status(400).json({ success: false, message: "NIM wajib diisi" });

      await bebaspustaka.query(
          `UPDATE bebas_pustaka SET status_pustaka_kompen = 'Pending', tanggal_approve = NULL WHERE nim = ?`,
          [nim]
      );

      res.json({
          success: true,
          message: "✔ Status dikembalikan menjadi Pending",
          nim
      });

  } catch (err) {
      console.error("❌ cancel Error:", err);
      res.status(500).json({ success: false, message: "Gagal membatalkan approval" });
  }
};


// ====================== EXPORT PDF ======================
exports.exportPDF = async (req, res) => {
  try {
      const { header, data } = req.body;

      // Validasi
      if (!data || !Array.isArray(data) || data.length === 0) {
          return res.status(400).json({ success: false, message: "Data export kosong" });
      }

      const doc = new PDFDocument({ size: "A4", margin: 30 });
      const filename = `BEPUS_${Date.now()}.pdf`;

      // Set Header response
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "application/pdf");

      doc.pipe(res);

      // Judul
      doc.fontSize(16).text("Laporan Bebas Pustaka", { align: "center" });
      doc.moveDown();

      // Header Table
      doc.fontSize(10);
      header.forEach(h => {
          doc.text(h, { continued: true, width: 100 });
      });
      doc.moveDown();

      // Isi Table
      data.forEach(row => {
          Object.values(row).forEach(col => {
              doc.text(col ? col.toString() : "-", { continued: true, width: 100 });
          });
          doc.moveDown();
      });

      doc.end();

  } catch (err) {
      console.error("❌ exportPDF Error:", err);
      res.status(500).json({ success: false, message: "Gagal export PDF" });
  }
};


// ====================== EXPORT EXCEL ======================
exports.exportExcel = async (req, res) => {
    try {
        const { header, data } = req.body;

        if (!data || !Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ success: false, message: "Data export kosong" });
        }

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Laporan");

        sheet.addRow(header);

        data.forEach(row => {
            sheet.addRow(Object.values(row));
        });

        const filename = `BEPUS_${Date.now()}.xlsx`;
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error("❌ exportExcel Error:", err);
        res.status(500).json({ success: false, message: "Gagal export Excel" });
    }
};