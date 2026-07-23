export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  roles: string[];
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  expiresAtUtc: string;
  user: AppUser;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  roles: string[];
  emailConfirmed: boolean;
  isLockedOut: boolean;
  createdAt: string;
}

export const ROLE_ADMIN = 'Admin';
export const ROLE_CUSTOMER = 'Customer';
