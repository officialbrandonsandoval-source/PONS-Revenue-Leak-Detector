'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { ArrowLeft, Mic, MicOff, Volume2 } from 'lucide-react';
import { getVoiceSummary, runQuickAnalysis } from '@/lib/api';

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
  const { isManagerMode, setVoiceActive, leaks, crmData } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

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
        setError('Voice not supported. Use Chrome or Safari.');
      }

      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (synthRef.current) synthRef.current.cancel();
    };
  }, [setVoiceActive]);

  const processCommand = useCallback(async (command: string) => {
    const cmd = command.toLowerCase();
    setIsProcessing(true);
    let responseText = '';

    try {
      // Use intelligence API for summary/overview commands
      if (cmd.includes('summary') || cmd.includes('overview') || cmd.includes('status') || cmd.includes('pipeline') || cmd.includes('briefing')) {
        if (crmData) {
          const voiceData = await getVoiceSummary({
            leads: crmData.leads,
            opportunities: crmData.opportunities,
            activities: crmData.activities
          });
          responseText = voiceData.text;
        } else {
          responseText = `You have ${leaks.length} revenue leaks totaling $${(totalRisk / 1000).toFixed(0)}k at risk.`;
        }
      }
      // Next action query
      else if (cmd.includes('do') || cmd.includes('action') || cmd.includes('next') || cmd.includes('should') || cmd.includes('priority')) {
        if (crmData) {
          const analysis = await runQuickAnalysis({
            leads: crmData.leads,
            opportunities: crmData.opportunities,
            activities: crmData.activities
          });
          if (analysis.nextAction) {
            responseText = `Priority action: ${analysis.nextAction.title}. ${analysis.nextAction.description}`;
          } else {
            responseText = 'Your pipeline is healthy. Focus on closing your top opportunities.';
          }
        } else if (criticalCount > 0) {
          const topLeak = leaks.filter(l => l.severity === 'CRITICAL')[0];
          responseText = `Priority action: Address ${topLeak.type.replace(/_/g, ' ')}. ${topLeak.recommendedAction}`;
        } else {
          responseText = 'Your pipeline looks healthy. Focus on closing your top opportunities.';
        }
      }
      // Critical leaks query
      else if (cmd.includes('critical') || cmd.includes('urgent') || cmd.includes('important')) {
        if (criticalCount > 0) {
          const criticalLeaks = leaks.filter(l => l.severity === 'CRITICAL');
          const topLeak = criticalLeaks[0];
          responseText = `You have ${criticalCount} critical leak${criticalCount > 1 ? 's' : ''}. `;
          responseText += `Top priority: ${topLeak.title}. ${topLeak.recommendedAction}`;
        } else {
          responseText = 'Great news! No critical leaks detected.';
        }
      }
      // Risk/revenue query
      else if (cmd.includes('risk') || cmd.includes('money') || cmd.includes('revenue') || cmd.includes('total') || cmd.includes('how much')) {
        if (crmData) {
          const analysis = await runQuickAnalysis({
            leads: crmData.leads,
            opportunities: crmData.opportunities,
            activities: crmData.activities
          });
          responseText = `Your pipeline has $${(analysis.pipelineValue / 1000).toFixed(0)}k in active opportunities. `;
          responseText += `$${(totalRisk / 1000).toFixed(0)}k is at risk across ${leaks.length} leaks.`;
        } else {
          responseText = `Total revenue at risk: $${(totalRisk / 1000).toFixed(0)}k across ${leaks.length} leaks.`;
        }
      }
      // Leads query
      else if (cmd.includes('lead') || cmd.includes('hot') || cmd.includes('prospect')) {
        if (crmData) {
          const analysis = await runQuickAnalysis({
            leads: crmData.leads,
            opportunities: crmData.opportunities,
            activities: crmData.activities
          });
          if (analysis.hotLeads > 0) {
            responseText = `You have ${analysis.hotLeads} hot lead${analysis.hotLeads > 1 ? 's' : ''} ready for immediate outreach.`;
          } else {
            responseText = 'No hot leads right now. Focus on nurturing your warm leads.';
          }
        } else {
          responseText = 'Connect your CRM to see lead scoring.';
        }
      }
      // Deals query
      else if (cmd.includes('deal') || cmd.includes('opportunity') || cmd.includes('close')) {
        if (crmData) {
          const analysis = await runQuickAnalysis({
            leads: crmData.leads,
            opportunities: crmData.opportunities,
            activities: crmData.activities
          });
          if (analysis.topDeal) {
            responseText = `Your top deal is ${analysis.topDeal.dealName} worth $${(analysis.topDeal.value / 1000).toFixed(0)}k. `;
            responseText += `${analysis.topDeal.recommendation?.message || 'Keep pushing forward.'}`;
          } else {
            responseText = 'No active deals found.';
          }
        } else {
          responseText = 'Connect your CRM to see deal priorities.';
        }
      }
      // Help
      else if (cmd.includes('help') || cmd.includes('what can')) {
        responseText = 'Ask me for a pipeline summary, critical leaks, next action, hot leads, or top deals.';
      }
      // Default - give summary
      else {
        if (crmData) {
          const voiceData = await getVoiceSummary({
            leads: crmData.leads,
            opportunities: crmData.opportunities,
            activities: crmData.activities
          });
          responseText = voiceData.text;
        } else {
          responseText = `I found ${leaks.length} leaks worth $${(totalRisk / 1000).toFixed(0)}k. Ask about critical leaks, next action, or pipeline summary.`;
        }
      }
    } catch (err) {
      console.error('Voice processing error:', err);
      responseText = `I found ${leaks.length} leaks worth $${(totalRisk / 1000).toFixed(0)}k at risk.`;
    }

    setIsProcessing(false);
    setResponse(responseText);
    speak(responseText);
  }, [leaks, crmData, criticalCount, totalRisk]);

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
        setError('Check microphone permissions.');
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
            <span className="px-3 py-1 bg-amber-500/20 text-amber-500 text-xs rounded-full">Manager</span>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="relative mb-8">
          <button
            onClick={toggleListening}
            disabled={!isSupported || isProcessing}
            className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ${
              isListening 
                ? 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_0_60px_rgba(59,130,246,0.5)]' 
                : isSpeaking
                ? 'bg-gradient-to-br from-green-500 to-green-700 shadow-[0_0_60px_rgba(34,197,94,0.5)]'
                : isProcessing
                ? 'bg-gradient-to-br from-purple-500 to-purple-700 shadow-[0_0_60px_rgba(168,85,247,0.5)]'
                : 'bg-gradient-to-br from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800'
            }`}
          >
            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
              isListening 
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 animate-pulse' 
                : isSpeaking
                ? 'bg-gradient-to-br from-green-400 to-green-600 animate-pulse'
                : isProcessing
                ? 'bg-gradient-to-br from-purple-400 to-purple-600 animate-pulse'
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
          {isListening && <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/20" />}
        </div>

        <h2 className="text-xl font-semibold text-white mb-2">
          {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : isProcessing ? 'Analyzing...' : 'Tap to Speak'}
        </h2>
        <p className="text-gray-400 text-center mb-4">
          {isListening ? 'Ask about pipeline, leaks, or next action' : `${criticalCount} critical • $${(totalRisk/1000).toFixed(0)}k at risk`}
        </p>

        {error && (
          <div className="w-full max-w-sm bg-red-900/30 border border-red-500/50 rounded-xl p-4 mb-4">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {transcript && (
          <div className="w-full max-w-sm bg-gray-900/50 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-400 mb-1">You:</p>
            <p className="text-white">{transcript}</p>
          </div>
        )}

        {response && (
          <div className="w-full max-w-sm bg-purple-900/30 border border-purple-500/30 rounded-xl p-4 mb-8">
            <p className="text-sm text-purple-400 mb-1">PONS:</p>
            <p className="text-white">{response}</p>
          </div>
        )}

        <div className="w-full max-w-sm space-y-2 mb-8">
          <p className="text-xs text-gray-500 text-center mb-2">Try:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['Pipeline summary', 'Next action', 'Hot leads', 'Top deal'].map((s) => (
              <button key={s} onClick={() => { setTranscript(s); processCommand(s); }}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-300 transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>

        <button onClick={toggleListening} disabled={!isSupported || isProcessing}
          className={`w-full max-w-sm py-4 rounded-xl font-semibold transition-all ${
            !isSupported ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : isListening ? 'bg-red-600 hover:bg-red-500 text-white'
              : 'bg-purple-600 hover:bg-purple-500 text-white'
          }`}>
          {!isSupported ? 'Not Supported' : isListening ? 'Stop' : 'Start Voice'}
        </button>
      </div>
    </div>
  );
}
