// นำเข้า Express framework
const express = require('express');
const path = require('path');

// สร้าง Express application
const app = express();

// กำหนด port จาก environment variable หรือใช้ 3000 เป็นค่า default
const PORT = process.env.PORT || 3000;

// Middleware สำหรับ parse JSON request body
app.use(express.json());

// Middleware สำหรับ serve static files จากโฟลเดอร์ public
// ไฟล์ HTML, CSS, JavaScript จะถูก serve จากโฟลเดอร์นี้
app.use(express.static(path.join(__dirname, 'public')));

// ข้อมูล todos ที่เก็บไว้ใน memory (จะหายเมื่อ restart server)
let todos = [
  { id: 1, text: 'ตัวอย่าง Todo รายการที่ 1', completed: false },
  { id: 2, text: 'ตัวอย่าง Todo รายการที่ 2', completed: true }
];

// Counter สำหรับสร้าง ID ใหม่
let nextId = 3;

// API Route: GET /api/todos - ดึงรายการ todos ทั้งหมด
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// API Route: POST /api/todos - สร้าง todo ใหม่
app.post('/api/todos', (req, res) => {
  const { text } = req.body;

  // ตรวจสอบว่ามีข้อความหรือไม่
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'กรุณาระบุข้อความ todo' });
  }

  // สร้าง todo ใหม่
  const newTodo = {
    id: nextId++,
    text: text.trim(),
    completed: false
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// API Route: PUT /api/todos/:id - อัพเดท todo (toggle completed หรือแก้ไขข้อความ)
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { completed, text } = req.body;

  // ค้นหา todo ที่ต้องการแก้ไข
  const todo = todos.find(t => t.id === id);

  if (!todo) {
    return res.status(404).json({ error: 'ไม่พบ todo ที่ต้องการ' });
  }

  // อัพเดทค่า
  if (completed !== undefined) {
    todo.completed = completed;
  }

  if (text !== undefined && text.trim() !== '') {
    todo.text = text.trim();
  }

  res.json(todo);
});

// API Route: DELETE /api/todos/:id - ลบ todo
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'ไม่พบ todo ที่ต้องการลบ' });
  }

  // ลบ todo ออกจาก array
  todos.splice(index, 1);
  res.status(204).send();
});

// เริ่มต้น server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
