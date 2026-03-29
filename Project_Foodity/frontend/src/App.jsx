import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import RecipeDetail from './pages/RecipeDetail';
import RecipeForm from './pages/RecipeForm';
import AIGenerator from './pages/AIGenerator';
import Settings from './pages/Settings';
import Chat from './pages/Chat';
import ActivityFeed from './pages/ActivityFeed';
import Profile from './pages/Profile';
import Tracker from './pages/Tracker';
import UserSearch from './pages/UserSearch';
import './App.css';

function AppContent() {
 const { user, isLoading } = useAuth();

 if (isLoading) {
 return <div className="h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-500 dark:text-gray-400">Loading...</div>;
 }

 return (
 <Router>
 <Navbar />
 <Routes>
 <Route path="/" element={user ? <Navigate to="/feed" /> : <Welcome />} />
 <Route path="/feed" element={<Home />} />
 <Route path="/recipe/new" element={<RecipeForm />} />
 <Route path="/recipe/edit/:id" element={<RecipeForm />} />
 <Route path="/recipe/:id" element={<RecipeDetail />} />
 <Route path="/ai-chef" element={<AIGenerator />} />
 <Route path="/tracker" element={<Tracker />} />
 <Route path="/settings" element={<Settings />} />
 <Route path="/chat" element={<Chat />} />
 <Route path="/activity" element={<ActivityFeed />} />
 <Route path="/profile/:id" element={<Profile />} />
 <Route path="/users/search" element={<UserSearch />} />
 </Routes>
 <BottomNav />
 </Router>
 );
}

function App() {
 return (
 <ThemeProvider>
 <AuthProvider>
 <ToastProvider>
 <AppContent />
 </ToastProvider>
 </AuthProvider>
 </ThemeProvider>
 );
}

export default App;
