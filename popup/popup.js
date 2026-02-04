const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

const state = {
  currentTab: null,
  notebooks: [],
  selectedNotebook: null,
  isConnected: false
};

async function init() {
  await loadCurrentTab();
  await loadNotebooks();
  setupEventListeners();
}

async function loadCurrentTab() {
  try {
    const response = await sendMessage({ cmd: 'get-current-tab' });
    if (response.tab) {
      state.currentTab = response.tab;
      updatePageUI();
    }
  } catch (error) {
    console.error('Failed to load tab:', error);
  }
}

async function loadNotebooks() {
  try {
    setConnectionStatus('connecting');
    
    const response = await sendMessage({ cmd: 'list-notebooks' });
    
    if (response.error) {
      setConnectionStatus('error', response.error);
      return;
    }
    
    state.notebooks = response.notebooks || [];
    state.isConnected = true;
    setConnectionStatus('connected');
    
    renderNotebookList();
    
    if (state.notebooks.length > 0) {
      selectNotebook(state.notebooks[0]);
    }
    
  } catch (error) {
    console.error('Failed to load notebooks:', error);
    setConnectionStatus('error', 'Connection failed');
  }
}

function setConnectionStatus(status, message) {
  const indicator = document.getElementById('status-indicator');
  const text = document.getElementById('status-text');
  
  indicator.className = 'status-indicator';
  
  if (status === 'connecting') {
    text.textContent = 'Connecting...';
  } else if (status === 'connected') {
    indicator.classList.add('connected');
    text.textContent = 'Connected';
  } else if (status === 'error') {
    text.textContent = message || 'Not connected';
  }
}

function updatePageUI() {
  if (!state.currentTab) return;
  
  const title = state.currentTab.title || 'Untitled';
  document.getElementById('page-title').textContent = title;
  document.getElementById('page-title').title = title; // Tooltip для полного текста
  
  try {
    const url = new URL(state.currentTab.url);
    document.getElementById('page-url').textContent = url.hostname;
    document.getElementById('page-url').title = state.currentTab.url; // Tooltip
  } catch {
    document.getElementById('page-url').textContent = state.currentTab.url;
  }
  
  // Определение типа страницы YouTube
  detectYouTubePage();
}

function detectYouTubePage() {
  if (!state.currentTab) return;
  
  const url = state.currentTab.url;
  const isPlaylist = url.includes('youtube.com/playlist?list=');
  const isVideo = url.includes('youtube.com/watch?v=');
  const isChannel = url.includes('youtube.com/@') || url.includes('youtube.com/channel/') || url.includes('youtube.com/c/') || url.includes('youtube.com/user/');
  
  // Показать/скрыть YouTube-специфичные кнопки
  const addBtn = document.getElementById('add-btn');
  const addBtnText = addBtn.querySelector('.btn-text');
  
  if (isPlaylist) {
    addBtnText.textContent = '📋 Import Playlist';
    addBtn.title = 'Import all videos from this playlist (up to 50)';
  } else if (isChannel) {
    addBtnText.textContent = '📺 Import Channel';
    addBtn.title = 'Import recent videos from this channel (up to 50)';
  } else if (isVideo) {
    addBtnText.textContent = '🎬 Add Video';
    addBtn.title = 'Add this YouTube video';
  } else {
    addBtnText.textContent = 'Add to Notebook';
    addBtn.title = 'Add this page to notebook';
  }
}

function renderNotebookList() {
  const select = document.getElementById('notebook-select');
  
  if (state.notebooks.length === 0) {
    select.innerHTML = '<option value="">No notebooks found</option>';
    return;
  }
  
  select.innerHTML = state.notebooks.map(nb => 
    `<option value="${nb.id}">${nb.emoji || '📔'} ${escapeHtml(nb.name)}</option>`
  ).join('');
}

function selectNotebook(notebook) {
  state.selectedNotebook = notebook;
  document.getElementById('notebook-select').value = notebook.id;
  document.getElementById('add-btn').disabled = false;
}

