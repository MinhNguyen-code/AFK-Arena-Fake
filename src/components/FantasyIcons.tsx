import React from 'react';

export interface FantasyIconProps {
  className?: string;
  active?: boolean;
  disabled?: boolean;
}

/**
 * ============================================================================
 * CLASSIC AFK ARENA — FANTASY RPG ICON & CONTAINER DESIGN SYSTEM
 * ============================================================================
 * Built with:
 * - Thick carved dark-umbrian silhouettes (#1a0e06)
 * - Multi-stop metallic gold, aged bronze, warm parchment & jewel gradients
 * - Top-left specular bevel highlights & bottom-right recessed shadows
 * - Distinct Active (Radiant Gold/Ivory) vs Inactive (Aged Bronze/Sepia) states
 */

// ============================================================================
// 0. REUSABLE ICON CONTAINERS & NOTIFICATION BADGE
// ============================================================================

export const IconSysNotificationBadge: React.FC<{
  count?: number;
  className?: string;
}> = ({ count, className = '' }) => (
  <span
    className={`inline-flex items-center justify-center min-w-[15px] h-[15px] px-1 rounded-full bg-gradient-to-b from-[#ff6b4a] via-[#e11d1d] to-[#880808] border border-[#fde68a] text-[8.5px] font-black text-white shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-none select-none ${className}`}
  >
    {count !== undefined ? count : '!'}
  </span>
);

export const FantasyIconFrame: React.FC<{
  variant?: 'medallion' | 'shield' | 'plate';
  state?: 'default' | 'active' | 'inactive' | 'disabled';
  badge?: boolean | number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}> = ({
  variant = 'plate',
  state = 'default',
  badge,
  size = 'md',
  className = '',
  children,
}) => {
  const sizeCls =
    size === 'sm'
      ? 'w-6 h-6'
      : size === 'lg'
        ? 'w-11 h-11'
        : 'w-8 h-8';

  const shapeCls =
    variant === 'medallion'
      ? 'rounded-full'
      : variant === 'shield'
        ? 'rounded-t-lg rounded-b-2xl'
        : 'rounded-lg';

  const stateCls =
    state === 'active'
      ? 'bg-gradient-to-b from-[#f7d996] via-[#d89e43] to-[#875318] border-[#fff3c4] shadow-[0_0_12px_rgba(250,204,21,0.65)]'
      : state === 'disabled'
        ? 'bg-[#1c140e] border-[#574534] opacity-50 grayscale'
        : state === 'inactive'
          ? 'bg-gradient-to-b from-[#2b1a0e] to-[#160c06] border-[#78532a] opacity-85'
          : 'bg-gradient-to-b from-[#3b2412] via-[#26160a] to-[#170c05] border-[#b8893e] shadow-[inset_0_1px_1px_rgba(255,235,179,0.28),0_2px_6px_rgba(0,0,0,0.85)]';

  return (
    <div
      className={`relative inline-flex items-center justify-center border ${sizeCls} ${shapeCls} ${stateCls} ${className}`}
    >
      {badge !== undefined && badge !== false && (
        <IconSysNotificationBadge
          count={typeof badge === 'number' ? badge : undefined}
          className="absolute -top-1.5 -right-1.5 z-20"
        />
      )}
      {children}
    </div>
  );
};

// ============================================================================
// 1. BOTTOM NAVIGATION ICONS (Authentic Classic AFK Arena Silhouettes)
// ============================================================================

/**
 * 1.1 Ranhorn / Home — Medieval Twin-Tower Crenelated Castle Gatehouse
 * Matches Classic AFK Arena's "Ranhorn" bottom-left icon.
 */
