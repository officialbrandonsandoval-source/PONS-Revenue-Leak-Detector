'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { ArrowLeft, Mic, MicOff } from 'lucide-react';

export default function VoicePage() {
  const router = useRouter();
  const { isManagerMode, isVoiceActive, setVoiceActive, leaks } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      setVoiceActive(false);
    } else {
      setIsListening(true);
      setVoiceActive(true);
      
      // Simulate voice recognition
      setTimeout(() => {
        setTranscript('What are my critical leaks?');
        setTimeout(() => {
          setIsListening(false);
        }, 2000);
      }, 1500);
    }
  };

  const criticalCount = leaks.filter(l => l.severity === 'CRITICAL').length;
  const totalRisk = leaks.reduce((sum, l) => sum + l.estimatedRevenue, 0);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.push('/dashboard')} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        {isManagerMode && (
          <span className="px-3 py-1 bg-amber-500/20 text-amber-500 text-xs rounded-full">
            Manager Mode
          </span>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Voice Orb */}
        <div className="relative mb-8">
          <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ${
            isListening 
              ? 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_0_60px_rgba(59,130,246,0.5)]' 
              : 'bg-gradient-to-br from-gray-700 to-gray-900'
          }`}>
            <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
              isListening 
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 animate-pulse' 
                : 'bg-gradient-to-br from-gray-600 to-gray-800'
            }`}>
              {isListening ? (
                <Mic className="w-12 h-12 text-white" />
              ) : (
                <MicOff className="w-12 h-12 text-gray-400" />
              )}
            </div>
          </div>
          
          {isListening && (
            <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/20" />
          )}
        </div>

        {/* Status Text */}
        <h2 className="text-xl font-semibold text-white mb-2">
          {isListening ? 'Listening...' : 'Tap to Speak'}
        </h2>
        <p className="text-gray-400 text-center mb-8">
          {isListening 
            ? 'Ask about your pipeline, leaks, or what to do next'
            : `${criticalCount} critical leaks • $${(totalRisk/1000).toFixed(0)}k at risk`
          }
        </p>

        {/* Transcript */}
        {transcript && (
          <div className="w-full max-w-sm bg-gray-900/50 rounded-xl p-4 mb-8">
            <p className="text-sm text-gray-400 mb-1">You said:</p>
            <p className="text-white">{transcript}</p>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={toggleListening}
          className={`w-full max-w-sm py-4 rounded-xl font-semibold transition-all ${
            isListening
              ? 'bg-red-600 hover:bg-red-500 text-white'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {isListening ? 'Stop Listening' : 'Start Voice Mode'}
        </button>
      </div>
    </div>
  );
}
