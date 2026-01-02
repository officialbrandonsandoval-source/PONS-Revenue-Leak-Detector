'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { ArrowLeft, Send, Zap, Brain } from 'lucide-react';
import { runFullAnalysis, runQuickAnalysis, scoreLeads, prioritizeDeals, getNextBestAction } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const router = useRouter();
  const { leaks, crmData } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isDeepMode, setIsDeepMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const totalRisk = leaks.reduce((sum, l) => sum + l.estimatedRevenue, 0);

  useEffect(() => {
    // Initial greeting
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `I've analyzed your pipeline. ${leaks.length} leaks found, $${(totalRisk / 1000).toFixed(0)}k at risk.\n\nAsk me:\n• What should I focus on?\n• Show my hot leads\n• Prioritize my deals\n• What's my pipeline health?`
    }]);
  }, [leaks.length, totalRisk]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    const query = input.toLowerCase();
    setInput('');
    setLoading(true);

    try {
      let response = '';

      // Full analysis / health / summary
      if (query.includes('health') || query.includes('summary') || query.includes('overview') || query.includes('status')) {
        if (crmData) {
          const analysis = await runFullAnalysis({
            leads: crmData.leads,
            contacts: crmData.contacts,
            opportunities: crmData.opportunities,
            activities: crmData.activities,
            reps: crmData.reps
          });
          
          response = `📊 **Pipeline Health: ${analysis.summary.healthScore}/100**\n\n`;
          response += `• Pipeline Value: $${(analysis.summary.totalPipelineValue / 1000).toFixed(0)}k\n`;
          response += `• Weighted Value: $${(analysis.summary.weightedPipelineValue / 1000).toFixed(0)}k\n`;
          response += `• Revenue at Risk: $${(analysis.summary.revenueAtRisk / 1000).toFixed(0)}k\n`;
          response += `• Active Leaks: ${analysis.summary.leakCount}\n`;
          response += `• Critical Issues: ${analysis.summary.criticalIssues}\n\n`;
          
          if (analysis.insights && analysis.insights.length > 0) {
            response += `**Insights:**\n`;
            analysis.insights.forEach(i => {
              response += `• ${i.message}\n`;
            });
          }
        } else {
          response = `${leaks.length} leaks detected, $${(totalRisk / 1000).toFixed(0)}k at risk. Connect CRM for full analysis.`;
        }
      }
      // Next action / what to do
      else if (query.includes('action') || query.includes('do') || query.includes('focus') || query.includes('priority') || query.includes('next')) {
        if (crmData) {
          const analysis = await runQuickAnalysis({
            leads: crmData.leads,
            opportunities: crmData.opportunities,
            activities: crmData.activities
          });
          
          if (analysis.nextAction) {
            response = `🎯 **Priority Action**\n\n`;
            response += `**${analysis.nextAction.title}**\n`;
            response += `${analysis.nextAction.description}\n\n`;
            response += `• Urgency: ${analysis.nextAction.urgency}\n`;
            response += `• Est. Revenue: $${analysis.nextAction.estimatedRevenue.toLocaleString()}\n`;
            response += `• Time: ${analysis.nextAction.timeToExecute}`;
          } else {
            response = 'No urgent actions. Your pipeline is healthy—focus on closing top deals.';
          }
        } else {
          const topLeak = leaks[0];
          response = topLeak 
            ? `Top priority: ${topLeak.title}\n\n${topLeak.recommendedAction}`
            : 'No actions needed right now.';
        }
      }
      // Lead scoring
      else if (query.includes('lead') || query.includes('hot') || query.includes('prospect') || query.includes('score')) {
        if (crmData && crmData.leads?.length > 0) {
          const result = await scoreLeads({
            leads: crmData.leads,
            activities: crmData.activities
          });
          
          response = `🔥 **Lead Scores**\n\n`;
          response += `Hot: ${result.summary.hot} | Warm: ${result.summary.warm} | Cold: ${result.summary.cold}\n\n`;
          
          const topLeads = result.leads.slice(0, 5);
          if (topLeads.length > 0) {
            response += `**Top Leads:**\n`;
            topLeads.forEach((lead, i) => {
              response += `${i + 1}. **${lead.tier}** (${lead.score}/100) - ${lead.recommendation?.message || 'Follow up'}\n`;
            });
          }
        } else {
          response = 'No leads in the system. Connect your CRM to see lead scores.';
        }
      }
      // Deal prioritization
      else if (query.includes('deal') || query.includes('opportunity') || query.includes('pipeline') || query.includes('close')) {
        if (crmData && crmData.opportunities?.length > 0) {
          const result = await prioritizeDeals({
            opportunities: crmData.opportunities,
            activities: crmData.activities
          });
          
          response = `📈 **Deal Priority**\n\n`;
          response += `Total Pipeline: $${(result.summary.totalPipelineValue / 1000).toFixed(0)}k\n`;
          response += `Weighted: $${(result.summary.weightedPipelineValue / 1000).toFixed(0)}k\n`;
          response += `Urgent: ${result.summary.urgentCount} deals\n\n`;
          
          if (result.focusList && result.focusList.length > 0) {
            response += `**Focus List:**\n`;
            result.focusList.forEach((deal, i) => {
              response += `${i + 1}. **${deal.name}** - $${(deal.value / 1000).toFixed(0)}k (${deal.urgency}) → ${deal.action}\n`;
            });
          }
        } else {
          response = 'No deals in the system. Connect your CRM to see priorities.';
        }
      }
      // Critical / urgent leaks
      else if (query.includes('critical') || query.includes('urgent') || query.includes('leak') || query.includes('risk')) {
        const criticalLeaks = leaks.filter(l => l.severity === 'CRITICAL');
        const highLeaks = leaks.filter(l => l.severity === 'HIGH');
        
        response = `⚠️ **Revenue Leaks**\n\n`;
        response += `Total: ${leaks.length} leaks ($${(totalRisk / 1000).toFixed(0)}k at risk)\n`;
        response += `Critical: ${criticalLeaks.length} | High: ${highLeaks.length}\n\n`;
        
        if (criticalLeaks.length > 0) {
          response += `**Critical Issues:**\n`;
          criticalLeaks.slice(0, 3).forEach(l => {
            response += `• ${l.title}: ${l.recommendedAction}\n`;
          });
        } else if (highLeaks.length > 0) {
          response += `**High Priority:**\n`;
          highLeaks.slice(0, 3).forEach(l => {
            response += `• ${l.title}: ${l.recommendedAction}\n`;
          });
        } else {
          response += 'No critical issues! 🎉';
        }
      }
      // Default
      else {
        if (crmData) {
          const analysis = await runQuickAnalysis({
            leads: crmData.leads,
            opportunities: crmData.opportunities,
            activities: crmData.activities
          });
          
          response = `Pipeline: $${(analysis.pipelineValue / 1000).toFixed(0)}k\n`;
          response += `Hot Leads: ${analysis.hotLeads}\n`;
          if (analysis.topDeal) {
            response += `Top Deal: ${analysis.topDeal.dealName} ($${(analysis.topDeal.value / 1000).toFixed(0)}k)\n`;
          }
          response += `\nAsk me about leads, deals, actions, or pipeline health.`;
        } else {
          response = `${leaks.length} leaks, $${(totalRisk / 1000).toFixed(0)}k at risk.\n\nTry: "What should I focus on?" or "Show my deals"`;
        }
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Try asking again.'
      }]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <header className="sticky top-0 bg-black/90 backdrop-blur-sm border-b border-gray-800 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="font-semibold text-white">PONS Intelligence</h1>
              <p className="text-xs text-gray-500">Revenue Analysis</p>
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              message.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-100'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 bg-black border-t border-gray-800 p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about pipeline, leads, deals..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-3 bg-purple-600 rounded-xl text-white disabled:opacity-50 hover:bg-purple-500 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
