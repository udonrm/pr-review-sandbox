// DOM要素の取得
const todoInput = document.getElementById("todo-input");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");
const todoCount = document.getElementById("todo-count");
const clearCompletedBtn = document.getElementById("clear-completed");
const filterBtns = document.querySelectorAll(".filter-btn");

// TODOデータの管理
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";

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
  };

  todos.push(todo);
  saveTodos();
  renderTodos();
  todoInput.value = "";
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

// 完了済みTODOの削除
function clearCompleted() {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  renderTodos();
}

// フィルタリング
function filterTodos() {
  switch (currentFilter) {
    case "active":
      return todos.filter((todo) => !todo.completed);
    case "completed":
      return todos.filter((todo) => todo.completed);
    default:
      return todos;
  }
}

// TODOリストの描画
function renderTodos() {
  const filteredTodos = filterTodos();

  todoList.innerHTML = filteredTodos
    .map(
      (todo) => `
    <li class="todo-item ${todo.completed ? "completed" : ""}" data-id="${
        todo.id
      }">
      <input type="checkbox" class="todo-checkbox" ${
        todo.completed ? "checked" : ""
      }>
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <button class="delete-btn">削除</button>
    </li>
  `
    )
    .join("");

  // カウントの更新
  const activeCount = todos.filter((todo) => !todo.completed).length;
  todoCount.textContent = `${activeCount} 件の未完了タスク`;
}

// HTMLエスケープ
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
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

clearCompletedBtn.addEventListener("click", clearCompleted);

// キーボードショートカット
document.addEventListener("keydown", (e) => {
  // Ctrl+Shift+A: 入力欄にフォーカス
  if (e.ctrlKey && e.shiftKey && e.key === "A") {
    e.preventDefault();
    todoInput.focus();
  }

  // Ctrl+Shift+D: 完了済みを削除
  if (e.ctrlKey && e.shiftKey && e.key === "D") {
    e.preventDefault();
    clearCompleted();
  }

  // Ctrl+1/2/3: フィルター切り替え
  if (e.ctrlKey && !e.shiftKey) {
    if (e.key === "1") {
      e.preventDefault();
      currentFilter = "all";
      updateFilterButtons();
      renderTodos();
    } else if (e.key === "2") {
      e.preventDefault();
      currentFilter = "active";
      updateFilterButtons();
      renderTodos();
    } else if (e.key === "3") {
      e.preventDefault();
      currentFilter = "completed";
      updateFilterButtons();
      renderTodos();
    }
  }
});

// フィルターボタンのアクティブ状態を更新
function updateFilterButtons() {
  filterBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === currentFilter);
  });
}

// 初期描画
renderTodos();
