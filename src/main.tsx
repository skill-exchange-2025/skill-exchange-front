import {
  CheckBadgeIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MagnifyingGlassCircleIcon,
} from "@heroicons/react/24/outline";
import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import "./index.css";
import { store } from "./redux/store.ts";
import routes from "./routes/routes.tsx";
import { AuthProvider } from "./context/auth.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <RouterProvider router={routes} />
      </HelmetProvider>
    </Provider>
  </StrictMode>
);
