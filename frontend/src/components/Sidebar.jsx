
import React, { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiLogOut, FiUser, FiClock } from "react-icons/fi";
import { LS } from "../Utils/Resuse";
import NotificationBell from "./notifications/NotificationBell";

// Modal component
const Modal = ({ show, onClose, onConfirm, message }) => {
  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all">
        <div className="bg-blue-600 px-6 py-4 text-center">
          <h3 className="text-xl font-semibold text-white font-poppins">
            Confirm Logout
          </h3>
        </div>
        
        <div className="px-6 py-6">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex-shrink-0">
              <svg
                className="w-12 h-12 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-700 text-base font-poppins leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-center">
          <button
            className="px-6 py-2.5 rounded-lg font-medium font-poppins transition-all duration-200 bg-gray-200 hover:bg-gray-300 text-gray-700 hover:shadow-md"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2.5 rounded-lg font-medium font-poppins transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg"
            onClick={onConfirm}
          >
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ userPicture, userName, isLoggedIn, onLogout = () => {} }) => {
  const navigate = useNavigate(); // Declare navigate only once
  const location = useLocation();
  
  const isActive = (segmentOrArray) => {
    try {
      const currentPath = location.pathname.toLowerCase().replace(/^\/|\/$/g, "");
      
      // Handle array of possible paths
      const targets = Array.isArray(segmentOrArray)
        ? segmentOrArray.map((s) => String(s).toLowerCase())
        : [String(segmentOrArray).toLowerCase()];

      // Check each target path
      for (const target of targets) {
        const targetPath = target.replace(/^\/|\/$/g, "");
        
        if (currentPath === targetPath) {
          return true;
        }
        
        const currentSegments = currentPath.split("/").filter(Boolean);
        const targetSegments = targetPath.split("/").filter(Boolean);
        
        for (let i = 0; i <= currentSegments.length - targetSegments.length; i++) {
          let match = true;
          for (let j = 0; j < targetSegments.length; j++) {
            if (currentSegments[i + j] !== targetSegments[j]) {
              match = false;
              break;
            }
          }
          if (match) {
            return true;
          }
        }
        
        // Fallback: Check if the last segment matches (for single-word routes)
        if (targetSegments.length === 1) {
          const lastSegment = currentSegments[currentSegments.length - 1];
          if (lastSegment === targetSegments[0]) {
            return true;
          }
          
          // Check first token for routes with separators (e.g., 'clockin_int' -> 'clockin')
          const firstToken = lastSegment.split(/[^a-z0-9]+/).filter(Boolean)[0] || lastSegment;
          if (firstToken === targetSegments[0]) {
            return true;
          }
        }
      }
      
      return false;
    } catch (e) {
      console.error('isActive error:', e);
      return false;
    }
  };
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    
    LS.remove("isloggedin");
    LS.remove("access_token");
    LS.remove("userid");
    LS.remove("name");
    LS.remove("isadmin");
    LS.remove("position");
    LS.remove("department");
    
    if (onLogout && typeof onLogout === 'function') {
      onLogout();
    }
    
    toast.success("Successfully logged out!", {
      position: "top-right",
      autoClose: 2000,
    });
    
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 0);
  }; 

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const handleClick = () => {
    navigate("/User/profile");
  };
  const loggedIn = LS.get("isloggedin");
  const isAdmin = LS.get("isadmin");
  const isTL = (LS.get("position") || "").toUpperCase(); 
  const isDepart = (LS.get("department") || "").toUpperCase(); 
  const userid=LS.get('userid');

  const isLeaveDetails = isActive('leave_details');
