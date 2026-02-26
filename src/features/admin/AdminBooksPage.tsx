import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Plus, X } from "lucide-react";
import api from "../../services/api";

const AdminBooksPage: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [authors, setAuthors] = useState<AuthorResponse[]>([]);
  const [books, setBooks] = useState<BookResponse[]>([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [booksPage, setBooksPage] = useState(0);
  const [booksSize, setBooksSize] = useState(10);
  const [booksTotalPages, setBooksTotalPages] = useState(1);
  const [newBook, setNewBook] = useState<BookCreateForm>({
    title: "",
    description: "",
    authorId: "",
    categoryIds: [],
    manualCategoryIds: "",
    isbn: "",
    publishedYear: "",
    publisher: "",
    language: "",
    pageCount: "",
    isFeatured: false,
  });

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get<CategoryListResponse>(
        "/api/categories/read",
        {
          params: { page: 0, size: 200 },
        },
      );
      setCategories(Array.isArray(data.content) ? data.content : []);
    } catch {
      toast.error("Categorylar ro'yxatini yuklashda xatolik yuz berdi.");
    }
  }, []);

  const fetchAuthors = useCallback(async () => {
    try {
      const { data } = await api.get<AuthorListResponse>("/api/authors/get-all");
      if (Array.isArray(data)) {
        setAuthors(data as AuthorResponse[]);
      } else if (Array.isArray(data.content)) {
        setAuthors(data.content);
      } else {
        setAuthors([]);
      }
    } catch {
      toast.error("Mualliflar ro'yxatini yuklashda xatolik yuz berdi.");
    }
  }, []);

  const normalizeBooks = (data: unknown) => {
    if (Array.isArray(data)) {
      return {
        items: data as BookResponse[],
        totalPages: 1,
        page: 0,
        size: data.length,
      };
    }

    const pageData = data as PagedResponse<BookResponse>;
    if (Array.isArray(pageData?.content)) {
      return {
        items: pageData.content,
        totalPages: pageData.totalPages ?? 1,
        page: pageData.number ?? 0,
        size: pageData.size ?? pageData.content.length,
      };
    }

    return { items: [], totalPages: 1, page: 0, size: 10 };
  };

  const fetchBooks = useCallback(async () => {
    setBooksLoading(true);
    try {
      const { data } = await api.get("/api/books/get-all", {
        params: { page: booksPage, size: booksSize },
      });
      const normalized = normalizeBooks(data);
      setBooks(normalized.items);
      setBooksTotalPages(normalized.totalPages);
    } catch {
      toast.error("Kitoblar ro'yxatini yuklashda xatolik yuz berdi.");
    } finally {
      setBooksLoading(false);
    }
  }, [booksPage, booksSize]);

  useEffect(() => {
    void fetchCategories();
    void fetchAuthors();
  }, [fetchCategories, fetchAuthors]);

  useEffect(() => {
    void fetchBooks();
  }, [fetchBooks]);

  const resolveSubCategoryId = (child: CategoryChild) =>
    child.id ??
    child.subCategoryId ??
    child.subcategoryId ??
    child.categoryId ??
    null;

  const subCategoryGroups = useMemo(() => {
    return categories.map((category) => ({
      parentName: category.name,
      children: (category.children ?? []).map((child) => ({
        id: resolveSubCategoryId(child),
        name: child.name,
      })),
    }));
  }, [categories]);

  const flattenedSubCategories = useMemo(() => {
    return subCategoryGroups.flatMap((group) =>
      group.children.filter((child) => child.id != null),
    );
  }, [subCategoryGroups]);

  const hasSelectableSubCategories = flattenedSubCategories.length > 0;

  const resetForm = () => {
    setNewBook({
      title: "",
      description: "",
      authorId: "",
      categoryIds: [],
      manualCategoryIds: "",
      isbn: "",
      publishedYear: "",
      publisher: "",
      language: "",
      pageCount: "",
      isFeatured: false,
    });
  };

  const openCreateModal = () => {
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    resetForm();
  };

  const toggleCategoryId = (id: number) => {
    setNewBook((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((item) => item !== id)
        : [...prev.categoryIds, id],
    }));
  };

  const parseManualCategoryIds = (value: string) =>
    value
      .split(/[, ]+/)
      .map((item) => Number(item.trim()))
      .filter((num) => !Number.isNaN(num) && num > 0);

  const createBook = async () => {
    if (!newBook.title.trim()) {
      toast.error("Kitob nomi majburiy.");
      return;
    }
    if (!newBook.authorId.trim()) {
      toast.error("Muallif ID majburiy.");
      return;
    }

    const manualIds = parseManualCategoryIds(newBook.manualCategoryIds);
    const mergedCategoryIds = Array.from(
      new Set([...newBook.categoryIds, ...manualIds]),
    );

    const payload: BookCreateRequest = {
      title: newBook.title.trim(),
      description: newBook.description.trim() || undefined,
      authorId: Number(newBook.authorId),
      categoryIds: mergedCategoryIds.length ? mergedCategoryIds : undefined,
      isbn: newBook.isbn.trim() || undefined,
      publishedYear: newBook.publishedYear
        ? Number(newBook.publishedYear)
        : undefined,
      publisher: newBook.publisher.trim() || undefined,
      language: newBook.language.trim() || undefined,
      pageCount: newBook.pageCount ? Number(newBook.pageCount) : undefined,
      isFeatured: newBook.isFeatured,
    };

    if (Number.isNaN(payload.authorId)) {
      toast.error("Muallif ID noto'g'ri formatda.");
      return;
    }

    setIsCreating(true);
    try {
      await api.post("/api/books/create", payload);
      toast.success("Kitob muvaffaqiyatli qo'shildi.");
      await fetchBooks();
      closeCreateModal();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Kitob qo'shishda xatolik yuz berdi.";
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  const formatCell = (value?: string | number | null) => {
    if (value === null || value === undefined || value === "") {
      return "--";
    }
    return value;
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-[#2B2B2B]">Kitoblar</h1>
          <p className="text-sm text-[#6B6B6B]">
            Kitoblarni qo'shish va boshqarish.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#6B4F3A] px-4 py-2 text-sm font-semibold text-[#F5F1E8] transition hover:bg-[#5A4030] sm:w-auto"
        >
          <Plus size={18} />
          Kitob qo'shish
        </button>
      </div>

      <div className="rounded-2xl bg-[#EFE7DB]/50 p-4">
        <div className="overflow-x-auto rounded-2xl border border-[#E3DBCF]">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#F5F1E8] text-left text-xs uppercase tracking-wide text-[#6B6B6B]">
                <th className="border-b border-r border-[#E3DBCF] px-4 py-4">
                  ID
                </th>
                <th className="border-b border-r border-[#E3DBCF] px-4 py-4">
                  Kitob nomi
                </th>
                <th className="border-b border-r border-[#E3DBCF] px-4 py-4">
                  Muallif
                </th>
                <th className="border-b border-r border-[#E3DBCF] px-4 py-4">
                  Category
                </th>
                <th className="border-b border-r border-[#E3DBCF] px-4 py-4">
                  Subcategory
                </th>
                <th className="border-b border-r border-[#E3DBCF] px-4 py-4">
                  Til
                </th>
                <th className="border-b border-r border-[#E3DBCF] px-4 py-4">
                  Nashr yili
                </th>
                <th className="border-b border-[#E3DBCF] px-4 py-4">
                  Tavsiya
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3DBCF]">
              {booksLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-[#6B6B6B]"
                  >
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-[#6B6B6B]"
                  >
                    Kitoblar topilmadi.
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr
                    key={book.id}
                    className="bg-[#F5F1E8]/40 transition hover:bg-[#EFE7DB]/60"
                  >
                    <td className="border-r border-[#E3DBCF] px-4 py-4 text-[#2B2B2B]">
                      {formatCell(book.id)}
                    </td>
                    <td className="border-r border-[#E3DBCF] px-4 py-4 text-[#2B2B2B]">
                      {formatCell(book.title)}
                    </td>
                    <td className="border-r border-[#E3DBCF] px-4 py-4 text-[#2B2B2B]">
                      {formatCell(book.author?.name)}
                    </td>
                    <td className="border-r border-[#E3DBCF] px-4 py-4 text-[#2B2B2B]">
                      {formatCell(book.category?.name)}
                    </td>
                    <td className="border-r border-[#E3DBCF] px-4 py-4 text-[#2B2B2B]">
                      {formatCell(book.subCategoryName)}
                    </td>
                    <td className="border-r border-[#E3DBCF] px-4 py-4 text-[#2B2B2B]">
                      {formatCell(book.language)}
                    </td>
                    <td className="border-r border-[#E3DBCF] px-4 py-4 text-[#2B2B2B]">
                      {formatCell(book.publishedYear)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          book.isFeatured
                            ? "bg-[#6B4F3A]/15 text-[#6B4F3A]"
                            : "bg-[#E3DBCF]/70 text-[#6B6B6B]",
                        ].join(" ")}
                      >
                        {book.isFeatured ? "Tavsiya" : "Oddiy"}
                      </span>
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
              value={booksSize}
              onChange={(event) => {
                setBooksPage(0);
                setBooksSize(Number(event.target.value));
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
              disabled={booksPage <= 0}
              onClick={() => setBooksPage((prev) => Math.max(0, prev - 1))}
              className="rounded-md border border-[#E3DBCF] px-3 py-1 text-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Oldingi
            </button>
            <span>
              Sahifa {booksPage + 1} / {booksTotalPages}
            </span>
            <button
              disabled={booksPage + 1 >= booksTotalPages}
              onClick={() => setBooksPage((prev) => prev + 1)}
              className="rounded-md border border-[#E3DBCF] px-3 py-1 text-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Keyingi
            </button>
          </div>
        </div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-6">
          <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#E3DBCF] bg-white shadow-xl">
            <div className="flex flex-col gap-3 border-b border-[#E3DBCF] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="text-lg font-semibold text-[#2B2B2B]">
                  Kitob qo'shish
                </h2>
                <p className="text-sm text-[#6B6B6B]">
                  Kitob nomi va muallif ID majburiy.
                </p>
              </div>
              <button
                onClick={closeCreateModal}
                className="self-start rounded-lg border border-[#E3DBCF] px-3 py-1 text-sm text-[#6B6B6B] transition hover:bg-white sm:self-auto"
                aria-label="Modalni yopish"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[75vh] flex-1 overflow-y-auto px-4 py-4 sm:max-h-[70vh] sm:px-6">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2 lg:col-span-2">
                  <label className="text-xs font-medium text-[#6B6B6B]">
                    Kitob nomi
                  </label>
                  <input
                    value={newBook.title}
                    onChange={(event) =>
                    setNewBook((prev) => ({ ...prev, title: event.target.value }))
                  }
                  className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
                  placeholder="Masalan: O'tkan kunlar"
                />
              </div>

                <div className="space-y-2 lg:col-span-2">
                  <label className="text-xs font-medium text-[#6B6B6B]">
                    Kitob tavsifi
                  </label>
                  <textarea
                    value={newBook.description}
                    onChange={(event) =>
                    setNewBook((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="min-h-[90px] w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
                  placeholder="Kitob haqida qisqacha..."
                />
              </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#6B6B6B]">
                    Muallif
                  </label>
                  <select
                    value={newBook.authorId}
                    onChange={(event) =>
                    setNewBook((prev) => ({
                      ...prev,
                      authorId: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
                >
                  <option value="">Tanlang</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[#6B6B6B]">
                  Agar muallif ro'yxati bo'sh bo'lsa, avval muallif qo'shing.
                </p>
              </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#6B6B6B]">
                    ISBN
                  </label>
                  <input
                    value={newBook.isbn}
                    onChange={(event) =>
                    setNewBook((prev) => ({ ...prev, isbn: event.target.value }))
                  }
                  className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
                  placeholder="ISBN"
                />
              </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#6B6B6B]">
                    Nashr yili
                  </label>
                  <input
                    value={newBook.publishedYear}
                    onChange={(event) =>
                    setNewBook((prev) => ({
                      ...prev,
                      publishedYear: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
                  placeholder="2020"
                />
              </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#6B6B6B]">
                    Nashriyot
                  </label>
                  <input
                    value={newBook.publisher}
                    onChange={(event) =>
                    setNewBook((prev) => ({
                      ...prev,
                      publisher: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
                  placeholder="Nashriyot nomi"
                />
              </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#6B6B6B]">
                    Til
                  </label>
                  <input
                    value={newBook.language}
                    onChange={(event) =>
                    setNewBook((prev) => ({
                      ...prev,
                      language: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
                  placeholder="O'zbek"
                />
              </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#6B6B6B]">
                    Sahifalar soni
                  </label>
                  <input
                    value={newBook.pageCount}
                    onChange={(event) =>
                    setNewBook((prev) => ({
                      ...prev,
                      pageCount: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
                  placeholder="320"
                />
              </div>

                <div className="flex items-center gap-2 lg:col-span-2">
                  <input
                    id="isFeatured"
                    type="checkbox"
                    checked={newBook.isFeatured}
                    onChange={(event) =>
                    setNewBook((prev) => ({
                      ...prev,
                      isFeatured: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-[#E3DBCF]"
                />
                <label htmlFor="isFeatured" className="text-sm text-[#6B6B6B]">
                  Tavsiya etilgan (featured)
                </label>
              </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-sm font-semibold text-[#2B2B2B]">
                    Subcategorylar
                  </h3>
                  {!hasSelectableSubCategories && (
                    <span className="text-xs text-[#6B6B6B]">
                      Subcategory ID'lar backenddan berilsa, tanlash osonlashadi.
                    </span>
                  )}
                </div>

                <div className="max-h-60 space-y-4 overflow-auto rounded-xl border border-[#E3DBCF] bg-[#F5F1E8] p-3 sm:max-h-72 sm:p-4">
                  {subCategoryGroups.length === 0 ? (
                    <p className="text-sm text-[#6B6B6B]">
                      Categorylar topilmadi.
                    </p>
                  ) : (
                    subCategoryGroups.map((group) => (
                      <div key={group.parentName} className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#6B6B6B]">
                          {group.parentName}
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {group.children.length === 0 ? (
                            <p className="text-xs text-[#9A9A9A]">
                              Subcategory yo'q.
                            </p>
                          ) : (
                            group.children.map((child, idx) => (
                              <label
                                key={`${group.parentName}-${child.name}-${idx}`}
                                className="flex items-center gap-2 text-sm text-[#2B2B2B]"
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    child.id != null &&
                                    newBook.categoryIds.includes(child.id)
                                  }
                                  onChange={() =>
                                    child.id != null &&
                                    toggleCategoryId(child.id)
                                  }
                                  disabled={child.id == null}
                                  className="h-4 w-4 rounded border-[#E3DBCF]"
                                />
                                <span className="font-medium">{child.name}</span>
                                {child.id == null && (
                                  <span className="text-xs text-[#9A9A9A]">
                                    (ID yo'q)
                                  </span>
                                )}
                              </label>
                            ))
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#6B6B6B]">
                    Subcategory ID'lar (ixtiyoriy)
                  </label>
                  <input
                    value={newBook.manualCategoryIds}
                    onChange={(event) =>
                      setNewBook((prev) => ({
                        ...prev,
                        manualCategoryIds: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B]"
                    placeholder="Masalan: 12, 14, 18"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-stretch justify-end gap-3 border-t border-[#E3DBCF] px-4 py-4 sm:flex-row sm:items-center sm:px-6">
              <button
                onClick={closeCreateModal}
                className="rounded-lg border border-[#E3DBCF] px-4 py-2 text-sm text-[#6B6B6B] transition hover:bg-white"
                disabled={isCreating}
              >
                Bekor qilish
              </button>
              <button
                onClick={createBook}
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

export default AdminBooksPage;

interface BookCreateForm {
  title: string;
  description: string;
  authorId: string;
  categoryIds: number[];
  manualCategoryIds: string;
  isbn: string;
  publishedYear: string;
  publisher: string;
  language: string;
  pageCount: string;
  isFeatured: boolean;
}

interface BookCreateRequest {
  title: string;
  description?: string;
  authorId: number;
  categoryIds?: number[];
  isbn?: string;
  publishedYear?: number;
  publisher?: string;
  language?: string;
  pageCount?: number;
  isFeatured: boolean;
}

interface CategoryChild {
  id?: number | null;
  subCategoryId?: number | null;
  subcategoryId?: number | null;
  categoryId?: number | null;
  name: string;
  description?: string | null;
}

interface CategoryItem {
  id: number;
  name: string;
  children?: CategoryChild[];
}

interface CategoryListResponse {
  content?: CategoryItem[];
}

interface AuthorResponse {
  id: number;
  name: string;
}

interface AuthorListResponse {
  content?: AuthorResponse[];
}

interface BookCategoryResponse {
  id?: number;
  name?: string;
}

interface BookResponse {
  id?: number;
  title?: string;
  author?: AuthorResponse | null;
  category?: BookCategoryResponse | null;
  subCategoryName?: string | null;
  language?: string | null;
  publishedYear?: number | null;
  isFeatured?: boolean | null;
}

interface PagedResponse<T> {
  content?: T[];
  totalPages?: number;
  number?: number;
  size?: number;
}


