import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaTrashAlt, FaEdit, FaEye, FaCheckCircle, FaRegCircle, FaTimes, FaPaperclip, FaDownload, FaUser, FaFlag, FaExclamationTriangle, FaClock, FaChartLine, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { LS, ipadr } from "../../Utils/Resuse";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DailyProgress = memo(({ stats, isVisible, onToggle }) => {
  return (
    <div className="bg-blue-100 rounded-xl border border-blue-200 shadow-sm overflow-hidden">
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-2 hover:bg-blue-200 transition-colors"
      >
        <div className="flex items-center gap-3">
          <FaChartLine className="text-blue-600" size={20} />
          <span className="text-s font-semibold text-gray-800">Daily Progress</span>
        </div>
        {isVisible ? (
          <FaChevronUp className="text-gray-500" size={16} />
        ) : (
          <FaChevronDown className="text-gray-500" size={16} />
        )}
      </button>


      {isVisible && (
        <div className="p-4 pt-0 border-t border-gray-200 max-h-44 overflow-auto">
  {/* Compact Task Statistics Dashboard */}
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
    <div className="bg-blue-50 rounded-lg shadow-sm border border-gray-200">
      <div className="text-center">
        <div className="text-xl font-bold text-gray-700 mb-0.5">{stats.total}</div>
        <div className="text-xs font-medium text-gray-600">Total Tasks</div>
      </div>
    </div>

    <div className="bg-blue-50 rounded-lg shadow-sm border border-red-200">
      <div className="text-center">
        <div className="text-xl font-bold text-red-600 mb-0.5">{stats.todo}</div>
        <div className="text-xs font-medium text-red-600">To Do</div>
      </div>
    </div>

    <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200">
      <div className="text-center">
        <div className="text-xl font-bold text-blue-700 mb-0.5">{stats.inProgress}</div>
        <div className="text-xs font-medium text-blue-600">In Progress</div>
      </div>
    </div>

    <div className="bg-blue-50 rounded-lg shadow-sm border border-green-200">
      <div className="text-center">
        <div className="text-xl font-bold text-green-700 mb-0.5">{stats.completed}</div>
        <div className="text-xs font-medium text-green-600">Completed</div>
      </div>
    </div>

    <div className="bg-blue-50 rounded-lg shadow-sm border border-red-200">
      <div className="text-center">
        <div className="text-xl font-bold text-red-600 mb-0.5">{stats.overdue}</div>
        <div className="text-xs font-medium text-red-600">Overdue</div>
      </div>
    </div>

    <div className="bg-blue-50 rounded-lg shadow-sm border border-green-200">
      <div className="text-center">
        <div className="text-xl font-bold text-green-700 mb-0.5">{stats.highPriority}</div>
        <div className="text-xs font-medium text-green-600">High Priority</div>
      </div>
    </div>

    <div className="bg-blue-100 rounded-lg shadow-sm border border-indigo-200">
      <div className="text-center">
        <div className="text-xl font-bold text-indigo-600 mb-0.5">{stats.completionRate}%</div>
        <div className="text-xs font-medium text-indigo-600">Completion Rate</div>
      </div>
    </div>
  </div>

  {/* Compact Progress Bar */}
  <div>
    <div className="flex justify-between items-center mb-0.5">
      <span className="text-sm font-medium text-gray-700">Daily Progress</span>
      <span className="text-xs text-gray-600">{stats.completed} of {stats.total} completed</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
      <div
        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 shadow-sm"
        style={{ width: `${stats.completionRate}%` }}
      ></div>
    </div>
  </div>
</div>

      )}
    </div>
  );
});

DailyProgress.displayName = 'DailyProgress';

