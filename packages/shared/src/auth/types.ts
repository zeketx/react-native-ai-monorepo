export type UserRole = 'client' | 'organizer' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  emailVerified: boolean;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  profile?: {
    id: string;
    user_id: string;
    role: UserRole;
    first_name?: string;
    last_name?: string;
    phone?: string;
    created_at: string;
    updated_at: string;
  };
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  token_type: 'bearer';
  user: AuthUser;
}

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  initialized: boolean;
}

export type AuthError = {
  message: string;
  status?: number;
  code?: string;
};

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ error?: AuthError }>;
  register: (credentials: RegisterCredentials) => Promise<{ error?: AuthError }>;
  logout: () => Promise<{ error?: AuthError }>;
  refreshSession: () => Promise<{ error?: AuthError }>;
  getCurrentUser: () => Promise<{ data?: AuthUser; error?: AuthError }>;
  forgotPassword: (email: string) => Promise<{ error?: AuthError }>;
  resetPassword: (token: string, password: string, passwordConfirm: string) => Promise<{ error?: AuthError }>;
}

// Additional Payload-specific types
export interface PayloadAuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    statusCode?: number;
  };
  message?: string;
}

export interface PayloadJWTPayload {
  id: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface TokenValidationResult {
  valid: boolean;
  payload?: PayloadJWTPayload;
  error?: string;
}

// Login/Registration data types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
}