return (
  <div className="flex flex-col min-h-screen w-64 bg-white border-r border-slate-200 shadow-sm">
    {/* Header Section */}
    <div className="p-5 border-b border-slate-200 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
          <span className="text-white font-bold text-sm">W</span>
        </div>
        <span className="font-semibold text-slate-900 text-lg">Workspace</span>
      </div>
      <NotificationBell />
    </div>

    {/* Navigation Links */}
    <div className="flex-1 overflow-y-auto py-4 px-3">
      <nav className="space-y-1">
        {loggedIn && isAdmin ? (
          <>
            <NavLink to="time" className={({isActive}) => 
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`
            }>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l3 3" />
              </svg>
              <span className="font-medium text-sm">Time Management</span>
            </NavLink>

            <Link to="LeaveManage">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive('LeaveManage') 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                <span className="font-medium text-sm">Leave Management</span>
              </div>
            </Link>

            <Link to="employee">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive('employee') 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-medium text-sm">Employee List</span>
              </div>
            </Link>

            <Link to="newUser">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive('newuser') 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="font-medium text-sm">Add Employee</span>
              </div>
            </Link>

            <Link to="notifications">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive('notifications') 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="font-medium text-sm">Notifications</span>
              </div>
            </Link>

            <Link to="addLeave">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive('addleave') 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium text-sm">Add Leave</span>
              </div>
            </Link>

            <Link to="review-docs">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive('review-docs') 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-sm">Docs Review</span>
              </div>
            </Link>

            <Link to="chat">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive('chat') 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-medium text-sm">Chat</span>
              </div>
            </Link>
          </>
        ) : loggedIn && !isAdmin && (
          <>
            <NavLink to="Clockin_int" className={({isActive}) => 
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`
            }>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l3 3" />
              </svg>
              <span className="font-medium text-sm">Time Management</span>
            </NavLink>

            <Link to="Leave">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                (isActive('Leave') && !isLeaveDetails) 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                <span className="font-medium text-sm">Leave Management</span>
              </div>
            </Link>

            {isDepart !== "HR" && (
              <Link to="Task/Todo">
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive('todo') 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="font-medium text-sm">Task List</span>
                </div>
              </Link>
            )}

            <Link to="notifications">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive('notifications') 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="font-medium text-sm">Notifications</span>
              </div>
            </Link>

            <Link to="docs/my-documents">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive('my-documents') 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium text-sm">My Documents</span>
              </div>
            </Link>

            <Link to="chat">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive('chat') 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-medium text-sm">Chat</span>
              </div>
            </Link>
          </>
        )}

        {loggedIn && isTL === "TL" && (
          <>
            <Link to="Task/TaskProgress">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive('Task/TaskProgress') 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium text-sm">Employee Task Progress</span>
              </div>
            </Link>

            <Link to="LeaveManage">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive('LeaveManage') 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                <span className="font-medium text-sm">Employee Leave</span>
              </div>
            </Link>
          </>
        )}

        {loggedIn && isDepart === "HR" && (
          <>
            <Link to="Task/TaskProgress">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive('Task/TaskProgress') 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium text-sm">TeamLead Progress</span>
              </div>
            </Link>

            <Link to="LeaveManage">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive('LeaveManage') 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                <span className="font-medium text-sm">Employee Leave</span>
              </div>
            </Link>

            <Link to="timemanage">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive('Timemanage') 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}>
                <FiClock className="w-5 h-5" />
                <span className="font-medium text-sm">Employee Time</span>
              </div>
            </Link>

            <Link to="newUser">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive('newuser') 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="font-medium text-sm">Add Employee</span>
              </div>
            </Link>
          </>
        )}
      </nav>
    </div>

    {/* Footer Section */}
    <div className="border-t border-slate-200 p-4">
      <div className="flex items-center justify-around gap-4">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          title="Logout"
        >
          <FiLogOut size={20} />
        </button>
        <button
          onClick={() => {
            if (loggedIn && !isAdmin) {
              navigate("/User/profile");
            } else if (loggedIn && isAdmin) {
              navigate("/admin/profile");
            }
          }}
          className="flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 hover:bg-slate-100 transition-all duration-200"
          title="Profile"
        >
          <FiUser size={20} />
        </button>
      </div>
    </div>

    {/* Logout Modal */}
    <Modal
      show={showLogoutModal}
      onClose={handleLogoutCancel}
      onConfirm={handleLogoutConfirm}
      message="Are you sure you want to logout?"
    />
  </div>
);
  // return (
  //   <div className="flex flex-col min-h-screen w-64 bg-blue-600 text-white shadow-lg border-r">
  //     {/* Logo Section */}
  //     <div className="p-4 border-b-2 border-white border-purple-900 flex items-center justify-between">
       
  //       <NotificationBell className="mr-2" />
  //     </div>

  //     {/* Links Section */}
  //     <div className="flex flex-col mt-6">
  //       {loggedIn && isAdmin ? (
  //         <>
  //           <NavLink to="time" className={({isActive}) => `sidebar-item flex items-center p-4 ${isActive ? 'bg-blue-800' : 'hover:bg-blue-700'} transition-colors`}>
  //               <svg
  //                 xmlns="http://www.w3.org/2000/svg"
  //                 fill="none"
  //                 viewBox="0 0 24 24"
  //                 stroke="currentColor"
  //                 className="w-6 h-6 mr-3 text-white"
  //               >
  //                 <circle cx="12" cy="12" r="10" strokeWidth="2" />
  //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l3 3" />
  //               </svg>
  //               <span className="font-medium">Time Management</span>
  //           </NavLink>

  //           <Link to="LeaveManage" className="sidebar-item">
  //             <div className={`flex items-center p-4 ${isActive('LeaveManage') ? 'bg-blue-800' : 'hover:bg-blue-700'} transition-colors`}>
  //               <svg
  //                 xmlns="http://www.w3.org/2000/svg"
  //                 fill="none"
  //                 viewBox="0 0 24 24"
  //                 stroke="currentColor"
  //                 className="w-6 h-6 mr-3 text-white"
  //               >
  //                 <path
  //                   strokeLinecap="round"
  //                   strokeLinejoin="round"
  //                   strokeWidth="2"
  //                   d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
  //                 />
  //               </svg>
  //               <span className="font-medium">Leave Management</span>
  //             </div>
  //           </Link>

  //           <Link to="employee" className="sidebar-item">
  //             <div className={`flex items-center p-4 ${isActive('employee') ? 'bg-blue-800' : 'hover:bg-blue-700'} transition-colors`}>
  //               <svg
  //                 xmlns="http://www.w3.org/2000/svg"
  //                 fill="none"
  //                 viewBox="0 0 24 24"
  //                 stroke="currentColor"
  //                 className="w-6 h-6 mr-3 text-white"
  //               >
  //                 <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
  //                 <circle cx="16" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
  //                 <circle cx="12" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
  //                 <path
  //                   strokeLinecap="round"
  //                   strokeLinejoin="round"
  //                   strokeWidth="2"
  //                   d="M6 18a6 6 0 016-6h4a6 6 0 016 6"
  //                 />
  //               </svg>
  //               <span className="font-medium">Employee List</span>
  //             </div>
  //           </Link>

  //           <Link to="newUser" className="sidebar-item">
  //             <div className={`flex items-center p-4 ${isActive('newuser') ? 'bg-blue-800' : 'hover:bg-blue-700'} transition-colors`}>
  //               <svg
  //                 xmlns="http://www.w3.org/2000/svg"
  //                 fill="none"
  //                 viewBox="0 0 24 24"
  //                 stroke="currentColor"
  //                 className="w-6 h-6 mr-3 text-white"
  //               >
  //                 <path
  //                   strokeLinecap="round"
  //                   strokeLinejoin="round"
  //                   strokeWidth="2"
  //                   d="M12 4a4 4 0 110 8 4 4 0 010-8zM6 20v-1a6 6 0 0112 0v1M16 11h6m-3-3v6"
  //                 />
  //               </svg>
  //               <span className="font-medium">Add Employee</span>
  //             </div>
  //           </Link>

  //           <Link to="notifications" className="sidebar-item">
  //             <div className={`flex items-center p-4 ${isActive('notifications') ? 'bg-blue-800' : 'hover:bg-blue-700'} transition-colors`}>
  //               <svg
  //                 xmlns="http://www.w3.org/2000/svg"
  //                 fill="none"
  //                 viewBox="0 0 24 24"
  //                 stroke="currentColor"
  //                 className="w-6 h-6 mr-3 text-white"
  //               >
  //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  //               </svg>
  //               <span className="font-medium">Notifications</span>
  //             </div>
  //           </Link>

  //           <Link to="addLeave" className="sidebar-item">
  //             <div className={`flex items-center p-4 ${isActive('addleave') ? 'bg-blue-800' : 'hover:bg-blue-700'} transition-colors`}>
                
  //               <svg xmlns="http://www.w3.org/2000/svg" 
  //                 fill="none" 
  //                 viewBox="0 0 24 24" 
  //                 strokeWidth="1.5" 
  //                 stroke="currentColor" 
  //                 className="size-6 mr-3"
  //                 >
  //               <path 
  //                 strokeLinecap="round" 
  //                 strokeLinejoin="round" 
  //                 d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z" />
  //             </svg>

  //             <span className="font-medium">Add Leave</span>
  //             </div>
  //           </Link>

  //           <Link to="review-docs" className="sidebar-item">
  //             <div className={`flex items-center p-4 ${isActive('review-docs') ? 'bg-blue-800' : 'hover:bg-blue-700'} transition-colors`}>
  //               <svg xmlns="http://www.w3.org/2000/svg" fill="none" 
  //                 viewBox="0 0 24 24" stroke="currentColor" 
  //                 className="w-6 h-6 mr-3 text-white">
  //                 <path strokeLinecap="round" strokeLinejoin="round" 
  //                   strokeWidth="2" d="M5 13l4 4L19 7" />
  //               </svg>
  //               <span className="font-medium">Docs Review</span>
  //             </div>
  //           </Link>

  //          <Link to="chat" className="sidebar-item">
  //             <div
  //               className={`flex items-center p-4 ${isActive('chat') ? 'bg-blue-800' : 'hover:bg-blue-700'} transition-colors`}
  //             >
  //               <svg
  //                 xmlns="http://www.w3.org/2000/svg"
  //                 fill="none"
  //                 viewBox="0 0 24 24"
  //                 stroke="currentColor"
  //                 className="w-6 h-6 mr-3 text-white"
  //               >
  //                 <path
  //                   strokeLinecap="round"
  //                   strokeLinejoin="round"
  //                   strokeWidth="2"
  //                   d="M7 8h10M7 12h4m1 8a9 9 0 110-18 9 9 0 010 18z"
  //                 />
  //               </svg>
  //               <span className="font-medium">Chat</span>
  //             </div>
  //           </Link>
  //         </>

  //       ) : loggedIn && !isAdmin && (
  //         <>
  //           <NavLink to="Clockin_int" className={({isActive}) => `sidebar-item flex items-center p-4 ${isActive ? 'bg-blue-800' : 'hover:bg-blue-700'} transition-colors`}>
  //               <svg
  //                 xmlns="http://www.w3.org/2000/svg"
  //                 fill="none"
  //                 viewBox="0 0 24 24"
  //                 stroke="currentColor"
  //                 className="w-6 h-6 mr-3 text-white"
  //               >
  //                 <circle cx="12" cy="12" r="10" strokeWidth="2" />
  //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l3 3" />
  //               </svg>
  //               <span className="font-medium">Time Management</span>
  //           </NavLink>

  //           <Link to="Leave" className="sidebar-item">
  //             <div className={`flex items-center p-4 ${(isActive('Leave') && !isLeaveDetails) ? 'bg-blue-800' : 'hover:bg-blue-700'} transition-colors`}>
  //               <svg
  //                 xmlns="http://www.w3.org/2000/svg"
  //                 fill="none"
  //                 viewBox="0 0 24 24"
  //                 stroke="currentColor"
  //                 className="w-6 h-6 mr-3 text-white"
  //               >
  //                 <path
  //                   strokeLinecap="round"
  //                   strokeLinejoin="round"
  //                   strokeWidth="2"
  //                   d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
  //                 />
  //               </svg>
  //               <span className="font-medium">Leave Management</span>
  //             </div>
  //           </Link>

  //           {isDepart !== "HR" && (
  //           <Link to="Task/Todo" className="sidebar-item">
  //             <div className={`flex items-center p-4 ${isActive('todo') ? 'bg-blue-800' : 'hover:bg-blue-700'} transition-colors`}>
  //               <svg
  //                 xmlns="http://www.w3.org/2000/svg"
  //                 fill="none"
  //                 viewBox="0 0 24 24"
  //                 stroke="currentColor"
  //                 className="w-6 h-6 mr-3 text-white"
  //               >
  //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 3h12M6 7h12M6 11h12M6 15h12M6 19h12" />
  //               </svg>
  //               <span className="font-medium">Task List</span>
  //             </div>
  //           </Link>
  //           )}

  //           <Link to="notifications" className="sidebar-item">
  //             <div className={`flex items-center p-4 ${isActive('notifications') ? 'bg-blue-800' : 'hover:bg-blue-700'} transition-colors`}>
  //               <svg
  //                 xmlns="http://www.w3.org/2000/svg"
  //                 fill="none"
  //                 viewBox="0 0 24 24"
  //                 stroke="currentColor"
  //                 className="w-6 h-6 mr-3 text-white"
  //               >
  //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  //               </svg>
  //               <span className="font-medium">Notifications</span>
  //             </div>
  //           </Link>

  //            <Link to="docs/my-documents" className="sidebar-item">
  //             <div className={`flex items-center p-4 ${isActive('my-documents') ? 'bg-blue-800' : 'hover:bg-blue-700'} transition-colors`}>
  //               <svg xmlns="http://www.w3.org/2000/svg" fill="none" 
  //                 viewBox="0 0 24 24" stroke="currentColor" 
  //                 className="w-6 h-6 mr-3 text-white">
  //                 <path strokeLinecap="round" strokeLinejoin="round" 
  //                   strokeWidth="2"
  //                   d="M7 3h8l4 4v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm8 1.5V9h4.5"
  //                 />
  //               </svg>
  //               <span className="font-medium">My Documents</span>
  //             </div>
  //           </Link>

  //            <Link to="chat" className="sidebar-item">
  //             <div
  //               className={`flex items-center p-4 ${isActive('chat') ? 'bg-blue-800' : 'hover:bg-blue-700'} transition-colors`}
  //             >
  //               <svg
  //                 xmlns="http://www.w3.org/2000/svg"
  //                 fill="none"
  //                 viewBox="0 0 24 24"
  //                 stroke="currentColor"
  //                 className="w-6 h-6 mr-3 text-white"
  //               >
  //                 <path
  //                   strokeLinecap="round"
  //                   strokeLinejoin="round"
  //                   strokeWidth="2"
  //                   d="M7 8h10M7 12h4m1 8a9 9 0 110-18 9 9 0 010 18z"
  //                 />
  //               </svg>
  //               <span className="font-medium">Chat</span>
  //             </div>
  //           </Link>
  //         </>
  //       ) 
  //       }

  //       {
  //         loggedIn && isTL==="TL" ?(
  //         <>

  //           <Link to="Task/TaskProgress" className="sidebar-item">
  //             <div className={`flex items-center p-4 ${isActive('Task/TaskProgress') ? 'bg-blue-800' : 'hover:bg-blue-700'} transition-colors`}>
  //               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
  //                   stroke="currentColor" className="w-6 h-6 mr-3 text-white">
  //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
  //                       d="M6 3h12M6 7h12M6 11h12M6 15h12M6 19h12"/>
  //               </svg>
  //               <span className="font-medium">Employee Task Progress</span>
  //             </div>
  //           </Link>

  //           <Link to="LeaveManage" className="sidebar-item">
  //             <div className={`flex items-center p-4 ${isActive('LeaveManage') ? 'bg-blue-800' : 'hover:bg-blue-700'} transition-colors`}>
  //               <svg
  //                 xmlns="http://www.w3.org/2000/svg"
  //                 fill="none"
  //                 viewBox="0 0 24 24"
  //                 stroke="currentColor"
  //                 className="w-6 h-6 mr-3 text-white"
  //               >
  //                 <path
  //                   strokeLinecap="round"
  //                   strokeLinejoin="round"
  //                   strokeWidth="2"
  //                   d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
  //                 />
  //               </svg>
  //               <span className="font-medium">Employee Leave Management</span>
  //             </div>
  //           </Link>

           
  //         </>
  //         ): loggedIn && isDepart==="HR" && (
  //          <>

  //       <Link to="Task/TaskProgress" className="sidebar-item">
  //         <div className={`flex items-center p-4 ${isActive('Task/TaskProgress') ? 'bg-blue-800' : 'hover:bg-blue-700'} transition-colors`}>
  //           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
  //               stroke="currentColor" className="w-6 h-6 mr-3 text-white">
  //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
  //                   d="M6 3h12M6 7h12M6 11h12M6 15h12M6 19h12"/>
  //           </svg>
  //           <span className="font-medium">TeamLead Task Progress</span>
  //         </div>
  //       </Link>
      
  //       <Link to="LeaveManage" className="sidebar-item">
  //         <div className={`flex items-center p-4 ${isActive('LeaveManage') ? 'bg-blue-800' : 'hover:bg-blue-700'} transition-colors`}>
  //               <svg
  //                 xmlns="http://www.w3.org/2000/svg"
  //                 fill="none"
  //                 viewBox="0 0 24 24"
  //                 stroke="currentColor"
  //                 className="w-6 h-6 mr-3 text-white"
  //               >
  //                 <path
  //                   strokeLinecap="round"
  //                   strokeLinejoin="round"
  //                   strokeWidth="2"
  //                   d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
  //                 />
  //               </svg>
  //               <span className="font-medium">Employee Leave Management</span>
  //         </div>
  //       </Link>

  //           <Link to="timemanage" className="sidebar-item">
  //             <div className={`flex items-center p-4 ${isActive('Timemanage') ? 'bg-blue-800' : 'hover:bg-blue-700'} transition-colors`}>
  //               <FiClock className="w-6 h-6 mr-3 text-white" />
  //               <span className="font-medium">Employee Time Management</span>
  //             </div>
  //           </Link>

  //           <Link to="newUser" className="sidebar-item">
  //             <div className={`flex items-center p-4 ${isActive('newuser') ? 'bg-blue-800' : 'hover:bg-blue-700'} transition-colors`}>
  //               <svg
  //                 xmlns="http://www.w3.org/2000/svg"
  //                 fill="none"
  //                 viewBox="0 0 24 24"
  //                 stroke="currentColor"
  //                 className="w-6 h-6 mr-3 text-white"
  //               >
  //                 <path
  //                   strokeLinecap="round"
  //                   strokeLinejoin="round"
  //                   strokeWidth="2"
  //                   d="M12 4a4 4 0 110 8 4 4 0 010-8zM6 20v-1a6 6 0 0112 0v1M16 11h6m-3-3v6"
  //                 />
  //               </svg>
  //               <span className="font-medium">Add Employee</span>
  //             </div>
  //           </Link>
  //          </>
  //         )
  //       }
  //     </div>

  //     {/* Footer Section */}
  //     <div className="mt-auto border-t-2 border-white border-purple-900 p-4 flex justify-around">
  //       <FiLogOut
  //         size={24}
  //         className="cursor-pointer hover:text-red-500"
  //         onClick={() => setShowLogoutModal(true)}
  //       />
  //       <FiUser
  //         size={24}
  //         className="cursor-pointer "
  //         onClick={() => {
  //           if (loggedIn && !isAdmin) {
  //             navigate("/User/profile");
  //           } else if (loggedIn && isAdmin) {
  //             navigate("/admin/profile");
  //           }
  //         }}

  //       />
  //     </div>

  //     {/* Logout Modal */}
  //     <Modal
  //       show={showLogoutModal}
  //       onClose={handleLogoutCancel}
  //       onConfirm={handleLogoutConfirm}
  //       message="Are you sure you want to logout?"
  //     />
  //   </div>
  // );
};

export default Sidebar;
