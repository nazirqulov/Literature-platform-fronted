import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { LogOut, User, Library, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/useTheme';

const Navbar: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <nav className="sticky top-0 z-50 glass border-b border-[#E3DBCF] px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-[#6B4F3A] rounded-lg group-hover:rotate-12 transition-transform">
                        <Library size={20} className="text-[#F5F1E8]" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-[#8FA68E] to-[#6B4F3A] bg-clip-text text-transparent">
                        O'zbek Adabiyoti
                    </span>
                </Link>

                {!isAdminRoute && (
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/" className="text-[#6B6B6B] hover:text-[#6B4F3A] transition-colors">Bosh sahifa</Link>
                        <Link to="/books" className="text-[#6B6B6B] hover:text-[#6B4F3A] transition-colors">Kitoblar</Link>
                        <Link to="/authors" className="text-[#6B6B6B] hover:text-[#6B4F3A] transition-colors">Mualliflar</Link>
                        {isAuthenticated && (
                            <Link to="/profile" className="text-[#6B6B6B] hover:text-[#6B4F3A] transition-colors italic">Profil</Link>
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



