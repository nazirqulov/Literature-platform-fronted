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
import { useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <GuestDashboard />} />

          <Route element={<AuthLayout />}>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* 404 - Redirect to home */}
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
