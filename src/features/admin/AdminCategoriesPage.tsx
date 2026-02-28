import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Layers, Tag, Plus, X, AlertCircle } from "lucide-react";
import api from "../../services/api";

const CATEGORY_PAGE_SIZE = 200;

const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<CategoryCreateForm>({
    categoryName: "",
    categoryDescription: "",
    subCategories: [],
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<CategoryResponse>("/api/categories/read", {
        params: { page: 0, size: CATEGORY_PAGE_SIZE },
      });
      setCategories(Array.isArray(data.content) ? data.content : []);
      setTotalElements(data.totalElements ?? data.content?.length ?? 0);
    } catch {
      toast.error("Categorylar ro'yxatini yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const summary = useMemo(
    () => ({
      total: totalElements,
      parents: categories.length,
    }),
    [categories.length, totalElements],
  );

  const resetCreateForm = () => {
    setNewCategory({
      categoryName: "",
      categoryDescription: "",
      subCategories: [],
    });
    setCreateError(null);
  };

  const openCreateModal = () => {
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    resetCreateForm();
  };

  const addSubCategory = () => {
    setNewCategory((prev) => ({
      ...prev,
      subCategories: [
        ...prev.subCategories,
        { name: "", description: "" },
      ],
    }));
  };

  const updateSubCategory = (
    index: number,
    field: "name" | "description",
    value: string,
  ) => {
    setNewCategory((prev) => ({
      ...prev,
      subCategories: prev.subCategories.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const removeSubCategory = (index: number) => {
    setNewCategory((prev) => ({
      ...prev,
      subCategories: prev.subCategories.filter((_, idx) => idx !== index),
    }));
  };

  const createCategory = async () => {
    if (!newCategory.categoryName.trim()) {
      const message = "Kategory nomi majburiy.";
      setCreateError(message);
      toast.error(message);
      return;
    }

    const preparedSubCategories = newCategory.subCategories
      .map((sub) => ({
        name: sub.name.trim(),
        description: sub.description?.trim() || undefined,
      }))
      .filter((sub) => sub.name.length > 0);

    const payload: CategoryCreateRequestDto = {
      categoryName: newCategory.categoryName.trim(),
      categoryDescription: newCategory.categoryDescription.trim() || undefined,
      subCategories: preparedSubCategories,
    };

    setIsCreating(true);
    setCreateError(null);
    try {
      await api.post("/api/categories/create", payload);
      toast.success("Kategory muvaffaqiyatli qo'shildi.");
      closeCreateModal();
      await fetchCategories();
    } catch (error) {
      const rawMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "";
      const lowerMessage = rawMessage.toLowerCase();
      const message = lowerMessage.includes("already exists")
        ? "Bu nom allaqachon mavjud. Iltimos, boshqa nom tanlang."
        : rawMessage || "Category qo'shishda xatolik yuz berdi.";
      setCreateError(message);
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-[#2B2B2B]">
            Categoryni boshqarish
          </h1>
          <p className="text-sm text-[#6B6B6B]">
            Categorylar va ularning subcategory ro'yxati.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-[#6B4F3A] px-4 py-2 text-sm font-semibold text-[#F5F1E8] transition hover:bg-[#5A4030]"
        >
          <Plus size={18} />
          Category qo'shish
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#E3DBCF] bg-white p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6B4F3A]/15">
              <Layers size={20} className="text-[#6B4F3A]" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-[#6B6B6B]">
                Categorylar
              </p>
              <p className="text-lg font-semibold text-[#2B2B2B]">
                {summary.parents}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#E3DBCF] bg-white p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6B4F3A]/15">
              <Tag size={20} className="text-[#6B4F3A]" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-[#6B6B6B]">
                Jami elementlar
              </p>
              <p className="text-lg font-semibold text-[#2B2B2B]">
                {summary.total}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="rounded-2xl border border-[#E3DBCF] bg-white p-6 text-center text-sm text-[#6B6B6B]">
            Yuklanmoqda...
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-[#E3DBCF] bg-white p-6 text-center text-sm text-[#6B6B6B]">
            Category topilmadi.
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="rounded-2xl border border-[#E3DBCF] bg-white p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#2B2B2B]">
                    {category.name}
                  </h2>
                  <p className="text-xs text-[#6B6B6B]">
                    Subcategorylar: {category.children?.length ?? 0}
                  </p>
                </div>
                {category.hasChildren ? (
                  <span className="rounded-full border border-[#6B4F3A]/30 bg-[#6B4F3A]/10 px-3 py-1 text-xs font-semibold text-[#6B4F3A]">
                    Has children
                  </span>
                ) : (
                  <span className="rounded-full border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-1 text-xs font-semibold text-[#6B6B6B]">
                    No children
                  </span>
                )}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(category.children ?? []).length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#E3DBCF] p-4 text-sm text-[#6B6B6B]">
                    Subcategory mavjud emas.
                  </div>
                ) : (
                  category.children?.map((child, idx) => (
                    <div
                      key={`${category.id}-${child.name}-${idx}`}
                      className="rounded-xl border border-[#E3DBCF] bg-[#F5F1E8] px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-[#2B2B2B]">
                        {child.name}
                      </p>
                      <p className="text-xs text-[#6B6B6B]">
                        {child.description ?? "--"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-[#E3DBCF] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[#2B2B2B]">
                  Category qo'shish
                </h2>
                <p className="text-sm text-[#6B6B6B]">
                  Category nomi majburiy, subcategory ixtiyoriy.
                </p>
              </div>
              <button
                onClick={closeCreateModal}
                className="rounded-lg border border-[#E3DBCF] px-3 py-1 text-sm text-[#6B6B6B] transition hover:bg-white"
              >
                <X size={16} />
              </button>
            </div>

            {createError && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                <AlertCircle size={18} className="mt-0.5" />
                <div>{createError}</div>
              </div>
            )}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium text-[#6B6B6B]">
                  Category nomi
                </label>
                <input
                  value={newCategory.categoryName}
                  onChange={(event) =>
                    setNewCategory((prev) => ({
                      ...prev,
                      categoryName: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
                  placeholder="Masalan: Badiiy adabiyot"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium text-[#6B6B6B]">
                  Category tavsifi
                </label>
                <textarea
                  value={newCategory.categoryDescription}
                  onChange={(event) =>
                    setNewCategory((prev) => ({
                      ...prev,
                      categoryDescription: event.target.value,
                    }))
                  }
                  className="min-h-[96px] w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
                  placeholder="Qisqa izoh..."
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#2B2B2B]">
                  Subcategorylar
                </h3>
                <button
                  onClick={addSubCategory}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#6B4F3A] hover:text-[#5A4030]"
                >
                  <Plus size={16} />
                  Subcategory qo'shish
                </button>
              </div>

              {newCategory.subCategories.length === 0 ? (
                <div className="mt-3 rounded-xl border border-dashed border-[#E3DBCF] p-4 text-sm text-[#6B6B6B]">
                  Subcategory qo'shish ixtiyoriy. Qo'shish uchun tugmani bosing.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {newCategory.subCategories.map((sub, idx) => (
                    <div
                      key={`sub-${idx}`}
                      className="grid gap-3 rounded-xl border border-[#E3DBCF] bg-[#F5F1E8] p-4 md:grid-cols-[1fr,1fr,auto]"
                    >
                      <input
                        value={sub.name}
                        onChange={(event) =>
                          updateSubCategory(idx, "name", event.target.value)
                        }
                        className="rounded-lg border border-[#E3DBCF] bg-white px-3 py-2 text-sm text-[#2B2B2B]"
                        placeholder="Subcategory nomi"
                      />
                      <input
                        value={sub.description ?? ""}
                        onChange={(event) =>
                          updateSubCategory(idx, "description", event.target.value)
                        }
                        className="rounded-lg border border-[#E3DBCF] bg-white px-3 py-2 text-sm text-[#2B2B2B]"
                        placeholder="Tavsif (ixtiyoriy)"
                      />
                      <button
                        onClick={() => removeSubCategory(idx)}
                        className="inline-flex items-center justify-center rounded-lg border border-[#E3DBCF] px-3 py-2 text-sm text-[#6B6B6B] transition hover:bg-white"
                        aria-label="Remove subcategory"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={closeCreateModal}
                className="rounded-lg border border-[#E3DBCF] px-4 py-2 text-sm text-[#6B6B6B] transition hover:bg-white"
                disabled={isCreating}
              >
                Bekor qilish
              </button>
              <button
                onClick={createCategory}
                disabled={isCreating}
                className="rounded-lg bg-[#6B4F3A] px-4 py-2 text-sm font-semibold text-[#F5F1E8] transition hover:bg-[#5A4030] disabled:opacity-70"
              >
                {isCreating ? "Yaratilmoqda..." : "Yaratish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminCategoriesPage;

interface CategoryChild {
  name: string;
  description?: string | null;
}

interface CategoryItem {
  id: number;
  name: string;
  children?: CategoryChild[];
  hasChildren?: boolean;
}

interface CategoryResponse {
  content?: CategoryItem[];
  totalElements?: number;
}

interface CategoryCreateForm {
  categoryName: string;
  categoryDescription: string;
  subCategories: CategoryChild[];
}

interface CategoryCreateRequestDto {
  categoryName: string;
  categoryDescription?: string;
  subCategories: CategoryChild[];
}
