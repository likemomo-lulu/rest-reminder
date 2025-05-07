import { useEffect, useState } from 'react';
import './ReminderWindow.scss';


const reminderTexts = [
  '该休息一下啦！起来活动活动~',
  '眼睛休息时间到了，看看远处放松一下~',
  '工作告一段落，站起来伸个懒腰吧！',
  '休息是为了更好的工作，去接杯水吧~',
  '该做做运动啦，活动一下筋骨~'
];

const ReminderWindow = () => {
  const [background, setBackground] = useState('');

  useEffect(() => {
    async function loadBackgroundImage() {
      try {
        const bgImages = await window.electronAPI.getBackgroundImages();
        if (bgImages.length > 0) {
          const randomIndex = Math.floor(Math.random() * bgImages.length);
          setBackground(`file://${bgImages[randomIndex]}`);
        } else {
          console.warn('No background images found');
          setBackground('file:///src/assets/bg/default.jpg');
        }
      } catch (error) {
        console.error('Error loading background images:', error);
        setBackground('/src/assets/bg/default.jpg');
      }
    }
    loadBackgroundImage();
  }, []);
  const [text, setText] = useState('');

  useEffect(() => {
    // 随机选择提示文案
    const randomIndex = Math.floor(Math.random() * reminderTexts.length);
    setText(reminderTexts[randomIndex]);
  }, []);

  const handleClose = () => {
    window.electronAPI.closeReminder();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 180000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="reminder-window" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover' }}>
      <div className='reminder-content'>
         <span className='reminder-text' onClick={handleClose}>{text}</span>
      </div> 
    </div>
  );
};

export default ReminderWindow;