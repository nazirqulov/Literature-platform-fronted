/* eslint-disable @typescript-eslint/no-explicit-any */
import { Camera, Loader2, Upload } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/useAuth";
import api from "../../services/api";

const ProfileImageUploader: React.FC = () => {
  const { profileImageUrl, updateProfileImage } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [serverImageUrl, setServerImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewObjectUrlRef = useRef<string | null>(null);
  const serverObjectUrlRef = useRef<string | null>(null);

  console.log("profileImageUrl", profileImageUrl);

  useEffect(() => {
    let isCancelled = false;

    const loadImageFromBackend = async () => {
      if (!profileImageUrl) {
        setServerImageUrl(null);
        return;
      }

      try {
        const { data } = await api.get<Blob>(profileImageUrl, {
          responseType: "blob",
        });
        if (isCancelled) return;

        if (serverObjectUrlRef.current) {
          URL.revokeObjectURL(serverObjectUrlRef.current);
        }

        const blobUrl = URL.createObjectURL(data);
        serverObjectUrlRef.current = blobUrl;
        setServerImageUrl(blobUrl);
      } catch {
        if (!isCancelled) {
          setServerImageUrl(profileImageUrl);
        }
      }
    };

    void loadImageFromBackend();

    return () => {
      isCancelled = true;
    };
  }, [profileImageUrl]);

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
      if (serverObjectUrlRef.current) {
        URL.revokeObjectURL(serverObjectUrlRef.current);
      }
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Faqat JPEG, PNG va WEBP formatlariga ruxsat berilgan");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Rasm hajmi 2MB dan oshmasligi kerak");
      return;
    }

    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);

    setIsUploading(true);
    try {
      await updateProfileImage(file);
      toast.success("Profil rasmi muvaffaqiyatli yangilandi");
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
        previewObjectUrlRef.current = null;
      }
      setPreviewUrl(null);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Yuklashda xatolik yuz berdi",
      );
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
          src={previewUrl || serverImageUrl || "/default-avatar.png"}
          alt="Profile"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff&size=128";
          }}
        />

        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isUploading ? (
            <Loader2 className="animate-spin text-white" size={32} />
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="text-white" size={24} />
              <span className="text-[10px] text-white font-bold uppercase mt-1">
                Yangilash
              </span>
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

