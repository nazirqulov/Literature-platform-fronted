import React from 'react';
import { Link } from 'react-router-dom';
import { Book, ArrowRight, Star } from 'lucide-react';

const GuestDashboard: React.FC = () => {
    return (
        <div className="space-y-16 pb-20">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 text-center overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#6B4F3A]/5 rounded-full blur-[120px] -z-10"></div>

                <div className="max-w-4xl mx-auto px-4 space-y-8 animate-fade-in-up">
                    <span className="px-4 py-1.5 rounded-full bg-[#6B4F3A]/10 text-[#6B4F3A] text-xs font-semibold uppercase tracking-wider border border-[#6B4F3A]/20">
                        Diplom Ishi Loyihasi
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#2B2B2B] leading-tight">
                        O‘zbek adabiyotini <span className="bg-gradient-to-r from-[#8FA68E] to-[#6B4F3A] bg-clip-text text-transparent italic">raqamlashtirish</span>
                    </h1>
                    <p className="text-xl text-[#6B6B6B] max-w-2xl mx-auto leading-relaxed">
                        Global auditoriya uchun interaktiv platforma. Adabiyotimiz xazinasini zamonaviy texnologiyalar bilan kashf eting.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link to="/register" className="btn-primary px-8 py-3 text-lg flex items-center gap-2">
                            Boshlash <ArrowRight size={20} />
                        </Link>
                        <Link to="/books" className="px-8 py-3 text-lg font-medium text-[#2B2B2B] glass hover:bg-white transition-all rounded-lg">
                            Kutubxonani ko'rish
                        </Link>
                    </div>
                </div>
            </section>

            {/* Project Info Section */}
            <section className="max-w-6xl mx-auto px-4">
                <div className="glass-dark p-8 md:p-12 rounded-3xl border-[#6B4F3A]/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Book size={120} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-[#2B2B2B]">Loyiha haqida</h2>
                            <div className="space-y-4 text-[#6B6B6B]">
                                <div className="flex items-start gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6B4F3A] mt-2"></div>
                                    <p>Mazkur platforma o'zbek klassik va zamonaviy adabiyotini saqlash va ommalashtirish maqsadida yaratilgan.</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6B4F3A] mt-2"></div>
                                    <p>Foydalanuvchilar uchun qulay mutolaa, izlanish va interaktiv muloqot imkoniyatlari mavjud.</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-8 border border-[#E3DBCF] space-y-4">
                            <div className="pb-4 border-b border-[#E3DBCF]">
                                <p className="text-xs text-[#6B4F3A] font-bold uppercase mb-1">Muallif</p>
                                <p className="text-lg font-semibold text-[#2B2B2B]">18. Nazirqulov Barkamol Bekzod o‘g‘li</p>
                                <p className="text-sm text-[#6B6B6B]">211-22 KIo‘ guruhi talabasi</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#6B4F3A] font-bold uppercase mb-1">Ilmiy Rahbar</p>
                                <p className="text-lg font-semibold text-[#2B2B2B]">Yaxshibayev D.S.</p>
                                <p className="text-sm text-[#6B6B6B]">Kompyuter tizimlari kafedrasi v.b. professor</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Books Section (Mock) */}
            <section className="max-w-7xl mx-auto px-4 space-y-8">
                <div className="flex items-end justify-between">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-[#2B2B2B]">Saralangan asarlar</h2>
                        <p className="text-[#6B6B6B]">Siz uchun tanlangan eng sara adabiyot durdonalari</p>
                    </div>
                    <Link to="/books" className="text-[#6B4F3A] hover:text-[#5A4030] font-medium flex items-center gap-1 group">
                        Barchasini ko'rish <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="group cursor-pointer">
                            <div className="aspect-[3/4] rounded-2xl bg-white border border-[#E3DBCF] overflow-hidden relative mb-4">
                                <div className="absolute inset-0 bg-gradient-to-t from-[#2B2B2B]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="absolute bottom-4 left-4 right-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                                    <button className="w-full btn-primary py-2 text-sm">O'qish</button>
                                </div>
                            </div>
                            <h3 className="font-semibold text-[#2B2B2B] group-hover:text-[#6B4F3A] transition-colors">Yulduzli tunlar #{i}</h3>
                            <p className="text-sm text-[#9A9A9A]">Pirimqul Qodirov</p>
                            <div className="flex items-center gap-1 mt-2">
                                <Star size={12} className="text-[#6B4F3A] fill-[#6B4F3A]" />
                                <span className="text-xs text-[#6B6B6B]">4.9</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default GuestDashboard;


