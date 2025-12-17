const { opac, bebaspustaka } = require('../config');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

let GENERATING = false;

function formatDateClean(date) {
  const d = new Date(date);
  const pad = n => n.toString().padStart(2, '0');

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} `
       + `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatDateToMySQL(date) {
  const pad = n => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} `
       + `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}


async function updateStatusesJoin() {
  console.log("[STATUS] Updating STATUS_peminjaman & STATUS_denda...");

  const sql = `
    UPDATE bebas_pustaka bp
    LEFT JOIN (
      SELECT member_id 
      FROM opac.loan 
      WHERE is_return = 0 AND return_date IS NULL
      GROUP BY member_id
    ) loan ON loan.member_id = bp.nim
    LEFT JOIN (
      SELECT member_id
      FROM opac.fines
      WHERE debet != credit
      GROUP BY member_id
    ) fin ON fin.member_id = bp.nim
    SET 
      bp.STATUS_peminjaman = CASE WHEN loan.member_id IS NULL THEN 1 ELSE 0 END,
      bp.STATUS_denda = CASE WHEN fin.member_id IS NULL THEN 1 ELSE 0 END
  `;

  await bebaspustaka.query(sql);
  console.log("[STATUS DONE]");
}


async function generateBebasPustakaData({ forceRefresh = false } = {}) {
  if (GENERATING) {
    console.log("[SKIP] Generate sudah berjalan");
    return { skipped: true };
  }

  GENERATING = true;

  try {
    console.log("[START] generateBebasPustakaData()");
    const year = new Date().getFullYear();
    const sixYearsAgo = year - 6;

    if (!forceRefresh) {
      console.log("[NO REFRESH] generate dipanggil tanpa forceRefresh");
      return { refreshed: false };
    }

    console.log("[FORCE REFRESH] Full refresh dijalankan");

    const [members] = await opac.query(`
      SELECT DISTINCT member_id, member_name, inst_name, program_studi
      FROM member
      WHERE inst_name IN ('Teknik Informatika dan Komputer', 'Teknik Informatika')
      AND register_date IS NOT NULL
      AND YEAR(register_date) BETWEEN ? AND ?
    `, [sixYearsAgo, year]);

    await bebaspustaka.query(`TRUNCATE TABLE bebas_pustaka`);
    await bebaspustaka.query(`ALTER TABLE bebas_pustaka AUTO_INCREMENT = 1`);

    for (const m of members) {
      await bebaspustaka.query(`
        INSERT INTO bebas_pustaka (nim, nama_mahasiswa, institusi, program_studi)
        VALUES (?, ?, ?, ?)
      `, [m.member_id, m.member_name, m.inst_name, m.program_studi]);
    }

    await updateStatusesJoin();

    const [borrowing] = await bebaspustaka.query(`
      SELECT nim, nama_mahasiswa, institusi, program_studi
      FROM bebas_pustaka
      WHERE STATUS_peminjaman = 0 OR STATUS_denda = 0
    `);

    const mysqlDate = formatDateToMySQL(new Date());

    for (const m of borrowing) {
      await opac.query(`
        INSERT INTO visitor_count
        (member_id, member_name, institution, program_studi, checkin_date)
        VALUES (?, ?, ?, ?, ?)
      `, [m.nim, m.nama_mahasiswa, m.institusi, m.program_studi, mysqlDate]);
    }

    console.log("[END REFRESH] Total mahasiswa:", members.length);

    return { refreshed: true, inserted: members.length };

  } finally {
    GENERATING = false;
    console.log("[END] generateBebasPustakaData selesai");
  }
}


