document.addEventListener('DOMContentLoaded', loadTasks);

function openTab(tabId) {
  document.querySelector('.container').style.display = 'none';
  document.querySelectorAll('.tab').forEach(tab => tab.style.display = 'none');
  document.getElementById(tabId).style.display = 'block';
}

function goHome() {
  document.querySelector('.container').style.display = 'block';
  document.querySelectorAll('.tab').forEach(tab => tab.style.display = 'none');
}

function addTask(tabId) {
  const input = document.getElementById(`input-${tabId}`);
  const taskText = input.value.trim();
  if (taskText === '') return;

  const task = {
    text: taskText,
    date: new Date().toLocaleString()
  };

  const tasks = getTasks(tabId);
  tasks.push(task);
  saveTasks(tabId, tasks);
  renderTasks(tabId);

  input.value = '';
}

function renderTasks(tabId) {
  const section = document.querySelector(`[data-tab="${tabId}"]`);
  section.innerHTML = '';
  const tasks = getTasks(tabId);

  tasks.forEach((task, index) => {
    const item = document.createElement('div');
    item.className = 'task-item';

    const text = document.createElement('div');
    text.className = 'task-text';
    text.textContent = task.text;

    const date = document.createElement('div');
    date.className = 'task-date';
    date.textContent = `📅 ${task.date}`;

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️ تحرير';
    editBtn.onclick = () => {
      const newText = prompt("تعديل المهمة:", task.text);
      if (newText) {
        tasks[index].text = newText;
        saveTasks(tabId, tasks);
        renderTasks(tabId);
      }
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️ مسح';
    deleteBtn.className = 'delete';
    deleteBtn.onclick = () => {
      const pass = prompt("ادخل كلمة السر لمسح المهمة:");
      if (pass === 'tasker') {
        tasks.splice(index, 1);
        saveTasks(tabId, tasks);
        renderTasks(tabId);
      } else {
        alert("كلمة السر غلط!");
      }
    };

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    item.appendChild(text);
    item.appendChild(date);
    item.appendChild(actions);

    section.appendChild(item);
  });
}

function getTasks(tabId) {
  return JSON.parse(localStorage.getItem(tabId)) || [];
}

function saveTasks(tabId, tasks) {
  localStorage.setItem(tabId, JSON.stringify(tasks));
}

// تحميل كل المهام
function loadTasks() {
  ['tab1', 'tab2', 'tab3', 'tab4'].forEach(tabId => renderTasks(tabId));
}

// تحميل النسخة
function downloadDatabase() {
  const db = {
    tab1: getTasks('tab1'),
    tab2: getTasks('tab2'),
    tab3: getTasks('tab3'),
    tab4: getTasks('tab4')
  };
  const dataStr = JSON.stringify(db, null, 2);
  const blob = new Blob([dataStr], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'tasks_backup.txt';
  a.click();
}

// رفع النسخة
function uploadDatabase(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const db = JSON.parse(e.target.result);
      ['tab1', 'tab2', 'tab3', 'tab4'].forEach(tabId => {
        if (db[tabId]) {
          localStorage.setItem(tabId, JSON.stringify(db[tabId]));
        }
      });
      alert("تم استرجاع النسخة بنجاح ✅");
      loadTasks();
    } catch {
      alert("ملف غير صالح ❌");
    }
  };
  reader.readAsText(file);
}