const TaskPage = () => {

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


  const location = useLocation();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [dueFilterInput, setDueFilterInput] = useState('');
  const [filterDueDate, setFilterDueDate] = useState('');
  const [date, setDate] = useState("");
  const userId = LS.get("id");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [newTask, setNewTask] = useState("");
  const [duedate, setDuedate] = useState("");
  const [draggedTask, setDraggedTask] = useState(null);
  const [showDailyProgress, setShowDailyProgress] = useState(false);
  const [highlightedTaskIds, setHighlightedTaskIds] = useState([]);
  

  const statusColumns = [
    { id: "todo", title: "To Do", color: "bg-white-50", borderColor: "border-red-300" },
    { id: "in-progress", title: "In Progress", color: "bg-white-50", borderColor: "border-blue-500" },
    { id: "completed", title: "Completed", color: "bg-white-50", borderColor: "border-green-300" },
  ];

  const priorityColors = {
    low: "text-green-600 bg-green-100",
    medium: "text-yellow-600 bg-yellow-100",
    high: "text-red-600 bg-red-100"
  };

  // Calculate task statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter(task => task.status === 'todo').length;
    const inProgress = tasks.filter(task => task.status === 'in-progress').length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    
    // Calculate overdue tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = tasks.filter(task => {
      if (!task.due_date || task.status === 'completed') return false;
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    }).length;
    
    // Calculate high priority tasks
    const highPriority = tasks.filter(task => task.priority === 'high').length;
    
    // Calculate completion rate
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      todo,
      inProgress,
      completed,
      overdue,
      highPriority,
      completionRate
    };
  }, [tasks]);

  // Enhanced function to check due date status
  const getDueDateStatus = (dueDate, isCompleted = false) => {
    if (!dueDate || isCompleted) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    
    // Check if the date is valid
    if (isNaN(due.getTime())) {
      console.log("Invalid date format:", dueDate);
      return null;
    }
    
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return {
        status: 'overdue',
        message: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`,
        className: 'bg-red-50 text-red-800 border-red-200',
        icon: <FaExclamationTriangle className="text-red-600" />
      };
    } else if (diffDays === 0) {
      return {
        status: 'due-today',
        message: 'Due Today',
        className: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        icon: <FaClock className="text-yellow-600" />
      };
    } else if (diffDays === 1) {
      return {
        status: 'due-tomorrow',
        message: 'Due Tomorrow',
        className: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        icon: <FaClock className="text-yellow-600" />
      };
    } else if (diffDays <= 3) {
      return {
        status: 'due-soon',
        message: `Due in ${diffDays} days`,
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <FaClock className="text-blue-600" />
      };
    }
    
    return null;
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const dateFromQuery = queryParams.get("date");
    setDate(dateFromQuery || "");

    if (dateFromQuery) {
      fetchTasks(userId, dateFromQuery);
    }
  }, [location, userId]);

  // When a due-date filter is applied, mark matching tasks and scroll the first match into view
  useEffect(() => {
    if (!filterDueDate) {
      setHighlightedTaskIds([]);
      return;
    }

    const matched = tasks.filter(t => t.due_date === filterDueDate).map(t => t.id).filter(Boolean);
    setHighlightedTaskIds(matched);

    if (matched.length > 0) {
      // slight delay to allow render
      setTimeout(() => {
        try {
          const el = document.querySelector(`[data-task-id="${matched[0]}"]`);
          if (el && typeof el.scrollIntoView === 'function') {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } catch (e) {
          // ignore
        }
      }, 120);
    }
  }, [filterDueDate, tasks]);

  const convertDateFormat = (dateString) => {
    if (!dateString) return null;
    
    // Check if it's in DD-MM-YYYY format
    if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
      const [day, month, year] = dateString.split('-');
      return `${year}-${month}-${day}`;
    }
    
    return dateString;
  };

  const fetchTasks = async (userId, selectedDate) => {
    setLoading(true);
    setErrorMessage("");
    try {
      let endpoint;

     const position = (LS.get("position") || "").toString().toLowerCase();

    if (position === "employee") {
      // Employees → only TL-assigned tasks
      endpoint = `${ipadr}/tasks?role=Employee&userid=${userId}&date=${selectedDate}`;
    } else if (position === "tl") {
      // TL → only HR-assigned tasks, no self-assigned
      endpoint = selectedDate
        ? `${ipadr}/tasks?role=HR&userid=${userId}&date=${selectedDate}`
        : `${ipadr}/tasks?role=HR&userid=${userId}`;
    }


      const response = await fetch(endpoint);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch tasks");
      }

      const result = await response.json();
      const data = result.data;

      if (data.message) {
        setTasks([]);
      } else {
        // Normalize tasks and sort newest-first by createdDate
        const formattedTasks = (data || []).map((t) => formatTask(t));
        formattedTasks.sort((a, b) => {
          const da = a.createdDate ? new Date(a.createdDate) : new Date(0);
          const db = b.createdDate ? new Date(b.createdDate) : new Date(0);
          return db - da; // newest first
        });
        setTasks(formattedTasks);
      }
    } catch (error) {
      setErrorMessage(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const mapStatusToColumn = (status) => {
    if (!status) return "todo";
    const statusLower = status.toLowerCase();
    
    // Exact matching to prevent wrong assignments
    if (statusLower === "pending" || statusLower === "todo" || statusLower === "to do") return "todo";
    if (statusLower === "in progress" || statusLower === "in-progress" || statusLower === "ongoing") return "in-progress";
    if (statusLower === "completed" || statusLower === "done" || statusLower === "complete") return "completed";
    
    // Default to todo for new tasks
    return "todo";
  };

  // Helper to normalize/format a single task object consistently
  const formatTask = (t) => ({
    ...t,
    id: t.taskid || t.id,
    status: mapStatusToColumn(t.status),
    due_date: convertDateFormat(t.due_date || t.dueDate || t.due),
    subtasks: (t.subtasks || []).map((s, idx) => ({
      id: s.id || `${t.taskid || t.id}-${idx}`,
      text: s.text || s.title || "",
      completed: s.completed ?? s.done ?? false
    })),
    comments: t.comments || [],
    files: t.files || [],
    assignedBy: t.assigned_by || t.assignedBy || "TeamLead",
    priority: t.priority || "medium",
    verified: t.verified || false,
    createdDate: (
      t.created_date || t.createdDate || t.date ||
      ((t.taskid || t.id) && /^[a-fA-F0-9]{24}$/.test(String(t.taskid || t.id)))
        ? new Date(parseInt(String(t.taskid || t.id).substring(0, 8), 16) * 1000).toISOString()
        : null
    )
  });

  const formatDisplayDate = (dateInput) => {
    if (!dateInput) return "";
    try {

      if (/^\d{2}-\d{2}-\d{4}$/.test(String(dateInput))) {
        return String(dateInput);
      }

      let d = String(dateInput);
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        const [y, m, day] = d.split('-');
        return `${day}-${m}-${y}`;
      }

      const parsed = new Date(d);
      if (isNaN(parsed.getTime())) return String(dateInput);

      const dd = String(parsed.getDate()).padStart(2, '0');
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const yy = parsed.getFullYear();
      const hh = String(parsed.getHours()).padStart(2, '0');
      const min = String(parsed.getMinutes()).padStart(2, '0');

      if (hh === '00' && min === '00') {
        return `${dd}-${mm}-${yy}`;
      }

      return `${dd}-${mm}-${yy} ${hh}:${min}`;
    } catch (e) {
      return String(dateInput);
    }
  };

  const mapColumnToStatus = (column) => {
    switch (column) {
      case "todo": return "Pending";
      case "in-progress": return "In Progress";
      case "completed": return "Completed";
      default: return "Pending";
    }
  };

  const normalizeFiles = (files) =>
    files.map(f => ({
      id: String(f.id),
      name: String(f.name),
      size: Number(f.size),
      type: String(f.type),
      uploadedAt: new Date(f.uploadedAt).toISOString(),
      uploadedBy: String(f.uploadedBy)
    }));
    
  const normalizeSubtasks = (subtasks = []) =>
    subtasks.map(s => ({
      id: s.id,
      text: String(s.text || s.title || ""),
      completed: Boolean(s.completed),
    }));

  const normalizeComments = (comments) =>
    comments.map(c => ({
      id: Number(c.id),
      user: String(c.user),
      text: String(c.text),
      timestamp: new Date(c.timestamp).toLocaleString()
    }));

 const updateTaskStatus = async (taskId, newStatus) => {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  // 🛑 Prevent verified tasks from being moved back
  if (task.verified === true && (newStatus === "todo" || newStatus === "in-progress")) {
    toast.warning("Verified tasks cannot be moved back to To Do or In Progress.");
    return;
  }

  try {
    const requestBody = {
      action: "edit", 
      taskid: taskId,
      userid: userId,
      updated_task: Array.isArray(task.task) ? task.task[0] : task.task,
      status: mapColumnToStatus(newStatus),
      due_date: task.due_date,
      priority: task.priority,
      subtasks: normalizeSubtasks(task.subtasks),
      comments: normalizeComments(task.comments),
      files: normalizeFiles(task.files),
      verified: task.verified
    };

    const response = await fetch(`${ipadr}/task_actions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Failed to update task status");
    }

    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    );

    toast.success(
      `Task moved to ${statusColumns.find(col => col.id === newStatus)?.title}`
    );
  } catch (error) {
    toast.error(error.message);
  }
};

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
  e.preventDefault();
  if (!draggedTask) return;

  if (draggedTask.verified === true) {
    toast.warning("Verified tasks cannot be moved.");
    setDraggedTask(null);
    return;
  }

  await updateTaskStatus(draggedTask.id, newStatus);
  setDraggedTask(null);
};

  const openTaskDetails = (task) => {
    navigate(`/User/Task/Todo/TaskPage/TaskDetailsPage/${task.id}`, {
      state: {
        task,
        userId,
        date,
        statusColumns,
        priorityColors
      }
    });
  };

  const TaskCard = ({ task }) => {
    const isCompleted = task.status === 'completed';
    const dueDateStatus = getDueDateStatus(task.due_date, isCompleted);
    
    return (
        <div
          data-task-id={task.id}
          draggable
          onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, task); }}
          onDragEnd={() => setDraggedTask(null)}
          onClick={() => openTaskDetails(task)}
          className={`bg-blue rounded-lg p-4 shadow-md border cursor-pointer -translate-y-1 transition-all mb-3 ${
              dueDateStatus?.status === 'overdue' ? 'border-blue-300' :
              dueDateStatus?.status === 'due-today' ? 'border-blue-300' :
              'border-blue-300'
            } ${highlightedTaskIds.includes(task.id) ? 'ring-2 ring-blue-600 bg-blue-100' : ''}`}
        >
        {/* Due Date Alert Banner */}
        {dueDateStatus && (
          <div className={`flex items-center gap-2 mb-3 px-3 py-1 rounded-md border ${dueDateStatus.className}`}>
            {dueDateStatus.icon}
            <span className="text-sm font-semibold">{dueDateStatus.message}</span>
            {dueDateStatus.status === 'overdue' && (
              <FaExclamationTriangle className="text-red-600 ml-auto animate-pulse" />
            )}
          </div>
        )}

        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-gray-800 text-sm leading-tight pr-2 break-words whitespace-normal max-w-full" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>{task.task}</h4>
          <div className="flex flex-col gap-1 items-end">
            <span className={`px-1 rounded-full text-xs font-medium ${
              task.status === 'todo' ? 'bg-red-100 text-red-700' :
              task.status === 'in-progress' ? 'bg-blue-200 text-blue-700' :
              'bg-green-100 text-green-700'
            }`}>
              {statusColumns.find(col => col.id === task.status)?.title}
            </span>
            <span className={`px-1 rounded-full text-xs font-medium ${priorityColors[task.priority] || priorityColors.medium}`}>
              {task.priority?.toUpperCase() || 'MEDIUM'}
            </span>

            {task.verified && (
  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-600 text-white">
    Verified
  </span>
)}

          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
          <FaUser className="text-gray-400" />
          <span>Assigned by: {task.assignedBy}</span>
        </div>

        {task.due_date && (
          <div className="flex items-center gap-2 mb-2">
            <p className={`text-xs flex items-center gap-1 ${
              dueDateStatus?.status === 'overdue' ? 'text-gray-600 font-semibold' :
              dueDateStatus?.status === 'due-today' ? 'text-gray-600 font-semibold' :
              dueDateStatus?.status === 'due-tomorrow' ? 'text-gray-600 font-semibold' :
              'text-gray-600'
            }`}>
              <FaClock className="text-xs" />
              Due: {task.due_date}
            </p>
          </div>
        )}

        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Subtasks</span>
              <span>{task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                style={{ 
                  width: `${task.subtasks.length > 0 ? (task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-gray-500">
          <span className="flex items-center gap-1">
            {formatDisplayDate(task.createdDate || task.date)}
          </span>
          <div className="flex gap-2">
            {task.comments && task.comments.length > 0 && (
              <span className="flex items-center gap-1">💬 {task.comments.length}</span>
            )}
            {task.files && task.files.length > 0 && (
              <span className="flex items-center gap-1">📎 {task.files.length}</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openTaskDetails(task);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                    >
                      <FaEye /> View Details
                    </button>
                  </div>
                </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Tasks - {date || "Date not available"}</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-blue-100 border border-gray-200 rounded-md px-2 py-1">
           <label className="text-sm font-medium text-gray-600">Filter by Due Date:</label>
            <input
              type="date"
              value={filterDueDate}
              onChange={(e) => setFilterDueDate(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            />
            </div>

            <button
              onClick={() => navigate("/User/Task/Todo")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Calendar
            </button>
          </div>
        </div>

        <div className="mb-0">
          <DailyProgress 
            stats={stats} 
            isVisible={showDailyProgress} 
            onToggle={() => setShowDailyProgress(!showDailyProgress)} 
          />
        </div>

      </div>

      {/* Kanban Board */}
      <div className="bg-white flex gap-6 p-3 h-[calc(100vh-200px)] overflow-x-auto">
        {statusColumns.map((column) => {
          // compute column tasks and, if filterDueDate is set, put matching due_date tasks first
          let colTasks = tasks.filter(task => task.status === column.id);
          if (filterDueDate) {
            colTasks = [...colTasks].sort((a, b) => {
              const aMatch = a.due_date === filterDueDate ? 0 : 1;
              const bMatch = b.due_date === filterDueDate ? 0 : 1;
              if (aMatch !== bMatch) return aMatch - bMatch; // matched due_date first
              return 0;
            });
          }

          return (
            <div
              key={column.id}
              className={`${column.color} ${column.borderColor} border-2 border-dashed rounded-xl p-4 min-w-[320px] flex-1 shadow-sm hover-show-scrollbar`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{column.title}</h3>
                <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-600 shadow-sm">
                  {colTasks.length}
                </span>
              </div>
            
              <div className="space-y-3 overflow-y-auto max-h-[calc(95vh-300px)] custom-scrollbar-hidden hover:custom-scrollbar-visible">
                {colTasks.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p className="text-lg">No tasks in {column.title.toLowerCase()}</p>
                  </div>
                ) : (
                  colTasks.map((task) => <TaskCard key={task.id} task={task} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskPage;