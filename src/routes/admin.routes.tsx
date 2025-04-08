// admin.routes.tsx
import AdminDashboard from "../pages/admin/AdminDashboard";
import { TUserPath } from "@/types";
import { Home, Users, GraduationCap, School } from 'lucide-react';
import ProfilePage from "@/pages/user/profile/ProfilePage.tsx";
import { UsersView } from "@/pages/user/table/UsersView";

// admin.routes.tsx
export const adminPaths: TUserPath[] = [
  {
    name: "Dashboard",
    path: "dashboard",
    element: <ProfilePage />,
    icon: <Home size={16} />,
    permissions: ["view:metrics"],
  },
  {
    name: "User Management",
    icon: <Users size={16} />,
    permissions: ["view:metrics"],
    children: [
      {
        name: "Create User",
        path: "create-student",
        element: <UsersView />,
        icon: <GraduationCap size={16} />,
        permissions: ["view:metrics"],
      },
      {
        name: "Create Faculty",
        path: "create-faculty",
        element: <AdminDashboard />,
        icon: <School size={16} />,
        permissions: ["create_faculty"],
      },
    ],
  },
];