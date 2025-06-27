class ShortcutManager {
  constructor() {
    this.defaultShortcuts = [
      { command: 'pin-unpin-tab', key: 'Alt+P', description: 'pin/unpin tab', enabled: true },
      { command: 'duplicate-tab', key: 'Alt+D', description: 'duplicate tab', enabled: true },
      { command: 'add-to-new-tab-group', key: 'Alt+A', description: 'add tab to new group', enabled: true }
    ];
    this.shortcuts = [...this.defaultShortcuts];
    this.init();
  }

  init() {
    chrome.commands.onCommand.addListener((command) => this.handleCommand(command));
    chrome.action.onClicked.addListener(() => this.openOptionsPage());
    this.initializeStorage();
  }

  openOptionsPage() {
    chrome.runtime.openOptionsPage();
  }

  async initializeStorage() {
    const result = await chrome.storage.sync.get(['shortcuts']);
    if (!result.shortcuts) {
      await chrome.storage.sync.set({ shortcuts: this.shortcuts });
    } else {
      this.shortcuts = result.shortcuts;
    }
    await this.updateShortcutsWithCurrentKeys();
  }

  async updateShortcutsWithCurrentKeys() {
    try {
      const commands = await chrome.commands.getAll();
      this.shortcuts = this.shortcuts.map(shortcut => {
        const command = commands.find(cmd => cmd.name === shortcut.command);
        return { ...shortcut, key: command?.shortcut || '' };
      });
      await chrome.storage.sync.set({ shortcuts: this.shortcuts });
    } catch (error) {
      console.error(error);
    }
  }

  async handleCommand(command) {
    const shortcut = this.shortcuts.find(s => s.command === command);
    if (!shortcut?.enabled) return;

    switch (command) {
      case 'pin-unpin-tab': await this.pinUnpinTab(); break;
      case 'add-to-new-tab-group': await this.addToNewTabGroup(); break;
      case 'duplicate-tab': await this.duplicateTab(); break;
    }
  }

  async pinUnpinTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) await chrome.tabs.update(tab.id, { pinned: !tab.pinned });
    } catch { }
  }

  getFormattedDate() {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, '0')} ${now.toLocaleString('en-GB', { month: 'short' })} - ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  async addToNewTabGroup() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) return;
      const clrs = ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];
      await chrome.tabGroups.update(await chrome.tabs.group({ tabIds: [tab.id] }), {
        color: clrs[Math.floor(Math.random() * clrs.length)],
        title: this.getFormattedDate()
      });
    } catch { }
  }

  async duplicateTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) await chrome.tabs.duplicate(tab.id);
    } catch { }
  }

  async updateShortcut(command, updates) {
    const index = this.shortcuts.findIndex(s => s.command === command);
    if (index !== -1) {
      this.shortcuts[index] = { ...this.shortcuts[index], ...updates };
      await chrome.storage.sync.set({ shortcuts: this.shortcuts });
    }
  }

  async getShortcuts() {
    await this.updateShortcutsWithCurrentKeys();
    return this.shortcuts;
  }
}

const shortcutManager = new ShortcutManager();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getShortcuts') {
    shortcutManager.getShortcuts().then(shortcuts => sendResponse({ shortcuts }));
    return true;
  } else if (request.action === 'updateShortcut') {
    shortcutManager.updateShortcut(request.command, request.updates);
    sendResponse({ success: true });
  }
  return true;
});
