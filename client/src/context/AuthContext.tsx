// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  authToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); // <-- Add this line

  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.id) {
            setAuthToken(storedToken);
            setUser(parsedUser);
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          } else {
            console.warn("Stored user data is incomplete or invalid. Clearing storage.");
            localStorage.clear();
          }
        } catch (e) {
          console.error("Failed to parse stored user data.", e);
          localStorage.clear();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const handleAuthResponse = (token: string, backendUserData: any) => {
    const mappedUser: User = {
      id: backendUserData._id,
      username: backendUserData.username,
      email: backendUserData.email,
    };
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(mappedUser));
    setAuthToken(token);
    setUser(mappedUser);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    navigate('/'); // <-- Add this for a smooth login/register flow
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });
      handleAuthResponse(response.data.token, response.data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/register`, { username, email, password });
      handleAuthResponse(response.data.token, response.data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setAuthToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    navigate('/auth'); // <-- The crucial addition to redirect the user
  };

  const value = {
    user,
    authToken,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};