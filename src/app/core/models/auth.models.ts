export interface User {
  id: string;
  username: string;
  company: string;
  email: string;
  roles: string[];
  firstName?: string;
  lastName?: string;
}

export interface LoginCredentials {
  username: string;
  company: string;
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