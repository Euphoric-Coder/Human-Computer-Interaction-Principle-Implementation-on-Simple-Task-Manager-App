let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
let sortMode = "newest";
let confirmAction = null;

// Feedback Function - shows Feedback Banner
function showFeedback(msg, type = "success") {
  const fb = document.getElementById("feedback");
  fb.textContent = msg;
  fb.className = `feedback show ${type}`;
  setTimeout(() => fb.classList.remove("show"), 2500);
}

// Open Confirmation Modal
function openConfirm(title, msg, onConfirm) {
  document.getElementById("confirmTitle").textContent = title;
  document.getElementById("confirmMessage").textContent = msg;
  confirmAction = onConfirm;
  document.getElementById("confirmModal").classList.add("show");
}

// Close Confirmation Modal
function closeConfirm() {
  document.getElementById("confirmModal").classList.remove("show");
  confirmAction = null;
}

// Confirmation & Cancel Modal Buttons
document.getElementById("confirmCancelBtn").onclick = closeConfirm;
document.getElementById("confirmConfirmBtn").onclick = () => {
  if (confirmAction) confirmAction();
  closeConfirm();
};

// Fetches and renders tasks
function renderTasks() {
  const list = document.getElementById("taskList");
  const empty = document.getElementById("emptyState");
  list.innerHTML = "";
  if (!tasks.length) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";
  sortTasks();

  // Render each task
  tasks.forEach((task) => {
    const div = document.createElement("div");
    div.className = `task-item ${task.completed ? "completed" : ""}`;

    // Editing Input Fields with Save/Cancel Buttons
    if (task.editing) {
      div.innerHTML = `
        <div class="edit-inputs">
          <label>Title</label>
          <input type="text" value="${task.title}" class="edit-title">
          <label>Description</label>
          <textarea class="edit-desc">${task.description || ""}</textarea>
        </div>
        <div class="task-header-right">
          <button class="btn btn-primary save-btn">Save</button>
          <button class="btn btn-secondary cancel-btn">Cancel</button>
        </div>`;
      const saveBtn = div.querySelector(".save-btn");
      const cancelBtn = div.querySelector(".cancel-btn");

      // Save and Cancel Buttons Functionality
      saveBtn.onclick = () => {
        const title = div.querySelector(".edit-title").value.trim();
        const desc = div.querySelector(".edit-desc").value.trim();
        if (!title) return showFeedback("Title cannot be empty", "error");
        task.title = title;
        task.description = desc;
        task.editing = false;
        save();
        renderTasks();
        showFeedback("Task updated!");
      };

      cancelBtn.onclick = () => {
        task.editing = false;
        renderTasks();
      };
    } else {
      // Non-Editing Task View with Action Buttons
      div.innerHTML = `
        <div class="task-header">
        <div class="task-header-left">
        <input type="checkbox" class="task-checkbox" ${
          task.completed ? "checked" : ""
        }>
        <div class="task-title">${task.title}</div>
        </div>
          <div class="task-header-right">
            <button class="btn btn-secondary mark-btn" style="margin-left: 5px; display: flex; align-items: center; gap: 5px;">
            ${
              task.completed
                ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-x-icon lucide-circle-x"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big-icon lucide-circle-check-big"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>`
            }
            ${task.completed ? "Mark as Undone" : "Mark as Done"}</button>
            <button class="btn btn-secondary edit-btn" style="margin-left: 5px; display: flex; align-items: center; gap: 5px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-pen-icon lucide-file-pen"><path d="M12.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v9.5"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M13.378 15.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/></svg>
            Edit
            </button>
            <button class="btn btn-danger delete-btn" style="margin-left: 5px; display: flex; align-items: center; gap: 5px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Delete
            </button>
          </div>
        </div>
        <div>
              ${
                task.description
                  ? `<div class="task-description">${task.description}</div>`
                  : ""
              }
            </div>
        <div class="task-meta">${new Date(task.date).toLocaleString()}</div>
        ${
          task.completed
            ? `<div class="done-pill" style="margin-top: 10px; display: flex; align-items: center; justify-content: center; gap: 5px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big-icon lucide-circle-check-big"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>
          Marked as Done</div>`
            : ""
        }
      `;

      // Action Buttons Functionality
      const checkbox = div.querySelector(".task-checkbox");
      const markBtn = div.querySelector(".mark-btn");
      const editBtn = div.querySelector(".edit-btn");
      const deleteBtn = div.querySelector(".delete-btn");

      // Action Buttons Event Listeners
      checkbox.onchange = () => toggleComplete(task.id);
      markBtn.onclick = () => toggleComplete(task.id);
      editBtn.onclick = () => editTask(task.id);
      deleteBtn.onclick = () =>
        openConfirm("Delete Task", `Delete "${task.title}"?`, () =>
          deleteTask(task.id)
        );

      // Disable Edit/Delete if Completed
      if (task.completed) {
        editBtn.disabled = true;
        deleteBtn.disabled = true;
      }
    }

    list.appendChild(div);
  });
}

// Add New Task
function addTask(title, desc) {
  const task = {
    id: Date.now(),
    title,
    description: desc,
    completed: false,
    date: new Date(),
    editing: false,
  };
  tasks.unshift(task);
  save();
  renderTasks();
  showFeedback("Task added!");
}

// Edit Task
function editTask(id) {
  tasks.forEach((t) => (t.editing = t.id === id));
  save();
  renderTasks();
}

// Toggle Task Completion
function toggleComplete(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    save();
    renderTasks();
    showFeedback(task.completed ? "Marked as done." : "Marked as undone.");
  }
}

// Delete Task
function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  save();
  renderTasks();
  showFeedback("Task deleted.", "error");
}

// Delete All Tasks
function deleteAll() {
  if (!tasks.length) return showFeedback("No tasks to delete.", "error");
  openConfirm("Delete All", "Delete ALL tasks? This cannot be undone.", () => {
    tasks = [];
    save();
    renderTasks();
    showFeedback("All tasks deleted.", "error");
  });
}

// Sort Tasks based on sortMode "Newest First", "Oldest First", "A-Z"
function sortTasks() {
  switch (sortMode) {
    case "oldest":
      tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case "alphabetical":
      tasks.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      tasks.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
}

// Save Tasks to localStorage
function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Event Listener for Form and Buttons to Add New Task
document.getElementById("newTaskForm").onsubmit = (e) => {
  e.preventDefault();
  const title = document.getElementById("newTaskTitle").value.trim();
  const desc = document.getElementById("newTaskDescription").value.trim();
  if (!title) return showFeedback("Enter a title.", "error");
  addTask(title, desc);
  e.target.reset();
};

// Event Listener for Sort Select Dropdown
document.getElementById("sortSelect").onchange = (e) => {
  sortMode = e.target.value;
  renderTasks();
};

// Event Listener for Delete All Button
document.getElementById("deleteAllBtn").onclick = deleteAll;

renderTasks();