export const IconNavRanhorn: React.FC<FantasyIconProps> = ({
  className = 'w-8 h-8',
  active = false,
  disabled = false,
}) => (
  <svg
    viewBox="0 0 44 44"
    className={`${className} overflow-visible select-none ${disabled ? 'opacity-45 grayscale' : ''}`}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id={active ? 'rnWallAct' : 'rnWallInact'} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={active ? '#fff9e6' : '#e6caa0'} />
        <stop offset="50%" stopColor={active ? '#f6c453' : '#b88642'} />
        <stop offset="100%" stopColor={active ? '#9e5f19' : '#633d15'} />
      </linearGradient>
      <linearGradient id={active ? 'rnRoofAct' : 'rnRoofInact'} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={active ? '#fde047' : '#d49b4b'} />
        <stop offset="100%" stopColor={active ? '#b45309' : '#5c3412'} />
      </linearGradient>
    </defs>
    {/* Carved Pedestal Base */}
    <ellipse
      cx="22"
      cy="38"
      rx="17"
      ry="3.5"
      fill="#1a0e06"
      stroke={active ? '#fef08a' : '#8c622b'}
      strokeWidth="1.5"
    />
    {/* Left & Right Crenelated Bastion Towers */}
    <path
      d="M5,16 L8,16 L8,19 L10.5,19 L10.5,16 L13.5,16 L13.5,36 L5,36 Z"
      fill={`url(#${active ? 'rnWallAct' : 'rnWallInact'})`}
      stroke="#1e1007"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M30.5,16 L33.5,16 L33.5,19 L36,19 L36,16 L39,16 L39,36 L30.5,36 Z"
      fill={`url(#${active ? 'rnWallAct' : 'rnWallInact'})`}
      stroke="#1e1007"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Tower Conical Spires */}
    <polygon
      points="4,16 9.2,6.5 14.5,16"
      fill={`url(#${active ? 'rnRoofAct' : 'rnRoofInact'})`}
      stroke="#1e1007"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <polygon
      points="29.5,16 34.8,6.5 40,16"
      fill={`url(#${active ? 'rnRoofAct' : 'rnRoofInact'})`}
      stroke="#1e1007"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Central Keep Gatehouse */}
    <path
      d="M12,14 L15.5,14 L15.5,17 L19.5,17 L19.5,14 L24.5,14 L24.5,17 L28.5,17 L28.5,14 L32,14 L32,37 L12,37 Z"
      fill={`url(#${active ? 'rnWallAct' : 'rnWallInact'})`}
      stroke="#1e1007"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    {/* Central High Royal Roof */}
    <polygon
      points="13,14 22,3.5 31,14"
      fill={`url(#${active ? 'rnRoofAct' : 'rnRoofInact'})`}
      stroke="#1e1007"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Top Specular Highlight Line */}
    <path d="M15,20 L29,20" stroke={active ? '#ffffff' : '#f3d9a4'} strokeWidth="1.2" opacity="0.65" />
    {/* Arched Portcullis Gate */}
    <path
      d="M17,37 L17,26 A5,5 0 0,1 27,26 L27,37 Z"
      fill={active ? '#3b1d0a' : '#1c0e05'}
      stroke={active ? '#fde047' : '#a37435'}
      strokeWidth="1.6"
    />
    {/* Portcullis Lattice */}
    <path d="M22,22 L22,37 M17.5,31 L26.5,31" stroke={active ? '#facc15' : '#785021'} strokeWidth="1.3" />
  </svg>
);

/**
 * 1.2 Dark Forest / Rừng Đen — Unfurled Ancient Adventure Parchment Scroll & Forest Sigil
 * Matches Classic AFK Arena's "Dark Forest / Forêt Noire" scroll icon.
 */
export const IconNavDarkForest: React.FC<FantasyIconProps> = ({
  className = 'w-8 h-8',
  active = false,
  disabled = false,
}) => (
  <svg
    viewBox="0 0 44 44"
    className={`${className} overflow-visible select-none ${disabled ? 'opacity-45 grayscale' : ''}`}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id={active ? 'dfScrollAct' : 'dfScrollInact'} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={active ? '#fffbeb' : '#ebd5b3'} />
        <stop offset="55%" stopColor={active ? '#f7d07a' : '#be955b'} />
        <stop offset="100%" stopColor={active ? '#b87624' : '#6e491f'} />
      </linearGradient>
    </defs>
    {/* Top Rolled Scroll Cylinder */}
    <rect
      x="6"
      y="5"
      width="30"
      height="5.5"
      rx="2.7"
      fill={active ? '#d97706' : '#7c4a19'}
      stroke="#1e1007"
      strokeWidth="2"
    />
    <circle cx="8" cy="7.7" r="2.2" fill="#fde047" stroke="#1e1007" strokeWidth="1.2" />
    {/* Curved Parchment Sheet */}
    <path
      d="M9,9.5 L33,9.5 C35,17 32,26 34,35 L10,35 C8,26 11,17 9,9.5 Z"
      fill={`url(#${active ? 'dfScrollAct' : 'dfScrollInact'})`}
      stroke="#1e1007"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    {/* Bottom Rolled Scroll Cylinder */}
    <rect
      x="7"
      y="33"
      width="31"
      height="6"
      rx="3"
      fill={active ? '#b45309' : '#633912'}
      stroke="#1e1007"
      strokeWidth="2"
    />
    <circle cx="35.5" cy="36" r="2.3" fill="#fde047" stroke="#1e1007" strokeWidth="1.2" />
    {/* Engraved Mystic Forest Tree / Swirl Sigil on Parchment */}
    <polygon
      points="21.5,13 28.5,23 24.5,23 27.5,29 15.5,29 18.5,23 14.5,23"
      fill={active ? '#15803d' : '#3f5228'}
      stroke={active ? '#fef08a' : '#3b230e'}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    {/* Scroll Edge Specular Highlight */}
    <path d="M12,12 L12,31" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
  </svg>
);

