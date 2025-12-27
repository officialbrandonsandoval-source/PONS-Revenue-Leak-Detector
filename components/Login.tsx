import React, { useState } from 'react';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import { login } from '../services/authService';
import { setAuthToken } from '../services/apiClient';
import { BrandLogo } from './BrandLogo';
import toast from 'react-hot-toast';

interface LoginProps {
  onAuthenticated: () => void;
}

const Login: React.FC<LoginProps> = ({ onAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password || isLoading) return;
    setIsLoading(true);
    try {
      const result = await login(email, password);
      setAuthToken(result.token);
      toast.success('Login successful');
      onAuthenticated();
    } catch (error) {
      console.error('Login error', error);
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="max-w-sm w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <BrandLogo className="h-8 w-auto mb-6 text-white" />
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 ring-1 ring-blue-500/20">
            <Lock className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Sign in</h1>
          <p className="text-zinc-500 text-sm mb-6">Access your revenue intelligence dashboard.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 block">Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all placeholder:text-zinc-700"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 block">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all placeholder:text-zinc-700"
            />
          </div>
        </div>

        <button 
          onClick={handleLogin}
          disabled={!email || !password || isLoading}
          className="mt-6 w-full bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Continue <ArrowRight size={16} />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => toast('Password reset coming soon.', { icon: '🔒' })}
          className="mt-4 w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Forgot password?
        </button>
      </div>
    </div>
  );
};

export default Login;
