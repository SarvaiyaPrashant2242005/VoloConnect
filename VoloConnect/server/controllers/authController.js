const pool = require('../config/database');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  const { email, password, first_name, last_name, organization, skills, phone } = req.body;

  try {
    // Validate required fields
    if (!email || !password || !first_name || !last_name || !organization || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email already exists
    const [existing] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Parse skills if it's a string
    const skillsArray = typeof skills === 'string' ? JSON.parse(skills) : skills;

    // Insert new user
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, first_name, last_name, organization, skills, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [email, hashedPassword, first_name, last_name, organization, JSON.stringify(skillsArray), phone]
    );

    // Get the created user without password
    const [newUser] = await pool.execute(
      'SELECT id, email, first_name, last_name, organization, phone, skills FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser[0]
    });
  } catch (error) {
    console.error('Register Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already registered' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log('Attempting login for email:', email);
    
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    console.log('Database query result:', rows.length > 0 ? 'User found' : 'User not found');

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];
    console.log('Stored password hash:', user.password);
    console.log('Attempting to compare passwords...');
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Parse skills if it's a string
    if (typeof user.skills === 'string') {
      user.skills = JSON.parse(user.skills);
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login successful",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
