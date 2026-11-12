import React from 'react';
import { HeroTemplate, FACTION_INFO } from '../game/rules';

interface HeroPortraitSvgProps {
  template: HeroTemplate;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Renders a bespoke code-authored SVG character portrait matching the hero's
 * 3D modelArchetype (helm, horns, wings, crown, glowing eyes, and weapon emblem).
 */
export const HeroPortraitSvg: React.FC<HeroPortraitSvgProps> = ({
  template,
  size = 'md',
}) => {
  const dim = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-16 h-16' : 'w-11 h-11';
  const factionColor = FACTION_INFO[template.faction].color;
  const arch = template.modelArchetype;

  return (
    <svg
      viewBox="0 0 64 64"
      className={`${dim} shrink-0 rounded border border-[#c69d53]/70 bg-[#0b101e] shadow-inner`}
      aria-hidden="true"
    >
      {/* Background Aura */}
      <circle cx="32" cy="34" r="24" fill={template.secondaryColor} opacity="0.55" />
      <circle cx="32" cy="28" r="18" fill={template.primaryColor} opacity="0.28" />

      {/* Back Wings / Halo / Chakram per ModelArchetype */}
      {(arch === 'phoenix_seraph' || arch === 'valkyrie_sixwings') && (
        <g stroke={template.accentColor} strokeWidth="2" fill={template.primaryColor}>
          <polygon points="4,22 20,28 16,42 6,34" />
          <polygon points="60,22 44,28 48,42 58,34" />
        </g>
      )}
      {arch === 'fae_butterfly' && (
        <g fill={template.accentColor} opacity="0.75">
          <circle cx="15" cy="26" r="10" />
          <circle cx="49" cy="26" r="10" />
        </g>
      )}
      {(arch === 'archmage_sunhalo' || arch === 'pyro_dragonlord' || arch === 'void_archfiend') && (
        <circle
          cx="32"
          cy="26"
          r="20"
          fill="none"
          stroke={template.accentColor}
          strokeWidth="2.5"
          strokeDasharray="6 3"
        />
      )}

      {/* Armored Shoulders & Torso Silhouette */}
      <path
        d="M12 58 C12 44, 52 44, 52 58 Z"
        fill={template.primaryColor}
        stroke="#090c15"
        strokeWidth="2"
      />
      <circle cx="16" cy="50" r="6" fill={template.secondaryColor} stroke={template.accentColor} strokeWidth="1.5" />
      <circle cx="48" cy="50" r="6" fill={template.secondaryColor} stroke={template.accentColor} strokeWidth="1.5" />

      {/* Character Head */}
      <circle
        cx="32"
        cy="30"
        r="12"
        fill={
          template.faction === 'graveborn'
            ? '#c4b5fd'
            : template.faction === 'hypogean'
            ? '#fda4af'
            : '#fde68a'
        }
        stroke="#090c15"
        strokeWidth="2"
      />

      {/* Bespoke Headgear / Horns / Antlers / Mask */}
      {arch === 'paladin_wingshield' && (
        <g fill={template.accentColor} stroke="#090c15" strokeWidth="1.2">
          <polygon points="16,28 21,14 24,28" />
          <polygon points="48,28 43,14 40,28" />
          <polygon points="32,12 37,22 27,22" fill={template.primaryColor} />
        </g>
      )}
      {arch === 'windranger_antlerbow' && (
        <g stroke={template.accentColor} strokeWidth="2.5" fill="none">
          <path d="M23 20 L16 8 M19 14 L13 15" />
          <path d="M41 20 L48 8 M45 14 L51 15" />
        </g>
      )}
      {(arch === 'necro_scythequeen' || arch === 'void_archfiend' || arch === 'lion_berserker') && (
        <g fill={template.accentColor} stroke="#090c15" strokeWidth="1.2">
          <polygon points="20,22 14,8 26,18" />
          <polygon points="44,22 50,8 38,18" />
        </g>
      )}
      {arch === 'shadow_onikata' && (
        <g>
          <rect x="21" y="28" width="22" height="11" rx="3" fill="#111827" stroke={template.accentColor} strokeWidth="1.5" />
          <polygon points="22,20 18,10 27,18" fill={template.accentColor} />
          <polygon points="42,20 46,10 37,18" fill={template.accentColor} />
        </g>
      )}
      {arch === 'thunder_forgelord' && (
        <g>
          <polygon points="22,36 32,54 42,36" fill={template.accentColor} stroke="#090c15" strokeWidth="1.5" />
          <rect x="20" y="16" width="24" height="9" rx="2" fill={template.primaryColor} />
        </g>
      )}
      {arch === 'treant_colossus' && (
        <g fill={template.accentColor}>
          <polygon points="22,19 18,7 28,16" />
          <polygon points="32,17 32,5 36,17" />
          <polygon points="42,19 46,7 36,16" />
        </g>
      )}
      {(arch === 'undead_dreadking' || arch === 'frost_empress' || arch === 'archmage_sunhalo') && (
        <polygon
          points="21,21 25,10 32,17 39,10 43,21"
          fill={template.accentColor}
          stroke="#090c15"
          strokeWidth="1.2"
        />
      )}

      {/* Glowing Eyes */}
      <rect x="25" y="27" width="4.5" height="2.8" rx="1" fill={template.accentColor} />
      <rect x="34.5" y="27" width="4.5" height="2.8" rx="1" fill={template.accentColor} />

      {/* Faction Corner Badge */}
      <circle cx="54" cy="10" r="5" fill={factionColor} stroke="#090c15" strokeWidth="1.5" />
    </svg>
  );
};
