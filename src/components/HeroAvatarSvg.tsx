import React, { useState } from 'react';
import { HeroDefinition } from '../game/types';

interface HeroAvatarSvgProps {
  hero: HeroDefinition;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClassBadge?: boolean;
  variant?: 'framed' | 'battle' | 'icon';
}

const SIZE_CLASSES = {
  sm: 'w-10 h-10',
  md: 'w-13 h-13',
  lg: 'w-18 h-18',
  xl: 'w-24 h-24',
  full: 'w-full h-full',
};

export const HeroAvatarSvg: React.FC<HeroAvatarSvgProps> = ({
  hero,
  size = 'md',
  variant = 'framed',
}) => {
  const [imgError, setImgError] = useState(false);
  const { primaryColor, secondaryColor, accentColor } = hero.visual;

  const src =
    variant === 'battle'
      ? hero.battleUrl || `/assets/heroes/${hero.id}_battle.webp`
      : variant === 'icon'
        ? hero.iconUrl || `/assets/heroes/${hero.id}_icon.webp`
        : hero.framedUrl || `/assets/heroes/${hero.id}_framed.webp`;

  if (!imgError) {
    return (
      <div
        className={`relative ${SIZE_CLASSES[size]} shrink-0 flex items-center justify-center select-none overflow-hidden`}
        title={`${hero.name} — ${hero.title}`}
      >
        <img
          src={src}
          alt={hero.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          className={`w-full h-full ${
            size === 'full' ? 'object-cover scale-110' : 'object-contain'
          } drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]`}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative ${SIZE_CLASSES[size]} rounded-lg overflow-hidden border border-[#c69d53]/70 bg-[#0b0e17] shrink-0 shadow-inner select-none`}
    >
      <svg
        viewBox="0 0 64 64"
        className="w-full h-full block"
        aria-label={hero.name}
      >
        <defs>
          <radialGradient id={`bg_${hero.id}`} cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.45" />
            <stop offset="65%" stopColor={secondaryColor} stopOpacity="0.92" />
            <stop offset="100%" stopColor="#070a12" stopOpacity="1" />
          </radialGradient>
        </defs>
        <rect width="64" height="64" fill={`url(#bg_${hero.id})`} />
        <circle
          cx="32"
          cy="29"
          r="12"
          fill="#1e293b"
          stroke={accentColor}
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};