/**
 * 1.3 Campaign — Winged Imperial Golden Crown & Heraldic Shield Crest
 * Matches Classic AFK Arena's "Campaign / Campagne" golden winged shield-crown icon.
 */
export const IconNavCampaign: React.FC<FantasyIconProps> = ({
  className = 'w-8 h-8',
  active = false,
  disabled = false,
}) => (
  <svg
    viewBox="0 0 44 44"
    className={`${className} overflow-visible select-none ${disabled ? 'opacity-45 grayscale' : ''}`}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id={active ? 'cpGoldAct' : 'cpGoldInact'} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={active ? '#fffbeb' : '#edd5a8'} />
        <stop offset="45%" stopColor={active ? '#facc15' : '#c28e42'} />
        <stop offset="100%" stopColor={active ? '#9a5812' : '#593511'} />
      </linearGradient>
    </defs>
    {/* Left & Right Heraldic Wings */}
    <path
      d="M12,26 C4,23 2,14 6,8 C8,13 11,16 15,17 Z"
      fill={`url(#${active ? 'cpGoldAct' : 'cpGoldInact'})`}
      stroke="#1e1007"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M32,26 C40,23 42,14 38,8 C36,13 33,16 29,17 Z"
      fill={`url(#${active ? 'cpGoldAct' : 'cpGoldInact'})`}
      stroke="#1e1007"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Central Carved Heater Shield */}
    <path
      d="M11,13 L33,13 L33,24 C33,32 22,39 22,39 C22,39 11,32 11,24 Z"
      fill={`url(#${active ? 'cpGoldAct' : 'cpGoldInact'})`}
      stroke="#1e1007"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    {/* Shield Inner Recessed Field */}
    <path
      d="M14.5,16.5 L29.5,16.5 L29.5,23.5 C29.5,29 22,34.5 22,34.5 C22,34.5 14.5,29 14.5,23.5 Z"
      fill={active ? '#991b1b' : '#4a2510'}
      stroke={active ? '#fef08a' : '#b8893e'}
      strokeWidth="1.3"
    />
    {/* Sovereign 3-Peak Crown Crest on Top */}
    <polygon
      points="11,14 13,6 18,11 22,4 26,11 31,6 33,14"
      fill={`url(#${active ? 'cpGoldAct' : 'cpGoldInact'})`}
      stroke="#1e1007"
      strokeWidth="1.9"
      strokeLinejoin="round"
    />
    {/* Vertical Broadsword / Sunburst Emblem in Shield Center */}
    <polygon
      points="22,18 24.2,23.5 29,25 24.2,26.5 22,32 19.8,26.5 15,25 19.8,23.5"
      fill={active ? '#fef08a' : '#e5c178'}
    />
  </svg>
);

/**
 * 1.4 Battle / Chiến Đấu — Crossed Royal Greatswords & Crimson Sunburst Crest
 */
export const IconNavBattle: React.FC<FantasyIconProps> = ({
  className = 'w-8 h-8',
  active = false,
  disabled = false,
}) => (
  <svg
    viewBox="0 0 44 44"
    className={`${className} overflow-visible select-none ${disabled ? 'opacity-45 grayscale' : ''}`}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id={active ? 'btGoldAct' : 'btGoldInact'} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={active ? '#fffbeb' : '#f3dba8'} />
        <stop offset="50%" stopColor={active ? '#facc15' : '#ca8a04'} />
        <stop offset="100%" stopColor={active ? '#92400e' : '#5c3410'} />
      </linearGradient>
    </defs>
    {/* Crossed Greatswords Behind Shield */}
    <path d="M6,7 L38,38 M32,29 L39,36" stroke="#1e1007" strokeWidth="5" strokeLinecap="round" />
    <path d="M6,7 L38,38" stroke={active ? '#fffbeb' : '#d6c4a0'} strokeWidth="2.8" strokeLinecap="round" />
    <path d="M38,7 L6,38 M12,29 L5,36" stroke="#1e1007" strokeWidth="5" strokeLinecap="round" />
    <path d="M38,7 L6,38" stroke={active ? '#fffbeb' : '#d6c4a0'} strokeWidth="2.8" strokeLinecap="round" />
    {/* Ornate Heater Shield */}
    <path
      d="M11,10 L33,10 L33,23 C33,31.5 22,38.5 22,38.5 C22,38.5 11,31.5 11,23 Z"
      fill={`url(#${active ? 'btGoldAct' : 'btGoldInact'})`}
      stroke="#1e1007"
      strokeWidth="2.3"
      strokeLinejoin="round"
    />
    <path
      d="M14.5,13.5 L29.5,13.5 L29.5,22.5 C29.5,28.5 22,34 22,34 C22,34 14.5,28.5 14.5,22.5 Z"
      fill={active ? '#dc2626' : '#6b1d1d'}
      stroke="#fef08a"
      strokeWidth="1.3"
    />
    {/* Radiant Star */}
    <polygon
      points="22,16 24.2,21.5 29.5,23.5 24.2,25.5 22,31 19.8,25.5 14.5,23.5 19.8,21.5"
      fill="#fef08a"
    />
  </svg>
);

