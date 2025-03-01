// src/routes/routes.tsx
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { LandingPage } from "@/pages/landing";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";
import { Help } from "@/pages/help";
import { Privacy } from "@/pages/privacy";
import { Terms } from "@/pages/terms";
import { SignUp } from "@/pages/auth/sign-up";
import { ForgotPassword } from "@/pages/auth/forgot-password";
import { Layout } from "@/components/layout/layout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
// import Redirector from "@/components/Redirector";
import AdminRoutes from "./AdminRoutes";
import UserRoutes from "./UserRoutes";
import DashboardLayout from "@/components/layout/DashboardLayout"; // Added this import
import LoginForm from "@/pages/Login"; // Added this import
import { VerifyEmail } from "@/pages/auth/verify-email";
import ChatApp from "@/pages/Chat";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { path: "verify-email", element: <VerifyEmail /> },
            
           
            {
                element: <Layout />,
                children: [
                    {
                        path: "login",
                        element: <LoginForm />,
                    },
                    { index: true, element: <LandingPage /> },
                    { path: "about", element: <About /> },
                    { path: "contact", element: <Contact /> },
                    { path: "help", element: <Help /> },
                    { path: "privacy", element: <Privacy /> },
                    { path: "terms", element: <Terms /> },
                    { path: "forgot-password", element: <ForgotPassword /> },
                    { path: "signup", element: <SignUp /> },
                    { path: "chat", element: <ChatApp /> },

                ],
            },
            {
                path: "admin",
                element: (
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                ),
                children: [{ path: "*", element: <AdminRoutes /> }],
            },
            {
                path: "user",
                element: (
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                ),
                children: [{ path: "*", element: <UserRoutes /> }],
            },
        ],
    },
]);

export default router;