exports.getDate = async (req, res) => {
  const [rows] = await bebaspustaka.query(`
    SELECT STATUS_bebas_pustaka, start_date, end_date
    FROM bebas_pustaka_time_range LIMIT 1
  `);

  if (rows.length === 0)
    return res.json({ status: "empty" });

  const today = new Date();
  const end = new Date(rows[0].end_date);

  if (today > end && rows[0].STATUS_bebas_pustaka === "on_range") {
    await bebaspustaka.query(`
      UPDATE bebas_pustaka_time_range
      SET STATUS_bebas_pustaka = 'out_of_range'
    `);
    rows[0].STATUS_bebas_pustaka = "out_of_range";
    console.log("[DATE] Status berubah → out_of_range");
  }

res.json({
  status: rows[0].STATUS_bebas_pustaka,
  start_date: formatDateClean(rows[0].start_date),
  end_date: formatDateClean(rows[0].end_date)
});

};


exports.getMahasiswaTI_AllFull = async (req, res) => {
  try {
    const search = req.query.search ? `%${req.query.search.toLowerCase()}%` : '%%';
    const sortBy = req.query.sortBy || 'priority';
    const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC';

    let orderClause = '';

    switch (sortBy) {
      case 'priority':
        orderClause = `
          CASE 
            WHEN STATUS_peminjaman = 0 OR STATUS_denda = 0 THEN 0 
            ELSE 1 
          END ASC, 
          waktu_bebaspustaka DESC
        `;
        break;

      case 'latest':
        orderClause = `waktu_bebaspustaka DESC`;
        break;

      case 'oldest':
        orderClause = `waktu_bebaspustaka ASC`;
        break;

      case 'name_asc':
        orderClause = `nama_mahasiswa ASC`;
        break;

      case 'name_desc':
        orderClause = `nama_mahasiswa DESC`;
        break;

      default:
        orderClause = `waktu_bebaspustaka DESC`;
    }

    const query = `
      SELECT 
        id,
        nim,
        nama_mahasiswa,
        institusi,
        program_studi,
        STATUS_peminjaman,
        STATUS_denda,
        STATUS_bebas_pustaka,
        DATE_FORMAT(waktu_bebaspustaka, '%Y-%m-%d %H:%i:%s') AS waktu_bebaspustaka
      FROM bebas_pustaka
      WHERE 
        (LOWER(nama_mahasiswa) LIKE ? OR LOWER(nim) LIKE ?)
      ORDER BY ${orderClause}
    `;

    const [rows] = await bebaspustaka.query(query, [search, search]);

    return res.json({
      success: true,
      total: rows.length,
      data: rows
    });

  } catch (err) {
    console.error("❌ Error getMahasiswaTI_AllFull:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil seluruh data mahasiswa",
      error: err.message
    });
  }
};

exports.getAllMahasiswaTI = async (req, res) => {
  try {
    await updateStatusesJoin();
    const search = req.query.search ? `%${req.query.search.toLowerCase()}%` : '%%';

    const sortBy = req.query.sortBy || 'priority';
    const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC';

    let orderClause = '';

    switch (sortBy) {
      case 'priority':
        orderClause = `
          CASE 
            WHEN STATUS_peminjaman = 0 OR STATUS_denda = 0 THEN 0 
            ELSE 1 
          END ASC, 
          waktu_bebaspustaka DESC
        `;
        break;

      case 'latest':
        orderClause = `waktu_bebaspustaka DESC`;
        break;

      case 'oldest':
        orderClause = `waktu_bebaspustaka ASC`;
        break;

      case 'name_asc':
        orderClause = `nama_mahasiswa ASC`;
        break;

      case 'name_desc':
        orderClause = `nama_mahasiswa DESC`;
        break;

      default:
        orderClause = `waktu_bebaspustaka DESC`;
    }

    const query = `
      SELECT 
        id,
        nim,
        nama_mahasiswa,
        institusi,
        program_studi,
        STATUS_peminjaman,
        STATUS_denda,
        STATUS_bebas_pustaka,
        DATE_FORMAT(waktu_bebaspustaka, '%Y-%m-%d %H:%i:%s') AS waktu_bebaspustaka
      FROM bebas_pustaka
      WHERE 
        (LOWER(nama_mahasiswa) LIKE ? OR LOWER(nim) LIKE ?)
      ORDER BY ${orderClause}
    `;

    const [rows] = await bebaspustaka.query(query, [search, search]);

    const data = rows.map(r => ({
      id: r.id,
      nim: r.nim,
      nama_mahasiswa: r.nama_mahasiswa,
      institusi: r.institusi,
      program_studi: r.program_studi,
      STATUS_peminjaman: r.STATUS_peminjaman,
      STATUS_denda: r.STATUS_denda,
      STATUS_bebas_pustaka: r.STATUS_bebas_pustaka,
      waktu_bebaspustaka: r.waktu_bebaspustaka,
    }));

    return res.json({
      success: true,
      total: data.length,
      data: data
    });

  } catch (err) {
    console.error("❌ Error getAllMahasiswaTI:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil seluruh data mahasiswa",
      error: err.message
    });
  }
};


