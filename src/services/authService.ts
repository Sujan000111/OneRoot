// Minimal auth stub - auth is disabled for now

export interface LoginCredentials {
  mobileNumber: string;
  otp: string;
  deviceId: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

class AuthService {
  private jwtToken: string | null = null;

  setJwt(token: string | null) {
    this.jwtToken = token || null;
  }

  getJwt(): string | null {
    return this.jwtToken;
  }

  isAuthenticated(): boolean {
    return !!this.jwtToken;
  }

  isTokenValid(token: string): boolean {
    try {
      // Basic validation - check if token exists and has valid format
      if (!token || token.length < 50) return false;
      
      // For now, just check if token exists and has reasonable length
      // In production, you might want to verify the token with the backend
      return true;
    } catch (error) {
      return false;
    }
  }

  // No-op placeholders (kept for compatibility)
  async login(_credentials: LoginCredentials): Promise<AuthResponse> {
    return { success: false, message: 'Authentication is disabled', error: 'AUTH_DISABLED' };
  }

  async sendOTP(_mobileNumber: string, _template: string = ''): Promise<{ success: boolean; message: string; error?: string }> {
    return { success: false, message: 'OTP is disabled', error: 'OTP_DISABLED' };
  }

  async verifyOTP(_mobileNumber: string, _otp: string): Promise<{ success: boolean; message: string; error?: string }> {
    return { success: false, message: 'OTP is disabled', error: 'OTP_DISABLED' };
  }

  async logout(): Promise<void> {
    this.setJwt(null);
  }

  generateDeviceId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `device-${timestamp}-${random}`;
  }
}

export const authService = new AuthService();
export default AuthService;
