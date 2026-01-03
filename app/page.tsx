'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TrendingUp, Zap, Brain, Mic, ArrowRight, CheckCircle2 } from 'lucide-react';

const FEATURES = [
  { icon: Brain, title: 'Revenue Leak Detection', desc: 'AI finds money slipping through your pipeline' },
  { icon: TrendingUp, title: 'Deal Prioritization', desc: 'Know which deals to close first for max ROI' },
  { icon: Zap, title: 'Lead Scoring', desc: 'Instantly rank leads by close probability' },
  { icon: Mic, title: 'Voice Assistant', desc: 'Ask PONS anything about your pipeline' },
];

const BENEFITS = [
  'Detect stale deals before they die',
  'Prioritize high-value opportunities',
  'Score leads in real-time',
  'Get next-best-action recommendations',
  'Works with any CRM',
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0f0a1a]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Image src="/logo.svg" alt="PONS" width={120} height={40} priority />
        <button onClick={() => router.push('/connect')}
          className="px-5 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-500 transition-colors">
          Get Started
        </button>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-16 pb-24 max-w-4xl mx-auto text-center">
        <div className="inline-block px-4 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm mb-6">
          Revenue Intelligence for Sales Teams
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Stop Losing Deals.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-400">
            Start Closing Faster.
          </span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          PONS detects revenue leaks in your pipeline, prioritizes your best deals, and tells you exactly what to do next.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => router.push('/connect')}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-lg">
            Try Demo Free <ArrowRight className="w-5 h-5" />
          </button>
          <button onClick={() => router.push('/connect')}
            className="px-8 py-4 border border-gray-700 text-gray-300 font-medium rounded-xl hover:border-purple-500 hover:text-white transition-colors text-lg">
            Connect Your CRM
          </button>
        </div>
        <p className="text-gray-500 text-sm mt-4">Works with HubSpot, Salesforce, Pipedrive, GoHighLevel, Zoho</p>
      </section>

      {/* Features */}
      <section className="px-6 py-20 bg-black/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Revenue Intelligence That Works</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            PONS analyzes your CRM data and delivers actionable insights in seconds.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-purple-500/50 transition-colors">
                <f.icon className="w-10 h-10 text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-6">Your Pipeline Has Leaks.<br />PONS Finds Them.</h2>
            <ul className="space-y-4">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <button onClick={() => router.push('/connect')}
              className="mt-8 px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-500 transition-colors">
              Start Free →
            </button>
          </div>
          <div className="flex-1 p-8 bg-gradient-to-br from-purple-900/30 to-gray-900 border border-purple-500/20 rounded-2xl">
            <div className="text-sm text-purple-400 mb-2">PONS INSIGHT</div>
            <div className="text-2xl font-bold text-white mb-4">$127,500 at risk</div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Stale deals (30+ days)</span>
                <span className="text-red-400">3 deals</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Missing follow-ups</span>
                <span className="text-amber-400">5 contacts</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Hot leads waiting</span>
                <span className="text-green-400">2 ready</span>
              </div>
            </div>
            <div className="mt-6 p-3 bg-purple-600/20 border border-purple-500/30 rounded-lg">
              <div className="text-xs text-purple-400 mb-1">NEXT BEST ACTION</div>
              <div className="text-white text-sm">Call TechStart - deal at risk, no contact in 14 days</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-gradient-to-b from-transparent to-purple-900/20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Stop Losing Revenue?</h2>
          <p className="text-gray-400 mb-8">Connect your CRM in 30 seconds. See your first insights in under a minute.</p>
          <button onClick={() => router.push('/connect')}
            className="px-10 py-4 bg-gradient-to-r from-purple-600 to-amber-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity text-lg">
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Image src="/logo.svg" alt="PONS" width={80} height={30} />
          <p className="text-gray-500 text-sm">© 2026 PONS Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
