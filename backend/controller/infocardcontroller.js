const { bebaspustaka } = require('../config');
const { opac } = require('../config');

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
    const sql = `SELECT COUNT(*) FROM visitor_count WHERE checkin_date >= ${format(date)} AND checkin_date <  ${format(nextDay)}`
    const [rows] = opac.query(sql)
    const count_current_day = rows.map(r => r.year);
    res.json(count_current_day);

  } catch (err) {
    console.error("❌ Error fetching years:", err);
    res.status(500).json({ message: "Server error" });
  }
}

exports.getBorrowedBooksList = async (req, res) => {
  try {
    const sql = `SELECT count(*) FROM loan WHERE is_return = 0 AND return_date IS NULL`;
    const [rows] = opac.query(sql)
  } catch {

  }
}

exports.fetCurrentWeekVisitorVSLastWeek = async (req, res) => {
  try {
    const sql = ``;
    const [rows] = opac.query(sql)
  } catch {

  }
}

exports.getTotalBebasPustaka = async (req, res) => {
  try {
    const sql = ``
    const [rows] = bebaspustaka.query(sql)
  } catch {

  }
}