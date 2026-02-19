import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';
import type { User, LoginRequest, RegisterRequest, VerifyEmailRequest, AuthResponse, UpdateProfileRequest } from '../types';

interface AuthContextType {
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
    refreshUser: () => Promise<void>;
    refreshProfileImageUrl: () => Promise<void>;
}

const BASE_URL = 'http://localhost:8080';
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff&size=128';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            await Promise.all([refreshUser(), refreshProfileImageUrl()]);
        } catch (error) {
            console.error('Initial auth check failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshUser = async () => {
        try {
            const { data } = await api.get<User>('/api/me');
            setUser(data);
        } catch (error) {
            console.error('Failed to refresh user data:', error);
        }
    };

    const refreshProfileImageUrl = async () => {
        try {
            const { data } = await api.get<{ url: string }>('/api/me/profile-image-url');
            if (data.url) {
                // Cache busting with timestamp
                const timestamp = new Date().getTime();
                setProfileImageUrl(`${BASE_URL}${data.url}?t=${timestamp}`);
            } else {
                setProfileImageUrl(DEFAULT_AVATAR);
            }
        } catch (error) {
            console.error('Failed to fetch profile image URL:', error);
            setProfileImageUrl(DEFAULT_AVATAR);
        }
    };

    const login = async (data: LoginRequest) => {
        const response = await api.post<AuthResponse>('/api/login', data);
        const { accessToken, refreshToken, user } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser(user);
        await refreshProfileImageUrl();
    };

    const register = async (data: RegisterRequest) => {
        await api.post('/api/register', data);
    };

    const verifyEmail = async (data: VerifyEmailRequest) => {
        await api.post('/api/verify-email', data);
    };

    const updateProfile = async (data: UpdateProfileRequest) => {
        await api.post('/api/update-profile', data);
        await refreshUser();
    };

    const updateProfileImage = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        await api.post('/api/me/profile-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        await refreshProfileImageUrl();
        await refreshUser();
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setProfileImageUrl(null);
        window.location.href = '/';
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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
