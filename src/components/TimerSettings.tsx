import { useState, useEffect } from 'react';
import './TimerSettings.scss';

declare global {
  interface Window {
    require: any;
  }
}

const { ipcRenderer } = window.require('electron');

const TimerSettings = () => {
  const [interval, setInterval] = useState(1); // 默认30分钟



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
      <h2>休息提醒设置</h2>
      <div className="setting-group">
        <label>提醒间隔（分钟）：</label>
        <input
          type="number"
          min="1"
          value={interval}
          onChange={handleIntervalChange}
        />
      </div>
      <button onClick={handleSetTimer}>开始提醒</button>
    </div>
  );
};

export default TimerSettings;