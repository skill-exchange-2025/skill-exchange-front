// admin.routes.tsx
import AdminDashboard from "../pages/admin/AdminDashboard";
import {TUserPath} from "@/types";
import {GraduationCap, Home, MessageSquare, School, Users, Code} from 'lucide-react';
import ProfilePage from "@/pages/user/profile/ProfilePage.tsx";
import {UsersView} from "@/pages/user/table/UsersView";
import {FeedbackManagement} from "@/pages/admin/feedback/FeedbackManagement.tsx";
import AdminStatistics from "@/pages/admin/AdminStatistics.tsx";
import RoomsList from "@/pages/CodingRooms/RoomsList";
import CreateRoomPage from "@/pages/CodingRooms/CreateRoomPage";

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
      {
        name: "Feedback Management",
        path: "feedbacks",
        element: <FeedbackManagement />,
        icon: <MessageSquare size={16} />,
        permissions: ["view:metrics"]
      },
      {
        name: "View Statistics",
        path: "stats",
        element: <AdminStatistics />,
        icon: <School size={16} />,
        permissions: ["view:metrics"],
      },
    ],
  },
  {
    name: "Coding Rooms",
    icon: <Code size={16} />,
    permissions: ["view:metrics"],
    children: [
      {
        name: "All Rooms",
        path: "coding-rooms",
        element: <RoomsList />,
        icon: <Code size={16} />,
        permissions: ["view:metrics"],
      },
      {
        name: "Create Room",
        path: "coding-rooms/create",
        element: <CreateRoomPage />,
        icon: <Code size={16} />,
        permissions: ["view:metrics"],
      },
    ],
  },
];

// This is a dynamic route that will be handled separately in AdminRoutes.tsx
// It's not included directly in adminPaths because it has a dynamic parameter
// coding-rooms/:roomId -> CodingRoomPage
