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
  
    const taskSection = document.querySelector(`[data-tab="${tabId}"]`);
  
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
  
    const text = document.createElement('div');
    text.className = 'task-text';
    text.textContent = taskText;
  
    const date = document.createElement('div');
    date.className = 'task-date';
    const now = new Date();
    date.textContent = `📅 ${now.toLocaleDateString()} - ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  
    // أزرار
    const actions = document.createElement('div');
    actions.className = 'task-actions';
  
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️ تحرير';
    editBtn.onclick = () => {
      const newText = prompt("تعديل المهمة:", text.textContent);
      if (newText) text.textContent = newText;
    };
  
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️ مسح';
    deleteBtn.className = 'delete';
    deleteBtn.onclick = () => {
      const pass = prompt("ادخل كلمة السر لمسح المهمة:");
      if (pass === 'tasker') taskItem.remove();
      else alert("كلمة السر غلط!");
    };
  
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
  
    taskItem.appendChild(text);
    taskItem.appendChild(date);
    taskItem.appendChild(actions);
  
    taskSection.appendChild(taskItem);
    input.value = '';
  }
  