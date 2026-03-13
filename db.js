// โหลด environment variables จาก .env file
require('dotenv').config();

// นำเข้า PostgreSQL client
const { Pool } = require('pg');

// สร้าง connection pool สำหรับเชื่อมต่อกับ PostgreSQL database
// Pool จะจัดการ connections หลายตัวอย่างมีประสิทธิภาพ
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // เพิ่ม SSL config สำหรับ production database
  ssl: {
    rejectUnauthorized: false
  }
});

// ทดสอบการเชื่อมต่อกับ database
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

// จัดการ error ของ pool
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// ฟังก์ชันสำหรับสร้าง table ถ้ายังไม่มี
async function initDatabase() {
  try {
    // SQL query สำหรับสร้าง todos table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createTableQuery);
    console.log('✅ Database table "todos" is ready');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// Export pool และ initDatabase function
module.exports = {
  pool,
  initDatabase,
  // Helper function สำหรับ query
  query: (text, params) => pool.query(text, params)
};
