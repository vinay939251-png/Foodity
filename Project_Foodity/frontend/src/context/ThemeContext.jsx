import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
 const [theme, setTheme] = useState(() => {
 return localStorage.getItem('foodity_theme') || 'system';
 });

 useEffect(() => {
 const root = document.documentElement;
 const applyTheme = (mode) => {
 if (mode === 'dark') {
 root.classList.add('dark');
 } else {
 root.classList.remove('dark');
 }
 };

 if (theme === 'system') {
 const mq = window.matchMedia('(prefers-color-scheme: dark)');
 applyTheme(mq.matches ? 'dark' : 'light');
 const handler = (e) => applyTheme(e.matches ? 'dark' : 'light');
 mq.addEventListener('change', handler);
 return () => mq.removeEventListener('change', handler);
 } else {
 applyTheme(theme);
 }

 localStorage.setItem('foodity_theme', theme);
 }, [theme]);

 const toggleTheme = () => {
 setTheme(prev => {
 if (prev === 'light') return 'dark';
 if (prev === 'dark') return 'system';
 return 'light';
 });
 };

 return (
 <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
 {children}
 </ThemeContext.Provider>
 );
}

export function useTheme() {
 const ctx = useContext(ThemeContext);
 if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
 return ctx;
}