function setupEventListeners() {
  const select = document.getElementById('notebook-select');
  select.addEventListener('change', (e) => {
    const nb = state.notebooks.find(n => n.id === e.target.value);
    if (nb) selectNotebook(nb);
  });
  
  document.getElementById('add-btn').addEventListener('click', handleAddToNotebook);
}

async function handleAddToNotebook() {
  if (!state.selectedNotebook || !state.currentTab) return;
  
  const url = state.currentTab.url;
  const isPlaylist = url.includes('youtube.com/playlist?list=');
  const isChannel = url.includes('youtube.com/@') || url.includes('youtube.com/channel/') || url.includes('youtube.com/c/') || url.includes('youtube.com/user/');
  
  if (isPlaylist) {
    // Import playlist
    showLoadingState('Fetching playlist videos...');
    
    try {
      const response = await sendMessage({
        cmd: 'import-playlist',
        notebookId: state.selectedNotebook.id,
        url: state.currentTab.url
      });
      
      if (response.error) {
        showErrorState(response.error);
        return;
      }
      
      showSuccessState(`Added ${response.count} videos!`);
      
      setTimeout(() => {
        hideAllStates();
      }, 3000);
      
    } catch (error) {
      showErrorState(error.message || 'Failed to import playlist');
    }
    
  } else if (isChannel) {
    // Import channel
    showLoadingState('Fetching channel videos...');
    
    try {
      const response = await sendMessage({
        cmd: 'import-channel',
        notebookId: state.selectedNotebook.id,
        url: state.currentTab.url
      });
      
      if (response.error) {
        showErrorState(response.error);
        return;
      }
      
      showSuccessState(`Added ${response.count} videos from channel!`);
      
      setTimeout(() => {
        hideAllStates();
      }, 3000);
      
    } catch (error) {
      showErrorState(error.message || 'Failed to import channel');
    }
    
  } else {
    // Add single page/video
    showLoadingState('Adding to notebook...');
    
    try {
      const response = await sendMessage({
        cmd: 'add-source',
        notebookId: state.selectedNotebook.id,
        url: state.currentTab.url
      });
      
      if (response.error) {
        showErrorState(response.error);
        return;
      }
      
      showSuccessState();
      
      setTimeout(() => {
        hideAllStates();
      }, 3000);
      
    } catch (error) {
      showErrorState(error.message || 'Failed to add to notebook');
    }
  }
}

function hideAllStates() {
  document.getElementById('add-btn').classList.remove('hidden');
  document.getElementById('loading-state').classList.add('hidden');
  document.getElementById('success-state').classList.add('hidden');
  document.getElementById('error-state').classList.add('hidden');
}

function showLoadingState(message) {
  document.getElementById('add-btn').classList.add('hidden');
  document.getElementById('loading-state').classList.remove('hidden');
  document.getElementById('success-state').classList.add('hidden');
  document.getElementById('error-state').classList.add('hidden');
  document.getElementById('loading-text').textContent = message;
}

function showSuccessState(message = 'Added successfully!') {
  document.getElementById('add-btn').classList.add('hidden');
  document.getElementById('loading-state').classList.add('hidden');
  document.getElementById('success-state').classList.remove('hidden');
  document.getElementById('error-state').classList.add('hidden');
  
  const successText = document.querySelector('.success-text');
  if (successText) {
    successText.textContent = message;
  }
}

function showErrorState(message) {
  document.getElementById('add-btn').classList.add('hidden');
  document.getElementById('loading-state').classList.add('hidden');
  document.getElementById('success-state').classList.add('hidden');
  document.getElementById('error-state').classList.remove('hidden');
  document.getElementById('error-text').textContent = message;
}

function sendMessage(message) {
  return new Promise((resolve, reject) => {
    browserAPI.runtime.sendMessage(message, response => {
      if (browserAPI.runtime.lastError) {
        reject(new Error(browserAPI.runtime.lastError.message));
      } else {
        resolve(response || {});
      }
    });
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
