import "./lib/dayjs"; // must run before antd pickers render — extends dayjs plugins
import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { Toaster } from "sonner";
import App from "./App";
import { injectThemeVars } from "./theme";
import "./index.css";

const GOOGLE_CLIENT_ID = String(import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "").trim();

// Theme injection is cosmetic; never let a malformed CSS variable prevent the
// SPA from mounting on a deep-link refresh.
try {
  injectThemeVars();
} catch (error) {
  console.error("[ACP Courier Speed] Theme initialization failed", error);
}

const queryClient = new QueryClient();

function Providers({ children }: { children: ReactNode }) {
  const content = (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <AuthProvider>
              {children}
              <Toaster position="top-center" richColors closeButton />
            </AuthProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  );
  return GOOGLE_CLIENT_ID ? <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{content}</GoogleOAuthProvider> : content;
}

const root = document.getElementById("root");
if (!root) throw new Error("ACP Courier Speed user-panel root element is missing");

window.addEventListener("error", (event) => {
  if (root.childElementCount === 0) {
    root.innerHTML = `<div style="font-family:system-ui;padding:40px;text-align:center;color:#092d59"><h1>ACP Courier Speed is loading</h1><p>Please refresh once. If this continues, contact support.</p></div>`;
  }
  console.error("[ACP Courier Speed] Unhandled client error", event.error || event.message);
});

createRoot(root).render(
  <StrictMode>
    <Providers><App /></Providers>
  </StrictMode>,
);
