import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Load user data whenever the app starts or changes pages
  const loadUser = async () => {
    try {
      // Points directly to your Render backend
      const res = await axios.get('https://groks-hotel-backend.onrender.com/api/auth/me', {
        withCredentials: true // 👈 CRITICAL: Keeps your cookie session alive across pages
      });

      if (res.data && res.data.success) {
        // 🌟 FIXED: Explicitly save the backend user object (including the avatar path) to state
        setUser(res.data.user);
      }
    } catch (error) {
      console.error("Error loading user session:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // 2. Update profile state dynamically when a user changes their data or uploads an avatar
  const updateProfileState = (updatedUser) => {
    // 🌟 FIXED: Ensures the frontend state immediately reflects the backend's saved database paths
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, loadUser, updateProfileState }}>
      {children}
    </AuthContext.Provider>
  );
};