import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import TopNavbar from '../components/TopNavbar';
import '../TasksCalendar.css';



const TaskCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('taskscalendar');
  

  // Dummy task data
  const tasks = {
    '2025-06-20': ['Submit report', 'Call with client'],
    '2025-06-21': ['Team meeting', 'Code review'],
    '2025-06-22': ['Workout session'],
  };

  // Format date to YYYY-MM-DD for easy key matching
  const formatDate = (date) => date.toISOString().split('T')[0];

  const tileContent = ({ date }) => {
    const formatted = formatDate(date);
    return tasks[formatted] ? (
      <div className="dot" />
    ) : null;
  };

  const renderTasksForDate = () => {
    const formatted = formatDate(selectedDate);
    const dayTasks = tasks[formatted];
    return dayTasks ? (
      <ul className="task-list">
        {dayTasks.map((task, index) => (
          <li key={index}>{task}</li>
        ))}
      </ul>
    ) : (
      <p>No tasks for this day.</p>
    );
  };

  return (
    <>
      <TopNavbar activeTab={activeTab} onTabChange={setActiveTab} />
       <div className="calendar-container">
        <h2>Task Calendar</h2>
        <div className="calendar-task-wrapper">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={tileContent}
          />
          <div className="task-display">
            <h4>Tasks on {selectedDate.toDateString()}:</h4>
            {renderTasksForDate()}
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskCalendar;
