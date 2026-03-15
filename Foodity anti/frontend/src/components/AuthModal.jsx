import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const toast = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    displayName: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.username, formData.password);
        toast.success(`Welcome back, ${formData.username}! 🍳`);
      } else {
        await register(formData.username, formData.email, formData.password, formData.displayName);
        await login(formData.username, formData.password);
        toast.success('Account created! Welcome to Foodity! 🎉');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = () => {
    setIsLogin(true);
    setFormData({
      ...formData,
      username: 'chef_marco',
      password: 'demo1234'
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-floating overflow-hidden animate-scale-in border border-gray-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Top gradient bar */}
        <div className="h-2 bg-gradient-to-r from-primary to-orange-400" />
        
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-primary text-2xl mx-auto mb-4 border border-orange-100 shadow-sm">
               🍽
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-1">
              {isLogin ? 'Welcome Back' : 'Join Foodity'}
            </h2>
            <p className="text-gray-500 text-sm">
              {isLogin ? 'Sign in to save and review recipes.' : 'Create your chef profile today.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <input
                    name="email" type="email" placeholder="Email Address" required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm
                      placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium shadow-sm"
                    value={formData.email} onChange={handleChange}
                  />
                </div>
                <div>
                  <input
                    name="displayName" type="text" placeholder="Display Name (e.g. Master Chef)" required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm
                      placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium shadow-sm"
                    value={formData.displayName} onChange={handleChange}
                  />
                </div>
              </>
            )}
            
            <div>
              <input
                name="username" type="text" placeholder="Username" required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm
                  placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium shadow-sm"
                value={formData.username} onChange={handleChange}
              />
            </div>
            
            <div>
              <input
                name="password" type="password" placeholder="Password" required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm
                  placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium shadow-sm"
                value={formData.password} onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary rounded-xl text-white font-bold text-sm mt-6
                hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>

            {isLogin && (
              <button
                type="button"
                onClick={autofillDemo}
                className="w-full py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-gray-700 font-semibold text-sm
                  hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
              >
                Try Demo Account (chef_marco)
              </button>
            )}
          </form>

          <div className="mt-8 text-center text-sm font-medium">
            <span className="text-gray-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:text-primary-600 font-bold transition-colors"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
