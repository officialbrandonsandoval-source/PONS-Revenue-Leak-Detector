'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/store'
import { Mic, X, Zap } from 'lucide-react'

export default function VoicePage() {
  const router = useRouter()
  const { isManagerMode, isVoiceActive, setIsVoiceActive, voiceTranscript, setVoiceTranscript } = useApp()
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('')
        setVoiceTranscript(transcript)
      }
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [setVoiceTranscript])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      recognitionRef.current?.start()
      setIsListening(true)
      setVoiceTranscript('')
    }
  }

  const handleClose = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
    setIsVoiceActive(false)
    router.push('/dashboard')
  }

  return (
    <div className="fixed inset-0 bg-pons-black flex flex-col items-center justify-center safe-area-top safe-area-bottom">
      {/* Manager Mode Badge */}
      {isManagerMode && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2">
          <div className="manager-badge flex items-center gap-2">
            <span className="text-pons-gold">👑</span>
            <span>MANAGER MODE ACTIVE</span>
          </div>
        </div>
      )}

      {/* Voice Orb */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div 
          className={`voice-orb ${isManagerMode ? 'voice-orb-gold' : 'voice-orb-blue'} ${
            isListening ? 'animate-pulse-slow' : ''
          }`}
        >
          <Zap size={48} className="text-white" />
        </div>
        
        <h2 className="text-2xl font-semibold mt-8 text-white">
          {isManagerMode ? 'Executive Intelligence Online' : 'Live Intelligence Active'}
        </h2>
        <p className="text-gray-400 mt-2">
          {isListening ? 'Listening... Speak naturally.' : 'Tap the mic to start'}
        </p>

        {/* Transcript Display */}
        {voiceTranscript && (
          <div className="mt-8 px-6 max-w-sm">
            <p className="text-gray-300 text-center italic">"{voiceTranscript}"</p>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center gap-4 pb-8">
        {/* Mic Button */}
        <button
          onClick={toggleListening}
          className={`w-14 h-14 rounded-full flex items-center justify-center ${
            isListening 
              ? 'bg-pons-gray border-2 border-white' 
              : 'bg-pons-gray border border-gray-700'
          }`}
        >
          <Mic size={24} className={isListening ? 'text-white' : 'text-gray-400'} />
        </button>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="w-14 h-14 rounded-full bg-pons-red-dark flex items-center justify-center"
        >
          <X size={24} className="text-pons-red" />
        </button>
      </div>
    </div>
  )
}
