// DOM要素の取得
const todoInput = document.getElementById("todo-input");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");
const todoCount = document.getElementById("todo-count");
const clearCompletedBtn = document.getElementById("clear-completed");
const filterBtns = document.querySelectorAll(".filter-btn");
const categoryTabs = document.querySelectorAll(".category-tab");
const prioritySelect = document.getElementById("priority-select");
const dueDateInput = document.getElementById("due-date");
const categorySelect = document.getElementById("category-select");
const sortSelect = document.getElementById("sort-select");
const themeToggle = document.getElementById("theme-toggle");
const exportBtn = document.getElementById("export-btn");

// モーダル要素
const editModal = document.getElementById("edit-modal");
const editInput = document.getElementById("edit-input");
const editPriority = document.getElementById("edit-priority");
const editDueDate = document.getElementById("edit-due-date");
const editCategory = document.getElementById("edit-category");
const editNotes = document.getElementById("edit-notes");
const editCancel = document.getElementById("edit-cancel");
const editSave = document.getElementById("edit-save");

// TODOデータの管理
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";
let currentCategory = "all";
let currentSort = "created";
let editingTodoId = null;

// テーマの初期化
const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);
updateThemeIcon();

// カテゴリ名のマッピング
const categoryNames = {
  work: "仕事",
  personal: "プライベート",
  shopping: "買い物",
  health: "健康",
};

// 優先度名のマッピング
const priorityNames = {
  high: "高",
  medium: "中",
  low: "低",
};

// TODOの保存
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// TODOの追加
function addTodo() {
  const text = todoInput.value.trim();
  if (!text) return;

  const todo = {
    id: Date.now(),
    text: text,
    completed: false,
    priority: prioritySelect.value,
    dueDate: dueDateInput.value || null,
    category: categorySelect.value || null,
    notes: "",
    createdAt: new Date().toISOString(),
  };

  todos.push(todo);
  saveTodos();
  renderTodos();

  // フォームをリセット
  todoInput.value = "";
  dueDateInput.value = "";
  prioritySelect.value = "medium";
  categorySelect.value = "";
}

// TODOの削除
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
}

// TODOの完了状態を切り替え
function toggleTodo(id) {
  todos = todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });
  saveTodos();
  renderTodos();
}

// TODOの編集モーダルを開く
function openEditModal(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  editingTodoId = id;
  editInput.value = todo.text;
  editPriority.value = todo.priority;
  editDueDate.value = todo.dueDate || "";
  editCategory.value = todo.category || "";
  editNotes.value = todo.notes || "";

  editModal.classList.add("active");
}

// TODOの編集を保存
function saveEdit() {
  if (!editingTodoId) return;

  todos = todos.map((todo) => {
    if (todo.id === editingTodoId) {
      return {
        ...todo,
        text: editInput.value.trim() || todo.text,
        priority: editPriority.value,
        dueDate: editDueDate.value || null,
        category: editCategory.value || null,
        notes: editNotes.value,
      };
    }
    return todo;
  });

  saveTodos();
  renderTodos();
  closeEditModal();
}

// 編集モーダルを閉じる
function closeEditModal() {
  editModal.classList.remove("active");
  editingTodoId = null;
}

// 完了済みTODOの削除
function clearCompleted() {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  renderTodos();
}

// フィルタリング
function filterTodos() {
  let filtered = todos;

  // カテゴリフィルター
  if (currentCategory !== "all") {
    filtered = filtered.filter((todo) => todo.category === currentCategory);
  }

  // 状態フィルター
  switch (currentFilter) {
    case "active":
      filtered = filtered.filter((todo) => !todo.completed);
      break;
    case "completed":
      filtered = filtered.filter((todo) => todo.completed);
      break;
  }

  return filtered;
}

// ソート
function sortTodos(todosToSort) {
  const sorted = [...todosToSort];

  switch (currentSort) {
    case "priority":
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      sorted.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );
      break;
    case "dueDate":
      sorted.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
      break;
    case "alphabetical":
      sorted.sort((a, b) => a.text.localeCompare(b.text, "ja"));
      break;
    case "created":
    default:
      sorted.sort((a, b) => b.id - a.id);
      break;
  }

  return sorted;
}

// 期限切れかどうかをチェック
function isOverdue(dueDate) {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
}

// 日付をフォーマット
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}

// TODOリストの描画
function renderTodos() {
  const filteredTodos = filterTodos();
  const sortedTodos = sortTodos(filteredTodos);

  if (sortedTodos.length === 0) {
    todoList.innerHTML = `
      <li class="empty-state">
        <p>タスクがありません</p>
      </li>
    `;
  } else {
    todoList.innerHTML = sortedTodos
      .map((todo) => {
        const overdue = isOverdue(todo.dueDate) && !todo.completed;
        return `
        <li class="todo-item priority-${todo.priority} ${
          todo.completed ? "completed" : ""
        } ${overdue ? "overdue" : ""}" data-id="${todo.id}">
          <input type="checkbox" class="todo-checkbox" ${
            todo.completed ? "checked" : ""
          }>
          <div class="todo-content">
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <div class="todo-meta">
              <span class="todo-priority">優先度: ${
                priorityNames[todo.priority]
              }</span>
              ${
                todo.dueDate
                  ? `<span class="todo-due ${
                      overdue ? "overdue" : ""
                    }">期限: ${formatDate(todo.dueDate)}</span>`
                  : ""
              }
              ${
                todo.category
                  ? `<span class="todo-category">${
                      categoryNames[todo.category]
                    }</span>`
                  : ""
              }
            </div>
          </div>
          <div class="todo-actions">
            <button class="edit-btn">編集</button>
            <button class="delete-btn">削除</button>
          </div>
        </li>
      `;
      })
      .join("");
  }

  // カウントの更新
  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.filter((todo) => todo.completed).length;
  todoCount.textContent = `未完了: ${activeCount} / 完了: ${completedCount}`;
}

// HTMLエスケープ
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// テーマの切り替え
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeIcon();
}

// テーマアイコンの更新
function updateThemeIcon() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const themeIcon = document.querySelector(".theme-icon");
  themeIcon.textContent = currentTheme === "dark" ? "☀️" : "🌙";
}

// エクスポート機能
function exportTodos() {
  const dataStr = JSON.stringify(todos, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `todos-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// イベントリスナーの設定
addBtn.addEventListener("click", addTodo);

todoInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addTodo();
  }
});

todoList.addEventListener("click", (e) => {
  const item = e.target.closest(".todo-item");
  if (!item) return;

  const id = parseInt(item.dataset.id);

  if (e.target.classList.contains("delete-btn")) {
    deleteTodo(id);
  } else if (e.target.classList.contains("edit-btn")) {
    openEditModal(id);
  } else if (e.target.classList.contains("todo-checkbox")) {
    toggleTodo(id);
  }
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTodos();
  });
});

categoryTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    categoryTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentCategory = tab.dataset.category;
    renderTodos();
  });
});

sortSelect.addEventListener("change", () => {
  currentSort = sortSelect.value;
  renderTodos();
});

themeToggle.addEventListener("click", toggleTheme);

clearCompletedBtn.addEventListener("click", clearCompleted);

exportBtn.addEventListener("click", exportTodos);

// モーダルイベント
editCancel.addEventListener("click", closeEditModal);
editSave.addEventListener("click", saveEdit);

editModal.addEventListener("click", (e) => {
  if (e.target === editModal) {
    closeEditModal();
  }
});

// キーボードショートカット
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && editModal.classList.contains("active")) {
    closeEditModal();
  }
});

// 初期描画
renderTodos();
