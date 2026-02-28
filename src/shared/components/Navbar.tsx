import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { LogOut, User, Library, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/useTheme';
import api from '../../services/api';

interface CategoryChild {
    id?: number | null;
    name: string;
}

interface CategoryItem {
    id: number;
    name: string;
    children?: CategoryChild[];
}

interface CategoryListResponse {
    content?: CategoryItem[];
}

const Navbar: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');
    const [categories, setCategories] = useState<CategoryItem[]>([]);

    useEffect(() => {
        if (!isAuthenticated || isAdminRoute) return;
        let isCancelled = false;
        const loadCategories = async () => {
            try {
                const { data } = await api.get<CategoryListResponse>('/api/categories/read', {
                    params: { page: 0, size: 200 },
                });
                if (!isCancelled) {
                    setCategories(Array.isArray(data.content) ? data.content : []);
                }
            } catch {
                if (!isCancelled) {
                    setCategories([]);
                }
            }
        };
        void loadCategories();
        return () => {
            isCancelled = true;
        };
    }, [isAuthenticated, isAdminRoute]);

    const categoryGroups = useMemo(() => {
        return categories.map((category) => ({
            name: category.name,
            children: (category.children ?? []).map((child) => child.name).filter(Boolean),
        }));
    }, [categories]);

    return (
        <nav className="sticky top-0 z-50 glass border-b border-[#E3DBCF] px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to={isAdminRoute ? "/admin" : "/"} className="flex items-center gap-2 group">
                    <div className="p-2 bg-[#6B4F3A] rounded-lg group-hover:rotate-12 transition-transform">
                        <Library size={20} className="text-[#F5F1E8]" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-[#8FA68E] to-[#6B4F3A] bg-clip-text text-transparent">
                        O'zbek Adabiyoti
                    </span>
                </Link>

                {!isAdminRoute && (
                    <div className="hidden md:flex items-center gap-6">
                        {!isAuthenticated ? (
                            <>
                                <a href="/#home" className="text-[#6B6B6B] hover:text-[#6B4F3A] transition-colors">Bosh sahifa</a>
                                <a href="/#books" className="text-[#6B6B6B] hover:text-[#6B4F3A] transition-colors">Kitoblar</a>
                                <a href="/#authors" className="text-[#6B6B6B] hover:text-[#6B4F3A] transition-colors">Mualliflar</a>
                            </>
                        ) : (
                            <>
                                <Link to="/dashboard" className="text-[#6B6B6B] hover:text-[#6B4F3A] transition-colors">Bosh sahifa</Link>
                                <div className="relative group">
                                    <Link to="/books" className="text-[#6B6B6B] hover:text-[#6B4F3A] transition-colors">
                                        Kitoblar
                                    </Link>
                                    {categoryGroups.length > 0 && (
                                        <div className="absolute left-0 top-full z-50 hidden w-[340px] pt-3 group-hover:block">
                                            <div className="rounded-2xl border border-[#E3DBCF] bg-white p-4 shadow-xl">
                                                <div className="no-scrollbar max-h-80 space-y-4 overflow-auto pr-1">
                                                    {categoryGroups.map((group) => (
                                                        <div key={group.name} className="space-y-2">
                                                            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B6B6B]">
                                                                {group.name}
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {group.children.length === 0 ? (
                                                                    <span className="text-xs text-[#9A9A9A]">Subcategory yo'q</span>
                                                                ) : (
                                                                    group.children.map((child) => (
                                                                        <Link
                                                                            key={`${group.name}-${child}`}
                                                                            to={`/books?sub=${encodeURIComponent(child)}`}
                                                                            className="rounded-full border border-[#E3DBCF] bg-[#F5F1E8] px-3 py-1 text-xs text-[#2B2B2B] transition hover:border-[#6B4F3A]/40 hover:text-[#6B4F3A]"
                                                                        >
                                                                            {child}
                                                                        </Link>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Link to="/profile" className="text-[#6B6B6B] hover:text-[#6B4F3A] transition-colors italic">Profil</Link>
                            </>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <div className="flex items-center rounded-full border border-[#E3DBCF] bg-white p-1 text-xs">
                        <button
                            onClick={() => setTheme('light')}
                            className={[
                                'flex items-center gap-1 rounded-full px-3 py-1.5 font-semibold transition',
                                theme === 'light'
                                    ? 'bg-[#6B4F3A] text-[#F5F1E8]'
                                    : 'text-[#6B6B6B] hover:text-[#2B2B2B]',
                            ].join(' ')}
                            aria-pressed={theme === 'light'}
                        >
                            <Sun size={14} /> Yorug'
                        </button>
                        <button
                            onClick={() => setTheme('dark')}
                            className={[
                                'flex items-center gap-1 rounded-full px-3 py-1.5 font-semibold transition',
                                theme === 'dark'
                                    ? 'bg-[#6B4F3A] text-[#F5F1E8]'
                                    : 'text-[#6B6B6B] hover:text-[#2B2B2B]',
                            ].join(' ')}
                            aria-pressed={theme === 'dark'}
                        >
                            <Moon size={14} /> Qorong'u
                        </button>
                    </div>
                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E3DBCF]">
                                <User size={16} className="text-[#6B4F3A]" />
                                <span className="text-sm font-medium">{user?.username}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 text-[#6B6B6B] hover:text-red-500 transition-colors"
                                title="Tizimdan chiqish"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="px-4 py-2 text-[#6B6B6B] hover:text-[#2B2B2B] transition-colors">
                                Kirish
                            </Link>
                            <Link to="/register" className="btn-primary">
                                Ro'yxatdan o'tish
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;



