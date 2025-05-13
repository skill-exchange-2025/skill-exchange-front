import AdminDashboard from "../pages/admin/AdminDashboard";
import {TUserPath} from "@/types";
import {Edit, Home, MessageSquare, Users} from 'lucide-react';
import ProfilePage from "../pages/user/profile/ProfilePage.tsx";
import {FeedbackList} from "@/pages/user/feedback/FeedbackList.tsx";
import {EditFeedback} from "@/pages/user/feedback/EditFeedback.tsx";

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

  {
    name: "Feedback",
    path: "feedback", // Add path here
    element: <FeedbackList />, // Add element here
    icon: <MessageSquare size={16} />,
    permissions: ["user"],
    children: []

  },
  {
    name: "Edit Feedback",
    path: "feedback/edit/:id",
    element: <EditFeedback />,
    icon: <Edit size={16} />,
    permissions: ["edit:feedback"]
  }
];