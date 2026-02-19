import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Bookmark, Clock, Award, ChevronRight } from 'lucide-react';

const UserDashboard: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-white uppercase tracking-tight">
                        Xush kelibsiz, <span className="text-amber-500">{user?.username}</span>!
                    </h1>
                    <div className="flex items-center gap-4">
                        <p className="text-slate-400 italic">Sizning mutolaa olamingiz</p>
                        <span className="text-slate-700">|</span>
                        <Link to="/profile" className="text-amber-500/80 hover:text-amber-500 text-sm font-medium transition-colors border-b border-amber-500/30">
                            Profilni boshqarish
                        </Link>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                            <Award className="text-amber-500" size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Daraja</p>
                            <p className="text-white font-medium">Kitobxon</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-dark p-6 rounded-3xl border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="p-3 bg-blue-500/10 rounded-2xl">
                            <BookOpen className="text-blue-500" size={24} />
                        </div>
                        <span className="text-xs text-slate-500 font-medium">Jami</span>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-white">12</p>
                        <p className="text-sm text-slate-400">O'qilgan kitoblar</p>
                    </div>
                </div>

                <div className="glass-dark p-6 rounded-3xl border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="p-3 bg-amber-500/10 rounded-2xl">
                            <Bookmark className="text-amber-500" size={24} />
                        </div>
                        <span className="text-xs text-slate-500 font-medium">Saqlangan</span>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-white">45</p>
                        <p className="text-sm text-slate-400">Xatcho'plar</p>
                    </div>
                </div>

                <div className="glass-dark p-6 rounded-3xl border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="p-3 bg-green-500/10 rounded-2xl">
                            <Clock className="text-green-500" size={24} />
                        </div>
                        <span className="text-xs text-slate-500 font-medium">Haftalik</span>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-white">8.5s</p>
                        <p className="text-sm text-slate-400">Mutolaa vaqti</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">So'nggi o'qilganlar</h2>
                        <button className="text-amber-500 text-sm hover:underline">Barchasi</button>
                    </div>

                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="glass p-4 rounded-2xl flex items-center gap-6 group hover:border-amber-500/30 transition-all cursor-pointer">
                                <div className="w-16 h-24 rounded-lg bg-white/5 border border-white/10 flex-shrink-0"></div>
                                <div className="flex-grow space-y-1">
                                    <h3 className="font-semibold text-white text-lg">O'tkan kunlar</h3>
                                    <p className="text-slate-400 text-sm">Abdulla Qodiriy</p>
                                    <div className="w-full bg-white/5 h-1.5 mt-4 rounded-full overflow-hidden">
                                        <div className="bg-amber-500 h-full w-2/3"></div>
                                    </div>
                                </div>
                                <div className="p-2 text-slate-500 group-hover:text-amber-500 transition-colors">
                                    <ChevronRight size={24} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-white">Tavsiyalar</h2>
                    <div className="glass-dark p-6 rounded-3xl space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4 items-center group cursor-pointer">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex-shrink-0 group-hover:bg-amber-500/10 transition-colors"></div>
                                <div>
                                    <h4 className="text-sm font-semibold text-white group-hover:text-amber-500 transition-colors">Kecha va Kunduz</h4>
                                    <p className="text-xs text-slate-500">Cho'lpon</p>
                                </div>
                            </div>
                        ))}
                        <button className="w-full btn-primary py-2.5 text-sm mt-4">Hammasini ko'rish</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
