import React from 'react';
import { BrandIcon } from './BrandIcon';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  iconOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
  iconOnly = false,
}) => {
  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 46,
    xl: 60,
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  if (iconOnly) {
    return <BrandIcon size={iconSizes[size]} className={className} />;
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <BrandIcon size={iconSizes[size]} />
      <div className="flex flex-col">
        <div className="flex items-center tracking-tight font-extrabold font-['Space_Grotesk'] leading-none">
          <span className="text-white">Abrar</span>
          <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            Snap
          </span>
          <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
        </div>
        {showTagline && (
          <span className="text-[11px] font-medium tracking-wider text-purple-300/70 mt-1 uppercase">
            Capture moments. Create your world.
          </span>
        )}
      </div>
    </div>
  );
};
