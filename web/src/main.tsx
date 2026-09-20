import "@fontsource-variable/exo-2";
import "@fontsource-variable/fraunces";
import "@fontsource/black-ops-one";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ToastProvider } from "./components/ui/Toast";
import { useAuthStore } from "./store/auth.store";
import { router } from "./router";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root was not found");
}

void useAuthStore.getState().bootstrap();

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </React.StrictMode>,
);
