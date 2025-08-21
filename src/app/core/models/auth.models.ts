export interface User {
  id: string;
  username: string;
  company: string;
  email: string;
  roles: string[];
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface LoginCredentials {
  company: string;
  user: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
  company: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}