/**
 * 1.5 Heroes — Plumed Medieval Knight Greathelm with Visor Slits
 * Matches Classic AFK Arena's "Heroes / Héros" knight helmet icon.
 */
export const IconNavHeroes: React.FC<FantasyIconProps> = ({
  className = 'w-8 h-8',
  active = false,
  disabled = false,
}) => (
  <svg
    viewBox="0 0 44 44"
    className={`${className} overflow-visible select-none ${disabled ? 'opacity-45 grayscale' : ''}`}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id={active ? 'hrHelmAct' : 'hrHelmInact'} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={active ? '#fffbeb' : '#ebd5ae'} />
        <stop offset="50%" stopColor={active ? '#f5b83d' : '#b88238'} />
        <stop offset="100%" stopColor={active ? '#854611' : '#54300e'} />
      </linearGradient>
    </defs>
    {/* Sweeping Feathered Crest Plume at Top-Right */}
    <path
      d="M20,9 C22,3 32,2 37,8 C33,10 35,15 29,15 Z"
      fill={active ? '#f59e0b' : '#9a5b1a'}
      stroke="#1e1007"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M17,11 C18,5 26,4 31,9"
      fill="none"
      stroke={active ? '#fef08a' : '#d6b072'}
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Greathelm Skull & Angled Visor Faceplate */}
    <path
      d="M11,16 C11,9 29,9 31,17 L33,29 L21,38 L10,30 Z"
      fill={`url(#${active ? 'hrHelmAct' : 'hrHelmInact'})`}
      stroke="#1e1007"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    {/* Visor Brow Plate & Vertical Center Ridge */}
    <path
      d="M10,21 L22,24 L33,20"
      fill="none"
      stroke="#1e1007"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    <path d="M21.5,12 L21.5,37" stroke="#1e1007" strokeWidth="2.2" />
    {/* Glowing Eye Slits */}
    <polygon points="13,18 19.5,20 19.5,22 13,20.5" fill={active ? '#fef08a' : '#261408'} />
    <polygon points="29.5,18 23.5,20 23.5,22 29.5,20.5" fill={active ? '#fef08a' : '#261408'} />
    {/* Breathing Holes on Cheek */}
    <circle cx="26" cy="27" r="1.1" fill="#1e1007" />
    <circle cx="29" cy="26" r="1.1" fill="#1e1007" />
    <circle cx="26" cy="30.5" r="1.1" fill="#1e1007" />
  </svg>
);

/**
 * 1.6 Formation / Đội Hình — Royal Heraldic War Banner & 5-Position Tactical Crest
 */
export const IconNavFormation: React.FC<FantasyIconProps> = ({
  className = 'w-8 h-8',
  active = false,
  disabled = false,
}) => (
  <svg
    viewBox="0 0 44 44"
    className={`${className} overflow-visible select-none ${disabled ? 'opacity-45 grayscale' : ''}`}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id={active ? 'fmBanAct' : 'fmBanInact'} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={active ? '#f59e0b' : '#9a5b1d'} />
        <stop offset="55%" stopColor={active ? '#b45309' : '#6e3b10'} />
        <stop offset="100%" stopColor="#3b1a06" />
      </linearGradient>
    </defs>
    {/* Carved Golden Banner Crossbar & Finials */}
    <rect
      x="5"
      y="6"
      width="34"
      height="4.5"
      rx="2.2"
      fill={active ? '#fde047' : '#b8863b'}
      stroke="#1e1007"
      strokeWidth="2"
    />
    {/* Hanging Swallowtail War Standard */}
    <path
      d="M9,10.5 L35,10.5 L35,36 L22,30 L9,36 Z"
      fill={`url(#${active ? 'fmBanAct' : 'fmBanInact'})`}
      stroke={active ? '#fef08a' : '#c69d53'}
      strokeWidth="2.1"
      strokeLinejoin="round"
    />
    {/* 5 Tactical Formation Nodes (3 Backline + 2 Frontline) */}
    <circle cx="16" cy="16.5" r="2.4" fill="#fef08a" stroke="#1e1007" strokeWidth="1.2" />
    <circle cx="16" cy="22.5" r="2.4" fill="#fef08a" stroke="#1e1007" strokeWidth="1.2" />
    <circle cx="16" cy="28.5" r="2.4" fill="#fef08a" stroke="#1e1007" strokeWidth="1.2" />
    <circle cx="27.5" cy="19" r="2.8" fill={active ? '#4ade80' : '#eab308'} stroke="#1e1007" strokeWidth="1.3" />
    <circle cx="27.5" cy="26" r="2.8" fill={active ? '#4ade80' : '#eab308'} stroke="#1e1007" strokeWidth="1.3" />
  </svg>
);

