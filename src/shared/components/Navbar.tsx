import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { LogOut, User, Library } from 'lucide-react';

const Navbar: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <nav className="sticky top-0 z-50 glass border-b border-white/10 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-amber-500 rounded-lg group-hover:rotate-12 transition-transform">
                        <Library size={20} className="text-slate-900" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                        O'zbek Adabiyoti
                    </span>
                </Link>

                {!isAdminRoute && (
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/" className="text-slate-300 hover:text-amber-500 transition-colors">Bosh sahifa</Link>
                        <Link to="/books" className="text-slate-300 hover:text-amber-500 transition-colors">Kitoblar</Link>
                        <Link to="/authors" className="text-slate-300 hover:text-amber-500 transition-colors">Mualliflar</Link>
                        {isAuthenticated && (
                            <Link to="/profile" className="text-slate-300 hover:text-amber-500 transition-colors italic">Profil</Link>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                                <User size={16} className="text-amber-500" />
                                <span className="text-sm font-medium">{user?.username}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                title="Tizimdan chiqish"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="px-4 py-2 text-slate-300 hover:text-white transition-colors">
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

