import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { ipadr, LS } from "../../Utils/Resuse";
import { Modal } from "../modal/Modal";
import { createPortal } from "react-dom";
import Multiselect from 'multiselect-react-dropdown';
import { RotateCw } from "lucide-react";
import { toast } from "react-toastify";
import { parseISO, isWithinInterval } from 'date-fns';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { FaPlus} from "react-icons/fa";

function ConfirmModal({ open, title, message, onConfirm, onClose, confirmLabel = 'Delete', cancelLabel = 'Cancel' }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'Enter') onConfirm?.();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose, onConfirm]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AiOutlineDelete className="w-5 h-5" />
            </div>
            <div>
            <h3 className="text-lg font-semibold text-gray-900 break-words [word-break:break-all] px-2">
              {title}
            </h3>
            <p className="text-sm text-gray-700 mt-1">
              Are you sure you want to delete this task?
            </p>
            {message && (
              <div
                className="text-xs text-gray-800 mt-2 
                          break-words whitespace-pre-wrap 
                          max-h-36 overflow-y-auto 
                          leading-relaxed text-center 
                          px-3 w-full
                          [word-break:break-all]"
              >
                {message}
              </div>
            )}
          </div>

          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700">{cancelLabel}</button>
            <button autoFocus onClick={onConfirm} className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 shadow">{confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
