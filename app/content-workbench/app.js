// 任务数据存储
let tasks = [];
let currentEditingTaskId = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 从本地存储加载数据
    loadTasks();
    renderTasks();
    updateStats();

    // 绑定表单提交事件
    document.getElementById('taskForm').addEventListener('submit', handleAddTask);

    // 点击模态框背景关闭
    document.getElementById('statusModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeStatusModal();
        }
    });
});

// 添加任务
function handleAddTask(e) {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const channel = document.getElementById('channel').value;
    const status = document.getElementById('status').value;
    const publishTime = document.getElementById('publishTime').value;

    if (!title || !channel || !publishTime) {
        alert('请填写完整信息');
        return;
    }

    const task = {
        id: Date.now(),
        title,
        channel,
        status,
        publishTime: formatDateTime(publishTime),
        createdAt: new Date().toISOString()
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    updateStats();

    // 重置表单
    e.target.reset();
    // 重置状态为默认值
    document.getElementById('status').value = '未开始';
}

// 渲染任务列表
function renderTasks() {
    const tbody = document.getElementById('taskBody');
    const emptyState = document.getElementById('emptyState');

    tbody.innerHTML = '';

    if (tasks.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    tasks.forEach(task => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(task.title)}</td>
            <td>${escapeHtml(task.channel)}</td>
            <td><span class="status-badge ${getStatusClass(task.status)}">${escapeHtml(task.status)}</span></td>
            <td>${escapeHtml(task.publishTime)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-status" onclick="changeStatus(${task.id})">修改状态</button>
                    <button class="btn btn-delete" onclick="deleteTask(${task.id})">删除</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 更新统计数据
function updateStats() {
    const total = tasks.length;
    const notStart = tasks.filter(t => t.status === '未开始').length;
    const inProgress = tasks.filter(t => t.status === '进行中').length;
    const published = tasks.filter(t => t.status === '已发布').length;

    document.getElementById('totalCount').textContent = total;
    document.getElementById('notStartCount').textContent = notStart;
    document.getElementById('inProgressCount').textContent = inProgress;
    document.getElementById('publishedCount').textContent = published;
}

// 修改状态 - 打开模态框
function changeStatus(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        currentEditingTaskId = id;
        const modal = document.getElementById('statusModal');
        modal.classList.add('show');
    }
}

// 关闭状态选择模态框
function closeStatusModal() {
    const modal = document.getElementById('statusModal');
    modal.classList.remove('show');
    currentEditingTaskId = null;
}

// 选择状态
function selectStatus(newStatus) {
    if (currentEditingTaskId === null) return;

    const task = tasks.find(t => t.id === currentEditingTaskId);
    if (task) {
        task.status = newStatus;
        saveTasks();
        renderTasks();
        updateStats();
    }

    closeStatusModal();
}

// 删除任务
function deleteTask(id) {
    if (confirm('确定要删除这个任务吗？')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// 获取状态对应的CSS类
function getStatusClass(status) {
    const classMap = {
        '未开始': 'status-not-start',
        '进行中': 'status-in-progress',
        '已发布': 'status-published'
    };
    return classMap[status] || '';
}

// 格式化日期时间
function formatDateTime(dateTimeStr) {
    const date = new Date(dateTimeStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// HTML转义防止XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 保存到本地存储
function saveTasks() {
    localStorage.setItem('contentTasks', JSON.stringify(tasks));
}

// 从本地存储加载
function loadTasks() {
    const saved = localStorage.getItem('contentTasks');
    if (saved) {
        try {
            tasks = JSON.parse(saved);
        } catch (e) {
            tasks = [];
        }
    }
}
