const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 窗口控制
  windowControl: (command) => ipcRenderer.send('window-control', command),
  // 设置提醒间隔
  setReminderInterval: (minutes) => ipcRenderer.send('set-reminder-interval', minutes),
  // 关闭提醒窗口
  closeReminder: () => ipcRenderer.send('close-reminder'),
  // 获取背景图片列表
  getBackgroundImages: () => ipcRenderer.invoke('get-background-images')
});