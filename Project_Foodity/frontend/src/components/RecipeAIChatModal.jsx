import { useState, useRef, useEffect } from 'react';
import { recipesAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function RecipeAIChatModal({ isOpen, onClose, recipe }) {
 const toast = useToast();
 const [messages, setMessages] = useState([
 { role: 'ai', text: `Hi! I'm your AI Chef. I see you're looking at "${recipe?.title}". What would you like to know about it?` }
 ]);
 const [inputValue, setInputValue] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const messagesEndRef = useRef(null);

 const scrollToBottom = () => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 };

 useEffect(() => {
 scrollToBottom();
 }, [messages, isLoading]);

 if (!isOpen || !recipe) return null;

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!inputValue.trim() || isLoading) return;

 const userMessage = inputValue.trim();
 setInputValue('');
 setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
 setIsLoading(true);

 try {
 // Pass the previous chat history to the backend for context
 const historyStr = messages.map(m => `${m.role === 'ai' ? 'Chef' : 'User'}: ${m.text}`).join('\n');
 
 const res = await recipesAPI.askAIChef(recipe.id, userMessage, historyStr);
 setMessages(prev => [...prev, { role: 'ai', text: res.data.reply }]);
 } catch (err) {
 toast.error('Failed to get an answer from the AI Chef.');
 setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble thinking right now. Please try again!" }]);
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-end sm:items-center z-50 animate-fade-in p-4 sm:p-0">
 <div 
 className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg shadow-2xl overflow-hidden flex flex-col transition-all duration-300 transform scale-100"
 style={{ height: '80vh', maxHeight: '700px' }}
 >
 {/* Header */}
 <div className="bg-gradient-to-r from-orange-500 to-primary text-white p-4 sm:p-5 flex items-center justify-between shadow-md z-10">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner text-xl">
 👨‍🍳
 </div>
 <div>
 <h2 className="font-bold text-lg leading-tight text-white drop-shadow-sm">AI Chef</h2>
 <p className="text-white/80 text-xs font-medium">Asking about {recipe.title}</p>
 </div>
 </div>
 <button 
 onClick={onClose}
 className="text-white/80 hover:text-white p-1 hover:bg-white/20 rounded-full transition-colors"
 >
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>

 {/* Chat Area */}
 <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 flex flex-col gap-4">
 {messages.map((msg, i) => (
 <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`} style={{ animationDelay: `${i * 0.05}s` }}>
 <div 
 className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm text-sm sm:text-base leading-relaxed
 ${msg.role === 'user' 
 ? 'bg-primary text-white rounded-br-sm' 
 : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
 }`}
 >
 {msg.text.split('\n').map((line, j) => (
 <span key={j}>
 {line}
 {j !== msg.text.split('\n').length - 1 && <br />}
 </span>
 ))}
 </div>
 </div>
 ))}
 
 {isLoading && (
 <div className="flex justify-start animate-fade-in">
 <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm flex items-center gap-2">
 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
 </div>
 </div>
 )}
 <div ref={messagesEndRef} className="h-2" />
 </div>

 {/* Input Area */}
 <div className="border-t border-gray-100 bg-white p-4">
 <form onSubmit={handleSubmit} className="flex gap-2">
 <input
 type="text"
 value={inputValue}
 onChange={(e) => setInputValue(e.target.value)}
 placeholder="Ask a question about this recipe..."
 className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
 disabled={isLoading}
 />
 <button
 type="submit"
 disabled={!inputValue.trim() || isLoading}
 className="bg-primary text-white px-5 rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-primary transition-colors flex items-center justify-center shadow-md shadow-primary/20"
 >
 <svg className="w-5 h-5 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
 </svg>
 </button>
 </form>
 <div className="text-center mt-3">
 <p className="text-[10px] text-gray-400 font-medium">AI Chef can make mistakes. Consider verifying safety information.</p>
 </div>
 </div>
 </div>
 </div>
 );
}