/**
 * 1.7 Tavern — Jewel-Encrusted Golden Goblet / Summon Chalice
 */
export const IconNavTavern: React.FC<FantasyIconProps> = ({
  className = 'w-8 h-8',
  active = false,
  disabled = false,
}) => (
  <svg
    viewBox="0 0 44 44"
    className={`${className} overflow-visible select-none ${disabled ? 'opacity-45 grayscale' : ''}`}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id={active ? 'tvGoldAct' : 'tvGoldInact'} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={active ? '#fffbeb' : '#ebd4a7'} />
        <stop offset="45%" stopColor={active ? '#facc15' : '#bf8b3b'} />
        <stop offset="100%" stopColor={active ? '#92400e' : '#57340e'} />
      </linearGradient>
    </defs>
    {/* Ornate Twin Scroll Handles */}
    <path
      d="M12,12 C5,12 5,23 13,23 M32,12 C39,12 39,23 31,23"
      fill="none"
      stroke={active ? '#fde047' : '#a87932'}
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Stepped Chalice Foot & Stem */}
    <path
      d="M12,38 L32,38 L28,33 L16,33 Z"
      fill={`url(#${active ? 'tvGoldAct' : 'tvGoldInact'})`}
      stroke="#1e1007"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <rect
      x="19.5"
      y="25.5"
      width="5"
      height="8"
      rx="1"
      fill={`url(#${active ? 'tvGoldAct' : 'tvGoldInact'})`}
      stroke="#1e1007"
      strokeWidth="1.8"
    />
    {/* Goblet Bowl */}
    <path
      d="M10,8 L34,8 C34,20 29,26.5 22,26.5 C15,26.5 10,20 10,8 Z"
      fill={`url(#${active ? 'tvGoldAct' : 'tvGoldInact'})`}
      stroke="#1e1007"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    {/* Rim Highlight & Center Ruby Gem */}
    <ellipse cx="22" cy="8.5" rx="11" ry="2" fill="#fffbeb" opacity="0.7" />
    <polygon
      points="22,12.5 25.8,17.5 22,22.5 18.2,17.5"
      fill={active ? '#f43f5e' : '#9f1239'}
      stroke="#fef08a"
      strokeWidth="1.4"
    />
  </svg>
);

// ============================================================================
// 2. UTILITY ICONS (Bag, Mail, Guild, Quests, Events, Settings, Friends, Library)
// ============================================================================

/** Bag — Leather Adventurer Satchel with Gold Buckle & Straps */
export const IconUtilBag: React.FC<FantasyIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 32 32" className={`${className} select-none`} aria-hidden="true">
    <defs>
      <linearGradient id="bagLeather" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#d97706" />
        <stop offset="55%" stopColor="#92400e" />
        <stop offset="100%" stopColor="#451a03" />
      </linearGradient>
    </defs>
    {/* Top Cinched Neck */}
    <path d="M11,8 L21,8 L19,12 L13,12 Z" fill="#b45309" stroke="#1c1008" strokeWidth="1.8" />
    {/* Plump Satchel Body */}
    <path
      d="M10,10 C10,6 22,6 22,10 L26,15 C27.5,22 25,28 16,28 C7,28 4.5,22 6,15 Z"
      fill="url(#bagLeather)"
      stroke="#1c1008"
      strokeWidth="2.1"
      strokeLinejoin="round"
    />
    {/* Flap & Golden Clasp Buckle */}
    <path d="M7.5,15 Q16,20.5 24.5,15" fill="none" stroke="#fde047" strokeWidth="2.2" />
    <rect x="13" y="15" width="6" height="6.5" rx="1.5" fill="#facc15" stroke="#1c1008" strokeWidth="1.6" />
    <circle cx="16" cy="18.2" r="1.2" fill="#451a03" />
  </svg>
);

/** Quests — Rolled Parchment Decree Scroll with Wax Seal */
export const IconUtilQuests: React.FC<FantasyIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 32 32" className={`${className} select-none`} aria-hidden="true">
    <rect x="5" y="4" width="20" height="4" rx="2" fill="#b45309" stroke="#1c1008" strokeWidth="1.6" />
    <rect x="7" y="6.5" width="16" height="19" rx="1.5" fill="#fef3c7" stroke="#1c1008" strokeWidth="2" />
    <rect x="5" y="24" width="20" height="4" rx="2" fill="#92400e" stroke="#1c1008" strokeWidth="1.6" />
    <path d="M10,11.5 L20,11.5 M10,15.5 L20,15.5 M10,19.5 L16,19.5" stroke="#78350f" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="21.5" cy="21.5" r="4.8" fill="#dc2626" stroke="#fde047" strokeWidth="1.5" />
    <polygon points="21.5,18.8 22.8,21.5 21.5,24.2 20.2,21.5" fill="#fef08a" />
  </svg>
);