// Note Component
const Note = ({ empdata, handleDelete, handleEdit }) => (
  <div
    className={`
      relative p-4 w-full flex flex-col justify-between rounded-xl 
      shadow-sm border border-blue-300 bg-blue-50 transition-all duration-200 transform
      hover:scale-[1.02] hover:shadow-lg hover:z-20 cursor-pointer
    `}
  >
    {/* Status indicator line */}
    <div
      className={`absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-full ${
        empdata.status === 'Completed'
          ? 'bg-green-200'
          : empdata.status === 'In Progress'
          ? 'bg-blue-200'
          : 'bg-red-200'
      }`}
    />

    {/* Verified badge (top-right) */}
    {empdata.verified && (
      <div className="absolute top-2 right-2">
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-600 text-white">Verified</span>
      </div>
    )}
    <div className="mt-2 flex flex-col gap-2">
      <div className="max-h-20 overflow-y-auto">
  <h3 className="text-lg font-semibold text-gray-800 whitespace-pre-wrap break-words">
    📝 {Array.isArray(empdata.task) ? empdata.task[0] : empdata.task}
  </h3>
</div>


      <ul className="text-sm text-gray-700 space-y-1">
        <li><span className="font-semibold">Assigned:</span> {empdata.date}</li>
        <li><span className="font-semibold">Due:</span> {empdata.due_date ? String(empdata.due_date).slice(0, 10) : "-"}</li>
        <li>
          <span className="font-semibold">Status:</span>
          <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
            empdata.status === 'Completed'
              ? 'bg-green-50 text-green-700'
              : empdata.status === 'In Progress'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-red-50 text-red-700'
          }`}>
            {empdata.status}
          </span>
        </li>
        <li><span className="font-semibold">Assigned By:</span> {empdata.assigned_by}</li>
        <li>
          <span className="font-semibold">Priority:</span>
          <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-50 text-yellow-700 border ${
            empdata.priority === 'High'
              ? 'border-red-500'
              : empdata.priority === 'Medium'
              ? 'border-blue-500'
              : 'border-green-500'
          }`}>
            {empdata.priority}
          </span>
        </li>
      </ul>

      {empdata.subtasks?.length > 0 && (
        <div className="mt-2 border-t pt-2">
          <p className="font-medium text-gray-800 text-sm mb-1">Subtasks:</p>
          <ul className="text-xs text-gray-600 max-h-24 overflow-y-auto custom-scrollbar-hidden hover:custom-scrollbar-visible space-y-1">
            {empdata.subtasks.map((sub, i) => (
              <li key={i} className="flex items-center gap-1">
                <span className={`${sub.completed ? 'text-green-500' : 'text-gray-400'}`}>
                  {sub.completed ? '✓' : '○'}
                </span>
                <span className={`${sub.completed ? 'line-through text-gray-500' : ''} break-words`}>
                  {sub.title || sub.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>

    <div className="flex justify-end gap-2 mt-3">
      <button
      title="Edit"
      onClick={() => {
        if (empdata.verified) return toast.error('This task is verified and cannot be edited.');
        handleEdit(empdata.taskid || empdata._id || empdata.id);
      }}
      className={`p-2 rounded-lg ${
        empdata.verified
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-green-50 hover:bg-green-100 text-green-700'
      } transition`}
    >
      <AiOutlineEdit className="text-xl" />
    </button>

      <button
        onClick={() => {
          if (empdata.verified) return toast.error('This task is verified and cannot be deleted.');
          handleDelete(empdata.taskid || empdata._id || empdata.id);
        }}
        className={`p-2 rounded-lg ${empdata.verified ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-50 hover:bg-red-100 text-red-700'} transition`}
      >
        <AiOutlineDelete className="text-xl" />
      </button>
    </div>
  </div>
);




const TaskAssign = ({ assignType }) => {

const position = LS.get('position');
const pos = (position || '').toString().toLowerCase();

if (pos === 'employee') {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md">
        <h1 className="text-xl font-semibold mb-2">Access Denied</h1>
        <p>Only TL and HR can access this page.</p>
      </div>
    </div>
  );
}

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('assigntask-scrollbar-style')) return;
    const style = document.createElement('style');
    style.id = 'assigntask-scrollbar-style';
    style.innerHTML = `
      /* Firefox */
      .assigntask-thin-scrollbar { scrollbar-width: thin; }
      /* WebKit browsers */
      .assigntask-thin-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
      .assigntask-thin-scrollbar::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.35); border-radius: 9999px; }
      .assigntask-thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
    `;
    document.head.appendChild(style);
  }, []);

  const [deleteTarget, setDeleteTarget] = useState(null); 
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [employeeData, setEmployeeData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModel, SetEditmodel] = useState([]);
  const [modeldata, setModelData] = useState({ task: [""], userid: "", date: "", due_date: "", priority: "Medium", subtasks: [] });
  const [options, SetOptions] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [ValueSelected, SetValueSelected] = useState('');
  const [dateRange, setDateRange] = useState([{ startDate: null, endDate: null, key: "selection" }]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(8); 
  const [searchTerm, setSearchTerm] = useState('');

  const isTL = assignType === 'TL-to-employee';
  const isHR = assignType === 'hr-to-TL';

  useEffect(() => {
    if (!ValueSelected) {
      setFilteredData(employeeData);
      return;
    }

    const selectedUser = options.find(opt => String(opt.userid) === String(ValueSelected));
    if (!selectedUser) {
      setFilteredData(employeeData);
      return;
    }

    const filtered = employeeData.filter((task) => {
      if (Array.isArray(task.assigned_to)) {
        if (task.assigned_to.includes(selectedUser.name) || task.assigned_to.includes(selectedUser.userid)) return true;
      }
      if (task.assigned_to && (task.assigned_to === selectedUser.name || task.assigned_to === selectedUser.userid)) return true;
      if (task.assigned_to_name && (task.assigned_to_name === selectedUser.name || task.assigned_to_name === selectedUser.userid)) return true;
      if (task.userid && String(task.userid) === String(selectedUser.userid)) return true;
      return false;
    });
    setFilteredData(filtered);
  }, [ValueSelected, employeeData, options]);

const sortedData = [...filteredData].reverse(); 

const searchedData = sortedData.filter(task => {
  let title = task.task;

  if (Array.isArray(title)) title = title[0];

  if (typeof title !== 'string') return false;

  return title.toLowerCase().includes(searchTerm.toLowerCase());
});

const currentItems = searchedData.slice(0, itemsToShow);

const handlePageChange = (direction) => {
  if (direction === "prev" && currentPage > 1) {
    setCurrentPage(currentPage - 1);
  } else if (direction === "next" && currentPage < totalPages) {
    setCurrentPage(currentPage + 1);
  }
};

// useEffect(() => {
//   const fetchOptions = async () => {
//     try {
//       let res;
//       if (isTL) {
    
//         res = await axios.get(`${ipadr}/list_users`, {
//           params: { role: "TeamMembers", TL: LS.get("name") }
          
          
//         });
        
//       } else if (isHR) {
       
//         res = await axios.get(`${ipadr}/list_users`, {
//           params: { role: "TL" }
//         });
         
//       }

//       SetOptions(res.data && Array.isArray(res.data) ? res.data : []);
//       console.log(options);
      
//     } catch (err) {
//       console.error("Error fetching users:", err);
//       SetOptions([]);
//     }
//   };

//   fetchOptions();
// }, [isTL, isHR]);



useEffect(() => {
  const fetchOptions = async () => {
    try {
      let res;

      if (isTL) {
        const params = { role: "TeamMembers", TL: LS.get("name") };
        console.log("Sending params:", params);

        res = await axios.get(`${ipadr}/list_users`, { params });

      } else if (isHR) {
        const params = { role: "TL" };
        console.log("Sending params:", params);

        res = await axios.get(`${ipadr}/list_users`, { params });
      }

      console.log("Response data:", res.data);
      SetOptions(Array.isArray(res.data) ? res.data : []);

    } catch (err) {
      console.error("Error fetching users:", err);
      SetOptions([]);
    }
  };

  fetchOptions();
}, [isTL, isHR]);



  useEffect(() => {
    fetchTasks();
  }, [assignType]);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '';
      if (isTL) {
        url = `${ipadr}/tasks?role=TL&TL_name=${LS.get('name')}`;
      } else if (isHR) {
        url = `${ipadr}/tasks?role=hr`;
      }
      const res = await axios.get(url);
      const data = res.data && res.data.data ? res.data.data : [];
      setEmployeeData(data);
      setFilteredData(data);
    } catch (err) {
      setEmployeeData([]);
      setFilteredData([]);
      setError("Error while fetching tasks");
    } finally {
      setLoading(false);
    }
  };

const handleDelete = async (taskId) => {
  if (!taskId) return toast.error("Invalid task ID");

  try {
    const response = await axios.post(`${ipadr}/task_actions`, {
      taskid: taskId,
      action: "delete"
    }, {
      headers: { "Content-Type": "application/json" }
    });

    if (response.status === 200) {
      toast.success(response.data.message || "Task deleted successfully!");
      fetchTasks();
    } else {
      toast.error(response.data.detail || "Failed to delete task");
    }
  } catch (error) {
    toast.error(error.response?.data?.detail || error.message || "Error deleting task");
  }
};


 const handleEdit = async (id) => {
  try {
    const response = await axios.get(`${ipadr}/tasks`, { params: { taskid: id } });

    const taskdetails = response.data?.data;
    // Handle nested 'task' object if present
    const actualTaskData = taskdetails?.task ? taskdetails.task : taskdetails;

    if (!actualTaskData) {
      toast.error("Task data not found.");
      return;
    }

    if (actualTaskData.verified) {
      return toast.error("This task is verified and cannot be edited.");
    }

    SetEditmodel([
      {
        ...actualTaskData,
        subtasks: normalizeSubtasks(actualTaskData.subtasks || []),
        comments: actualTaskData.comments || [],
        files: actualTaskData.files || [],
      },
    ]);
    setModalOpen(true);
  } catch (error) {
    console.error("Error fetching task details:", error);
    toast.error("Error fetching task details");
  }
};

  const normalizeSubtasks = (subtasks) => (Array.isArray(subtasks) ? subtasks.map((s, idx) => ({ id: s.id || `subtask_${Date.now()}_${idx}_${Math.random()}`, title: s.title || s.text || "", text: s.text || s.title || "", completed: s.completed ?? s.done ?? false, done: s.done ?? s.completed ?? false })) : []);

  const handleonSubmit = async () => {
    if (!modeldata.task.some(task => task.trim() !== "")) return toast.error("Task title is required");
    if (!modeldata.due_date) return toast.error("Due date is required");
    if ((isTL || isHR) && selectedUsers.length === 0) return toast.error(isTL ? "Please select an employee" : "Please select a TeamLead");
    let taskArr = [];
   



    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      // If already yyyy-mm-dd, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      // If dd-mm-yyyy or dd/mm/yyyy, convert
      const parts = dateStr.split(/[-\/]/);
      if (parts.length === 3 && parts[2].length === 4) {
        // dd-mm-yyyy to yyyy-mm-dd
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      return dateStr;
    };
    
    try {
      
      if (modeldata.verified) return toast.error('This task is verified and cannot be edited.');
         console.log("Selected Users:", selectedUsers);

      for (let i = 0; i < selectedUsers.length; i++) {
         const userId =
  selectedUsers[i]?.user_id ||
  selectedUsers[i]?.id ||
  selectedUsers[i]?._id;

if (!userId) {
  return toast.error("User ID missing. Please reselect user.");
}
    
        const taskdetails = {
          task: modeldata.task,
          userid: userId,
          assigned_by: LS.get("name"),
          date: new Date().toISOString().split("T")[0],
        due_date: formatDate(modeldata.due_date),
          priority: modeldata.priority || "Medium",
          subtasks: normalizeSubtasks(modeldata.subtasks || []),
        };
        taskArr.push(taskdetails);
      }
      console.log(taskArr);
      
      const response = await axios({ method: "post", url: `${ipadr}/assign_tasks`, data: { Task_details: taskArr }, headers: { "Content-Type": "application/json" } });
      console.log(response);
      if (response.status === 200) {
        toast.success(isTL ? "Task assigned to employee(s)" : "Task assigned to TeamLead(s)");
        setModelData({ task: [""], userid: "", date: "", due_date: "", priority: "Medium", subtasks: [] });
        setSelectedUsers([]);
        setModalOpen(false);
        // Ensure fields are cleared after modal closes
        setTimeout(() => {
          setModelData({ task: [""], userid: "", date: "", due_date: "", priority: "Medium", subtasks: [] });
          setSelectedUsers([]);
        }, 300);
        fetchTasks();
      } else {
        toast.error("Error while adding the task");
      }
    } catch (error) {
      toast.error("Error submitting task");
    }
  };

const handleoneditSubmit = async () => {
  try {
    if (!editModel || editModel.length === 0) return toast.error("No task data to update");
    const item = editModel[0];
    if (item.verified) return toast.error('This task is verified and cannot be edited.');

    // Always format due_date as yyyy-mm-dd
    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      const parts = dateStr.split(/[-\/]/);
      if (parts.length === 3 && parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      return dateStr;
    };

    const updatedetails = {
      taskid: item._id || item.taskid || item.id,
      updated_task: Array.isArray(item.task) ? item.task[0] : item.task,
      userid: item.userid,
      status: item.status,
      due_date: formatDate(item.due_date),
      priority: item.priority || "Medium",
      subtasks: normalizeSubtasks(item.subtasks || []),
      comments: item.comments || [],
      files: item.files || [],
      action: "edit"
    };

    const response = await axios.post(`${ipadr}/task_actions`, updatedetails, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.status === 200) {
      toast.success("Task edited successfully");
      setModalOpen(false);
      SetEditmodel([]);
      setModelData({ task: [""], userid: "", date: "", due_date: "", priority: "Medium", subtasks: [] });
      setSelectedUsers([]);
      fetchTasks();
    } else {
      toast.error("Error while editing the task");
      console.error("Edit task error response:", response);
    }
  } catch (error) {
    toast.error("Error editing task");
    console.error(error);
  }
};

  // UI
  if (loading) return <div className="flex justify-center items-center h-64 text-xl">Loading tasks...</div>;
  if (error) return <div className="flex justify-center items-center h-64 text-xl text-red-500">Error: {error}</div>;

  return (
    <div className="mr-8 p-4 bg-white min-h-screen w-full shadow-black rounded-xl relative jsonback ml-10 rounded-md h-screen flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-1 px-2 py-2">
        <h1 className="text-2xl md:text-3xl font-semibold">Task Assign</h1>
        <button onClick={() => navigate('/User/Task/TaskProgress')} className="px-3 py-1 bg-blue-700 text-white rounded-md text-sm">← Back To Dashboard</button>
      </div>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button className="bg-blue-500 text-white text-sm px-3 py-1 rounded-md" onClick={() => setModalOpen(true)}>Add Task</button>
          </div>
          <div className="flex-1 flex items-center justify-center space-x-3">
            <select className="w-40 p-1 text-sm border border-gray-300 rounded-md" value={ValueSelected} onChange={e => SetValueSelected(e.target.value)}>
              <option value="" disabled hidden>select {isTL ? 'Employee' : 'TeamLead'}</option>
              {options.map(item => (
                <option key={item.id || item.userid} value={item.userid}>{item.name}</option>
              ))}
            </select>
            <input type="text" placeholder="Search task by title..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="px-3 py-1 text-sm border border-gray-300 rounded-md" />
          </div>
          <div className="flex items-center">
            <button onClick={() => { setFilteredData(employeeData); SetValueSelected(''); setSearchTerm(''); }} className="px-3 py-1 bg-gray-500 text-white rounded-md text-sm"><RotateCw className="w-4 h-4 inline-block" /> Reset</button>
          </div>
        </div>
      </header>

      <div className="notes flex-1 overflow-auto overflow-x-hidden p-4 border-t border-gray-100 assigntask-thin-scrollbar">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
          {currentItems && currentItems.length > 0 ? (
            currentItems.map((item, i) => (
              <Note handleDelete={() => setDeleteTarget({ id: item._id || item.id || item.taskid, title: Array.isArray(item.task) ? item.task[0] : item.task })} handleEdit={() => handleEdit(item._id || item.id || item.taskid)} key={item._id || item.id || item.taskid || i} empdata={item} />
            ))
          ) : (
            <div className="col-span-4 text-center py-8">
              <p className="text-gray-500 text-lg">No tasks found. Please add a new task.</p>
            </div>
          )}
        </div>
      </div>
    {(itemsToShow < sortedData.length || itemsToShow > 8) && (
  <div className="flex justify-center gap-4 mt-8">
    {itemsToShow < sortedData.length && (
      <button
        onClick={() => setItemsToShow(prev => prev + 8)} 
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Load More
      </button>
    )}
    {itemsToShow > 8 && (
      <button
        onClick={() => setItemsToShow(8)}
        className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
      >
        Show Less
      </button>
    )}
  </div>
)}

      {modalOpen && createPortal(
        <Modal closeModal={() => { setModalOpen(false); setModelData({ task: [""], userid: "", date: "", due_date: "", priority: "Medium", subtasks: [] }); setSelectedUsers([]); }} onSubmit={handleonSubmit} onCancel={() => { setModalOpen(false); setModelData({ task: [""], userid: "", date: "", due_date: "", priority: "Medium", subtasks: [] }); setSelectedUsers([]); }}>
          <div className="max-h-[50vh] overflow-y-auto">
            {modeldata.task.map((task, index) => (
              <div key={index} className="mb-4">
                <label className="block text-lg font-semibold text-gray-700 mb-2">Task</label>
                <textarea name={`task-${index}`} value={task} onChange={e => { const newTasks = [...modeldata.task]; newTasks[index] = e.target.value; setModelData({ ...modeldata, task: newTasks }); }} className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder-gray-500" placeholder="Enter task description..." />
              </div>
            ))}
            <div className="mt-4">
              <label className="block text-lg font-semibold text-gray-700 mb-2">Due date</label>
              <input type="date" name="due_date" value={modeldata.due_date ? String(modeldata.due_date).slice(0, 10) : ''} onChange={e => setModelData({ ...modeldata, due_date: e.target.value })} min={new Date().toISOString().split("T")[0]} className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition cursor-pointer" />
            </div>
            <div className="mt-4">
              <label className="block text-lg font-semibold text-gray-700 mb-2">Priority</label>
              <select name="priority" value={modeldata.priority || ""} onChange={e => setModelData({ ...modeldata, priority: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400">
                <option value="" disabled hidden>Select Priority</option>
                 <option value="High">High</option>
                 <option value="Medium">Medium</option>
                 <option value="Low">Low</option>
               </select>
             </div>
            <div className="mt-4">
              <label className="block text-lg font-semibold text-gray-700 mb-2">Subtasks</label>
              {modeldata.subtasks?.map((subtask, idx) => (
                <div key={idx} className="flex items-center mb-2">
                  <input type="text" value={subtask.title} onChange={e => { const updated = [...modeldata.subtasks]; updated[idx].title = e.target.value; setModelData({ ...modeldata, subtasks: updated }); }} className="w-full border border-gray-300 rounded px-2 py-1" />
                </div>
              ))}
              <button onClick={() => setModelData({ ...modeldata, subtasks: [...(modeldata.subtasks || []), { title: "", done: false }] })}  className="flex items-center gap-2 text-blue-500 mt-2"><FaPlus /><span>Add Subtask</span></button>
            </div>
            <div className="mt-4">
              <label className="block text-lg font-semibold text-gray-700 mb-2">Select {isTL ? 'Employee(s)' : 'TeamLead(s)'}</label>
              <div className="w-full max-w-sm bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-sm">
                <Multiselect options={options} selectedValues={selectedUsers} onSelect={setSelectedUsers} onRemove={setSelectedUsers} displayValue="name" className="text-gray-700" avoidHighlightFirstOption={true} />
              </div>
            </div>
          </div>
        </Modal>, document.body)}
      {modalOpen && editModel.length > 0 && createPortal(
        <Modal closeModal={() => { setModalOpen(false); SetEditmodel([]); }} onSubmit={handleoneditSubmit} onCancel={() => { setModalOpen(false); SetEditmodel([]); }}>
          {editModel.map((item, index) => {
            const isVerifiedEdit = item?.verified === true;
            const formatDate = (dateStr) => {
              if (!dateStr) return "";
              if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
              const parts = dateStr.split(/[-\/]/);
              if (parts.length === 3 && parts[2].length === 4) {
                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              }
              return dateStr;
            };
            return (
              <div key={index} className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <label className="block mb-1 font-semibold">Task</label>
                  <textarea name="task" value={Array.isArray(item.task) ? item.task[0] : item.task || ""} onChange={e => { const updated = [...editModel]; updated[index].task = e.target.value; SetEditmodel(updated); }} className="w-full border border-gray-300 rounded px-3 py-2" rows="3" required placeholder="Enter task description..." disabled={isVerifiedEdit} />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Due Date</label>
                  <input type="date" name="due_date" value={formatDate(item.due_date)} onChange={e => { const updated = [...editModel]; updated[index].due_date = e.target.value; SetEditmodel(updated); }} required className="w-full border border-gray-300 rounded px-3 py-2" disabled={isVerifiedEdit} />
                </div>
              <div>
                <label className="block mb-1 font-semibold">Status</label>
                <select name="status" value={item.status || "To Do"} onChange={e => { const updated = [...editModel]; updated[index].status = e.target.value; SetEditmodel(updated); }} className="w-full border border-gray-300 rounded px-3 py-2" disabled={isVerifiedEdit}>
                  <option value="">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-semibold">Priority</label>
                <select name="priority" value={item.priority || "Medium"} onChange={e => { const updated = [...editModel]; updated[index].priority = e.target.value; SetEditmodel(updated); }} className="w-full border border-gray-300 rounded px-3 py-2" disabled={isVerifiedEdit}>
                  <option value="" disabled hidden>Select Priority</option>
                   <option value="Low">Low</option>
                   <option value="Medium">Medium</option>
                   <option value="High">High</option>
                 </select>
               </div>
           <div>
      <label className="block mb-1 font-semibold">Subtasks</label>

      {item.subtasks && Array.isArray(item.subtasks) && item.subtasks.length > 0 ? (
        item.subtasks.map((subtask, sidx) => {
          const text = subtask.text ?? subtask.title ?? "";
          const completed = subtask.completed ?? subtask.done ?? false;

          return (
            <div
              key={subtask.id || `subtask-${sidx}`}
              className="flex items-center mb-2 bg-gray-50 p-2 rounded"
            >
              {completed ? (
                <span className="text-green-600 mr-2 text-lg">✓</span>
              ) : (
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
              )}

              <input
                type="text"
                value={text}
                onChange={(e) => {
                  if (completed) return; 
                  const updated = [...editModel];
                  updated[index].subtasks[sidx].text = e.target.value;
                  SetEditmodel(updated);
                }}
                className={`flex-1 border border-gray-300 rounded px-2 py-1 ${
                  completed ? "line-through text-gray-500 bg-gray-100 cursor-default select-none" : ""
                }`}
                placeholder="Enter subtask description..."
                disabled={isVerifiedEdit || completed} 
              />

            {!completed && (
              <button
                type="button"
                onClick={() => {
                  const updated = [...editModel];
                  updated[index].subtasks = updated[index].subtasks.filter(
                    (_, i) => i !== sidx
                  );
                  SetEditmodel(updated);
                }}
                className={`ml-2 px-2 py-1 rounded ${
                  isVerifiedEdit
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-red-500 hover:text-red-700 hover:bg-red-100"
                }`}
                disabled={isVerifiedEdit}
              >
                ✕
              </button>
            )}
            </div>
          );
        })
      ) : (
        <div className="text-gray-500 italic mb-2">No subtasks found</div>
      )}

        <button
          type="button"
          onClick={() => {
            const updated = [...editModel];
            if (!updated[index].subtasks) updated[index].subtasks = [];
            updated[index].subtasks.push({
              id: `subtask_${Date.now()}_${Math.random()}`,
              text: "",
              title: "",
              completed: false,
              done: false,
            });
            SetEditmodel(updated);
          }}
          className={`w-full mt-2 py-2 px-4 rounded transition-colors ${
            isVerifiedEdit
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
          disabled={isVerifiedEdit}
        >
          + Add Subtask
        </button>
      </div>

            </div>
            );
          })}
        </Modal>, document.body)}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete task"
        message={deleteTarget?.title}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { handleDelete(deleteTarget?.id); setDeleteTarget(null); }}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default TaskAssign;