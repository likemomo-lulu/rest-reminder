export interface ElectronAPI {
  windowControl: (command: 'minimize' | 'maximize' | 'close') => void;
  setReminderInterval: (minutes: number) => void;
  closeReminder: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}