/** Events — Royal Tournament Swallowtail Banner & Sunburst Star */
export const IconUtilEvents: React.FC<FantasyIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 32 32" className={`${className} select-none`} aria-hidden="true">
    <rect x="4" y="4" width="24" height="3.5" rx="1.5" fill="#fde047" stroke="#1c1008" strokeWidth="1.6" />
    <path
      d="M7,7.5 L25,7.5 L25,28 L16,22.5 L7,28 Z"
      fill="#dc2626"
      stroke="#fde047"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <polygon
      points="16,9.5 18,14 23,14.5 19.2,17.8 20.2,22.5 16,19.8 11.8,22.5 12.8,17.8 9,14.5 14,14"
      fill="#fef08a"
      stroke="#78350f"
      strokeWidth="0.9"
    />
  </svg>
);

/** Guild — Crown-Crested Heraldic Shield Emblem */
export const IconUtilGuild: React.FC<FantasyIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 32 32" className={`${className} select-none`} aria-hidden="true">
    <path
      d="M6,6 L26,6 L26,17 C26,24 16,29 16,29 C16,29 6,24 6,17 Z"
      fill="#eab308"
      stroke="#1c1008"
      strokeWidth="2.1"
      strokeLinejoin="round"
    />
    <path
      d="M9.5,9.5 L22.5,9.5 L22.5,16.5 C22.5,21.5 16,25 16,25 C16,25 9.5,21.5 9.5,16.5 Z"
      fill="#7c2d12"
      stroke="#fef08a"
      strokeWidth="1.2"
    />
    <polygon points="10.5,18.5 12,12 16,15.5 20,12 21.5,18.5" fill="#fde047" stroke="#1c1008" strokeWidth="1" strokeLinejoin="round" />
  </svg>
);

/** Mail — Wax-Sealed Parchment Envelope with Golden Trim */
export const IconUtilMail: React.FC<FantasyIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 32 32" className={`${className} select-none`} aria-hidden="true">
    <rect x="3" y="7" width="26" height="18" rx="2.5" fill="#fde68a" stroke="#1c1008" strokeWidth="2.1" />
    <path d="M4,8 L16,17.5 L28,8" fill="#f59e0b" stroke="#78350f" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="16" cy="17.5" r="4" fill="#dc2626" stroke="#fef08a" strokeWidth="1.4" />
  </svg>
);

/** Settings — Carved Bronze Astrolabe Gear Wheel with Jewel Hub */
export const IconUtilSettings: React.FC<FantasyIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 32 32" className={`${className} select-none`} aria-hidden="true">
    <path
      d="M16,2.5 L16,29.5 M2.5,16 L29.5,16 M6.5,6.5 L25.5,25.5 M25.5,6.5 L6.5,25.5"
      stroke="#fde047"
      strokeWidth="4.2"
      strokeLinecap="round"
    />
    <circle cx="16" cy="16" r="9.5" fill="#d97706" stroke="#1c1008" strokeWidth="2.2" />
    <circle cx="16" cy="16" r="4.5" fill="#29160a" stroke="#fef08a" strokeWidth="1.8" />
  </svg>
);

/** Friends — Twin Golden Adventurer Chalice / Companion Shields */
export const IconUtilFriends: React.FC<FantasyIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 32 32" className={`${className} select-none`} aria-hidden="true">
    <circle cx="11.5" cy="11" r="4.5" fill="#fde047" stroke="#1c1008" strokeWidth="1.8" />
    <circle cx="21.5" cy="11.5" r="4" fill="#f59e0b" stroke="#1c1008" strokeWidth="1.8" />
    <path d="M4.5,26 C4.5,18.5 18.5,18.5 18.5,26 Z" fill="#eab308" stroke="#1c1008" strokeWidth="2" />
    <path d="M15.5,26 C15.5,19.5 27.5,19.5 27.5,26 Z" fill="#d97706" stroke="#1c1008" strokeWidth="1.8" />
  </svg>
);

/** Library — Gold-Bound Arcane Grimoire Tome */
export const IconUtilLibrary: React.FC<FantasyIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 32 32" className={`${className} select-none`} aria-hidden="true">
    <path
      d="M4,7 Q10.5,4.5 16,8 Q21.5,4.5 28,7 L28,25 Q21.5,22.5 16,26 Q10.5,22.5 4,25 Z"
      fill="#fef3c7"
      stroke="#1c1008"
      strokeWidth="2.1"
      strokeLinejoin="round"
    />
    <path d="M16,8 L16,26" stroke="#92400e" strokeWidth="2.4" />
    <path d="M16,24 L19,29 L16,27.5 L13,29 Z" fill="#dc2626" />
  </svg>
);

