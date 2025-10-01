const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./studyspot.db', (err) => {
  if (err) {
    console.error('Database error:', err);
  } else {
    console.log('Connected to database');
    // Create tables
    db.run(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER,
        user_name TEXT,
        start_time TEXT,
        end_time TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
});

// Test route
app.get('/', (req, res) => {
  res.send('🎉 StudySpot Backend is LIVE!');
});

// Add sample room
app.post('/add-room', (req, res) => {
  const { name } = req.body;
  db.run(
    "INSERT INTO rooms(name) VALUES (?)",
    [name || 'Library Room 1'],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Get all rooms
app.get('/rooms', (req, res) => {
  db.all("SELECT * FROM rooms", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Book a room
app.post('/book-room', express.json(), (req, res) => {
  const { room_id, user_name, start_time, end_time } = req.body;
  
  db.run(
    `INSERT INTO bookings(room_id, user_name, start_time, end_time)
     VALUES(?, ?, ?, ?)`,
    [room_id, user_name, start_time, end_time],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, booking_id: this.lastID });
    }
  );
});

// Get all bookings
app.get('/bookings', (req, res) => {
  db.all(`
    SELECT bookings.*, rooms.name as room_name 
    FROM bookings
    JOIN rooms ON bookings.room_id = rooms.id
    ORDER BY bookings.created_at DESC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Delete booking
app.delete('/bookings/:id', (req, res) => {
  db.run(
    "DELETE FROM bookings WHERE id = ?",
    [req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});