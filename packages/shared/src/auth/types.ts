import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'client' | 'organizer' | 'admin';

export interface AuthUser extends User {
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

export interface AuthSession extends Session {
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
}