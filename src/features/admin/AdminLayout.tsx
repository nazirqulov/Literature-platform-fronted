import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../shared/Sidebar";

const AdminLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#F5F1E8] text-[#2B2B2B]">
      <Sidebar />
      <main className="flex-1 px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;


