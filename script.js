// استيراد Firebase SDK
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue } from "firebase/database";

// تكوين Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDuTkiyJn1Id6BYvU1Oiwlf4mvmKSsAwsw",
  authDomain: "my-tasker-27723.firebaseapp.com",
  databaseURL: "https://my-tasker-27723-default-rtdb.firebaseio.com",
  projectId: "my-tasker-27723",
  storageBucket: "my-tasker-27723.firebasestorage.app",
  messagingSenderId: "548756631091",
  appId: "1:548756631091:web:6ad241db74a8c12e97fd46",
  measurementId: "G-SDVD837JT5"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// دالة لفتح التبويبات عند النقر
function openTab(tabId) {
  document.querySelector(".container").style.display = "none";
  document.querySelectorAll(".tab").forEach(tab => tab.style.display = "none");
  document.getElementById(tabId).style.display = "flex";
}

// دالة للرجوع إلى الصفحة الرئيسية
function goHome() {
  document.querySelector(".container").style.display = "flex";
  document.querySelectorAll(".tab").forEach(tab => tab.style.display = "none");
}

// دالة لإضافة مهمة جديدة
function addTask(tabId) {
  const input = document.getElementById(`input-${tabId}`);
  const text = input.value.trim();
  if (!text) return;

  const task = { text, date: new Date().toLocaleString() };

  // تخزين المهمة في Firebase
  const newTaskRef = ref(db, `${tabId}/` + Date.now());
  set(newTaskRef, task);

  // إعادة تحميل المهام
  renderTasks(tabId);
  input.value = "";
}

// دالة لاسترجاع المهام من Firebase
function getTasks(tabId) {
  const dbRef = ref(db, tabId);
  get(dbRef).then((snapshot) => {
    if (snapshot.exists()) {
      const tasks = snapshot.val();
      renderTasks(tabId, tasks);
    } else {
      renderTasks(tabId);
    }
  }).catch((error) => {
    console.error(error);
  });
}

// دالة لعرض المهام في الواجهة
function renderTasks(tabId, tasks = {}) {
  const container = document.querySelector(`[data-tab="${tabId}"]`);
  container.innerHTML = "";

  // عرض المهام في الواجهة
  for (let key in tasks) {
    const task = tasks[key];
    const item = document.createElement("div");
    item.className = "task-item";
    item.innerHTML = `
      <div>${task.text}</div>
      <div class="task-date">📅 ${task.date}</div>
      <div class="task-actions">
        <button onclick="editTask('${tabId}', '${key}')">✏️ تحرير</button>
        <button onclick="deleteTask('${tabId}', '${key}')">🗑️ مسح</button>
      </div>
    `;
    container.appendChild(item);
  }
}

// دالة لتعديل مهمة معينة
function editTask(tabId, key) {
  const dbRef = ref(db, `${tabId}/${key}`);
  get(dbRef).then((snapshot) => {
    if (snapshot.exists()) {
      const task = snapshot.val();
      const newText = prompt("تعديل المهمة:", task.text);
      if (newText) {
        task.text = newText;
        set(dbRef, task);
        renderTasks(tabId);
      }
    }
  });
}

// دالة لحذف مهمة معينة
function deleteTask(tabId, key) {
  const pass = prompt("ادخل كلمة السر لمسح المهمة:");
  if (pass === "tasker") {
    const taskRef = ref(db, `${tabId}/${key}`);
    set(taskRef, null);  // حذف المهمة من Firebase
    renderTasks(tabId);
  } else {
    alert("كلمة السر غير صحيحة ❌");
  }
}

// تحميل المهام عند فتح الصفحة
window.addEventListener("load", () => {
  // استماع للتغييرات في البيانات في Firebase
  ["tab1", "tab2", "tab3", "tab4"].forEach(tabId => {
    const dbRef = ref(db, tabId);
    onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const tasks = snapshot.val();
        renderTasks(tabId, tasks);
      } else {
        renderTasks(tabId);
      }
    });
  });
});

// دالة لتنزيل قاعدة البيانات
function downloadDatabase() {
  const dbRef = ref(db);
  get(dbRef).then((snapshot) => {
    if (snapshot.exists()) {
      const db = snapshot.val();
      const blob = new Blob([JSON.stringify(db, null, 2)], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "backup.txt";
      a.click();
    }
  });
}

// دالة لرفع قاعدة البيانات من ملف
function uploadDatabase(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      for (let tab of ["tab1", "tab2", "tab3", "tab4"]) {
        if (data[tab]) {
          const tabRef = ref(db, tab);
          set(tabRef, data[tab]);
        }
      }
      alert("تم تحميل البيانات بنجاح ✅");
    } catch {
      alert("خطأ في الملف ❌");
    }
  };
  reader.readAsText(file);
}
