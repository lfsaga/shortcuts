class ShortcutsPage {
  constructor() {
    this.shortcuts = [];
    this.init();
  }

  init() {
    this.createStyles();
    this.createHTML();
    this.loadShortcuts();
    this.bindEvents();
    this.setupTabVisibilityReload();
  }

  setupTabVisibilityReload() {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.loadShortcuts();
        this.showNotification('reloaded', 'info', 2000);
      }
    });
  }

  createStyles() {
    const style = document.createElement('style');
    style.textContent = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background-color: #0d1117;
        color: #e6edf3;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }

      .container {
        width: 100%;
        max-width: 800px;
        background: #161b22;
        border-radius: 16px;
        border: 1px solid #21262d;
        overflow: hidden;
      }

      .title {
        font-size: 18px;
        font-weight: 500;
        color: #e6edf3;
        margin-bottom: 4px;
      }

      .subtitle {
        font-size: 13px;
        color: #7d8590;
      }

      .table-container {
        overflow: hidden;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        background: #161b22;
      }

      th {
        background-color: #0d1117;
        padding: 20px 24px;
        text-align: left;
        font-size: 15px;
        font-weight: 500;
        color: #7d8590;
        border-bottom: 1px solid #21262d;
        text-transform: lowercase;
      }

      td {
        padding: 22px 24px;
        border-bottom: 1px solid #21262d;
        font-size: 17px;
      }

      tbody tr:hover {
        background-color: #0d1117;
      }

      tbody tr:last-child td {
        border-bottom: none;
      }

      .shortcut-key {
        background-color: #21262d;
        padding: 8px 12px;
        border-radius: 5px;
        font-family: 'SF Mono', Monaco, monospace;
        font-size: 15px;
        font-weight: 500;
        color: #58a6ff;
        border: 1px solid #30363d;
      }

      .shortcut-key.unassigned {
        background-color: #2d1b00;
        color: #f2cc60;
        border-color: #4d2700;
        font-style: italic;
      }

      .description {
        color: #e6edf3;
        font-size: 17px;
      }

      .toggle-switch {
        position: relative;
        display: inline-block;
        width: 52px;
        height: 28px;
      }

      .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #30363d;
        transition: .2s;
        border-radius: 28px;
      }

      .slider:before {
        position: absolute;
        content: "";
        height: 24px;
        width: 24px;
        left: 2px;
        bottom: 2px;
        background-color: #7d8590;
        transition: .2s;
        border-radius: 50%;
      }

      input:checked + .slider {
        background-color: #238636;
      }

      input:checked + .slider:before {
        background-color: #ffffff;
        transform: translateX(24px);
      }

      .footer {
        padding: 24px 28px;
        background: #0d1117;
        border-top: 1px solid #21262d;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .button-group {
        display: flex;
        gap: 16px;
        align-items: center;
      }

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .btn-secondary {
        background-color: #21262d;
        color: #e6edf3;
        border: 1px solid #30363d;
      }

      .btn-secondary:hover {
        background-color: #30363d;
        border-color: #484f58;
      }

      .github-link {
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        height: 38px;
        color: #7d8590;
        text-decoration: none;
        border-radius: 8px;
        transition: all 0.3s ease;
        overflow: hidden;
        white-space: nowrap;
        width: 38px;
        padding: 0 10px;
      }

      .github-link:hover {
        color: #e6edf3;
        background-color: #21262d;
        width: auto;
        min-width: 110px;
      }

      .github-icon {
        flex-shrink: 0;
        margin-right: 0;
        transition: margin-right 0.3s ease;
      }

      .github-link:hover .github-icon {
        margin-right: 10px;
      }

      .github-label {
        opacity: 0;
        transform: translateX(-10px);
        transition: all 0.3s ease;
        font-size: 15px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
      }

      .github-link:hover .github-label {
        opacity: 1;
        transform: translateX(0);
      }

      .notification {
        position: fixed;
        top: 24px;
        left: 50%;
        transform: translateX(-50%);
        padding: 14px 20px;
        border-radius: 8px;
        font-size: 16px;
        z-index: 1000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        border: 1px solid transparent;
      }

      .notification.success {
        background: #0d1b0d;
        color: #3fb950;
        border-color: #1b4e1b;
      }

      .notification.error {
        background: #1b0d0d;
        color: #f85149;
        border-color: #4e1b1b;
      }

      .notification.info {
        background: #0d1419;
        color: #58a6ff;
        border-color: #1b2e4e;
      }

      .info-icon {
        margin-left: 10px;
        color: #7d8590;
        cursor: help;
        transition: all 0.2s ease;
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 1px solid #30363d;
        font-size: 14px;
        font-weight: 600;
      }

      .info-icon:hover {
        color: #58a6ff;
        border-color: #58a6ff;
        background-color: #0d1419;
      }

      .info-tooltip {
        position: absolute;
        bottom: 130%;
        left: 50%;
        transform: translateX(-50%);
        background: #1c2128;
        color: #e6edf3;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 15px;
        line-height: 1.4;
        white-space: normal;
        width: 380px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        border: 1px solid #30363d;
        opacity: 0;
        visibility: hidden;
        transition: all 0.2s ease;
        z-index: 1000;
      }

      .info-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 5px solid transparent;
        border-top-color: #30363d;
      }

      .info-tooltip::before {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 4px solid transparent;
        border-top-color: #1c2128;
        margin-top: -1px;
      }

      .info-icon:hover .info-tooltip {
        opacity: 1;
        visibility: visible;
      }
    `;
    document.head.appendChild(style);
  }

  createHTML() {
    document.body.innerHTML = `
      <div class="container">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>key combination</th>
                <th>description</th>
                <th>enabled</th>
              </tr>
            </thead>
            <tbody id="shortcuts-body">
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          <div class="button-group">
            <button id="open-shortcuts" class="btn btn-secondary" title="open shortcuts settings">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,10H17V8H19M19,13H17V11H19M16,10H14V8H16M16,13H14V11H16M16,17H8V15H16M7,10H5V8H7M7,13H5V11H7M8,11H10V13H8M8,8H10V10H8M11,11H13V13H11M11,8H13V10H11M20,5H4C2.89,5 2,5.89 2,7V17C2,18.11 2.89,19 4,19H20C21.11,19 22,18.11 22,17V7C22,5.89 21.11,5 20,5Z"/>
              </svg>
              edit keys
            </button>
            <div class="info-icon">
              i
              <div class="info-tooltip">
                default key combinations cannot be overwritten during installation. therefore, you must set up your preferred overrides manually. then just empty them to restore default keys
              </div>
            </div>
          </div>
          <a href="https://github.com/lfsaga/shortcuts" target="_blank" class="github-link" title="github">
            <svg class="github-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span class="github-label">shortcuts</span>
          </a>
        </div>
      </div>
    `;
  }

  async loadShortcuts() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getShortcuts' });
      this.shortcuts = response.shortcuts || [];
      this.renderShortcuts();
    } catch {
      this.shortcuts = [];
      this.renderShortcuts();
    }
  }

  renderShortcuts() {
    const tbody = document.getElementById('shortcuts-body');
    tbody.innerHTML = '';
    this.shortcuts.forEach((shortcut, index) => {
      tbody.appendChild(this.createShortcutRow(shortcut, index));
    });
  }

  createShortcutRow(shortcut, index) {
    const row = document.createElement('tr');
    const keyDisplay = shortcut.key || 'not assigned';
    const keyClass = shortcut.key ? 'shortcut-key' : 'shortcut-key unassigned';
    const tooltip = shortcut.key ? 'current shortcut' : 'no shortcut assigned - go to chrome://extensions/shortcuts to assign one';
    
    row.innerHTML = `
      <td><span class="${keyClass}" title="${tooltip}">${keyDisplay}</span></td>
      <td><span class="description" title="${shortcut.description}">${shortcut.description}</span></td>
      <td>
        <label class="toggle-switch">
          <input type="checkbox" ${shortcut.enabled ? 'checked' : ''} data-index="${index}" data-type="enabled">
          <span class="slider"></span>
        </label>
      </td>
    `;
    return row;
  }

  bindEvents() {
    document.addEventListener('change', (e) => {
      if (e.target.matches('input[type="checkbox"]')) {
        this.handleToggleChange(e);
      }
    });

    document.getElementById('open-shortcuts').addEventListener('click', () => {
      chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    });
  }

  async handleToggleChange(event) {
    const index = parseInt(event.target.dataset.index);
    const checked = event.target.checked;

    if (this.shortcuts[index]) {
      this.shortcuts[index].enabled = checked;
      try {
        await chrome.runtime.sendMessage({
          action: 'updateShortcut',
          command: this.shortcuts[index].command,
          updates: { enabled: checked }
        });
        this.showNotification(checked ? 'enabled' : 'disabled', 'success');
      } catch {
        this.showNotification('error', 'error');
        event.target.checked = !checked;
        this.shortcuts[index].enabled = !checked;
      }
    }
  }

  showNotification(message, type = 'info', duration = 3000) {
    document.querySelectorAll('.notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), duration);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ShortcutsPage());
} else {
  new ShortcutsPage();
}
