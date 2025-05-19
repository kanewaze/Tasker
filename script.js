import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getDatabase, ref, set, onValue, get, remove } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

// إعداد Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDuTkiyJn1Id6BYvU1Oiwlf4mvmKSsAwsw",
  authDomain: "my-tasker-27723.firebaseapp.com",
  databaseURL: "https://my-tasker-27723-default-rtdb.firebaseio.com",
  projectId: "my-tasker-27723",
  storageBucket: "my-tasker-27723.appspot.com",
  messagingSenderId: "548756631091",
  appId: "1:548756631091:web:6ad241db74a8c12e97fd46",
  measurementId: "G-SDVD837JT5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// دالة فتح التبويبات
window.openTab = function(tabId) {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.style.display = "none";
  });
  document.getElementById(tabId).style.display = "flex";
  document.querySelector(".container").style.display = "none";
  loadTasks(tabId);
}

// رجوع للرئيسية
window.goHome = function() {
  document.querySelectorAll(".tab").forEach(tab => tab.style.display = "none");
  document.querySelector(".container").style.display = "flex";
}

// إضافة مهمة
window.addTask = function(tabId) {
  const input = document.getElementById(`input-${tabId}`);
  const text = input.value.trim();
  if (!text) return;

  const key = Date.now().toString();
  const newTask = {
    text: text,
    date: new Date().toLocaleString(),
    key: key
  };

  const taskRef = ref(db, `${tabId}/${key}`);
  set(taskRef, newTask).then(() => {
    input.value = "";
    loadTasks(tabId);
  });
}

// عرض المهام
function loadTasks(tabId) {
  const tabRef = ref(db, tabId);
  onValue(tabRef, snapshot => {
    const tasks = snapshot.val() || {};
    renderTasks(tabId, Object.values(tasks));
  });
}

function renderTasks(tabId, tasks) {
  const container = document.querySelector(`[data-tab="${tabId}"]`);
  container.innerHTML = "";

  tasks.forEach((task, index) => {
    const item = document.createElement("div");
    item.className = "task-item";
    item.innerHTML = `
      <div>${index + 1}. ${task.text}</div>
      <div class="task-date">📅 ${task.date}</div>
      <div class="task-actions">
        <button onclick="editTask('${tabId}', '${task.key}')">✏️ تعديل</button>
        <button onclick="deleteTask('${tabId}', '${task.key}')">🗑️ مسح</button>
      </div>
    `;
    container.appendChild(item);
  });
}

// تعديل مهمة
window.editTask = function(tabId, key) {
  const taskRef = ref(db, `${tabId}/${key}`);
  get(taskRef).then(snapshot => {
    const task = snapshot.val();
    if (task) {
      document.getElementById(`input-${tabId}`).value = task.text;
      deleteTask(tabId, key); // نحذف المهمة عشان نرجع نضيفها بعد التعديل
    }
  });
}

// حذف مهمة بكلمة مرور
window.deleteTask = function(tabId, key) {
  const password = prompt("ادخل كلمة المرور لحذف المهمة:");
  if (password !== "tasker") {
    alert("❌ كلمة المرور غير صحيحة");
    return;
  }

  const taskRef = ref(db, `${tabId}/${key}`);
  remove(taskRef).then(() => {
    loadTasks(tabId);
  });
}

// تحميل البيانات
window.downloadDatabase = function() {
  get(ref(db)).then(snapshot => {
    const data = snapshot.val();
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "backup.txt";
    link.click();
  });
}

// رفع البيانات
window.uploadDatabase = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const data = JSON.parse(e.target.result);
    Object.keys(data).forEach(tabId => {
      const tabRef = ref(db, tabId);
      set(tabRef, data[tabId]);
    });
    alert("✅ تم استعادة البيانات");
  };
  reader.readAsText(file);
}
