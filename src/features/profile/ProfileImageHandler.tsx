import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { isAxiosError } from "axios";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import api from "../../services/api";
import { useAuth } from "../../context/useAuth";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const FALLBACK_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff&size=128";

const ProfileImageHandler: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageObjectUrlRef = useRef<string | null>(null);
  const previewObjectUrlRef = useRef<string | null>(null);

  const displaySrc = useMemo(
    () => previewUrl ?? imageSrc ?? FALLBACK_AVATAR,
    [imageSrc, previewUrl],
  );

  const revokeObjectUrl = useCallback(
    (ref: React.MutableRefObject<string | null>) => {
      if (ref.current) {
        URL.revokeObjectURL(ref.current);
        ref.current = null;
      }
    },
    [],
  );

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

  const extractFilename = (profileImage?: string | null) => {
    if (!profileImage) return null;
    const marker = "profiles/";
    const markerIndex = profileImage.lastIndexOf(marker);
    if (markerIndex >= 0) {
      return profileImage.slice(markerIndex + marker.length) || null;
    }
    const parts = profileImage.split("/");
    return parts[parts.length - 1] || null;
  };

  const fetchProfileBlob = useCallback(
    async (filename: string) => {
      try {
        // Blob flow: GET /api/profiles/{filename} with responseType: 'blob', createObjectURL, set <img src>.
        const response = await api.get<Blob>(
          `/api/profiles/${encodeURIComponent(filename)}`,
          { responseType: "blob" },
        );

        const objectUrl = URL.createObjectURL(response.data);
        revokeObjectUrl(imageObjectUrlRef);
        imageObjectUrlRef.current = objectUrl;
        setImageSrc(objectUrl);
      } catch {
        setImageSrc(FALLBACK_AVATAR);
        toast.error("Could not load profile image.");
      }
    },
    [revokeObjectUrl],
  );

  const loadProfileImage = useCallback(async (profileImage?: string | null) => {
    setLoading(true);
    try {
      const filename = extractFilename(profileImage);
      if (!filename) {
        setImageSrc(FALLBACK_AVATAR);
        return;
      }

      await fetchProfileBlob(filename);
    } catch (error) {
      setImageSrc(FALLBACK_AVATAR);
      if (isAxiosError(error) && error.response?.status === 401) {
        toast.error("Session expired. Please log in.");
        window.location.href = "/login";
      } else {
        toast.error("Could not load profile image.");
      }
    } finally {
      setLoading(false);
    }
  }, [fetchProfileBlob]);

  useEffect(() => {
    void loadProfileImage(user?.profileImage ?? null);
    return () => {
      revokeObjectUrl(imageObjectUrlRef);
      revokeObjectUrl(previewObjectUrlRef);
    };
  }, [loadProfileImage, revokeObjectUrl, user?.profileImage]);

  const uploadFile = async (file: File) => {
    if (!file) {
      toast.error("Please choose an image first.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      await api.post("/api/me/profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile image uploaded.");
      setSelectedFile(null);
      revokeObjectUrl(previewObjectUrlRef);
      setPreviewUrl(null);

      const updatedUser = await refreshUser();
      const nextFilename = extractFilename(updatedUser.profileImage);
      if (nextFilename) {
        await fetchProfileBlob(nextFilename);
      } else {
        setImageSrc(FALLBACK_AVATAR);
      }
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 413) {
        toast.error("File too large (max 5MB).");
      } else if (isAxiosError(error) && error.response?.status === 401) {
        toast.error("Session expired. Please log in.");
        window.location.href = "/login";
      } else {
        toast.error("Upload failed. Please try again.");
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!validateFile(file)) {
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    revokeObjectUrl(previewObjectUrlRef);
    const nextPreview = URL.createObjectURL(file);
    previewObjectUrlRef.current = nextPreview;
    setPreviewUrl(nextPreview);
    void uploadFile(file);
  };

  return (
    <div className="flex flex-col items-center gap-4" aria-live="polite">
      <div className="relative w-32 h-32">
        {loading ? (
          <div className="flex h-full w-full items-center justify-center">
            <ClipLoader size={32} color="#0f172a" aria-label="Loading image" />
          </div>
        ) : (
          <img
            src={displaySrc}
            alt="Profile"
            aria-label="Profile image"
            className="w-32 h-32 rounded-full object-cover border border-gray-200 bg-gray-50"
            onError={(event) => {
              (event.currentTarget as HTMLImageElement).src = FALLBACK_AVATAR;
            }}
          />
        )}
      </div>

      <input
        ref={fileInputRef}
        id="profileImageInput"
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={onFileSelect}
        className="sr-only"
        aria-label="Upload profile image"
      />

      <div className="flex items-center gap-3">
        <label
          htmlFor="profileImageInput"
          className="px-3 py-2 rounded-md border border-gray-300 cursor-pointer hover:bg-gray-100 transition"
          aria-busy={uploading}
        >
          {uploading ? "Uploading..." : "Choose Image"}
        </label>
      </div>
    </div>
  );
};

export default memo(ProfileImageHandler);
