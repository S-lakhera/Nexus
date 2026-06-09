import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import { useSelector } from "react-redux";

// Import your UI Components
import LoginPage from "../features/auth/ui/LoginPage.jsx";
import SignupPage from "../features/auth/ui/SignupPage.jsx";

// A temporary placeholder for our next phase
const DashboardPlaceholder = () => (
  <div className="flex min-h-screen items-center justify-center font-space text-2xl text-accent">
    Nexus Dashboard Active
  </div>
);

// --- AUTH GUARD COMPONENTS ---

// 1. ProtectedRoute: Kicks unauthenticated users back to Login
const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// 2. PublicRoute: Kicks logged-in users straight to the Dashboard
const PublicRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

// --- ROUTER CONFIGURATION ---

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <SignupPage />
      </PublicRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPlaceholder />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: (
      <div className="flex min-h-screen items-center justify-center font-jetbrains text-red-400">
        404 - Network Node Not Found
      </div>
    ),
  },
]);

// This is what actually gets rendered in your App.jsx
export default function AppRoutes() {
  return <RouterProvider router={router} />;
}