/** Audio — Royal Herald Horn */
export const IconUtilAudio: React.FC<{ muted?: boolean; className?: string }> = ({
  muted = false,
  className = 'w-4 h-4',
}) => (
  <svg viewBox="0 0 28 28" className={`${className} select-none`} aria-hidden="true">
    <path
      d="M5,11 L10,11 L17,5 L17,23 L10,17 L5,17 Z"
      fill={muted ? '#9ca3af' : '#fde047'}
      stroke="#1c1008"
      strokeWidth="1.9"
      strokeLinejoin="round"
    />
    {muted ? (
      <path d="M20,10 L25,18 M25,10 L20,18" stroke="#ef4444" strokeWidth="2.6" strokeLinecap="round" />
    ) : (
      <path d="M20,9 Q24,14 20,19 M22.5,6.5 Q27.5,14 22.5,21.5" fill="none" stroke="#fde047" strokeWidth="2.1" strokeLinecap="round" />
    )}
  </svg>
);

// ============================================================================
// 3. RESOURCE ICONS (Gold, Diamonds, Hero Essence/Dust, Summon Scroll, AFK Chest)
// ============================================================================

/** Gold — Beveled Sovereign Gold Coin with 4-Point Star */
export const IconResGoldCoin: React.FC<FantasyIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={`${className} select-none`} aria-hidden="true">
    <circle cx="12" cy="12" r="10.2" fill="#eab308" stroke="#1c1008" strokeWidth="2" />
    <circle cx="12" cy="12" r="7.5" fill="#facc15" stroke="#92400e" strokeWidth="1.3" />
    <polygon points="12,6 14.3,10.2 18,12 14.3,13.8 12,18 9.7,13.8 6,12 9.7,10.2" fill="#fffbeb" />
  </svg>
);

/** Diamonds — Multi-Faceted Radiant Sky-Blue Gem */
export const IconResDiamond: React.FC<FantasyIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={`${className} select-none`} aria-hidden="true">
    <polygon
      points="12,2 21.5,9 12,22 2.5,9"
      fill="#38bdf8"
      stroke="#1c1008"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <polygon points="12,2 17,9 12,22 7,9" fill="#bae6fd" opacity="0.8" />
    <polygon points="7,9 12,4.2 17,9" fill="#ffffff" opacity="0.95" />
  </svg>
);

/** Hero Essence / Dust — Glowing Violet/Azure Arcane Essence Orb */
export const IconResHeroExp: React.FC<FantasyIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={`${className} select-none`} aria-hidden="true">
    <circle cx="12" cy="12" r="9.8" fill="#a855f7" stroke="#1c1008" strokeWidth="2" />
    <circle cx="12" cy="12" r="6.5" fill="#e9d5ff" opacity="0.8" />
    <circle cx="9.2" cy="9.2" r="2.4" fill="#ffffff" />
  </svg>
);

/** Tickets / Summon Resources — Ribbon-Bound Arcane Summon Scroll */
export const IconResScroll: React.FC<FantasyIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={`${className} select-none`} aria-hidden="true">
    <rect x="4" y="2.5" width="16" height="3.2" rx="1.5" fill="#d97706" stroke="#1c1008" strokeWidth="1.5" />
    <rect x="6" y="5.5" width="12" height="13" fill="#fef3c7" stroke="#1c1008" strokeWidth="1.7" />
    <rect x="4" y="18.2" width="16" height="3.2" rx="1.5" fill="#d97706" stroke="#1c1008" strokeWidth="1.5" />
    <polygon points="12,8 14.5,12 12,16 9.5,12" fill="#9333ea" stroke="#fde047" strokeWidth="0.9" />
  </svg>
);

/** AFK Reward Chest — Iron-and-Gold Banded Treasure Chest */
export const IconResAfkChest: React.FC<FantasyIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={`${className} select-none`} aria-hidden="true">
    <path d="M2.5,10 C2.5,5 21.5,5 21.5,10 L21.5,20.5 L2.5,20.5 Z" fill="#92400e" stroke="#1c1008" strokeWidth="2" />
    <path d="M2.5,11.5 L21.5,11.5" stroke="#fde047" strokeWidth="2.8" />
    <rect x="9.5" y="9" width="5" height="5.5" rx="1.2" fill="#fef08a" stroke="#1c1008" strokeWidth="1.5" />
  </svg>
);

// ============================================================================
// 4. SMALL SYSTEM ICONS (Lock, Check, Warning, Upgrade, Star, Plus, Back, Close, Info, CombatFist)
// ============================================================================

