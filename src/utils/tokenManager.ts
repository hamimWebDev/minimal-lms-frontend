import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

export class TokenManager {
  private static instance: TokenManager;
  private refreshPromise: Promise<string> | null = null;

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Check if access token is expired or will expire soon
   */
  isTokenExpired(token: string, bufferMinutes: number = 5): boolean {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      if (!decoded || !decoded.exp) {
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = decoded.exp;
      const bufferTime = bufferMinutes * 60; // Convert minutes to seconds

      // Token is expired if current time + buffer is greater than expiration time
      return (currentTime + bufferTime) >= expirationTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      if (!decoded || !decoded.exp) {
        return null;
      }

      return new Date(decoded.exp * 1000);
    } catch (error) {
      console.error('Error getting token expiration:', error);
      return null;
    }
  }

  /**
   * Get time until token expires in minutes
   */
  getTimeUntilExpiration(token: string): number {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      if (!decoded || !decoded.exp) {
        return 0;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = decoded.exp;
      const timeUntilExpiration = expirationTime - currentTime;

      return Math.max(0, Math.floor(timeUntilExpiration / 60)); // Return minutes
    } catch (error) {
      console.error('Error calculating time until expiration:', error);
      return 0;
    }
  }

  /**
   * Refresh access token if it's expired or will expire soon
   */
  async refreshTokenIfNeeded(): Promise<string | null> {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      console.log('No access token found');
      return null;
    }

    // Check if token is expired or will expire soon (within 5 minutes)
    if (!this.isTokenExpired(accessToken, 5)) {
      return accessToken;
    }

    console.log('Access token is expired or will expire soon, refreshing...');

    // If already refreshing, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Create refresh promise
    this.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh
   */
  private async performTokenRefresh(): Promise<string> {
    try {
      // Import apiService dynamically to avoid circular dependency
      const { apiService } = await import('@/lib/api');
      
      const response = await apiService.refreshToken();
      
      if (!response.data || !response.data.accessToken) {
        throw new Error('No access token received from refresh endpoint');
      }

      const newAccessToken = response.data.accessToken;
      
      // Update localStorage with new access token
      localStorage.setItem('accessToken', newAccessToken);
      
      // Update user data if provided
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      console.log('Access token refreshed successfully');
      return newAccessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // Clear auth state on refresh failure
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      
      // Dispatch logout action to update Redux store
      if (typeof window !== 'undefined') {
        try {
          const { store } = await import('@/lib/store');
          const { logoutUser } = await import('@/store/slices/authSlice');
          store.dispatch(logoutUser());
        } catch (dispatchError) {
          console.error('Error dispatching logout:', dispatchError);
        }
      }
      
      throw error;
    }
  }

  /**
   * Get valid access token (refresh if needed)
   */
  async getValidAccessToken(): Promise<string | null> {
    try {
      return await this.refreshTokenIfNeeded();
    } catch (error) {
      console.error('Failed to get valid access token:', error);
      return null;
    }
  }

  /**
   * Check token status and log information
   */
  checkTokenStatus(): void {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      return;
    }

    const isExpired = this.isTokenExpired(accessToken);
    const expirationTime = this.getTokenExpiration(accessToken);
    const timeUntilExpiration = this.getTimeUntilExpiration(accessToken);

    console.log('Token Status:', {
      isExpired,
      expirationTime: expirationTime?.toISOString(),
      timeUntilExpiration: `${timeUntilExpiration} minutes`,
      willExpireSoon: timeUntilExpiration <= 5
    });
  }
}

// Export singleton instance
export const tokenManager = TokenManager.getInstance();
