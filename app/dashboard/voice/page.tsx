'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { ArrowLeft, Mic, MicOff, Volume2, Settings } from 'lucide-react';
import { getVoiceSummary, runQuickAnalysis } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pons-api.vercel.app';

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

const VOICES = [
  { id: 'nova', name: 'Nova', desc: 'Warm female' },
  { id: 'onyx', name: 'Onyx', desc: 'Deep male' },
  { id: 'alloy', name: 'Alloy', desc: 'Neutral' },
  { id: 'shimmer', name: 'Shimmer', desc: 'Bright female' },
];

export default function VoicePage() {
  const router = useRouter();
  const { isManagerMode, setVoiceActive, leaks, crmData } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [showVoiceSelect, setShowVoiceSelect] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const criticalCount = leaks.filter(l => l.severity === 'CRITICAL').length;
  const totalRisk = leaks.reduce((sum, l) => sum + l.estimatedRevenue, 0);

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
          if (result.isFinal) processCommand(transcriptText);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          setError('Voice error: ' + event.error);
          setIsListening(false);
          setVoiceActive(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          setVoiceActive(false);
        };
      } else {
        setIsSupported(false);
        setError('Voice not supported. Use Chrome or Safari.');
      }

      audioRef.current = new Audio();
      audioRef.current.onended = () => setIsSpeaking(false);
      audioRef.current.onerror = () => setIsSpeaking(false);
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, [setVoiceActive]);

  const speak = async (text: string) => {
    try {
      setIsSpeaking(true);
      const res = await fetch(API_URL + '/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: selectedVoice })
      });
      if (!res.ok) throw new Error('Voice failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) { audioRef.current.src = url; await audioRef.current.play(); }
    } catch (err) {
      setIsSpeaking(false);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(text);
        u.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(u);
        setIsSpeaking(true);
      }
    }
  };

  const processCommand = useCallback(async (command: string) => {
    const cmd = command.toLowerCase();
    setIsProcessing(true);
    let responseText = '';

    try {
      if (cmd.includes('summary') || cmd.includes('overview') || cmd.includes('status') || cmd.includes('pipeline')) {
        if (crmData) {
          const data = await getVoiceSummary({ leads: crmData.leads, opportunities: crmData.opportunities, activities: crmData.activities });
          responseText = data.text;
        } else {
          responseText = 'You have ' + leaks.length + ' revenue leaks totaling $' + (totalRisk / 1000).toFixed(0) + 'k at risk.';
        }
      } else if (cmd.includes('action') || cmd.includes('next') || cmd.includes('should') || cmd.includes('do')) {
        if (crmData) {
          const analysis = await runQuickAnalysis({ leads: crmData.leads, opportunities: crmData.opportunities, activities: crmData.activities });
          responseText = analysis.nextAction ? 'Priority action: ' + analysis.nextAction.title + '. ' + analysis.nextAction.description : 'Your pipeline is healthy.';
        } else {
          responseText = criticalCount > 0 ? 'Address your ' + criticalCount + ' critical leaks first.' : 'Your pipeline looks healthy.';
        }
      } else if (cmd.includes('critical') || cmd.includes('urgent')) {
        responseText = criticalCount > 0 ? 'You have ' + criticalCount + ' critical leaks needing immediate attention.' : 'Great news! No critical leaks.';
      } else if (cmd.includes('risk') || cmd.includes('money') || cmd.includes('revenue')) {
        responseText = 'Total revenue at risk: $' + (totalRisk / 1000).toFixed(0) + 'k across ' + leaks.length + ' leaks.';
      } else if (cmd.includes('lead') || cmd.includes('hot')) {
        if (crmData) {
          const analysis = await runQuickAnalysis({ leads: crmData.leads, opportunities: crmData.opportunities, activities: crmData.activities });
          responseText = analysis.hotLeads > 0 ? 'You have ' + analysis.hotLeads + ' hot leads ready for outreach.' : 'No hot leads right now.';
        } else {
          responseText = 'Connect your CRM to see lead scoring.';
        }
      } else if (cmd.includes('deal') || cmd.includes('opportunity')) {
        if (crmData) {
          const analysis = await runQuickAnalysis({ leads: crmData.leads, opportunities: crmData.opportunities, activities: crmData.activities });
          responseText = analysis.topDeal ? 'Your top deal is ' + analysis.topDeal.dealName + ' worth $' + (analysis.topDeal.value / 1000).toFixed(0) + 'k.' : 'No active deals.';
        } else {
          responseText = 'Connect your CRM to see deals.';
        }
      } else if (cmd.includes('help')) {
        responseText = 'Ask me for a pipeline summary, critical leaks, next action, hot leads, or top deals.';
      } else {
        responseText = 'I found ' + leaks.length + ' leaks worth $' + (totalRisk / 1000).toFixed(0) + 'k. Ask about pipeline, actions, or leads.';
      }
    } catch (err) {
      responseText = 'I found ' + leaks.length + ' leaks worth $' + (totalRisk / 1000).toFixed(0) + 'k at risk.';
    }

    setIsProcessing(false);
    setResponse(responseText);
    speak(responseText);
  }, [leaks, crmData, criticalCount, totalRisk, selectedVoice]);

  const toggleListening = () => {
    setError('');
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setVoiceActive(false);
    } else {
      if (!isSupported) { setError('Voice not supported.'); return; }
      setTranscript(''); setResponse('');
      try { recognitionRef.current?.start(); setIsListening(true); setVoiceActive(true); }
      catch (e) { setError('Check microphone permissions.'); }
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <header className="px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.push('/dashboard')} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div className="flex items-center gap-2">
          {isSpeaking && <button onClick={stopSpeaking} className="p-2"><Volume2 className="w-5 h-5 text-purple-400 animate-pulse" /></button>}
          <button onClick={() => setShowVoiceSelect(!showVoiceSelect)} className="p-2"><Settings className="w-5 h-5 text-gray-400" /></button>
        </div>
      </header>

      {showVoiceSelect && (
        <div className="px-4 pb-4">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-xs text-gray-500 mb-3">SELECT VOICE</p>
            <div className="grid grid-cols-2 gap-2">
              {VOICES.map((v) => (
                <button key={v.id} onClick={() => { setSelectedVoice(v.id); setShowVoiceSelect(false); }}
                  className={`p-3 rounded-lg text-left transition-colors ${selectedVoice === v.id ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                  <p className="font-medium text-sm">{v.name}</p>
                  <p className="text-xs opacity-70">{v.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="relative mb-8">
          <button onClick={toggleListening} disabled={!isSupported || isProcessing}
            className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ${
              isListening ? 'bg-gradient-to-br from-purple-500 to-purple-700 shadow-[0_0_60px_rgba(168,85,247,0.5)]' 
              : isSpeaking ? 'bg-gradient-to-br from-green-500 to-green-700 shadow-[0_0_60px_rgba(34,197,94,0.5)]'
              : isProcessing ? 'bg-gradient-to-br from-amber-500 to-amber-700 shadow-[0_0_60px_rgba(245,158,11,0.5)]'
              : 'bg-gradient-to-br from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800'}`}>
            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
              isListening ? 'bg-gradient-to-br from-purple-400 to-purple-600 animate-pulse' 
              : isSpeaking ? 'bg-gradient-to-br from-green-400 to-green-600 animate-pulse'
              : isProcessing ? 'bg-gradient-to-br from-amber-400 to-amber-600 animate-pulse'
              : 'bg-gradient-to-br from-gray-600 to-gray-800'}`}>
              {isListening ? <Mic className="w-12 h-12 text-white" /> : isSpeaking ? <Volume2 className="w-12 h-12 text-white" /> : <MicOff className="w-12 h-12 text-gray-400" />}
            </div>
          </button>
          {isListening && <div className="absolute inset-0 rounded-full animate-ping bg-purple-500/20" />}
        </div>

        <h2 className="text-xl font-semibold text-white mb-2">
          {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : isProcessing ? 'Analyzing...' : 'Tap to Speak'}
        </h2>
        <p className="text-gray-400 text-center mb-1">{isListening ? 'Ask about pipeline, leaks, or actions' : criticalCount + ' critical • $' + (totalRisk/1000).toFixed(0) + 'k at risk'}</p>
        <p className="text-purple-400 text-xs mb-4">Voice: {VOICES.find(v => v.id === selectedVoice)?.name}</p>

        {error && <div className="w-full max-w-sm bg-red-900/30 border border-red-500/50 rounded-xl p-4 mb-4"><p className="text-red-400 text-sm text-center">{error}</p></div>}
        {transcript && <div className="w-full max-w-sm bg-gray-900/50 rounded-xl p-4 mb-4"><p className="text-sm text-gray-400 mb-1">You:</p><p className="text-white">{transcript}</p></div>}
        {response && <div className="w-full max-w-sm bg-purple-900/30 border border-purple-500/30 rounded-xl p-4 mb-8"><p className="text-sm text-purple-400 mb-1">PONS:</p><p className="text-white">{response}</p></div>}

        <div className="w-full max-w-sm space-y-2 mb-8">
          <p className="text-xs text-gray-500 text-center mb-2">Try:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['Pipeline summary', 'Next action', 'Hot leads', 'Top deal'].map((s) => (
              <button key={s} onClick={() => { setTranscript(s); processCommand(s); }} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-300 transition-colors">{s}</button>
            ))}
          </div>
        </div>

        <button onClick={toggleListening} disabled={!isSupported || isProcessing}
          className={`w-full max-w-sm py-4 rounded-xl font-semibold transition-all ${!isSupported ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : isListening ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}>
          {!isSupported ? 'Not Supported' : isListening ? 'Stop' : 'Start Voice'}
        </button>
      </div>
    </div>
  );
}
