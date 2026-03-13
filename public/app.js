// ===============================
// ตัวแปร Global
// ===============================

// ดึง elements จาก DOM
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');

// เก็บสถานะ filter ปัจจุบัน (all, active, completed)
let currentFilter = 'all';

// เก็บข้อมูล todos ทั้งหมด
let todos = [];

// ===============================
// API Functions
// ===============================

/**
 * ดึงรายการ todos ทั้งหมดจาก server
 */
async function fetchTodos() {
    try {
        const response = await fetch('/api/todos');
        const data = await response.json();
        todos = data;
        renderTodos();
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
        showError('ไม่สามารถดึงข้อมูลได้');
    }
}

/**
 * เพิ่ม todo ใหม่ไปยัง server
 * @param {string} text - ข้อความของ todo
 */
async function addTodo(text) {
    try {
        const response = await fetch('/api/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            throw new Error('ไม่สามารถเพิ่ม todo ได้');
        }

        const newTodo = await response.json();
        todos.push(newTodo);
        renderTodos();
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการเพิ่ม todo:', error);
        showError('ไม่สามารถเพิ่มรายการได้');
    }
}

/**
 * อัพเดท todo (toggle completed status)
 * @param {number} id - ID ของ todo
 * @param {boolean} completed - สถานะ completed ใหม่
 */
async function toggleTodo(id, completed) {
    try {
        const response = await fetch(`/api/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed })
        });

        if (!response.ok) {
            throw new Error('ไม่สามารถอัพเดท todo ได้');
        }

        const updatedTodo = await response.json();

        // อัพเดทข้อมูลใน array
        const index = todos.findIndex(t => t.id === id);
        if (index !== -1) {
            todos[index] = updatedTodo;
            renderTodos();
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการอัพเดท todo:', error);
        showError('ไม่สามารถอัพเดทรายการได้');
    }
}

/**
 * ลบ todo
 * @param {number} id - ID ของ todo ที่ต้องการลบ
 */
async function deleteTodo(id) {
    try {
        const response = await fetch(`/api/todos/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('ไม่สามารถลบ todo ได้');
        }

        // ลบออกจาก array
        todos = todos.filter(t => t.id !== id);
        renderTodos();
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบ todo:', error);
        showError('ไม่สามารถลบรายการได้');
    }
}

// ===============================
// Render Functions
// ===============================

/**
 * แสดงรายการ todos บนหน้าจอตาม filter ที่เลือก
 */
function renderTodos() {
    // กรองข้อมูลตาม filter
    let filteredTodos = todos;

    if (currentFilter === 'active') {
        filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
    }

    // ล้างรายการเดิม
    todoList.innerHTML = '';

    // ถ้าไม่มีข้อมูล แสดง empty state
    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<li class="empty-state">ไม่มีรายการ</li>';
        return;
    }

    // สร้าง element สำหรับแต่ละ todo
    filteredTodos.forEach(todo => {
        const li = createTodoElement(todo);
        todoList.appendChild(li);
    });
}

/**
 * สร้าง element สำหรับ todo แต่ละรายการ
 * @param {Object} todo - ข้อมูล todo
 * @returns {HTMLElement} - element ที่สร้างขึ้น
 */
function createTodoElement(todo) {
    // สร้าง li element
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

    // สร้าง checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => {
        toggleTodo(todo.id, checkbox.checked);
    });

    // สร้างข้อความ
    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = todo.text;

    // สร้างปุ่มลบ
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'ลบ';
    deleteBtn.addEventListener('click', () => {
        if (confirm('ต้องการลบรายการนี้?')) {
            deleteTodo(todo.id);
        }
    });

    // รวม elements เข้าด้วยกัน
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);

    return li;
}

/**
 * แสดงข้อความ error (สามารถปรับปรุงให้สวยงามได้)
 * @param {string} message - ข้อความที่ต้องการแสดง
 */
function showError(message) {
    alert(message);
}

// ===============================
// Event Handlers
// ===============================

/**
 * จัดการเมื่อกดปุ่มเพิ่ม todo
 */
function handleAddTodo() {
    const text = todoInput.value.trim();

    // ตรวจสอบว่ามีข้อความหรือไม่
    if (text === '') {
        alert('กรุณาใส่ข้อความ');
        return;
    }

    // เพิ่ม todo
    addTodo(text);

    // ล้างช่อง input
    todoInput.value = '';
}

/**
 * จัดการเมื่อคลิกปุ่ม filter
 * @param {Event} e - Event object
 */
function handleFilterClick(e) {
    // เอา active class ออกจากปุ่มทั้งหมด
    filterBtns.forEach(btn => btn.classList.remove('active'));

    // เพิ่ม active class ให้กับปุ่มที่ถูกคลิก
    e.target.classList.add('active');

    // อัพเดท filter
    currentFilter = e.target.dataset.filter;

    // render ใหม่
    renderTodos();
}

// ===============================
// Event Listeners
// ===============================

// เมื่อกดปุ่ม "เพิ่ม"
addBtn.addEventListener('click', handleAddTodo);

// เมื่อกด Enter ในช่อง input
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleAddTodo();
    }
});

// เมื่อคลิกปุ่ม filter
filterBtns.forEach(btn => {
    btn.addEventListener('click', handleFilterClick);
});

// ===============================
// Initialization
// ===============================

// โหลดข้อมูลเมื่อเริ่มต้น
fetchTodos();
