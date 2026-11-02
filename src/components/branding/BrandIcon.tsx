import React from 'react';

interface BrandIconProps {
  size?: number | string;
  className?: string;
  variant?: 'gradient' | 'monochrome' | 'glow';
}

export const BrandIcon: React.FC<BrandIconProps> = ({
  size = 36,
  className = '',
  variant = 'gradient',
}) => {
  const gradientId = `abrar-grad-${Math.random().toString(36).substr(2, 6)}`;
  const glowId = `abrar-glow-${Math.random().toString(36).substr(2, 6)}`;

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id={gradientId} x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>

          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer squircle frame */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="26"
          fill="#130E26"
          stroke={variant === 'gradient' ? `url(#${gradientId})` : '#A78BFA'}
          strokeWidth="2.5"
          className="transition-all duration-300"
        />

        {/* Ambient subtle back ring */}
        <circle
          cx="50"
          cy="50"
          r="26"
          stroke={variant === 'gradient' ? `url(#${gradientId})` : '#8B5CF6'}
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.4"
        />

        {/* Central Geometric 'A' + Aperture portal */}
        <path
          d="M32 72 L50 26 L68 72"
          stroke={variant === 'gradient' ? `url(#${gradientId})` : '#DDD6FE'}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Horizontal bridge with diamond focus node */}
        <path
          d="M39 56 L61 56"
          stroke={variant === 'gradient' ? `url(#${gradientId})` : '#DDD6FE'}
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Radiant moment spark dots */}
        <circle cx="50" cy="24" r="4.5" fill="#DDD6FE" />
        <circle cx="68" cy="72" r="4" fill="#F472B6" />
        <circle cx="50" cy="46" r="3.5" fill="#C084FC" filter={variant === 'glow' ? `url(#${glowId})` : undefined} />
      </svg>
    </div>
  );
};