exports.setDateRangeAndGenerate = async (req, res) => {
  const { start_date, end_date } = req.body;
  if (!start_date || !end_date)
    return res.status(400).json({ message: "Tanggal wajib diisi" });

  const [rows] = await bebaspustaka.query(`
    SELECT * FROM bebas_pustaka_time_range LIMIT 1
  `);

  // FIRST TIME
  if (rows.length === 0) {
    await bebaspustaka.query(`
      INSERT INTO bebas_pustaka_time_range
      (STATUS_bebas_pustaka, start_date, end_date)
      VALUES ('on_range', ?, ?)
    `, [start_date, end_date]);

    await generateBebasPustakaData({ forceRefresh: true });

    return res.json({ success: true, message: "Generate pertama berhasil" });
  }

  if (rows[0].STATUS_bebas_pustaka === "on_range") {
    return res.status(400).json({
      message: "Tidak bisa edit tanggal saat ON RANGE"
    });
  }

  // OUT OF RANGE
  const lastEnd = new Date(rows[0].end_date);
  console.log(rows[0].end_date);
  const expire = new Date(lastEnd);
  expire.setMonth(expire.getMonth() + 3);

  const today = new Date();

  if (today > expire) {
    console.log("[OUT_OF_RANGE >3 BULAN] Full generate triggered");
    console.log(rows[0].end_date);
    await bebaspustaka.query(`
      UPDATE bebas_pustaka_time_range
      SET STATUS_bebas_pustaka='on_range', start_date=?, end_date=?
    `, [start_date, end_date]);

    await generateBebasPustakaData({ forceRefresh: true });

    return res.json({ success: true, message: "Generate ulang >3 bulan sukses" });
  }

  
  console.log("[OUT_OF_RANGE <3 BULAN] Update status dan insert nim ang masih belum bebas pinjaman");

  await bebaspustaka.query(`
    UPDATE bebas_pustaka_time_range
    SET STATUS_bebas_pustaka='on_range', start_date=?, end_date=?
  `, [start_date, end_date]);
    
  await updateStatusesJoin();

      const [borrowing] = await bebaspustaka.query(`
      SELECT nim, nama_mahasiswa, institusi, program_studi
      FROM bebas_pustaka
      WHERE STATUS_peminjaman = 0
    `);

    const mysqlDate = formatDateToMySQL(new Date());

    for (const m of borrowing) {
      await opac.query(`
        INSERT INTO visitor_count
        (member_id, member_name, institution, program_studi, checkin_date)
        VALUES (?, ?, ?, ?, ?)
      `, [m.nim, m.nama_mahasiswa, m.institusi, m.program_studi, mysqlDate]);
    }

    console.log("[END REFRESH] Total mahasiswa:", members.length);

  res.json({ success: true, message: "Status diperbarui tanpa generate" });
};


