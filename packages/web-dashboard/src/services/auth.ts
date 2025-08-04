const PAYLOAD_API_URL = import.meta.env.VITE_PAYLOAD_API_URL || 'http://localhost:3000/api';

export interface AuthResponse {
  user: User;
  token: string;
  exp: number;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'organizer' | 'client';
  firstName?: string;
  lastName?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

class AuthService {
  private token: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.loadStoredToken();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${PAYLOAD_API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid email or password');
        }
        throw new Error(`Login failed: ${response.statusText}`);
      }

      const data: AuthResponse = await response.json();
      
      // Store token and expiry
      this.token = data.token;
      this.tokenExpiry = data.exp;
      
      // Save to localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_token_expiry', data.exp.toString());
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint if token exists
      if (this.token) {
        await fetch(`${PAYLOAD_API_URL}/users/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local state
      this.token = null;
      this.tokenExpiry = null;
      
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_token_expiry');
      localStorage.removeItem('auth_user');
    }
  }

  async refreshToken(): Promise<AuthResponse | null> {
    if (!this.token) {
      return null;
    }

    try {
      const response = await fetch(`${PAYLOAD_API_URL}/users/refresh-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Token refresh failed, user needs to login again
        await this.logout();
        return null;
      }

      const data: AuthResponse = await response.json();
      
      // Update stored token
      this.token = data.token;
      this.tokenExpiry = data.exp;
      
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_token_expiry', data.exp.toString());
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.logout();
      return null;
    }
  }

  getStoredToken(): string | null {
    return this.token;
  }

  getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem('auth_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    if (!this.token || !this.tokenExpiry) {
      return false;
    }

    // Check if token is expired (with 5 minute buffer)
    const now = Date.now() / 1000;
    const bufferTime = 5 * 60; // 5 minutes
    
    return this.tokenExpiry > (now + bufferTime);
  }

  isTokenExpired(): boolean {
    if (!this.tokenExpiry) {
      return true;
    }

    const now = Date.now() / 1000;
    return this.tokenExpiry <= now;
  }

  private loadStoredToken(): void {
    try {
      const token = localStorage.getItem('auth_token');
      const expiry = localStorage.getItem('auth_token_expiry');
      
      if (token && expiry) {
        this.token = token;
        this.tokenExpiry = parseInt(expiry, 10);
        
        // Check if token is expired
        if (this.isTokenExpired()) {
          this.logout();
        }
      }
    } catch (error) {
      console.error('Error loading stored token:', error);
      this.logout();
    }
  }

  // Helper method for making authenticated API requests
  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    // Ensure we have a valid token
    if (!this.isAuthenticated()) {
      // Try to refresh token
      const refreshed = await this.refreshToken();
      if (!refreshed) {
        throw new Error('Authentication required');
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }
}

// Export singleton instance
export const authService = new AuthService();