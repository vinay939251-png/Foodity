import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import RecipeDetail from './pages/RecipeDetail';
import RecipeForm from './pages/RecipeForm';
import AIGenerator from './pages/AIGenerator';
import Settings from './pages/Settings';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Tracker from './pages/Tracker';
import './App.css';

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
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
        <Route path="/profile/:id" element={<Profile />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
