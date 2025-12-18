const { bebaspustaka, opac } = require('../config');

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateToMySQL(date) {
  const pad = n => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} `
    + `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

exports.getStatusPustaka = async (req, res) => {
  const { nim } = req.query;

  console.log("\n================= REQUEST MASUK =================");
  console.log("NIM:", nim);

  if (!nim) {
    console.log("❌ NIM tidak dikirim");
    return res.status(400).json({ success: false, message: "NIM wajib dikirim" });
  }

  const today = todayDate();
  console.log("📅 Today:", today);

  try {
    /* =====================================================
       1️⃣ FAST PATH (TANPA LOCK)
       ===================================================== */
    const [fastRows] = await bebaspustaka.query(
      `SELECT 
         NULLIF(tanggal_terakhir,'0000-00-00') AS tanggal_terakhir,
         STATUS_bebas_pustaka
       FROM bebas_pustaka
       WHERE nim = ?
       LIMIT 1`,
      [nim]
    );

    if (!fastRows.length) {
      console.log("❌ Data bebas_pustaka tidak ditemukan");
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    }

    console.log("🧾 FAST PATH DATA:");
    console.log("   tanggal_terakhir DB :", fastRows[0].tanggal_terakhir);
    console.log("   status              :", fastRows[0].STATUS_bebas_pustaka);

    if (fastRows[0].tanggal_terakhir === today) {
      console.log("⚡ FAST PATH → SKIP INSERT (sudah hari ini)");

      return res.json({
        success: true,
        nim,
        status: fastRows[0].STATUS_bebas_pustaka || "pending",
        visitor_inserted_today: false
      });
    }

    /* =====================================================
       2️⃣ SLOW PATH (BUTUH INSERT → LOCK)
       ===================================================== */
    console.log("🐢 MASUK SLOW PATH (butuh lock)");

    const conn = await bebaspustaka.getConnection();
    let insertedToday = false;

    try {
      await conn.beginTransaction();
      console.log("🔒 TRANSACTION START");

      const [rows] = await conn.query(
        `SELECT 
           nim,
           nama_mahasiswa,
           institusi,
           program_studi,
           NULLIF(tanggal_terakhir,'0000-00-00') AS tanggal_terakhir
         FROM bebas_pustaka
         WHERE nim = ?
         FOR UPDATE`,
        [nim]
      );

      const mhs = rows[0];

      console.log("🔎 AFTER LOCK CHECK:");
      console.log("   DB tanggal_terakhir:", mhs.tanggal_terakhir);
      console.log("   Today              :", today);

    const mysqlDate = formatDateToMySQL(new Date());

      // 🔒 DOUBLE CHECK SETELAH LOCK
      if (!mhs.tanggal_terakhir || mhs.tanggal_terakhir < today) {
        console.log("🟢 INSERT VISITOR (belum ada hari ini)");

        await opac.query(
          `INSERT INTO visitor_count
           (member_id, member_name, institution, program_studi, checkin_date)
           VALUES (?, ?, ?, ?, ?)`,
          [mhs.nim, mhs.nama_mahasiswa, mhs.institusi, mhs.program_studi, mysqlDate]
        );

        await conn.query(
          `UPDATE bebas_pustaka
           SET tanggal_terakhir = ?
           WHERE nim = ?`,
          [today, nim]
        );

        insertedToday = true;
        console.log(`✅ [VISITOR INSERT] NIM=${nim} TANGGAL=${today}`);
      } else {
        console.log("🟡 SKIP INSERT (sudah diinsert request lain)");
      }

      await conn.commit();
      console.log("✅ TRANSACTION COMMIT");

    } catch (e) {
      await conn.rollback();
      console.log("❌ TRANSACTION ROLLBACK", e.message);
      throw e;
    } finally {
      conn.release();
      console.log("🔓 CONNECTION RELEASE");
    }

    console.log("================= REQUEST SELESAI =================");

    return res.json({
      success: true,
      nim,
      status: fastRows[0].STATUS_bebas_pustaka || "pending",
      visitor_inserted_today: insertedToday
    });

  } catch (err) {
    console.error("🔥 ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
