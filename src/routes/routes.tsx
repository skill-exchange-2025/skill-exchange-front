// src/routes/routes.tsx
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { LandingPage } from "@/pages/landing/index";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";
import { Help } from "@/pages/help";
import { Privacy } from "@/pages/privacy";
import { Terms } from "@/pages/terms";
import { SignIn } from "@/pages/auth/sign-in";
import { SignUp } from "@/pages/auth/sign-up";
import { ForgotPassword } from "@/pages/auth/forgot-password";
import { Layout } from "@/components/layout/layout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Redirector from "@/components/Redirector";
import AdminRoutes from "./AdminRoutes";
import UserRoutes from "./UserRoutes";
import { DashboardLayout } from "@/components/layout/DashboardLayout"; // Added this import
import { Login } from "@/pages/auth/login"; // Added this import

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
                element: <Layout />,
                children: [
                    { index: true, element: <LandingPage /> },
                    { path: "about", element: <About /> },
                    { path: "contact", element: <Contact /> },
                    { path: "help", element: <Help /> },
                    { path: "privacy", element: <Privacy /> },
                    { path: "terms", element: <Terms /> },
                    { path: "forgot-password", element: <ForgotPassword /> },
                    { path: "signin", element: <SignIn /> },
                    { path: "signup", element: <SignUp /> },
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