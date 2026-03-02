import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";

interface BookCategoryResponse {
  id?: number;
  name?: string;
}

interface AuthorResponse {
  id?: number;
  name?: string;
}

interface BookResponse {
  id?: number;
  title?: string;
  author?: AuthorResponse | null;
  categories?: BookCategoryResponse[] | null;
  subCategoryName?: string[] | null;
  language?: string | null;
  publishedYear?: number | null;
}

type PagedResponse<T> = {
  content?: T[];
};

const BooksPage: React.FC = () => {
  const [books, setBooks] = useState<BookResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedSubcategory = searchParams.get("sub");
  const [searchTerm, setSearchTerm] = useState("");
  const [bookCovers, setBookCovers] = useState<
    Record<number, string | null | undefined>
  >({});
  const coverObjectUrlsRef = useRef<Map<number, string>>(new Map());

  const normalizeBooks = (data: unknown) => {
    if (Array.isArray(data)) return data as BookResponse[];
    const pageData = data as PagedResponse<BookResponse>;
    return Array.isArray(pageData?.content) ? pageData.content : [];
  };

  const fetchBooks = useCallback(async (keyword?: string) => {
    setLoading(true);
    try {
      const trimmedKeyword = keyword?.trim();
      const endpoint = trimmedKeyword ? "/api/books/search" : "/api/books/get-all";
      const params = trimmedKeyword
        ? { keyword: trimmedKeyword, page: 0, size: 200 }
        : { page: 0, size: 200 };
      const { data } = await api.get(endpoint, { params });
      setBooks(normalizeBooks(data));
    } catch {
      toast.error("Kitoblar ro'yxatini yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCoverForBook = useCallback(async (bookId: number) => {
    if (Number.isNaN(bookId)) return;
    setBookCovers((prev) => {
      if (bookId in prev) return prev;
      return { ...prev, [bookId]: undefined };
    });

    try {
      const response = await api.get<Blob>(`/api/books/book-image/${bookId}`, {
        responseType: "blob",
      });
      if (!response.data || response.data.size === 0) {
        setBookCovers((prev) => ({ ...prev, [bookId]: null }));
        return;
      }

      const objectUrl = URL.createObjectURL(response.data);
      coverObjectUrlsRef.current.set(bookId, objectUrl);
      setBookCovers((prev) => ({ ...prev, [bookId]: objectUrl }));
    } catch {
      setBookCovers((prev) => ({ ...prev, [bookId]: null }));
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchBooks(searchTerm);
    }, 350);
    return () => clearTimeout(timer);
  }, [fetchBooks, searchTerm]);

  useEffect(() => {
    const ids = books.map((book) => book.id).filter((id): id is number => !!id);
    const idSet = new Set(ids);
    coverObjectUrlsRef.current.forEach((url, id) => {
      if (!idSet.has(id)) {
        URL.revokeObjectURL(url);
        coverObjectUrlsRef.current.delete(id);
        setBookCovers((prev) => {
          if (!(id in prev)) return prev;
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    });
    ids.forEach((id) => {
      if (!(id in bookCovers)) {
        void fetchCoverForBook(id);
      }
    });
  }, [books, bookCovers, fetchCoverForBook]);

  useEffect(() => {
    return () => {
      coverObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      coverObjectUrlsRef.current.clear();
    };
  }, []);

  const openReader = (bookId: number) => {
    if (Number.isNaN(bookId)) return;
    navigate(`/books/${bookId}/read`);
  };

  const filteredBooks = useMemo(() => {
    if (!selectedSubcategory) return books;
    return books.filter((book) =>
      (book.subCategoryName ?? []).includes(selectedSubcategory),
    );
  }, [books, selectedSubcategory]);

  return (
    <section className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="select-none text-3xl font-semibold text-[#2B2B2B]">
          Kitoblar
        </h1>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Kitob nomi yoki kalit so'z bo'yicha qidirish..."
            className="w-full rounded-lg border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-2 text-sm text-[#2B2B2B] placeholder:text-[#9A9A9A] focus:outline-none focus:ring-2 focus:ring-[#6B4F3A]/30 sm:w-72"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="rounded-lg border border-[#E3DBCF] px-4 py-2 text-sm font-semibold text-[#6B6B6B] transition hover:bg-[#F5F1E8]"
            >
              Tozalash
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-4">
          {loading ? (
            <div className="glass rounded-2xl p-6 text-sm text-[#6B6B6B]">
              Yuklanmoqda...
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="glass rounded-2xl p-6 text-sm text-[#6B6B6B]">
              Kitoblar topilmadi.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="group glass rounded-2xl border border-[#E3DBCF] p-4 transition hover:border-[#6B4F3A]/40"
                >
                  <div className="relative h-48 w-full overflow-hidden rounded-xl border border-[#E3DBCF] bg-white">
                    {book.id && bookCovers[book.id] ? (
                      <img
                        src={bookCovers[book.id] ?? ""}
                        alt={book.title ?? "Muqova"}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : book.id && bookCovers[book.id] === null ? (
                      <div className="flex h-full w-full items-center justify-center text-xs text-[#9A9A9A]">
                        Rasm yo'q
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-[#9A9A9A]">
                        Yuklanmoqda...
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <h3 className="text-lg font-semibold text-[#2B2B2B]">
                      {book.title ?? "--"}
                    </h3>
                    <p className="text-sm text-[#6B6B6B]">
                      {book.author?.name ?? "Muallif ko'rsatilmagan"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#9A9A9A]">
                      <BookOpen size={14} />
                      <span>
                        Til: {book.language ?? "--"} | Nashr yili:{" "}
                        {book.publishedYear ?? "--"}
                      </span>
                    </div>
                    {book.id && (
                      <div className="pt-2">
                        <button
                          onClick={() => openReader(book.id as number)}
                          className="inline-flex items-center gap-2 rounded-lg border border-[#E3DBCF] bg-white px-3 py-1.5 text-xs font-semibold text-[#6B4F3A] transition hover:bg-[#F5F1E8] disabled:opacity-70"
                        >
                          Kitobni ochish
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

    </section>
  );
};

export default BooksPage;

