// script.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  remove
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDuTkiyJn1Id6BYvU1Oiwlf4mvmKSsAwsw",
  authDomain: "my-tasker-27723.firebaseapp.com",
  databaseURL: "https://my-tasker-27723-default-rtdb.firebaseio.com",
  projectId: "my-tasker-27723",
  storageBucket: "my-tasker-27723.appspot.com",
  messagingSenderId: "548756631091",
  appId: "1:548756631091:web:6ad241db74a8c12e97fd46"
};

// init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Show tab
window.openTab = function (tabId) {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.style.display = "none";
  });
  document.getElementById(tabId).style.display = "flex";
  document.querySelector(".container").style.display = "none";
  loadTasks(tabId);
};

// Go home
window.goHome = function () {
  document.querySelector(".container").style.display = "flex";
  document.querySelectorAll(".tab").forEach(tab => {
    tab.style.display = "none";
  });
};

// Add task
window.addTask = function (tabId) {
  const input = document.getElementById(`input-${tabId}`);
  const text = input.value.trim();
  if (!text) return;

  const task = {
    text,
    date: new Date().toLocaleString()
  };

  const tasksRef = ref(db, tabId);
  const newTaskRef = push(tasksRef);
  set(newTaskRef, task).then(() => {
    input.value = "";
  });
};

// Load tasks
function loadTasks(tabId) {
  const tasksContainer = document.querySelector(`[data-tab="${tabId}"]`);
  tasksContainer.innerHTML = "";

  const tasksRef = ref(db, tabId);
  onValue(tasksRef, snapshot => {
    tasksContainer.innerHTML = "";
    const data = snapshot.val();
    if (!data) return;

    Object.entries(data).forEach(([key, task], index) => {
      const div = document.createElement("div");
      div.className = "task-item";
      div.innerHTML = `
        <div>${index + 1}. ${task.text}</div>
        <div class="task-date">📅 ${task.date}</div>
        <div class="task-actions">
          <button onclick="editTask('${tabId}', '${key}', '${task.text}')">✏️ تعديل</button>
          <button onclick="deleteTask('${tabId}', '${key}')">🗑️ مسح</button>
        </div>
      `;
      tasksContainer.appendChild(div);
    });
  });
}

// Delete task
window.deleteTask = function (tabId, key) {
  const taskRef = ref(db, `${tabId}/${key}`);
  remove(taskRef);
};

// Edit task
window.editTask = function (tabId, key, text) {
  const input = document.getElementById(`input-${tabId}`);
  input.value = text;
  deleteTask(tabId, key);
};

// Download backup
window.downloadDatabase = function () {
  const allRef = ref(db);
  onValue(allRef, snapshot => {
    const data = snapshot.val();
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "tasks_backup.json";
    a.click();
  }, { onlyOnce: true });
};

// Upload backup
window.uploadDatabase = function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = JSON.parse(e.target.result);
    Object.keys(data).forEach(tabId => {
      const tabRef = ref(db, tabId);
      set(tabRef, data[tabId]);
    });
    alert("تم رفع البيانات بنجاح ✅");
  };
  reader.readAsText(file);
};
