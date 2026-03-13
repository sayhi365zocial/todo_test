// ===============================
// DOM Elements
// ===============================

const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');

// Counter elements
const taskCount = document.getElementById('taskCount');
const completedCount = document.getElementById('completedCount');
const totalCount = document.getElementById('totalCount');

// ===============================
// API Functions
// ===============================

/**
 * GET /api/todos - โหลดรายการ todos ทั้งหมดจาก server
 */
async function loadTodos() {
  try {
    const response = await fetch('/api/todos');

    if (!response.ok) {
      throw new Error('Failed to load todos');
    }

    const todos = await response.json();
    renderTodos(todos);
    updateTaskCount(todos);

  } catch (error) {
    console.error('Error loading todos:', error);
    alert('ไม่สามารถโหลดรายการได้');
  }
}

/**
 * POST /api/todos - เพิ่ม todo ใหม่
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
      throw new Error('Failed to add todo');
    }

    // Refresh รายการใหม่
    await loadTodos();

  } catch (error) {
    console.error('Error adding todo:', error);
    alert('ไม่สามารถเพิ่มรายการได้');
  }
}

/**
 * PUT /api/todos/:id - Toggle done/undone
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
      throw new Error('Failed to toggle todo');
    }

    // Refresh รายการใหม่
    await loadTodos();

  } catch (error) {
    console.error('Error toggling todo:', error);
    alert('ไม่สามารถอัพเดทรายการได้');
  }
}

/**
 * DELETE /api/todos/:id - ลบ todo
 * @param {number} id - ID ของ todo ที่ต้องการลบ
 */
async function deleteTodo(id) {
  try {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete todo');
    }

    // Refresh รายการใหม่
    await loadTodos();

  } catch (error) {
    console.error('Error deleting todo:', error);
    alert('ไม่สามารถลบรายการได้');
  }
}

// ===============================
// Render Functions
// ===============================

/**
 * Render รายการ todos บนหน้าจอ
 * @param {Array} todos - array ของ todos
 */
function renderTodos(todos) {
  // ล้างรายการเดิม
  todoList.innerHTML = '';

  // ถ้าไม่มีรายการ แสดง empty state
  if (todos.length === 0) {
    todoList.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  // แสดง list และซ่อน empty state
  todoList.classList.remove('hidden');
  emptyState.classList.add('hidden');

  // สร้าง element สำหรับแต่ละ todo
  todos.forEach(todo => {
    const li = createTodoItem(todo);
    todoList.appendChild(li);
  });
}

/**
 * สร้าง element สำหรับ todo แต่ละรายการ
 * @param {Object} todo - ข้อมูล todo { id, text, completed }
 * @returns {HTMLElement} - li element
 */
function createTodoItem(todo) {
  // สร้าง li element
  const li = document.createElement('li');
  li.className = 'todo-item bg-secondary rounded-2xl border border-stroke p-4 flex items-center gap-4 hover:shadow-sm transition-all duration-200';

  // Checkbox container
  const checkboxContainer = document.createElement('div');
  checkboxContainer.className = 'flex-shrink-0';

  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'w-5 h-5 rounded border-stroke text-primary focus:ring-2 focus:ring-primary cursor-pointer';
  checkbox.checked = todo.completed;

  // Event: เมื่อ checkbox ถูกคลิก -> toggle todo
  checkbox.addEventListener('change', () => {
    toggleTodo(todo.id, checkbox.checked);
  });

  checkboxContainer.appendChild(checkbox);

  // Text container
  const textContainer = document.createElement('div');
  textContainer.className = 'flex-1 min-w-0';

  const span = document.createElement('span');
  span.className = todo.completed
    ? 'text-text-secondary line-through break-words'
    : 'text-dark font-medium break-words';
  span.textContent = todo.text;

  textContainer.appendChild(span);

  // Status badge
  const badge = document.createElement('span');
  if (todo.completed) {
    badge.className = 'flex-shrink-0 px-3 py-1 bg-success/10 text-success text-xs font-semibold rounded-lg';
    badge.textContent = 'Completed';
  } else {
    badge.className = 'flex-shrink-0 px-3 py-1 bg-warning/10 text-warning text-xs font-semibold rounded-lg';
    badge.textContent = 'Active';
  }

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'flex-shrink-0 bg-danger/10 hover:bg-danger text-danger hover:text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 text-sm';
  deleteBtn.innerHTML = `
    <svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
    </svg>
    <span class="hidden sm:inline">Delete</span>
  `;

  // Event: เมื่อ delete button ถูกคลิก -> ลบ todo
  deleteBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTodo(todo.id);
    }
  });

  // รวม elements เข้าด้วยกัน
  li.appendChild(checkboxContainer);
  li.appendChild(textContainer);
  li.appendChild(badge);
  li.appendChild(deleteBtn);

  return li;
}

/**
 * Update จำนวน task ที่เหลือ และ completed
 * @param {Array} todos - array ของ todos
 */
function updateTaskCount(todos) {
  // นับจำนวน tasks ที่ยังไม่เสร็จ (active)
  const activeTasks = todos.filter(t => !t.completed).length;

  // นับจำนวน tasks ที่เสร็จแล้ว
  const completedTasks = todos.filter(t => t.completed).length;

  // นับจำนวน tasks ทั้งหมด
  const total = todos.length;

  // อัพเดทใน DOM
  taskCount.textContent = activeTasks;
  completedCount.textContent = completedTasks;
  totalCount.textContent = total;
}

// ===============================
// Event Handlers
// ===============================

/**
 * Handle เมื่อกดปุ่ม Add Task
 */
function handleAddTask() {
  const text = todoInput.value.trim();

  // ตรวจสอบว่ามีข้อความหรือไม่
  if (text === '') {
    // แสดง visual feedback
    todoInput.classList.add('border-danger');
    setTimeout(() => {
      todoInput.classList.remove('border-danger');
    }, 1000);
    return;
  }

  // เพิ่ม todo
  addTodo(text);

  // ล้าง input
  todoInput.value = '';
  todoInput.focus();

  // แสดง success feedback
  addBtn.textContent = '✓ Added!';
  setTimeout(() => {
    addBtn.innerHTML = '<span class="hidden md:inline">Add Task</span><span class="md:hidden">Add</span>';
  }, 1000);
}

// ===============================
// Event Listeners
// ===============================

// Event: คลิกปุ่ม Add Task
addBtn.addEventListener('click', handleAddTask);

// Event: กด Enter ในช่อง input
todoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleAddTask();
  }
});

// ===============================
// Initialization
// ===============================

// โหลดรายการ todos เมื่อเริ่มต้น
loadTodos();

// Focus input field เมื่อโหลดหน้าเสร็จ
window.addEventListener('load', () => {
  todoInput.focus();
});
