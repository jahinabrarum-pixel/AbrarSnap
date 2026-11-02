import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccentColor, ThemeMode } from '../types';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  accentColor: AccentColor;
  setAccentColor: (accent: AccentColor) => void;
  getAccentClasses: () => {
    gradient: string;
    text: string;
    bg: string;
    border: string;
    glow: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('abrarsnap_theme') as ThemeMode;
    return saved || 'dark';
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const saved = localStorage.getItem('abrarsnap_accent') as AccentColor;
    return saved || 'violet';
  });

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('abrarsnap_theme', mode);
  };

  const setAccentColor = (accent: AccentColor) => {
    setAccentColorState(accent);
    localStorage.setItem('abrarsnap_accent', accent);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [theme]);

  const getAccentClasses = () => {
    switch (accentColor) {
      case 'cyan':
        return {
          gradient: 'from-cyan-500 to-blue-600',
          text: 'text-cyan-400',
          bg: 'bg-cyan-500',
          border: 'border-cyan-500/30',
          glow: 'shadow-cyan-500/30',
        };
      case 'emerald':
        return {
          gradient: 'from-emerald-400 to-teal-600',
          text: 'text-emerald-400',
          bg: 'bg-emerald-500',
          border: 'border-emerald-500/30',
          glow: 'shadow-emerald-500/30',
        };
      case 'rose':
        return {
          gradient: 'from-pink-500 to-rose-600',
          text: 'text-rose-400',
          bg: 'bg-rose-500',
          border: 'border-rose-500/30',
          glow: 'shadow-rose-500/30',
        };
      case 'amber':
        return {
          gradient: 'from-amber-400 to-orange-500',
          text: 'text-amber-400',
          bg: 'bg-amber-500',
          border: 'border-amber-500/30',
          glow: 'shadow-amber-500/30',
        };
      case 'violet':
      default:
        return {
          gradient: 'from-purple-500 via-purple-600 to-pink-500',
          text: 'text-purple-400',
          bg: 'bg-purple-600',
          border: 'border-purple-500/30',
          glow: 'shadow-purple-500/30',
        };
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        accentColor,
        setAccentColor,
        getAccentClasses,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