exports.approveAll = async (req, res) => {
  try {
    const { mahasiswa } = req.body;

    if (!mahasiswa || !Array.isArray(mahasiswa) || mahasiswa.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Data mahasiswa tidak valid"
      });
    }

    const mysqlDate = formatDateToMySQL(new Date());
    const petugas = req.body.username; 
    const sqlUpdate = `
      UPDATE bebas_pustaka
      SET STATUS_bebas_pustaka = 'approved',
          waktu_bebaspustaka = ?,
          petugas_approve = ?
      WHERE nim = ?
    `;

    const sqlInsert = `
      INSERT INTO visitor_count
      (member_id, member_name, institution, program_studi, checkin_date )
      VALUES (?, ?, ?, ?,?)
    `;

    // proses semua nim
    for (const m of mahasiswa) {
  const nim = m.nim;

  const nama = m.nama_mahasiswa ?? m.name ?? "";
  const institusi = m.institusi;
  const program_studi = m.program_studi;
  const status_peminjaman = m.STATUS_peminjaman ?? m.status_peminjaman;
  const status_denda = m.STATUS_denda ?? m.status_denda;

  if (status_peminjaman !== 1 || status_denda !== 1) {
    continue;
  }

      await bebaspustaka.query(sqlUpdate, [mysqlDate,petugas,nim]);
      console.log("nama petugas" + petugas)
      await opac.query(sqlInsert, [nim, nama, institusi, program_studi, mysqlDate]);
    }

    return res.json({
      success: true,
      message: `${mahasiswa.length} mahasiswa telah di-approve`
    });

  } catch (err) {
    console.error("❌ Error approveAll:", err);
    return res.status(500).json({
      success: false,
      message: "Error memproses approve all"
    });
  }
};

exports.approve = async (req, res) => {
  try {
    const {
      nim,
      nama_mahasiswa,
      institusi,
      program_studi,
      status_peminjaman,
      status_denda,
      username
    } = req.body;

    if (!nim) {
      return res.status(400).json({
        success: false,
        message: "NIM wajib dikirim"
      });
    }


    if (status_peminjaman !== 1 || status_denda !== 1) {
      return res.status(400).json({
        success: false,
        message: "Mahasiswa belum memenuhi syarat BEPUS"
      });
    }
    const mysqlDate = formatDateToMySQL(new Date());

    const sql = `
      UPDATE bebaspustaka.bebas_pustaka
      SET 
        STATUS_bebas_pustaka = 'approved',
        waktu_bebaspustaka = ?
        petugas_approve = ?
      WHERE nim = ?
    `;
    const sql_insert_visitor = 
    `
    insert into visitor_count (member_id,member_name,institution,program_studi,checkin_date)
    values (?,?,?,?,?)
    `

    const [updateResult] = await bebaspustaka.query(sql, [mysqlDate,username,nim]);
    const [insertResult] = await opac.query(sql_insert_visitor, [nim,nama_mahasiswa,institusi,program_studi,mysqlDate]);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Mahasiswa tidak ditemukan"
      });
    }
    return res.json({
      success: true,
      message: "Berhasil approve 1 mahasiswa",
      data: { nim }
    });

    

  } catch (err) {
    console.error("❌ Error approve:", err);
    res.status(500).json({
      success: false,
      message: "❌ Error menyimpan data approve"
    });
  }
};


