// Get elements from DOM
const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");

const totalCountEl = document.getElementById("total-count");
const completedCountEl = document.getElementById("completed-count");
const pendingCountEl = document.getElementById("pending-count");

const themeToggleBtn = document.getElementById("theme-toggle");

// Array to hold tasks in memory
let tasks = [];

// ---------------------
// THEME HANDLING
// ---------------------
function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
    themeToggleBtn.textContent = "☀️ Light";
  } else {
    document.body.classList.remove("dark");
    themeToggleBtn.textContent = "🌙 Dark";
  }
}

themeToggleBtn.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark");
  const newTheme = isDark ? "light" : "dark";
  applyTheme(newTheme);
  localStorage.setItem("theme", newTheme);
});

// ---------------------
// Load tasks & theme on startup
// ---------------------
window.addEventListener("DOMContentLoaded", () => {
  // Load tasks
  const saved = localStorage.getItem("tasks");
  if (saved) {
    tasks = JSON.parse(saved);
    tasks.forEach(task => {
      addTaskToDOM(task);
    });
  }
  updateCounts();

  // Load theme
  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme);
});

// ---------------------
// Helper: Save to storage
// ---------------------
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ---------------------
// Helper: Update counters
// ---------------------
function updateCounts() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;

  totalCountEl.textContent = `Total: ${total}`;
  completedCountEl.textContent = `Completed: ${completed}`;
  pendingCountEl.textContent = `Pending: ${pending}`;
}

// ---------------------
// Helper: Create DOM element for a task
// ---------------------
function addTaskToDOM(task) {
  const li = document.createElement("li");
  li.className = "task-item";
  li.dataset.id = task.id;

  const leftDiv = document.createElement("div");
  leftDiv.className = "task-left";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;

  const span = document.createElement("span");
  span.className = "task-text";
  span.textContent = task.text;
  if (task.completed) {
    span.classList.add("completed");
  }

  leftDiv.appendChild(checkbox);
  leftDiv.appendChild(span);

  const actionsDiv = document.createElement("div");
  actionsDiv.className = "task-actions";

  const completeBtn = document.createElement("button");
  completeBtn.textContent = "Done";
  completeBtn.className = "complete-btn";

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.className = "edit-btn";

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.className = "delete-btn";

  actionsDiv.appendChild(completeBtn);
  actionsDiv.appendChild(editBtn);
  actionsDiv.appendChild(deleteBtn);

  li.appendChild(leftDiv);
  li.appendChild(actionsDiv);
  taskList.appendChild(li);

  // Event: checkbox toggle
  checkbox.addEventListener("change", () => {
    toggleTask(task.id);
  });

  // Event: complete button
  completeBtn.addEventListener("click", () => {
    toggleTask(task.id);
  });

  // Event: edit button
  editBtn.addEventListener("click", () => {
    const newText = prompt("Edit task:", task.text);
    if (newText !== null) {
      const trimmed = newText.trim();
      if (trimmed !== "") {
        editTask(task.id, trimmed);
      }
    }
  });

  // Event: delete button
  deleteBtn.addEventListener("click", () => {
    deleteTask(task.id);
  });
}

// ---------------------
// Add new task (logic + DOM)
// ---------------------
function createTask(text) {
  const trimmed = text.trim();
  if (trimmed === "") return;

  const task = {
    id: Date.now(),         // unique id
    text: trimmed,
    completed: false
  };

  tasks.push(task);
  saveTasks();
  addTaskToDOM(task);
  updateCounts();
}

// ---------------------
// Toggle task completed
// ---------------------
function toggleTask(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });

  saveTasks();
  renderTasks();
}

// ---------------------
// Edit task text
// ---------------------
function editTask(id, newText) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, text: newText };
    }
    return task;
  });

  saveTasks();
  renderTasks();
}

// ---------------------
// Delete task
// ---------------------
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

// ---------------------
// Render all tasks again
// ---------------------
function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach(task => addTaskToDOM(task));
  updateCounts();
}

// ---------------------
// Event listeners: add task
// ---------------------

// Button click
addTaskBtn.addEventListener("click", () => {
  createTask(taskInput.value);
  taskInput.value = "";
  taskInput.focus();
});

// Enter key in input
taskInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    createTask(taskInput.value);
    taskInput.value = "";
    taskInput.focus();
  }
});
