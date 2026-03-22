// Main Popup Logic

document.addEventListener('DOMContentLoaded', async () => {
  const input = document.getElementById('input');
  const saveBtn = document.getElementById('saveBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const thoughtCount = document.getElementById('thoughtCount');
  const thoughtList = document.getElementById('thoughtList');
  const tagsPreview = document.getElementById('tagsPreview');
  
  // Settings modal
  const settingsModal = document.getElementById('settingsModal');
  const closeSettings = document.getElementById('closeSettings');
  
  // Settings fields
  const useRealAI = document.getElementById('useRealAI');
  const apiUrl = document.getElementById('apiUrl');
  const modelName = document.getElementById('modelName');
  const apiKey = document.getElementById('apiKey');
  const exportBtn = document.getElementById('exportBtn');
  const clearBtn = document.getElementById('clearBtn');

  // Load settings
  const settings = await window.storageService.getSettings();
  useRealAI.checked = settings.useRealAI;
  apiUrl.value = settings.apiUrl || '';
  modelName.value = settings.modelName || '';
  apiKey.value = settings.apiKey || '';
  
  await window.analyzer.setSettings(settings);
  await renderThoughts();

  // Input event for tag preview
  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const text = input.value.trim();
      if (text) {
        const result = await window.analyzer.analyze(text);
        renderTags(result.tags);
      } else {
        tagsPreview.innerHTML = '';
      }
    }, 300);
  });

  // Keyboard shortcuts
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveThought();
    }
  });

  // Save button
  saveBtn.addEventListener('click', saveThought);

  async function saveThought() {
    const content = input.value.trim();
    if (!content) return;

    const result = await window.analyzer.analyze(content);
    
    await window.storageService.saveThought({
      content,
      tags: result.tags
    });

    input.value = '';
    tagsPreview.innerHTML = '';
    await renderThoughts();
  }

  async function renderThoughts() {
    const thoughts = await window.storageService.getThoughts();
    thoughtCount.textContent = thoughts.length;

    if (thoughts.length === 0) {
      thoughtList.innerHTML = '<div class="empty-state">暂无闪念<br>记录你的第一个想法...</div>';
      return;
    }

    thoughtList.innerHTML = thoughts.slice(0, 10).map(thought => `
      <div class="thought-item">
        <div class="thought-content">${escapeHtml(thought.content.substring(0, 100))}${thought.content.length > 100 ? '...' : ''}</div>
        <div class="thought-tags">
          ${thought.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <div class="thought-time">${formatTime(thought.createdAt)}</div>
      </div>
    `).join('');
  }

  function renderTags(tags) {
    const colors = {
      dev: '#a855f7',
      life: '#f472b6',
      learning: '#60a5fa',
      health: '#34d399',
      work: '#fbbf24',
      task: '#fcd34d',
      idea: '#22d3ee',
      finance: '#f87171',
      untagged: '#71717a'
    };

    tagsPreview.innerHTML = tags.map(tag => {
      const color = colors[tag] || colors.untagged;
      return `<span class="tag" style="border-color: ${color}40; color: ${color}">${tag}</span>`;
    }).join('');
  }

  function formatTime(timestamp) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Settings modal
  settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('active');
  });

  closeSettings.addEventListener('click', () => {
    settingsModal.classList.remove('active');
  });

  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.remove('active');
    }
  });

  // Save settings
  const settingsInputs = [useRealAI, apiUrl, modelName, apiKey];
  settingsInputs.forEach(el => {
    el.addEventListener('change', saveSettings);
    el.addEventListener('input', saveSettings);
  });

  async function saveSettings() {
    const newSettings = {
      useRealAI: useRealAI.checked,
      apiUrl: apiUrl.value.trim(),
      modelName: modelName.value.trim(),
      apiKey: apiKey.value.trim()
    };
    
    await window.storageService.saveSettings(newSettings);
    await window.analyzer.setSettings(newSettings);
  }

  // Export data
  exportBtn.addEventListener('click', async () => {
    const thoughts = await window.storageService.getThoughts();
    const data = JSON.stringify(thoughts, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `brain-dump-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
  });

  // Clear data
  clearBtn.addEventListener('click', async () => {
    if (confirm('确定要清空所有闪念吗？此操作不可恢复。')) {
      await window.storageService.clearAll();
      await renderThoughts();
      settingsModal.classList.remove('active');
    }
  });

  // Focus input on load
  input.focus();
});
