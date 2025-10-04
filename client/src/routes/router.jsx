import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Registration from "../pages/Registration";
import Profile from "../pages/Profile";
import MyPost from "../pages/MyPost";
import AddPost from "../pages/AddPost";
import UserSideBar from "../layouts/UserSideBar";
import TaskManager from "../pages/TaskManager";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import AdminSideBar from "../layouts/AdminSideBar";
import TeacherSideBar from "../layouts/TeacherSideBar";
import NotFound from "../pages/NotFound";
import Setting from "../pages/Setting";
import Users from "../pages/dashboard/Users";
import Dashboard from "../pages/dashboard/Dashboard";
import Post from "../pages/Post";

// Teacher Pages
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import Assignments from "../pages/teacher/Assignments";
import Polls from "../pages/teacher/Polls";
import Resources from "../pages/teacher/Resources";

// Protected Route Components
import ProtectedRoute, { TeacherOnlyRoute, AdminOnlyRoute, StudentOnlyRoute } from "../components/ProtectedRoute";

import PublicRoute from "../layouts/PublicRoute";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/registration",
    element: <Registration />,
  },
  {
    path: "/profile",
    element: (
      <StudentOnlyRoute>
        <UserSideBar>
          <Profile />
        </UserSideBar>
      </StudentOnlyRoute>
    ),
  },
  {
    path: "/my-post",
    element: (
      <StudentOnlyRoute>
        <UserSideBar>
          <MyPost />
        </UserSideBar>
      </StudentOnlyRoute>
    ),
  },
  {
    path: "/add-post",
    element: (
      <StudentOnlyRoute>
        <UserSideBar>
          <AddPost />
        </UserSideBar>
      </StudentOnlyRoute>
    ),
  },
  {
    path: "/task-management",
    element: (
      <StudentOnlyRoute>
        <UserSideBar>
          <DndProvider backend={HTML5Backend}>
            <TaskManager />
          </DndProvider>
        </UserSideBar>
      </StudentOnlyRoute>
    ),
  },

  {
    path: "/setting",
    element: (
      <StudentOnlyRoute>
        <UserSideBar>
          <Setting />
        </UserSideBar>
      </StudentOnlyRoute>
    ),
  },
  {
    path: "/posts/:postId",
    element: (
      <PublicRoute>
        <Post />
      </PublicRoute>
    ),
  },
  
  // Teacher Routes
  {
    path: "/teacher",
    element: (
      <TeacherOnlyRoute>
        <TeacherSideBar />
      </TeacherOnlyRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <TeacherDashboard />,
      },
      {
        path: "assignments",
        element: <Assignments />,
      },
      {
        path: "polls",
        element: <Polls />,
      },
      {
        path: "resources",
        element: <Resources />,
      },
      {
        path: "students",
        element: <div>Students Management - Coming Soon</div>,
      },
    ],
  },

  // Admin Routes
  {
    path: "/dashboard",
    element: (
      <AdminOnlyRoute>
        <AdminSideBar />
      </AdminOnlyRoute>
    ),
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
      {
        path: "users",
        element: <Users />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
