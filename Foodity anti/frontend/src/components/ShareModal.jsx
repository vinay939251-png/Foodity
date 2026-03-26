import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { chatAPI } from '../services/api';

export default function ShareModal({ isOpen, onClose, recipe }) {
  const { user } = useAuth();
  const toast = useToast();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingTo, setSendingTo] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchConversations();
    }
  }, [isOpen, user]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await chatAPI.listConversations();
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (convo) => {
    if (sendingTo) return;
    setSendingTo(convo.id);
    try {
      await chatAPI.sendMessage(convo.id, 'Check out this recipe!', recipe.id);
      toast.success('Recipe sent successfully! 🚀');
      setTimeout(onClose, 500);
    } catch (err) {
      toast.error('Failed to send recipe');
    } finally {
      setSendingTo(null);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/recipe/${recipe.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard! 🔗');
      onClose();
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div
        className="relative w-full max-w-sm bg-white rounded-3xl border border-gray-100 shadow-floating animate-scale-in overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-2 bg-gradient-to-r from-primary via-orange-400 to-primary shrink-0" />

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-xl font-display font-bold text-gray-900">Share Recipe</h3>
             <button onClick={onClose} className="text-gray-400 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">✕</button>
          </div>
          
          <div className="flex bg-gray-50 rounded-2xl p-3 mb-6 gap-4 items-center border border-gray-100 shadow-sm">
            <img src={recipe.image} alt="" className="w-14 h-14 rounded-xl object-cover shadow-sm" />
            <div className="flex-1 min-w-0">
               <p className="text-sm font-bold text-gray-900 truncate">{recipe.title}</p>
               <p className="text-xs font-medium text-primary truncate mt-0.5">By {recipe.author?.display_name || 'Chef'}</p>
            </div>
          </div>

          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-gray-50 border border-gray-200 shadow-sm rounded-xl text-gray-700 text-sm font-bold transition-all hover:border-gray-300 mb-6"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Copy Recipe Link
          </button>

          {!user ? (
            <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
               <p className="text-sm font-medium text-orange-800">Sign in to send via chat directly to friends!</p>
            </div>
          ) : (
            <>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Send to chat</h4>
              {loading ? (
                <div className="text-center text-sm font-medium text-gray-400 py-6">Loading active chats...</div>
              ) : conversations.length === 0 ? (
                <div className="text-center text-sm font-medium text-gray-500 py-6 bg-gray-50 rounded-xl border border-gray-100 shadow-inner">
                   No conversations yet. Go to a chef's profile to start one!
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map(convo => {
                    const otherUser = convo.participants.find(p => p.id !== user.id) || convo.participants[0];
                    return (
                      <button
                        key={convo.id}
                        onClick={() => handleSend(convo)}
                        disabled={sendingTo === convo.id}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-white hover:bg-orange-50 border border-transparent hover:border-orange-100 shadow-sm transition-all group disabled:opacity-50"
                      >
                        <Link
                          to={`/profile/${otherUser.id}`}
                          onClick={(e) => { e.stopPropagation(); onClose(); }}
                          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                          <img src={otherUser.avatar_url} alt="" className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200" />
                          <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">{otherUser.display_name}</span>
                        </Link>
                        <span className="text-primary text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-orange-100 px-3 py-1.5 rounded-lg">
                          {sendingTo === convo.id ? 'Sending...' : 'Send'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
