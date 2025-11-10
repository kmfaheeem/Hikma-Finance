import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Resolve database path - works in both development (tsx) and production (compiled)
const getDbPath = () => {
  if (process.env.DATABASE_PATH) {
    return process.env.DATABASE_PATH;
  }
  
  // In development with tsx, __dirname points to src/database
  // In production, __dirname points to dist/database
  // Try both locations
  const possiblePaths = [
    path.join(process.cwd(), 'finance.db'), // Root of backend directory
    path.join(__dirname, '../../finance.db'), // Relative to current file
  ];
  
  // Use the first path (root of backend directory)
  return possiblePaths[0];
};

const dbPath = getDbPath();
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initializeDatabase() {
  // Users table (for role management, linked to Firebase UID)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK(role IN ('admin', 'student')),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Students table
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      accountBalance REAL DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Classes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      accountBalance REAL DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // StudentFunds table (transactions)
  db.exec(`
    CREATE TABLE IF NOT EXISTS studentFunds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId INTEGER NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('deposit', 'withdrawal')),
      date TEXT NOT NULL,
      reason TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
    )
  `);

  // ClassFunds table (transactions)
  db.exec(`
    CREATE TABLE IF NOT EXISTS classFunds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      classId INTEGER NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('deposit', 'withdrawal')) DEFAULT 'deposit',
      date TEXT NOT NULL,
      reason TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_studentFunds_studentId ON studentFunds(studentId);
    CREATE INDEX IF NOT EXISTS idx_studentFunds_date ON studentFunds(date);
    CREATE INDEX IF NOT EXISTS idx_classFunds_classId ON classFunds(classId);
    CREATE INDEX IF NOT EXISTS idx_classFunds_date ON classFunds(date);
  `);

  console.log('Database initialized successfully');
}

// Seed initial data (3 admins, 30 students)
export function seedDatabase() {
  // Check if data already exists
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('admin') as { count: number };
  
  if (adminCount.count === 0) {
    // Insert 3 admin users (these would be linked to Firebase UIDs in production)
    const insertUser = db.prepare('INSERT INTO users (id, email, role) VALUES (?, ?, ?)');
    
    for (let i = 1; i <= 3; i++) {
      insertUser.run(`admin-${i}`, `admin${i}@finance.com`, 'admin');
    }

    // Insert 30 student users
    for (let i = 1; i <= 30; i++) {
      insertUser.run(`student-${i}`, `student${i}@finance.com`, 'student');
    }

    console.log('Database seeded with initial users');
  }
}

export default db;

