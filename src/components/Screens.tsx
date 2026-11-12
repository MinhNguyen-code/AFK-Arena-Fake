import React, { useState } from 'react';
import {
  Shield,
  Sword,
  Wand2,
  Heart,
  Sparkles,
  Trophy,
  ArrowUpCircle,
  Star,
  Check,
  Lock,
  RotateCcw,
  Gift,
  Save,
  FolderOpen,
  Zap,
  Play,
  X,
  Film,
  Search,
  Flame,
  BookOpen,
  Info,
  ChevronLeft,
  ChevronRight,
  CornerUpLeft,
  Backpack,
  CheckSquare,
  Calendar,
  Mail,
  Settings,
} from 'lucide-react';
import {
  HERO_ROSTER,
  getHeroById,
  computeHeroStats,
  computeTeamPower,
  getHeroLevelUpCost,
  getEquipmentUpgradeCost,
  CLASS_METADATA,
  REPO_FACTION_METADATA,
  DREAM_REALM_BOSSES,
  OFFICIAL_GAME_VIDEOS,
  computeFactionAura,
  getHeroRepoFaction,
} from '../game/heroes';
import { CAMPAIGN_STAGES, getCampaignStage } from '../game/campaign';
import { HeroClass, BattleSnapshot } from '../game/types';
import {
  useGameStore,
  BattleRewardSummary,
  AppScreen,
} from '../store/gameStore';
import { HeroAvatarSvg } from './HeroAvatarSvg';
import {
  FramedHeroCard,
  RedNotificationDot,
  BuildingCard,
  FantasyCard,
} from './ClassicUiKit';
import { RanhornCityHub } from './RanhornCityScene';
import {
  IconSysCombatFist,
  IconSysCheck,
  IconNavFormation,
  IconNavBattle,
  IconSysUpgrade,
} from './FantasyIcons';

const CLASS_ICONS: Record<HeroClass, React.ReactNode> = {
  Tank: <Shield className="w-3.5 h-3.5 text-amber-400" />,
  'Damage Dealer': <Sword className="w-3.5 h-3.5 text-rose-400" />,
  Mage: <Wand2 className="w-3.5 h-3.5 text-sky-400" />,
  Support: <Heart className="w-3.5 h-3.5 text-emerald-400" />,
  'Crowd Controller': <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
};

// ============================================================================
// 1. RANHORN CITY HUB (Immersive Interactive Fantasy City Scene)
// ============================================================================
export const LobbyPanel: React.FC<{
  onCloseToBattle: () => void;
  onOpenSystemModal?: (
    modal: 'bag' | 'guild' | 'quests' | 'events' | 'mail' | 'settings'
  ) => void;
}> = ({ onCloseToBattle, onOpenSystemModal }) => (
  <RanhornCityHub
    onCloseToBattle={onCloseToBattle}
    onOpenSystemModal={onOpenSystemModal}
  />
);

// ============================================================================
// 2. PRE-BATTLE 5V5 VS FORMATION SCREEN (Authentic AFK Arena Classic Reference Match)
// ============================================================================

const ALLY_BATTLEFIELD_COORDS: Array<{
  slotIdx: number;
  left: string;
  top: string;
  roleLabel: string;
  zIndex: number;
}> = [
  // Frontline (Inner-Left column closer to center)
  { slotIdx: 0, left: '35%', top: '34%', roleLabel: 'Tiền Tuyến #1', zIndex: 22 },
  { slotIdx: 1, left: '35%', top: '67%', roleLabel: 'Tiền Tuyến #2', zIndex: 25 },
  // Backline (Far-Left column, well-spaced vertically so badges never touch heads below)
  { slotIdx: 2, left: '15%', top: '19%', roleLabel: 'Hậu Phương #3', zIndex: 20 },
  { slotIdx: 3, left: '14%', top: '50%', roleLabel: 'Hậu Phương #4', zIndex: 23 },
  { slotIdx: 4, left: '16%', top: '81%', roleLabel: 'Hậu Phương #5', zIndex: 26 },
];

const ENEMY_BATTLEFIELD_COORDS: Array<{
  enemyIdx: number;
  left: string;
  top: string;
  zIndex: number;
  runeTint: 'gold' | 'crimson';
}> = [
  // Frontline (Inner-Right column closer to center)
  { enemyIdx: 0, left: '65%', top: '34%', zIndex: 22, runeTint: 'gold' },
  { enemyIdx: 1, left: '65%', top: '67%', zIndex: 25, runeTint: 'gold' },
  // Backline (Far-Right column)
  { enemyIdx: 2, left: '84%', top: '19%', zIndex: 20, runeTint: 'crimson' },
  { enemyIdx: 3, left: '85%', top: '50%', zIndex: 23, runeTint: 'gold' },
  { enemyIdx: 4, left: '84%', top: '81%', zIndex: 26, runeTint: 'gold' },
];

const MagicRunePedestalSvg: React.FC<{
  selected?: boolean;
  empty?: boolean;
  tint?: 'gold' | 'purple' | 'crimson';
}> = ({ selected = false, empty = false, tint = 'gold' }) => {
  const strokeMain = selected
    ? '#38bdf8'
    : tint === 'crimson'
      ? '#ef4444'
      : tint === 'purple'
        ? '#c084fc'
        : '#facc15';
  const strokeInner = selected
    ? '#fef08a'
    : tint === 'crimson'
      ? '#fca5a5'
      : tint === 'purple'
        ? '#e9d5ff'
        : '#fde047';
  const fillGlow = selected
    ? 'rgba(56, 189, 248, 0.32)'
    : tint === 'crimson'
      ? 'rgba(220, 38, 38, 0.24)'
      : tint === 'purple'
        ? 'rgba(168, 85, 247, 0.24)'
        : 'rgba(250, 204, 21, 0.26)';

  return (
    <svg
      viewBox="0 0 120 44"
      className={`w-14 sm:w-15 h-5 overflow-visible select-none pointer-events-none ${
        selected ? 'drop-shadow-[0_0_10px_rgba(56,189,248,0.95)]' : 'drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]'
      }`}
      aria-hidden="true"
    >
      <ellipse
        cx="60"
        cy="22"
        rx="52"
        ry="16"
        fill={fillGlow}
        stroke={strokeMain}
        strokeWidth={selected ? '2.8' : '2'}
        strokeDasharray={empty ? '5 3' : undefined}
      />
      <ellipse
        cx="60"
        cy="22"
        rx="39"
        ry="11.5"
        fill="none"
        stroke={strokeInner}
        strokeWidth="1.4"
        opacity="0.9"
      />
      <polygon
        points="60,6 96,22 60,38 24,22"
        fill="none"
        stroke={strokeMain}
        strokeWidth="1.2"
        opacity="0.8"
      />
      <polygon
        points="32,11 88,11 88,33 32,33"
        fill="none"
        stroke={strokeInner}
        strokeWidth="1"
        opacity="0.65"
      />
      <circle cx="60" cy="22" r="4" fill={strokeInner} opacity={empty ? '0.45' : '0.85'} />
    </svg>
  );
};

