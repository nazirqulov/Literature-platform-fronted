import React, {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import api from "../services/api";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User,
  VerifyEmailRequest,
} from "../types";

export interface AuthContextType {
  user: User | null;
  profileImageUrl: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  verifyEmail: (data: VerifyEmailRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  updateProfileImage: (file: File) => Promise<void>;
  refreshUser: () => Promise<User>;
  refreshProfileImageUrl: () => Promise<void>;
}

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff&size=128";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void checkAuth();
  }, []);

  const clearAuthState = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setProfileImageUrl(null);
  };

  const checkAuth = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      await refreshUser();
      await refreshProfileImageUrl();
    } catch (error) {
      console.error("Initial auth check failed:", error);
      clearAuthState();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<User> => {
    const { data } = await api.get<User>("/api/me");
    setUser(data);
    return data;
  };

  const refreshProfileImageUrl = async () => {
    try {
      const { data } = await api.get<{ url: string }>(
        "/api/me/profile-image-url",
      );
      if (data.url) {
        const timestamp = Date.now();
        const baseUrl = api.defaults.baseURL ?? "";
        const normalizedUrl = data.url.startsWith("http")
          ? data.url
          : new URL(data.url, `${baseUrl}/`).toString();
        const separator = normalizedUrl.includes("?") ? "&" : "?";
        setProfileImageUrl(`${normalizedUrl}${separator}t=${timestamp}`);
      } else {
        setProfileImageUrl(DEFAULT_AVATAR);
      }
    } catch (error) {
      console.error("Failed to fetch profile image URL:", error);
      setProfileImageUrl(DEFAULT_AVATAR);
    }
  };

  const login = async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>("/api/login", data);
    const { accessToken, refreshToken, user: loginUser } = response.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setUser(loginUser);

    try {
      await Promise.all([refreshUser(), refreshProfileImageUrl()]);
    } catch {
      setUser(loginUser);
    }
  };

  const register = async (data: RegisterRequest) => {
    await api.post("/api/register", data);
  };

  const verifyEmail = async (data: VerifyEmailRequest) => {
    await api.post("/api/verify-email", data);
  };

  const updateProfile = async (data: UpdateProfileRequest) => {
    const { data: updatedUser } = await api.put<User>("/api/update-profile", data);
    setUser(updatedUser);
  };

  const updateProfileImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    await api.post("/api/me/profile-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    await refreshProfileImageUrl();
    await refreshUser();
  };

  const logout = () => {
    clearAuthState();
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profileImageUrl,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        verifyEmail,
        logout,
        updateProfile,
        updateProfileImage,
        refreshUser,
        refreshProfileImageUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
