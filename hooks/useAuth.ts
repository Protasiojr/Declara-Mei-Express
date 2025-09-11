
import { useState, useCallback } from 'react';
import { User, Page } from '../types';
import { MOCK_USER } from '../constants';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
    setUser(MOCK_USER);
  }, []);
  
  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return {
    isAuthenticated,
    user,
    setUser,
    handleLogin,
    handleLogout,
  };
};
