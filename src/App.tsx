import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import TimerSettings from './components/TimerSettings';
import ReminderWindow from './components/ReminderWindow';
import './App.scss';

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<TimerSettings />} /> */}
        <Route path="/" element={<ReminderWindow />} />
        {/* <Route path="/reminder" element={<ReminderWindow />} /> */}
      </Routes>
    </Router>
  )
}

export default App
