import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter,createBrowserRouter, Outlet, Route, RouterProvider, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import App from "./App";
import Clockin from "./components/clock/Clockin";
import Sidebar from "./components/Sidebar";
import Checkauth from "./Utils/Checkauth";
import Clockdashboard from "./components/clock/Clockdashboard";
import Clockin_int from "./components/clock/Clockin_int";
import Leave from "./components/leave/Leave";
import LeaveHistory from "./components/leave/LeaveHistory";
import Leaverequest from "./components/leave/Leaverequest";
import Holidaylist from "./components/leave/Holidayslist";
import Workfromhome from "./components/leave/Workfromhome";
import Remote_details from "./components/leave/Remote_details";
import UserProfile from "./components/profile/UserProfile";
import Timemanagement from "./components/Adminfrontend/Timemanagement";
import Employeelist from "./components/Adminfrontend/Employeelist";
import Leavemanagement from "./components/Adminfrontend/leave/Leavemanagement";
import Leaveapproval from "./components/Adminfrontend/leave/Leave_approval";
import Wfh from "./components/Adminfrontend/leave/Wfh_approval";
import AdminProfile from "./components/Adminfrontend/Adminprofile";
import AddUser from "./components/Adminfrontend/new_employee";
import EmployeeDetails from "./components/Adminfrontend/EmployeeDetails";
import LoginPage from "./components/login/Loginpage";
import ProgressDetail from './components/Task/ProgressDetail';
import TaskAssign from './components/Task/TaskAssign';
import TaskDetailsPage from "./components/Task/TaskDetailsPage";
import TaskPage from "./components/Task/Taskpage";
import TaskProgress from "./components/Task/TaskProgress";
import ToDoList from "./components/Task/Todo";
import NotificationDashboard from "./components/notifications/NotificationDashboard";
import AdminAuth from "./Utils/AdminAuth";
import Attendance from "./components/Adminfrontend/Attendance";
import AddLeave from "./components/Adminfrontend/leave/AddLeave";
import AttendanceStats from "./components/profile/AttendanceStats";
import LeaveDetails from "./components/Adminfrontend/leave/LeaveDetails";
import RemoteDetails from "./components/Adminfrontend/leave/RemoteDetails";
import Chat from './components/Chat';
import OnboardingDocs from './components/docs/OnboardingDocs';
import AdminDocsReview from './components/Adminfrontend/AdminDocsReview';
import Fileuploader from './components/docs/file/Fileuploader';
import GlobalNotificationToast from './components/notifications/GlobalNotificationToast';


// Create a simple dashboard home component for admin
const DashboardHome = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
    <p className="text-gray-600">Welcome to the admin panel. Select an option from the sidebar to get started.</p>
  </div>
);

const DashboardPage = () => (
  <Checkauth>
    <div className="flex h-screen w-full flex-col lg:flex-row">
      <Sidebar />
      <div
        id="temp"
        className="h-full w-full overflow-x-hidden flex justify-center items-center"
      >
        <Outlet />
      </div>
      <GlobalNotificationToast />
    </div>
  </Checkauth>
);

const AdminDashboardPage = () => (
  <AdminAuth>
    <DashboardPage />
  </AdminAuth>
);


