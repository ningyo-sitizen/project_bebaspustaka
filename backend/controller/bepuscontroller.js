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
            ? (parseInt(req.query.limit) || 5)
            : null;
        const offset = limit ? (page - 1) * limit : null;

        let query = `
      SELECT DISTINCT
        m.member_id AS nim,
        m.member_name AS nama,
        IFNULL(l.is_return, 1) AS is_return
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
            nim: m.nim,
            nama: m.nama,
            status_peminjaman: m.is_return === 1 ? 'Sudah Dikembalikan' : 'Belum Dikembalikan',
            status_bepus: m.is_return === 1 ? 'Pending' : 'Tidak Bebas Pustaka',
            keterangan: m.is_return === 1 ? 'Menunggu persetujuan' : 'Beli buku baru atau bayar Rp150.000'
        }));

        // ================= Auto Insert Pending =================
        if (data.length > 0) {
            const pendingInserts = data
                .filter(d => d.status_bepus === 'Pending')
                .map(d => [d.nim, d.nama, "Pending"]); // Sesuai 3 kolom pertama

            if (pendingInserts.length > 0) {
                const placeholders = pendingInserts.map(() => '(?, ?, ?, NOW())').join(',');
                await bebaspustaka.query(`
          INSERT INTO bebas_pustaka (nim, nama_mahasiswa, status_pustaka_kompen, tanggal_approve)
          VALUES ${placeholders}
          ON DUPLICATE KEY UPDATE
            status_pustaka_kompen = VALUES(status_pustaka_kompen)
        `, pendingInserts.flat());
            }

                      
        const [bepusStatus] = await bebaspustaka.query(`
        SELECT nim, status_pustaka_kompen, tanggal_approve
        FROM bebas_pustaka
        WHERE nim IN (${data.map(() => '?').join(',')})
      `, data.map(d => d.nim));

            const statusMap = Object.fromEntries(
                bepusStatus.map(s => [s.nim, s])
            );

            data = data.map(d => ({
                ...d,
                status_bepus: statusMap[d.nim]?.status_pustaka_kompen || d.status_bepus,
                approved_at: statusMap[d.nim]?.tanggal_approve || null
            }));
        }

        const [totalData] = await opac.query(`
      SELECT COUNT(DISTINCT m.member_id) AS total
      FROM member m
      WHERE 
        m.inst_name IN ('Teknik Informatika dan Komputer', 'Teknik Informatika')
        AND m.register_date IS NOT NULL
        AND YEAR(m.register_date) BETWEEN 2019 AND 2025
        AND (LOWER(m.member_name) LIKE ? OR LOWER(m.member_id) LIKE ?)
    `, [search, search]);

        res.json({
            success: true,
            selectAll: isSelectAll,
            total: totalData[0].total,
            page: limit ? page : 'all',
            limit: limit || 'all',
            data
        });

    } catch (err) {
        console.error('❌ Error listTI:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// ====================== APPROVE ======================
exports.approve = async (req, res) => {
    try {
        const { nim } = req.body;
        if (!nim) return res.status(400).json({ message: 'NIM wajib diisi' });

        await bebaspustaka.query(`
      UPDATE bebas_pustaka
      SET status_pustaka_kompen = 'Disetujui',
          tanggal_approve = NOW()
      WHERE nim = ?
    `, [nim]);

        res.json({ ok: true, message: '✔ Status berubah menjadi Disetujui' });
    } catch (err) {
        console.error('❌ Error approve:', err);
        res.status(500).json({ message: '❌ Error menyimpan data approve' });
    }
};

// ====================== APPROVE BULK ======================
exports.approveBulk = async (req, res) => {
    try {
        const { data } = req.body;
        if (!data || !Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ message: "Data approve bulk tidak valid" });
        }

        const nims = data.map(d => d.nim);
        await bebaspustaka.query(`
            UPDATE bebas_pustaka
            SET status_pustaka_kompen = 'Disetujui',
                tanggal_approve = NOW()
            WHERE nim IN (${nims.map(() => '?').join(',')})
        `, nims);

        res.json({ ok: true, message: `Berhasil approve ${data.length} mahasiswa` });
    } catch (err) {
        console.error("❌ Error approveBulk:", err);
        res.status(500).json({ message: "❌ Error approve bulk" });
    };
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

        doc.fontSize(12).text(`${i + 1}. NIM       : ${row.nim}`);

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
