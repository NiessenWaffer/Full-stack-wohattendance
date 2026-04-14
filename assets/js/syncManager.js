const SyncManager = (() => {
  let isSyncing = false;

  function getAuthHeaders() {
    const token = localStorage.getItem('woh_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  async function syncOne(entry) {
    const response = await fetch('/api/attendance/scan', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ qr_code: entry.qrValue })
    });
    const data = await response.json();
    if (data.status === 'success' || data.status === 'duplicate') {
      return true;
    }
    return false;
  }

  async function syncAll() {
    if (isSyncing || !navigator.onLine) return;
    const queue = OfflineQueue.getQueue();
    if (queue.length === 0) return;

    isSyncing = true;
    updateSyncBadge();

    for (const entry of queue) {
      try {
        const ok = await syncOne(entry);
        if (ok) {
          OfflineQueue.dequeue(entry.id);
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    isSyncing = false;
    updateSyncBadge();

    const remaining = OfflineQueue.count();
    if (remaining === 0) {
      const tableBody = document.querySelector('.attendance-table tbody');
      if (tableBody && typeof loadTodayAttendance === 'function') {
        loadTodayAttendance(tableBody, false);
      }
    }
  }

  function updateSyncBadge() {
    const badge = document.getElementById('offline-sync-badge');
    if (!badge) return;
    const count = OfflineQueue.count();
    if (count > 0) {
      badge.textContent = `${count} pending sync`;
      badge.removeAttribute('hidden');
    } else {
      badge.setAttribute('hidden', '');
    }
  }

  function init() {
    window.addEventListener('online', () => {
      updateSyncBadge();
      syncAll();
    });
    window.addEventListener('offline', () => {
      updateSyncBadge();
    });
    updateSyncBadge();
    if (navigator.onLine && OfflineQueue.count() > 0) {
      syncAll();
    }
  }

  return { init, syncAll, updateSyncBadge };
})();
