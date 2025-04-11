// تحميل من GitHub أو backup.txt (نسخة JSON)
window.addEventListener("load", () => {
  fetch("backup.txt")
    .then(res => res.text())
    .then(txt => {
      const data = JSON.parse(txt);
      for (let tab of ["tab1", "tab2", "tab3", "tab4"]) {
        if (data[tab]) {
          localStorage.setItem(tab, JSON.stringify(data[tab]));
        }
      }
      loadTasks();
    })
    .catch(() => {
      loadTasks(); // لو مفيش ملف، اشتغل بالقديم
    });
});

function openTab(tabId) {
  document.querySelector(".container").style.display = "none";
  document.querySelectorAll(".tab").forEach(tab => tab.style.display = "none");
  document.getElementById(tabId).style.display = "flex";
}

function goHome() {
  document.querySelector(".container").style.display = "flex";
  document.querySelectorAll(".tab").forEach(tab => tab.style.display = "none");
}

function addTask(tabId) {
  const input = document.getElementById(`input-${tabId}`);
  const text = input.value.trim();
  if (!text) return;
  const tasks = getTasks(tabId);
  tasks.push({ text, date: new Date().toLocaleString() });
  saveTasks(tabId, tasks);
  renderTasks(tabId);
  input.value = "";
}

function getTasks(tabId) {
  return JSON.parse(localStorage.getItem(tabId)) || [];
}

function saveTasks(tabId, tasks) {
  localStorage.setItem(tabId, JSON.stringify(tasks));
}

function loadTasks() {
  ["tab1", "tab2", "tab3", "tab4"].forEach(tabId => renderTasks(tabId));
}

function renderTasks(tabId) {
  const container = document.querySelector(`[data-tab="${tabId}"]`);
  container.innerHTML = "";
  const tasks = getTasks(tabId);

  tasks.forEach((task, i) => {
    const item = document.createElement("div");
    item.className = "task-item";
    item.innerHTML = `
      <div>${i + 1}. ${task.text}</div>
      <div class="task-date">📅 ${task.date}</div>
      <div class="task-actions">
        <button onclick="editTask('${tabId}', ${i})">✏️ تحرير</button>
        <button onclick="deleteTask('${tabId}', ${i})">🗑️ مسح</button>
      </div>
    `;
    container.appendChild(item);
  });
}

function editTask(tabId, index) {
  const tasks = getTasks(tabId);
  const newText = prompt("تعديل المهمة:", tasks[index].text);
  if (newText) {
    tasks[index].text = newText;
    saveTasks(tabId, tasks);
    renderTasks(tabId);
  }
}

function deleteTask(tabId, index) {
  const pass = prompt("ادخل كلمة السر لمسح المهمة:");
  if (pass === "tasker") {
    const tasks = getTasks(tabId);
    tasks.splice(index, 1);
    saveTasks(tabId, tasks);
    renderTasks(tabId);
  } else {
    alert("كلمة السر غير صحيحة ❌");
  }
}

function downloadDatabase() {
  const db = {
    tab1: getTasks("tab1"),
    tab2: getTasks("tab2"),
    tab3: getTasks("tab3"),
    tab4: getTasks("tab4")
  };
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "backup.txt";
  a.click();
}

function uploadDatabase(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      for (let tab of ["tab1", "tab2", "tab3", "tab4"]) {
        if (data[tab]) {
          localStorage.setItem(tab, JSON.stringify(data[tab]));
        }
      }
      alert("تم تحميل البيانات بنجاح ✅");
      loadTasks();
    } catch {
      alert("خطأ في الملف ❌");
    }
  };
  reader.readAsText(file);
}
