import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Pencil, Trash2 } from "lucide-react";
import api from "../../services/api";

interface UserResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  isActive: boolean;
}

type PagedResponse<T> = {
  content?: T[];
  totalPages?: number;
  totalElements?: number;
  number?: number;
  size?: number;
};

const normalizeUsers = (data: unknown) => {
  if (Array.isArray(data)) {
    return {
      items: data as UserResponse[],
      totalPages: 1,
      totalElements: data.length,
      page: 0,
      size: data.length,
    };
  }

  const pageData = data as PagedResponse<UserResponse>;
  if (Array.isArray(pageData?.content)) {
    return {
      items: pageData.content,
      totalPages: pageData.totalPages ?? 1,
      totalElements: pageData.totalElements ?? pageData.content.length,
      page: pageData.number ?? 0,
      size: pageData.size ?? pageData.content.length,
    };
  }

  return { items: [], totalPages: 1, totalElements: 0, page: 0, size: 10 };
};

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    role: "",
    fromDate: "",
    toDate: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);

  const fetchRoles = useCallback(async () => {
    try {
      const { data } = await api.get<string[]>("/api/user/get-all-role");
      setRoles(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Rollarni yuklashda xatolik yuz berdi.");
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        size,
      };
      if (appliedFilters.role) params.role = appliedFilters.role;
      if (appliedFilters.fromDate) params.fromDate = appliedFilters.fromDate;
      if (appliedFilters.toDate) params.toDate = appliedFilters.toDate;

      const { data } = await api.get("/api/user/get-all", { params });
      const normalized = normalizeUsers(data);
      setUsers(normalized.items);
      setTotalPages(normalized.totalPages);
    } catch {
      toast.error("Foydalanuvchilarni yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page, size]);

  useEffect(() => {
    void fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const resetFilters = () => {
    const reset = { role: "", fromDate: "", toDate: "" };
    setFilters(reset);
    setAppliedFilters(reset);
    setPage(0);
  };

  const hasPrev = page > 0;
  const hasNext = page + 1 < totalPages;

  const startEdit = (user: UserResponse) => {
    setEditingUser({ ...user });
  };

  const cancelEdit = () => {
    setEditingUser(null);
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    try {
      const payload = {
        id: editingUser.id,
        username: editingUser.username,
        email: editingUser.email,
        fullName: editingUser.fullName,
        phone: editingUser.phone,
        role: editingUser.role,
        isActive: editingUser.isActive,
      };

      await api.put(`/api/update/${editingUser.id}`, payload);
      toast.success("Foydalanuvchi ma'lumotlari yangilandi.");
      setEditingUser(null);
      await fetchUsers();
    } catch {
      toast.error("Yangilashda xatolik yuz berdi.");
    }
  };

  const deleteUser = async (user: UserResponse) => {
    const confirmed = window.confirm(
      `${user.username} foydalanuvchisini o'chirmoqchimisiz?`,
    );
    if (!confirmed) return;

    try {
      await api.delete(`/api/user/delete/${user.id}`);
      toast.success("Foydalanuvchi o'chirildi.");
      await fetchUsers();
    } catch {
      toast.error("O'chirishda xatolik yuz berdi.");
    }
  };

  const roleOptions = useMemo(() => {
    const uniqueRoles = Array.from(new Set(roles));
    return uniqueRoles.length ? uniqueRoles : ["ROLE_SUPERADMIN", "ROLE_USER"];
  }, [roles]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Foydalanuvchilar</h1>
          <p className="text-sm text-slate-400">
            Foydalanuvchilar ro'yxati va boshqaruvi.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Rol</label>
            <select
              value={filters.role}
              onChange={(event) => {
                const value = event.target.value;
                setFilters((prev) => ({ ...prev, role: value }));
                setAppliedFilters((prev) => ({ ...prev, role: value }));
                setPage(0);
              }}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
            >
              <option value="">Tanlang</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">
              Boshlanish sana (dd.MM.yyyy)
            </label>
            <input
              value={filters.fromDate}
              onChange={(event) => {
                const value = event.target.value;
                setFilters((prev) => ({ ...prev, fromDate: value }));
                setAppliedFilters((prev) => ({ ...prev, fromDate: value }));
                setPage(0);
              }}
              placeholder="01.01.2024"
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">
              Tugash sana (dd.MM.yyyy)
            </label>
            <input
              value={filters.toDate}
              onChange={(event) => {
                const value = event.target.value;
                setFilters((prev) => ({ ...prev, toDate: value }));
                setAppliedFilters((prev) => ({ ...prev, toDate: value }));
                setPage(0);
              }}
              placeholder="31.12.2024"
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </div>

          <div className="flex items-end gap-3">
            <button
              onClick={resetFilters}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
            >
              Tozalash
            </button>
          </div>
        </div>
      </div>

      {editingUser && (
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Foydalanuvchini tahrirlash
            </h2>
            <button
              onClick={cancelEdit}
              className="text-sm text-slate-300 hover:text-white"
            >
              Bekor qilish
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Username</label>
              <input
                value={editingUser.username}
                onChange={(event) =>
                  setEditingUser((prev) =>
                    prev ? { ...prev, username: event.target.value } : prev,
                  )
                }
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Email</label>
              <input
                value={editingUser.email}
                onChange={(event) =>
                  setEditingUser((prev) =>
                    prev ? { ...prev, email: event.target.value } : prev,
                  )
                }
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Ism</label>
              <input
                value={editingUser.fullName}
                onChange={(event) =>
                  setEditingUser((prev) =>
                    prev ? { ...prev, fullName: event.target.value } : prev,
                  )
                }
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Telefon</label>
              <input
                value={editingUser.phone}
                onChange={(event) =>
                  setEditingUser((prev) =>
                    prev ? { ...prev, phone: event.target.value } : prev,
                  )
                }
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Rol</label>
              <select
                value={editingUser.role}
                onChange={(event) =>
                  setEditingUser((prev) =>
                    prev ? { ...prev, role: event.target.value } : prev,
                  )
                }
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Holati</label>
              <select
                value={editingUser.isActive ? "true" : "false"}
                onChange={(event) =>
                  setEditingUser((prev) =>
                    prev
                      ? { ...prev, isActive: event.target.value === "true" }
                      : prev,
                  )
                }
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
              >
                <option value="true">Faol</option>
                <option value="false">Nofaol</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={saveEdit}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Saqlash
            </button>
            <button
              onClick={cancelEdit}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Username</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">To'liq ism</th>
                <th className="px-3 py-2">Telefon</th>
                <th className="px-3 py-2">Rol</th>
                <th className="px-3 py-2">Holat</th>
                <th className="px-3 py-2">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-400">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-400">
                    Foydalanuvchi topilmadi.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="bg-transparent">
                    <td className="px-3 py-2">
                      <div className="rounded-md border border-white/10 bg-slate-950/80 px-3 py-2 text-slate-200">
                        {user.id ?? "--"}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="rounded-md border border-white/10 bg-slate-950/80 px-3 py-2 text-slate-200">
                        {user.username || "--"}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="rounded-md border border-white/10 bg-slate-950/80 px-3 py-2 text-slate-200">
                        {user.email || "--"}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="rounded-md border border-white/10 bg-slate-950/80 px-3 py-2 text-slate-200">
                        {user.fullName || "--"}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="rounded-md border border-white/10 bg-slate-950/80 px-3 py-2 text-slate-200">
                        {user.phone || "--"}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="rounded-md border border-white/10 bg-slate-950/80 px-3 py-2 text-slate-200">
                        {user.role || "--"}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="rounded-md border border-white/10 bg-slate-950/80 px-3 py-2">
                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            user.isActive
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-rose-500/15 text-rose-300",
                          ].join(" ")}
                        >
                          {user.isActive ? "Faol" : "Nofaol"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2 rounded-md border border-white/10 bg-slate-950/80 px-3 py-2">
                        <button
                          onClick={() => startEdit(user)}
                          className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs text-slate-200 transition hover:bg-white/10"
                        >
                          <Pencil size={14} />
                          Tahrirlash
                        </button>
                        <button
                          onClick={() => deleteUser(user)}
                          className="inline-flex items-center gap-1 rounded-md border border-rose-500/40 px-2 py-1 text-xs text-rose-300 transition hover:bg-rose-500/10"
                        >
                          <Trash2 size={14} />
                          O'chirish
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <span>Ko'rsatish:</span>
            <select
              value={size}
              onChange={(event) => {
                setPage(0);
                setSize(Number(event.target.value));
              }}
              className="rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-sm text-white"
            >
              {[5, 10, 20, 50].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={!hasPrev}
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              className="rounded-md border border-white/10 px-3 py-1 text-sm transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Oldingi
            </button>
            <span>
              Sahifa {page + 1} / {totalPages}
            </span>
            <button
              disabled={!hasNext}
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded-md border border-white/10 px-3 py-1 text-sm transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Keyingi
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminUsersPage;
