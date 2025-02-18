// admin.routes.tsx
import AdminDashboard from "../pages/admin/AdminDashboard";
import { TUserPath } from "@/types";
import { Home, Users, GraduationCap, School } from 'lucide-react';

export const adminPaths: TUserPath[] = [
  {
    name: "Dashboard",
    path: "dashboard",
    element: <AdminDashboard />,
    icon: <Home size={16} />, // Add icons directly to route config
  },
  {
    name: "User Management",
    icon: <Users size={16} />,
    children: [
      {
        name: "Create Student",
        path: "create-student",
        element: <AdminDashboard />,
        icon: <GraduationCap size={16} />,
      },
      {
        name: "Create Faculty",
        path: "create-faculty",
        element: <AdminDashboard />,
        icon: <School size={16} />,
      },
    ],
  },
];