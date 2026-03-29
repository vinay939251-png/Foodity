import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
 const { user } = useAuth();
 const location = useLocation();

 // Highlight active link
 const isActive = (path) => {
 if (path === '/' && location.pathname === '/feed') return true;
 return location.pathname.startsWith(path);
 };

 const navItems = [
 {
 label: 'Explore',
 path: '/feed',
 icon: (
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/feed') ? 2.5 : 2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
 </svg>
 )
 },
 {
 label: 'Create',
 path: '/recipe/new',
 requireAuth: true,
 icon: (
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/recipe/new') ? 2.5 : 2} d="M12 4v16m8-8H4" />
 </svg>
 )
 },
 {
 label: 'AI Chef',
 path: '/ai-chef',
 requireAuth: true,
 icon: (
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/ai-chef') ? 2.5 : 2} d="M13 10V3L4 14h7v7l9-11h-7z" />
 </svg>
 )
 },
 {
 label: 'Tracker',
 path: '/tracker',
 requireAuth: true,
 icon: (
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/tracker') ? 2.5 : 2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
 </svg>
 )
 },
 {
 label: 'Profile',
 path: user ? `/profile/${user.id}` : '#',
 requireAuth: true,
 icon: (
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive(`/profile/${user?.id}`) ? 2.5 : 2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
 </svg>
 )
 }
 ];

 // Don't show bottom nav on welcome page if not logged in
 if (!user && location.pathname === '/') return null;

 return (
 <div className="md:hidden fixed bottom-0 left-0 right-0 glass dark:bg-gray-900/95 border-t border-gray-100 dark:border-gray-800 pb-safe z-50">
 <div className="flex justify-around items-center h-16 px-2">
 {navItems.map((item) => {
 if (item.requireAuth && !user) return null;
 
 const active = isActive(item.path);
 
 return (
 <Link 
 key={item.label}
 to={item.path}
 className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
 active ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
 } transition-colors`}
 >
 <div className={`transition-transform duration-300 ${active ? 'scale-110 -translate-y-0.5' : ''}`}>
 {item.icon}
 </div>
 <span className={`text-[10px] font-medium transition-all ${active ? 'font-bold opacity-100' : 'opacity-80'}`}>
 {item.label}
 </span>
 </Link>
 );
 })}
 </div>
 </div>
 );
}
