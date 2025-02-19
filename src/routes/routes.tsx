import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { LandingPage } from "@/pages/landing";
import { About } from "@/pages/about";
import { Contact } from "@/pages/contact";
import { Help } from "@/pages/help";
import { Privacy } from "@/pages/privacy";
import { Terms } from "@/pages/terms";
import { SignIn } from "@/pages/auth/sign-in";
import { SignUp } from "@/pages/auth/sign-up";
import { Dashboard } from "@/pages/dashboard";
import { ForgotPassword } from "@/pages/auth/forgot-password";
import { Layout } from "@/components/layout/layout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { AuthProvider } from "../context/auth";

const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <App />
      </AuthProvider>
    ),

    children: [
      {
        path: "/",
        element: <Layout />,
        children: [
          // Public Routes
          {
            index: true,
            element: <LandingPage />,
          },
          {
            path: "about",
            element: <About />,
          },
          {
            path: "contact",
            element: <Contact />,
          },
          {
            path: "help",
            element: <Help />,
          },
          {
            path: "privacy",
            element: <Privacy />,
          },
          {
            path: "terms",
            element: <Terms />,
          },
          {
            path: "forgot-password",
            element: <ForgotPassword />,
          },
          // Auth Routes
          {
            path: "signin",
            element: <SignIn />,
          },
          {
            path: "signup",
            element: <SignUp />,
          },
          // Protected Routes
          {
            path: "dashboard",
            element: (
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },
]);

export default routes;
