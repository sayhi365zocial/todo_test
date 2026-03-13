// โหลด environment variables
require('dotenv').config();

// นำเข้า Express framework
const express = require('express');
const path = require('path');

// นำเข้า database module
const { query, initDatabase } = require('./db');

// สร้าง Express application
const app = express();

// กำหนด port จาก environment variable หรือใช้ 3000 เป็นค่า default
const PORT = process.env.PORT || 3000;

// Middleware สำหรับ parse JSON request body
app.use(express.json());

// Middleware สำหรับ serve static files จากโฟลเดอร์ public
// ไฟล์ HTML, CSS, JavaScript จะถูก serve จากโฟลเดอร์นี้
app.use(express.static(path.join(__dirname, 'public')));

// ===============================
// API Routes
// ===============================

// API Route: GET /api/todos - ดึงรายการ todos ทั้งหมดจาก database
app.get('/api/todos', async (req, res) => {
  try {
    // Query ข้อมูลทั้งหมดจาก database เรียงตาม created_at
    const result = await query(
      'SELECT id, text, completed, created_at, updated_at FROM todos ORDER BY created_at DESC'
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลได้' });
  }
});

// API Route: POST /api/todos - สร้าง todo ใหม่ใน database
app.post('/api/todos', async (req, res) => {
  try {
    const { text } = req.body;

    // ตรวจสอบว่ามีข้อความหรือไม่
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'กรุณาระบุข้อความ todo' });
    }

    // Insert todo ใหม่เข้า database และ return ข้อมูลที่สร้าง
    const result = await query(
      'INSERT INTO todos (text, completed) VALUES ($1, $2) RETURNING id, text, completed, created_at, updated_at',
      [text.trim(), false]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'ไม่สามารถสร้าง todo ได้' });
  }
});

// API Route: PUT /api/todos/:id - อัพเดท todo (toggle completed หรือแก้ไขข้อความ)
app.put('/api/todos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { completed, text } = req.body;

    // ตรวจสอบว่า todo นี้มีอยู่ใน database หรือไม่
    const checkResult = await query('SELECT * FROM todos WHERE id = $1', [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบ todo ที่ต้องการ' });
    }

    // สร้าง query สำหรับ update
    let updateQuery = 'UPDATE todos SET updated_at = CURRENT_TIMESTAMP';
    const values = [];
    let paramCount = 1;

    // อัพเดทค่า completed ถ้ามีการส่งมา
    if (completed !== undefined) {
      updateQuery += `, completed = $${paramCount}`;
      values.push(completed);
      paramCount++;
    }

    // อัพเดทค่า text ถ้ามีการส่งมา
    if (text !== undefined && text.trim() !== '') {
      updateQuery += `, text = $${paramCount}`;
      values.push(text.trim());
      paramCount++;
    }

    // เพิ่ม WHERE clause และ RETURNING
    updateQuery += ` WHERE id = $${paramCount} RETURNING id, text, completed, created_at, updated_at`;
    values.push(id);

    // Execute update query
    const result = await query(updateQuery, values);

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'ไม่สามารถอัพเดท todo ได้' });
  }
});

// API Route: DELETE /api/todos/:id - ลบ todo จาก database
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // ลบ todo จาก database
    const result = await query('DELETE FROM todos WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบ todo ที่ต้องการลบ' });
    }

    res.status(204).send();

  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'ไม่สามารถลบ todo ได้' });
  }
});

// ===============================
// Initialize และเริ่มต้น Server
// ===============================

// ฟังก์ชันสำหรับเริ่มต้น server
async function startServer() {
  try {
    // Initialize database และสร้าง table
    await initDatabase();

    // เริ่มต้น server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📊 Using PostgreSQL database`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// เรียกใช้ฟังก์ชันเริ่มต้น server
startServer();
