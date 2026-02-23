import React, { memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Users, UserPen } from "lucide-react";
import { useAuth } from "../context/useAuth";

type SidebarItemProps = {
  to: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
};

const SidebarItem: React.FC<SidebarItemProps> = ({
  to,
  label,
  icon,
  isActive,
}) => {
  return (
    <Link
      to={to}
      className={[
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-indigo-700 text-white shadow-sm"
          : "text-gray-300 hover:bg-gray-800/70 hover:text-white",
      ].join(" ")}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const role = user?.role;
  const isSuperAdmin = role === "SUPERADMIN" || role === "ROLE_SUPERADMIN";

  if (!user || !isSuperAdmin) {
    return null;
  }

  const items = [
    { to: "/admin/books", label: "Kitoblar", icon: <BookOpen size={18} /> },
    { to: "/admin/users", label: "Foydalanuvchilar", icon: <Users size={18} /> },
    { to: "/admin/authors", label: "Autorlar", icon: <UserPen size={18} /> },
  ];

  return (
    <aside className="sticky top-0 h-screen w-72 bg-gray-900 text-gray-200 shadow-lg">
      <nav className="flex h-full flex-col gap-4 px-4 py-6">
        <div className="space-y-1">
          {items.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <SidebarItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                isActive={isActive}
              />
            );
          })}
        </div>
      </nav>
    </aside>
  );
};

export default memo(Sidebar);
