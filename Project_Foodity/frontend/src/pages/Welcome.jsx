import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';

export default function Welcome() {
 const { user } = useAuth();
 const [authOpen, setAuthOpen] = useState(false);

 return (
 <>
 <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative overflow-hidden transition-colors duration-300">
 {/* Abstract Background Elements */}
 <div className="absolute inset-0 overflow-hidden pointer-events-none">
 <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-100 dark:bg-primary-900/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-float" />
 <div className="absolute top-[20%] right-[-5%] w-[30%] h-[50%] bg-orange-50 dark:bg-orange-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-float-delayed" />
 <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-white dark:bg-gray-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50" />
 </div>

 {/* Hero Section */}
 <div className="relative pt-32 pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
 <div className="text-center">
 {/* Badge */}
 <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-full mb-8 animate-fade-in">
 <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
 <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">Discover 30,000+ Recipes</span>
 </div>

 {/* Headline */}
 <h1 className="text-5xl sm:text-7xl font-display font-bold text-gray-900 dark:text-white leading-tight mb-6 animate-slide-up">
 Your Personal
 <br />
 <span className="text-primary tracking-tight">
 Recipe Universe
 </span>
 </h1>

 <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 animate-slide-up" style={{animationDelay:'0.1s'}}>
 Explore a world of flavors. Save, share, and cook stunning recipes
 from cuisines around the globe. Clean, fast, and professional.
 </p>

 {/* CTAs */}
 <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{animationDelay:'0.2s'}}>
 <Link
 to="/feed"
 className="group px-8 py-4 bg-primary rounded-xl text-white font-semibold text-lg
 hover:bg-primary-600 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300
 flex items-center gap-3"
 >
 <span>Explore Recipes</span>
 <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
 </svg>
 </Link>

 {!user && (
 <button
 onClick={() => setAuthOpen(true)}
 className="px-8 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl text-gray-700 dark:text-gray-200 font-semibold text-lg
 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
 >
 <span>Sign In</span>
 </button>
 )}
 </div>
 </div>

 {/* Feature Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-24 animate-slide-up" style={{animationDelay:'0.3s'}}>
 {[
 { icon: '🔍', title: 'Smart Search', desc: 'Find recipes by ingredient, cuisine, difficulty, or dietary preference instantly.' },
 { icon: '💾', title: 'Save & Organize', desc: 'Create boards and save your favorite recipes for easy access anytime in your kitchen.' },
 { icon: '💬', title: 'Community', desc: 'Chat with other chefs, share recipe cards directly in messages, and leave reviews.' },
 ].map((feature, i) => (
 <div key={i}
 className="group p-8 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-soft rounded-3xl
 hover:shadow-floating hover:-translate-y-2 transition-all duration-500"
 >
 <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary flex items-center justify-center
 text-2xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
 {feature.icon}
 </div>
 <h3 className="text-gray-900 dark:text-white font-bold text-xl mb-3">{feature.title}</h3>
 <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
 </div>
 ))}
 </div>

 {/* Stats */}
 <div className="flex flex-wrap justify-center gap-12 sm:gap-24 mt-20 pt-10 border-t border-gray-200/60 dark:border-gray-800/80 animate-fade-in" style={{animationDelay:'0.4s'}}>
 {[
 { value: '30K+', label: 'Curated Recipes' },
 { value: '500+', label: 'Global Cuisines' },
 { value: '100%', label: 'Free to Use' },
 ].map((stat, i) => (
 <div key={i} className="text-center">
 <div className="text-4xl sm:text-5xl font-display font-extrabold text-gray-900 dark:text-white tracking-tight">
 {stat.value}
 </div>
 <div className="text-primary font-medium text-sm mt-2 uppercase tracking-wide">{stat.label}</div>
 </div>
 ))}
 </div>
 </div>
 </div>

 <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
 </>
 );
}
