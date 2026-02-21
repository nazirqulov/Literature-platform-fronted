import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios, { AxiosError } from "axios";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { useAuth } from "../../context/useAuth";

type ProfileImageUrlResponse = { filename?: string | null };
type UploadResponse = { message?: string; filename?: string | null };

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  import.meta.env.REACT_APP_API_URL ??
  "http://localhost:8080";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const FALLBACK_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff&size=128";

const ProfileImageHandler: React.FC = () => {
  const { refreshProfileImageUrl, refreshUser, user } = useAuth();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  const token = useMemo(() => localStorage.getItem("accessToken"), [user?.id]);

  const client = useMemo(() => {
    const instance = axios.create({ baseURL: API_BASE_URL });
    instance.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    instance.interceptors.response.use(
      (res) => res,
      (error: AxiosError) => {
        const status = error.response?.status;
        if (status === 401) {
          toast.error("Session expired. Please log in.");
          window.location.href = "/login";
        } else if (status === 413) {
          toast.error("File too large (max 5MB).");
        }
        return Promise.reject(error);
      },
    );
    return instance;
  }, [token]);

  const revokeUrl = (url: string | null) => {
    if (url) URL.revokeObjectURL(url);
  };

  const hydrateImage = useCallback(
    async (filename: string) => {
      const { data, headers } = await client.get<Blob>(
        `/api/profiles/${encodeURIComponent(filename)}`,
        { responseType: "blob" },
      );

      const contentType = headers["content-type"];
      if (contentType?.startsWith("image/") || data.type?.startsWith("image/")) {
        const url = URL.createObjectURL(data);
        revokeUrl(blobUrlRef.current);
        blobUrlRef.current = url;
        setImageSrc(url);
        return;
      }

      const text = await data.text();
      setImageSrc(text.trim() || FALLBACK_AVATAR);
    },
    [client],
  );

  const loadCurrentImage = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await client.get<ProfileImageUrlResponse>(
        "/api/me/profile-image-url",
      );
      const filename = data?.filename ?? null;
      if (filename) {
        await hydrateImage(filename);
      } else {
        setImageSrc(FALLBACK_AVATAR);
      }
    } catch {
      setImageSrc(FALLBACK_AVATAR);
      toast.error("Could not load profile image.");
    } finally {
      setLoading(false);
    }
  }, [client, hydrateImage]);

  useEffect(() => {
    void loadCurrentImage();
    return () => {
      revokeUrl(blobUrlRef.current);
      revokeUrl(previewUrl);
    };
  }, [loadCurrentImage, previewUrl]);

  const validateFile = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Only JPG or PNG files are allowed.");
      return false;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("File too large (max 5MB).");
      return false;
    }
    return true;
  };

  const onFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!validateFile(file)) {
      event.target.value = "";
      return;
    }
    setSelectedFile(file);
    const nextPreview = URL.createObjectURL(file);
    revokeUrl(previewUrl);
    setPreviewUrl(nextPreview);
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      toast.error("Please choose an image first.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("profileImage", selectedFile);
      await client.post<UploadResponse>("/api/me/profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile image uploaded.");
      setSelectedFile(null);
      revokeUrl(previewUrl);
      setPreviewUrl(null);

      await Promise.all([refreshProfileImageUrl(), refreshUser()]);
      await loadCurrentImage();
    } catch (error) {
      if ((error as AxiosError)?.response?.status !== 413) {
        toast.error("Upload failed. Please try again.");
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32">
        {loading ? (
          <div className="flex h-full w-full items-center justify-center">
            <ClipLoader size={32} color="#0f172a" />
          </div>
        ) : (
          <img
            src={previewUrl || imageSrc || FALLBACK_AVATAR}
            alt="Profile"
            aria-label="Profile image"
            className="w-32 h-32 rounded-full object-cover border border-gray-200 bg-gray-50"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_AVATAR;
            }}
          />
        )}
      </div>

      <input
        ref={fileInputRef}
        id="profileImageInput"
        type="file"
        accept="image/jpeg,image/png"
        onChange={onFileSelect}
        className="hidden"
        aria-label="Upload profile image"
      />

      <div className="flex items-center gap-3">
        <label
          htmlFor="profileImageInput"
          className="px-3 py-2 rounded-md border border-gray-300 cursor-pointer hover:bg-gray-100 transition"
        >
          Choose Image
        </label>
        <button
          type="button"
          onClick={uploadFile}
          disabled={uploading || !selectedFile}
          className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:bg-gray-400 transition"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
};

export default memo(ProfileImageHandler);
