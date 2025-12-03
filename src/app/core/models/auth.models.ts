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

export interface PermissionScopes {
  user: string[];
  employee: string[];
  order: string[];
  product: string[];
}

export interface JwtClaims {
  sub: string;
  jti: string;
  iat: number;
  exp: number;
  role_id: string;
  permission: string[];
  permission_user?: string[] | string;
  permission_employee?: string[] | string;
  permission_order?: string[] | string;
  permission_product?: string[] | string;
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
  scopedPermissions: PermissionScopes;
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
