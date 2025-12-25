import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { createPcmBlob, decode, decodeAudioData } from '../services/audioUtils';
import { getPipelineAnalytics } from '../services/auditService';
import { X, Mic, MicOff, Zap, Crown } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface LiveSessionProps {
  onClose: () => void;
  isManagerMode?: boolean;
}

// Tool Definition for Manager Mode
const pipelineTool: FunctionDeclaration = {
  name: 'get_pipeline_analytics',
  description: 'Get real-time quantitative data about pipeline performance, revenue leaks, deal stages, and high-value opportunities.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  }
};

const LiveSession: React.FC<LiveSessionProps> = ({ onClose, isManagerMode = false }) => {
  const [status, setStatus] = useState<'CONNECTING' | 'ACTIVE' | 'ERROR'>('CONNECTING');
  const [isMuted, setIsMuted] = useState(false);
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const isMutedRef = useRef(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    let mounted = true;

    const startSession = async () => {
      try {
        const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        
        inputContextRef.current = inputAudioContext;
        audioContextRef.current = outputAudioContext;
        
        const outputNode = outputAudioContext.createGain();
        outputNode.connect(outputAudioContext.destination);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        
        // Configure System Instruction based on mode
        const systemInstruction = isManagerMode 
          ? "You are PONS Executive Mode, a high-level revenue strategist. You have access to real-time pipeline data via tools. Answer questions about team performance, revenue at risk, and strategic bottlenecks concisely. Start by confirming you have accessed the management data layer."
          : "You are a specialized Revenue Intelligence Officer. Your goal is to help the sales leader find revenue leaks. Be brief, professional, and dense with information. Do not use filler words. You are speaking to a busy executive.";

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          callbacks: {
            onopen: () => {
              if (mounted) setStatus('ACTIVE');
              
              // Input Stream Setup
              const source = inputAudioContext.createMediaStreamSource(stream);
              const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                if (isMutedRef.current) {
                  return;
                }
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const pcmBlob = createPcmBlob(inputData);
                sessionPromise.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };
              
              source.connect(scriptProcessor);
              const inputGain = inputAudioContext.createGain();
              inputGain.gain.value = 0;
              scriptProcessor.connect(inputGain);
              inputGain.connect(inputAudioContext.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
              // 1. Handle Tool Calling (Manager Mode)
              if (message.toolCall) {
                console.log("Tool called:", message.toolCall);
                const responses = message.toolCall.functionCalls.map(fc => {
                   if (fc.name === 'get_pipeline_analytics') {
                      const data = getPipelineAnalytics();
                      return {
                         id: fc.id,
                         name: fc.name,
                         response: { result: JSON.stringify(data) }
                      };
                   }
                   return { id: fc.id, name: fc.name, response: { error: 'Unknown function' }};
                });
                
                sessionPromise.then(session => {
                   session.sendToolResponse({ functionResponses: responses });
                });
              }

              // 2. Handle Audio Output
              const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              
              if (base64Audio) {
                const ctx = audioContextRef.current;
                if (!ctx) return;

                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                const audioBuffer = await decodeAudioData(
                  decode(base64Audio),
                  ctx,
                  24000,
                  1
                );
                
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputNode);
                source.addEventListener('ended', () => {
                   sourcesRef.current.delete(source);
                });
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
              }

              // 3. Handle Interruption
              if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(src => {
                   try { src.stop(); } catch(e) {}
                   sourcesRef.current.delete(src);
                });
                nextStartTimeRef.current = 0;
              }
            },
            onclose: () => {
                console.log("Session closed");
            },
            onerror: (e) => {
                console.error("Live API Error", e);
                if (mounted) setStatus('ERROR');
            }
          },
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: systemInstruction,
            // Only attach tools if in Manager Mode
            tools: isManagerMode ? [{ functionDeclarations: [pipelineTool] }] : undefined,
          }
        });
        
        sessionRef.current = sessionPromise;

      } catch (err) {
        console.error("Failed to start session", err);
        if (mounted) setStatus('ERROR');
      }
    };

    startSession();

    return () => {
      mounted = false;
      // Cleanup
      if (sessionRef.current) {
        sessionRef.current.then((s: any) => s.close());
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (inputContextRef.current) inputContextRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [isManagerMode]);

  // Visual Theme Colors
  const activeColor = isManagerMode ? 'text-amber-400' : 'text-blue-500';
  const shadowColor = isManagerMode ? 'shadow-amber-500/40' : 'shadow-blue-600/30';
  const glowColor = isManagerMode ? 'bg-amber-500/20' : 'bg-blue-600/20';
  const pulseColor = isManagerMode ? 'bg-amber-400' : 'bg-blue-500';

  return (
    <div className="fixed inset-0 z-[60] bg-zinc-950 flex flex-col items-center justify-center animate-in fade-in duration-300">
      
      {/* Mode Badge */}
      {isManagerMode && (
         <div className="absolute top-12 px-4 py-1.5 bg-amber-900/30 border border-amber-600/30 rounded-full flex items-center gap-2 mb-8">
            <Crown size={14} className="text-amber-400" />
            <span className="text-[10px] uppercase font-bold text-amber-100 tracking-widest">Manager Mode Active</span>
         </div>
      )}

      {/* Visualizer / Status Indicator */}
      <div className="relative">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${status === 'ACTIVE' ? `${glowColor} shadow-[0_0_50px_rgba(0,0,0,0)] ${shadowColor}` : 'bg-zinc-900'}`}>
             <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-1000 ${status === 'ACTIVE' ? `${pulseColor} animate-pulse` : 'bg-zinc-800'}`}>
                 <Zap className={`w-10 h-10 ${status === 'ACTIVE' ? 'text-white' : 'text-zinc-600'}`} fill={status === 'ACTIVE' ? 'currentColor' : 'none'} />
             </div>
        </div>
      </div>

      <div className="mt-8 text-center space-y-2">
        <h3 className="text-2xl font-bold text-white tracking-tight">
            {status === 'CONNECTING' && "Establishing Secure Line..."}
            {status === 'ACTIVE' && (isManagerMode ? "Executive Intelligence Online" : "Live Intelligence Active")}
            {status === 'ERROR' && "Connection Failed"}
        </h3>
        <p className="text-zinc-500 text-sm">
            {status === 'ACTIVE' ? "Listening... Speak naturally." : "Please wait."}
        </p>
      </div>

      <div className="absolute bottom-12 flex items-center gap-6">
         <button 
           onClick={() => setIsMuted(!isMuted)}
           className="p-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
         >
           {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
         </button>
         
         <button 
           onClick={onClose}
           className="p-4 rounded-full bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
         >
            <X size={24} />
         </button>
      </div>

    </div>
  );
};

export default LiveSession;
