export interface User {
    id: number;
    username: string;
    email: string;
    fullName?: string | null;
    phone?: string | null;
    profileImage?: string | null;
    role: string;
    isActive: boolean;
    emailVerified: boolean;
    createdAt: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface UpdateProfileRequest {
    fullName?: string;
    phone?: string;
    username?: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password?: string;
}

export interface VerifyEmailRequest {
    email: string;
    code: string;
}

export interface LoginRequest {
    usernameOrEmail: string;
    password?: string;
}
