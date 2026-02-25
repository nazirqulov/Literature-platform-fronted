import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Pencil, Trash2 } from "lucide-react";
import type { AxiosError } from "axios";
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

interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
}

interface CreateUserFormState {
  username: string;
  email: string;
  password: string;
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

const getErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError;
  const data = axiosError.response?.data as
    | { message?: string; errors?: Record<string, string> }
    | string
    | undefined;

  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data.message === "string") return data.message;
  if (data.errors && typeof data.errors === "object") {
    return Object.values(data.errors).join(" ");
  }
  return fallback;
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
  const [newUser, setNewUser] = useState<CreateUserFormState>({
    username: "",
    email: "",
    fullName: "",
    phone: "",
    role: "",
    isActive: true,
    password: "",
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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

  const resetNewUser = () => {
    setNewUser({
      username: "",
      email: "",
      fullName: "",
      phone: "",
      role: "",
      isActive: true,
      password: "",
    });
  };

  const openCreateModal = () => {
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    resetNewUser();
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

  const createUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      toast.error("Username, email va parol majburiy.");
      return;
    }

    try {
      const payload: CreateUserPayload = {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        ...(newUser.fullName ? { fullName: newUser.fullName } : {}),
        ...(newUser.phone ? { phone: newUser.phone } : {}),
        ...(newUser.role ? { role: newUser.role } : {}),
        isActive: newUser.isActive,
      };

      await api.post("/api/user/create", payload);
      toast.success("Foydalanuvchi yaratildi.");
      resetNewUser();
      setIsCreateOpen(false);
      await fetchUsers();
    } catch (error) {
      toast.error(getErrorMessage(error, "Foydalanuvchi yaratishda xatolik yuz berdi."));
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
          <h1 className="text-2xl font-semibold text-[#2B2B2B]">Foydalanuvchilar</h1>
          <p className="text-sm text-[#6B6B6B]">
            Foydalanuvchilar ro'yxati va boshqaruvi.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="rounded-lg bg-[#6B4F3A] px-4 py-2 text-sm font-semibold text-[#F5F1E8] transition hover:bg-[#5A4030]"
        >
          Foydalanuvchi qo'shish
        </button>
      </div>
      <div className="rounded-2xl border border-[#E3DBCF] bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#6B6B6B]">Rol</label>
            <select
              value={filters.role}
              onChange={(event) => {
                const value = event.target.value;
                setFilters((prev) => ({ ...prev, role: value }));
                setAppliedFilters((prev) => ({ ...prev, role: value }));
                setPage(0);
              }}
              className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
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
            <label className="text-xs font-medium text-[#6B6B6B]">
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
              className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#6B6B6B]">
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
              className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
            />
          </div>

          <div className="flex items-end gap-3">
            <button
              onClick={resetFilters}
              className="rounded-lg border border-[#E3DBCF] px-4 py-2 text-sm text-[#6B6B6B] transition hover:bg-white"
            >
              Tozalash
            </button>
          </div>
        </div>
      </div>
      {editingUser && (
        <div className="rounded-2xl border border-[#6B4F3A]/30 bg-[#6B4F3A]/10 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#2B2B2B]">
              Foydalanuvchini tahrirlash
            </h2>
            <button
              onClick={cancelEdit}
              className="text-sm text-[#6B6B6B] hover:text-[#2B2B2B]"
            >
              Bekor qilish
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#6B6B6B]">Username</label>
              <input
                value={editingUser.username}
                onChange={(event) =>
                  setEditingUser((prev) =>
                    prev ? { ...prev, username: event.target.value } : prev,
                  )
                }
                className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#6B6B6B]">Email</label>
              <input
                value={editingUser.email}
                onChange={(event) =>
                  setEditingUser((prev) =>
                    prev ? { ...prev, email: event.target.value } : prev,
                  )
                }
                className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#6B6B6B]">Ism</label>
              <input
                value={editingUser.fullName}
                onChange={(event) =>
                  setEditingUser((prev) =>
                    prev ? { ...prev, fullName: event.target.value } : prev,
                  )
                }
                className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#6B6B6B]">Telefon</label>
              <input
                value={editingUser.phone}
                onChange={(event) =>
                  setEditingUser((prev) =>
                    prev ? { ...prev, phone: event.target.value } : prev,
                  )
                }
                className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#6B6B6B]">Rol</label>
              <select
                value={editingUser.role}
                onChange={(event) =>
                  setEditingUser((prev) =>
                    prev ? { ...prev, role: event.target.value } : prev,
                  )
                }
                className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#6B6B6B]">Holati</label>
              <select
                value={editingUser.isActive ? "true" : "false"}
                onChange={(event) =>
                  setEditingUser((prev) =>
                    prev
                      ? { ...prev, isActive: event.target.value === "true" }
                      : prev,
                  )
                }
                className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
              >
                <option value="true">Faol</option>
                <option value="false">Nofaol</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={saveEdit}
              className="rounded-lg bg-[#6B4F3A] px-4 py-2 text-sm font-semibold text-[#F5F1E8] transition hover:bg-[#5A4030]"
            >
              Saqlash
            </button>
            <button
              onClick={cancelEdit}
              className="rounded-lg border border-[#E3DBCF] px-4 py-2 text-sm text-[#6B6B6B] transition hover:bg-white"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-[#EFE7DB]/50 p-4">
        <div className="overflow-x-auto rounded-2xl border border-[#E3DBCF]">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#F5F1E8] text-left text-xs uppercase tracking-wide text-[#6B6B6B]">
                <th className="border-b border-r border-[#E3DBCF] px-4 py-4">ID</th>
                <th className="border-b border-r border-[#E3DBCF] px-4 py-4">Username</th>
                <th className="border-b border-r border-[#E3DBCF] px-4 py-4">Email</th>
                <th className="border-b border-r border-[#E3DBCF] px-4 py-4">To'liq ism</th>
                <th className="border-b border-r border-[#E3DBCF] px-4 py-4">Telefon</th>
                <th className="border-b border-r border-[#E3DBCF] px-4 py-4">Rol</th>
                <th className="border-b border-r border-[#E3DBCF] px-4 py-4">Holat</th>
                <th className="border-b border-[#E3DBCF] px-4 py-4">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3DBCF]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-[#6B6B6B]">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-[#6B6B6B]">
                    Foydalanuvchi topilmadi.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="bg-[#F5F1E8]/40 hover:bg-[#EFE7DB]/60 transition">
                    <td className="border-r border-[#E3DBCF] px-4 py-4 text-[#2B2B2B]">
                      {user.id ?? "--"}
                    </td>
                    <td className="border-r border-[#E3DBCF] px-4 py-4 text-[#2B2B2B]">
                      {user.username || "--"}
                    </td>
                    <td className="border-r border-[#E3DBCF] px-4 py-4 text-[#2B2B2B]">
                      {user.email || "--"}
                    </td>
                    <td className="border-r border-[#E3DBCF] px-4 py-4 text-[#2B2B2B]">
                      {user.fullName || "--"}
                    </td>
                    <td className="border-r border-[#E3DBCF] px-4 py-4 text-[#2B2B2B]">
                      {user.phone || "--"}
                    </td>
                    <td className="border-r border-[#E3DBCF] px-4 py-4 text-[#2B2B2B]">
                      {user.role || "--"}
                    </td>
                    <td className="border-r border-[#E3DBCF] px-4 py-4">
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
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(user)}
                          className="inline-flex items-center gap-1 rounded-md border border-[#E3DBCF] px-2 py-1 text-xs text-[#2B2B2B] transition hover:bg-white"
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

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#6B6B6B]">
          <div className="flex items-center gap-2">
            <span>Ko'rsatish:</span>
            <select
              value={size}
              onChange={(event) => {
                setPage(0);
                setSize(Number(event.target.value));
              }}
              className="rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-2 py-1 text-sm text-[#2B2B2B]"
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
              className="rounded-md border border-[#E3DBCF] px-3 py-1 text-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Oldingi
            </button>
            <span>
              Sahifa {page + 1} / {totalPages}
            </span>
            <button
              disabled={!hasNext}
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded-md border border-[#E3DBCF] px-3 py-1 text-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Keyingi
            </button>
          </div>
        </div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-[#E3DBCF] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#2B2B2B]">
                  Yangi foydalanuvchi qo'shish
                </h2>
                <p className="text-sm text-[#6B6B6B]">
                  Username, email va parol majburiy. Qolganlari ixtiyoriy.
                </p>
              </div>
              <button
                onClick={closeCreateModal}
                className="rounded-lg border border-[#E3DBCF] px-3 py-1 text-sm text-[#6B6B6B] transition hover:bg-white"
              >
                Yopish
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#6B6B6B]">Username</label>
                <input
                  value={newUser.username}
                  onChange={(event) =>
                    setNewUser((prev) => ({ ...prev, username: event.target.value }))
                  }
                  className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
                  placeholder="foydalanuvchi123"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#6B6B6B]">To'liq ism</label>
                <input
                  value={newUser.fullName}
                  onChange={(event) =>
                    setNewUser((prev) => ({ ...prev, fullName: event.target.value }))
                  }
                  className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
                  placeholder="Ism Familiya"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#6B6B6B]">Email</label>
                <input
                  value={newUser.email}
                  onChange={(event) =>
                    setNewUser((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#6B6B6B]">Telefon</label>
                <input
                  value={newUser.phone}
                  onChange={(event) =>
                    setNewUser((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
                  placeholder="+998 xx xxx xx xx"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#6B6B6B]">Rol</label>
                <select
                  value={newUser.role}
                  onChange={(event) =>
                    setNewUser((prev) => ({ ...prev, role: event.target.value }))
                  }
                  className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
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
                <label className="text-xs font-medium text-[#6B6B6B]">Holat</label>
                <select
                  value={newUser.isActive ? "true" : "false"}
                  onChange={(event) =>
                    setNewUser((prev) => ({
                      ...prev,
                      isActive: event.target.value === "true",
                    }))
                  }
                  className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
                >
                  <option value="true">Faol</option>
                  <option value="false">Nofaol</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#6B6B6B]">Parol</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(event) =>
                    setNewUser((prev) => ({ ...prev, password: event.target.value }))
                  }
                  className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
                  placeholder="parol"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={closeCreateModal}
                className="rounded-lg border border-[#E3DBCF] px-4 py-2 text-sm text-[#6B6B6B] transition hover:bg-white"
              >
                Bekor qilish
              </button>
              <button
                onClick={createUser}
                className="rounded-lg bg-[#6B4F3A] px-4 py-2 text-sm font-semibold text-[#F5F1E8] transition hover:bg-[#5A4030]"
              >
                Yaratish
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminUsersPage;


