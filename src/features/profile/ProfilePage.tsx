import React, { useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import ProfileInfo from './ProfileInfo';
import ProfileForm from './ProfileForm';
import ProfileImageUploader from './ProfileImageUploader';
import BookList from './BookList';
import { Loader2, Settings, List } from 'lucide-react';

const ProfilePage: React.FC = () => {
    const { user, refreshUser, refreshProfileImageUrl, isLoading } = useAuth();

    useEffect(() => {
        void Promise.all([refreshUser(), refreshProfileImageUrl()]);
        // Context funksiyalari har renderda yangilangani uchun dependency qo'shilsa request loop yuz beradi.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <Loader2 className="animate-spin text-amber-500" size={48} />
            </div>
        );
    }

    const mockData = {
        read: [
            { title: "O'tkan kunlar", author: "Abdulla Qodiriy" },
            { title: "Yulduzli tunlar", author: "Pirimqul Qodirov" },
        ],
        reading: [
            { title: "Kecha va Kunduz", author: "Cho'lpon" },
        ],
        favorites: [
            { title: "Dunyoning ishlari", author: "O'tkir Hoshimov" },
        ],
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 animate-fade-in">
            {/* Header & Stats */}
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row gap-8 items-center bg-white/5 p-8 rounded-3xl border border-white/10 glass-dark">
                    <ProfileImageUploader />

                    <div className="flex-grow text-center md:text-left space-y-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white uppercase tracking-tight">
                                {user.fullName || user.username}
                            </h1>
                            <p className="text-slate-400 font-mono text-sm">{user.email}</p>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${user.isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                {user.isActive ? 'Faol' : 'Nofaol'}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                {user.role}
                            </span>
                        </div>
                    </div>
                </div>

                <ProfileInfo user={user} />
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
                {/* Settings / Edit Form */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                        <Settings className="text-amber-500" size={24} />
                        <h2 className="text-2xl font-bold text-white">Profil sozlamalari</h2>
                    </div>
                    <div className="glass-dark p-8 rounded-3xl border border-white/5">
                        <ProfileForm initialData={{
                            fullName: user.fullName,
                            phone: user.phone,
                            username: user.username,
                            email: user.email
                        }} />
                    </div>
                </div>

                {/* Reading Lists */}
                <div className="space-y-10">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                        <List className="text-amber-500" size={24} />
                        <h2 className="text-2xl font-bold text-white">Mutolaa ro'yxati</h2>
                    </div>

                    <div className="space-y-8">
                        <BookList title="Hozir o'qilmoqda" books={mockData.reading} />
                        <BookList title="O'qib bo'lingan" books={mockData.read} />
                        <BookList title="Saralangan" books={mockData.favorites} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

