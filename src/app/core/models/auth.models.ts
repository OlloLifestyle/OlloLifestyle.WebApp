export interface User {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

export interface Company {
  id: number;
  name: string;
  isActive: boolean;
}

export interface LoginCredentials {
  username: string;
  company: string;
  password: string;
}

export interface AuthenticateRequest {
  username: string;
  password: string;
}


export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
  companies: Company[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}