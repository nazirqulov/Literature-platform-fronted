import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import { Camera, Upload } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { isAxiosError } from "axios";
import { toast } from "react-toastify";
import api from "../../services/api";
import { useAuth } from "../../context/useAuth";

interface ProfileImageMetaResponse {
  filename: string;
  url?: string;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const DEBOUNCE_MS = 350;
const FALLBACK_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff&size=128";

const buildAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const normalizeAssetUrl = (url: string) => {
  if (url.startsWith("http")) return url;
  const baseUrl = api.defaults.baseURL ?? "http://localhost:8080";
  return new URL(url, `${baseUrl}/`).toString();
};

const ProfileImageManagerComponent: React.FC = () => {
  const { refreshProfileImageUrl, refreshUser } = useAuth();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadButtonRef = useRef<HTMLButtonElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const debounceRef = useRef<number | null>(null);

  const clearObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const resolveImageFromFilename = useCallback(
    async (filename: string) => {
      const { data } = await api.get<Blob>(`/api/profiles/${encodeURIComponent(filename)}`, {
        headers: buildAuthHeaders(),
        responseType: "blob",
      });

      if (data.type.includes("application/json")) {
        const text = await data.text();
        const parsed = JSON.parse(text) as { url?: string };
        return parsed.url ? normalizeAssetUrl(parsed.url) : null;
      }

      if (data.type.startsWith("text/")) {
        const text = (await data.text()).trim();
        return text ? normalizeAssetUrl(text) : null;
      }

      clearObjectUrl();
      const blobUrl = URL.createObjectURL(data);
      objectUrlRef.current = blobUrl;
      return blobUrl;
    },
    [clearObjectUrl],
  );

  const fetchCurrentProfileImage = useCallback(async () => {
    setIsFetching(true);
    try {
      const { data } = await api.get<ProfileImageMetaResponse>("/api/me/profile-image-url", {
        headers: buildAuthHeaders(),
      });

      if (!data.filename) {
        setImageUrl(data.url ? normalizeAssetUrl(data.url) : FALLBACK_AVATAR);
        return;
      }

      const resolved = await resolveImageFromFilename(data.filename);
      if (resolved) {
        setImageUrl(resolved);
      } else if (data.url) {
        setImageUrl(normalizeAssetUrl(data.url));
      } else {
        setImageUrl(FALLBACK_AVATAR);
      }
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        setImageUrl(FALLBACK_AVATAR);
        return;
      }
      setImageUrl(FALLBACK_AVATAR);
      toast.error("Could not load profile image.");
    } finally {
      setIsFetching(false);
    }
  }, [resolveImageFromFilename]);

  useEffect(() => {
    void fetchCurrentProfileImage();
    return () => {
      clearObjectUrl();
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [clearObjectUrl, fetchCurrentProfileImage]);

  const selectedImage = useMemo(
    () => previewUrl ?? imageUrl ?? FALLBACK_AVATAR,
    [imageUrl, previewUrl],
  );

  const validateFile = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Invalid file. Only JPG and PNG are allowed.");
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Invalid file. Max size is 5MB.");
      return false;
    }
    return true;
  };

  const uploadProfileImage = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("profileImage", file);
        await api.post("/api/me/profile-image", formData, {
          headers: {
            ...buildAuthHeaders(),
            "Content-Type": "multipart/form-data",
          },
        });

        await Promise.all([refreshUser(), refreshProfileImageUrl()]);
        await fetchCurrentProfileImage();
        setPreviewUrl(null);
        toast.success("Profile image updated successfully.");
      } catch (error) {
        const message = isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message ?? "Upload failed."
          : "Upload failed.";
        toast.error(message);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        uploadButtonRef.current?.focus();
      }
    },
    [fetchCurrentProfileImage, refreshProfileImageUrl, refreshUser],
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!validateFile(file)) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    clearObjectUrl();
    const localPreview = URL.createObjectURL(file);
    objectUrlRef.current = localPreview;
    setPreviewUrl(localPreview);

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      void uploadProfileImage(file);
    }, DEBOUNCE_MS);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col items-center gap-4"
      aria-live="polite"
    >
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        aria-label="Profile image uploader"
        className="relative group h-32 w-32 overflow-hidden rounded-full border-4 border-[var(--accent-soft)]/30 bg-[var(--surface-2)] shadow-xl hover:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      >
        <img
          src={selectedImage}
          alt="Profile avatar"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(event) => {
            (event.currentTarget as HTMLImageElement).src = FALLBACK_AVATAR;
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
          {isFetching || isUploading ? (
            <ClipLoader size={24} color="#ffffff" aria-label="Profile image loading indicator" />
          ) : (
            <Upload size={18} className="text-white" />
          )}
        </div>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Choose profile image"
      />

      <button
        ref={uploadButtonRef}
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isFetching || isUploading}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Camera size={16} />
        Upload image
      </button>
    </motion.section>
  );
};

const ProfileImageManager = memo(ProfileImageManagerComponent);

export default ProfileImageManager;
