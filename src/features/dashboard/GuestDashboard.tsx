import React from 'react';
import { Link } from 'react-router-dom';
import { Book, ArrowRight, Star } from 'lucide-react';

const GuestDashboard: React.FC = () => {
    return (
        <div className="space-y-16 pb-20">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 text-center overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] -z-10"></div>

                <div className="max-w-4xl mx-auto px-4 space-y-8 animate-fade-in-up">
                    <span className="px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold uppercase tracking-wider border border-amber-500/20">
                        Diplom Ishi Loyihasi
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
                        O‘zbek adabiyotini <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent italic">raqamlashtirish</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Global auditoriya uchun interaktiv platforma. Adabiyotimiz xazinasini zamonaviy texnologiyalar bilan kashf eting.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link to="/register" className="btn-primary px-8 py-3 text-lg flex items-center gap-2">
                            Boshlash <ArrowRight size={20} />
                        </Link>
                        <Link to="/books" className="px-8 py-3 text-lg font-medium text-white glass hover:bg-white/20 transition-all rounded-lg">
                            Kutubxonani ko'rish
                        </Link>
                    </div>
                </div>
            </section>

            {/* Project Info Section */}
            <section className="max-w-6xl mx-auto px-4">
                <div className="glass-dark p-8 md:p-12 rounded-3xl border-amber-500/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Book size={120} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-white">Loyiha haqida</h2>
                            <div className="space-y-4 text-slate-400">
                                <div className="flex items-start gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2"></div>
                                    <p>Mazkur platforma o'zbek klassik va zamonaviy adabiyotini saqlash va ommalashtirish maqsadida yaratilgan.</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2"></div>
                                    <p>Foydalanuvchilar uchun qulay mutolaa, izlanish va interaktiv muloqot imkoniyatlari mavjud.</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-8 border border-white/5 space-y-4">
                            <div className="pb-4 border-b border-white/10">
                                <p className="text-xs text-amber-500 font-bold uppercase mb-1">Muallif</p>
                                <p className="text-lg font-semibold text-white">18. Nazirqulov Barkamol Bekzod o‘g‘li</p>
                                <p className="text-sm text-slate-400">211-22 KIo‘ guruhi talabasi</p>
                            </div>
                            <div>
                                <p className="text-xs text-amber-500 font-bold uppercase mb-1">Ilmiy Rahbar</p>
                                <p className="text-lg font-semibold text-white">Yaxshibayev D.S.</p>
                                <p className="text-sm text-slate-400">Kompyuter tizimlari kafedrasi v.b. professor</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Books Section (Mock) */}
            <section className="max-w-7xl mx-auto px-4 space-y-8">
                <div className="flex items-end justify-between">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-white">Saralangan asarlar</h2>
                        <p className="text-slate-400">Siz uchun tanlangan eng sara adabiyot durdonalari</p>
                    </div>
                    <Link to="/books" className="text-amber-500 hover:text-amber-400 font-medium flex items-center gap-1 group">
                        Barchasini ko'rish <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="group cursor-pointer">
                            <div className="aspect-[3/4] rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative mb-4">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="absolute bottom-4 left-4 right-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                                    <button className="w-full btn-primary py-2 text-sm">O'qish</button>
                                </div>
                            </div>
                            <h3 className="font-semibold text-white group-hover:text-amber-500 transition-colors">Yulduzli tunlar #{i}</h3>
                            <p className="text-sm text-slate-500">Pirimqul Qodirov</p>
                            <div className="flex items-center gap-1 mt-2">
                                <Star size={12} className="text-amber-500 fill-amber-500" />
                                <span className="text-xs text-slate-400">4.9</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default GuestDashboard;
