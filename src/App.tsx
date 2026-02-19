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
import ProtectedRoute from './shared/components/ProtectedRoute';
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

