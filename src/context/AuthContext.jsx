import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const api = axios.create({
  baseURL: 'https://groks-hotel-backend.onrender.com',
  withCredentials: true
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const res = await api.get('/api/auth/me');
      if (res.data && res.data.success) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Session load failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // Matches the exact function named used inside Profile.jsx
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const logout = async () => {
    try {
      await api.get('/api/auth/logout');
      setUser(null);
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, loadUser, updateUser, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};