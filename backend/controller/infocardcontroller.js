const { bebaspustaka, opac } = require('../config');

// 1. Current Day Visitor Count
exports.currentDayVisitorCount = async (req, res) => {
  try {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    function format(dateObj) {
      const pad = (n) => n.toString().padStart(2, "0");
      return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())} ` +
        `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`;
    }

    const sql = `SELECT COUNT(*) as count FROM visitor_count 
                 WHERE checkin_date >= '${format(date)}' 
                 AND checkin_date < '${format(nextDay)}'`;
    
    const [rows] = await opac.query(sql);
    const count = rows[0].count;

    res.json({ count });
  } catch (err) {
    console.error("❌ Error fetching today visitor count:", err);
    res.status(500).json({ message: "Server error", count: 0 });
  }
};

// 2. Get Borrowed Books List (belum dikembalikan)
exports.getBorrowedBooksList = async (req, res) => {
  try {
    const sql = `SELECT COUNT(*) as count FROM loan 
                 WHERE is_return = 0 AND return_date IS NULL`;
    
    const [rows] = await opac.query(sql);
    const count = rows[0].count;

    res.json({ count });
  } catch (err) {
    console.error("❌ Error fetching borrowed books:", err);
    res.status(500).json({ message: "Server error", count: 0 });
  }
};


exports.fetCurrentWeekVisitorVSLastWeek = async (req, res) => {
  try {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); 
    const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - daysFromMonday);
    thisWeekStart.setHours(0, 0, 0, 0);
    
    const thisWeekEnd = new Date();
    thisWeekEnd.setHours(23, 59, 59, 999);
    
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setMilliseconds(-1);

    function format(dateObj) {
      const pad = (n) => n.toString().padStart(2, "0");
      return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())} ` +
        `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`;
    }

    // Query minggu ini
    const sqlThisWeek = `SELECT COUNT(*) as count FROM visitor_count 
                         WHERE checkin_date >= '${format(thisWeekStart)}' 
                         AND checkin_date <= '${format(thisWeekEnd)}'`;
    
    // Query minggu lalu
    const sqlLastWeek = `SELECT COUNT(*) as count FROM visitor_count 
                         WHERE checkin_date >= '${format(lastWeekStart)}' 
                         AND checkin_date <= '${format(lastWeekEnd)}'`;

    const [thisWeekRows] = await opac.query(sqlThisWeek);
    const [lastWeekRows] = await opac.query(sqlLastWeek);

    const thisWeek = thisWeekRows[0].count;
    const lastWeek = lastWeekRows[0].count;

    res.json({ 
      thisWeek, 
      lastWeek,
      difference: thisWeek - lastWeek
    });
  } catch (err) {
    console.error("❌ Error fetching weekly comparison:", err);
    res.status(500).json({ 
      message: "Server error", 
      thisWeek: 0, 
      lastWeek: 0,
      difference: 0
    });
  }
};