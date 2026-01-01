'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { ArrowLeft, Send, Zap, Brain } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const router = useRouter();
  const { leaks } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `I've analyzed your pipeline and found ${leaks.length} revenue leaks totaling $${leaks.reduce((sum, l) => sum + l.estimatedRevenue, 0).toLocaleString()} at risk. What would you like to know?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isDeepMode, setIsDeepMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const criticalLeaks = leaks.filter(l => l.severity === 'CRITICAL');
      const highLeaks = leaks.filter(l => l.severity === 'HIGH');
      
      let response = '';
      if (input.toLowerCase().includes('critical') || input.toLowerCase().includes('urgent')) {
        response = criticalLeaks.length > 0 
          ? `You have ${criticalLeaks.length} critical issues:\n\n${criticalLeaks.map(l => `• ${l.title}: ${l.description}`).join('\n\n')}\n\nI recommend addressing these immediately.`
          : 'No critical leaks detected. Your highest priority items are in the HIGH category.';
      } else if (input.toLowerCase().includes('action') || input.toLowerCase().includes('do')) {
        const topLeak = leaks[0];
        response = topLeak 
          ? `Your top priority: ${topLeak.title}\n\n${topLeak.description}\n\nRecommended action: ${topLeak.recommendedAction}`
          : 'No immediate actions required. Your pipeline looks healthy.';
      } else {
        response = `Based on my analysis:\n\n• ${leaks.length} total leaks detected\n• ${criticalLeaks.length} critical, ${highLeaks.length} high priority\n• $${leaks.reduce((sum, l) => sum + l.estimatedRevenue, 0).toLocaleString()} total revenue at risk\n\nAsk me about specific leaks or what actions to take.`;
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response
      }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-black/90 backdrop-blur-sm border-b border-gray-800 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="font-semibold text-white">PONS Analyst</h1>
              <p className="text-xs text-gray-500">AI Revenue Intelligence</p>
            </div>
          </div>
          <button
            onClick={() => setIsDeepMode(!isDeepMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
              isDeepMode ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            {isDeepMode ? <Brain className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
            {isDeepMode ? 'Deep' : 'Fast'}
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-black border-t border-gray-800 p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your pipeline..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-3 bg-blue-600 rounded-xl text-white disabled:opacity-50 hover:bg-blue-500 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
