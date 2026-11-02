import React, { useState } from 'react';
import { Logo } from '../components/branding/Logo';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
  onExploreGuest: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, onExploreGuest }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmail(email.trim(), password);
      } else {
        if (!username.trim() || !displayName.trim()) {
          throw new Error('Please enter your username and display name.');
        }
        await signUpWithEmail(email.trim(), password, username.trim(), displayName.trim());
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Google sign in encountered an issue.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setErrorMsg('Please enter your email above to receive a reset link.');
      return;
    }
    try {
      await sendPasswordReset(email.trim());
      setResetSent(true);
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send password reset email.');
    }
  };


  return (
    <div className="min-h-screen bg-[#0B0813] text-white flex flex-col items-center justify-center p-4 selection:bg-purple-500/30">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-purple-600/15 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-pink-600/15 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-[#120E22]/90 backdrop-blur-2xl border border-purple-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/70 flex flex-col gap-6">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center gap-2">
          <Logo size="lg" />
          <p className="text-xs text-purple-200/60 font-medium">
            Capture moments. Create your world.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-2xl bg-purple-950/40 border border-purple-800/30">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-purple-300/60 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-purple-300/60 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Google Authentication Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-[0.98] shadow-md"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-purple-900/30" />
          <span className="text-[11px] text-purple-300/40 uppercase tracking-wider">or with email</span>
          <div className="flex-1 h-px bg-purple-900/30" />
        </div>

        {/* Error / Success Feedback */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {resetSent && (
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Password reset instructions sent to your email.</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="text-[11px] font-semibold text-purple-200/80 mb-1 block">
                  Display Name
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-purple-950/40 border border-purple-800/30 rounded-2xl focus-within:border-purple-500">
                  <User className="w-4 h-4 text-purple-400 shrink-0" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Abrar Jahin"
                    className="w-full bg-transparent text-xs text-white placeholder-purple-300/40 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-purple-200/80 mb-1 block">
                  Username (@handle)
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-purple-950/40 border border-purple-800/30 rounded-2xl focus-within:border-purple-500">
                  <span className="text-xs text-purple-400">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="username"
                    className="w-full bg-transparent text-xs text-white placeholder-purple-300/40 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-[11px] font-semibold text-purple-200/80 mb-1 block">
              Email Address
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-purple-950/40 border border-purple-800/30 rounded-2xl focus-within:border-purple-500">
              <Mail className="w-4 h-4 text-purple-400 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-transparent text-xs text-white placeholder-purple-300/40 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-purple-200/80">
                Password
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-[11px] text-pink-400 hover:underline cursor-pointer"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-purple-950/40 border border-purple-800/30 rounded-2xl focus-within:border-purple-500">
              <Lock className="w-4 h-4 text-purple-400 shrink-0" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-xs text-white placeholder-purple-300/40 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {loading
              ? 'Authenticating...'
              : mode === 'login'
              ? 'Sign In to AbrarSnap'
              : 'Create Account & Begin'}
          </button>
        </form>
      </div>
    </div>
  );
};
