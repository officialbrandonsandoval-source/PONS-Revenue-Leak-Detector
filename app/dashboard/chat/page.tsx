'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/store'
import { X, Zap, Settings2, Send } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const router = useRouter()
  const { connection, leaks, leakSummary, aiInsights } = useApp()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'PONS Intelligence Online. What is your query?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'fast' | 'deep'>('fast')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response (in production, this calls the PONS API)
    setTimeout(() => {
      const response = generateResponse(userMessage.content, { leaks, leakSummary, aiInsights })
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, mode === 'fast' ? 500 : 1500)
  }

  const handleClose = () => {
    router.push('/dashboard')
  }

  return (
    <div className="fixed inset-0 bg-pons-black flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800 safe-area-top">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-pons-green" />
          <span className="font-semibold">PONS Analyst</span>
        </div>
        <button onClick={handleClose}>
          <X size={24} className="text-gray-400" />
        </button>
      </header>

      {/* Mode Toggle */}
      <div className="flex p-2 gap-2">
        <button
          onClick={() => setMode('fast')}
          className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold ${
            mode === 'fast'
              ? 'bg-pons-blue text-white'
              : 'bg-pons-gray text-gray-400'
          }`}
        >
          <Zap size={16} />
          FAST RESPONSE
        </button>
        <button
          onClick={() => setMode('deep')}
          className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold ${
            mode === 'deep'
              ? 'bg-pons-blue text-white'
              : 'bg-pons-gray text-gray-400'
          }`}
        >
          <Settings2 size={16} />
          DEEP REASONING
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[85%] ${
              message.role === 'user' ? 'ml-auto' : 'mr-auto'
            }`}
          >
            <div
              className={`rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-pons-gray text-white rounded-br-md'
                  : 'bg-pons-blue/20 border border-pons-blue/30 text-white rounded-bl-md'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="max-w-[85%] mr-auto">
            <div className="bg-pons-blue/20 border border-pons-blue/30 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-pons-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-pons-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-pons-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-gray-800 safe-area-bottom">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for a quick definition or status..."
            className="flex-1"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              input.trim() && !isLoading
                ? 'bg-pons-blue text-white'
                : 'bg-pons-gray text-gray-500'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Simple response generator (replace with actual API call)
function generateResponse(
  query: string, 
  context: { leaks: any[]; leakSummary: any; aiInsights: any }
): string {
  const q = query.toLowerCase()
  
  if (q.includes('highest revenue') || q.includes('best action') || q.includes('priority')) {
    if (context.leaks.length > 0) {
      const topLeak = context.leaks[0]
      return `Your highest revenue action today: ${topLeak.title}. ${topLeak.description} Revenue at risk: $${topLeak.revenueAtRisk?.toLocaleString() || 'Unknown'}. Take action immediately.`
    }
    return 'To determine your highest revenue action today, I require access to your sales data, CRM, and transaction logs. Provide access credentials immediately.'
  }
  
  if (q.includes('leak') || q.includes('risk')) {
    if (context.leakSummary) {
      return `Current status: ${context.leakSummary.total} revenue leaks detected. ${context.leakSummary.critical} critical, ${context.leakSummary.high} high priority. Total revenue at risk: $${context.leakSummary.totalRevenueAtRisk?.toLocaleString() || 0}.`
    }
    return 'Run a revenue audit first to detect leaks in your pipeline.'
  }
  
  if (q.includes('health') || q.includes('score')) {
    if (context.aiInsights?.healthScore) {
      return `Pipeline health score: ${context.aiInsights.healthScore}/100. ${context.aiInsights.weeklyFocus || 'Focus on closing stale deals this week.'}`
    }
    return 'Run a revenue audit to calculate your pipeline health score.'
  }
  
  if (q.includes('quick win') || q.includes('easy')) {
    if (context.aiInsights?.quickWins?.length) {
      return `Quick wins available: ${context.aiInsights.quickWins.slice(0, 3).join('. ')}`
    }
    return 'Run a revenue audit to identify quick wins in your pipeline.'
  }
  
  return 'Query received. Specify: revenue actions, leak status, pipeline health, or quick wins. Be direct.'
}
