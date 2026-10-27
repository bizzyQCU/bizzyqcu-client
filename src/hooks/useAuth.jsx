import { useState, useEffect, createContext, useContext } from 'react';
import { getCurrentUser } from '../subsystems/auth/api';
import { AUTH_TOKEN_KEY } from '../lib/api-client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  // Loads the profile (GET /auth/profile) for the stored token.
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        const userData = await getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setUser(userData);
  };

  // The server has no logout endpoint; sessions are cleared client-side.
  const logout = async () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isVerified: user?.verificationStatus === 'VERIFIED',
    isSeller: user?.role === 'SELLER',
    isAdmin: user?.role === 'ADMIN',
    login,
    logout,
    refreshUser: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
