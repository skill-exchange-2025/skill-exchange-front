import AdminDashboard from "../pages/admin/AdminDashboard";
import { TUserPath } from "@/types";
import { Home, Users } from 'lucide-react';
import ProfilePage from "../pages/user/profile/ProfilePage.tsx";

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
    element: <ProfilePage />,
    icon: <Users size={16} />,
    permissions: ["read:user"],
  },
];