(function () {
  const container = document.getElementById('sidebar-container');
  if (!container) return;

  if (typeof showLoader === 'function') showLoader();

  fetch('/components/sidebar.html')
    .then(function (res) {
      if (!res.ok) throw new Error('sidebar fetch failed');
      return res.text();
    })
    .then(function (html) {
      container.innerHTML = html;
      highlightActiveLink();
      initAdminInfo();
      initLogout();
      initMobileToggle();
      injectTopbar();
      if (typeof hideLoader === 'function') hideLoader();
    })
    .catch(function () {});

  function highlightActiveLink() {
    const path = window.location.pathname;
    const links = document.querySelectorAll('.sidebar__link[data-page]');
    links.forEach(function (link) {
      link.classList.remove('is-active');
      const page = link.getAttribute('data-page');
      if (
        (page === 'dashboard'  && path.includes('/dashboard/'))  ||
        (page === 'attendance' && path.includes('/attendance/')) ||
        (page === 'members'    && path.includes('/members/'))    ||
        (page === 'events'     && path.includes('/events/'))     ||
        (page === 'reports'    && path.includes('/reports/'))
      ) {
        link.classList.add('is-active');
      }
    });
  }

  function initAdminInfo() {
    var raw = localStorage.getItem('woh_admin');
    var name = 'Admin';
    if (raw) {
      try { name = JSON.parse(raw).display_name || 'Admin'; } catch (e) {}
    }
    var nameEl = document.getElementById('sidebar-user-name');
    var avatarEl = document.getElementById('sidebar-avatar');
    if (nameEl) nameEl.textContent = name;
    if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
  }

  function initLogout() {
    var btn = document.getElementById('sidebar-settings');
    if (!btn) return;
    btn.addEventListener('mouseenter', function () {
      btn.style.color = '#10b981';
      btn.style.background = '#ecfdf5';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.color = '#9ca3af';
      btn.style.background = 'none';
    });
  }

  function injectTopbar() {
    var appMain = document.querySelector('.app-main');
    if (!appMain) return;

    var existing = document.querySelector('.app-topbar');
    if (existing) {
      populateTopbar(existing);
      return;
    }

    var topbar = document.createElement('header');
    topbar.className = 'app-topbar';

    var left = document.createElement('div');
    left.className = 'app-topbar__left';

    var toggle = document.createElement('button');
    toggle.className = 'sidebar-toggle app-topbar__toggle';
    toggle.setAttribute('aria-label', 'Toggle navigation');
    toggle.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>';

    var title = document.createElement('span');
    title.className = 'app-topbar__title';
    title.id = 'topbar-title';

    left.appendChild(toggle);
    left.appendChild(title);

    var right = document.createElement('div');
    right.className = 'app-topbar__right';

    var datePill = document.createElement('span');
    datePill.className = 'app-topbar__date';
    datePill.textContent = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    var notifBtn = document.createElement('button');
    notifBtn.className = 'app-topbar__notif';
    notifBtn.id = 'notif-btn';
    notifBtn.setAttribute('aria-label', 'Notifications');
    notifBtn.style.position = 'relative';
    notifBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>'
      + '<span id="notif-badge" style="display:none;position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#ef4444;color:#fff;font-family:Inter,sans-serif;font-size:9px;font-weight:600;text-align:center;line-height:16px;pointer-events:none;"></span>';

    var notifDropdown = document.createElement('div');
    notifDropdown.id = 'notif-dropdown';
    notifDropdown.style.cssText = 'display:none;position:absolute;top:calc(100% + 8px);right:0;width:320px;background:#fff;border:1px solid #f0f0f0;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.08);z-index:999;';
    notifDropdown.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #f3f4f6;">'
      + '<span style="font-family:Inter,sans-serif;font-size:13px;font-weight:600;color:#1f2937;">Recent Activity</span>'
      + '<span id="notif-mark-read" style="font-family:Inter,sans-serif;font-size:12px;color:#10b981;cursor:pointer;">Mark all read</span>'
      + '</div>'
      + '<div id="notif-list" style="max-height:360px;overflow-y:auto;"></div>'
      + '<div style="padding:12px 16px;border-top:1px solid #f3f4f6;text-align:center;">'
      + '<span style="font-family:Inter,sans-serif;font-size:12px;color:#10b981;cursor:pointer;">View all</span>'
      + '</div>';

    var notifWrap = document.createElement('div');
    notifWrap.style.position = 'relative';
    notifWrap.appendChild(notifBtn);
    notifWrap.appendChild(notifDropdown);

    right.appendChild(datePill);
    right.appendChild(notifWrap);

    topbar.appendChild(left);
    topbar.appendChild(right);

    appMain.insertBefore(topbar, appMain.firstChild);
    populateTopbar(topbar);
  }

  function populateTopbar(topbar) {
    var titleEl = topbar.querySelector('#topbar-title') || topbar.querySelector('.app-topbar__title');
    if (!titleEl) return;
    var path = window.location.pathname;
    var map = {
      '/dashboard/': 'Dashboard',
      '/attendance/': 'Attendance',
      '/members/': 'Members',
      '/events/': 'Events',
      '/reports/': 'Reports',
      '/settings/': 'Settings'
    };
    Object.keys(map).forEach(function (key) {
      if (path.includes(key)) titleEl.textContent = map[key];
    });
    initNotifications();
  }

  var _notifOpen = false;
  var _notifInterval = null;

  function initNotifications() {
    var btn = document.getElementById('notif-btn');
    var dropdown = document.getElementById('notif-dropdown');
    var markRead = document.getElementById('notif-mark-read');
    if (!btn || !dropdown) return;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      _notifOpen = !_notifOpen;
      dropdown.style.display = _notifOpen ? 'block' : 'none';
      if (_notifOpen) {
        fetchNotifications();
        _notifInterval = setInterval(fetchNotifications, 60000);
      } else {
        clearInterval(_notifInterval);
      }
    });

    document.addEventListener('click', function (e) {
      if (_notifOpen && !btn.contains(e.target) && !dropdown.contains(e.target)) {
        _notifOpen = false;
        dropdown.style.display = 'none';
        clearInterval(_notifInterval);
      }
    });

    if (markRead) {
      markRead.addEventListener('click', function () {
        var badge = document.getElementById('notif-badge');
        if (badge) badge.style.display = 'none';
        localStorage.setItem('woh_notif_read', Date.now());
      });
    }
  }

  function fetchNotifications() {
    var token = Auth.getToken();
    var list = document.getElementById('notif-list');
    var badge = document.getElementById('notif-badge');
    if (!list) return;

    fetch('http://localhost:3000/api/notifications', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!Array.isArray(data.notifications) || data.notifications.length === 0) {
          list.innerHTML = '<div style="padding:24px 16px;text-align:center;font-family:Inter,sans-serif;font-size:13px;color:#9ca3af;">No recent activity</div>';
          return;
        }

        var lastRead = parseInt(localStorage.getItem('woh_notif_read') || '0', 10);
        var unread = data.unread_count || 0;

        if (badge) {
          if (unread > 0 && lastRead === 0) {
            badge.textContent = unread > 9 ? '9+' : unread;
            badge.style.display = 'block';
          }
        }

        list.innerHTML = '';
        data.notifications.forEach(function (n) {
          var iconBg, iconColor, iconSvg;
          if (n.type === 'attendance') {
            iconBg = '#ecfdf5'; iconColor = '#10b981';
            iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
          } else if (n.type === 'registration') {
            iconBg = '#eff6ff'; iconColor = '#3b82f6';
            iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.75"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>';
          } else {
            iconBg = '#fefce8'; iconColor = '#d97706';
            iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';
          }

          var row = document.createElement('div');
          row.style.cssText = 'display:flex;align-items:flex-start;gap:10px;padding:12px 16px;border-bottom:1px solid #f9fafb;cursor:pointer;transition:background 0.15s;';
          row.addEventListener('mouseenter', function () { row.style.background = '#f9fafb'; });
          row.addEventListener('mouseleave', function () { row.style.background = ''; });

          var icon = '<div style="width:32px;height:32px;border-radius:50%;background:' + iconBg + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;color:' + iconColor + ';">' + iconSvg + '</div>';
          var sub = n.subtitle ? '<div style="font-family:Inter,sans-serif;font-size:12px;color:#6b7280;margin:2px 0 0;">' + n.subtitle + '</div>' : '';
          var content = '<div style="flex:1;">'
            + '<div style="font-family:Inter,sans-serif;font-size:13px;font-weight:500;color:#1f2937;margin:0;">' + n.title + '</div>'
            + sub
            + '<div style="font-family:Inter,sans-serif;font-size:11px;color:#9ca3af;margin:2px 0 0;">' + n.date + ' · ' + n.time + '</div>'
            + '</div>';

          row.innerHTML = icon + content;
          list.appendChild(row);
        });
      })
      .catch(function () {
        var list2 = document.getElementById('notif-list');
        if (list2) list2.innerHTML = '<div style="padding:24px 16px;text-align:center;font-family:Inter,sans-serif;font-size:13px;color:#9ca3af;">No recent activity</div>';
      });
  }

  function initMobileToggle() {
    var sidebar = document.querySelector('.sidebar');
    var overlay = document.querySelector('.sidebar-overlay');

    function openSidebar() {
      if (sidebar) sidebar.classList.add('is-open');
      if (overlay) overlay.classList.add('is-visible');
      document.body.classList.add('sidebar-open');
    }

    function closeSidebar() {
      if (sidebar) sidebar.classList.remove('is-open');
      if (overlay) overlay.classList.remove('is-visible');
      document.body.classList.remove('sidebar-open');
    }

    document.addEventListener('click', function (e) {
      var toggle = e.target.closest('.sidebar-toggle');
      if (toggle) {
        sidebar && sidebar.classList.contains('is-open') ? closeSidebar() : openSidebar();
      }
    });

    if (overlay) overlay.addEventListener('click', closeSidebar);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSidebar();
    });

    document.querySelectorAll('.sidebar__link').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth < 768) closeSidebar();
      });
    });

    // Close sidebar and unlock scroll on resize to desktop
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (window.innerWidth >= 768) {
          closeSidebar();
        }
      }, 250);
    });
  }
})();
