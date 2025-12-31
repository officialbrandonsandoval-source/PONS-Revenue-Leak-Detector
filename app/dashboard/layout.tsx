'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/store'
import { Crown, User, MessageSquare, Mic } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { connection, isManagerMode, setIsVoiceActive } = useApp()

  // Redirect to connect if no connection
  useEffect(() => {
    if (!connection?.connected) {
      router.push('/')
    }
  }, [connection, router])

  if (!connection?.connected) {
    return null
  }

  return (
    <div className="min-h-screen bg-pons-black flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 safe-area-top">
        <h1 className="pons-logo text-2xl">PONS</h1>
        <div className="flex items-center gap-2">
          {/* Manager Mode Badge */}
          <button 
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isManagerMode 
                ? 'bg-pons-gold/20 text-pons-gold' 
                : 'bg-pons-gray text-gray-400'
            }`}
          >
            <Crown size={18} />
          </button>
          {/* Profile */}
          <button className="w-10 h-10 rounded-full bg-pons-gray flex items-center justify-center text-gray-400">
            <User size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="flex items-center justify-end gap-3 px-4 py-4 safe-area-bottom">
        {/* Chat Button */}
        <button 
          onClick={() => router.push('/dashboard/chat')}
          className="w-14 h-14 rounded-full bg-pons-gray border border-gray-700 flex items-center justify-center text-white"
        >
          <MessageSquare size={22} />
        </button>
        {/* Voice Button */}
        <button 
          onClick={() => router.push('/dashboard/voice')}
          className="w-14 h-14 rounded-full bg-pons-blue flex items-center justify-center text-white glow-blue"
        >
          <Mic size={22} />
        </button>
      </nav>
    </div>
  )
}
