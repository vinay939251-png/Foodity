import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
 const [toasts, setToasts] = useState([]);

 const addToast = useCallback((message, type = 'info', duration = 3000) => {
 const id = Date.now() + Math.random();
 setToasts(prev => [...prev, { id, message, type }]);
 setTimeout(() => {
 setToasts(prev => prev.filter(t => t.id !== id));
 }, duration);
 }, []);

 const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
 const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
 const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

 return (
 <ToastContext.Provider value={{ success, error, info }}>
 {children}
 {/* Toast container */}
 <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
 {toasts.map(toast => (
 <div
 key={toast.id}
 className={`pointer-events-auto px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-medium
 animate-slide-up backdrop-blur-xl border border-white/10
 ${toast.type === 'success' ? 'bg-emerald-500/90' : ''}
 ${toast.type === 'error' ? 'bg-red-500/90' : ''}
 ${toast.type === 'info' ? 'bg-primary/90' : ''}
 `}
 >
 <div className="flex items-center gap-2">
 {toast.type === 'success' && <span>✓</span>}
 {toast.type === 'error' && <span>✕</span>}
 {toast.type === 'info' && <span>ℹ</span>}
 {toast.message}
 </div>
 </div>
 ))}
 </div>
 </ToastContext.Provider>
 );
}

export const useToast = () => useContext(ToastContext);
