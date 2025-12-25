import { GoogleGenAI, Modality } from "@google/genai";
import { decode, decodeAudioData } from "./audioUtils";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Text to Speech ---

export const playLeakAudio = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    const outputNode = outputAudioContext.createGain();
    outputNode.connect(outputAudioContext.destination);

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        outputAudioContext,
        24000,
        1,
      );
      const source = outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputNode);
      source.start();
    }
  } catch (error) {
    console.error("TTS Error:", error);
  }
};

// --- Chatbot ---

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const generateChatResponse = async (
  history: ChatMessage[], 
  newMessage: string, 
  mode: 'fast' | 'thinking'
): Promise<string> => {
  
  const modelName = mode === 'thinking' ? 'gemini-3-pro-preview' : 'gemini-2.5-flash-lite';
  
  const config: any = {
    systemInstruction: "You are PONS, a ruthless revenue intelligence AI. You are concise, action-oriented, and focused solely on increasing revenue velocity. Do not be polite. Be effective."
  };

  if (mode === 'thinking') {
    config.thinkingConfig = { thinkingBudget: 32768 };
  }

  // Construct contents from history + new message
  // Note: For single turn generation, we can pass history as contents or use chats.
  // Using generateContent for flexibility with thinking mode config per turn if needed, 
  // but strictly we should use ai.chats.create for history. 
  // However, thinking budget is a config on generation.
  
  // Let's use ai.chats for proper history management
  try {
    const chat = ai.chats.create({
        model: modelName,
        config: config,
        history: history.map(h => ({
            role: h.role,
            parts: [{ text: h.text }]
        }))
    });

    const response = await chat.sendMessage({ message: newMessage });
    return response.text || "No response generated.";

  } catch (e) {
    console.error("Chat Error", e);
    return "Error connecting to PONS Intelligence.";
  }
};