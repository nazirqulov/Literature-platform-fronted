import React from "react";
import { BookOpen, Users, UserPen } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboardPage: React.FC = () => {
  const sections = [
    {
      title: "Kitoblar",
      description: "Kitoblar bo'limini boshqarish va tartibga solish.",
      to: "/admin/books",
      icon: <BookOpen size={22} className="text-indigo-300" />,
    },
    {
      title: "Foydalanuvchilar",
      description: "Platforma foydalanuvchilarini nazorat qilish.",
      to: "/admin/users",
      icon: <Users size={22} className="text-indigo-300" />,
    },
    {
      title: "Autorlar",
      description: "Mualliflar profillari va ma'lumotlarini boshqarish.",
      to: "/admin/authors",
      icon: <UserPen size={22} className="text-indigo-300" />,
    },
  ];

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-white">Admin panel</h1>
        <p className="text-sm text-slate-400">
          Uzbek adabiyot platformasining asosiy bo'limlari.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.title}
            to={section.to}
            className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-indigo-500/40 hover:bg-white/10"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/15">
                {section.icon}
              </span>
              <h2 className="text-lg font-semibold text-white">
                {section.title}
              </h2>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              {section.description}
            </p>
            <span className="mt-6 inline-flex text-sm font-medium text-indigo-300 transition group-hover:text-indigo-200">
              Bo'limga o'tish
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default AdminDashboardPage;
