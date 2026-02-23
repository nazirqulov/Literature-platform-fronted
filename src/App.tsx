import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './shared/components/Navbar';
import AuthLayout from './features/auth/AuthLayout';
import RegisterPage from './features/auth/RegisterPage';
import VerifyEmailPage from './features/auth/VerifyEmailPage';
import LoginPage from './features/auth/LoginPage';
import GuestDashboard from './features/dashboard/GuestDashboard';
import UserDashboard from './features/dashboard/UserDashboard';
import ProfilePage from './features/profile/ProfilePage';
import AdminLayout from './features/admin/AdminLayout';
import AdminDashboardPage from './features/admin/AdminDashboardPage';
import AdminBooksPage from './features/admin/AdminBooksPage';
import AdminUsersPage from './features/admin/AdminUsersPage';
import AdminAuthorsPage from './features/admin/AdminAuthorsPage';
import ProtectedRoute from './shared/components/ProtectedRoute';
import AdminRoute from './shared/components/AdminRoute';
import { useAuth } from './context/useAuth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <GuestDashboard />}
          />

          <Route element={<AuthLayout />}>
            <Route
              path="/register"
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
            />
            <Route
              path="/verify-email"
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <VerifyEmailPage />}
            />
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
            />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/books" element={<AdminBooksPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/authors" element={<AdminAuthorsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
};

export default App;

