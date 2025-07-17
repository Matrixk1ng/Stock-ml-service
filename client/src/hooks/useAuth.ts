'use client';

import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

interface UserPayload {
  name: string;
  sub: string; // The user's email
}

export default function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserPayload | null>(null);

  useEffect(() => {
    // On initial load, try to get the token from localStorage
    const storedToken = localStorage.getItem('jwt_token');
    if (storedToken) {
      setToken(storedToken);
      try {
        const decoded = jwtDecode<UserPayload>(storedToken);
        setUser(decoded);
      } catch (error) {
        console.error("Invalid token found in storage", error);
        localStorage.removeItem('jwt_token'); // Clear invalid token
      }
    }
  }, []);

  const saveToken = useCallback((newToken: string) => {
    localStorage.setItem('jwt_token', newToken);
    setToken(newToken);
    try {
      setUser(jwtDecode<UserPayload>(newToken));
    } catch {}
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    setUser(null);
  }, []);

  return { token, user, saveToken, logout };
}