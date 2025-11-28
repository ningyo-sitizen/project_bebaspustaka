const express = require('express');
const path = require('path');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const visitorcount = require('./routes/web')
const infoCardRoutes = require('./routes/UserInfoRoutes')
const verifyToken = require('./middleware/checktoken');
const { getYearlyVisitors } = require('./controller/visitorcount');
const {getDashboardDatVisitor} = require('./controller/visitorcount')
const dashboardvisitorroutes = require('./routes/web');
const { raw } = require('mysql2');
require('dotenv').config({ path: __dirname + '/../.env' });

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/yearly_visitor', verifyToken, getYearlyVisitors);

app.use('/api/dashboard', require('./routes/web'));

app.use('/api/loan',require('./routes/loanRouts'));

app.use('/api/landing',require('./routes/landing'));

app.use('/api/infoCard', require('./routes/infoCardRoutes'));

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});