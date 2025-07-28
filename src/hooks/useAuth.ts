import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');

      console.log('Checking auth status - token:', !!token, 'user:', !!savedUser);

      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
        
        // Verify token is still valid
        try {
          await authAPI.getProfile();
        } catch (error) {
          console.error('Token validation failed:', error);
          // Token is invalid, clear auth
          logout();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login({ username, password });
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout
  };
};