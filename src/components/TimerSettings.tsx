import { useState, useEffect } from 'react';
import './TimerSettings.scss';

declare global {
  interface Window {
    electronAPI: {
      setReminderInterval: (minutes: number) => void;
      getBackgroundImages: () => Promise<string[]>;
      closeReminder: () => void;
      windowControl: (action: string) => void;
    };
  }
}

const TimerSettings = () => {
  const [interval, setInterval] = useState(45); // 默认45分钟


  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setInterval(value);
    }
  };

  const handleSetTimer = () => {
    window.electronAPI.setReminderInterval(interval);
  };

  useEffect(() => {
    handleSetTimer();
  }, []);

  return (
    <div className="timer-settings">
      <div className="window-controls">
        <button className="control-btn minimize" onClick={() => window.electronAPI.windowControl('minimize')}>
          <span>─</span>
        </button>
        <button className="control-btn maximize" onClick={() => window.electronAPI.windowControl('maximize')}>
          <span>□</span>
        </button>
        <button className="control-btn close" onClick={() => window.electronAPI.windowControl('close')}>
          <span>×</span>
        </button>
      </div>
      <h2>提醒设置</h2>
      <div className="setting-group">
        <span>提醒间隔（分钟）：</span>
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