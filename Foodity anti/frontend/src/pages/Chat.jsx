import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { chatAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import RecipeCard from '../components/RecipeCard';

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const messagesEndRef = useRef(null);
  const [searchParams] = useSearchParams();
  const autoStartUserId = searchParams.get('userId');

  // User search state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (!user) navigate('/');
    fetchConversations();
  }, [user, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoadingList(true);
      const res = await chatAPI.listConversations();
      setConversations(res.data);
      
      if (autoStartUserId) {
        const existingConvo = res.data.find(c => 
          c.participants.some(p => p.id === parseInt(autoStartUserId))
        );
        if (existingConvo) {
          handleSelectConvo(existingConvo.id);
        } else {
          try {
            const newRes = await chatAPI.startConversation(autoStartUserId);
            setConversations([newRes.data, ...res.data]);
            handleSelectConvo(newRes.data.id);
          } catch (err) {
            toast.error("Could not start conversation");
          }
        }
        window.history.replaceState({}, '', '/chat');
      } else if (res.data.length > 0 && !activeConvo) {
        handleSelectConvo(res.data[0].id);
      }
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoadingList(false);
    }
  };

  const handleSelectConvo = async (id) => {
    try {
      setLoadingChat(true);
      const convo = conversations.find(c => c.id === id);
      setActiveConvo(convo);
      const res = await chatAPI.getMessages(id);
      setMessages(res.data.messages || res.data);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvo) return;
    try {
      const res = await chatAPI.sendMessage(activeConvo.id, inputText);
      setMessages([...messages, res.data]);
      setInputText('');
      setConversations(prev => prev.map(c => 
        c.id === activeConvo.id ? { ...c, last_message_snippet: inputText } : c
      ));
    } catch {
      toast.error('Failed to send message');
    }
  };

  const handleUserSearch = async (query) => {
    setUserSearchQuery(query);
    if (query.length < 2) { setUserSearchResults([]); return; }
    try {
      const res = await usersAPI.search(query);
      setUserSearchResults(res.data);
    } catch {
      setUserSearchResults([]);
    }
  };

  const handleStartConvo = async (userId) => {
    try {
      const res = await chatAPI.startConversation(userId);
      // Check if conversation already in list
      const exists = conversations.find(c => c.id === res.data.id);
      if (!exists) {
        setConversations([res.data, ...conversations]);
      }
      setActiveConvo(res.data);
      const msgRes = await chatAPI.getMessages(res.data.id);
      setMessages(msgRes.data.messages || msgRes.data);
      setShowSearch(false);
      setUserSearchQuery('');
      setUserSearchResults([]);
    } catch {
      toast.error('Could not start conversation');
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1 flex my-6 bg-white border border-gray-200 shadow-soft rounded-2xl overflow-hidden h-[calc(100vh-120px)]">
        
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/50">
          <div className="p-5 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-display font-bold text-gray-900">Messages</h2>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  showSearch ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* User Search Panel */}
            {showSearch && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Search users to chat..."
                  value={userSearchQuery}
                  onChange={e => handleUserSearch(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm
                    placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  autoFocus
                />
                {userSearchResults.length > 0 && (
                  <div className="mt-2 bg-white border border-gray-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    {userSearchResults.map(profile => (
                      <button
                        key={profile.id}
                        onClick={() => handleStartConvo(profile.id)}
                        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <img
                          src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                          alt="" className="w-9 h-9 rounded-full border border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{profile.display_name}</p>
                          <p className="text-xs text-gray-400">@{profile.username}</p>
                        </div>
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}
                {userSearchQuery.length >= 2 && userSearchResults.length === 0 && (
                  <p className="text-xs text-gray-400 text-center mt-3">No users found</p>
                )}
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loadingList ? (
              <div className="p-6 text-center text-gray-400">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                <div className="text-3xl mb-2">💬</div>
                No conversations yet
                <button onClick={() => setShowSearch(true)} className="block mx-auto mt-2 text-primary font-semibold text-sm hover:underline">
                  Search for users to chat
                </button>
              </div>
            ) : (
              conversations.map(convo => {
                const otherUser = convo.participants.find(p => p.id !== user?.id) || convo.participants[0];
                const isActive = activeConvo?.id === convo.id;
                return (
                  <button
                    key={convo.id}
                    onClick={() => handleSelectConvo(convo.id)}
                    className={`w-full p-4 flex items-center gap-4 text-left border-b border-gray-100 transition-colors
                      ${isActive ? 'bg-orange-50/80 border-l-4 border-l-primary' : 'hover:bg-gray-100/80 border-l-4 border-l-transparent'}`}
                  >
                    <div className="relative">
                       <Link to={`/profile/${otherUser.id}`} onClick={e => e.stopPropagation()} className="block">
                         <img src={otherUser.avatar_url} alt="" className="w-12 h-12 rounded-full border border-gray-200 object-cover hover:border-primary transition-colors" />
                       </Link>
                       <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                         <Link to={`/profile/${otherUser.id}`} onClick={e => e.stopPropagation()} className="text-gray-900 font-bold text-sm truncate hover:text-primary transition-colors">{otherUser.display_name}</Link>
                         <p className="text-gray-400 text-xs text-right whitespace-nowrap ml-2">
                           {new Date(convo.updated_at).toLocaleDateString(undefined, {month: 'short', day:'numeric'})}
                         </p>
                      </div>
                      <p className={`text-sm truncate ${isActive ? 'text-primary font-medium' : 'text-gray-500'}`}>
                        {convo.last_message_snippet || 'Start chatting...'}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {activeConvo ? (
            <>
              {/* Chat Header */}
              <div className="h-16 px-6 border-b border-gray-100 flex items-center shadow-sm z-10 bg-white">
                {(() => {
                  const chatPartner = activeConvo.participants.find(p => p.id !== user?.id);
                  return chatPartner ? (
                    <Link to={`/profile/${chatPartner.id}`} className="flex items-center gap-3 group/header">
                      <img src={chatPartner.avatar_url} alt="" className="w-9 h-9 rounded-full border border-gray-200 group-hover/header:border-primary transition-colors" />
                      <span className="font-bold text-gray-900 group-hover/header:text-primary transition-colors">
                        {chatPartner.display_name}
                      </span>
                    </Link>
                  ) : null;
                })()}
              </div>

              {/* Messages feed */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar flex flex-col gap-4">
                {loadingChat ? (
                   <div className="flex-1 flex items-center justify-center text-gray-400">Loading messages...</div>
                ) : messages.length === 0 ? (
                   <div className="flex-1 flex items-center justify-center text-gray-400">Say hello! 👋</div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.sender.id === user?.id;
                    return (
                      <div key={msg.id} className={`flex max-w-[75%] ${isMe ? 'self-end' : 'self-start'}`}>
                        {!isMe && (
                          <Link to={`/profile/${msg.sender.id}`} className="shrink-0">
                            <img src={msg.sender.avatar_url} alt="" className="w-8 h-8 rounded-full mr-3 mt-auto mb-1 border border-gray-200 hover:border-primary transition-colors" />
                          </Link>
                        )}
                        <div className="flex flex-col gap-2">
                           {msg.shared_recipe && (
                              <div className="w-64 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                                 <RecipeCard recipe={msg.shared_recipe} />
                              </div>
                           )}
                           <div className={`px-5 py-3 rounded-2xl shadow-sm text-sm
                             ${isMe 
                               ? 'bg-primary text-white rounded-br-none font-medium' 
                               : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}
                           >
                             <p>{msg.text}</p>
                             <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-100' : 'text-gray-400'}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </p>
                           </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    className="flex-1 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-900
                      placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                  />
                  <button 
                    type="submit" 
                    disabled={!inputText.trim()}
                    className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20
                      hover:bg-primary-600 focus:outline-none disabled:opacity-50 disabled:shadow-none transition-all"
                  >
                    <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-400">
                <div className="text-5xl mb-4">💬</div>
                <p>Select a conversation to start chatting</p>
                <button onClick={() => setShowSearch(true)} className="mt-3 text-primary font-semibold text-sm hover:underline">
                  Or search for a user to message
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
