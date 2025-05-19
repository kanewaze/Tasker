import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getDatabase, ref, set, onValue, get, remove, update } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

// Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Global variables
let tasksData = {};

// Open tab function
window.openTab = function(tabId) {
  document.querySelector('.home-screen').style.display = 'none';
  document.querySelectorAll('.tab-screen').forEach(tab => {
    tab.style.display = 'none';
  });
  document.getElementById(tabId).style.display = 'flex';
  loadTasks(tabId);
};

// Return to home
window.goHome = function() {
  document.querySelector('.home-screen').style.display = 'block';
  document.querySelectorAll('.tab-screen').forEach(tab => {
    tab.style.display = 'none';
  });
};

// Show backup options modal
window.showBackupOptions = function() {
  document.getElementById('backupModal').style.display = 'flex';
};

// Hide backup options modal
window.hideBackupOptions = function() {
  document.getElementById('backupModal').style.display = 'none';
};

// Add task function
window.addTask = function(tabId) {
  const input = document.getElementById(`input-${tabId}`);
  const text = input.value.trim();
  if (!text) {
    alert('⚠️ الرجاء إدخال نص المهمة');
    input.focus();
    return;
  }

  const key = Date.now().toString();
  const newTask = {
    text: text,
    date: new Date().toLocaleString('ar-EG'),
    key: key,
    order: Object.keys(tasksData[tabId] || {}).length
  };

  const taskRef = ref(db, `${tabId}/${key}`);
  set(taskRef, newTask).then(() => {
    input.value = '';
    input.focus();
  }).catch(error => {
    alert('❌ حدث خطأ أثناء إضافة المهمة: ' + error.message);
  });
};

// Load tasks from database
function loadTasks(tabId) {
  const tabRef = ref(db, tabId);
  onValue(tabRef, (snapshot) => {
    tasksData[tabId] = snapshot.val() || {};
    renderTasks(tabId);
  });
}

// Render tasks in the UI
function renderTasks(tabId) {
  const container = document.querySelector(`[data-tab="${tabId}"]`);
  container.innerHTML = '';

  // Convert tasks object to array and sort by order
  const tasksArray = Object.values(tasksData[tabId])
    .sort((a, b) => a.order - b.order);

  if (tasksArray.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>لا توجد مهام حتى الآن. ابدأ بإضافة مهمة جديدة!</p>
      </div>
    `;
    return;
  }

  tasksArray.forEach((task, index) => {
    const item = document.createElement('div');
    item.className = 'task-item';
    item.innerHTML = `
      <div class="task-content">
        <div class="task-text">${task.text}</div>
        <div class="task-date">📅 ${task.date}</div>
      </div>
      <div class="task-controls">
        <div class="move-buttons">
          <button onclick="moveTask('${tabId}', '${task.key}', 'up')" ${index === 0 ? 'disabled' : ''}>⬆️</button>
          <button onclick="moveTask('${tabId}', '${task.key}', 'down')" ${index === tasksArray.length - 1 ? 'disabled' : ''}>⬇️</button>
        </div>
        <div class="task-actions">
          <button onclick="editTask('${tabId}', '${task.key}')">✏️ تعديل</button>
          <button onclick="deleteTask('${tabId}', '${task.key}')">🗑️ حذف</button>
        </div>
      </div>
    `;
    container.appendChild(item);
  });
}

// Move task up or down
window.moveTask = function(tabId, key, direction) {
  const tasks = tasksData[tabId];
  const taskKeys = Object.keys(tasks);
  
  if (taskKeys.length < 2) return;
  
  // Find current task and its index
  const currentIndex = taskKeys.findIndex(k => k === key);
  if (currentIndex === -1) return;
  
  // Determine new index based on direction
  let newIndex;
  if (direction === 'up' && currentIndex > 0) {
    newIndex = currentIndex - 1;
  } else if (direction === 'down' && currentIndex < taskKeys.length - 1) {
    newIndex = currentIndex + 1;
  } else {
    return; // Can't move further in this direction
  }
  
  // Swap order values
  const updates = {};
  updates[`${tabId}/${taskKeys[currentIndex]}/order`] = newIndex;
  updates[`${tabId}/${taskKeys[newIndex]}/order`] = currentIndex;
  
  // Update database
  update(ref(db), updates).catch(error => {
    alert('❌ حدث خطأ أثناء نقل المهمة: ' + error.message);
  });
};

// Edit task
window.editTask = function(tabId, key) {
  const task = tasksData[tabId][key];
  if (task) {
    const input = document.getElementById(`input-${tabId}`);
    input.value = task.text;
    input.focus();
    deleteTask(tabId, key, true); // Silent delete (no password)
  }
};

// Delete task
window.deleteTask = function(tabId, key, silent = false) {
  if (!silent) {
    const password = prompt("🔒 أدخل كلمة المرور لحذف المهمة:");
    if (password !== "tasker") {
      alert("❌ كلمة المرور غير صحيحة");
      return;
    }
    
    if (!confirm("⚠️ هل أنت متأكد من حذف هذه المهمة؟")) {
      return;
    }
  }

  const taskRef = ref(db, `${tabId}/${key}`);
  remove(taskRef).catch(error => {
    alert('❌ حدث خطأ أثناء حذف المهمة: ' + error.message);
  });
};

// Download database backup
window.downloadDatabase = function() {
  get(ref(db)).then((snapshot) => {
    const data = snapshot.val();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `my_tasker_backup_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    hideBackupOptions();
    alert("✅ تم إنشاء نسخة احتياطية بنجاح");
  }).catch(error => {
    alert("❌ حدث خطأ أثناء إنشاء النسخة الاحتياطية: " + error.message);
  });
};

// Upload database backup
window.uploadDatabase = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const password = prompt("🔒 أدخل كلمة المرور لاستعادة البيانات:");
  if (password !== "tasker") {
    alert("❌ كلمة المرور غير صحيحة");
    return;
  }

  if (!confirm("⚠️ تحذير: هذا سوف يستبدل جميع البيانات الحالية. هل تريد المتابعة؟")) {
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      
      // Verify the data structure
      if (typeof data !== 'object' || data === null) {
        throw new Error("صيغة الملف غير صالحة");
      }
      
      // Update the entire database
      set(ref(db), data).then(() => {
        hideBackupOptions();
        alert("✅ تم استعادة البيانات بنجاح");
        // Reload current tab if any
        const currentTab = document.querySelector('.tab-screen[style*="display: flex"]');
        if (currentTab) {
          const tabId = currentTab.id;
          loadTasks(tabId);
        }
      });
    } catch (error) {
      alert("❌ خطأ في ملف النسخة الاحتياطية: " + error.message);
    }
  };
  reader.onerror = () => {
    alert("❌ حدث خطأ أثناء قراءة الملف");
  };
  reader.readAsText(file);
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  // Close modal when clicking outside
  document.getElementById('backupModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('backupModal')) {
      hideBackupOptions();
    }
  });

  // Load initial data if on a tab
  const currentTab = document.querySelector('.tab-screen[style*="display: flex"]');
  if (currentTab) {
    loadTasks(currentTab.id);
  }
});