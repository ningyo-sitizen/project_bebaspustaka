const express = require('express');
const path = require('path');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const visitorcount = require('./routes/web')
const verifyToken = require('./middleware/checktoken');
const { getYearlyVisitors } = require('./controller/visitorcount');
const {getDashboardDatVisitor} = require('./controller/visitorcount')
const dashboardvisitorroutes = require('./routes/web');
require('dotenv').config({ path: __dirname + '/../.env' });

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);

app.get('/yearly_visitor', verifyToken, getYearlyVisitors);

app.use('/api/dashboard', require('./routes/web'));
app.use('/api', require('./routes/web')); 

app.use('/api/loan',require('./routes/loanRouts'))

app.use('/api/landing',require('./routes/landing'));


app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});