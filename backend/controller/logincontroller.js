const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { bebaspustaka } = require('../config');
const path = require('path');
require('dotenv').config({ path: __dirname + '/../.env' });




exports.register = async (req, res) => {
  const { name, password, role } = req.body;
  if (!name || !password || !role)
    return res.status(400).json({ message: 'All fields required' });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
    await bebaspustaka.query(sql, [name, hashed, role]); // ✅ pakai await
    console.log(`✅ User registered: ${name} (${role})`);
    res.json({ message: '✅ User registered successfully' });
  } catch (err) {
    console.error('❌ Register error:', err);
    res.status(500).json({ message: 'Database or server error' });
  }
};

exports.login = async (req, res) => {
  console.log('🟡 Login API hit');
  console.log('🟢 Body received:', req.body);

  const { name, password } = req.body;
  console.log('🟡 Login attempt from', name);

  const sql = 'SELECT * FROM users WHERE username = ?';
  console.log('🟢 Running SQL:', sql, 'with value:', name);

  try {
    const [results] = await bebaspustaka.query(sql, [name]);

    console.log('🟢 SQL result:', results);

    if (!results || results.length === 0) {
      console.warn('⚠️ No user found for', name);
      return res.status(401).json({ message: 'Invalid name or password' });
    }

    const user = results[0];
    console.log('🟢 User found:', user);

    const valid = await bcrypt.compare(password, user.PASSWORD);
    console.log('🟢 Password compare result:', valid);

    if (!valid) {
      console.warn('⚠️ Invalid password for', name);
      return res.status(401).json({ message: 'Invalid name or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('✅ Login success for', name);

    return res.status(200).json({
      message: '✅ Login successful',
      token,
      user: {
        name: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('❌ Error in login:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
