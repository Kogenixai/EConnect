import React, { useState, useEffect } from 'react';
import { 
  FaBell, 
  FaCheck, 
  FaTrash, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaTasks, 
  FaCalendarAlt, 
  FaHome, 
  FaDesktop,
  FaClock,
  FaFilter,
  FaMarkdown,
  FaWifi,
  FaTimesCircle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { LS, ipadr } from '../../Utils/Resuse';
import { toast } from 'react-hot-toast';
import { useNotificationWebSocket } from '../../hooks/useNotificationWebSocket';


const NotificationDashboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState({
    type: 'all',
    priority: 'all',
    status: 'all'
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showMarkAllConfirm, setShowMarkAllConfirm] = useState(false);
  const navigate = useNavigate();
  const userid = LS.get('userid');
  
  // Use WebSocket hook for real-time updates
  const { 
    notifications: wsNotifications, 
    unreadCount: wsUnreadCount, 
    isConnected,
    setNotifications: setWsNotifications,
    setUnreadCount: setWsUnreadCount
  } = useNotificationWebSocket();

  // Debug logging
  useEffect(() => {
    console.log('NotificationDashboard Debug:', {
      userid,
      isConnected,
      wsNotifications: wsNotifications?.length,
      wsUnreadCount,
      apiBaseUrl: ipadr
    });
  }, [userid, isConnected, wsNotifications, wsUnreadCount]);

  // Priority colors - enhanced for overdue tasks
  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200'
  };

  // Enhanced priority colors for overdue tasks
  const getOverduePriorityColors = (priority, isOverdue) => {
    if (isOverdue) {
      return 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-200';
    }
    return priorityColors[priority];
  };

  // Check if notification is overdue
  const isOverdueNotification = (notification) => {
    // Primary check: notification type
    if (notification.type === 'task_overdue' || notification.type === 'employee_task_overdue') {
      return true;
    }
    // Secondary check: metadata flag
    if (notification.metadata?.is_overdue === true) {
      return true;
    }
    // Tertiary check: content pattern
    if (notification.title?.toLowerCase().includes('overdue') || 
        notification.message?.toLowerCase().includes('overdue')) {
      return true;
    }
    return false;
  };

  // Enhanced type icons with attendance subtypes
  const getTypeIcon = (notification) => {
    const isOverdue = isOverdueNotification(notification);
    
    // Check if it's a task-related notification
    const isTaskType = notification.type === 'task' || 
                      notification.type === 'task_overdue' || 
                      notification.type === 'task_due_soon' ||
                      notification.type === 'task_created' ||
                      notification.type === 'task_manager_assigned' ||
                      notification.type === 'task_updated' ||
                      notification.type === 'task_completed' ||
                      notification.type === 'employee_task_overdue';
    
    // Check if it's a leave-related notification
    const isLeaveType = notification.type === 'leave' ||
                       notification.type === 'leave_submitted' ||
                       notification.type === 'leave_approved' ||
                       notification.type === 'leave_rejected' ||
                       notification.type === 'leave_recommended' ||
                       notification.type === 'leave_approval_required' ||
                       notification.type === 'leave_final_approval_required';
    
    // Check if it's a WFH-related notification
    const isWfhType = notification.type === 'wfh' ||
                     notification.type === 'wfh_submitted' ||
                     notification.type === 'wfh_approved' ||
                     notification.type === 'wfh_rejected' ||
                     notification.type === 'wfh_approval_required' ||
                     notification.type === 'wfh_final_approval_required';
    
    // Check if it's an attendance-related notification
    const isAttendanceType = notification.type === 'attendance';
    
    // Enhanced color coding for attendance types
    let iconClass = 'text-gray-600';
    if (isOverdue) {
      iconClass = 'text-red-600';
    } else if (isTaskType) {
      iconClass = 'text-blue-600';
    } else if (isLeaveType) {
      // Enhanced color coding for leave notifications requiring action
      if (notification.type === 'leave_approval_required' || 
          notification.type === 'leave_final_approval_required' ||
          notification.type === 'leave_hr_final_approval' ||
          notification.type === 'leave_hr_pending' ||
          notification.type === 'leave_admin_pending' ||
          notification.type === 'leave_manager_pending') {
        iconClass = 'text-red-600'; // Red for manager/HR action required
      } else if (notification.type === 'leave_approved') {
        iconClass = 'text-green-600'; // Green for approved
      } else if (notification.type === 'leave_rejected') {
        iconClass = 'text-red-600'; // Red for rejected
      } else {
        iconClass = 'text-blue-600'; // Blue for submitted/recommended
      }
    } else if (isWfhType) {
      // Enhanced color coding for WFH notifications requiring action
      if (notification.type === 'wfh_approval_required' || 
          notification.type === 'wfh_final_approval_required' ||
          notification.type === 'wfh_hr_final_approval' ||
          notification.type === 'wfh_hr_pending' ||
          notification.type === 'wfh_admin_pending' ||
          notification.type === 'wfh_manager_pending') {
        iconClass = 'text-red-600'; // Red for manager/HR action required
      } else if (notification.type === 'wfh_approved') {
        iconClass = 'text-green-600'; // Green for approved
      } else if (notification.type === 'wfh_rejected') {
        iconClass = 'text-red-600'; // Red for rejected
      } else {
        iconClass = 'text-purple-600'; // Purple for submitted
      }
    } else if (isAttendanceType) {
      // Different colors for different attendance types
      const attendanceType = notification.metadata?.attendance_type;
      if (attendanceType === 'missed_clock_out') {
        iconClass = 'text-red-600';
      } else if (attendanceType === 'auto_clock_out') {
        iconClass = 'text-yellow-600';
      } else if (attendanceType === 'clock_in' || attendanceType === 'clock_out') {
        iconClass = 'text-green-600';
      } else {
        iconClass = 'text-orange-600';
      }
    } else if (notification.type === 'system') {
      iconClass = 'text-gray-600';
    }
    
    if (isOverdue && isTaskType) {
      return <FaExclamationTriangle className={iconClass} />;
    }
    
    // Use appropriate icon for each type
    let iconType = notification.type;
    if (isTaskType) iconType = 'task';
    else if (isLeaveType) iconType = 'leave';
    else if (isWfhType) iconType = 'wfh';
    else if (isAttendanceType) iconType = 'attendance';
    
    return typeIcons[iconType] ? 
           React.cloneElement(typeIcons[iconType], { className: iconClass }) :
           <FaInfoCircle className={iconClass} />;
  };

  // Type icons
  const typeIcons = {
    task: <FaTasks />,
    leave: <FaCalendarAlt />,
    wfh: <FaHome />,
    system: <FaDesktop />,
    attendance: <FaClock />
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${ipadr}/notifications/${userid}?limit=100`);
      const data = await response.json();
      
      if (response.ok) {
        const fetchedNotifications = data.notifications || [];
        setNotifications(fetchedNotifications);
        setFilteredNotifications(fetchedNotifications);
        
        // Update WebSocket state if connected
        if (isConnected) {
          setWsNotifications(fetchedNotifications);
        }
      } else {
        toast.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Error fetching notifications');
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${ipadr}/notifications/${userid}/unread-count`);
      const data = await response.json();
      
      if (response.ok) {
        const count = data.unread_count || 0;
        setUnreadCount(count);
        
        // Update WebSocket state if connected
        if (isConnected) {
          setWsUnreadCount(count);
        }
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId, currentStatus) => {
    try {
      const response = await fetch(`${ipadr}/notifications/manage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid,
          action: 'mark_read',
          notification_id: notificationId,
          is_read: !currentStatus
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          // Update local state
          const updatedNotifications = notifications.map(notif => 
            notif._id === notificationId 
              ? { ...notif, is_read: !currentStatus }
              : notif
          );
          setNotifications(updatedNotifications);
          applyFilters(updatedNotifications);
          fetchUnreadCount();
          toast.success(`Marked as ${!currentStatus ? 'read' : 'unread'}`);
        }
      } else {
        toast.error('Failed to update notification');
      }
    } catch (error) {
      console.error('Error updating notification:', error);
      toast.error('Error updating notification');
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
  try {
    const response = await fetch(`${ipadr}/notifications/manage`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userid,
        action: 'mark_all_read'
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success') {
        const updatedNotifications = notifications.map(notif => ({ ...notif, is_read: true }));
        setNotifications(updatedNotifications);
        applyFilters(updatedNotifications);
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } else {
      toast.error('Failed to mark all as read');
    }
  } catch (error) {
    console.error('Error marking all as read:', error);
    toast.error('Error marking all as read');
  }
};

  // Delete notification
  const deleteNotification = async (notificationId) => {
  try {
    const response = await fetch(`${ipadr}/notifications/manage`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userid,
        action: 'delete',
        notification_id: notificationId
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success') {
        const updatedNotifications = notifications.filter(notif => notif._id !== notificationId);
        setNotifications(updatedNotifications);
        applyFilters(updatedNotifications);
        fetchUnreadCount();
        toast.success('Notification deleted');
      }
    } else {
      toast.error('Failed to delete notification');
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
    toast.error('Error deleting notification');
  }
};

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (!notification.is_read) {
      markAsRead(notification._id, notification.is_read);
    }

    // Show loading toast
    const loadingToast = toast.loading('Opening notification...');

    // Determine navigation based on notification type and user role
    const isAdmin = LS.get('isadmin');
    const department = LS.get('department');
    const position = LS.get('position');
    
    // HR users should be treated as admin-level for navigation
    const isHR = (department === 'HR' || (position && position.toLowerCase().includes('hr')));
    const isAdminLevel = isAdmin || isHR;
    
    const baseRoute = isAdminLevel ? '/admin' : '/User';
    let targetUrl = null;

    try {
      // Handle specific notification types
      switch (notification.type) {
        // Task-related notifications
        case 'task':
        case 'task_created':
        case 'task_manager_assigned':
        case 'task_overdue':
        case 'task_due_soon':
        case 'task_updated':
       case 'task_completed':
          // Navigate to task page with specific task ID if available
          if (notification.related_id) {
            // For task completion notifications, navigate to task progress/view
            if (notification.type === 'task_completed') {
              targetUrl = isAdminLevel ? '/admin/task' : '/User/Task/TaskProgress';
            } else {
              // For other task notifications, navigate to main task page
              targetUrl = isAdminLevel ? '/admin/task' : '/User/Task/Todo';
            }
          } else {
            // Fallback to main task page
            targetUrl = isAdminLevel ? '/admin/task' : '/User/Task/Todo';
          }
          break;

        // Employee task overdue notifications (for managers/admins)
        case 'employee_task_overdue':
          // This is for managers/admins to see overdue tasks of their employees
          targetUrl = isAdminLevel ? '/admin/task' : '/User/Task/TaskProgress';
          break;

        // Leave-related notifications
        case 'leave':
        case 'leave_submitted':
        case 'leave_approved':
        case 'leave_rejected':
        case 'leave_recommended':
        case 'leave_hr_final_approval':
        case 'leave_hr_pending':
        case 'leave_final_approval_required':
          if (isAdminLevel) {
            targetUrl = '/admin/LeaveManage/leaveapproval';
          } else {
            targetUrl = '/User/Leave/LeaveHistory';
          }
          break;

        // Manager-specific leave notifications (for admins/HR)
        case 'leave_admin_pending':
        case 'leave_manager_pending':
          if (isAdminLevel) {
            targetUrl = '/admin/LeaveManage/leaveapproval';
          } else {
            targetUrl = '/User/LeaveManage';
          }
          break;

        // WFH-related notifications
        case 'wfh':
        case 'wfh_submitted':
        case 'wfh_approved':
        case 'wfh_rejected':
        case 'wfh_hr_approval':
        case 'wfh_hr_final_approval':
        case 'wfh_hr_pending':
        case 'wfh_final_approval_required':
          if (isAdmin) {
            // Admin users go to admin route
            targetUrl = '/admin/LeaveManage/wfh';
          } else if (isHR) {
            // HR users go to User route
            targetUrl = '/User/LeaveManage/wfh';
          } else {
            // Regular users go to their WFH details
            targetUrl = '/User/Leave/LeaveHistory/Remote_details';
          }
          break;

        // Manager-specific WFH notifications (for admins/HR)
        case 'wfh_admin_pending':
        case 'wfh_manager_pending':
          if (isAdminLevel) {
            targetUrl = '/admin/LeaveManage/wfh';
          } else {
            targetUrl = '/User/Leave/Workfromhome';
          }
          break;

        // Attendance-related notifications
        case 'attendance':
          {
            targetUrl = '/User/Clockin_int/Clockdashboard';
          }
          break;

        // Employee management notifications (admin/HR only)
        case 'employee':
          if (isAdminLevel) {
            targetUrl = '/admin/employee';
          } else {
            targetUrl = '/User/profile';
          }
          break;

        // System notifications
        case 'system':
          // Navigate to settings or profile
          targetUrl = `${baseRoute}/profile`;
          break;

        default:
          // Fallback to action_url if provided, or user dashboard
          if (notification.action_url) {
            // Fix action URLs to use correct routing structure
            let actionUrl = notification.action_url;
            
            // Convert old action URLs to new routing structure
            if (actionUrl.startsWith('/User/') && isAdminLevel) {
              // Map user URLs to admin equivalents for admin/HR users
              if (actionUrl.includes('LeaveHistory')) {
                actionUrl = '/admin/LeaveManage/leaveapproval';
              } else if (actionUrl.includes('Leave')) {
                actionUrl = '/admin/LeaveManage';
              } else if (actionUrl.includes('Remote_details')) {
                actionUrl = '/admin/LeaveManage/leave_details/wfh_details';
              } else if (actionUrl.includes('Workfromhome')) {
                actionUrl = '/admin/LeaveManage/wfh';
              } else if (actionUrl.includes('Task/TaskProgress')) {
                actionUrl = '/admin/task';
              } else if (actionUrl.includes('Task/Todo/TaskPage')) {
                actionUrl = '/admin/task';
              } else if (actionUrl.includes('Task/Todo')) {
                actionUrl = '/admin/task';
              } else if (actionUrl.includes('task') || actionUrl.includes('Task')) {
                actionUrl = '/admin/task';
              } else if (actionUrl.includes('Clockdashboard')) {
                actionUrl = '/admin/time';
              }
            } else if ((actionUrl.startsWith('/Admin/') || actionUrl.startsWith('/HR/')) && !isAdminLevel) {
              // Map admin/HR URLs to user equivalents for regular users
              if (actionUrl.includes('leaveapproval') || actionUrl.includes('leave_details')) {
                actionUrl = '/User/Leave/LeaveHistory';
              } else if (actionUrl.includes('leave')) {
                actionUrl = '/User/Leave';
              } else if (actionUrl.includes('wfh_details')) {
                actionUrl = '/User/Leave/LeaveHistory/Remote_details';
              } else if (actionUrl.includes('wfh')) {
                actionUrl = '/User/Leave/Workfromhome';
              } else if (actionUrl.includes('task') || actionUrl.includes('Task')) {
                actionUrl = '/User/Task/Todo';
              }
            } else if (actionUrl.startsWith('/HR/') && isAdminLevel) {
              // Map old HR URLs to admin equivalents
              if (actionUrl.includes('leave')) {
                actionUrl = '/admin/LeaveManage/leaveapproval';
              } else if (actionUrl.includes('wfh')) {
                actionUrl = '/admin/LeaveManage/wfh';
              } else if (actionUrl.includes('task') || actionUrl.includes('Task')) {
                actionUrl = '/admin/task';
              }
            }
            
            targetUrl = actionUrl;
          } else {
            // Fallback to dashboard
            targetUrl = isAdminLevel ? '/admin' : '/User/Clockin_int';
          }
          break;
      }

      // Navigate to the determined URL
      if (targetUrl) {
        console.log(`Navigating to: ${targetUrl} for notification type: ${notification.type} (HR: ${isHR}, Admin: ${isAdmin})`);
        if (loadingToast !== undefined) toast.dismiss(loadingToast);
        toast.success('Opening page...');
        navigate(targetUrl);
      } else {
        if (loadingToast !== undefined) toast.dismiss(loadingToast);
        console.warn('No target URL determined for notification:', notification);
        toast.error('Unable to navigate to the requested page');
      }
    } catch (error) {
  if (loadingToast !== undefined) toast.dismiss(loadingToast);
  console.error('Error handling notification click:', error);
  toast.error('Error opening notification');
    }
  };

  // Apply filters
  const applyFilters = (notificationList = notifications) => {
    let filtered = [...notificationList];

    if (filter.type !== 'all') {
      filtered = filtered.filter(notif => {
        // Handle task type filtering - include all task-related types when 'task' is selected
        if (filter.type === 'task') {
          return notif.type === 'task' || 
                 notif.type === 'task_overdue' || 
                 notif.type === 'task_due_soon' ||
                 notif.type === 'task_created' ||
                 notif.type === 'task_manager_assigned' ||
                 notif.type === 'task_updated' ||
                 notif.type === 'task_completed' ||
                 notif.type === 'employee_task_overdue';
        }
        // Handle leave type filtering - include all leave-related types when 'leave' is selected
        if (filter.type === 'leave') {
          return notif.type === 'leave' ||
                 notif.type === 'leave_submitted' ||
                 notif.type === 'leave_approved' ||
                 notif.type === 'leave_rejected' ||
                 notif.type === 'leave_recommended' ||
                 notif.type === 'leave_approval_required' ||
                 notif.type === 'leave_final_approval_required' ||
                 notif.type === 'leave_hr_final_approval' ||
                 notif.type === 'leave_hr_pending' ||
                 notif.type === 'leave_admin_pending' ||
                 notif.type === 'leave_manager_pending';
        }
        // Handle WFH type filtering - include all WFH-related types when 'wfh' is selected
        if (filter.type === 'wfh') {
          return notif.type === 'wfh' ||
                 notif.type === 'wfh_submitted' ||
                 notif.type === 'wfh_approved' ||
                 notif.type === 'wfh_rejected' ||
                 notif.type === 'wfh_approval_required' ||
                 notif.type === 'wfh_final_approval_required' ||
                 notif.type === 'wfh_hr_final_approval' ||
                 notif.type === 'wfh_hr_pending' ||
                 notif.type === 'wfh_admin_pending' ||
                 notif.type === 'wfh_manager_pending';
        }
        // Handle attendance type filtering - include all attendance-related types when 'attendance' is selected
        if (filter.type === 'attendance') {
          return notif.type === 'attendance';
        }
        return notif.type === filter.type;
      });
    }

    if (filter.priority !== 'all') {
      filtered = filtered.filter(notif => {
        // For overdue notifications, they are displayed as urgent but stored as high priority
        if (filter.priority === 'urgent') {
          return isOverdueNotification(notif) || notif.priority === 'urgent';
        }
        return notif.priority === filter.priority;
      });
    }

    if (filter.status !== 'all') {
      if (filter.status === 'read') {
        filtered = filtered.filter(notif => notif.is_read);
      } else if (filter.status === 'unread') {
        filtered = filtered.filter(notif => !notif.is_read);
      } else if (filter.status === 'overdue') {
        filtered = filtered.filter(notif => isOverdueNotification(notif));
      }
    }

    setFilteredNotifications(filtered);
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    const newFilter = { ...filter, [filterType]: value };
    setFilter(newFilter);
    applyFilters();
  };

  // Format date to show actual timestamp
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    // Format date and time separately for better control
    const dateOptions = {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    };
    
    const timeOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    const formattedDate = date.toLocaleDateString('en-US', dateOptions);
    const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
    
    return `${formattedDate} at ${formattedTime}`;
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Set up polling for real-time updates only when WebSocket is not connected
    let interval;
    if (!isConnected) {
      interval = setInterval(() => {
        fetchNotifications();
        fetchUnreadCount();
      }, 30000); // Poll every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userid, isConnected]);

  // Use WebSocket data when available
  useEffect(() => {
    if (isConnected) {
      // Filter WebSocket notifications to ensure they belong to current user
      const validWsNotifications = wsNotifications.filter(notif => 
        notif.userid === userid
      );
      
      // Merge WebSocket notifications with existing ones, avoiding duplicates
      const mergedNotifications = [...validWsNotifications];
      const wsIds = new Set(validWsNotifications.map(n => n._id));
      
      notifications.forEach(notif => {
        // Only add if it belongs to current user and isn't already in WebSocket data
        if (notif.userid === userid && !wsIds.has(notif._id)) {
          mergedNotifications.push(notif);
        }
      });
      
      // Sort by created_at
      mergedNotifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setNotifications(mergedNotifications);
      setUnreadCount(wsUnreadCount);
    }
  }, [wsNotifications, wsUnreadCount, isConnected, userid]);

  useEffect(() => {
    applyFilters();
  }, [filter, notifications]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-300"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0">
        <div className="max-w-7xl mx-auto p-6 pb-0">
          
          {/* Header */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center">
                <div className="bg-blue-600 p-4 rounded-full mr-4 flex-shrink-0 shadow-sm">
                  <FaBell className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">E-Connect Notifications</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-gray-600">Stay updated with all your activities</p>
                    <div className="flex items-center space-x-1">
                      {isConnected ? (
                        <FaWifi className="text-green-500 text-sm" title="Real-time connected" />
                      ) : (
                        <FaTimesCircle className="text-orange-500 text-sm" title="Polling mode" />
                      )}
                      <span className="text-xs text-gray-500">
                        {isConnected ? 'Live' : 'Polling'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 w-full lg:w-auto justify-end">
                <div className="bg-blue-100 text-blue-500 px-5 py-2.5 rounded-xl font-semibold text-sm">
                  {unreadCount} unread
                </div>
                {showMarkAllConfirm ? (
                  <div className="flex flex-col items-center bg-white border border-blue-200 rounded-lg p-2 shadow-md z-10">
                    <span className="text-sm text-gray-700 mb-2">Mark all notifications as read?</span>
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                        onClick={() => {
                          setShowMarkAllConfirm(false);
                          markAllAsRead();
                        }}
                      >Yes</button>
                      <button
                        className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs"
                        onClick={() => setShowMarkAllConfirm(false)}
                      >No</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowMarkAllConfirm(true)}
                    className="bg-blue-500 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    disabled={unreadCount === 0}
                  >
                    Mark All Read
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-5 mb-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center text-blue-500">
                <FaFilter className="text-xl mr-2" />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <select
                  value={filter.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-50 outline-none transition-all duration-200"
                >
                  <option value="all">All Types</option>
                  <option value="task">Tasks</option>
                  <option value="leave">Leave</option>
                  <option value="wfh">Work from Home</option>
                  <option value="system">System</option>
                  <option value="attendance">Attendance</option>
                </select>

                <select
                  value={filter.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-50 outline-none transition-all duration-200"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>

                <select
                  value={filter.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-50 outline-none transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="overdue">Overdue Tasks</option>
                </select>
              </div>
            </div>
          </div>
       
        </div>
      </div>

      {/* Scrollable Notifications List - Hidden Scrollbar */}
      <div className="flex-1 overflow-hidden">
        <div 
          className="h-full overflow-y-auto px-6 pb-6 hide-scrollbar"
          style={{
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none'  /* IE and Edge */
          }}
        >
          
          <div className="max-w-7xl mx-auto space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaInfoCircle className="text-blue-400 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No notifications found</h3>
                <p className="text-gray-600">You're all caught up! Check back later for updates.</p>
              </div>
            ) : (
              // Group notifications by date
              (() => {
                const groups = {};
                filteredNotifications.forEach((notif) => {
                  const dateKey = new Date(notif.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  });
                  if (!groups[dateKey]) groups[dateKey] = [];
                  groups[dateKey].push(notif);
                });
                return Object.entries(groups).map(([date, notifs]) => (
                  <div key={date}>
                    <div className="sticky top-0 z-10 border border-blue-200 bg-blue-100 py-2.5 px-3 rounded-lg mb-3 shadow text-blue-700 font-semibold text-sm">
                      {date}
                    </div>
                    {notifs.map((notification) => {
                      const isOverdue = isOverdueNotification(notification);
                      return (
                        <div
                          key={notification._id}
                          className={`transition-all duration-200 shadow-md mb-3 min-h-[120px] ${
                            isOverdue && notification.is_read ? 'bg-white border-l-red-500 border border-red-200' :
                            isOverdue ? 'bg-red-50 border-l-red-500 border border-red-200' :
                            !notification.is_read 
                              ? 'bg-white border-l-blue-600 border border-gray-200 hover:shadow-lg' 
                              : 'bg-white border-l-gray-300 border border-gray-200 hover:shadow-lg'
                          } rounded-lg p-4 border-l-4 ${
                            notification.action_url || notification.type ? 'cursor-pointer hover:border-l-blue-700' : 'cursor-default'
                          } ${
                            notification.action_url || notification.type ? 'relative' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          {/* Clickable indicator */}
                          {(notification.action_url || notification.type) && (
                            <div className="absolute top-4 right-4 flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity duration-200">
                              <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full mr-1 select-none">Click to view</span>
                              <div className="bg-blue-500 text-white p-1 rounded-full text-xs">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          )}
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <div className={`mt-1 p-3 rounded-lg flex-shrink-0 w-10 h-10 flex items-center justify-center ${
                                  isOverdue && notification.is_read ? 'bg-white' :
                                  isOverdue ? 'bg-red-100' :
                                  !notification.is_read ? 'bg-blue-50' : 'bg-gray-100'
                              }`}>
                                <div className="text-base">
                                  {getTypeIcon(notification)}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <h3 className={`font-semibold text-base ${
                                    isOverdue ? 'text-red-700' :
                                    !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                                  }`}>
                                    {notification.title}
                                  </h3>
                                  <span className={`px-2.5 py-1 text-xs rounded-md font-medium border ${
                                    isOverdue ? 'bg-red-100 text-red-800 border-red-200' : getOverduePriorityColors(notification.priority, isOverdue)
                                  }`}>
                                    {isOverdue ? 'URGENT' : notification.priority}
                                  </span>
                                  {!notification.is_read && (
                                    <div className="flex items-center gap-1">
                                      <div className={`w-2 h-2 rounded-full ${
                                        isOverdue ? 'bg-red-500' : 'bg-blue-400'
                                      } animate-pulse`}></div>
                                      <span className={`text-xs font-semibold ${
                                        isOverdue ? 'text-red-600' : 'text-blue-500'
                                      }`}>NEW</span>
                                    </div>
                                  )}
                                </div>
                                <p className={`text-sm mb-3 leading-relaxed ${
                                  isOverdue && notification.is_read ? 'text-gray-600' :
                                  isOverdue ? 'text-red-700 font-medium' :
                                  !notification.is_read ? 'text-gray-800' : 'text-gray-600'
                                }`}>
                                  {(() => {
                                    // Truncate task name if present in message
                                    if (notification.type === 'task' || notification.type === 'task_updated' || notification.type === 'task_created' || notification.type === 'task_manager_assigned') {
                                      // Try to extract the task name from the message
                                      const match = notification.message.match(/'(.*?)'/);
                                      if (match && match[1]) {
                                        let taskName = match[1];
                                        if (taskName.length > 20) {
                                          taskName = taskName.substring(0, 20) + '...';
                                        }
                                        // Replace the long task name in the message with the truncated one
                                        return notification.message.replace(match[1], taskName);
                                      }
                                    }
                                    return notification.message;
                                  })()}
                                </p>
                                <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                                  <span className="text-xs text-gray-600 bg-blue-100 px-3 py-1.5 rounded-md">
                                    {formatDate(notification.created_at)}
                                  </span>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markAsRead(notification._id, notification.is_read);
                                      }}
                                      className={`p-2.5 rounded-lg transition-colors duration-200 ${
                                        notification.is_read 
                                          ? 'text-gray-500 hover:bg-gray-100 border border-gray-300' 
                                          : 'text-blue-500 hover:bg-blue-50 bg-blue-50 border border-blue-200'
                                      }`}
                                      title={notification.is_read ? 'Mark as unread' : 'Mark as read'}
                                    >
                                      <FaCheck size={14} />
                                    </button>
                                    {confirmDeleteId === notification._id ? (
                                      <div className="flex flex-col items-center bg-white border border-red-200 rounded-lg p-2 shadow-md z-10">
                                        <span className="text-sm text-gray-700 mb-2">Delete this notification?</span>
                                        <div className="flex gap-2">
                                          <button
                                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              deleteNotification(notification._id);
                                              setConfirmDeleteId(null);
                                            }}
                                          >Yes</button>
                                          <button
                                            className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setConfirmDeleteId(null);
                                            }}
                                          >No</button>
                                        </div>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setConfirmDeleteId(notification._id);
                                        }}
                                        className="p-2.5 rounded-lg transition-colors duration-200 text-red-600 hover:bg-red-50 border border-red-200"
                                        title="Delete notification"
                                      >
                                        <FaTrash size={14} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ));
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDashboard;