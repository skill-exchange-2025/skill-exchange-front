// admin.routes.tsx
import AdminDashboard from "../pages/admin/AdminDashboard";
import { TUserPath } from "@/types";
import { Home, Users } from 'lucide-react';

export const userPaths: TUserPath[] = [
  {
    name: "Dashboard",
    path: "dashboard",
    element: <AdminDashboard />,
    icon: <Home size={16} />,
    permissions: ["view:metrics"],
  },
  {
    name: "Profile",
    path: "profile",
    element: <AdminDashboard />,
    icon: <Users size={16} />,
    permissions: ["read:user"],
  },
];