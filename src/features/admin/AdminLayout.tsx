import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../shared/Sidebar";

const AdminLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />
      <main className="flex-1 px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
