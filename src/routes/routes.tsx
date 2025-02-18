// src/routes/routes.tsx
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../pages/Login";
import MainLayout from "@/components/layout/MainLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Redirector from "@/components/Redirector";
import AdminRoutes from "./AdminRoutes"; // Add new component imports
import UserRoutes from "./UserRoutes";   // Add new component imports

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "/",
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Redirector />,
          },
        ],
      },
      {
        path: "admin",
        element: (
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
        ),
        children: [
          {
            path: "*",
            element: <AdminRoutes />, // Use dynamic admin routes
          },
        ],
      },
      {
        path: "user",
        element: (
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
        ),
        children: [
          {
            path: "*",
            element: <UserRoutes />, // Use dynamic user routes
          },
        ],
      },
    ],
  },
]);

export default router;