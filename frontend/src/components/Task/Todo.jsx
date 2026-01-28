import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';
import { LS, ipadr } from "../../Utils/Resuse"; 

const ToDoList = () => {

if (LS.get('position')?.toLowerCase() === 'hr') {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md">
        <h1 className="text-xl font-semibold mb-2">Access Denied</h1>
        <p>Only Employee and TL can access this page.</p>
      </div>
    </div>
  );
}

  const [date, setDate] = useState(new Date());
  const [tasksData, setTasksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const userid = LS.get("id");
  const position = LS.get("position");
  const name = LS.get("name");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!userid || !position) {
          setError('User not authenticated. Please log in.');
          setLoading(false);
          return;
        }

        let url = '';
        
       const pos = (position || '').toString().toLowerCase();

        if (pos === 'employee') {
          url = `${ipadr}/tasks?role=Employee&userid=${userid}`;
        } else if (pos === 'tl') {
          url = `${ipadr}/tasks?role=HR&userid=${userid}`;
        } else if (pos === 'hr' || LS.get('isadmin')) {
          url = `${ipadr}/tasks?role=hr`;
        } else {
          setError(`Unknown position: ${position}`);
          setLoading(false);
          return;
        }

        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch tasks');
        }

        const result = await response.json();
        const data = result.data || [];
        
        if (data.message) {
          setTasksData([]);
        } else {
          setTasksData(Array.isArray(data) ? data : []);
        }
        
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userid, position]);

  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const normalizeDate = (dateStr) => {
    if (!dateStr) return null;
    
    // If already in yyyy-mm-dd format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    // If in dd-mm-yyyy format (YOUR API FORMAT)
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split('-');
      return `${year}-${month}-${day}`;
    }
    
    return null;
  };

  const hasIncompleteTasks = (checkDate) => {
    const dateStr = formatDateForAPI(checkDate);
    
    return tasksData.some(task => {
      const taskDate = normalizeDate(task.date);
      if (!taskDate) return false;
      
      const status = (task.status || '').toLowerCase().trim();
      const isIncomplete = status !== 'completed' && status !== 'verified';
      
      return taskDate === dateStr && isIncomplete;
    });
  };

  const getIncompleteTaskCount = (checkDate) => {
    const dateStr = formatDateForAPI(checkDate);
    
    return tasksData.filter(task => {
      const taskDate = normalizeDate(task.date);
      if (!taskDate) return false;
      
      const status = (task.status || '').toLowerCase().trim();
      const isIncomplete = status !== 'completed' && status !== 'verified';
      
      return taskDate === dateStr && isIncomplete;
    }).length;
  };

  const tileContent = ({ date: tileDate, view }) => {
    if (view === 'month') {
      const hasTasks = hasIncompleteTasks(tileDate);
      if (hasTasks) {
        const count = getIncompleteTaskCount(tileDate);
        return (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '4px',
            position: 'relative',
            zIndex: 10
          }}>
            <div 
              title={`${count} incomplete task(s)`}
              style={{
                backgroundColor: '#c06767ff',
                borderRadius: '50%',
                width: '8px',
                height: '8px',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)',
                animation: 'pulse 2s infinite'
              }}
            ></div>
          </div>
        );
      }
    }
    return null;
  };

  const tileClassName = ({ date: tileDate, view }) => {
    if (view === 'month' && hasIncompleteTasks(tileDate)) {
      return 'has-incomplete-tasks';
    }
    return null;
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleDateClick = () => {
    const formattedDate = formatDate(date);
    navigate(`/User/Task/Todo/TaskPage?date=${formattedDate}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 mb-4">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-xl text-red-600 mb-4">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

return (
  <div className="flex flex-col items-center justify-center min-h-screen p-4">
    <div className="bg-white w-full max-w-4xl rounded-lg shadow-md overflow-hidden">
      <header className="bg-blue-600 text-white text-center py-6">
        <h1 className="text-3xl font-bold">Task Management</h1>
        <p className="mt-2">Stay organized with your tasks</p>
      </header>

      <div className="flex flex-col sm:flex-row gap-6 p-6 items-stretch">
        {/* Calendar */}
        <div className="flex-1 flex flex-col">
          <Calendar
            onChange={handleDateChange}
            value={date}
            className="rounded-lg shadow-md border border-gray-300 flex-1"
            tileContent={tileContent}
            tileClassName={tileClassName}
          />

          <div className="mt-3 pt-2 border-t border-gray-300">
            <p className="text-xs text-gray-500 flex items-center gap-2">
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#c06767ff',
                  borderRadius: '50%',
                }}
              ></span>
              Dates with incomplete tasks
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-white p-4 rounded-lg shadow-inner border border-gray-200 flex flex-col justify-center h-full">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Selected Date: {formatDate(date)}
          </h2>

          {hasIncompleteTasks(date) && (
            <div className="mb-4 p-3 bg-blue-100 border border-blue-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                📋 {getIncompleteTaskCount(date)} incomplete task(s) on this date
              </p>
            </div>
          )}

          <p className="text-sm text-gray-500 mb-3">
            Click "View Tasks" to see tasks for the selected date.
          </p>

          <button
            onClick={handleDateClick}
            className="block w-full bg-blue-600 text-white text-lg py-1 rounded-lg shadow hover:bg-blue-700 transition-colors mt-2"
          >
            View Tasks
          </button>
        </div>
      </div>
    </div>
  </div>
);

};

export default ToDoList;