export const FormationPanel: React.FC<{ onCloseToBattle: () => void }> = ({
  onCloseToBattle,
}) => {
  const state = useGameStore();
  const [selectedSlotIdx, setSelectedSlotIdx] = useState<number>(0);
  const [draggedSlotIdx, setDraggedSlotIdx] = useState<number | null>(null);
  const [draggedHeroId, setDraggedHeroId] = useState<string | null>(null);
  const [presetName, setPresetName] = useState<string>('');
  const [factionFilter, setFactionFilter] = useState<string>('All');
  const [showFactionAuraModal, setShowFactionAuraModal] =
    useState<boolean>(false);
  const [showPresetsModal, setShowPresetsModal] = useState<boolean>(false);

  const currentStage = getCampaignStage(state.currentStageId);
  const teamPower = computeTeamPower(state.formation, state.ownedHeroes);
  const allyAura = computeFactionAura(state.formation);
  const enemyAura = computeFactionAura(
    currentStage.enemies.map((e) => e.heroId)
  );

  // Build 5 visual enemy slots so the right side of the battlefield always mirrors the 2-front / 3-back 5v5 layout
  const battlefieldEnemies = React.useMemo(() => {
    const raw = currentStage.enemies;
    if (raw.length >= 5) return raw.slice(0, 5);
    if (raw.length === 0) return [];
    const padded = [...raw];
    while (padded.length < 5) {
      padded.push(raw[raw.length - 1]);
    }
    return padded;
  }, [currentStage.enemies]);

  // Sort owned heroes by level descending, then rarity, matching AFK Arena Classic
  const ownedList = React.useMemo(() => {
    return HERO_ROSTER.filter((h) => {
      if (!state.ownedHeroes[h.id]) return false;
      if (factionFilter !== 'All' && getHeroRepoFaction(h) !== factionFilter) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      const lvA = state.ownedHeroes[a.id]?.level ?? 1;
      const lvB = state.ownedHeroes[b.id]?.level ?? 1;
      if (lvB !== lvA) return lvB - lvA;
      return a.name.localeCompare(b.name);
    });
  }, [state.ownedHeroes, factionFilter]);

  // Tap a hero in the bottom 5-column grid to deploy, undeploy, or replace
  const handleHeroTileClick = (heroId: string) => {
    const existingSlot = state.formation.indexOf(heroId);
    if (existingSlot !== -1) {
      // Clicking an already-deployed hero removes them and selects that slot
      state.removeHeroFromSlot(existingSlot);
      setSelectedSlotIdx(existingSlot);
      return;
    }

    // If the currently highlighted slot is empty, deploy directly into it
    if (!state.formation[selectedSlotIdx]) {
      state.assignHeroToSlot(heroId, selectedSlotIdx);
      const nextEmpty = state.formation.findIndex(
        (id, idx) => idx !== selectedSlotIdx && !id
      );
      if (nextEmpty !== -1) {
        setSelectedSlotIdx(nextEmpty);
      }
      return;
    }

    // Otherwise if another slot is empty, fill the first empty slot
    const firstEmptyIdx = state.formation.findIndex((id) => !id);
    if (firstEmptyIdx !== -1) {
      state.assignHeroToSlot(heroId, firstEmptyIdx);
      const nextEmpty = state.formation.findIndex(
        (id, idx) => idx !== firstEmptyIdx && !id
      );
      setSelectedSlotIdx(nextEmpty !== -1 ? nextEmpty : firstEmptyIdx);
      return;
    }

    // All 5 slots are occupied: replace the currently selected slot
    state.assignHeroToSlot(heroId, selectedSlotIdx);
  };

  // Auto-fill best 5 owned heroes by combat power
  const handleAutoFillBestTeam = () => {
    const top5 = Object.keys(state.ownedHeroes)
      .map((id) => {
        const h = getHeroById(id);
        const owned = state.ownedHeroes[id];
        const stats = computeHeroStats(h, owned);
        return { id, power: stats.combatPower, isTank: h.heroClass === 'Tank' };
      })
      .sort((a, b) => b.power - a.power)
      .slice(0, 5);

    // Put tanks/highest power in frontline first
    const sortedForSlots = [
      ...top5.filter((x) => x.isTank),
      ...top5.filter((x) => !x.isTank),
    ].slice(0, 5);

    const nextSlots: [
      string | null,
      string | null,
      string | null,
      string | null,
      string | null,
    ] = [
      sortedForSlots[0]?.id ?? null,
      sortedForSlots[1]?.id ?? null,
      sortedForSlots[2]?.id ?? null,
      sortedForSlots[3]?.id ?? null,
      sortedForSlots[4]?.id ?? null,
    ];
    state.deployShowcaseTeam(nextSlots, 'Đội Hình Mạnh Nhất');
  };

  return (
    <div
      data-testid="screen-formation"
      className="w-full h-full flex flex-col overflow-hidden bg-[#1e1510] select-none"
    >
      {/* ===================================================================
          SECTIONS A & B: TOP VS HEADER + CENTER PORTRAIT 5V5 BATTLEFIELD
          =================================================================== */}
      <div className="relative w-full h-[324px] sm:h-[340px] shrink-0 overflow-hidden bg-[#54585d] border-b-2 border-[#c69d53]">
        {/* Atmospheric AFK Arena Classic Rocky Cavern & Stone Battlefield SVG Backdrop */}
        <svg
          viewBox="0 0 460 340"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="arenaFloorGrad" cx="50%" cy="54%" r="62%">
              <stop offset="0%" stopColor="#737980" />
              <stop offset="58%" stopColor="#555a60" />
              <stop offset="100%" stopColor="#2e3237" />
            </radialGradient>
            <linearGradient id="topRockShadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#17191c" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#272a2f" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#272a2f" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Main Stone Floor */}
          <rect width="460" height="340" fill="url(#arenaFloorGrad)" />

          {/* Subtle Arena Ground Cracks & Skeletal Ribs (matching reference screenshot) */}
          <ellipse
            cx="230"
            cy="195"
            rx="195"
            ry="105"
            fill="none"
            stroke="#3d4147"
            strokeWidth="2"
            strokeDasharray="14 8"
            opacity="0.65"
          />
          <path
            d="M150,115 Q230,95 310,120 M165,135 Q230,118 295,140 M180,155 Q230,142 280,158"
            fill="none"
            stroke="#8a9098"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.35"
          />
          {/* Jagged Cavern Top Arch */}
          <path
            d="M0,0 L460,0 L460,72 L420,56 L385,64 L340,46 L280,54 L230,42 L180,54 L120,46 L75,64 L35,56 L0,72 Z"
            fill="url(#topRockShadow)"
          />
          {/* Scattered Stone Pebbles on Arena Perimeter */}
          <ellipse cx="42" cy="84" rx="18" ry="7" fill="#3a3e44" opacity="0.7" />
          <ellipse cx="418" cy="86" rx="20" ry="8" fill="#3a3e44" opacity="0.7" />
          <ellipse cx="32" cy="240" rx="16" ry="9" fill="#3a3e44" opacity="0.6" />
          <ellipse cx="428" cy="245" rx="15" ry="8" fill="#3a3e44" opacity="0.6" />
        </svg>

        {/* 1. TOP VS HEADER BAR (Matching Classic AFK Arena Screenshot) */}
        <div className="relative z-30 flex items-center justify-between px-2 pt-1.5 pb-1">
          {/* Left: Ally Faction Aura Crystal Orb Button */}
          <button
            type="button"
            data-testid="btn-open-faction-aura"
            onClick={() => setShowFactionAuraModal(true)}
            title="Hào Quang Hệ Tộc & Khắc Chế"
            className="relative w-10 h-10 rounded-full bg-gradient-to-b from-[#3b2714] to-[#170e07] border-2 border-[#d4af37] shadow-[0_2px_10px_rgba(0,0,0,0.9)] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shrink-0"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0284c7] via-[#38bdf8] to-[#a855f7] flex items-center justify-center overflow-hidden border border-[#fef08a]/60">
              <img
                src={
                  allyAura.dominantFaction
                    ? REPO_FACTION_METADATA[allyAura.dominantFaction].icon
                    : '/assets/factions/lightbearer.png'
                }
                alt="Ally Faction Synergy"
                className="w-5 h-5 object-contain drop-shadow"
              />
            </div>
            <span className="absolute -bottom-1 px-1 rounded-full bg-[#140b05] border border-[#d4af37] text-[8px] font-mono font-extrabold text-[#4ade80] leading-tight">
              +{Math.round(allyAura.atkBonusPct * 100)}%
            </span>
          </button>

          {/* Left-Center: Allied Team Power */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/45 border border-[#c69d53]/40 min-w-0">
            <IconSysCombatFist className="w-3.5 h-3.5 shrink-0" />
            <span
              data-testid="formation-ally-power"
              className="text-xs sm:text-sm font-extrabold text-[#facc15] tabular-nums tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] truncate"
            >
              {teamPower.toLocaleString()}
            </span>
          </div>

          {/* Center: Classic Ornate Bronze & Gold VS Plaque + Stage Label */}
          <div className="flex flex-col items-center justify-center px-2 py-0.5 bg-gradient-to-b from-[#2b1d12]/95 to-[#140c06]/95 border-x-2 border-b-2 border-[#c69d53] rounded-b-xl shadow-[0_4px_12px_rgba(0,0,0,0.85)] shrink-0">
            <span
              className="text-base sm:text-lg font-black tracking-wider leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#fffbeb] via-[#fde047] to-[#b45309] drop-shadow-[0_2px_3px_rgba(0,0,0,0.95)]"
              style={{ fontFamily: '"Cinzel", serif' }}
            >
              VS
            </span>
            <span className="text-[8.5px] font-mono font-bold text-[#e5cba0] leading-none mt-0.5">
              {currentStage.chapter}
            </span>
          </div>

          {/* Right-Center: Enemy Stage Power */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/45 border border-[#c69d53]/40 min-w-0">
            <IconSysCombatFist className="w-3.5 h-3.5 shrink-0" />
            <span
              data-testid="formation-enemy-power"
              className="text-xs sm:text-sm font-extrabold text-[#facc15] tabular-nums tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] truncate"
            >
              {currentStage.recommendedPower.toLocaleString()}
            </span>
          </div>

          {/* Right: Enemy Faction Aura Crystal Orb Button */}
          <button
            type="button"
            onClick={() => setShowFactionAuraModal(true)}
            title={`Đội Hình Địch · ${enemyAura.tierLabel}`}
            className="relative w-10 h-10 rounded-full bg-gradient-to-b from-[#3b2714] to-[#170e07] border-2 border-[#d4af37] shadow-[0_2px_10px_rgba(0,0,0,0.9)] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shrink-0"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#7c2d12] via-[#a855f7] to-[#38bdf8] flex items-center justify-center overflow-hidden border border-[#fef08a]/60">
              <img
                src={
                  enemyAura.dominantFaction
                    ? REPO_FACTION_METADATA[enemyAura.dominantFaction].icon
                    : '/assets/factions/graveborn.png'
                }
                alt="Enemy Faction Synergy"
                className="w-5 h-5 object-contain drop-shadow"
              />
            </div>
            <span className="absolute -bottom-1 px-1 rounded-full bg-[#140b05] border border-[#d4af37] text-[8px] font-mono font-extrabold text-rose-300 leading-tight">
              Địch
            </span>
          </button>
        </div>

        {/* Subtle Quick-Swap Frontline Button in Top-Left Battlefield Corner */}
        <button
          type="button"
          data-testid="formation-swap-frontline-btn"
          onClick={() => state.swapFormationSlots(0, 1)}
          title="Đổi vị trí 2 tướng Tiền Tuyến (Ô #1 ↔ Ô #2)"
          className="absolute top-12 left-2 z-30 px-1.5 py-0.5 rounded bg-black/55 hover:bg-black/80 border border-[#c69d53]/70 text-[9px] font-mono font-bold text-[#fde047] cursor-pointer"
        >
          1↔2
        </button>

        {/* 2. CENTER BATTLEFIELD STAGE: 5 ALLIES (LEFT) VS 5 ENEMIES (RIGHT) */}
        <div className="relative w-full h-[274px] sm:h-[290px]">
          {/* LEFT SIDE: 5 ALLIED FORMATION SLOTS (2 Frontline + 3 Backline) */}
          {ALLY_BATTLEFIELD_COORDS.map(({ slotIdx, left, top, roleLabel, zIndex }) => {
            const heroId = state.formation[slotIdx];
            const hero = heroId ? getHeroById(heroId) : null;
            const owned = heroId ? state.ownedHeroes[heroId] : undefined;
            const isSelected = selectedSlotIdx === slotIdx;
            const facMeta = hero
              ? REPO_FACTION_METADATA[getHeroRepoFaction(hero)]
              : null;

            return (
              <div
                key={`ally-slot-${slotIdx}`}
                data-testid={`formation-slot-${slotIdx}`}
                role="button"
                tabIndex={0}
                aria-label={`${roleLabel} ${hero ? hero.name : 'Trống'}`}
                draggable={Boolean(heroId)}
                style={{ left, top, zIndex }}
                onDragStart={() => {
                  setDraggedSlotIdx(slotIdx);
                  setDraggedHeroId(heroId);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (draggedSlotIdx !== null && draggedSlotIdx !== slotIdx) {
                    state.swapFormationSlots(draggedSlotIdx, slotIdx);
                    setSelectedSlotIdx(slotIdx);
                  } else if (draggedHeroId) {
                    state.assignHeroToSlot(draggedHeroId, slotIdx);
                    setSelectedSlotIdx(slotIdx);
                  }
                  setDraggedSlotIdx(null);
                  setDraggedHeroId(null);
                }}
                onClick={() => {
                  if (heroId) {
                    state.removeHeroFromSlot(slotIdx);
                    setSelectedSlotIdx(slotIdx);
                  } else {
                    setSelectedSlotIdx(slotIdx);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (heroId) {
                      state.removeHeroFromSlot(slotIdx);
                      setSelectedSlotIdx(slotIdx);
                    } else {
                      setSelectedSlotIdx(slotIdx);
                    }
                  }
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-end cursor-pointer group outline-none"
              >
                {/* Standing Hero Sprite on Battlefield */}
                {hero && owned ? (
                  <div className="relative flex flex-col items-center">
                    <div className="w-11 h-12 sm:w-12 sm:h-13 -mb-2.5 relative z-10 transition-transform group-hover:scale-105">
                      <HeroAvatarSvg hero={hero} size="full" variant="battle" />
                    </div>
                    <MagicRunePedestalSvg
                      selected={isSelected}
                      tint={slotIdx === 4 ? 'purple' : 'gold'}
                    />
                    {/* Authentic Classic AFK Arena [Faction Icon + Lv.X] Badge under Rune */}
                    <div
                      className={`-mt-2 relative z-30 flex items-center gap-1 px-1.5 py-0.5 rounded-full border shadow-[0_2px_6px_rgba(0,0,0,0.95)] ${
                        isSelected
                          ? 'bg-[#0f172a]/95 border-[#38bdf8]'
                          : 'bg-[#141210]/92 border-[#b8893e]/85'
                      }`}
                    >
                      {facMeta && (
                        <img
                          src={facMeta.icon}
                          alt={facMeta.label}
                          className="w-3.5 h-3.5 object-contain shrink-0"
                        />
                      )}
                      <span className="text-[9.5px] font-extrabold text-[#fff8e7] tabular-nums leading-none whitespace-nowrap">
                        Lv.{owned.level}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Empty Battlefield Rune Slot */
                  <div className="relative flex flex-col items-center pt-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mb-0.5 transition-transform group-hover:scale-110 ${
                        isSelected
                          ? 'bg-[#0284c7]/40 border-[#38bdf8] text-[#e0f2fe]'
                          : 'bg-black/45 border-[#facc15]/80 text-[#fde047]'
                      }`}
                    >
                      <span className="text-xs font-black leading-none">+</span>
                    </div>
                    <MagicRunePedestalSvg selected={isSelected} empty />
                    <div
                      className={`-mt-2 relative z-30 px-2 py-0.5 rounded-full border text-[9px] font-bold leading-none whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#0c4a6e] border-[#38bdf8] text-white'
                          : 'bg-black/75 border-[#b8893e]/70 text-[#fde047]'
                      }`}
                    >
                      Ô #{slotIdx + 1}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* RIGHT SIDE: 5 ENEMY POSITIONS (2 Frontline + 3 Backline, Facing Left) */}
          {ENEMY_BATTLEFIELD_COORDS.map(({ enemyIdx, left, top, zIndex, runeTint }) => {
            const enemySlot = battlefieldEnemies[enemyIdx];
            if (!enemySlot) return null;
            const enemyHero = getHeroById(enemySlot.heroId);
            const facMeta = REPO_FACTION_METADATA[getHeroRepoFaction(enemyHero)];

            return (
              <div
                key={`enemy-slot-${enemyIdx}`}
                data-testid={`formation-enemy-slot-${enemyIdx}`}
                style={{ left, top, zIndex }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-end pointer-events-none"
              >
                <div className="w-11 h-12 sm:w-12 sm:h-13 -mb-2.5 relative z-10 scale-x-[-1]">
                  <HeroAvatarSvg hero={enemyHero} size="full" variant="battle" />
                </div>
                <MagicRunePedestalSvg tint={runeTint} />
                <div className="-mt-2 relative z-30 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#141210]/92 border border-[#b8893e]/85 shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                  {facMeta && (
                    <img
                      src={facMeta.icon}
                      alt={facMeta.label}
                      className="w-3.5 h-3.5 object-contain shrink-0"
                    />
                  )}
                  <span className="text-[9.5px] font-extrabold text-[#fff8e7] tabular-nums leading-none whitespace-nowrap">
                    Lv.{enemySlot.level}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ornate Classic AFK Arena Gold & Dark Bronze Arch Divider at Bottom of Battlefield */}
        <div className="absolute bottom-0 inset-x-0 h-2.5 bg-gradient-to-b from-[#2b1b0e] to-[#7c562b] border-t border-[#fde047]/60 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-1.5 rounded-full bg-[#fde047]/80" />
        </div>
      </div>

      {/* ===================================================================
          SECTIONS E & F: WARM PARCHMENT 5-COLUMN HERO SELECTION GRID + FOOTER
          =================================================================== */}
      <div className="flex-1 min-h-0 flex flex-col justify-between bg-gradient-to-b from-[#ecd5ad] via-[#e4c898] to-[#d6b57e] text-[#3b2412] overflow-hidden">
        {/* Scrollable 5-Column Hero Selection Grid (Matching Reference Screenshot) */}
        <div
          data-testid="formation-hero-grid"
          className="flex-1 min-h-0 overflow-y-auto px-2.5 pt-2.5 pb-1.5 grid grid-cols-5 gap-2 content-start"
        >
          {ownedList.map((hero) => {
            const owned = state.ownedHeroes[hero.id];
            const currentSlot = state.formation.indexOf(hero.id);
            const isDeployed = currentSlot !== -1;
            const facMeta = REPO_FACTION_METADATA[getHeroRepoFaction(hero)];
            const isAscended = hero.rarity === 'Ascended';

            return (
              <button
                key={hero.id}
                type="button"
                data-testid={`formation-hero-pick-${hero.id}`}
                aria-label={`${hero.name} Lv.${owned.level}${isDeployed ? ' Đã chọn' : ''}`}
                draggable
                onDragStart={() => {
                  setDraggedHeroId(hero.id);
                  setDraggedSlotIdx(null);
                }}
                onClick={() => handleHeroTileClick(hero.id)}
                className={`group relative aspect-square w-full rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm p-[2px] cursor-pointer transition-transform active:scale-95 shadow-[0_3px_6px_rgba(0,0,0,0.45)] ${
                  isDeployed
                    ? 'bg-gradient-to-b from-[#fef08a] via-[#eab308] to-[#a16207] ring-2 ring-[#65e838]'
                    : isAscended
                      ? 'bg-gradient-to-b from-[#fde047] via-[#d97706] to-[#78350f] hover:brightness-110'
                      : 'bg-gradient-to-b from-[#d8b4fe] via-[#9333ea] to-[#4c1d95] hover:brightness-110'
                }`}
              >
                <div className="relative w-full h-full rounded-tl-[10px] rounded-br-[10px] rounded-tr-[2px] rounded-bl-[2px] overflow-hidden bg-[#1e162b]">
                  {/* Hero Portrait */}
                  <HeroAvatarSvg hero={hero} size="full" variant="icon" />

                  {/* Top Dark Contrast Scrim for Faction Icon + Level */}
                  <div className="absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-black/85 via-black/45 to-transparent pointer-events-none" />

                  {/* Top-Left Faction Badge */}
                  {facMeta && (
                    <img
                      src={facMeta.icon}
                      alt={facMeta.label}
                      className="w-4 h-4 rounded-full bg-[#140c06] border border-[#fde047] absolute top-0.5 left-0.5 object-contain z-10"
                    />
                  )}

                  {/* Top-Right Level Text (Lv.120 style) */}
                  <span className="absolute top-0.5 right-1 z-10 text-[10px] font-extrabold text-white tabular-nums leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                    Lv.{owned.level}
                  </span>

                  {/* Deployed Checkmark Overlay (Authentic Green Checkmark in Center) */}
                  {isDeployed && (
                    <div
                      data-testid={`formation-deployed-check-${hero.id}`}
                      className="absolute inset-0 bg-black/45 flex items-center justify-center z-20"
                    >
                      <IconSysCheck className="w-7 h-7 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* FOOTER: COMPACT FACTION FILTER BAR + FORMATION PRESETS + PROMINENT BATTLE BUTTON */}
        <div className="px-2.5 pb-2 pt-1 bg-gradient-to-t from-[#c7a167] via-[#d6b57e] to-transparent shrink-0 space-y-1.5">
          {/* Row 1: Exclamation Synergy Diamond + Classic Dark-Bronze Faction Filter Capsule */}
          <div className="flex items-center gap-1.5">
            {/* Left Bronze Diamond Exclamation Info Button (Matching Screenshot) */}
            <button
              type="button"
              onClick={() => setShowFactionAuraModal(true)}
              title="Xem Khắc Chế Hệ Tộc & Hào Quang"
              className="w-7 h-7 rounded-lg rotate-45 bg-gradient-to-b from-[#5c3c1e] to-[#2b1a0e] border-2 border-[#c69d53] flex items-center justify-center shadow cursor-pointer shrink-0 ml-1"
            >
              <span className="-rotate-45 text-xs font-black text-[#e5cba0]">
                !
              </span>
            </button>

            {/* Dark-Bronze Faction Filter Capsule */}
            <div className="flex-1 min-w-0 flex items-center justify-between gap-1 bg-gradient-to-b from-[#3b2513] to-[#211309] border-2 border-[#a87e3b] rounded-full px-1.5 py-1 shadow-[inset_0_2px_6px_rgba(0,0,0,0.85)] overflow-x-auto">
              <button
                type="button"
                data-testid="formation-filter-all"
                onClick={() => setFactionFilter('All')}
                className={`w-7 h-7 rounded-full border-2 text-[9px] font-black flex items-center justify-center shrink-0 cursor-pointer transition-transform ${
                  factionFilter === 'All'
                    ? 'bg-gradient-to-b from-[#fde047] to-[#b45309] text-[#1e1209] border-[#fef08a] scale-105 shadow'
                    : 'bg-[#1a0f07] text-[#e5cba0] border-[#6e4b26]'
                }`}
              >
                ALL
              </button>
              {Object.entries(REPO_FACTION_METADATA).map(([facKey, meta]) => {
                const active = factionFilter === facKey;
                return (
                  <button
                    key={facKey}
                    type="button"
                    data-testid={`formation-filter-${facKey}`}
                    onClick={() => setFactionFilter(active ? 'All' : facKey)}
                    title={`${meta.label} (${meta.viLabel})`}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-transform ${
                      active
                        ? 'bg-[#4a3019] border-[#fde047] scale-105 shadow-[0_0_8px_rgba(253,224,71,0.65)]'
                        : 'bg-[#1a0f07] border-[#6e4b26] opacity-85 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={meta.icon}
                      alt={meta.label}
                      className="w-4.5 h-4.5 object-contain"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Secondary Formation Preset Button + Auto-Fill + Prominent Battle Button */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-testid="formation-presets-btn"
              onClick={() => setShowPresetsModal(true)}
              className="px-2.5 py-2 rounded-xl bg-gradient-to-b from-[#5c3c1e] to-[#2e1c0c] border-2 border-[#b8893e] text-[#fde047] font-extrabold text-[11px] flex items-center gap-1.5 cursor-pointer shadow shrink-0"
            >
              <IconNavFormation active className="w-4 h-4 shrink-0" />
              <span>Đội Hình</span>
            </button>

            <button
              type="button"
              data-testid="formation-autofill-btn"
              onClick={handleAutoFillBestTeam}
              className="px-2.5 py-2 rounded-xl bg-gradient-to-b from-[#4a3019] to-[#241509] border-2 border-[#9c723c] text-[#e5cba0] hover:text-[#fde047] font-extrabold text-[11px] flex items-center gap-1.5 cursor-pointer shadow shrink-0"
            >
              <IconSysUpgrade className="w-4 h-4 shrink-0" />
              <span>Tự Xếp</span>
            </button>

            <button
              type="button"
              data-testid="formation-battle-btn"
              onClick={() => {
                state.restartCurrentBattle();
                onCloseToBattle();
              }}
              className="flex-1 py-2 rounded-xl bg-gradient-to-b from-[#fde047] via-[#eab308] to-[#b45309] hover:brightness-110 text-[#1e1106] font-black text-xs uppercase tracking-wider border-2 border-[#fef08a] shadow-[0_4px_14px_rgba(180,83,9,0.65)] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <IconNavBattle active className="w-4.5 h-4.5 shrink-0" />
              <span>Battle · Xuất Trận</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================
          MODAL 1: FORMATION PRESETS (SAVE / LOAD TEAMS)
          =================================================================== */}
      {showPresetsModal && (
        <div
          role="dialog"
          aria-label="Quản lý Đội Hình Lưu"
          data-testid="formation-presets-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        >
          <div className="w-full max-w-sm bg-gradient-to-b from-[#f3e3c3] to-[#dec28f] border-4 border-[#7c562b] rounded-2xl p-4 shadow-2xl text-[#3b2412] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-[#8c6430]/40 pb-2">
              <h3
                className="text-sm font-extrabold text-[#4d2f14] uppercase"
                style={{ fontFamily: '"Cinzel", serif' }}
              >
                Formations · Đội Hình Lưu
              </h3>
              <button
                type="button"
                onClick={() => setShowPresetsModal(false)}
                className="p-1 rounded-lg bg-[#6e4b26] text-[#fde047] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Save Current Formation */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Nhập tên đội hình..."
                aria-label="Tên đội hình lưu"
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#fff8ea] border-2 border-[#8c6430] text-xs text-[#3b2412]"
              />
              <button
                type="button"
                data-testid="save-preset-btn"
                onClick={() => {
                  state.saveTeamPreset(presetName);
                  setPresetName('');
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#4a3019] text-[#fde047] text-xs font-extrabold cursor-pointer shadow"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu</span>
              </button>
            </div>

            {/* Saved Presets List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {state.savedPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#e5cba0] border border-[#8c6430]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-extrabold text-[#3b2412] truncate">
                      {preset.name}
                    </div>
                    <div className="text-[10px] font-mono text-[#6b4826]">
                      {preset.slots.filter(Boolean).length}/5 Tướng
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      state.loadTeamPreset(preset.id);
                      setShowPresetsModal(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-b from-[#f5d061] to-[#b8862d] text-[#241509] text-[11px] font-extrabold cursor-pointer shadow shrink-0"
                  >
                    Chọn
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 2: FACTION ADVANTAGE & SYNERGY POPUP (Authentic AFK Arena)
          =================================================================== */}
      {showFactionAuraModal && (
        <div
          role="dialog"
          aria-label="Bảng Khắc Chế Hệ Tộc & Hào Quang Đội Hình"
          data-testid="faction-aura-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
        >
          <div className="w-full max-w-sm bg-[#1a1410] border-2 border-[#d4af37] rounded-2xl p-3.5 shadow-2xl text-amber-100 space-y-2.5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-2 gap-2">
              <h3
                className="text-xs font-extrabold text-[#fde047] uppercase truncate"
                style={{ fontFamily: '"Cinzel", serif' }}
              >
                Khắc Chế Hệ Tộc &amp; Hào Quang Đội Hình
              </h3>
              <button
                type="button"
                onClick={() => setShowFactionAuraModal(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-[#2a1b10] border border-amber-400/50 text-xs">
              <div className="text-[#fde047] font-extrabold uppercase">
                Đội Hình Hiện Tại: {allyAura.tierLabel}
              </div>
              <div className="text-emerald-300 font-mono mt-1 text-[11px]">
                ATK +{Math.round(allyAura.atkBonusPct * 100)}% · HP +
                {Math.round(allyAura.hpBonusPct * 100)}% · DEF +
                {Math.round(allyAura.defBonusPct * 100)}% · Crit +
                {Math.round(allyAura.critBonusPct * 100)}%
              </div>
            </div>

            <img
              src="/assets/aistudio/dbcb90b6-2348-11ef-85c2-02420a000190_64a07731.webp"
              alt="AFK Arena Faction Advantage Rules"
              className="w-full max-h-[220px] rounded-xl border border-[#c69d53] object-contain mx-auto"
            />

            <div className="p-2.5 rounded-xl bg-[#24170e] border border-[#6e4b26] space-y-1 text-[11px]">
              <div className="font-bold text-amber-300">
                Vòng Khắc Chế Hệ Tộc (+25% Sát Thương):
              </div>
              <p className="text-amber-100/90 leading-relaxed">
                Lightbearer ➔ Mauler ➔ Wilder ➔ Graveborn ➔ Lightbearer. Celestial ↔ Hypogean gây thêm +25% sát thương lên nhau.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. AUTHENTIC AFK ARENA: COMPANIONS HEROES ROSTER (18_roster_late.jpg, 02_roster_early.png, 07-13)
//    + CHARACTER DETAIL & SKILL REVEAL (04_hero_detail_medusa.png, 05_hero_detail_athena.png, 01_hero_reveal_dracula.jpg)
//    + BEAST SELECT (06), DUO CO-OP SETTINGS & COOLDOWN (14-16), ITEM TOOLTIP (17)
// ============================================================================
const COMPANIONS_BEASTS = [
  {
    id: 'frost_dragon',
    name: 'Băng Long Tinh Hoa',
    cnName: '冰霜幼龙',
    level: 18,
    rarity: 'Mythic',
    buffText: '+14% Công Toàn Đội · Đóng băng kẻ địch 2.5s',
    color: 'from-[#1e3a8a] to-[#0f172a]',
    accent: '#38bdf8',
    emoji: '🐉',
  },
  {
    id: 'nightmare_steed',
    name: 'Hắc Mã Ác Mộng',
    cnName: '梦魇战马',
    level: 12,
    rarity: 'Epic',
    buffText: '+18% Tốc Đánh · Hồi 150 Nộ đầu trận',
    color: 'from-[#4c1d95] to-[#1e1b4b]',
    accent: '#c084fc',
    emoji: '🦄',
  },
  {
    id: 'bloodmoon_hare',
    name: 'Thỏ Huyết Nguyệt',
    cnName: '绯月灵兔',
    level: 15,
    rarity: 'Mythic',
    buffText: '+20% Hút Máu · Tạo khiên máu 18% HP',
    color: 'from-[#7f1d1d] to-[#2a0a0a]',
    accent: '#f87171',
    emoji: '🐇',
  },
  {
    id: 'astral_ram',
    name: 'Cừu Tinh Tú',
    cnName: '星界白羊',
    level: 10,
    rarity: 'Legendary',
    buffText: '+16% Phòng Thủ · Giải trừ khống chế',
    color: 'from-[#713f12] to-[#271505]',
    accent: '#facc15',
    emoji: '🐏',
  },
];

export const HeroCollectionAndDetailsPanel: React.FC<{
  onCloseToBattle: () => void;
}> = ({ onCloseToBattle }) => {
  const state = useGameStore();
  const [classFilter, setClassFilter] = useState<HeroClass | 'All'>('All');
  const [factionFilter, setFactionFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rosterSubTab, setRosterSubTab] = useState<
    'formation_link' | 'popularity' | 'heroes' | 'portraits'
  >('heroes');
  const [viewMode, setViewMode] = useState<'roster' | 'detail'>(
    state.activeScreen === 'details' || state.activeScreen === 'upgrades'
      ? 'detail'
      : 'roster'
  );
  const [sanctuaryTab, setSanctuaryTab] = useState<
    'gear' | 'skills' | 'story'
  >('gear');
  const [activeSkillSlot, setActiveSkillSlot] = useState<
    'ultimate' | 'active' | 'passive' | 'basic'
  >('ultimate');
  const [lockedHeroes, setLockedHeroes] = useState<Record<string, boolean>>({
    medusa: true,
    athena: true,
  });

  // Reference Modals (06 Beast Select, 14-16 Duo Co-op Settings & Cooldown, 17 Item Tooltip)
  const [selectedBeastId, setSelectedBeastId] = useState<string>('frost_dragon');
  const [showBeastModal, setShowBeastModal] = useState<boolean>(false);
  const [showDuoSettingsModal, setShowDuoSettingsModal] =
    useState<boolean>(false);
  const [duoCooldownMode, setDuoCooldownMode] = useState<'none' | '2h44' | '37m'>(
    '2h44'
  );
  const [duoSettings, setDuoSettings] = useState({
    friendsInvite: true,
    guildInvite: true,
    strangerInvite: true,
    muteStrangerToday: false,
  });
  const [inspectedItemModal, setInspectedItemModal] = useState<null | {
    name: string;
    cnName: string;
    category: string;
    count: number;
    desc: string;
    badgeText: string;
  }>(null);

  const selectedHero = getHeroById(state.selectedHeroId);
  const selectedOwned = state.ownedHeroes[selectedHero.id];
  const previewStats = computeHeroStats(selectedHero, selectedOwned);
  const levelCost = getHeroLevelUpCost(selectedOwned?.level ?? 1);
  const selectedFaction = getHeroRepoFaction(selectedHero);
  const selectedFactionMeta = REPO_FACTION_METADATA[selectedFaction];

  const filteredRoster = HERO_ROSTER.filter((h) => {
    if (classFilter !== 'All' && h.heroClass !== classFilter) return false;
    if (factionFilter !== 'All' && getHeroRepoFaction(h) !== factionFilter)
      return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      if (
        !h.name.toLowerCase().includes(q) &&
        !h.title.toLowerCase().includes(q) &&
        !(h.repoFaction || '').toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const ownedCount = Object.keys(state.ownedHeroes).length;

  // Cycle Previous / Next Hero in Sanctuary (04_hero_detail_medusa.png)
  const currentHeroIdx = Math.max(
    0,
    filteredRoster.findIndex((h) => h.id === selectedHero.id)
  );
  const handleCycleHero = (dir: -1 | 1) => {
    if (filteredRoster.length === 0) return;
    const nextIdx =
      (currentHeroIdx + dir + filteredRoster.length) % filteredRoster.length;
    state.setSelectedHeroId(filteredRoster[nextIdx].id);
  };

  // Dynamic Faction Sanctuary Backdrop (matching 04_hero_detail_medusa.png Enchanted Forest & 05_hero_detail_athena.png)
  const sanctuaryBgClass =
    selectedFaction === 'Wilder'
      ? 'from-[#163d35] via-[#112c28] to-[#0a1a18]'
      : selectedFaction === 'Lightbearer' || selectedFaction === 'Celestial'
        ? 'from-[#382b1e] via-[#241a11] to-[#130d08]'
        : selectedFaction === 'Mauler' || selectedFaction === 'Draconis'
          ? 'from-[#422016] via-[#29130d] to-[#140906]'
          : 'from-[#1a2c42] via-[#132030] to-[#0b131d]';

  const inspectedSkill = selectedHero.skills[activeSkillSlot];
  const isHeroLocked = Boolean(lockedHeroes[selectedHero.id]);
  const selectedBeast =
    COMPANIONS_BEASTS.find((b) => b.id === selectedBeastId) ||
    COMPANIONS_BEASTS[0];

  // Determine 5-Tier Rarity Frame Style (Matching 02_roster_early.png, 03_hero_icons_medusa_athena.png, 18_roster_late.jpg)
  const getCompanionsCardStyle = (
    heroRarity: string,
    stars: number
  ): {
    frameClass: string;
    isAscendedWinged: boolean;
    tierTag: string;
  } => {
    if (stars >= 4 || heroRarity === 'Ascended') {
      return {
        frameClass:
          'border-[#f8fafc] ring-1 ring-[#eab308] bg-gradient-to-b from-[#475569] via-[#312e81] to-[#1e1b4b]',
        isAscendedWinged: true,
        tierTag: 'Bạch Kim',
      };
    }
    if (stars === 3) {
      return {
        frameClass:
          'border-[#ef4444] ring-1 ring-[#f59e0b] bg-gradient-to-b from-[#7f1d1d] via-[#450a0a] to-[#2a0606]',
        isAscendedWinged: false,
        tierTag: 'Thần Thoại',
      };
    }
    if (stars === 2) {
      return {
        frameClass:
          'border-[#facc15] bg-gradient-to-b from-[#713f12] via-[#422006] to-[#271203]',
        isAscendedWinged: false,
        tierTag: 'Huyền Thoại',
      };
    }
    return {
      frameClass:
        'border-[#a855f7] bg-gradient-to-b from-[#581c87] via-[#3b0764] to-[#1e0536]',
      isAscendedWinged: false,
      tierTag: 'Sử Thi',
    };
  };

  return (
    <div
      data-testid="screen-collection"
      className="w-full h-full flex flex-col justify-between bg-gradient-to-b from-[#f3deb1] via-[#e7cba0] to-[#d5b47f] border-x-2 border-[#8c6430] text-[#3b2412] relative overflow-hidden select-none"
    >
      {/* Subtle Top Geometric Sunburst Watermark (Matching 02_roster_early.png & 18_roster_late.jpg) */}
      <svg
        viewBox="0 0 400 90"
        className="w-full h-16 absolute top-0 inset-x-0 opacity-20 pointer-events-none"
        preserveAspectRatio="none"
      >
        <circle
          cx="200"
          cy="10"
          r="55"
          fill="none"
          stroke="#8c5820"
          strokeWidth="2"
        />
        <circle
          cx="200"
          cy="10"
          r="38"
          fill="none"
          stroke="#8c5820"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M0,45 Q100,15 200,45 T400,45"
          fill="none"
          stroke="#8c5820"
          strokeWidth="1.5"
        />
      </svg>

      {/* =====================================================================
          VIEW 1: 5-COLUMN PARCHMENT HEROES ROSTER (Exact match to 02_roster_early.png, 07-13, 18_roster_late.jpg)
         ===================================================================== */}
      {viewMode === 'roster' && (
        <div className="relative z-10 flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
          {/* Top Classic AFK Arena Resonating Crystal & Hero Capacity Header Bar (fdd16096, e4cb1de4) */}
          <div className="px-2.5 pt-2 pb-1.5 border-b border-[#b8945e] space-y-1.5 bg-[#edd4a4]/95">
            <div className="flex items-center justify-between gap-1">
              {/* Left: Classic AFK Arena Resonating Crystal Level Crest */}
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#fde047] via-[#d97706] to-[#78350f] border-2 border-[#fef08a] flex items-center justify-center text-[11px] font-mono font-black text-[#241407] shadow z-10">
                  240
                </div>
                <div className="-ml-2 pl-3 pr-2.5 py-0.5 rounded-r-full bg-[#6e4f2d] border border-[#a88252] text-[11px] font-extrabold text-[#fff5dc] shadow-inner">
                  Crystal Level: 240
                </div>
              </div>

              {/* Right: Resonating Crystal ⬆️ + Hero Capacity 254/254 [+] + Sort by Rarity/Level */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  data-testid="collection-auto-upgrade-btn"
                  onClick={() => state.autoUpgradeSquad()}
                  title="Resonating Crystal · Đồng bộ cấp độ toàn đội"
                  className="relative w-7 h-7 rounded-lg bg-gradient-to-b from-[#d6b272] to-[#8c6430] border border-[#4d2f14] flex items-center justify-center cursor-pointer shadow"
                >
                  <Zap className="w-3.5 h-3.5 text-[#241407] fill-[#fde047]" />
                  <span className="absolute -top-1 -right-1 text-[9px] font-black text-emerald-600 drop-shadow">
                    ⬆
                  </span>
                </button>

                <div className="flex items-center bg-[#6e4f2d] border border-[#a88252] rounded-md px-1.5 py-0.5 text-[11px] font-mono font-extrabold text-[#fff5dc]">
                  <span className="text-[#fde047] mr-1">👤</span>
                  <span>
                    {ownedCount}/{HERO_ROSTER.length}
                  </span>
                  <button
                    type="button"
                    data-testid="btn-unlock-all-repo-heroes"
                    onClick={() => state.unlockAllRepoHeroes()}
                    title="Mở khóa toàn bộ 254 Tướng"
                    className="ml-1 w-4 h-4 rounded bg-gradient-to-b from-[#e5b85c] to-[#966822] text-[#241407] flex items-center justify-center font-black cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setViewMode(viewMode === 'roster' ? 'detail' : 'roster')
                  }
                  title="Mở Hero Sanctuary (Chi Tiết Tướng)"
                  className="px-2 py-1 rounded bg-[#6e4f2d] hover:bg-[#593e22] border border-[#a88252] text-[10px] font-extrabold text-[#fde047] cursor-pointer"
                >
                  Rarity ⇅
                </button>
              </div>
            </div>

            {/* Search + Beast Sanctuary + Unions + Artifact Item Bar */}
            <div className="flex flex-wrap items-center justify-between gap-1">
              <div className="relative flex-1 min-w-[120px]">
                <Search className="w-3 h-3 text-[#7c562b] absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Heroes (Shemira, Belinda, Athalia, Rem...)"
                  className="w-full pl-6 pr-2 py-0.5 rounded bg-[#fff8eb] border border-[#9c723c] text-[10px] text-[#3b2412] placeholder-[#8c6840] focus:outline-none"
                />
              </div>

              <button
                type="button"
                data-testid="btn-open-beast-modal"
                onClick={() => setShowBeastModal(true)}
                className="px-2 py-0.5 rounded bg-[#4a3019] border border-[#b8893e] text-[10px] font-extrabold text-[#fde047] cursor-pointer flex items-center gap-1"
              >
                <span>{selectedBeast.emoji}</span>
                <span>Beasts</span>
              </button>

              <button
                type="button"
                data-testid="btn-open-duo-modal"
                onClick={() => setShowDuoSettingsModal(true)}
                className="px-2 py-0.5 rounded bg-[#4a3019] border border-[#b8893e] text-[10px] font-extrabold text-amber-200 cursor-pointer"
              >
                Unions
              </button>

              <button
                type="button"
                data-testid="btn-open-item-tooltip"
                onClick={() =>
                  setInspectedItemModal({
                    name: "Dura's Call · Tù Và Nữ Thần",
                    cnName: '神王之眼 · Dura Artifact',
                    category: 'Thần Khí Dura',
                    count: 5,
                    badgeText: '★5',
                    desc: 'Hồi 16 điểm Nộ mỗi giây cho Anh Hùng sở hữu và chia sẻ Nộ cho toàn bộ đồng minh khi gục ngã.',
                  })
                }
                className="px-2 py-0.5 rounded bg-[#581c87] border border-[#c084fc] text-[10px] font-extrabold text-purple-100 cursor-pointer"
              >
                📯 Dura ★5
              </button>
            </div>

            {/* Compact Class Filter Row (Preserves filter-class-* test IDs) */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {(
                [
                  'All',
                  'Tank',
                  'Damage Dealer',
                  'Mage',
                  'Support',
                  'Crowd Controller',
                ] as const
              ).map((cls) => (
                <button
                  key={cls}
                  type="button"
                  data-testid={`filter-class-${cls}`}
                  onClick={() => setClassFilter(cls)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold shrink-0 cursor-pointer ${
                    classFilter === cls
                      ? 'bg-[#4a3019] text-[#fde047]'
                      : 'bg-[#dfbe88] text-[#4d2f14]'
                  }`}
                >
                  {cls === 'All'
                    ? `All (${filteredRoster.length})`
                    : CLASS_METADATA[cls].viLabel}
                </button>
              ))}
            </div>
          </div>

          {/* CENTER: CLASSIC AFK ARENA HERO PORTRAIT GRID (Using FramedHeroCard with Lvl labels, square ornate frames, bottom stars, and parchment names — e4cb1de4 & fdd16096) */}
          <div className="px-2.5 py-2 flex-1 min-h-0 overflow-y-auto">
            {rosterSubTab !== 'portraits' ? (
              <div
                data-testid="companions-5col-grid"
                className="grid grid-cols-4 sm:grid-cols-5 gap-2.5"
              >
                {filteredRoster.map((hero) => {
                  const owned = state.ownedHeroes[hero.id];
                  const isSelected = hero.id === selectedHero.id;
                  const slotIdx = state.formation.indexOf(hero.id);
                  const stars = owned?.stars ?? 1;
                  const level = owned?.level ?? 1;
                  const canNotify = Boolean(owned && state.gold >= 500);

                  return (
                    <FramedHeroCard
                      key={hero.id}
                      hero={hero}
                      level={level}
                      stars={stars}
                      isOwned={Boolean(owned)}
                      isDeployed={slotIdx !== -1}
                      isSelected={isSelected}
                      canUpgrade={canNotify}
                      testId={`hero-card-${hero.id}`}
                      onClick={() => {
                        state.setSelectedHeroId(hero.id);
                        setViewMode('detail');
                      }}
                    />
                  );
                })}
              </div>
            ) : (
              /* CLASSIC AFK ARENA PORTRAITS GALLERY (fdd16096: Heroes | Portraits) */
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                {filteredRoster.slice(0, 40).map((hero) => {
                  const isSelected = hero.id === selectedHero.id;
                  const facMeta =
                    REPO_FACTION_METADATA[getHeroRepoFaction(hero)];
                  return (
                    <button
                      key={hero.id}
                      type="button"
                      onClick={() => {
                        state.setSelectedHeroId(hero.id);
                        setViewMode('detail');
                      }}
                      className={`relative aspect-[1/1.55] rounded-xl border-2 border-[#c8963e] bg-gradient-to-b from-[#3d2817] to-[#170d06] p-1 flex flex-col items-center justify-between overflow-hidden shadow-md cursor-pointer ${
                        isSelected ? 'ring-2 ring-[#fde047]' : ''
                      }`}
                    >
                      <img
                        src={
                          hero.framedUrl ||
                          `/assets/heroes/${hero.id}_framed.webp`
                        }
                        alt={hero.name}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        className="w-full flex-1 object-cover rounded-lg"
                      />
                      <span className="text-[9px] font-extrabold text-[#f7d98c] truncate w-full text-center mt-0.5">
                        {hero.name.split(' ')[0]}
                      </span>
                      {facMeta && (
                        <img
                          src={facMeta.icon}
                          alt={facMeta.label}
                          className="w-3.5 h-3.5 rounded-full bg-[#1a1109] border border-[#d4af37] object-contain"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Hero Quick Inspector Strip (Keeps inspected-hero-power, btn-level-up-hero, upgrade-eq-* always mounted in DOM!) */}
          <div className="px-2.5 py-1.5 bg-[#e3c38d] border-t border-[#b8945e] flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setViewMode('detail')}
                className="flex items-center gap-1 font-extrabold text-[#3b2412] hover:underline cursor-pointer"
              >
                <span>{selectedHero.name}</span>
                <span
                  data-testid="inspected-hero-level"
                  className="px-1 rounded bg-[#4a3019] text-[#fde047] font-mono"
                >
                  Lvl {selectedOwned?.level ?? 1}
                </span>
                <span
                  data-testid="inspected-hero-power"
                  className="font-mono font-black text-[#7c2d12]"
                >
                  ✊ {previewStats.combatPower.toLocaleString()}
                </span>
              </button>
            </div>

            {selectedOwned ? (
              <div className="flex flex-wrap items-center gap-1">
                {(['weapon', 'armor', 'relic'] as const).map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    data-testid={`upgrade-eq-${slot}`}
                    onClick={() =>
                      state.upgradeEquipment(selectedHero.id, slot)
                    }
                    className="px-1.5 py-0.5 rounded bg-[#4a3019] text-[#fde047] font-mono text-[9px] font-bold cursor-pointer"
                  >
                    {slot === 'weapon'
                      ? '⚔️Wpn'
                      : slot === 'armor'
                        ? '🛡️Arm'
                        : '👑Rel'}{' '}
                    T{selectedOwned.equipment[slot]}
                  </button>
                ))}
                <button
                  type="button"
                  data-testid="btn-level-up-hero"
                  onClick={() => state.levelUpHero(selectedHero.id)}
                  className="px-2 py-0.5 rounded bg-gradient-to-b from-[#7ef3ff] to-[#0284c7] text-[#041624] font-black text-[9px] cursor-pointer"
                >
                  Level Up ({levelCost.gold.toLocaleString()}G)
                </button>
                <button
                  type="button"
                  data-testid="btn-ascend-hero"
                  onClick={() => state.ascendHeroStar(selectedHero.id)}
                  className="px-2 py-0.5 rounded bg-gradient-to-b from-[#fde047] to-[#ca8a04] text-[#241407] font-black text-[9px] cursor-pointer"
                >
                  Ascend ({selectedOwned.copies}/{selectedOwned.stars * 2})
                </button>
              </div>
            ) : (
              <button
                type="button"
                data-testid="btn-recruit-direct"
                onClick={() => state.recruitHeroDirect(selectedHero.id)}
                className="px-2.5 py-0.5 rounded bg-gradient-to-b from-[#7ef3ff] to-[#0284c7] text-[#041624] font-black text-[10px] cursor-pointer"
              >
                Recruit Hero
              </button>
            )}
          </div>

          {/* Classic AFK Arena Dark-Bronze Circular Faction Filter Pill + Heroes / Portraits Tabs (fdd16096, e4cb1de4) */}
          <div className="px-2 pt-1.5 pb-1 bg-[#d5b47f] border-t-2 border-[#a88252] space-y-1.5">
            {/* Dark Bronze Pill with ALL + 8 Circular Faction Icons */}
            <div className="flex items-center gap-1 bg-[#2b1a0e] border-2 border-[#8c6430] rounded-full px-2 py-1 overflow-x-auto shadow-inner">
              <button
                type="button"
                onClick={() => setFactionFilter('All')}
                className={`px-2.5 h-6 rounded-full border text-[10px] font-black flex items-center justify-center shrink-0 cursor-pointer ${
                  factionFilter === 'All'
                    ? 'bg-gradient-to-b from-[#f5d061] to-[#b8862d] text-[#241407] border-[#fef08a]'
                    : 'bg-[#1f1208] text-[#e5cba0] border-[#6e4b26]'
                }`}
              >
                ALL
              </button>
              {Object.entries(REPO_FACTION_METADATA).map(([facKey, meta]) => {
                const active = factionFilter === facKey;
                return (
                  <button
                    key={facKey}
                    type="button"
                    title={`${meta.label} (${meta.viLabel})`}
                    onClick={() => setFactionFilter(active ? 'All' : facKey)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-transform ${
                      active
                        ? 'bg-[#4d2f14] border-[#fde047] scale-110 shadow-[0_0_8px_rgba(253,224,71,0.75)]'
                        : 'bg-[#1a0f07] border-[#6e4b26] opacity-85 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={meta.icon}
                      alt={meta.label}
                      className="w-4 h-4 object-contain"
                    />
                  </button>
                );
              })}
            </div>

            {/* Classic AFK Arena Bottom Roster Tabs (fdd16096: Heroes | Portraits | Unions | Formations) */}
            <div className="grid grid-cols-4 gap-1">
              <button
                type="button"
                onClick={() => setRosterSubTab('heroes')}
                className={`py-1 rounded-t-lg border-2 text-[10px] font-black cursor-pointer ${
                  rosterSubTab !== 'portraits'
                    ? 'bg-gradient-to-b from-[#f3deb1] to-[#d6b272] border-[#fde047] text-[#3b2412] shadow'
                    : 'bg-[#4a3019] border-[#8c6430] text-[#d8be94]'
                }`}
              >
                Heroes ({HERO_ROSTER.length})
              </button>
              <button
                type="button"
                onClick={() => setRosterSubTab('portraits')}
                className={`py-1 rounded-t-lg border-2 text-[10px] font-black cursor-pointer relative ${
                  rosterSubTab === 'portraits'
                    ? 'bg-gradient-to-b from-[#f3deb1] to-[#d6b272] border-[#fde047] text-[#3b2412] shadow'
                    : 'bg-[#4a3019] border-[#8c6430] text-[#d8be94]'
                }`}
              >
                <span>Portraits</span>
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 text-white text-[7px] flex items-center justify-center absolute -top-1 right-1">
                  !
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRosterSubTab('popularity');
                  setViewMode('detail');
                }}
                className="py-1 rounded-t-lg bg-[#4a3019] border border-[#8c6430] text-[#d8be94] hover:text-[#fde047] text-[10px] font-extrabold cursor-pointer"
              >
                Hero Sanctuary
              </button>
              <button
                type="button"
                onClick={() => state.setActiveScreen('formation')}
                className="py-1 rounded-t-lg bg-[#4a3019] border border-[#8c6430] text-[#d8be94] hover:text-[#fde047] text-[10px] font-extrabold cursor-pointer"
              >
                Formations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 2: CLASSIC AFK ARENA HERO SANCTUARY (DETAIL)
          (Exact match to fa24f390 Lyca Gear, fb1a8508 Lyca Skills, fecdd506 Rem Ascended, da095baa Story Book)
         ===================================================================== */}
      {viewMode === 'detail' && (
        <div
          data-testid="companions-hero-detail-view"
          className={`relative z-10 flex-1 min-h-0 bg-gradient-to-b ${sanctuaryBgClass} text-[#fff3d6] flex flex-col justify-between p-2.5 overflow-y-auto`}
        >
          {/* Classic AFK Arena Golden Runic Magic Circle Sanctuary Backdrop SVG (fa24f390, fb1a8508, fecdd506) */}
          <svg
            viewBox="0 0 450 560"
            className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <radialGradient id="classicSanctuarySun" cx="50%" cy="32%" r="48%">
                <stop offset="0%" stopColor="#fde047" stopOpacity="0.45" />
                <stop offset="55%" stopColor="#d97706" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="classicRuneFloor" cx="50%" cy="72%" r="38%">
                <stop offset="0%" stopColor="#fde047" stopOpacity="0.55" />
                <stop offset="65%" stopColor="#b45309" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="225" cy="170" r="190" fill="url(#classicSanctuarySun)" />
            <ellipse cx="225" cy="395" rx="150" ry="44" fill="url(#classicRuneFloor)" />
            <ellipse
              cx="225"
              cy="395"
              rx="132"
              ry="34"
              fill="none"
              stroke="#fde047"
              strokeOpacity="0.65"
              strokeWidth="2"
            />
            <ellipse
              cx="225"
              cy="395"
              rx="105"
              ry="25"
              fill="none"
              stroke="#fef08a"
              strokeOpacity="0.45"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
          </svg>

          {/* TOP BAR: Left Story Book (da095baa) | Center 5 Stars + 9 Red Furniture Diamonds + Hero Name (fecdd506, fa24f390) | Right Share & Lock */}
          <div className="relative z-10 flex items-start justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setSanctuaryTab(sanctuaryTab === 'story' ? 'gear' : 'story')
                }
                className="relative px-2 py-1 rounded-lg bg-[#3b2512]/90 hover:bg-[#59381c] border border-[#d4af37] flex flex-col items-center cursor-pointer shadow"
              >
                <span className="w-3 h-3 rounded-full bg-red-600 border border-amber-200 text-[7px] text-white font-black flex items-center justify-center absolute -top-1 -right-1">
                  !
                </span>
                <BookOpen className="w-3.5 h-3.5 text-[#f5d061]" />
                <span className="text-[9px] font-extrabold text-[#fff2d1]">
                  Story
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowDuoSettingsModal(true)}
                className="px-2 py-1 rounded-lg bg-[#3b2512]/90 hover:bg-[#59381c] border border-[#d4af37] flex flex-col items-center cursor-pointer shadow"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[9px] font-extrabold text-[#fff2d1]">
                  Unions
                </span>
              </button>
            </div>

            {/* Top-Center: Classic AFK Arena 5 Gold Stars + 9 Red Mythic Furniture Diamonds + Hero Name & Title (fecdd506, fa24f390) */}
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-xs ${
                      i < (selectedOwned?.stars ?? 5)
                        ? 'text-[#fde047]'
                        : 'text-stone-600'
                    } drop-shadow`}
                  >
                    ★
                  </span>
                ))}
              </div>
              {/* 9 Red Mythic Furniture Diamonds (fecdd506) */}
              <div className="flex items-center gap-0.5 -mt-0.5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <span
                    key={i}
                    className="text-[8px] text-rose-500 drop-shadow-[0_1px_1px_rgba(0,0,0,0.95)]"
                  >
                    ♦
                  </span>
                ))}
              </div>
              <h3
                className="text-base font-black text-[#fde047] tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
                style={{ fontFamily: '"Cinzel", serif' }}
              >
                {selectedHero.name}
              </h3>
              <span className="text-[10px] font-bold text-[#e5cba0] drop-shadow">
                {selectedHero.title} · {selectedHero.rarity}
              </span>
            </div>

            {/* Top-Right Buttons: Skills + Lock */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSanctuaryTab('skills')}
                className="px-2 py-1 rounded-lg bg-[#3b2512]/90 hover:bg-[#59381c] border border-[#d4af37] flex flex-col items-center cursor-pointer shadow"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#f5d061]" />
                <span className="text-[9px] font-extrabold text-[#fff2d1]">
                  Skills
                </span>
              </button>

              <button
                type="button"
                data-testid="btn-toggle-hero-lock"
                onClick={() =>
                  setLockedHeroes((prev) => ({
                    ...prev,
                    [selectedHero.id]: !prev[selectedHero.id],
                  }))
                }
                title="Khóa / Mở khóa bảo vệ Tướng"
                className={`p-1.5 rounded-lg border flex flex-col items-center cursor-pointer shadow ${
                  isHeroLocked
                    ? 'bg-[#4d341c] border-[#fde047] text-[#fde047]'
                    : 'bg-[#2b1b0e]/85 border-[#8c6430] text-[#d8be94]'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="text-[8px] font-bold">
                  {isHeroLocked ? 'Locked' : 'Lock'}
                </span>
              </button>
            </div>
          </div>

          {/* CENTER STAGE: CLASSIC AFK ARENA GEAR + SI+30 + 9/9 FURNITURE (fa24f390) OR 4 SKILL MEDALLIONS (fb1a8508, fecdd506) */}
          {sanctuaryTab === 'story' ? (
            <div className="relative z-10 my-1 p-3 rounded-xl bg-gradient-to-b from-[#f3deb1] to-[#d5b47f] border-3 border-[#7c562b] text-[#3b2412] shadow-2xl space-y-2">
              <div className="flex items-center justify-between border-b border-[#9c723c] pb-1">
                <div>
                  <div className="text-[10px] font-bold uppercase text-[#7c5121]">
                    {selectedHero.title} · +100 Diamonds Lore Reward
                  </div>
                  <h4 className="text-sm font-black text-[#3b2412]">
                    Hero Biography — {selectedHero.name}
                  </h4>
                </div>
                <HeroAvatarSvg hero={selectedHero} size="sm" variant="framed" />
              </div>
              <p className="text-xs leading-relaxed text-[#4d2f14] italic">
                &ldquo;{selectedHero.lore}&rdquo;
              </p>
            </div>
          ) : (
            <div className="relative z-10 my-1 flex-1 flex flex-col items-center justify-center min-h-[210px]">
              {/* Left & Right Hero-Cycle Arrows (< and > matching fa24f390 & fb1a8508) */}
              <button
                type="button"
                onClick={() => handleCycleHero(-1)}
                title="Previous Hero"
                className="absolute left-1 bottom-3 z-20 w-7 h-7 rotate-45 bg-[#3b2512] hover:bg-[#59381c] border-2 border-[#fde047] flex items-center justify-center cursor-pointer shadow-lg"
              >
                <ChevronLeft className="w-4 h-4 -rotate-45 text-[#fde047]" />
              </button>
              <button
                type="button"
                onClick={() => handleCycleHero(1)}
                title="Next Hero"
                className="absolute right-1 bottom-3 z-20 w-7 h-7 rotate-45 bg-[#3b2512] hover:bg-[#59381c] border-2 border-[#fde047] flex items-center justify-center cursor-pointer shadow-lg"
              >
                <ChevronRight className="w-4 h-4 -rotate-45 text-[#fde047]" />
              </button>

              {sanctuaryTab === 'gear' ? (
                /* 6 CLASSIC AFK ARENA GEAR & EXCLUSIVE SLOTS FLANKING STANDING HERO (fa24f390) */
                <div className="w-full grid grid-cols-12 items-center gap-1 px-1">
                  {/* Left 3 Slots: Weapon, Helmet/Relic, Signature Item (+30) */}
                  <div className="col-span-3 flex flex-col items-center gap-2">
                    <button
                      type="button"
                      data-testid="upgrade-eq-weapon"
                      onClick={() =>
                        selectedOwned &&
                        state.upgradeEquipment(selectedHero.id, 'weapon')
                      }
                      className="relative w-14 h-14 rounded-xl bg-gradient-to-b from-[#7f1d1d] to-[#3b0a0a] border-2 border-[#ef4444] ring-1 ring-[#fde047] flex flex-col items-center justify-center cursor-pointer shadow-lg"
                    >
                      <img
                        src={selectedFactionMeta.icon}
                        alt=""
                        className="w-3.5 h-3.5 rounded-full bg-[#1a1109] border border-[#d4af37] absolute top-0.5 left-0.5 object-contain"
                      />
                      <Sword className="w-6 h-6 text-amber-200" />
                      <span className="text-[8px] font-mono font-bold text-[#fde047]">
                        T3 · Lv.{selectedOwned?.equipment.weapon ?? 1}
                      </span>
                    </button>

                    <button
                      type="button"
                      data-testid="upgrade-eq-relic"
                      onClick={() =>
                        selectedOwned &&
                        state.upgradeEquipment(selectedHero.id, 'relic')
                      }
                      className="relative w-14 h-14 rounded-xl bg-gradient-to-b from-[#7f1d1d] to-[#3b0a0a] border-2 border-[#ef4444] ring-1 ring-[#fde047] flex flex-col items-center justify-center cursor-pointer shadow-lg"
                    >
                      <img
                        src={selectedFactionMeta.icon}
                        alt=""
                        className="w-3.5 h-3.5 rounded-full bg-[#1a1109] border border-[#d4af37] absolute top-0.5 left-0.5 object-contain"
                      />
                      <Shield className="w-6 h-6 text-amber-200" />
                      <span className="text-[8px] font-mono font-bold text-[#fde047]">
                        Helm · Lv.{selectedOwned?.equipment.relic ?? 1}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setInspectedItemModal({
                          name: `${selectedHero.name}'s Signature Item (+30)`,
                          cnName: 'Signature Weapon · 专属装备 +30',
                          category: 'Signature Item',
                          count: 1,
                          badgeText: '+30',
                          desc: 'Tăng +25% Tấn Công, +18% Máu và mở khóa hiệu ứng Độc Quyền Cấp +30 trong mọi chế độ chiến đấu.',
                        })
                      }
                      className="relative w-14 h-14 rounded-xl bg-gradient-to-b from-[#713f12] to-[#271203] border-2 border-[#fde047] flex flex-col items-center justify-center cursor-pointer shadow-lg"
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-red-600 text-white text-[8px] font-black flex items-center justify-center absolute -top-1 -right-1">
                        !
                      </span>
                      <Sparkles className="w-6 h-6 text-[#fde047]" />
                      <span className="text-[8px] font-mono font-black text-[#fde047]">
                        SI +30
                      </span>
                    </button>
                  </div>

                  {/* Center Standing Full-Body Character Art on Golden Runic Circle */}
                  <div className="col-span-6 flex flex-col items-center justify-center">
                    <img
                      src={
                        selectedHero.battleUrl ||
                        selectedHero.framedUrl ||
                        `/assets/heroes/${selectedHero.id}_battle.webp`
                      }
                      alt={selectedHero.name}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="max-h-44 w-auto object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.92)]"
                    />
                  </div>

                  {/* Right 3 Slots: Mythic Armor, Mythic Boots, Dura's Artifact / Oak Inn 9/9 */}
                  <div className="col-span-3 flex flex-col items-center gap-2">
                    <button
                      type="button"
                      data-testid="upgrade-eq-armor"
                      onClick={() =>
                        selectedOwned &&
                        state.upgradeEquipment(selectedHero.id, 'armor')
                      }
                      className="relative w-14 h-14 rounded-xl bg-gradient-to-b from-[#7f1d1d] to-[#3b0a0a] border-2 border-[#ef4444] ring-1 ring-[#fde047] flex flex-col items-center justify-center cursor-pointer shadow-lg"
                    >
                      <img
                        src={selectedFactionMeta.icon}
                        alt=""
                        className="w-3.5 h-3.5 rounded-full bg-[#1a1109] border border-[#d4af37] absolute top-0.5 left-0.5 object-contain"
                      />
                      <Shield className="w-6 h-6 text-sky-200" />
                      <span className="text-[8px] font-mono font-bold text-[#fde047]">
                        Armor · Lv.{selectedOwned?.equipment.armor ?? 1}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        selectedOwned &&
                        state.upgradeEquipment(selectedHero.id, 'armor')
                      }
                      className="relative w-14 h-14 rounded-xl bg-gradient-to-b from-[#4c1d95] to-[#1e1b4b] border-2 border-[#a855f7] flex flex-col items-center justify-center cursor-pointer shadow-lg"
                    >
                      <Zap className="w-6 h-6 text-amber-200" />
                      <span className="text-[8px] font-mono font-bold text-purple-200">
                        Boots T2
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowBeastModal(true)}
                      title="Oak Inn Furniture 9/9 & Beasts"
                      className="relative w-14 h-14 rounded-xl bg-gradient-to-b from-[#7f1d1d] to-[#2a0606] border-2 border-[#fde047] flex flex-col items-center justify-center cursor-pointer shadow-lg"
                    >
                      <span className="text-sm text-rose-400 font-black">♦♦♦</span>
                      <span className="text-[8px] font-mono font-black text-[#fde047]">
                        Oak 9/9
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                /* CLASSIC AFK ARENA SKILLS SHOWCASE (fb1a8508 Lyca Skills & fecdd506 Rem Ascended) */
                <div className="w-full flex flex-col items-center gap-1.5 px-1">
                  <div className="w-full grid grid-cols-12 items-center gap-1">
                    {/* Left 2 Circular Gold-Rimmed Skill Medallions (ULTIMATE SKILL + Active Skill) */}
                    <div className="col-span-3 flex flex-col items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveSkillSlot('ultimate')}
                        className={`flex flex-col items-center cursor-pointer ${
                          activeSkillSlot === 'ultimate' ? 'scale-105' : 'opacity-85'
                        }`}
                      >
                        <span className="px-1.5 py-0.2 rounded bg-gradient-to-r from-[#f59e0b] to-[#fde047] text-[#1e1208] text-[7px] font-black uppercase mb-0.5">
                          ULTIMATE
                        </span>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-b from-[#991b1b] to-[#450a0a] border-2 border-[#fde047] flex items-center justify-center shadow-[0_0_12px_rgba(253,224,71,0.8)]">
                          <Sparkles className="w-5 h-5 text-[#fde047]" />
                        </div>
                        <span className="text-[9px] font-extrabold text-[#fff2d1] truncate max-w-[75px] mt-0.5">
                          {selectedHero.skills.ultimate.name}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveSkillSlot('active')}
                        className={`flex flex-col items-center cursor-pointer ${
                          activeSkillSlot === 'active' ? 'scale-105' : 'opacity-85'
                        }`}
                      >
                        <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#3b2512] to-[#1a0f07] border-2 border-[#d4af37] flex items-center justify-center shadow">
                          <Zap className="w-5 h-5 text-amber-300" />
                        </div>
                        <span className="text-[9px] font-bold text-[#e5cba0] truncate max-w-[75px] mt-0.5">
                          {selectedHero.skills.active.name}
                        </span>
                      </button>
                    </div>

                    {/* Center Standing Hero + Classic Dark Translucent Skill Description Box (fb1a8508) */}
                    <div className="col-span-6 flex flex-col items-center">
                      <img
                        src={
                          selectedHero.battleUrl ||
                          selectedHero.framedUrl ||
                          `/assets/heroes/${selectedHero.id}_battle.webp`
                        }
                        alt={selectedHero.name}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        className="max-h-32 w-auto object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.9)]"
                      />
                      <div className="w-full mt-1 px-2.5 py-1.5 rounded-xl bg-[#131d24]/95 border-2 border-[#b8893e] text-[#fff2d1] text-center shadow-xl">
                        <div className="text-[10px] font-black text-[#fde047] uppercase">
                          {inspectedSkill.name} (Lv.3)
                        </div>
                        <p className="text-[9px] text-[#e5cba0] line-clamp-2 leading-tight mt-0.5">
                          {inspectedSkill.description}
                        </p>
                      </div>
                    </div>

                    {/* Right 2 Circular Gold-Rimmed Skill Medallions (Passive + Engraved Skill) */}
                    <div className="col-span-3 flex flex-col items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveSkillSlot('passive')}
                        className={`flex flex-col items-center cursor-pointer ${
                          activeSkillSlot === 'passive' ? 'scale-105' : 'opacity-85'
                        }`}
                      >
                        <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#3b2512] to-[#1a0f07] border-2 border-[#d4af37] flex items-center justify-center shadow">
                          <Shield className="w-5 h-5 text-sky-300" />
                        </div>
                        <span className="text-[9px] font-bold text-[#e5cba0] truncate max-w-[75px] mt-0.5">
                          {selectedHero.skills.passive.name}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveSkillSlot('basic')}
                        className={`flex flex-col items-center cursor-pointer ${
                          activeSkillSlot === 'basic' ? 'scale-105' : 'opacity-85'
                        }`}
                      >
                        <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#3b2512] to-[#1a0f07] border-2 border-[#d4af37] flex items-center justify-center shadow">
                          <Sword className="w-5 h-5 text-emerald-300" />
                        </div>
                        <span className="text-[9px] font-bold text-[#e5cba0] truncate max-w-[75px] mt-0.5">
                          {selectedHero.skills.basic.name}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LOWER CLASSIC AFK ARENA SANCTUARY PANEL (Exact match to fa24f390 & fb1a8508) */}
          <div className="relative z-10 bg-gradient-to-b from-[#132226]/95 to-[#0b1417]/98 border-2 border-[#9c723c] rounded-xl p-2 space-y-1.5">
            {/* Row 1: Faction + Class + Ornate ✊ Combat Rating Banner + SI+30 + 9/9 Furniture */}
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-[#1a1109] border border-[#d4af37] flex items-center justify-center">
                  <img
                    src={selectedFactionMeta.icon}
                    alt={selectedFactionMeta.label}
                    className="w-4 h-4 object-contain"
                  />
                </div>
                <div className="w-7 h-7 rounded-full bg-[#143322] border border-[#4ade80] flex items-center justify-center">
                  {CLASS_ICONS[selectedHero.heroClass]}
                </div>
              </div>

              <div className="flex-1 max-w-[180px] py-0.5 px-3 rounded-full bg-[#162028] border-2 border-[#b8893e] flex items-center justify-center gap-1.5 shadow-inner">
                <span className="w-4 h-4 rounded-full bg-gradient-to-b from-[#fde047] to-[#b45309] text-[#1e1209] flex items-center justify-center text-[10px] font-black">
                  ✊
                </span>
                <span
                  data-testid="inspected-hero-power"
                  className="text-base font-mono font-black text-[#fde047] tabular-nums"
                >
                  {previewStats.combatPower.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded bg-[#3b2512] border border-[#fde047] text-[9px] font-mono font-black text-[#fde047]">
                  SI+30
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#450a0a] border border-rose-400 text-[9px] font-mono font-black text-rose-200">
                  9/9F
                </span>
              </div>
            </div>

            {/* Row 2: Classic AFK Arena Stat Block: LVL 240 | ❤️ HP | ⚔️ ATK | 🛡️ DEF | [!] (fa24f390, fb1a8508) */}
            <div className="flex items-center justify-between px-2 py-1 rounded bg-black/45 border border-[#6e4b26]/60 font-mono text-[11px] tabular-nums">
              <span
                data-testid="inspected-hero-level"
                className="font-black text-[#fde047]"
              >
                LVL {selectedOwned ? selectedOwned.level : 1}/240
              </span>
              <span className="text-[#fca5a5] font-bold">
                ❤️ {previewStats.hp.toLocaleString()}
              </span>
              <span className="text-[#fde68a] font-bold">
                ⚔️ {previewStats.attack.toLocaleString()}
              </span>
              <span className="text-[#93c5fd] font-bold">
                🛡️ {previewStats.defense.toLocaleString()}
              </span>
              <span className="w-4 h-4 rotate-45 bg-[#3b2512] border border-[#d4af37] flex items-center justify-center text-[9px] text-[#fde047]">
                <span className="-rotate-45">!</span>
              </span>
            </div>

            {/* Row 3: Classic AFK Arena Ascend Card + Glowing Cyan Hexagonal Level Up Button (fa24f390) */}
            {selectedOwned ? (
              <div className="grid grid-cols-12 gap-2 items-center pt-0.5">
                <button
                  type="button"
                  data-testid="btn-ascend-hero"
                  onClick={() => state.ascendHeroStar(selectedHero.id)}
                  className="col-span-5 p-1.5 rounded-xl bg-gradient-to-r from-[#fef08a] via-[#fde047] to-[#f59e0b] border-2 border-white text-[#241407] flex items-center gap-1.5 cursor-pointer shadow-[0_0_16px_rgba(253,224,71,0.75)]"
                >
                  <div className="w-7 h-7 rounded bg-[#312e81] border border-[#4f46e5] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-sky-200" />
                  </div>
                  <div className="text-left leading-tight flex-1">
                    <div className="text-[10px] font-black uppercase">
                      Ascend ★
                    </div>
                    <div className="px-1.5 py-0.2 rounded-full bg-emerald-700 text-white font-mono text-[9px] font-black inline-block mt-0.5">
                      {selectedOwned.copies}/{selectedOwned.stars * 2}
                    </div>
                  </div>
                </button>

                {/* Classic AFK Arena Glowing Cyan Level Up Button */}
                <div className="col-span-7 flex flex-col items-center">
                  <span className="text-[9px] text-[#e5cba0] font-mono mb-0.5">
                    Gold: {levelCost.gold.toLocaleString()} · EXP:{' '}
                    {levelCost.heroExp.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    data-testid="btn-level-up-hero"
                    onClick={() => state.levelUpHero(selectedHero.id)}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-b from-[#7ef3ff] via-[#22d3ee] to-[#0284c7] hover:brightness-110 border-2 border-[#cffafe] text-[#041624] font-black text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_18px_rgba(34,211,238,0.55)]"
                  >
                    Level Up (Lvl {selectedOwned.level + 1})
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-1.5 rounded-xl bg-black/45 border border-[#d4af37]">
                <span className="text-xs font-bold text-[#fde047]">
                  Recruit {selectedHero.name}
                </span>
                <button
                  type="button"
                  data-testid="btn-recruit-direct"
                  onClick={() => state.recruitHeroDirect(selectedHero.id)}
                  className="px-3 py-1 rounded-lg bg-gradient-to-b from-[#7ef3ff] to-[#0284c7] text-[#041624] font-black text-xs cursor-pointer"
                >
                  Recruit Now
                </button>
              </div>
            )}

            {/* Row 4: Bottom Back Ribbon Button (↩) + Classic Hero Sanctuary Tabs: Heroes (Gear) | Skills | Story (fa24f390, fb1a8508) */}
            <div className="flex items-center justify-between pt-1 border-t border-[#8c6430]/50">
              <button
                type="button"
                data-testid="btn-back-to-roster"
                onClick={() => setViewMode('roster')}
                className="px-3.5 py-1 rounded-r-xl bg-gradient-to-b from-[#6e4b26] to-[#3d2714] border-2 border-[#b8893e] text-[#fde047] font-black text-xs flex items-center gap-1 cursor-pointer shadow"
              >
                <CornerUpLeft className="w-3.5 h-3.5" />
                <span>Heroes</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSanctuaryTab('gear')}
                  className={`px-3 py-1 rounded-lg border-2 text-[10px] font-black cursor-pointer ${
                    sanctuaryTab === 'gear'
                      ? 'bg-gradient-to-b from-[#f5d061] to-[#b8862d] text-[#241407] border-[#fef08a]'
                      : 'bg-[#24160c] text-[#d8be94] border-[#8c6430]'
                  }`}
                >
                  🛡️ Gear &amp; SI
                </button>
                <button
                  type="button"
                  onClick={() => setSanctuaryTab('skills')}
                  className={`relative px-3 py-1 rounded-lg border-2 text-[10px] font-black cursor-pointer ${
                    sanctuaryTab === 'skills'
                      ? 'bg-gradient-to-b from-[#f5d061] to-[#b8862d] text-[#241407] border-[#fef08a]'
                      : 'bg-[#24160c] text-[#d8be94] border-[#8c6430]'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-red-600 text-white text-[8px] flex items-center justify-center absolute -top-1 -right-1">
                    !
                  </span>
                  <span>✨ Skills (4)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSanctuaryTab('story')}
                  className={`px-2.5 py-1 rounded-lg border-2 text-[10px] font-black cursor-pointer ${
                    sanctuaryTab === 'story'
                      ? 'bg-gradient-to-b from-[#f5d061] to-[#b8862d] text-[#241407] border-[#fef08a]'
                      : 'bg-[#24160c] text-[#d8be94] border-[#8c6430]'
                  }`}
                >
                  📖 Story
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL A: BEAST SELECTION BAR & COMPASS SLOTS (Matching 06_beast_select.png)
         ===================================================================== */}
      {showBeastModal && (
        <div
          role="dialog"
          aria-label="Chọn Linh Thú Đồng Hành"
          data-testid="beast-select-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        >
          <div className="w-full max-w-md bg-[#24160c] border-3 border-[#b8893e] rounded-2xl p-4 text-[#fff2d1] shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#8c6430] pb-2">
              <h3 className="text-sm font-black uppercase text-[#fde047]">
                Linh Thú Đồng Hành · Beast Sanctuary (06_beast_select)
              </h3>
              <button
                type="button"
                onClick={() => setShowBeastModal(false)}
                className="p-1 rounded bg-[#4a3019] text-amber-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 4 Cut-Corner Square Beast Portraits with Compass Watermarks (Exact match to 06_beast_select.png) */}
            <div className="grid grid-cols-4 gap-2.5 py-2">
              {COMPANIONS_BEASTS.map((beast) => {
                const active = beast.id === selectedBeastId;
                return (
                  <button
                    key={beast.id}
                    type="button"
                    onClick={() => setSelectedBeastId(beast.id)}
                    className={`relative aspect-square rounded-tl-md rounded-tr-md rounded-bl-md rounded-br-2xl bg-gradient-to-b ${beast.color} border-2 flex flex-col items-center justify-center cursor-pointer transition-transform ${
                      active
                        ? 'border-[#fde047] ring-2 ring-[#fde047] scale-105'
                        : 'border-[#6e4b26] opacity-85 hover:opacity-100'
                    }`}
                  >
                    <span className="text-2xl">{beast.emoji}</span>
                    <span className="text-[9px] font-mono font-bold text-[#fde047] mt-1">
                      {beast.level}级
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-2.5 rounded-xl bg-[#180e07] border border-[#8c6430] text-xs space-y-1">
              <div className="font-extrabold text-[#fde047]">
                {selectedBeast.name} ({selectedBeast.cnName}) — Cấp{' '}
                {selectedBeast.level}
              </div>
              <div className="text-emerald-300 text-[11px]">
                Hiệu ứng trợ chiến: {selectedBeast.buffText}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowBeastModal(false)}
                className="px-5 py-1.5 rounded-full bg-gradient-to-b from-[#f5d061] to-[#b8862d] text-[#241407] font-black text-xs cursor-pointer"
              >
                Xác Nhận Linh Thú
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL B: DUO CO-OP INVITE SETTINGS & COOLDOWN WARNING (Matching 14, 15, 16)
         ===================================================================== */}
      {showDuoSettingsModal && (
        <div
          role="dialog"
          aria-label="Cài Đặt Lời Mời Tổ Đội"
          data-testid="duo-settings-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        >
          <div className="relative w-full max-w-sm">
            {/* Tilted Back Parchment Sheet (Exact match to 15_duo_invite_settings.png) */}
            <div className="absolute inset-0 bg-[#d5b47f] border-2 border-[#8c6430] rounded-xl -rotate-2 shadow-xl" />

            {/* Main Parchment Sheet */}
            <div className="relative bg-gradient-to-b from-[#f3deb1] via-[#e7cba0] to-[#d5b47f] border-3 border-[#8c6430] rounded-xl p-4 text-[#4a321f] shadow-2xl space-y-3">
              {/* Top Dark-Brown Banner Header: 邀请设置 */}
              <div className="mx-auto w-4/5 py-1.5 rounded-full bg-gradient-to-r from-[#593a22] via-[#734b2c] to-[#593a22] border-2 border-[#b8893e] text-center text-[#fff5dc] font-black text-sm shadow">
                Cài Đặt Lời Mời · 邀请设置
              </div>

              {/* 3 Toggle Switches + 1 Checkbox (Exact match to 15_duo_invite_settings.png) */}
              <div className="space-y-2.5 pt-1 text-xs font-bold">
                {[
                  {
                    key: 'friendsInvite' as const,
                    label: 'Lời mời tổ đội từ Bạn Bè (来自好友的组队邀请)',
                  },
                  {
                    key: 'guildInvite' as const,
                    label:
                      'Lời mời từ Thành Viên Công Hội (来自公会成员的组队邀请)',
                  },
                  {
                    key: 'strangerInvite' as const,
                    label:
                      'Lời mời từ Người Chơi Khác (来自其他玩家的组队邀请)',
                  },
                ].map((item) => {
                  const isOn = duoSettings[item.key];
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-2 border-b border-[#b8945e]/60 pb-2"
                    >
                      <span>{item.label}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setDuoSettings((s) => ({
                            ...s,
                            [item.key]: !s[item.key],
                          }))
                        }
                        className={`w-12 h-6 rounded-full p-0.5 border transition-colors cursor-pointer flex items-center ${
                          isOn
                            ? 'bg-[#593a22] border-[#b8893e] justify-end'
                            : 'bg-[#bfa06b] border-[#8c6430] justify-start'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-gradient-to-b from-[#fde047] to-[#ca8a04] border border-white shadow" />
                      </button>
                    </div>
                  );
                })}

                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={duoSettings.muteStrangerToday}
                    onChange={(e) =>
                      setDuoSettings((s) => ({
                        ...s,
                        muteStrangerToday: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <span className="text-[11px]">
                    Hôm nay không nhắc lại lời mời từ người lạ (今日不再提醒)
                  </span>
                </label>
              </div>

              {/* Co-op Chapter Mismatch Cooldown Warning Box (Exact match to 14_duo_cooldown_2h44.png & 16_duo_cooldown_37min.png) */}
              <div className="p-2.5 rounded-lg bg-[#2b1b10] border border-[#b8893e] text-[11px] text-[#fff2d1] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#fde047] font-extrabold">
                    Trạng Thái Tổ Đội Vượt Ải:
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setDuoCooldownMode('2h44')}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono cursor-pointer ${
                        duoCooldownMode === '2h44'
                          ? 'bg-red-700 text-white'
                          : 'bg-[#4a3019] text-amber-200'
                      }`}
                    >
                      2h44p
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuoCooldownMode('37m')}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono cursor-pointer ${
                        duoCooldownMode === '37m'
                          ? 'bg-red-700 text-white'
                          : 'bg-[#4a3019] text-amber-200'
                      }`}
                    >
                      37p12s
                    </button>
                  </div>
                </div>
                <p className="leading-snug text-[#e5cba0]">
                  Do chương chiến dịch hiện tại khác biệt với đồng đội trước đó, cần chờ thời gian hồi để nhận thưởng tổ đội tiếp theo:
                </p>
                <div className="font-mono font-black text-red-400 text-center">
                  {duoCooldownMode === '2h44'
                    ? 'Thời gian hồi: 2 giờ 44 phút 49 giây (2小时44分49秒)'
                    : 'Thời gian hồi: 37 phút 12 giây (37分12秒)'}
                </div>
              </div>

              {/* Bottom Hexagonal Brown Close Button (关闭) */}
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  data-testid="btn-close-duo-modal"
                  onClick={() => setShowDuoSettingsModal(false)}
                  className="px-10 py-2 rounded-full bg-gradient-to-b from-[#9c6f44] to-[#5e3d1e] border-2 border-[#d4af37] text-[#fff5dc] font-black text-xs cursor-pointer shadow-lg"
                >
                  Đóng · 关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL C: PARCHMENT ITEM TOOLTIP (Exact match to 17_item_tooltip_guild_wagon_screw.jpg)
         ===================================================================== */}
      {inspectedItemModal && (
        <div
          role="dialog"
          aria-label="Chi Tiết Vật Phẩm"
          data-testid="item-tooltip-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        >
          <div className="relative w-full max-w-sm">
            {/* Tilted Double-Layer Parchment Backing */}
            <div className="absolute inset-0 bg-[#d5b47f] border-2 border-[#8c6430] rounded-xl -rotate-2 shadow-xl" />

            <div className="relative bg-gradient-to-b from-[#f3deb1] via-[#e7cba0] to-[#d5b47f] border-3 border-[#8c6430] rounded-xl p-4 text-[#4a321f] shadow-2xl space-y-3">
              {/* Top-Right Circular Brown X Close Button (17_item_tooltip_guild_wagon_screw.jpg) */}
              <button
                type="button"
                data-testid="btn-close-item-tooltip"
                onClick={() => setInspectedItemModal(null)}
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-b from-[#734b2c] to-[#3d2514] border-2 border-[#d4af37] text-[#fde047] flex items-center justify-center cursor-pointer shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Item Header with Purple Cut-Corner Frame + Magic Circle Watermark */}
              <div className="flex items-center gap-3 pt-1">
                <div className="relative w-16 h-16 rounded-tl-md rounded-tr-md rounded-bl-md rounded-br-2xl bg-gradient-to-b from-[#581c87] to-[#2e1065] border-2 border-[#a855f7] flex items-center justify-center shadow-md shrink-0">
                  <span className="text-2xl">🔩</span>
                  <span className="absolute bottom-0.5 right-1.5 font-mono text-[10px] font-black text-white drop-shadow">
                    {inspectedItemModal.badgeText}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-[#4a321f]">
                    {inspectedItemModal.name}
                  </h4>
                  <div className="text-[10px] font-bold text-[#7c562b]">
                    {inspectedItemModal.cnName}
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="px-2 py-0.5 rounded bg-[#a67c46] text-white text-[10px] font-bold">
                      {inspectedItemModal.category}
                    </span>
                    <span className="text-[11px] font-bold text-[#6e4f2d]">
                      Đang có: 🎒 {inspectedItemModal.count}
                    </span>
                  </div>
                </div>
              </div>

              {/* Light Parchment Divider Banner: 物品描述 */}
              <div className="py-1 rounded bg-[#faeccf] border-y border-[#c9ab78] text-center text-xs font-extrabold text-[#6e4f2d]">
                Mô Tả Vật Phẩm · 物品描述
              </div>

              <p className="text-xs leading-relaxed text-[#4a321f] px-1">
                {inspectedItemModal.desc}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 4. CAMPAIGN MAP & WORLD MAP & AFK REWARDS PARCHMENT (Matching f3209d6a, f59f7bc4, f6ad29da)
// ============================================================================
export const CampaignMapPanel: React.FC<{ onCloseToBattle: () => void }> = ({
  onCloseToBattle,
}) => {
  const state = useGameStore();
  const [campaignView, setCampaignView] = useState<
    'stages' | 'worldmap' | 'afkrewards'
  >('stages');
  const currentStage = getCampaignStage(state.currentStageId);
  const idleMinutes = Math.max(1, Math.floor(state.idleAccumulatedSeconds / 60));

  return (
    <div
      data-testid="screen-campaign"
      className="w-full bg-gradient-to-b from-[#f3e3c3] via-[#ebd5ab] to-[#dcc08e] border-2 border-[#6e4b26] rounded-xl shadow-[0_12px_50px_rgba(0,0,0,0.95)] overflow-hidden text-[#3b2412] flex flex-col"
    >
      {/* Ornate Carved Wood Header */}
      <div className="px-3 py-2 bg-gradient-to-b from-[#4a3019] via-[#34200f] to-[#241509] border-b-2 border-[#b8893e] text-[#fff2d1] space-y-1.5">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <h2
              className="text-xs font-extrabold tracking-wider uppercase text-[#fde047] truncate"
              style={{ fontFamily: '"Cinzel", serif' }}
            >
              Campaign — Chiến Dịch Lục Địa Esperia
            </h2>
            <p className="text-[10px] text-[#e5cba0] truncate">
              Chương 1–20 · Rương Thưởng AFK · Khiêu chiến 10 Ải
            </p>
          </div>
          <button
            type="button"
            onClick={onCloseToBattle}
            className="px-3 py-1 rounded-lg bg-gradient-to-b from-[#7ef3ff] via-[#22d3ee] to-[#0284c7] text-[#041624] text-[10px] font-black uppercase cursor-pointer shadow shrink-0"
          >
            ⚔️ Begin
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setCampaignView('stages')}
            className={`py-1 px-2 rounded-lg text-[10px] font-extrabold cursor-pointer truncate ${
              campaignView === 'stages'
                ? 'bg-[#d4af37] text-[#1e1209]'
                : 'bg-[#3b2512] text-[#e5cba0] border border-[#8c6430]'
            }`}
          >
            Danh Sách Ải (1–10)
          </button>
          <button
            type="button"
            onClick={() => setCampaignView('worldmap')}
            className={`py-1 px-2 rounded-lg text-[10px] font-extrabold cursor-pointer truncate ${
              campaignView === 'worldmap'
                ? 'bg-[#d4af37] text-[#1e1209]'
                : 'bg-[#3b2512] text-[#e5cba0] border border-[#8c6430]'
            }`}
          >
            World Map
          </button>
          <button
            type="button"
            onClick={() => setCampaignView('afkrewards')}
            className={`py-1 px-2 rounded-lg text-[10px] font-extrabold cursor-pointer truncate ${
              campaignView === 'afkrewards'
                ? 'bg-[#38bdf8] text-[#041019]'
                : 'bg-[#3b2512] text-[#fde047] border border-[#8c6430]'
            }`}
          >
            AFK ({idleMinutes}p)
          </button>
        </div>
      </div>

      {campaignView === 'stages' && (
        <div className="p-2.5 flex flex-col gap-2">
          {CAMPAIGN_STAGES.map((stage) => {
            const isUnlocked = stage.id <= state.maxUnlockedStageId;
            const isCleared = state.clearedStageIds.includes(stage.id);
            const isCurrent = stage.id === state.currentStageId;

            return (
              <div
                key={stage.id}
                data-testid={`campaign-stage-${stage.id}`}
                className={`p-2.5 rounded-xl border-2 flex flex-col justify-between gap-2 shadow-sm min-w-0 ${
                  isCurrent
                    ? 'bg-[#fff8ea] border-[#d97706] ring-1 ring-[#f59e0b]'
                    : isUnlocked
                      ? 'bg-[#faf0dc] border-[#9c723c]'
                      : 'bg-[#e2c99b]/70 border-[#a88b65] opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-[#4a3019] text-[10px] font-mono font-bold text-[#fde047] shrink-0">
                        {stage.chapter}
                      </span>
                      {isCleared && (
                        <span className="text-[10px] font-extrabold text-emerald-700 flex items-center gap-0.5 shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" /> Cleared
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-black text-[#3b2412] mt-0.5 truncate">
                      {stage.name}
                    </h3>
                    <p className="text-[10px] text-[#6b4826] font-mono tabular-nums truncate">
                      ✊ Lực Chiến Đề Xuất: {stage.recommendedPower.toLocaleString()}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={!isUnlocked}
                    data-testid={`start-stage-${stage.id}`}
                    onClick={() => state.selectCampaignStage(stage.id, true)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase cursor-pointer shrink-0 shadow ${
                      isUnlocked
                        ? 'bg-gradient-to-b from-[#7ef3ff] via-[#22d3ee] to-[#0284c7] hover:brightness-110 text-[#041624] border border-cyan-100'
                        : 'bg-[#bfa06b] text-[#6b4826] cursor-not-allowed'
                    }`}
                  >
                    {isUnlocked
                      ? isCleared
                        ? 'Đánh Lại'
                        : 'Khiêu Chiến'
                      : 'Chưa Mở'}
                  </button>
                </div>

                {/* Enemy Formation Lineup Preview */}
                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[#c9ab78] min-w-0">
                  <div className="flex items-center gap-1 shrink-0">
                    {stage.enemies.map((en, i) => {
                      const h = getHeroById(en.heroId);
                      return (
                        <div
                          key={i}
                          className="relative"
                          title={`${h.name} Lv.${en.level}`}
                        >
                          <HeroAvatarSvg hero={h} size="sm" variant="framed" />
                          <span className="absolute -bottom-0.5 right-0 bg-[#2b1b0e] px-0.5 rounded text-[7px] font-mono text-[#fde047]">
                            Lv.{en.level}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-right text-[9.5px] font-mono text-[#5c3818] tabular-nums min-w-0 truncate">
                    <div className="font-bold truncate">
                      {isCleared ? 'Thưởng Lại:' : 'Thưởng Đầu:'}
                    </div>
                    <div className="truncate">
                      +
                      {(isCleared
                        ? stage.replayRewards.gold
                        : stage.firstClearRewards.gold
                      ).toLocaleString()}
                      G · +
                      {isCleared
                        ? stage.replayRewards.essenceGems
                        : stage.firstClearRewards.essenceGems}{' '}
                      💎
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {campaignView === 'worldmap' && (
        <div className="p-3 flex flex-col gap-3">
          <img
            src="/assets/aistudio/f6ad29da-2348-11ef-85c2-02420a000190_4ccb1cbf.webp"
            alt="Esperia World Map"
            className="max-h-[240px] w-full rounded-xl border-2 border-[#7c562b] object-cover shadow-lg"
          />
          <div className="space-y-2">
            <h3
              className="text-xs font-extrabold text-[#4d2f14] uppercase truncate"
              style={{ fontFamily: '"Cinzel", serif' }}
            >
              World Map — Bản Đồ Lục Địa Esperia (Chương 1 – 20)
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {CAMPAIGN_STAGES.slice(0, 6).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => state.selectCampaignStage(st.id, true)}
                  className="p-2 rounded-xl bg-[#faf0dc] hover:bg-[#fff8ea] border border-[#9c723c] text-left cursor-pointer shadow-sm min-w-0"
                >
                  <div className="text-[9px] font-mono text-[#8c5820] font-bold">
                    {st.chapter}
                  </div>
                  <div className="text-xs font-extrabold text-[#3b2412] truncate">
                    {st.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {campaignView === 'afkrewards' && (
        <div className="p-3 flex flex-col gap-3">
          <div className="bg-[#faf0dc] text-[#3a2614] border-2 border-[#8c6430] rounded-xl p-3 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#9a7422]/40 pb-1.5">
              <h3
                className="text-xs font-extrabold uppercase text-[#5c3a18]"
                style={{ fontFamily: '"Cinzel", serif' }}
              >
                AFK Timer &amp; AFK Rewards
              </h3>
              <span className="font-mono text-[10px] font-bold bg-[#3a2614] text-amber-300 px-2 py-0.5 rounded-full">
                12:00:00 ({idleMinutes}m)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-xs">
              <div className="p-2 rounded-lg bg-[#e6d2a4] border border-[#9a7422]/50">
                <div className="text-[9px] font-bold">GOLD / M</div>
                <div className="text-xs font-black text-amber-800">
                  +{(currentStage.id * 46).toLocaleString()}/m
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#e6d2a4] border border-[#9a7422]/50">
                <div className="text-[9px] font-bold">EXP / M</div>
                <div className="text-xs font-black text-emerald-800">
                  +{(currentStage.id * 62).toLocaleString()}/m
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#e6d2a4] border border-[#9a7422]/50">
                <div className="text-[9px] font-bold">ESSENCE / D</div>
                <div className="text-xs font-black text-purple-800">
                  +{(currentStage.id * 120).toLocaleString()}/d
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCampaignView('stages')}
                className="px-4 py-1.5 rounded-xl bg-[#8c6239] text-amber-100 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  state.claimIdleTribute();
                  setCampaignView('stages');
                }}
                className="px-5 py-1.5 rounded-xl bg-gradient-to-b from-[#7ef3ff] to-[#0284c7] text-[#041624] font-black text-xs uppercase cursor-pointer shadow"
              >
                Collect · Nhận Ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 5. THE NOBLE TAVERN SCREEN (Matching e5c92df8 Dolly Tavern, e7abfc04 Parchment Wishlist, e88485e2 Tarot Cards)
// ============================================================================
export const SummonSanctumPanel: React.FC<{ onCloseToBattle: () => void }> = ({
  onCloseToBattle,
}) => {
  const state = useGameStore();
  const [showWishlistModal, setShowWishlistModal] = useState<boolean>(false);

  return (
    <div
      data-testid="screen-summon"
      className="w-full max-w-6xl mx-auto bg-gradient-to-b from-[#3b2413] via-[#29180c] to-[#1a0f07] border-4 border-[#a87e3b] rounded-2xl shadow-[0_12px_50px_rgba(0,0,0,0.95)] overflow-hidden text-[#fff2d1] relative"
    >
      {/* Top Tavern Bar: Pity Progress 12/30 + Wishlist Button + Free Supply */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 bg-gradient-to-b from-[#4a3019] to-[#2b1b0e] border-b-2 border-[#a87e3b]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowWishlistModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-b from-[#f5d061] to-[#b8862d] text-[#241509] font-extrabold text-xs cursor-pointer shadow"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Wishlist ( Nguyện Ước 4 Tộc )
          </button>

          <div>
            <h2
              className="text-sm sm:text-base font-extrabold tracking-wider uppercase text-[#fde047]"
              style={{ fontFamily: '"Cinzel", serif' }}
            >
              The Noble Tavern — Quán Rượu Quý Tộc Dolly
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-32 h-2 bg-[#140b05] border border-[#8c6430] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#f59e0b] to-[#fde047]"
                  style={{ width: `${Math.min(100, state.pityCounter * 10)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-[#fde047] font-bold">
                {state.pityCounter}/10 Bảo Hiểm Elite
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="btn-free-sanctum-gift"
            onClick={() => state.claimFreeSanctumGift()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 border border-emerald-300 text-xs font-extrabold text-white cursor-pointer shadow"
          >
            <Gift className="w-3.5 h-3.5" />
            Tiếp Tế (+10 Cuộn &amp; +2.400 Kim Cương)
          </button>
          <button
            type="button"
            onClick={onCloseToBattle}
            className="px-3 py-1.5 rounded-xl bg-[#4a3019] border border-[#b8893e] text-xs font-bold text-[#fde047] cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>

      <div className="p-3 flex flex-col gap-3">
        {/* Top: Dolly Tavern Counter & Gold Summon Buttons */}
        <div className="bg-gradient-to-b from-[#452b16] to-[#26160a] border-2 border-[#c89b4b] rounded-xl p-2.5 flex flex-col gap-2.5 shadow-lg">
          <div className="relative rounded-xl overflow-hidden border border-[#a87e3b] h-40 bg-[#1a0f07]">
            <img
              src="/assets/aistudio/e5c92df8-2348-11ef-834c-02420a00018d_edbebfd3.webp"
              alt="Dolly at The Noble Tavern"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute bottom-1.5 inset-x-1.5 p-1.5 rounded-lg bg-black/80 border border-[#c89b4b] text-[10px] text-[#fff2d1] line-clamp-2">
              <strong className="text-[#fde047]">Dolly:</strong> &ldquo;I&apos;m your one and only lucky charm! Trust me for the best Elite cards!&rdquo;
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              data-testid="btn-summon-1"
              onClick={() => state.summonHeroes(1)}
              className="py-2 px-3 rounded-xl bg-gradient-to-b from-[#f3d89c] via-[#d4a853] to-[#966b22] hover:brightness-110 border-2 border-[#fff2c2] text-[#241407] font-black text-xs cursor-pointer shadow"
            >
              <div>Summon x1</div>
              <div className="text-[10px] font-mono font-bold">
                📜 {state.summonScrolls >= 1 ? '1 Cuộn' : '300 💎'}
              </div>
            </button>

            <button
              type="button"
              data-testid="btn-summon-10"
              onClick={() => state.summonHeroes(10)}
              className="py-2 px-3 rounded-xl bg-gradient-to-b from-[#f3d89c] via-[#d4a853] to-[#966b22] hover:brightness-110 border-2 border-[#fff2c2] text-[#241407] font-black text-xs cursor-pointer shadow"
            >
              <div>Summon x10</div>
              <div className="text-[10px] font-mono font-bold">
                📜 {state.summonScrolls >= 10 ? '10 Cuộn' : '2700 💎'}
              </div>
            </button>
          </div>
        </div>

        {/* Bottom: Tarot Flip Results OR Parchment Hero Pool */}
        <div className="bg-gradient-to-b from-[#f3e3c3] via-[#ebd5ab] to-[#dcc08e] border-2 border-[#8c6430] rounded-xl p-2.5 text-[#3b2412] flex flex-col">
          <div className="flex items-center justify-between mb-2 border-b border-[#b8945e] pb-1 gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4d2f14] truncate">
              {state.lastSummonResults.length > 0
                ? `Kết Quả Lật Bài (${state.lastSummonResults.length} Thẻ)`
                : `Anh Hùng Quán Rượu (${HERO_ROSTER.length})`}
            </span>
            {state.lastSummonResults.length > 0 && (
              <button
                type="button"
                onClick={() => state.clearSummonResults()}
                className="text-[10px] font-bold text-[#6e4826] hover:text-[#3b2412] flex items-center gap-1 cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Danh Sách</span>
              </button>
            )}
          </div>

          {state.lastSummonResults.length > 0 ? (
            <div
              data-testid="summon-results-grid"
              className="grid grid-cols-5 gap-1.5"
            >
              {state.lastSummonResults.map((item, idx) => (
                <button
                  key={`${item.hero.id}_${idx}`}
                  type="button"
                  onClick={() => state.setActiveScreen('details', item.hero.id)}
                  className={`p-1.5 rounded-xl border-2 flex flex-col items-center text-center cursor-pointer shadow min-w-0 ${
                    item.hero.rarity === 'Ascended'
                      ? 'bg-gradient-to-b from-[#4c1d95] to-[#1e1035] border-[#fde047] text-[#fff2d1]'
                      : 'bg-gradient-to-b from-[#1e3a8a] to-[#0f172a] border-[#60a5fa] text-white'
                  }`}
                >
                  <HeroAvatarSvg hero={item.hero} size="sm" variant="framed" />
                  <div className="text-[9px] font-extrabold truncate w-full mt-1">
                    {item.hero.name}
                  </div>
                  <span className="text-[8px] font-mono font-bold text-emerald-300 truncate w-full">
                    {item.isNew ? 'NEW!' : `+${item.copiesGranted}`}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-1.5 max-h-[220px] overflow-y-auto pr-0.5">
              {HERO_ROSTER.slice(0, 40).map((hero) => {
                const isOwned = Boolean(state.ownedHeroes[hero.id]);
                const facMeta = REPO_FACTION_METADATA[getHeroRepoFaction(hero)];
                return (
                  <button
                    key={hero.id}
                    type="button"
                    onClick={() => state.setActiveScreen('details', hero.id)}
                    className="p-1 rounded-lg bg-[#faf0dc] border border-[#9c723c] hover:border-[#4d2f14] flex flex-col items-center text-center cursor-pointer min-w-0"
                  >
                    <div className="relative">
                      <HeroAvatarSvg hero={hero} size="sm" variant="framed" />
                      {facMeta && (
                        <img
                          src={facMeta.icon}
                          alt={facMeta.label}
                          className="w-3 h-3 rounded-full bg-[#1a1109] border border-[#d4af37] absolute -top-0.5 -left-0.5 object-contain"
                        />
                      )}
                    </div>
                    <div className="text-[9px] font-extrabold text-[#3b2412] truncate w-full mt-0.5">
                      {hero.name}
                    </div>
                    <div className="text-[8px] font-semibold text-[#6e4826]">
                      {isOwned ? '✓ Mở' : 'Khóa'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Warm Parchment Wishlist Modal (Exact match to screenshot e7abfc04!) */}
      {showWishlistModal && (
        <div
          role="dialog"
          aria-label="Danh Sách Ước Nguyện Quán Rượu"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
        >
          <div className="w-full max-w-3xl bg-[#f3e3c3] border-4 border-[#7c562b] rounded-2xl p-4 shadow-2xl text-[#3b2412] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-[#9c723c]/40 pb-2">
              <h3
                className="text-base font-extrabold text-[#4d2f14] uppercase"
                style={{ fontFamily: '"Cinzel", serif' }}
              >
                Wishlist — Danh Sách Ước Nguyện 4 Hệ Tộc
              </h3>
              <button
                type="button"
                onClick={() => setShowWishlistModal(false)}
                className="p-1 rounded-lg bg-[#8c6239] text-amber-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-5 flex justify-center">
                <img
                  src="/assets/aistudio/e7abfc04-2348-11ef-a3d3-02420a00018d_2d02c0f2.webp"
                  alt="AFK Arena Tavern Wishlist"
                  className="max-h-[360px] rounded-xl border-2 border-[#7c562b] object-contain"
                />
              </div>
              <div className="md:col-span-7 space-y-2 text-xs text-[#4d2f14]">
                <p className="leading-relaxed">
                  Đặt các Anh Hùng yêu thích vào 5 ô Nguyện Ước của từng Hệ Tộc để tăng tối đa cơ hội nhận đúng Tướng Elite khi triệu hồi tại Quán Rượu:
                </p>
                {(['Lightbearer', 'Mauler', 'Wilder', 'Graveborn'] as const).map(
                  (fac) => {
                    const meta = REPO_FACTION_METADATA[fac];
                    const top5 = HERO_ROSTER.filter(
                      (h) => getHeroRepoFaction(h) === fac
                    ).slice(0, 5);
                    return (
                      <div
                        key={fac}
                        className="p-2 rounded-xl bg-[#e6cfa3] border border-[#9c723c] flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-1.5 min-w-[115px]">
                          <img
                            src={meta.icon}
                            alt={meta.label}
                            className="w-5 h-5 object-contain"
                          />
                          <span className="font-extrabold text-[#3b2412]">
                            {meta.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {top5.map((h) => (
                            <div key={h.id} title={h.name}>
                              <HeroAvatarSvg
                                hero={h}
                                size="sm"
                                variant="framed"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 6. BATTLE RESULTS MODAL (Victory / Defeat)
// ============================================================================
export const BattleResultsModal: React.FC<{
  snapshot: BattleSnapshot;
  rewardSummary: BattleRewardSummary;
  onRetry: () => void;
  onNextStage: () => void;
  onOpenScreen: (screen: AppScreen) => void;
}> = ({ snapshot, rewardSummary, onRetry, onNextStage, onOpenScreen }) => {
  const isVictory = snapshot.status === 'victory';
  const stage = getCampaignStage(rewardSummary.stageId);
  const canGoNext = isVictory && rewardSummary.stageId < CAMPAIGN_STAGES.length;

  return (
    <div
      role="dialog"
      aria-label={isVictory ? 'Chiến Thắng' : 'Thất Bại'}
      data-testid="battle-results-modal"
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/85 pointer-events-auto"
    >
      <div className="w-full max-w-lg bg-gradient-to-b from-[#f3e3c3] to-[#dec28f] border-4 border-[#8c6430] rounded-2xl p-6 shadow-2xl text-[#3b2412] space-y-4">
        <div className="text-center">
          <div className="text-xs font-mono uppercase tracking-widest text-[#7c5121] font-bold">
            {stage.chapter} · {stage.name}
          </div>
          <h2
            className={`text-3xl font-black mt-1 ${
              isVictory ? 'text-[#b45309]' : 'text-red-700'
            }`}
            style={{ fontFamily: '"Cinzel", serif' }}
          >
            {isVictory ? 'VICTORY — CHIẾN THẮNG' : 'DEFEAT — THẤT BẠI'}
          </h2>
          <p className="text-xs text-[#6b4826] mt-1 font-mono tabular-nums">
            Thời gian giao tranh: {(snapshot.elapsedMs / 1000).toFixed(1)}s
          </p>
        </div>

        {/* Rewards Breakdown */}
        <div className="p-3.5 rounded-xl bg-[#faf0dc] border-2 border-[#9c723c] space-y-2">
          <div className="text-xs font-extrabold uppercase tracking-wider text-[#5c3818] text-center">
            {rewardSummary.isFirstClear
              ? '★ Phần Thưởng Vượt Ải Lần Đầu ★'
              : isVictory
                ? 'Chiến Lợi Phẩm Càn Quét'
                : 'Chiến Lợi Phẩm Thu Thập'}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center font-mono tabular-nums">
            <div className="p-2 rounded bg-[#e6cfa3]">
              <div className="text-[10px] font-bold text-[#6b4826]">VÀNG</div>
              <div className="text-sm font-black text-amber-800">
                +{rewardSummary.gold.toLocaleString()}
              </div>
            </div>
            <div className="p-2 rounded bg-[#e6cfa3]">
              <div className="text-[10px] font-bold text-[#6b4826]">EXP TƯỚNG</div>
              <div className="text-sm font-black text-emerald-800">
                +{rewardSummary.heroExp.toLocaleString()}
              </div>
            </div>
            <div className="p-2 rounded bg-[#e6cfa3]">
              <div className="text-[10px] font-bold text-[#6b4826]">KIM CƯƠNG</div>
              <div className="text-sm font-black text-sky-800">
                +{rewardSummary.essenceGems.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Hero Damage Telemetry */}
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {snapshot.units
            .filter((u) => u.team === 'ally')
            .map((u) => (
              <div
                key={u.instanceId}
                className="flex items-center justify-between px-3 py-1.5 rounded bg-[#faf0dc] border border-[#c9ab78] text-xs font-mono tabular-nums"
              >
                <span className="font-sans font-extrabold text-[#3b2412]">
                  {u.name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-red-700 font-bold">
                    Sát thương: {u.totalDamageDealt.toLocaleString()}
                  </span>
                  {u.totalHealingDone > 0 && (
                    <span className="text-emerald-700 font-bold">
                      Hồi máu: {u.totalHealingDone.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Primary Action CTAs */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => onOpenScreen('formation')}
            className="px-3.5 py-2 rounded-xl bg-[#4a3019] text-[#fde047] text-xs font-bold cursor-pointer"
          >
            Xếp Đội Hình
          </button>
          <button
            type="button"
            onClick={() => onOpenScreen('upgrades')}
            className="px-3.5 py-2 rounded-xl bg-[#4a3019] text-[#fde047] text-xs font-bold cursor-pointer"
          >
            Nâng Cấp Tướng
          </button>
          <button
            type="button"
            data-start="true"
            data-testid="modal-retry-btn"
            onClick={onRetry}
            className="px-4 py-2 rounded-xl bg-[#8c6239] text-white text-xs font-bold cursor-pointer"
          >
            Đánh Lại
          </button>
          {canGoNext && (
            <button
              type="button"
              data-start="true"
              data-testid="modal-next-stage-btn"
              onClick={onNextStage}
              className="px-5 py-2 rounded-xl bg-gradient-to-b from-[#7ef3ff] via-[#22d3ee] to-[#0284c7] text-[#041624] text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg"
            >
              Ải Tiếp Theo (1-{rewardSummary.stageId + 1})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 7. DARK FOREST: KING'S TOWER (ea8ba712), ARCANE LABYRINTH (f04d7338), BOSSES & VIDEOS
// ============================================================================
export const VideosAndBossesPanel: React.FC<{ onCloseToBattle: () => void }> = ({
  onCloseToBattle,
}) => {
  const state = useGameStore();
  const [activeTab, setActiveTab] = useState<
    'videos' | 'bosses' | 'darkforest'
  >('videos');
  const [selectedVideoId, setSelectedVideoId] = useState<string>(
    OFFICIAL_GAME_VIDEOS[0].id
  );

  const activeVideo =
    OFFICIAL_GAME_VIDEOS.find((v) => v.id === selectedVideoId) ||
    OFFICIAL_GAME_VIDEOS[0];

  return (
    <div
      data-testid="screen-videos"
      className="w-full max-w-6xl mx-auto bg-gradient-to-b from-[#f3e3c3] via-[#ebd5ab] to-[#dcc08e] border-4 border-[#6e4b26] rounded-2xl shadow-[0_12px_50px_rgba(0,0,0,0.95)] overflow-hidden text-[#3b2412]"
    >
      {/* Ornate Carved Wood Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 bg-gradient-to-b from-[#4a3019] via-[#34200f] to-[#241509] border-b-4 border-[#b8893e] text-[#fff2d1]">
        <div>
          <h2
            className="text-base md:text-lg font-extrabold tracking-wider uppercase text-[#fde047]"
            style={{ fontFamily: '"Cinzel", serif' }}
          >
            Dark Forest — Rừng Đen · King&apos;s Tower · Arcane Labyrinth
          </h2>
          <p className="text-xs text-[#e5cba0]">
            Peaks of Time · King&apos;s Tower · Arcane Labyrinth · Dream Realm Bosses &amp; Official Trailers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="tab-btn-videos"
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
              activeTab === 'videos'
                ? 'bg-[#d4af37] text-[#1e1209]'
                : 'bg-[#3b2512] text-[#e5cba0] border border-[#8c6430]'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Video &amp; Trailer ({OFFICIAL_GAME_VIDEOS.length})
          </button>
          <button
            type="button"
            data-testid="tab-btn-bosses"
            onClick={() => setActiveTab('bosses')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
              activeTab === 'bosses'
                ? 'bg-[#d4af37] text-[#1e1209]'
                : 'bg-[#3b2512] text-[#e5cba0] border border-[#8c6430]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Boss Mộng Cảnh ({DREAM_REALM_BOSSES.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('darkforest')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
              activeTab === 'darkforest'
                ? 'bg-[#38bdf8] text-[#041019]'
                : 'bg-[#3b2512] text-[#fde047] border border-[#8c6430]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            King&apos;s Tower &amp; Labyrinth
          </button>
          <button
            type="button"
            onClick={onCloseToBattle}
            className="px-3 py-1.5 rounded-lg bg-[#593a1e] border border-[#b8893e] text-xs font-bold text-[#fde047] cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>

      {activeTab === 'videos' && (
        <div className="p-3 flex flex-col gap-3">
          <div className="bg-[#faf0dc] border-2 border-[#9c723c] rounded-xl p-2.5 space-y-2 shadow">
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black border border-[#7c562b] relative">
              <iframe
                key={activeVideo.youtubeId}
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?rel=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            <div className="min-w-0">
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#4a3019] text-[#fde047] font-bold">
                {activeVideo.category} · {activeVideo.duration}
              </span>
              <h3 className="text-xs font-black text-[#3b2412] mt-1 truncate">
                {activeVideo.title}
              </h3>
              <p className="text-[10px] text-[#6b4826] line-clamp-2 mt-0.5">
                {activeVideo.description}
              </p>
            </div>

            <div className="p-2 rounded-lg bg-[#e6cfa3] border border-[#9c723c] flex flex-col gap-2">
              <div className="grid grid-cols-5 gap-1">
                {activeVideo.showcaseTeam.map((hId, idx) => {
                  const hero = getHeroById(hId);
                  return (
                    <div
                      key={`${hId}_${idx}`}
                      className="flex flex-col items-center min-w-0"
                      title={hero.name}
                    >
                      <HeroAvatarSvg hero={hero} size="sm" variant="framed" />
                      <span className="text-[8.5px] font-bold text-[#3b2412] truncate w-full text-center mt-0.5">
                        {hero.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                data-testid="btn-deploy-video-squad"
                onClick={() =>
                  state.deployShowcaseTeam(
                    activeVideo.showcaseTeam,
                    activeVideo.title
                  )
                }
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-gradient-to-b from-[#7ef3ff] via-[#22d3ee] to-[#0284c7] text-[#041624] font-black text-xs cursor-pointer shadow"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Triệu Hồi &amp; Đấu Thử Đội Hình Video</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            {OFFICIAL_GAME_VIDEOS.map((vid) => {
              const isSelected = vid.id === activeVideo.id;
              return (
                <button
                  key={vid.id}
                  type="button"
                  data-testid={`video-card-${vid.id}`}
                  onClick={() => setSelectedVideoId(vid.id)}
                  className={`w-full p-2 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center gap-2.5 shadow-sm min-w-0 ${
                    isSelected
                      ? 'bg-[#fff8ea] border-[#d97706]'
                      : 'bg-[#faf0dc] border-[#9c723c] hover:bg-[#fff8ea]'
                  }`}
                >
                  <div className="w-20 h-12 rounded-lg overflow-hidden bg-slate-950 border border-[#7c562b] shrink-0 relative flex items-center justify-center">
                    <img
                      src={`https://i.ytimg.com/vi/${vid.youtubeId}/hqdefault.jpg`}
                      alt={vid.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                      <Play className="w-4 h-4 text-amber-300 fill-amber-300" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-[9px] font-mono font-bold text-[#8c5820]">
                      <span className="truncate">{vid.category}</span>
                      <span className="shrink-0">{vid.duration}</span>
                    </div>
                    <div className="text-xs font-extrabold text-[#3b2412] truncate mt-0.5">
                      {vid.title}
                    </div>
                    <div className="text-[10px] text-[#6b4826] truncate">
                      {vid.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'bosses' && (
        <div className="p-3 flex flex-col gap-2.5">
          {DREAM_REALM_BOSSES.map((boss) => (
            <div
              key={boss.id}
              data-testid={`boss-card-${boss.id}`}
              className="p-2.5 rounded-xl bg-[#faf0dc] border-2 border-[#9c723c] flex flex-col justify-between gap-2 shadow min-w-0"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={boss.imageUrl}
                  alt={boss.name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="w-12 h-12 rounded-xl object-contain bg-[#2b1b0e] border-2 border-[#a87e3b] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#4a3019] text-[#fde047] font-bold">
                    {boss.mode}
                  </span>
                  <h3 className="text-xs font-black text-[#3b2412] truncate mt-0.5">
                    {boss.name}
                  </h3>
                  <p className="text-[10px] text-[#6b4826] font-mono truncate">
                    LC Đề Xuất: {boss.recommendedPower.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="text-[10px] font-mono text-[#4d2f14] bg-[#e6cfa3] px-2 py-1 rounded border border-[#9c723c] truncate">
                Thưởng: +{boss.rewardGold.toLocaleString()}G · +{boss.rewardEssence}💎 · +{boss.rewardScrolls} Cuộn
              </div>

              <button
                type="button"
                data-testid={`btn-fight-boss-${boss.id}`}
                onClick={() => {
                  state.selectCampaignStage(1, true);
                  state.showToast(
                    `Đã bước vào khiêu chiến Boss ${boss.name} (${boss.mode})!`
                  );
                }}
                className="w-full py-1.5 rounded-xl bg-gradient-to-b from-[#7ef3ff] via-[#22d3ee] to-[#0284c7] text-[#041624] text-xs font-black uppercase cursor-pointer shadow"
              >
                Challenge · Khiêu Chiến {boss.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'darkforest' && (
        <div className="p-3 flex flex-col gap-3">
          <div className="p-2.5 rounded-xl bg-[#faf0dc] border-2 border-[#9c723c] flex flex-col gap-2 shadow">
            <img
              src="/assets/aistudio/e9a24a7c-2348-11ef-834c-02420a00018d_0935de9a.webp"
              alt="Dark Forest Map"
              className="h-40 w-full object-cover rounded-lg border border-[#7c562b]"
            />
            <div>
              <h3 className="text-xs font-black text-[#3b2412] truncate">
                Dark Forest Map — Bản Đồ Rừng Đen
              </h3>
              <p className="text-[10px] text-[#6b4826] line-clamp-2 mt-0.5">
                Peaks of Time, Voyage of Wonders, King&apos;s Tower, Arcane Labyrinth và Arena of Heroes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => state.selectCampaignStage(2, true)}
              className="w-full py-1.5 rounded-xl bg-gradient-to-b from-[#7ef3ff] to-[#0284c7] text-[#041624] font-black text-xs uppercase cursor-pointer shadow"
            >
              Tiến Vào Rừng Đen
            </button>
          </div>

          <div className="p-2.5 rounded-xl bg-[#faf0dc] border-2 border-[#9c723c] flex flex-col gap-2 shadow">
            <img
              src="/assets/aistudio/ea8ba712-2348-11ef-a4be-02420a000190_39526e7f.webp"
              alt="King's Tower"
              className="h-40 w-full object-cover rounded-lg border border-[#7c562b]"
            />
            <div>
              <h3 className="text-xs font-black text-[#3b2412] truncate">
                King&apos;s Tower — Tháp Vua (Floor 43)
              </h3>
              <p className="text-[10px] text-[#6b4826] line-clamp-2 mt-0.5">
                Leo từng tầng Tháp Vua đối đầu 5 Tướng Thủ Hộ để nhận Đá Đột Phá và Mảnh Tướng Elite.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                state.selectCampaignStage(3, true);
                state.showToast(
                  "Đã bước vào khiêu chiến Floor 43 King's Tower!"
                );
              }}
              className="w-full py-1.5 rounded-xl bg-gradient-to-b from-[#7ef3ff] to-[#0284c7] text-[#041624] font-black text-xs uppercase cursor-pointer shadow"
            >
              Challenge · Floor 43
            </button>
          </div>

          <div className="p-2.5 rounded-xl bg-[#faf0dc] border-2 border-[#9c723c] flex flex-col gap-2 shadow">
            <img
              src="/assets/aistudio/f04d7338-2348-11ef-8204-02420a00018f_5e8b6414.webp"
              alt="Arcane Labyrinth"
              className="h-40 w-full object-cover rounded-lg border border-[#7c562b]"
            />
            <div>
              <h3 className="text-xs font-black text-[#3b2412] truncate">
                Arcane Labyrinth — Mê Cung Bí Thuật
              </h3>
              <p className="text-[10px] text-[#6b4826] line-clamp-2 mt-0.5">
                Di chuyển trên các ô đá lục giác, chiêu mộ Tướng Trợ Chiến và thu thập Di Vật (Relics).
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                state.claimIdleTribute();
                state.showToast(
                  'Đã kích hoạt Di Vật Mê Cung (Vanguard War Flag +10% DEF)!'
                );
              }}
              className="w-full py-1.5 rounded-xl bg-gradient-to-b from-[#f5d061] to-[#b8862d] text-[#241509] font-black text-xs uppercase cursor-pointer shadow"
            >
              Choose A Relic · Nhận Di Vật
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
