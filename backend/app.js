const express = require('express');
const path = require('path');
const cors = require('cors');
const { raw } = require('mysql2');

const authRoutes = require('./routes/authRoutes');
const verifyToken = require('./middleware/checktoken');
const keteranganRoute = require('./routes/keteranganRoutes');
const visitorcount = require('./routes/web');
const dashboardvisitorroutes = require('./routes/web');
const infoCardRoutes = require('./routes/UserInfoRoutes');
const { getYearlyVisitors } = require('./controller/visitorcount');
const {getDashboardDatVisitor} = require('./controller/visitorcount');

require('dotenv').config({ path: __dirname + '/../.env' });

const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use('/api/auth', authRoutes);

app.get('/yearly_visitor', verifyToken, getYearlyVisitors);

app.use('/api/dashboard', require('./routes/web'));

app.use('/api/loan',require('./routes/loanRouts'));

app.use('/api/landing',require('./routes/landing'));

app.use('/api/approval', require('./routes/bepus'));

app.use('/api/infoCard', require('./routes/infoCardRoutes'));

app.use('/api/profile',require('./routes/UserInfoRoutes'))

app.use('/api/logger',require('./routes/loggerRoutse'));

app.use("/api/summary", require("./routes/syncRoutes"));

app.use('/api/keterangan', keteranganRoute);

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});