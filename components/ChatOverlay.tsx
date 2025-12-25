import React, { useState, useRef, useEffect } from 'react';
import { X, Send, BrainCircuit, Zap } from 'lucide-react';
import { generateChatResponse, ChatMessage } from '../services/aiService';

interface ChatOverlayProps {
  onClose: () => void;
}

const ChatOverlay: React.FC<ChatOverlayProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'PONS Intelligence Online. What is your query?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'fast' | 'thinking'>('fast');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await generateChatResponse(messages, userMsg.text, mode);
    
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-md h-[90vh] sm:h-[800px] bg-zinc-950 sm:rounded-xl border border-zinc-800 flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-white font-bold text-sm">PONS Analyst</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Mode Toggles */}
        <div className="p-2 border-b border-zinc-800 flex gap-2 bg-zinc-900/50">
           <button 
             onClick={() => setMode('fast')}
             className={`flex-1 py-2 px-3 rounded flex items-center justify-center gap-2 text-xs font-bold transition-all ${mode === 'fast' ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'}`}
           >
              <Zap size={12} fill={mode === 'fast' ? "currentColor" : "none"} />
              FAST RESPONSE
           </button>
           <button 
             onClick={() => setMode('thinking')}
             className={`flex-1 py-2 px-3 rounded flex items-center justify-center gap-2 text-xs font-bold transition-all ${mode === 'thinking' ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'}`}
           >
              <BrainCircuit size={14} />
              DEEP REASONING
           </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
           {messages.map((msg, idx) => (
             <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-zinc-800 text-white rounded-br-none' 
                    : 'bg-blue-900/20 text-blue-100 border border-blue-500/20 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
             </div>
           ))}
           {isLoading && (
             <div className="flex justify-start">
               <div className="bg-zinc-900/50 p-3 rounded-lg flex items-center gap-1">
                 <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
               </div>
             </div>
           )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900">
           <div className="flex items-center gap-2">
             <input 
               type="text" 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               placeholder={mode === 'thinking' ? "Ask a complex strategic question..." : "Ask for a quick definition or status..."}
               className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-zinc-600"
             />
             <button 
               onClick={handleSend}
               disabled={isLoading || !input.trim()}
               className="p-3 bg-white text-zinc-950 rounded-lg font-bold disabled:opacity-50 hover:bg-zinc-200 transition-colors"
             >
               <Send size={18} />
             </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default ChatOverlay;