// ====================== GET MAHASISWA UNTUK APPROVAL ======================
exports.getMahasiswaTI = async (req, res) => {
  try {
  await updateStatusesJoin();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search.toLowerCase()}%` : '%%';

    const sortBy = req.query.sortBy || 'priority';
    const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC';

    // Tentukan ORDER BY berdasarkan sortBy
    let orderClause = '';
    switch (sortBy) {
      case 'priority':
        // Priority: Status Bermasalah dulu (peminjaman=0 OR denda=0)
        orderClause = `
          CASE 
            WHEN STATUS_peminjaman = 0 OR STATUS_denda = 0 THEN 0 
            ELSE 1 
          END ASC, 
          waktu_bebaspustaka DESC
        `;
        break;
      case 'latest':
        orderClause = `waktu_bebaspustaka DESC`;
        break;
      case 'oldest':
        orderClause = `waktu_bebaspustaka ASC`;
        break;
      case 'name_asc':
        orderClause = `nama_mahasiswa ASC`;
        break;
      case 'name_desc':
        orderClause = `nama_mahasiswa DESC`;
        break;
      default:
        orderClause = `waktu_bebaspustaka DESC`;
    }

    // ========== QUERY AMBIL DATA ==========
    const query = `
      SELECT 
        id,
        nim,
        nama_mahasiswa,
        institusi,
        program_studi,
        STATUS_peminjaman,
        STATUS_denda,
        STATUS_bebas_pustaka,
        DATE_FORMAT(waktu_bebaspustaka, '%Y-%m-%d %H:%i:%s') AS waktu_bebaspustaka
      FROM bebas_pustaka
      WHERE 
        (LOWER(nama_mahasiswa) LIKE ? OR LOWER(nim) LIKE ?)
      ORDER BY ${orderClause}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await bebaspustaka.query(query, [search, search, limit, offset]);

    // ========== QUERY TOTAL COUNT ==========
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM bebas_pustaka
      WHERE 
        (LOWER(nama_mahasiswa) LIKE ? OR LOWER(nim) LIKE ?)
    `;

    const [totalData] = await bebaspustaka.query(countQuery, [search, search]);
    const total = totalData[0].total;

    // ========== FORMAT DATA SESUAI FRONTEND ==========
    const data = rows.map(r => ({
      id: r.id,
      nim: r.nim,
      name: r.nama_mahasiswa,
      nama_mahasiswa: r.nama_mahasiswa,
      institusi: r.institusi,
      program_studi: r.program_studi,
      status_peminjaman: r.STATUS_peminjaman, // 1 = Sudah Dikembalikan, 0 = Belum
      STATUS_peminjaman: r.STATUS_peminjaman,
      status_denda: r.STATUS_denda, // 1 = Bebas Denda, 0 = Memiliki Denda
      STATUS_denda: r.STATUS_denda,
      status_bepus: r.STATUS_bebas_pustaka, // 'Pending', 'Disetujui', dll
      STATUS_bebas_pustaka: r.STATUS_bebas_pustaka,
      waktu_bebaspustaka: r.waktu_bebaspustaka
    }));

    // ========== RESPONSE ==========
    res.json({
      success: true,
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
      data: data
    });

  } catch (err) {
    console.error("❌ Error getMahasiswaTI:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data mahasiswa",
      error: err.message
    });
  }
};


// ====================== GET MAHASISWA WITH "ALL" OPTION ======================
exports.getMahasiswaTIWithAll = async (req, res) => {
  try {
    // ========== PAGINATION & PARAMS ==========
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search ? `%${req.query.search.toLowerCase()}%` : '%%';
    const isSelectAll = req.query.selectAll === 'true';
    const showAll = req.query.all === 'true';

    // Limit null jika selectAll atau all=true
    const limit = !isSelectAll && !showAll ? (parseInt(req.query.limit) || 10) : null;
    const offset = limit ? (page - 1) * limit : null;

    // ========== SORTING ==========
    const sortBy = req.query.sortBy || 'priority';

    let orderClause = '';
    switch (sortBy) {
      case 'priority':
        orderClause = `
          CASE 
            WHEN STATUS_peminjaman = 0 OR STATUS_denda = 0 THEN 0 
            ELSE 1 
          END ASC, 
          waktu_bebaspustaka DESC
        `;
        break;
      case 'latest':
        orderClause = `waktu_bebaspustaka DESC`;
        break;
      case 'oldest':
        orderClause = `waktu_bebaspustaka ASC`;
        break;
      case 'name_asc':
        orderClause = `nama_mahasiswa ASC`;
        break;
      case 'name_desc':
        orderClause = `nama_mahasiswa DESC`;
        break;
      default:
        orderClause = `waktu_bebaspustaka DESC`;
    }

    // ========== QUERY AMBIL DATA ==========
    let query = `
      SELECT 
        id,
        nim,
        nama_mahasiswa,
        institusi,
        program_studi,
        STATUS_peminjaman,
        STATUS_denda,
        STATUS_bebas_pustaka,
        DATE_FORMAT(waktu_bebaspustaka, '%Y-%m-%d %H:%i:%s') AS waktu_bebaspustaka
      FROM bebas_pustaka
      WHERE 
        (LOWER(nama_mahasiswa) LIKE ? OR LOWER(nim) LIKE ?)
      ORDER BY ${orderClause}
    `;

    const params = [search, search];

    // Tambah LIMIT OFFSET jika ada pagination
    if (limit) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

    const [rows] = await bebaspustaka.query(query, params);

    // ========== QUERY TOTAL COUNT ==========
    const [totalData] = await bebaspustaka.query(`
      SELECT COUNT(*) AS total
      FROM bebas_pustaka
      WHERE 
        (LOWER(nama_mahasiswa) LIKE ? OR LOWER(nim) LIKE ?)
    `, [search, search]);

    const total = totalData[0].total;


    const data = rows.map(r => ({
      id: r.id,
      nim: r.nim,
      name: r.nama_mahasiswa,
      nama_mahasiswa: r.nama_mahasiswa,
      institusi: r.institusi,
      program_studi: r.program_studi,
      status_peminjaman: r.STATUS_peminjaman,
      STATUS_peminjaman: r.STATUS_peminjaman,
      status_denda: r.STATUS_denda,
      STATUS_denda: r.STATUS_denda,
      status_bepus: r.STATUS_bebas_pustaka,
      STATUS_bebas_pustaka: r.STATUS_bebas_pustaka,
      waktu_bebaspustaka: r.waktu_bebaspustaka
    }));

    // ========== RESPONSE ==========
    res.json({
      success: true,
      total: total,
      page: limit ? page : "all",
      limit: limit || "all",
      totalPages: limit ? Math.ceil(total / limit) : 1,
      data: data
    });

  } catch (err) {
    console.error("❌ Error getMahasiswaTIWithAll:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data mahasiswa",
      error: err.message
    });
  }
};


exports.getMahasiswaTIWithAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search ? `%${req.query.search.toLowerCase()}%` : '%%';
    const isSelectAll = req.query.selectAll === 'true';
    const showAll = req.query.all === 'true';

    const limit = !isSelectAll && !showAll ? (parseInt(req.query.limit) || 10) : null;
    const offset = limit ? (page - 1) * limit : null;

    const sortBy = req.query.sortBy || 'register_date';
    const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC';

    let query = `
      SELECT DISTINCT
          nim,
          nama_mahasiswa,
          institusi,
          program_studi,
          STATUS_peminjaman,
          STATUS_denda,
          STATUS_bebas_pustaka,
          waktu_bebaspustaka
      FROM bebaspustaka.bebas_pustaka
      WHERE 
        (LOWER(nama_mahasiswa) LIKE ? OR LOWER(nim) LIKE ?)
      LIMIT ? OFFSET ?
    `;

    const params = [search, search];

    if (limit) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

    const [rows] = await opac.query(query, params);

    const [totalData] = await opac.query(`
      SELECT COUNT(DISTINCT nim) AS total
      FROM bebaspustaka.bebas_pustaka
    `);

    const total = totalData[0].total;

    // Format data
    const data = rows.map(r => ({
      nim: r.nim,
      nama: r.nama,
      register_date: r.register_date,
      inst_name: r.inst_name
    }));

    // Response
    res.json({
      success: true,
      total: total,
      page: limit ? page : "all",
      limit: limit || "all",
      totalPages: limit ? Math.ceil(total / limit) : 1,
      data: data
    });

  } catch (err) {
    console.error("❌ Error getMahasiswaTIWithAll:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data mahasiswa",
      error: err.message
    });
  }
};

// ====================== EXPORT PDF ======================
exports.exportPDF = async (req, res) => {
  try {
    const { header, data } = req.body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ success: false, message: "Data export kosong" });
    }

    const doc = new PDFDocument({ size: "A4", margin: 30 });
    const filename = `BEPUS_${Date.now()}.pdf`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    
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
