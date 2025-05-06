import { useState, useEffect } from 'react';
import './TimerSettings.scss';

declare global {
  interface Window {
    require: any;
  }
}

const { ipcRenderer } = window.require('electron');

const TimerSettings = () => {
  const [interval, setInterval] = useState(45); // 默认45分钟



  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setInterval(value);
  };

  const handleSetTimer = () => {
    ipcRenderer.send('set-reminder-interval', interval);
  };

  useEffect(() => {
    handleSetTimer();
  }, []);

  return (
    <div className="timer-settings">
      <div className="window-controls">
        <button className="control-btn minimize" onClick={() => ipcRenderer.send('window-control', 'minimize')}>
          <span>─</span>
        </button>
        <button className="control-btn maximize" onClick={() => ipcRenderer.send('window-control', 'maximize')}>
          <span>□</span>
        </button>
        <button className="control-btn close" onClick={() => ipcRenderer.send('window-control', 'close')}>
          <span>×</span>
        </button>
      </div>
      <h2>休息提醒设置</h2>
      <div className="setting-group">
        <span>提醒间隔（分钟）：</span>
        <input
          type="number"
          min="1"
          value={interval}
          onChange={handleIntervalChange}
        />
      </div>
      <button onClick={handleSetTimer}>重置提醒</button>
    </div>
  );
};

export default TimerSettings;