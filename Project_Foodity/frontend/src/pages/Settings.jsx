import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  User as FiUser, 
  Settings as FiSettings, 
  Lock as FiLock, 
  Globe as FiGlobe, 
  Flag as FiFlag, 
  Users as FiUsers,
  ChevronRight,
  Info,
  X as FiX,
  Calendar as FiCalendar
} from 'lucide-react';

export default function Settings() {
  const { user, login, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('edit_profile');
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    avatar_url: '',
    is_public: true,
    date_of_birth: '',
    gender: '',
    country: '',
    language: 'en'
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authAPI.getMe();
        setFormData({
          display_name: res.data.display_name || '',
          bio: res.data.bio || '',
          avatar_url: res.data.avatar_url || '',
          is_public: res.data.is_public !== false,
          date_of_birth: res.data.date_of_birth || '',
          gender: res.data.gender || '',
          country: res.data.country || '',
          language: res.data.language || 'en'
        });
      } catch (err) {
        toast.error("Failed to load profile data");
      } finally {
        setInitLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, avatar_url: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = new FormData();
      payload.append('display_name', formData.display_name);
      payload.append('bio', formData.bio);
      payload.append('is_public', formData.is_public ? '1' : '0');
      if (formData.date_of_birth) payload.append('date_of_birth', formData.date_of_birth);
      if (formData.gender) payload.append('gender', formData.gender);
      if (formData.country) payload.append('country', formData.country);
      if (formData.language) payload.append('language', formData.language);
      if (avatarFile) {
        payload.append('avatar', avatarFile);
      } else if (formData.avatar_url) {
        payload.append('avatar_url', formData.avatar_url);
      }
      
      await authAPI.updateProfile(payload);
      await refreshUser();
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (initLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-gray-100 dark:border-gray-800 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { id: 'edit_profile', label: 'Edit profile' },
    { id: 'account_management', label: 'Account management' },
    { id: 'profile_visibility', label: 'Profile visibility' },
    { id: 'refine_recommendations', label: 'Refine your recommendations' },
    { id: 'link_pinterest', label: 'Link to Pinterest' },
    { id: 'social_permissions', label: 'Social permissions' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'privacy_data', label: 'Privacy and data' },
    { id: 'security', label: 'Security' },
    { id: 'branded_content', label: 'Branded Content' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20 pb-20 font-sans transition-colors duration-500">
      <div className="container mx-auto px-4 max-w-6xl flex">
        
        {/* Sidebar */}
        <div className="w-64 hidden md:block shrink-0 pr-8 border-r border-gray-100 dark:border-gray-800">
          <nav className="sticky top-28 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all
                  ${activeTab === item.id 
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-l-4 border-black dark:border-white pl-3' 
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 border-l-4 border-transparent pl-3'}
                `}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 md:pl-16 max-w-2xl">
          <form onSubmit={handleSubmit} className="pb-24">
            
            {/* Conditional Section: Edit Profile */}
            {activeTab === 'edit_profile' && (
              <div className="animate-fade-in space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Edit profile</h1>
                  <p className="text-gray-500 dark:text-gray-400">Keep your personal details private. Information you share here will be visible to anyone who can view your profile.</p>
                </div>

                {/* Avatar */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800">
                      <img 
                        src={avatarPreview || formData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <label htmlFor="avatar-upload" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-full font-bold text-sm cursor-pointer transition-colors">
                      Change
                    </label>
                    <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Display name</label>
                  <input
                    type="text"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-blue-400 outline-none transition-all dark:bg-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-400">Choose a name that others will see on your profile.</p>
                </div>

                {/* About (Bio) */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">About</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tell your story"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-blue-400 outline-none transition-all resize-none dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Conditional Section: Account Management */}
            {activeTab === 'account_management' && (
              <div className="animate-fade-in space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Account management</h1>
                  <p className="text-gray-500 dark:text-gray-400">Make changes to your personal information or account type.</p>
                </div>

                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your account</h2>
                  
                  {/* Email (Read Only representation) */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Email · Private</label>
                    <div className="w-full px-4 py-3 border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-500">
                      {user?.email}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                    <div className="space-y-1">
                      <span className="font-bold text-gray-900 dark:text-white">Password</span>
                    </div>
                    <button type="button" className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full font-bold text-sm">
                      Change
                    </button>
                  </div>
                </div>

                <div className="space-y-6 pt-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Personal information</h2>
                  
                  {/* Birthdate */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      Birthdate <Info className="w-3 h-3 cursor-help text-gray-400" />
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-blue-400 outline-none transition-all dark:bg-gray-900 dark:text-white appearance-none"
                      />
                      <FiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Gender (Radio Buttons) */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Gender</label>
                    <div className="flex items-center gap-8">
                      {['male', 'female', 'other'].map(option => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer group">
                          <div className="relative w-5 h-5 flex items-center justify-center">
                            <input
                              type="radio"
                              name="gender"
                              value={option}
                              checked={formData.gender === option}
                              onChange={handleChange}
                              className="peer sr-only"
                            />
                            <div className="w-full h-full border-2 border-gray-300 dark:border-gray-600 rounded-full peer-checked:border-blue-500 transition-all" />
                            <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white capitalize">
                            {option === 'other' ? 'Non-binary' : option}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Country */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Country/Region</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="e.g. India"
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-blue-400 outline-none transition-all dark:bg-gray-900 dark:text-white"
                      />
                      {formData.country && (
                        <button 
                          onClick={() => setFormData(p => ({ ...p, country: '' }))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Language */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Language</label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-blue-400 outline-none transition-all dark:bg-gray-900 dark:text-white appearance-none"
                    >
                      <option value="en">English (US)</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Conditional Section: Profile Visibility */}
            {activeTab === 'profile_visibility' && (
              <div className="animate-fade-in space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile visibility</h1>
                  <p className="text-gray-500 dark:text-gray-400">Manage how your profile can be viewed on and off of Foodity.</p>
                </div>

                <div className="space-y-10 pt-4">
                  <div className="flex items-center justify-between gap-8">
                    <div className="space-y-1 max-w-lg">
                      <h3 className="font-bold text-gray-900 dark:text-white">Private profile</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        When your profile is private only the people you approve can see your profile, recipes, boards, and following lists.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!formData.is_public}
                        onChange={(e) => setFormData(p => ({ ...p, is_public: !e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-black dark:peer-checked:bg-white"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between gap-8">
                    <div className="space-y-1 max-w-lg">
                      <h3 className="font-bold text-gray-900 dark:text-white">Search privacy</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        Hide your profile and recipes from search engines (ex. Google).
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-black dark:peer-checked:bg-white"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Sticky Actions Bar */}
            <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-4 z-40">
              <button
                type="button"
                className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-full font-bold transition-all"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold transition-all shadow-lg
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
                `}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
