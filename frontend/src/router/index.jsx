import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import HomeRedirect from "../components/layout/HomeRedirect";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ChangePasswordPage from "../pages/auth/ChangePasswordPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminSheepPage from "../pages/admin/AdminSheepPage";
import AdminOrganizationsPage from "../pages/admin/AdminOrganizationsPage";
import AdminProfilesPage from "../pages/admin/AdminProfilesPage";

import OrganizationDashboard from "../pages/organization/OrganizationDashboard";
import OrganizationProfilesPage from "../pages/organization/OrganizationProfilesPage";
import OrganizationContactPage from "../pages/organization/OrganizationContactPage";

import FidelDashboard from "../pages/fidel/FidelDashboard";
import FidelProfilePage from "../pages/fidel/FidelProfilePage";
import ContactPage from "../pages/fidel/ContactPage";

import PendingApprovalPage from "../pages/PendingApprovalPage";
import NotFoundPage from "../pages/NotFoundPage";

export const router = createBrowserRouter([
  // Routes publiques
  {
    path: "/",
    element: <HomeRedirect />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },

  // Routes accessibles uniquement si connecté
  {
    path: "/pending-approval",
    element: (
      <ProtectedRoute>
        <PendingApprovalPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/change-password",
    element: (
      <ProtectedRoute>
        <ChangePasswordPage />
      </ProtectedRoute>
    ),
  },

  // Routes privées avec layout
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "admin",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/profiles",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <AdminProfilesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/sheep",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <AdminSheepPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/organizations",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <AdminOrganizationsPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "organization",
        element: (
          <ProtectedRoute roles={["organization"]}>
            <OrganizationDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "organization/fidels",
        element: (
          <ProtectedRoute roles={["organization"]}>
            <OrganizationProfilesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "organization/contact",
        element: (
          <ProtectedRoute roles={["organization"]}>
            <OrganizationContactPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "fidel",
        element: (
          <ProtectedRoute roles={["fidel"]}>
            <FidelDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "fidel/contact",
        element: (
          <ProtectedRoute roles={["fidel"]}>
            <ContactPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "fidel/profile",
        element: (
          <ProtectedRoute roles={["fidel"]}>
            <FidelProfilePage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  {
    path: "*",
    element: <NotFoundPage />,
  },
]);