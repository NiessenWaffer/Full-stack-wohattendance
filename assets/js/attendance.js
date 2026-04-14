let scanner;
let lastScanTime = 0;
let markedToday = new Set();

function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${Auth.getToken()}`
  };
}

function handle401(res) {
  return Auth.handle401(res);
}

function getTodayDateString() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function initializeMarkedToday() {
  const storedDate = localStorage.getItem('woh_marked_today_date');
  const todayDate = getTodayDateString();
  if (storedDate !== todayDate) {
    markedToday.clear();
    localStorage.setItem('woh_marked_today_date', todayDate);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeMarkedToday();
  
  const scanBtn = document.querySelector('.scan-card');
  const scannerModal = document.getElementById('scanner-modal');
  const scannerClose = document.getElementById('scanner-close');
  const qrReader = document.getElementById('qr-reader');
  const scanResult = document.getElementById('scan-result');
  const scanResultName = document.getElementById('scan-result__name');
  const scanResultMinistry = document.getElementById('scan-result__ministry');
  const scanResultTime = document.getElementById('scan-result__time');
  const searchInput = document.querySelector('.search-field__input');
  const searchField = document.querySelector('.search-field');
  const tableBody = document.querySelector('.attendance-table tbody');

  if (scanBtn) {
    scanBtn.addEventListener('click', () => {
      if (scanner) return;
      if (Date.now() - lastScanTime < 2000) return;
      scannerModal.removeAttribute('hidden');
      startScanner(qrReader, scannerModal, scanResultName, scanResultMinistry, scanResultTime, scanResult);
    });
  }

  if (scannerClose) {
    scannerClose.addEventListener('click', () => {
      stopScanner();
      scannerModal.setAttribute('hidden', '');
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keyup', async (e) => {
      const query = e.target.value.trim();
      removeSearchDropdown(searchField);

      if (query.length < 2) {
        return;
      }

      try {
        const response = await fetch(`/api/attendance/members/search?q=${encodeURIComponent(query)}`, {
          headers: getAuthHeaders()
        });
        const data = await response.json();
        console.log('Search response status:', response.status, 'ok:', response.ok, 'data:', data);
        if (!response.ok) {
          return;
        }

        const members = Array.isArray(data.members) ? data.members : [];
        if (members.length === 0) {
          return;
        }

        const dropdown = document.createElement('ul');
        dropdown.className = 'search-dropdown';

        members.forEach((member) => {
          const li = document.createElement('li');
          li.textContent = `${member.first_name} ${member.last_name} — ${member.ministry}`;
          li.addEventListener('click', () => {
            searchInput.value = '';
            removeSearchDropdown(searchField);
            openConfirmModal(member);
          });
          dropdown.appendChild(li);
        });

        searchField.appendChild(dropdown);
      } catch (error) {
        // ignore
      }
    });

    searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        removeSearchDropdown(searchField);
      }, 100);
    });
  }

  const confirmModal = document.getElementById('confirm-modal');
  const confirmName = document.getElementById('confirm-name');
  const confirmMinistry = document.getElementById('confirm-ministry');
  const confirmYes = document.getElementById('confirm-yes');
  const confirmNo = document.getElementById('confirm-no');
  const confirmBackdrop = document.getElementById('confirm-backdrop');
  const confirmDuplicate = document.getElementById('confirm-duplicate');
  const confirmDupName = document.getElementById('confirm-dup-name');
  const confirmDupOk = document.getElementById('confirm-dup-ok');
  const confirmDefault = document.querySelector('.confirm-modal__default');
  let pendingMember = null;

  function openConfirmModal(member) {
    pendingMember = member;
    confirmName.textContent = `${member.first_name} ${member.last_name}`;
    confirmMinistry.textContent = member.ministry;
    confirmDefault.removeAttribute('hidden');
    confirmDuplicate.setAttribute('hidden', '');
    confirmModal.removeAttribute('hidden');
  }

  function showDuplicateInModal(memberName) {
    confirmDupName.textContent = memberName;
    confirmDefault.setAttribute('hidden', '');
    confirmDuplicate.removeAttribute('hidden');
  }

  function closeConfirmModal() {
    confirmModal.setAttribute('hidden', '');
    confirmDefault.removeAttribute('hidden');
    confirmDuplicate.setAttribute('hidden', '');
    pendingMember = null;
  }

  confirmNo.addEventListener('click', closeConfirmModal);
  confirmBackdrop.addEventListener('click', closeConfirmModal);
  confirmDupOk.addEventListener('click', closeConfirmModal);

  confirmYes.addEventListener('click', async () => {
    if (!pendingMember) return;
    const member = pendingMember;
    try {
      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ member_id: member.id })
      });
      const data = await response.json();
      if (data.status === 'success') {
        closeConfirmModal();
        searchInput.value = '';
        removeSearchDropdown(searchField);
        showMessage(`${data.member.first_name} ${data.member.last_name} marked present`, 'success');
        markedToday.add(data.member.id);
        loadTodayAttendance(tableBody, true);
      } else if (data.status === 'duplicate') {
        showDuplicateInModal(`${member.first_name} ${member.last_name}`);
      } else {
        closeConfirmModal();
        showMessage('Something went wrong', 'error');
      }
    } catch (error) {
      closeConfirmModal();
      showMessage('Something went wrong', 'error');
    }
  });

  loadTodayAttendance(tableBody);

  if (typeof SyncManager !== 'undefined') SyncManager.init();
});

function startScanner(qrReader, scannerModal, scanResultName, scanResultMinistry, scanResultTime, scanResult) {
  if (typeof Html5Qrcode === 'undefined') {
    return;
  }

  scanResult.classList.remove('is-visible');
  scanResultName.textContent = '';
  scanResultMinistry.textContent = '';
  scanResultTime.textContent = '';

  let scanning = false;

  scanner = new Html5Qrcode('qr-reader');
  scanner.start(
    { facingMode: 'environment' },
    {
      fps: 30,
      qrbox: (viewfinderWidth, viewfinderHeight) => {
        const size = Math.min(viewfinderWidth, viewfinderHeight) * 0.7;
        return { width: Math.floor(size), height: Math.floor(size) };
      },
      aspectRatio: 1.777,
      disableFlip: false,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      },
      rememberLastUsedCamera: true
    },
    async (decodedText) => {
      if (scanning) return;
      scanning = true;
      try {
        const qrCode = decodedText.trim();

        if (!navigator.onLine) {
          const queued = typeof OfflineQueue !== 'undefined' && OfflineQueue.enqueue({
            id: `${qrCode}-${Date.now()}`,
            qrValue: qrCode,
            date: new Date().toISOString().slice(0, 10),
            timestamp: new Date().toISOString()
          });
          if (queued) {
            playBeep();
            const flash = document.getElementById('scanner-flash');
            if (flash) { flash.classList.remove('is-flashing'); void flash.offsetWidth; flash.classList.add('is-flashing'); }
            showMessage('Saved Offline — will sync automatically', 'success');
            if (typeof SyncManager !== 'undefined') SyncManager.updateSyncBadge();
          } else {
            showMessage('Already queued for today', 'error');
          }
          setTimeout(() => { scanning = false; }, 2000);
          return;
        }

        const response = await fetch('/api/attendance/scan', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ qr_code: qrCode })
        });

        const data = await response.json();
        if (!response.ok) {
          if (data.status === 'duplicate' && data.message === 'Already exists in today\'s attendance') {
            showDuplicateMessageInModal(scannerModal, data.member_name);
            markedToday.add(data.member_id);
          }
          scanning = false;
          return;
        }

        const { first_name, last_name, ministry, id: member_id, status } = data.member;
        const attendance_time = data.attendance_time;

        const flash = document.getElementById('scanner-flash');
        const frame = document.querySelector('.scanner-modal__frame');
        const scanline = document.querySelector('.scanner-modal__scanline');
        playBeep();
        if (flash) {
          flash.classList.remove('is-flashing');
          void flash.offsetWidth;
          flash.classList.add('is-flashing');
        }
        if (frame) frame.classList.add('is-success');
        if (scanline) scanline.classList.add('is-hidden');
        setTimeout(() => {
          if (frame) frame.classList.remove('is-success');
          if (scanline) scanline.classList.remove('is-hidden');
        }, 600);

        scanResultName.textContent = `${first_name} ${last_name}`;
        // Show ministry + visitor badge if first-timer
        const isVisitor = !status || status === 'visitor';
        scanResultMinistry.innerHTML = ministry + (isVisitor
          ? ' &nbsp;<span class="status-badge status-badge--visitor">Visitor</span>'
          : ' &nbsp;<span class="status-badge status-badge--active">Active</span>');
        scanResultTime.textContent = formatTime(attendance_time);
        scanResult.classList.add('is-visible');

        markedToday.add(member_id);

        setTimeout(() => {
          scanResult.classList.remove('is-visible');
        }, 2000);

        loadTodayAttendance(document.querySelector('.attendance-table tbody'), true);
        lastScanTime = Date.now();
        setTimeout(() => { scanning = false; }, 2000);
      } catch (error) {
        scanning = false;
      }
    },
    (error) => {
      // ignore
    }
  ).then(() => {
    try {
      const settings = scanner.getRunningTrackSettings();
      const constraints = {};
      if ('zoom' in settings) constraints.zoom = 1;
      if ('focusMode' in settings) {
        constraints.focusMode = 'continuous';
        constraints.advanced = [{ focusMode: 'continuous' }];
      }
      if ('focusDistance' in settings) {
        constraints.focusDistance = 0;
      }
      if (Object.keys(constraints).length > 0) {
        scanner.applyVideoConstraints(constraints).catch(() => {});
      }
    } catch (e) {}
  }).catch(() => {});
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1046, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.18);
  } catch (e) {}
}

function stopScanner() {
  if (scanner) {
    scanner.stop().catch(() => {});
    scanner = null;
  }
}

function formatTime(time) {
  if (!time) return time;
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHours = h > 12 ? h - 12 : (h === 0 ? 12 : h);
  return `${displayHours}:${minutes} ${ampm}`;
}

async function loadTodayAttendance(tableBody, flashNew = false) {
  if (!tableBody) {
    return;
  }

  try {
    const response = await fetch('/api/attendance/today', {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (handle401(response) || !response.ok) {
      return;
    }

    const rows = Array.isArray(data.records) ? data.records : [];
    tableBody.innerHTML = '';

    rows.forEach((row, index) => {
      markedToday.add(row.member_id);
      const tr = document.createElement('tr');
      if (flashNew && index === 0) {
        tr.classList.add('row-new');
      }
      const nameTd = document.createElement('td');
      nameTd.textContent = `${row.first_name} ${row.last_name}`;
      const statusTd = document.createElement('td');
      const isVisitor = !row.status || row.status === 'visitor';
      statusTd.innerHTML = isVisitor
        ? '<span class="status-badge status-badge--visitor">Visitor</span>'
        : '<span class="status-badge status-badge--active">Active</span>';
      const ministryTd = document.createElement('td');
      ministryTd.className = 'col-ministry';
      ministryTd.textContent = row.ministry;
      const dateTd = document.createElement('td');
      dateTd.className = 'col-date';
      dateTd.textContent = row.attendance_date ? new Date(row.attendance_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
      const timeTd = document.createElement('td');
      timeTd.className = 'col-time';
      timeTd.textContent = formatTime(row.attendance_time);
      tr.appendChild(nameTd);
      tr.appendChild(statusTd);
      tr.appendChild(ministryTd);
      tr.appendChild(dateTd);
      tr.appendChild(timeTd);
      tableBody.appendChild(tr);
    });
  } catch (error) {
    // ignore
  }
}

function removeSearchDropdown(searchField) {
  const dropdown = searchField.querySelector('.search-dropdown');
  if (dropdown) {
    dropdown.remove();
  }
}

function showMessage(message, type) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;

  const icon = document.createElement('span');
  icon.className = 'message__icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = type === 'success' ? '✓' : '✕';

  const text = document.createElement('span');
  text.className = 'message__text';
  text.textContent = message;

  const progress = document.createElement('span');
  progress.className = 'message__progress';

  messageDiv.appendChild(icon);
  messageDiv.appendChild(text);
  messageDiv.appendChild(progress);
  document.body.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.classList.add('is-hiding');
    setTimeout(() => messageDiv.remove(), 250);
  }, 3000);
}

function showDuplicateMessageInModal(scannerModal, memberName) {
  const messageDiv = document.createElement('div');
  messageDiv.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #FFFBEB;
    border: 1px solid #F59E0B;
    border-radius: 8px;
    padding: 12px 16px;
    color: #92400E;
    font-family: Inter, sans-serif;
    font-size: 13px;
    text-align: center;
    z-index: 9999;
    max-width: 280px;
  `;
  messageDiv.textContent = 'Already exists in today\'s attendance';
  
  const container = document.querySelector('.scanner-modal__box');
  container.style.position = 'relative';
  container.appendChild(messageDiv);
  
  setTimeout(() => {
    messageDiv.remove();
    lastScanTime = Date.now();
  }, 2500);
}

