import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '@/features/auth/lib/storage';

// 1. Definimos qué datos compartirá el contexto
interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Este efecto corre UNA SOLA VEZ al cargar la app (F5)
  useEffect(() => {
    const token = storage.getToken();
    if (token) {
      // Si hay token, marcamos como autenticado
      setIsAuthenticated(true);
      // Aquí podrías opcionalmente validar el token con el backend
    }
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    storage.setToken(token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    storage.clearToken();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {/* Mientras verifica el token, mostramos una carga para evitar parpadeos */}
      {!isLoading ? children : <div>Cargando sesión...</div>}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};