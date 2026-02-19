import React from 'react';
import type { User } from '../../types';
import { Calendar, ShieldCheck, Mail, Clock } from 'lucide-react';

interface ProfileInfoProps {
    user: User;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('uz-UZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 rounded-xl">
                    <Calendar className="text-amber-500" size={24} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">A'zo bo'ldi</p>
                    <p className="text-white font-medium">{formatDate(user.createdAt)}</p>
                </div>
            </div>

            <div className="glass p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                    <ShieldCheck className="text-blue-500" size={24} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Maqom</p>
                    <p className="text-white font-medium">{user.role}</p>
                </div>
            </div>

            <div className="glass p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                    <Mail className="text-green-500" size={24} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Email holati</p>
                    <p className="text-white font-medium">{user.emailVerified ? 'Tasdiqlangan' : 'Tasdiqlanmagan'}</p>
                </div>
            </div>

            <div className="glass p-4 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Clock className="text-purple-500" size={24} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Mutolaa vaqti</p>
                    <p className="text-white font-medium">8.5 soat</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo;
