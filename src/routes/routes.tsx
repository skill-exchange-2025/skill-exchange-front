// src/routes/routes.tsx
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../pages/Login";
import MainLayout from "@/components/layout/MainLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { routeGenerator } from "@/utils/routeGenerator";
import { adminPaths } from "./admin.routes";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { userPaths } from "./user.routes";
import Redirector from "@/components/Redirector"; // Add this import

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
            element: <Redirector />, // Replace the Navigate with Redirector
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
        children: routeGenerator(adminPaths),
      },
      {
        path: "user",
        element: (
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
        ),
        children: routeGenerator(userPaths),
      },
    ],
  },
]);

export default router;