import { useState, useEffect, createContext, useContext } from 'react';
import { getCurrentUser, logout as logoutApi } from '../subsystems/auth/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const userData = await getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token) => {
    localStorage.setItem('authToken', token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
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
