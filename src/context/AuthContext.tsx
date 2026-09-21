import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: any; // On pourra typer ça plus précisément plus tard
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // À chaque fois que le token change (ou au chargement de la page), on récupère le profil
  useEffect(() => {
    if (token) {
      authService.getMe(token)
        .then(userData => {
          setUser(userData);
          setIsLoading(false);
        })
        .catch(() => {
          logout(); // Si le token est expiré, on nettoie
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    // Le useEffect va détecter le changement de token et récupérer le `user`
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return context;
};