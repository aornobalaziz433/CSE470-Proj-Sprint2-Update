const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:8000', 'http://127.0.0.1:8000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Database connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Email transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Validation middleware
const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('first_name').notEmpty().trim(),
  body('last_name').notEmpty().trim(),
  body('user_type').isIn(['client', 'professional', 'admin'])
];

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Send verification code
app.post('/api/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const now = Date.now();

    const connection = await pool.getConnection();
    await connection.execute(
      'REPLACE INTO codes (email, code, created_at) VALUES (?, ?, ?)',
      [email, code, now]
    );
    connection.release();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Verification Code - Hercules Pro',
      html: `
        <h2>Welcome to Hercules Pro!</h2>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      `
    });

    res.json({ success: true, message: 'Verification code sent' });
  } catch (error) {
    console.error('Send code error:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// Verify code
app.post('/api/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email and code required' });

    const connection = await pool.getConnection();
    const [results] = await connection.execute(
      'SELECT code, created_at FROM codes WHERE email = ?',
      [email]
    );
    connection.release();

    if (!results.length) {
      return res.status(400).json({ error: 'No code found for this email' });
    }

    const row = results[0];
    const now = Date.now();
    
    if (now - row.created_at > 10 * 60 * 1000) {
      const connection = await pool.getConnection();
      await connection.execute('DELETE FROM codes WHERE email = ?', [email]);
      connection.release();
      return res.status(400).json({ error: 'Code expired' });
    }

    if (row.code === code) {
      const connection = await pool.getConnection();
      await connection.execute('DELETE FROM codes WHERE email = ?', [email]);
      connection.release();
      return res.json({ success: true, message: 'Code verified successfully' });
    }

    res.status(400).json({ error: 'Invalid code' });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Register user
app.post('/api/register', validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, first_name, last_name, user_type } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const activation_code = Math.floor(100000 + Math.random() * 900000).toString();

    const connection = await pool.getConnection();
    await connection.execute(
      `INSERT INTO users (email, password, first_name, last_name, user_type, activation_code) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, first_name, last_name, user_type, activation_code]
    );
    connection.release();

    // Send activation email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Activate Your Hercules Pro Account',
      html: `
        <h2>Welcome to Hercules Pro!</h2>
        <p>Hi ${first_name},</p>
        <p>Your activation code is: <strong>${activation_code}</strong></p>
        <p>Please use this code to activate your account.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      `
    });

    res.json({ success: true, message: 'Registration successful. Please check your email for activation code.' });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const connection = await pool.getConnection();
    const [results] = await connection.execute(
      'SELECT * FROM users WHERE email = ? AND is_active = 1',
      [email]
    );
    connection.release();

    if (!results.length) {
      return res.status(401).json({ error: 'Invalid credentials or account not activated' });
    }

    const user = results[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        user_type: user.user_type 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    delete user.password;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.execute(
      'SELECT id, email, first_name, last_name, user_type, profile_image, date_of_birth, gender, height, weight, fitness_goal, activity_level, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    connection.release();

    if (!results.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user: results[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { first_name, last_name, date_of_birth, gender, height, weight, fitness_goal, activity_level } = req.body;
    
    const connection = await pool.getConnection();
    await connection.execute(
      `UPDATE users SET 
       first_name = ?, last_name = ?, date_of_birth = ?, gender = ?, 
       height = ?, weight = ?, fitness_goal = ?, activity_level = ?
       WHERE id = ?`,
      [first_name, last_name, date_of_birth, gender, height, weight, fitness_goal, activity_level, req.user.id]
    );
    connection.release();

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get training programs
app.get('/api/training-programs', authenticateToken, async (req, res) => {
  try {
    const { goal_type, difficulty_level } = req.query;
    let query = 'SELECT * FROM training_programs WHERE is_active = 1';
    const params = [];

    if (goal_type) {
      query += ' AND goal_type = ?';
      params.push(goal_type);
    }

    if (difficulty_level) {
      query += ' AND difficulty_level = ?';
      params.push(difficulty_level);
    }

    const connection = await pool.getConnection();
    const [results] = await connection.execute(query, params);
    connection.release();

    res.json({ success: true, programs: results });
  } catch (error) {
    console.error('Get training programs error:', error);
    res.status(500).json({ error: 'Failed to get training programs' });
  }
});

// Get specific training program with workouts
app.get('/api/training-programs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await pool.getConnection();
    
    // Get program details
    const [programResults] = await connection.execute(
      'SELECT * FROM training_programs WHERE id = ? AND is_active = 1',
      [id]
    );

    if (!programResults.length) {
      connection.release();
      return res.status(404).json({ error: 'Training program not found' });
    }

    // Get workouts for this program
    const [workoutResults] = await connection.execute(
      'SELECT * FROM workouts WHERE program_id = ? ORDER BY week_number, day_number',
      [id]
    );

    connection.release();

    res.json({
      success: true,
      program: programResults[0],
      workouts: workoutResults
    });
  } catch (error) {
    console.error('Get training program error:', error);
    res.status(500).json({ error: 'Failed to get training program' });
  }
});

// Get meal plans
app.get('/api/meal-plans', authenticateToken, async (req, res) => {
  try {
    const { goal_type } = req.query;
    let query = 'SELECT * FROM meal_plans WHERE is_active = 1';
    const params = [];

    if (goal_type) {
      query += ' AND goal_type = ?';
      params.push(goal_type);
    }

    const connection = await pool.getConnection();
    const [results] = await connection.execute(query, params);
    connection.release();

    res.json({ success: true, meal_plans: results });
  } catch (error) {
    console.error('Get meal plans error:', error);
    res.status(500).json({ error: 'Failed to get meal plans' });
  }
});

// Log workout completion
app.post('/api/workout-logs', authenticateToken, async (req, res) => {
  try {
    const { workout_id, duration_minutes, notes, rating } = req.body;
    
    if (!workout_id) {
      return res.status(400).json({ error: 'Workout ID required' });
    }

    const connection = await pool.getConnection();
    await connection.execute(
      'INSERT INTO workout_logs (user_id, workout_id, duration_minutes, notes, rating) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, workout_id, duration_minutes, notes, rating]
    );
    connection.release();

    res.json({ success: true, message: 'Workout logged successfully' });
  } catch (error) {
    console.error('Log workout error:', error);
    res.status(500).json({ error: 'Failed to log workout' });
  }
});

// Get user progress
app.get('/api/progress', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let query = 'SELECT * FROM user_progress WHERE user_id = ?';
    const params = [req.user.id];

    if (start_date && end_date) {
      query += ' AND date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    query += ' ORDER BY date DESC';

    const connection = await pool.getConnection();
    const [results] = await connection.execute(query, params);
    connection.release();

    res.json({ success: true, progress: results });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// Add progress entry
app.post('/api/progress', authenticateToken, async (req, res) => {
  try {
    const { date, weight, body_fat_percentage, muscle_mass, notes } = req.body;
    
    if (!date) {
      return res.status(400).json({ error: 'Date required' });
    }

    const connection = await pool.getConnection();
    await connection.execute(
      `INSERT INTO user_progress (user_id, date, weight, body_fat_percentage, muscle_mass, notes) 
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       weight = VALUES(weight), 
       body_fat_percentage = VALUES(body_fat_percentage), 
       muscle_mass = VALUES(muscle_mass), 
       notes = VALUES(notes)`,
      [req.user.id, date, weight, body_fat_percentage, muscle_mass, notes]
    );
    connection.release();

    res.json({ success: true, message: 'Progress updated successfully' });
  } catch (error) {
    console.error('Add progress error:', error);
    res.status(500).json({ error: 'Failed to add progress' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Hercules Pro server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
