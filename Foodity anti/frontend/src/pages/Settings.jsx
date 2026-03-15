import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { User as FiUser, Mail as FiMail, Image as FiImage, Save as FiSave } from 'lucide-react';

export default function Settings() {
  const { user, login, refreshUser } = useAuth(); // We can use login context method to update local user state if needed
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    avatar_url: ''
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
          avatar_url: res.data.avatar_url || ''
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, avatar_url: '' })); // clear url if file uploaded
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = new FormData();
      payload.append('display_name', formData.display_name);
      payload.append('bio', formData.bio);
      if (avatarFile) {
        payload.append('avatar', avatarFile);
      } else if (formData.avatar_url) {
        payload.append('avatar_url', formData.avatar_url);
      }
      
      const res = await authAPI.updateProfile(payload);
      await refreshUser(); // Update the global user context
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (initLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
         <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-100">
          <div className="px-8 py-6 border-b border-gray-100 bg-white">
            <h1 className="text-3xl font-display font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-500 mt-2">Manage your public profile information</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="flex items-center gap-6 mb-8 group">
               <div className="relative w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer">
                  <img src={avatarPreview || formData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} 
                       alt="Avatar preview" 
                       className="w-full h-full object-cover" 
                       onError={(e) => e.target.style.display = 'none'} />
                  <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                     <span className="text-white text-xs font-bold">Change</span>
                  </label>
                  <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
               </div>
               <div className="flex-1">
                 <h3 className="font-bold text-gray-900 text-lg uppercase tracking-wide">{user?.username}</h3>
                 <p className="text-gray-500 font-medium flex items-center gap-2 mt-1 mb-3">
                   <FiMail /> {user?.email || 'No email attached'}
                 </p>
                 <label htmlFor="avatar-upload" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 font-medium text-sm text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    <FiImage /> Upload new photo
                 </label>
               </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiUser className="text-gray-400" /> Display Name
              </label>
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                placeholder="How should we call you?"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                Profile Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Tell the community about your culinary journey..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
              />
            </div>



            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 rounded-xl font-medium bg-primary text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30 flex items-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><FiSave /> Save Changes</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
