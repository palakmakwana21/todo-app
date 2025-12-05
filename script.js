// ------- DOM elements -------
const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");

const totalCountEl = document.getElementById("total-count");
const completedCountEl = document.getElementById("completed-count");
const pendingCountEl = document.getElementById("pending-count");

const themeToggleBtn = document.getElementById("theme-toggle");

const searchInput = document.getElementById("search-input");
const filterButtons = document.querySelectorAll(".filter-btn");
const sortSelect = document.getElementById("sort-select");

const categorySelect = document.getElementById("category-select");
const prioritySelect = document.getElementById("priority-select");
const dueDateInput = document.getElementById("due-date-input");
const notesInput = document.getElementById("notes-input");

// ------- state -------
let tasks = [];
let currentFilter = "all";        // all | pending | completed | today
let currentSearch = "";
let currentSort = "created-desc"; // created-desc | created-asc | alpha-asc | alpha-desc | due-asc

// ------- helpers: dates -------

function getTodayString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ------- theme handling -------

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

// ------- load initial data -------

window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("tasks");
  if (saved) {
    tasks = JSON.parse(saved);
  }
  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme);
  renderTasks();
  updateCounts();
});

// ------- storage -------

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ------- counts -------

function updateCounts() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;

  totalCountEl.textContent = `Total: ${total}`;
  completedCountEl.textContent = `Completed: ${completed}`;
  pendingCountEl.textContent = `Pending: ${pending}`;
}

// ------- filtering, searching, sorting -------

function getVisibleTasks() {
  const today = getTodayString();

  let filtered = tasks.filter(task => {
    // filter by status
    if (currentFilter === "completed" && !task.completed) return false;
    if (currentFilter === "pending" && task.completed) return false;
    if (currentFilter === "today") {
      if (!task.dueDate || task.dueDate !== today) return false;
    }

    // filter by search
    if (currentSearch) {
      const query = currentSearch.toLowerCase();
      const inTitle = task.text.toLowerCase().includes(query);
      const inNotes = (task.notes || "").toLowerCase().includes(query);
      if (!inTitle && !inNotes) return false;
    }

    return true;
  });

  // sorting
  filtered.sort((a, b) => {
    switch (currentSort) {
      case "created-asc":
        return (a.createdAt || 0) - (b.createdAt || 0);
      case "created-desc":
        return (b.createdAt || 0) - (a.createdAt || 0);
      case "alpha-asc":
        return a.text.localeCompare(b.text);
      case "alpha-desc":
        return b.text.localeCompare(a.text);
      case "due-asc":
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      default:
        return 0;
    }
  });

  return filtered;
}

// ------- rendering -------

function clearTaskList() {
  taskList.innerHTML = "";
}

function renderTasks() {
  clearTaskList();
  const visible = getVisibleTasks();
  visible.forEach(task => addTaskToDOM(task));
}

// ------- create task DOM -------

function addTaskToDOM(task) {
  const li = document.createElement("li");
  li.className = "task-item";
  li.dataset.id = task.id;

  const leftDiv = document.createElement("div");
  leftDiv.className = "task-left";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;

  const mainDiv = document.createElement("div");
  mainDiv.className = "task-main";

  const headerRow = document.createElement("div");
  headerRow.className = "task-header-row";

  const span = document.createElement("span");
  span.className = "task-text";
  span.textContent = task.text;
  if (task.completed) {
    span.classList.add("completed");
  }

  // badges
  const categoryBadge = document.createElement("span");
  categoryBadge.className = "badge badge-category";
  categoryBadge.textContent = task.category || "Other";

  const priorityBadge = document.createElement("span");
  const priorityClass =
    task.priority === "high"
      ? "priority-high"
      : task.priority === "low"
      ? "priority-low"
      : "priority-medium";
  priorityBadge.className = `badge ${priorityClass}`;
  priorityBadge.textContent =
    task.priority === "high"
      ? "High"
      : task.priority === "low"
      ? "Low"
      : "Medium";

  headerRow.appendChild(span);
  headerRow.appendChild(categoryBadge);
  headerRow.appendChild(priorityBadge);

  mainDiv.appendChild(headerRow);

  const metaRow = document.createElement("div");
  metaRow.className = "task-meta";

  // due date badge
  if (task.dueDate) {
    const dueBadge = document.createElement("span");
    const today = getTodayString();
    const overdue = !task.completed && task.dueDate < today;
    dueBadge.className = "badge " + (overdue ? "badge-overdue" : "badge-due");
    dueBadge.textContent = overdue
      ? `Overdue: ${task.dueDate}`
      : `Due: ${task.dueDate}`;
    metaRow.appendChild(dueBadge);
  }

  const createdText = document.createElement("span");
  createdText.className = "meta-text";

  // ✅ Fix: handle missing createdAt for old tasks
  const createdDate = task.createdAt
    ? new Date(task.createdAt)
    : new Date();

  createdText.textContent = `Created: ${createdDate.toLocaleDateString()}`;
  metaRow.appendChild(createdText);

  mainDiv.appendChild(metaRow);

  if (task.notes && task.notes.trim() !== "") {
    const notesEl = document.createElement("div");
    notesEl.className = "task-notes";
    notesEl.textContent = task.notes;
    mainDiv.appendChild(notesEl);
  }

  leftDiv.appendChild(checkbox);
  leftDiv.appendChild(mainDiv);

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

  // events
  checkbox.addEventListener("change", () => {
    toggleTask(task.id);
  });

  completeBtn.addEventListener("click", () => {
    toggleTask(task.id);
  });

  editBtn.addEventListener("click", () => {
    handleEditTask(task.id);
  });

  deleteBtn.addEventListener("click", () => {
    deleteTask(task.id);
  });
}

// ------- CRUD operations -------

function createTask(text, category, priority, dueDate, notes) {
  const trimmed = text.trim();
  if (trimmed === "") return;

  const task = {
    id: Date.now(),
    text: trimmed,
    completed: false,
    category: category || "Other",
    priority: priority || "medium",
    dueDate: dueDate || "",
    notes: notes || "",
    createdAt: Date.now()
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  updateCounts();
}

function toggleTask(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });
  saveTasks();
  renderTasks();
  updateCounts();
}

function handleEditTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const newTitle = prompt("Edit task title:", task.text);
  if (newTitle === null) return; // cancelled
  const trimmedTitle = newTitle.trim();
  if (trimmedTitle === "") return;

  const newNotes = prompt(
    "Edit notes (leave empty for none):",
    task.notes || ""
  );
  if (newNotes === null) return; // cancelled

  tasks = tasks.map(t => {
    if (t.id === id) {
      return { ...t, text: trimmedTitle, notes: newNotes };
    }
    return t;
  });

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
  updateCounts();
}

// ------- event listeners -------

// Add task button
addTaskBtn.addEventListener("click", () => {
  createTask(
    taskInput.value,
    categorySelect.value,
    prioritySelect.value,
    dueDateInput.value,
    notesInput.value
  );

  taskInput.value = "";
  notesInput.value = "";
  dueDateInput.value = "";
  taskInput.focus();
});

// Enter key on main task input
taskInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    createTask(
      taskInput.value,
      categorySelect.value,
      prioritySelect.value,
      dueDateInput.value,
      notesInput.value
    );

    taskInput.value = "";
    notesInput.value = "";
    dueDateInput.value = "";
    taskInput.focus();
  }
});

// Search input
searchInput.addEventListener("input", (e) => {
  currentSearch = e.target.value.trim();
  renderTasks();
});

// Filter buttons
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Sort select
sortSelect.addEventListener("change", (e) => {
  currentSort = e.target.value;
  renderTasks();
});
