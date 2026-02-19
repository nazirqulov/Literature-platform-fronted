import React, { useState, useRef, useEffect } from 'react';
import { Camera, Loader2, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import api from "../../services/api.ts";

const ProfileImageUploader: React.FC = () => {
    const { profileImageUrl, updateProfileImage } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const API_URL = 'http://localhost:8080';

const getAvatar = async () => {
    try {
        const { data } = await api.get<{ url: string }>(API_URL+profileImageUrl);
        return data;
    } catch (error) {
        console.error('Failed to fetch profile image URL:', error);
        return ;
    }
};

    console.log("avatar", getAvatar());



   console.log(profileImageUrl);
    // Cleanup Preview URL on unmount or after upload
    useEffect(() => {
       setPreviewUrl(profileImageUrl);
        // if (previewUrl) URL.revokeObjectURL(previewUrl);
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Client-side validation
        const allowedTypes = ['image/jpeg', 'image/png','image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Faqat JPEG, PNG va WEBP formatlariga ruxsat berilgan');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Rasm hajmi 2MB dan oshmasligi kerak');
            return;
        }

        // Optimistic Preview
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        // Upload
        setIsUploading(true);
        try {
            await updateProfileImage(file);
            toast.success('Profil rasmi muvaffaqiyatli yangilandi');
            setPreviewUrl(objectUrl); // Clear preview to show the new production URL from context

        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Yuklashda xatolik yuz berdi');
            setPreviewUrl(null); // Fallback on error
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div
                className="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden border-4 border-amber-500/20 glass transition-all hover:border-amber-500/50 shadow-2xl"
                onClick={handleClick}
            >
                <img
                    src={previewUrl || profileImageUrl || '/default-avatar.png'}
                    alt="Profile"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff&size=128';
                    }}
                />

                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploading ? (
                        <Loader2 className="animate-spin text-white" size={32} />
                    ) : (
                        <div className="flex flex-col items-center">
                            <Upload className="text-white" size={24} />
                            <span className="text-[10px] text-white font-bold uppercase mt-1">Yangilash</span>
                        </div>
                    )}
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
            />

            <div className="text-center">
                <button
                    onClick={handleClick}
                    disabled={isUploading}
                    className="text-amber-500 hover:text-amber-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
                >
                    <Camera size={16} />
                    Rasm tanlash
                </button>
            </div>
        </div>
    );
};

export default ProfileImageUploader;
