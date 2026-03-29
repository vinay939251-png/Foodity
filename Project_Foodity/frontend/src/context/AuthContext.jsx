import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
 const [user, setUser] = useState(() => {
 const saved = localStorage.getItem('foodity_user');
 return saved ? JSON.parse(saved) : null;
 });
 const [loading, setLoading] = useState(false);

 const login = async (username, password) => {
 const res = await authAPI.login({ username, password });
 const { user: userData, tokens } = res.data;
 localStorage.setItem('foodity_token', tokens.access);
 localStorage.setItem('foodity_refresh', tokens.refresh);
 localStorage.setItem('foodity_user', JSON.stringify(userData));
 setUser(userData);
 return userData;
 };

 const register = async (username, email, password, displayName) => {
 const res = await authAPI.register({ username, email, password, display_name: displayName });
 const { user: userData, tokens } = res.data;
 localStorage.setItem('foodity_token', tokens.access);
 localStorage.setItem('foodity_refresh', tokens.refresh);
 localStorage.setItem('foodity_user', JSON.stringify(userData));
 setUser(userData);
 return userData;
 };

 const logout = () => {
 localStorage.removeItem('foodity_token');
 localStorage.removeItem('foodity_refresh');
 localStorage.removeItem('foodity_user');
 setUser(null);
 };

 const refreshUser = async () => {
 try {
 const res = await authAPI.getMe();
 const userData = res.data;
 localStorage.setItem('foodity_user', JSON.stringify(userData));
 setUser(userData);
 } catch {
 logout();
 }
 };

 return (
 <AuthContext.Provider value={{ user, login, register, logout, refreshUser, loading }}>
 {children}
 </AuthContext.Provider>
 );
}

export const useAuth = () => useContext(AuthContext);
