'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { ArrowLeft, Mic, MicOff, Volume2 } from 'lucide-react';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function VoicePage() {
  const router = useRouter();
  const { isManagerMode, setVoiceActive, leaks } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const criticalCount = leaks.filter(l => l.severity === 'CRITICAL').length;
  const highCount = leaks.filter(l => l.severity === 'HIGH').length;
  const totalRisk = leaks.reduce((sum, l) => sum + l.estimatedRevenue, 0);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const current = event.resultIndex;
          const result = event.results[current];
          const transcriptText = result[0].transcript;
          setTranscript(transcriptText);
          
          if (result.isFinal) {
            processCommand(transcriptText);
          }
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setError(`Voice error: ${event.error}`);
          setIsListening(false);
          setVoiceActive(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          setVoiceActive(false);
        };
      } else {
        setIsSupported(false);
        setError('Voice recognition not supported in this browser. Use Chrome or Safari.');
      }

      // Initialize speech synthesis
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [setVoiceActive]);

  // Process voice commands
  const processCommand = useCallback((command: string) => {
    const cmd = command.toLowerCase();
    let responseText = '';

    // Critical leaks query
    if (cmd.includes('critical') || cmd.includes('urgent') || cmd.includes('important')) {
      if (criticalCount > 0) {
        const criticalLeaks = leaks.filter(l => l.severity === 'CRITICAL');
        const topLeak = criticalLeaks[0];
        responseText = `You have ${criticalCount} critical leak${criticalCount > 1 ? 's' : ''}. `;
        responseText += `The top priority is ${topLeak.type.replace(/_/g, ' ')} `;
        responseText += `with ${topLeak.impactedCount} deals at risk, worth $${(topLeak.estimatedRevenue / 1000).toFixed(0)}k.`;
      } else {
        responseText = 'Great news! You have no critical leaks right now.';
      }
    }
    // Total risk query
    else if (cmd.includes('risk') || cmd.includes('money') || cmd.includes('revenue') || cmd.includes('total')) {
      responseText = `Total revenue at risk is $${(totalRisk / 1000).toFixed(0)}k across ${leaks.length} identified leaks. `;
      if (criticalCount > 0) {
        responseText += `${criticalCount} are critical priority.`;
      }
    }
    // What should I do / next action
    else if (cmd.includes('do') || cmd.includes('action') || cmd.includes('next') || cmd.includes('should')) {
      if (criticalCount > 0) {
        const topLeak = leaks.filter(l => l.severity === 'CRITICAL')[0];
        responseText = `Priority action: Address ${topLeak.type.replace(/_/g, ' ')}. `;
        responseText += `${topLeak.recommendedAction}`;
      } else if (highCount > 0) {
        const topLeak = leaks.filter(l => l.severity === 'HIGH')[0];
        responseText = `Focus on ${topLeak.type.replace(/_/g, ' ')}. ${topLeak.recommendedAction}`;
      } else {
        responseText = 'Your pipeline looks healthy. Focus on closing your top opportunities.';
      }
    }
    // Summary / overview
    else if (cmd.includes('summary') || cmd.includes('overview') || cmd.includes('status') || cmd.includes('pipeline')) {
      responseText = `Pipeline status: ${leaks.length} revenue leaks detected totaling $${(totalRisk / 1000).toFixed(0)}k at risk. `;
      responseText += `${criticalCount} critical, ${highCount} high priority. `;
      if (criticalCount > 0) {
        responseText += `Immediate attention required.`;
      } else {
        responseText += `No immediate emergencies.`;
      }
    }
    // Help
    else if (cmd.includes('help') || cmd.includes('what can')) {
      responseText = `You can ask me about critical leaks, total revenue at risk, what action to take next, or get a pipeline summary.`;
    }
    // Default response
    else {
      responseText = `I detected ${leaks.length} leaks worth $${(totalRisk / 1000).toFixed(0)}k. Ask about critical leaks, revenue at risk, or what to do next.`;
    }

    setResponse(responseText);
    speak(responseText);
  }, [leaks, criticalCount, highCount, totalRisk]);

  // Text-to-speech
  const speak = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };

  const toggleListening = () => {
    setError('');
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setVoiceActive(false);
    } else {
      if (!isSupported) {
        setError('Voice not supported. Use Chrome or Safari.');
        return;
      }
      
      setTranscript('');
      setResponse('');
      
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        setVoiceActive(true);
      } catch (err) {
        setError('Could not start voice recognition. Check microphone permissions.');
        console.error(err);
      }
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.push('/dashboard')} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <button onClick={stopSpeaking} className="p-2">
              <Volume2 className="w-5 h-5 text-blue-400 animate-pulse" />
            </button>
          )}
          {isManagerMode && (
            <span className="px-3 py-1 bg-amber-500/20 text-amber-500 text-xs rounded-full">
              Manager Mode
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Voice Orb */}
        <div className="relative mb-8">
          <button
            onClick={toggleListening}
            disabled={!isSupported}
            className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ${
              isListening 
                ? 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_0_60px_rgba(59,130,246,0.5)]' 
                : isSpeaking
                ? 'bg-gradient-to-br from-green-500 to-green-700 shadow-[0_0_60px_rgba(34,197,94,0.5)]'
                : 'bg-gradient-to-br from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800'
            }`}
          >
            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
              isListening 
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 animate-pulse' 
                : isSpeaking
                ? 'bg-gradient-to-br from-green-400 to-green-600 animate-pulse'
                : 'bg-gradient-to-br from-gray-600 to-gray-800'
            }`}>
              {isListening ? (
                <Mic className="w-12 h-12 text-white" />
              ) : isSpeaking ? (
                <Volume2 className="w-12 h-12 text-white" />
              ) : (
                <MicOff className="w-12 h-12 text-gray-400" />
              )}
            </div>
          </button>
          
          {isListening && (
            <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/20" />
          )}
        </div>

        {/* Status Text */}
        <h2 className="text-xl font-semibold text-white mb-2">
          {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Tap to Speak'}
        </h2>
        <p className="text-gray-400 text-center mb-4">
          {isListening 
            ? 'Ask about your pipeline, leaks, or what to do next'
            : `${criticalCount} critical leaks • $${(totalRisk/1000).toFixed(0)}k at risk`
          }
        </p>

        {/* Error */}
        {error && (
          <div className="w-full max-w-sm bg-red-900/30 border border-red-500/50 rounded-xl p-4 mb-4">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Transcript */}
        {transcript && (
          <div className="w-full max-w-sm bg-gray-900/50 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-400 mb-1">You said:</p>
            <p className="text-white">{transcript}</p>
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="w-full max-w-sm bg-blue-900/30 border border-blue-500/30 rounded-xl p-4 mb-8">
            <p className="text-sm text-blue-400 mb-1">PONS:</p>
            <p className="text-white">{response}</p>
          </div>
        )}

        {/* Suggestions */}
        <div className="w-full max-w-sm space-y-2 mb-8">
          <p className="text-xs text-gray-500 text-center mb-2">Try saying:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['What are my critical leaks?', 'Total revenue at risk', 'What should I do next?'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setTranscript(suggestion);
                  processCommand(suggestion);
                }}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-300 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={toggleListening}
          disabled={!isSupported}
          className={`w-full max-w-sm py-4 rounded-xl font-semibold transition-all ${
            !isSupported
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : isListening
              ? 'bg-red-600 hover:bg-red-500 text-white'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {!isSupported ? 'Voice Not Supported' : isListening ? 'Stop Listening' : 'Start Voice Mode'}
        </button>
      </div>
    </div>
  );
}
