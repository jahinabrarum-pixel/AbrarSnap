import React from 'react';
import { BrandIcon } from './BrandIcon';

interface LoadingScreenProps {
  message?: string;
  fullscreen?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Connecting to AbrarSnap...',
  fullscreen = true,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-6 p-6 select-none">
      <div className="relative">
        {/* Pulsing halo */}
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-purple-600/30 blur-xl animate-pulse" />
        <BrandIcon size={56} variant="glow" className="relative z-10 animate-bounce duration-1000" />
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          <p className="text-sm font-semibold tracking-wide text-purple-200/90 font-['Space_Grotesk']">
            {message}
          </p>
        </div>
        <div className="w-32 h-1 bg-purple-950/80 rounded-full overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full animate-ring-pulse origin-left" />
        </div>
      </div>
    </div>
  );

  if (!fullscreen) {
    return <div className="py-16 flex items-center justify-center">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0813] text-white">
      {content}
    </div>
  );
};
