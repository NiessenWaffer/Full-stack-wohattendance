(function () {
  var _el = null;
  var _timer = null;

  function createLoader() {
    if (document.getElementById('page-loader')) return;
    var el = document.createElement('div');
    el.id = 'page-loader';
    el.className = 'page-loader';
    el.style.cssText = [
      'position:absolute', 'top:0', 'left:0',
      'width:100%', 'height:100%',
      'z-index:90',
      'display:flex',
      'flex-direction:column',
      'align-items:center',
      'justify-content:center',
      'opacity:1',
      'transition:opacity 0.3s ease'
    ].join(';');

    el.innerHTML = [
      '<div style="display:flex;flex-direction:column;align-items:center;">',
        '<img src="/WOHLOGO.png" alt="Word of Hope Caloocan" class="page-loader-logo" style="width:48px;height:48px;margin-bottom:16px;opacity:0.9;" />',
        '<div id="page-loader-spinner" class="page-loader-spinner"></div>',
        '<div class="page-loader-text" style="font-family:Inter,sans-serif;font-size:13px;font-weight:500;margin-top:12px;">Loading...</div>',
      '</div>'
    ].join('');

    if (!document.getElementById('_loader-style')) {
      var style = document.createElement('style');
      style.id = '_loader-style';
      style.textContent = [
        '@keyframes _loader-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}',
        '.page-loader{',
          'background:rgba(255,255,255,0.95);',
          'backdrop-filter:blur(8px);',
          '-webkit-backdrop-filter:blur(8px);',
        '}',
        '[data-theme="dark"] .page-loader{',
          'background:rgba(17,24,39,0.95);',
        '}',
        '.page-loader-spinner{',
          'width:24px;height:24px;',
          'border:2px solid var(--color-border-light, #f3f4f6);',
          'border-top:2px solid var(--color-primary, #10b981);',
          'border-radius:50%;',
          'animation:_loader-spin 0.8s linear infinite;',
        '}',
        '[data-theme="dark"] .page-loader-spinner{',
          'border-color:var(--color-border, #374151);',
          'border-top-color:var(--color-primary-light, #34d399);',
        '}',
        '.page-loader-text{',
          'color:var(--color-text-muted, #6b7280);',
        '}'
      ].join('');
      document.head.appendChild(style);
    }

    _el = el;
  }

  function showLoader() {
    if (!_el) createLoader();
    
    // Find content container (.app-main or .dashboard__main) and ensure it's positioned
    var contentContainer = document.querySelector('.app-main, .dashboard__main');
    if (!contentContainer) {
      // Fallback to body if no content container found
      contentContainer = document.body;
    } else {
      // Ensure content container is positioned relative
      contentContainer.style.position = 'relative';
    }
    
    // Insert loader into content container
    contentContainer.appendChild(_el);
    _el.style.display = 'flex';
    _el.style.opacity = '1';
    
    clearTimeout(_timer);
    _timer = setTimeout(hideLoader, 1000);
  }

  function hideLoader() {
    clearTimeout(_timer);
    if (!_el) return;
    _el.style.opacity = '0';
    setTimeout(function () {
      if (_el && _el.parentNode) {
        _el.parentNode.removeChild(_el);
      }
    }, 300);
  }

  // Don't auto-create loader on script load
  // Let pages control when to show/hide loader

  window.showLoader = showLoader;
  window.hideLoader = hideLoader;
})();