const router = createBrowserRouter([
  // Public routes
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <LoginPage /> },
    ],
  },
  {
    path: "/Login",
    element: <LoginPage />,
  },

  // User routes
  {
    path: "/User",
    element: <DashboardPage />,
    children: [
      { index: true, element: <></> },
      { path: "profile", element: <UserProfile /> },
      { path: "notifications", element: <NotificationDashboard /> },
      { path: "chat", element: <Chat /> },
      { path: "timemanage", element: <Timemanagement /> },
      { path: "individualStats", element: <AttendanceStats /> },

      // Clock-in
      {
        path: "Clockin_int",
        element: <Clockin_int />,
        children: [
          { index: true, element: <Clockin /> },
          { path: "Clockdashboard", element: <Clockdashboard /> },
        ],
      },

      // Task routes
      { path: "Task/Todo", element: <ToDoList /> },
      { path: "Task/Todo/TaskPage", element: <TaskPage /> },
      { path: "Task/Todo/TaskPage/TaskDetailsPage/:taskId", element: <TaskDetailsPage /> },
      { path: "Task/TaskProgress", element: <TaskProgress /> },
      { path: "Task/TaskProgress/TaskAssign/tl-employee", element: <TaskAssign assignType="TL-to-employee" /> },
      { path: "Task/TaskProgress/TaskAssign/hr-tl", element: <TaskAssign assignType="hr-to-TL" /> },
      { path: "Task/TaskProgress/ProgressDetail/:taskId", element: <ProgressDetail role="tl" dashboardRoute="/User/Task/TaskProgress" commentLabel="TeamLead" fileUploadLabel="TeamLead" /> },
      { path: "Task/TaskProgress/ProgressDetail/:taskId", element: <ProgressDetail role="hr" dashboardRoute="/User/Task/TaskProgress" commentLabel="HR" fileUploadLabel="HR" /> },

      // Leave routes
      { path: "Leave", element: <Leave /> },
      { path: "Leave/Leaverequest", element: <Leaverequest /> },
      { path: "Leave/LeaveHistory", element: <LeaveHistory /> },
      { path: "Leave/Holidaylist", element: <Holidaylist /> },
      { path: "Leave/Workfromhome", element: <Workfromhome /> },
      { path: "Leave/LeaveHistory/Remote_details", element: <Remote_details /> },

      // Leave management
      { path: "LeaveManage", element: <Leavemanagement /> },
      { path: "LeaveManage/leaveapproval", element: <Leaveapproval /> },
      { path: "LeaveManage/wfh", element: <Wfh /> },
      { path: "LeaveManage/leave_details", element: <LeaveDetails /> },
      { path: "LeaveManage/leave_details/wfh_details", element: <RemoteDetails /> },
      { path: "LeaveManage/attendance", element: <Attendance /> },

      // User management
      { path: "newUser", element: <AddUser /> },

      // Docs
      { path: "docs/my-documents", element: <OnboardingDocs /> },
      { path: "docs/file/fileuploader", element: <Fileuploader /> },
    ],
  },

  // Admin routes
  {
    path: "/admin",
    element: <AdminDashboardPage />,
    children: [
      { index: true, element: <DashboardHome /> },
      { path: "profile", element: <AdminProfile /> },
      { path: "notifications", element: <NotificationDashboard /> },
      { path: "chat", element: <Chat /> },
      { path: "time", element: <Timemanagement /> },
      { path: "employee", element: <Employeelist /> },
      { path: "employee/:id", element: <EmployeeDetails /> },
      { path: "LeaveManage", element: <Leavemanagement /> },
      { path: "LeaveManage/leaveapproval", element: <Leaveapproval /> },
      { path: "LeaveManage/leave_details", element: <LeaveDetails /> },
      { path: "LeaveManage/leave_details/wfh_details", element: <RemoteDetails /> },
      { path: "LeaveManage/wfh", element: <Wfh /> },
      { path: "LeaveManage/attendance", element: <Attendance /> },
      { path: "newUser", element: <AddUser /> },
      { path: "addLeave", element: <AddLeave /> },
      { path: "review-docs", element: <AdminDocsReview /> },
    ],
  },
]);

const MainApp = () => {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const isRunning = localStorage.getItem("isRunning") === "true";
      if (isRunning) {
        const confirmationMessage = "Are you sure you want to leave?";
        event.preventDefault();
        event.returnValue = confirmationMessage;
        return confirmationMessage;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <>
      <RouterProvider router={router}>
        <Outlet />
        <BrowserRouter>
        <Routes>
          <Route path="/admin/employee" element={<Employeelist/>}/>
          <Route path="/admin/employee/:id" element={<EmployeeDetails/>}/>
        </Routes>
        
        </BrowserRouter>
      </RouterProvider>
      
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="light"
        limit={3}
      />
    </>
  );
  //return <RouterProvider router={router} />;
};

createRoot(document.getElementById("root")).render(<MainApp />);