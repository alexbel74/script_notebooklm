// Content script for NotebookLM - Bulk Delete Sources

(function() {
  'use strict';

  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
  
  let deleteButton = null;
  let isEnabled = true;
  let observer = null;

  async function checkEnabled() {
    try {
      const result = await browserAPI.storage.sync.get(['enableBulkDelete']);
      isEnabled = result.enableBulkDelete !== false;
      return isEnabled;
    } catch (e) {
      return true;
    }
  }

  function getSelectedSources() {
    const selected = [];
    const containers = document.querySelectorAll('.single-source-container');

    containers.forEach(container => {
      const checkbox = container.querySelector('mat-checkbox');
      const isChecked = checkbox?.classList?.contains('mat-mdc-checkbox-checked') ||
                        container.querySelector('input[type="checkbox"]:checked') !== null;

      if (isChecked) {
        const menuButton = container.querySelector('[id^="source-item-more-button-"]');
        if (menuButton) {
          const buttonId = menuButton.getAttribute('id');
          const sourceId = buttonId.replace('source-item-more-button-', '');
          if (sourceId && sourceId.match(/^[a-f0-9-]{36}$/i)) {
            selected.push(sourceId);
          }
        }
      }
    });

    return [...new Set(selected)];
  }

  function getNotebookId() {
    const match = window.location.pathname.match(/\/notebook\/([a-f0-9-]+)/i);
    return match ? match[1] : null;
  }

  function createDeleteButton() {
    if (deleteButton) return deleteButton;

    deleteButton = document.createElement('button');
    deleteButton.id = 'nlm-bulk-delete-btn';
    deleteButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
      <span>Delete Selected</span>
    `;
    
    Object.assign(deleteButton.style, {
      display: 'none',
      alignItems: 'center',
      gap: '8px',
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)',
      color: '#ef4444',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '50px',
      padding: '10px 20px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      transition: 'all 0.2s ease',
      marginLeft: '12px',
      whiteSpace: 'nowrap',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 16px rgba(239, 68, 68, 0.2)',
      position: 'fixed',
      top: '80px',
      right: '24px',
      zIndex: '10000'
    });

    deleteButton.addEventListener('mouseenter', () => {
      deleteButton.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(220, 38, 38, 0.25) 100%)';
      deleteButton.style.transform = 'translateY(-2px)';
      deleteButton.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.3)';
    });

    deleteButton.addEventListener('mouseleave', () => {
      deleteButton.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)';
      deleteButton.style.transform = 'translateY(0)';
      deleteButton.style.boxShadow = '0 4px 16px rgba(239, 68, 68, 0.2)';
    });

    deleteButton.addEventListener('click', handleDeleteClick);
    document.body.appendChild(deleteButton);

    return deleteButton;
  }

  async function handleDeleteClick() {
    const selectedSources = getSelectedSources();
    const notebookId = getNotebookId();

    if (selectedSources.length === 0 || !notebookId) return;

    const lang = document.documentElement.lang || 'en';
    const confirmMsg = lang.startsWith('ru')
      ? `Удалить ${selectedSources.length} источник(ов)? Это действие нельзя отменить.`
      : `Delete ${selectedSources.length} source(s)? This cannot be undone.`;

    if (!confirm(confirmMsg)) return;

    deleteButton.disabled = true;
    const deletingText = lang.startsWith('ru') ? 'Удаление...' : 'Deleting...';
    deleteButton.innerHTML = `<span class="spinner"></span> ${deletingText}`;
    deleteButton.style.opacity = '0.6';
    deleteButton.style.cursor = 'wait';

    try {
      const response = await browserAPI.runtime.sendMessage({
        cmd: 'delete-sources',
        notebookId: notebookId,
        sourceIds: selectedSources
      });

      if (response?.error) {
        alert('Error: ' + response.error);
        resetButton();
      } else {
        const successCount = response?.successCount || selectedSources.length;
        const successMsg = lang.startsWith('ru') ? `✓ Удалено: ${successCount}` : `✓ Deleted: ${successCount}`;
        deleteButton.innerHTML = successMsg;
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error: ' + error.message);
      resetButton();
    }
  }

  function resetButton() {
    if (!deleteButton) return;
    deleteButton.disabled = false;
    deleteButton.style.opacity = '1';
    deleteButton.style.cursor = 'pointer';
    updateButtonVisibility();
  }

  function updateButtonVisibility() {
    if (!isEnabled) {
      if (deleteButton) deleteButton.style.display = 'none';
      return;
    }

    const selectedSources = getSelectedSources();

    if (!deleteButton) createDeleteButton();

    if (selectedSources.length > 0) {
      const lang = document.documentElement.lang || 'en';
      const text = lang.startsWith('ru')
        ? `Удалить (${selectedSources.length})`
        : `Delete (${selectedSources.length})`;

      deleteButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
        <span>${text}</span>
      `;
      deleteButton.style.display = 'flex';
    } else {
      deleteButton.style.display = 'none';
    }
  }

  function startObserver() {
    if (observer) observer.disconnect();

    observer = new MutationObserver(() => {
      clearTimeout(observer._timeout);
      observer._timeout = setTimeout(updateButtonVisibility, 150);
    });

    const config = {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'aria-checked']
    };

    const sourcePanel = document.querySelector('.source-panel') || document.body;
    observer.observe(sourcePanel, config);
  }

  async function init() {
    const enabled = await checkEnabled();
    if (!enabled) return;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        createDeleteButton();
        startObserver();
        setTimeout(updateButtonVisibility, 500);
      });
    } else {
      createDeleteButton();
      startObserver();
      setTimeout(updateButtonVisibility, 500);
    }

    document.addEventListener('click', () => {
      setTimeout(updateButtonVisibility, 100);
    });

    browserAPI.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync' && changes.enableBulkDelete) {
        isEnabled = changes.enableBulkDelete.newValue !== false;
        updateButtonVisibility();
      }
    });
  }

  init();
})();
