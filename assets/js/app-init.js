/**
 * Centralized App Initialization
 * Ensures proper auth check and layout loading before page-specific code runs
 */

const AppInit = {
  _initialized: false,
  _layoutLoaded: false,
  _loadingDuration: 1000, // Default 1 second

  /**
   * Set custom loading duration (used by dashboard for post-login timing)
   */
  setLoadingDuration(duration) {
    this._loadingDuration = duration;
  },

  /**
   * Initialize the entire app with proper sequencing
   * Call this at the start of every protected page
   */
  async init() {
    if (this._initialized) {
      console.log('[APP-INIT] Already initialized');
      return true;
    }

    console.log('[APP-INIT] Starting initialization...');

    try {
      // Step 1: Verify authentication
      console.log('[APP-INIT] Step 1: Verifying authentication...');
      await Auth.initializeApp();

      // Step 2: Load layout (sidebar, topbar)
      console.log('[APP-INIT] Step 2: Loading layout...');
      await this.loadLayout();

      // Step 3: Mark as initialized
      this._initialized = true;
      console.log('[APP-INIT] ✓ Initialization complete');

      return true;
    } catch (err) {
      console.error('[APP-INIT] Initialization failed:', err);
      // Auth module will handle redirect
      return false;
    }
  },

  /**
   * Show content-only loader (keeps sidebar visible)
   */
  showContentLoader() {
    if (typeof showLoader === 'function') {
      showLoader();
    }
  },

  /**
   * Hide content-only loader
   */
  hideContentLoader() {
    if (typeof hideLoader === 'function') {
      setTimeout(hideLoader, this._loadingDuration); // Use custom duration
    }
  },

  /**
   * Load sidebar and topbar
   */
  async loadLayout() {
    if (this._layoutLoaded) {
      return true;
    }

    const container = document.getElementById('sidebar-container');
    if (!container) {
      console.warn('[APP-INIT] No sidebar container found');
      return true; // Not all pages have sidebar
    }

    try {
      // Fetch sidebar HTML first (without loader)
      const response = await fetch('/components/sidebar.html');
      if (!response.ok) {
        throw new Error('Failed to load sidebar');
      }

      const html = await response.text();
      container.innerHTML = html;

      // Now show content loader for the initialization phase
      this.showContentLoader();

      // Initialize sidebar components
      this.highlightActiveLink();
      this.initAdminInfo();
      this.initLogout();
      this.initMobileToggle();
      this.injectTopbar();

      this._layoutLoaded = true;
      console.log('[APP-INIT] Layout loaded successfully');

      return true;
    } catch (err) {
      console.error('[APP-INIT] Failed to load layout:', err);
      throw err;
    } finally {
      // Always hide loader, even on error
      this.hideContentLoader();
    }
  },

  highlightActiveLink() {
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
    
    // Initialize sidebar notifications
    this.initSidebarNotifications();
  },

  initAdminInfo() {
    const raw = localStorage.getItem('woh_admin');
    let name = 'Admin';
    if (raw) {
      try { 
        name = JSON.parse(raw).display_name || 'Admin'; 
      } catch (e) {
        console.warn('[APP-INIT] Failed to parse admin data');
      }
    }
    const nameEl = document.getElementById('sidebar-user-name');
    const avatarEl = document.getElementById('sidebar-avatar');
    if (nameEl) nameEl.textContent = name;
    if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
  },

  initLogout() {
    const btn = document.getElementById('sidebar-settings');
    if (!btn) return;
    btn.addEventListener('mouseenter', function () {
      btn.style.color = '#10b981';
      btn.style.background = '#ecfdf5';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.color = '#9ca3af';
      btn.style.background = 'none';
    });
  },

  injectTopbar() {
    const appMain = document.querySelector('.app-main');
    if (!appMain) return;

    const existing = document.querySelector('.app-topbar');
    if (existing) {
      this.populateTopbar(existing);
      return;
    }

    const topbar = document.createElement('header');
    topbar.className = 'app-topbar';

    const left = document.createElement('div');
    left.className = 'app-topbar__left';

    const toggle = document.createElement('button');
    toggle.className = 'sidebar-toggle app-topbar__toggle';
    toggle.setAttribute('aria-label', 'Toggle navigation');
    toggle.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>';

    const title = document.createElement('span');
    title.className = 'app-topbar__title';
    title.id = 'topbar-title';

    left.appendChild(toggle);
    left.appendChild(title);

    const right = document.createElement('div');
    right.className = 'app-topbar__right';

    const datePill = document.createElement('span');
    datePill.className = 'app-topbar__date';
    datePill.textContent = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const notifBtn = document.createElement('button');
    notifBtn.className = 'app-topbar__notif';
    notifBtn.id = 'notif-btn';
    notifBtn.setAttribute('aria-label', 'Notifications');
    notifBtn.style.position = 'relative';
    notifBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>'
      + '<span id="notif-badge" style="display:none;position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#ef4444;color:#fff;font-family:Inter,sans-serif;font-size:9px;font-weight:600;text-align:center;line-height:16px;pointer-events:none;"></span>';

    const notifDropdown = document.createElement('div');
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

    const notifWrap = document.createElement('div');
    notifWrap.style.position = 'relative';
    notifWrap.appendChild(notifBtn);
    notifWrap.appendChild(notifDropdown);

    right.appendChild(datePill);
    right.appendChild(notifWrap);

    topbar.appendChild(left);
    topbar.appendChild(right);

    appMain.insertBefore(topbar, appMain.firstChild);
    this.populateTopbar(topbar);
  },

  populateTopbar(topbar) {
    const titleEl = topbar.querySelector('#topbar-title') || topbar.querySelector('.app-topbar__title');
    if (!titleEl) return;
    const path = window.location.pathname;
    const map = {
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
    this.initNotifications();
  },

  _notifOpen: false,
  _notifInterval: null,

  initNotifications() {
    const btn = document.getElementById('notif-btn');
    const dropdown = document.getElementById('notif-dropdown');
    const markRead = document.getElementById('notif-mark-read');
    if (!btn || !dropdown) return;

    const self = this;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      self._notifOpen = !self._notifOpen;
      dropdown.style.display = self._notifOpen ? 'block' : 'none';
      if (self._notifOpen) {
        self.fetchNotifications();
        self._notifInterval = setInterval(() => self.fetchNotifications(), 60000);
      } else {
        clearInterval(self._notifInterval);
      }
    });

    document.addEventListener('click', function (e) {
      if (self._notifOpen && !btn.contains(e.target) && !dropdown.contains(e.target)) {
        self._notifOpen = false;
        dropdown.style.display = 'none';
        clearInterval(self._notifInterval);
      }
    });

    if (markRead) {
      markRead.addEventListener('click', function () {
        const badge = document.getElementById('notif-badge');
        if (badge) badge.style.display = 'none';
        localStorage.setItem('woh_notif_read', Date.now());
      });
    }
  },

  async fetchNotifications() {
    const list = document.getElementById('notif-list');
    const badge = document.getElementById('notif-badge');
    if (!list) return;

    try {
      // Use relative URL and Auth module for headers
      const response = await fetch('/api/notifications', {
        headers: Auth.getHeaders()
      });

      // Handle 401
      if (Auth.handle401(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();

      if (!Array.isArray(data.notifications) || data.notifications.length === 0) {
        list.innerHTML = '<div style="padding:24px 16px;text-align:center;font-family:Inter,sans-serif;font-size:13px;color:#9ca3af;">No recent activity</div>';
        return;
      }

      const lastRead = parseInt(localStorage.getItem('woh_notif_read') || '0', 10);
      const unread = data.unread_count || 0;

      if (badge) {
        if (unread > 0 && lastRead === 0) {
          badge.textContent = unread > 9 ? '9+' : unread;
          badge.style.display = 'block';
        }
      }

      list.innerHTML = '';
      data.notifications.forEach(function (n) {
        let iconBg, iconColor, iconSvg;
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

        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:flex-start;gap:10px;padding:12px 16px;border-bottom:1px solid #f9fafb;cursor:pointer;transition:background 0.15s;';
        row.addEventListener('mouseenter', function () { row.style.background = '#f9fafb'; });
        row.addEventListener('mouseleave', function () { row.style.background = ''; });

        const icon = '<div style="width:32px;height:32px;border-radius:50%;background:' + iconBg + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;color:' + iconColor + ';">' + iconSvg + '</div>';
        const sub = n.subtitle ? '<div style="font-family:Inter,sans-serif;font-size:12px;color:#6b7280;margin:2px 0 0;">' + n.subtitle + '</div>' : '';
        const content = '<div style="flex:1;">'
          + '<div style="font-family:Inter,sans-serif;font-size:13px;font-weight:500;color:#1f2937;margin:0;">' + n.title + '</div>'
          + sub
          + '<div style="font-family:Inter,sans-serif;font-size:11px;color:#9ca3af;margin:2px 0 0;">' + n.date + ' · ' + n.time + '</div>'
          + '</div>';

        row.innerHTML = icon + content;
        list.appendChild(row);
      });
    } catch (err) {
      console.error('[APP-INIT] Failed to fetch notifications:', err);
      list.innerHTML = '<div style="padding:24px 16px;text-align:center;font-family:Inter,sans-serif;font-size:13px;color:#9ca3af;">No recent activity</div>';
    }
  },

  initMobileToggle() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    function openSidebar() {
      if (sidebar) sidebar.classList.add('is-open');
      if (overlay) overlay.classList.add('is-visible');
      document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
      if (sidebar) sidebar.classList.remove('is-open');
      if (overlay) overlay.classList.remove('is-visible');
      document.body.style.overflow = '';
    }

    document.addEventListener('click', function (e) {
      const toggle = e.target.closest('.sidebar-toggle');
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
  },
  
  initSidebarNotifications() {
    const notifLink = document.getElementById('sidebar-notifications');
    const badge = document.getElementById('sidebar-notif-badge');
    
    if (!notifLink) return;
    
    const self = this;
    
    // Fetch notification count
    this.fetchNotificationCount();
    
    // Refresh count every minute
    setInterval(() => {
      this.fetchNotificationCount();
    }, 60000);
    
    // Handle click
    notifLink.addEventListener('click', function(e) {
      e.preventDefault();
      self.showNotificationPanel();
    });
  },
  
  async fetchNotificationCount() {
    try {
      const response = await fetch('/api/notifications', {
        headers: Auth.getHeaders()
      });
      
      if (Auth.handle401(response)) return;
      if (!response.ok) return;
      
      const data = await response.json();
      const badge = document.getElementById('sidebar-notif-badge');
      
      if (badge && data.unread_count > 0) {
        badge.textContent = data.unread_count > 9 ? '9+' : data.unread_count;
        badge.style.display = 'flex';
      } else if (badge) {
        badge.style.display = 'none';
      }
    } catch (err) {
      console.error('[APP-INIT] Failed to fetch notification count:', err);
    }
  },
  
  showNotificationPanel() {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'notif-modal-overlay';
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'background:rgba(0,0,0,0.5)',
      'z-index:1000',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'animation:fade-in 0.2s ease'
    ].join(';');
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'notif-modal';
    modal.style.cssText = [
      'background:var(--color-surface)',
      'border-radius:12px',
      'width:90%',
      'max-width:500px',
      'max-height:80vh',
      'display:flex',
      'flex-direction:column',
      'box-shadow:0 20px 25px rgba(0,0,0,0.15)',
      'animation:slide-up 0.3s ease'
    ].join(';');
    
    modal.innerHTML = [
      '<div style="padding:20px;border-bottom:1px solid var(--color-border);display:flex;align-items:center;justify-content:space-between;">',
        '<h3 style="margin:0;font-size:18px;font-weight:600;color:var(--color-text);">Notifications</h3>',
        '<button class="notif-close" style="background:none;border:none;width:32px;height:32px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--color-text-muted);transition:all 0.2s;">',
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>',
        '</button>',
      '</div>',
      '<div id="notif-modal-list" style="flex:1;overflow-y:auto;padding:12px;">',
        '<div style="text-align:center;padding:40px 20px;color:var(--color-text-muted);">Loading...</div>',
      '</div>',
      '<div style="padding:16px;border-top:1px solid var(--color-border);display:flex;justify-content:center;">',
        '<button class="notif-mark-all" style="background:none;border:none;color:var(--color-primary);font-size:13px;font-weight:500;cursor:pointer;padding:8px 16px;border-radius:6px;transition:all 0.2s;">Mark all as read</button>',
      '</div>'
    ].join('');
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Close handlers
    const closeBtn = modal.querySelector('.notif-close');
    const markAllBtn = modal.querySelector('.notif-mark-all');
    
    const closeModal = () => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 200);
    };
    
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    
    markAllBtn.addEventListener('click', () => {
      const badge = document.getElementById('sidebar-notif-badge');
      if (badge) badge.style.display = 'none';
      localStorage.setItem('woh_notif_read', Date.now());
      if (window.Toast) {
        Toast.success('Marked as read', 'All notifications marked as read');
      }
    });
    
    // Load notifications
    this.loadNotificationsInModal();
  },
  
  async loadNotificationsInModal() {
    const list = document.getElementById('notif-modal-list');
    if (!list) return;
    
    try {
      const response = await fetch('/api/notifications', {
        headers: Auth.getHeaders()
      });
      
      if (Auth.handle401(response)) return;
      if (!response.ok) throw new Error('Failed to load');
      
      const data = await response.json();
      
      if (!Array.isArray(data.notifications) || data.notifications.length === 0) {
        list.innerHTML = '<div style="text-align:center;padding:40px 20px;color:var(--color-text-muted);">No notifications yet</div>';
        return;
      }
      
      list.innerHTML = '';
      
      data.notifications.forEach(notif => {
        const item = document.createElement('div');
        item.style.cssText = [
          'padding:12px',
          'border-radius:8px',
          'margin-bottom:8px',
          'background:var(--color-surface-hover)',
          'cursor:pointer',
          'transition:all 0.2s'
        ].join(';');
        
        let iconColor = 'var(--color-primary)';
        let iconBg = 'var(--color-primary-50)';
        if (notif.type === 'registration') {
          iconColor = 'var(--color-info)';
          iconBg = '#eff6ff';
        }
        
        item.innerHTML = [
          '<div style="display:flex;gap:12px;">',
            '<div style="width:40px;height:40px;border-radius:50%;background:' + iconBg + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;">',
              '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + iconColor + '" stroke-width="2">',
                notif.type === 'attendance' 
                  ? '<path d="M20 6L9 17l-5-5"/>'
                  : '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>',
              '</svg>',
            '</div>',
            '<div style="flex:1;min-width:0;">',
              '<div style="font-size:14px;font-weight:500;color:var(--color-text);margin-bottom:2px;">' + notif.title + '</div>',
              (notif.subtitle ? '<div style="font-size:13px;color:var(--color-text-muted);margin-bottom:4px;">' + notif.subtitle + '</div>' : ''),
              '<div style="font-size:11px;color:var(--color-text-muted);">' + notif.date + ' · ' + notif.time + '</div>',
            '</div>',
          '</div>'
        ].join('');
        
        list.appendChild(item);
      });
    } catch (err) {
      console.error('[APP-INIT] Failed to load notifications:', err);
      list.innerHTML = '<div style="text-align:center;padding:40px 20px;color:var(--color-text-muted);">Failed to load notifications</div>';
    }
  }
};

// Make it globally available
window.AppInit = AppInit;

console.log('[APP-INIT] App initialization module loaded');
