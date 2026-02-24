import React from "react";
import { BookOpen, Users, UserPen } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboardPage: React.FC = () => {
  const sections = [
    {
      title: "Kitoblar",
      description: "Kitoblar bo'limini boshqarish va tartibga solish.",
      to: "/admin/books",
      icon: <BookOpen size={22} className="text-[#8FA68E]" />,
    },
    {
      title: "Foydalanuvchilar",
      description: "Platforma foydalanuvchilarini nazorat qilish.",
      to: "/admin/users",
      icon: <Users size={22} className="text-[#8FA68E]" />,
    },
    {
      title: "Autorlar",
      description: "Mualliflar profillari va ma'lumotlarini boshqarish.",
      to: "/admin/authors",
      icon: <UserPen size={22} className="text-[#8FA68E]" />,
    },
  ];

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-[#2B2B2B]">Admin panel</h1>
        <p className="text-sm text-[#6B6B6B]">
          Uzbek adabiyot platformasining asosiy bo'limlari.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.title}
            to={section.to}
            className="group rounded-2xl border border-[#E3DBCF] bg-white p-6 transition hover:border-[#6B4F3A]/40 hover:bg-white"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6B4F3A]/15">
                {section.icon}
              </span>
              <h2 className="text-lg font-semibold text-[#2B2B2B]">
                {section.title}
              </h2>
            </div>
            <p className="mt-3 text-sm text-[#6B6B6B]">
              {section.description}
            </p>
            <span className="mt-6 inline-flex text-sm font-medium text-[#8FA68E] transition group-hover:text-[#7C947B]">
              Bo'limga o'tish
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default AdminDashboardPage;


