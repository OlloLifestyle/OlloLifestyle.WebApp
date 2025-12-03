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

export type PermissionMap = Record<string, string[]>;

export interface JwtClaims {
  sub: string;
  jti: string;
  iat: number;
  exp: number;
  role_id: string;
  permission?: string[];
  company_id: string;
  company_name: string;
  is_admin?: string;
  user_type?: string;
  [key: string]: unknown;
}

export interface AccessProfile {
  roleName: string;
  roleId: string;
  permissions: string[];
  scopedPermissions: PermissionMap;
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