/** Combat Power Fist Emblem */
export const IconSysCombatFist: React.FC<FantasyIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={`${className} select-none`} aria-hidden="true">
    <path
      d="M5.5,10 C5.5,6 8.5,4.5 12,4.5 C15.8,4.5 19,6.8 19,11 L17.5,19.5 L7,19.5 Z"
      fill="#facc15"
      stroke="#1c1008"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M7.5,10 L16.5,10 M7,14.2 L17,14.2" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/** Lock — Heavy Carved Bronze Padlock */
export const IconSysLock: React.FC<FantasyIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={`${className} select-none`} aria-hidden="true">
    <path
      d="M7.5,11 L7.5,7.5 C7.5,4.5 16.5,4.5 16.5,7.5 L16.5,11"
      fill="none"
      stroke="#d6c7a9"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
    <rect x="5" y="10.5" width="14" height="11" rx="2.5" fill="#b45309" stroke="#1c1008" strokeWidth="2" />
    <circle cx="12" cy="15" r="1.8" fill="#fef08a" />
    <path d="M12,16.5 L12,19" stroke="#fef08a" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/** Check — Beveled Emerald-Gold Checkmark */
export const IconSysCheck: React.FC<FantasyIconProps> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 28 28" className={`${className} select-none`} aria-hidden="true">
    <path
      d="M5,14.5 L11.5,21 L23,7.5"
      fill="none"
      stroke="#143306"
      strokeWidth="6.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5,14.5 L11.5,21 L23,7.5"
      fill="none"
      stroke="#65e838"
      strokeWidth="3.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Warning — Golden Heraldic Exclamation Shield/Triangle */
export const IconSysWarning: React.FC<FantasyIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={`${className} select-none`} aria-hidden="true">
    <polygon
      points="12,2.5 22,20.5 2,20.5"
      fill="#f59e0b"
      stroke="#1c1008"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M12,9 L12,14.5" stroke="#1c1008" strokeWidth="2.6" strokeLinecap="round" />
    <circle cx="12" cy="17.8" r="1.4" fill="#1c1008" />
  </svg>
);

/** Upgrade — Double Golden Ascension Chevrons */
export const IconSysUpgrade: React.FC<FantasyIconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" className={`${className} select-none`} aria-hidden="true">
    <path
      d="M5,13 L12,6 L19,13 M5,19.5 L12,12.5 L19,19.5"
      fill="none"
      stroke="#1c1008"
      strokeWidth="4.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5,13 L12,6 L19,13 M5,19.5 L12,12.5 L19,19.5"
      fill="none"
      stroke="#fde047"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Star — 5-Pointed Beveled Ascension Star */
export const IconSysStar: React.FC<FantasyIconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" className={`${className} select-none`} aria-hidden="true">
    <polygon
      points="12,2 14.9,8.2 21.8,9.2 16.8,14 18,20.8 12,17.5 6,20.8 7.2,14 2.2,9.2 9.1,8.2"
      fill="#fde047"
      stroke="#1c1008"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

/** Plus — Beveled Gold Medallion Plus Button */
export const IconSysPlus: React.FC<FantasyIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={`${className} select-none`} aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="#d97706" stroke="#1c1008" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="8" fill="#fde047" />
    <path d="M12,7.5 L12,16.5 M7.5,12 L16.5,12" stroke="#241508" strokeWidth="2.8" strokeLinecap="round" />
  </svg>
);

/** Back — Classic AFK Arena Curved Golden Return Arrow */
export const IconSysBack: React.FC<FantasyIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={`${className} select-none`} aria-hidden="true">
    <path
      d="M11,5 L4,12 L11,19 L11,14.5 C16.5,14.5 19.5,16.5 21,20 C20.5,13 17,9.5 11,9.5 Z"
      fill="#fde047"
      stroke="#1c1008"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

/** Close — Carved Bronze-Gold Cross 'X' Emblem */
export const IconSysClose: React.FC<FantasyIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={`${className} select-none`} aria-hidden="true">
    <path
      d="M6,6 L18,18 M18,6 L6,18"
      stroke="#1c1008"
      strokeWidth="5"
      strokeLinecap="round"
    />
    <path
      d="M6,6 L18,18 M18,6 L6,18"
      stroke="#fde047"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
  </svg>
);

/** Info — Golden Heraldic 'i' Shield Emblem */
export const IconSysInfo: React.FC<FantasyIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={`${className} select-none`} aria-hidden="true">
    <circle cx="12" cy="12" r="9.5" fill="#b45309" stroke="#fde047" strokeWidth="1.8" />
    <circle cx="12" cy="7.5" r="1.5" fill="#fffbeb" />
    <path d="M12,11 L12,17" stroke="#fffbeb" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);
