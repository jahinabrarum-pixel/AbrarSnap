import React from 'react';
import { Logo } from '../components/branding/Logo';
import { BrandIcon } from '../components/branding/BrandIcon';
import { Sparkles, ArrowRight, Shield, Clapperboard, Heart, MessageSquare } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreGuest: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onExploreGuest }) => {
  return (
    <div className="min-h-screen bg-[#0B0813] text-white flex flex-col selection:bg-purple-500/30">
      {/* Background radial glowing ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-600/15 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-pink-600/15 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <Logo size="md" />
        <div className="flex items-center gap-4">
          <button
            onClick={onExploreGuest}
            className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold text-purple-200/80 hover:text-white transition-colors cursor-pointer"
          >
            Explore Feed
          </button>
          <button
            onClick={onGetStarted}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/25 active:scale-95 transition-all cursor-pointer"
          >
            Enter Platform
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-12 lg:py-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        <div className="flex-1 flex flex-col items-start text-left gap-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-xs font-semibold text-purple-300">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>AbrarSnap Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-['Space_Grotesk'] tracking-tight leading-[1.1]">
            Capture moments.{' '}
            <span className="bg-gradient-to-r from-purple-300 via-pink-400 to-rose-400 bg-clip-text text-transparent">
              Create your world.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-purple-200/70 max-w-xl font-normal leading-relaxed">
            The next generation of creative visual storytelling. Original aesthetic minimalism, 24-hour stories, short-form reels, and real-time private discussions with zero algorithmic clutter.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onGetStarted}
              className="px-7 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreGuest}
              className="px-6 py-3.5 rounded-full bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/30 text-purple-200 hover:text-white font-semibold text-sm transition-all cursor-pointer"
            >
              Explore Feed
            </button>
          </div>
        </div>

        {/* Hero Brand Visual Showcase */}
        <div className="flex-1 w-full max-w-md lg:max-w-none relative">
          <div className="relative mx-auto max-w-md p-8 rounded-3xl bg-gradient-to-b from-[#1C1635] to-[#120E22] border border-purple-500/30 shadow-2xl shadow-purple-950/80 flex flex-col items-center text-center gap-6">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-purple-600/40 via-pink-600/40 to-purple-600/40 blur-2xl animate-pulse" />
              <BrandIcon size={80} variant="glow" className="relative z-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white font-['Space_Grotesk']">
                AbrarSnap
              </h3>
              <p className="text-xs text-purple-200/70 max-w-xs leading-relaxed">
                Connect your account to share photos, publish short reels, post ephemeral stories, and engage in real-time community chat.
              </p>
            </div>

            <button
              onClick={onGetStarted}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      </main>

      {/* Feature Highlights Grid */}
      <section className="relative z-10 border-t border-purple-900/30 bg-[#0E0A1A]/80 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-3xl bg-purple-950/20 border border-purple-500/15 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
              Aesthetic Minimalism
            </h3>
            <p className="text-xs text-purple-200/70 leading-relaxed">
              Designed with a Midnight Violet palette, soft glassmorphism, and zero visual clutter to keep focus purely on artistic moments.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-purple-950/20 border border-purple-500/15 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-600/20 flex items-center justify-center text-pink-400">
              <Clapperboard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
              Reels & 24h Stories
            </h3>
            <p className="text-xs text-purple-200/70 leading-relaxed">
              Express spontaneous ideas through ephemeral 24-hour stories with rotating gradient rings, and full-screen vertical cinematic video reels.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-purple-950/20 border border-purple-500/15 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
              Real Firebase Backend
            </h3>
            <p className="text-xs text-purple-200/70 leading-relaxed">
              Backed by Google Cloud Firestore and Firebase Authentication with hardened ABAC security rules, real-time sync, and admin moderation.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 border-t border-purple-900/30 text-center text-xs text-purple-300/40">
        <p>AbrarSnap • Capture moments. Create your world. • Built for visionary creators.</p>
      </footer>
    </div>
  );
};
