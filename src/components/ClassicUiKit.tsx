import React, { useState } from 'react';
import {
  X,
  Check,
  Lock,
  Sparkles,
  Shield,
  Sword,
  Gift,
  Mail,
  Settings,
  Backpack,
  ScrollText,
  Trophy,
  Flame,
  Volume2,
  VolumeX,
  Users,
  Crown,
  Calendar,
  Plus,
  Pause,
  Play,
  RotateCcw,
  Zap,
  CheckSquare,
  Smartphone,
  Monitor,
  Map,
} from 'lucide-react';
import {
  HeroDefinition,
  BattleSnapshot,
  OwnedHeroState,
  TeamFormationSlots,
} from '../game/types';
import {
  REPO_FACTION_METADATA,
  getHeroRepoFaction,
  getHeroById,
} from '../game/heroes';
import { HeroAvatarSvg } from './HeroAvatarSvg';
import { useGameStore } from '../store/gameStore';
import {
  IconNavCampaign,
  IconResGoldCoin,
  IconResHeroExp,
  IconResDiamond,
  IconResScroll,
  IconResAfkChest,
  IconSysCombatFist,
  IconSysPlus,
  IconSysUpgrade,
  IconSysStar,
  IconSysBack,
  IconUtilBag,
  IconUtilQuests,
  IconUtilEvents,
  IconUtilGuild,
  IconUtilMail,
  IconUtilSettings,
  IconUtilAudio,
} from './FantasyIcons';

// ============================================================================
// REUSABLE CLASSIC AFK ARENA DESIGN SYSTEM COMPONENTS
// ============================================================================

/** 1. RedNotificationDot — Classic AFK Arena notification indicator */
export const RedNotificationDot: React.FC<{
  count?: number;
  className?: string;
}> = ({ count, className = '' }) => (
  <span
    className={`inline-flex items-center justify-center min-w-[14px] h-[14px] px-0.5 rounded-full bg-gradient-to-b from-[#ff5a36] to-[#c91c0b] border border-[#ffe4b5] text-[8px] font-black text-white shadow-[0_1px_4px_rgba(0,0,0,0.85)] leading-none select-none ${className}`}
  >
    {count !== undefined ? count : '!'}
  </span>
);

/** 2. FantasyButton — Beveled Classic AFK Arena button (Cyan, Gold, Bronze, Emerald, Crimson) */
export const FantasyButton: React.FC<{
  variant?: 'cyan' | 'gold' | 'bronze' | 'emerald' | 'crimson';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
  testId?: string;
  badge?: boolean;
  children: React.ReactNode;
}> = ({
  variant = 'gold',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  testId,
  badge = false,
  children,
}) => {
  const variantClasses = {
    cyan: 'bg-gradient-to-b from-[#8cf6ff] via-[#22d3ee] to-[#0284c7] border-[#cffafe] text-[#041826] shadow-[0_3px_12px_rgba(34,211,238,0.45)] hover:brightness-110',
    gold: 'bg-gradient-to-b from-[#fde68a] via-[#eab308] to-[#a16207] border-[#fef08a] text-[#241407] shadow-[0_3px_12px_rgba(234,179,8,0.4)] hover:brightness-110',
    bronze:
      'bg-gradient-to-b from-[#6e4b26] via-[#4a3019] to-[#2b1a0c] border-[#c89b4b] text-[#fff2d1] shadow-[0_2px_8px_rgba(0,0,0,0.75)] hover:brightness-110',
    emerald:
      'bg-gradient-to-b from-[#6ee7b7] via-[#10b981] to-[#047857] border-[#a7f3d0] text-[#022c22] shadow-[0_3px_10px_rgba(16,185,129,0.4)] hover:brightness-110',
    crimson:
      'bg-gradient-to-b from-[#fca5a5] via-[#ef4444] to-[#991b1b] border-[#fecaca] text-white shadow-[0_3px_10px_rgba(239,68,68,0.45)] hover:brightness-110',
  };

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px] rounded-md border',
    sm: 'px-3 py-1 text-[11px] rounded-lg border-2',
    md: 'px-4 py-1.5 text-xs rounded-xl border-2',
    lg: 'px-6 py-2 text-sm rounded-2xl border-2',
  };

  return (
    <button
      type="button"
      data-testid={testId}
      disabled={disabled}
      onClick={onClick}
      className={`relative font-black tracking-wide transition-all active:scale-95 cursor-pointer inline-flex items-center justify-center gap-1 select-none ${
        variantClasses[variant]
      } ${sizeClasses[size]} ${
        disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''
      } ${className}`}
    >
      {badge && <RedNotificationDot className="absolute -top-1.5 -right-1.5" />}
      {children}
    </button>
  );
};

/** 3. SectionHeader — Ornate Classic AFK Arena Serif Ribbon Header */
export const SectionHeader: React.FC<{
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
}> = ({ title, subtitle, rightSlot }) => (
  <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-gradient-to-b from-[#4a3019] via-[#34200f] to-[#221409] border-b-2 border-[#c89b4b] text-[#fff2d1]">
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rotate-45 bg-[#fde047] inline-block shrink-0" />
      <div>
        <h2
          className="text-xs sm:text-sm font-black tracking-wider uppercase text-[#fde047] drop-shadow"
          style={{ fontFamily: '"Cinzel", serif' }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-[10px] text-[#e5cba0] leading-tight">{subtitle}</p>
        )}
      </div>
    </div>
    {rightSlot && <div className="flex items-center gap-1.5">{rightSlot}</div>}
  </div>
);

/** 4. ParchmentPanel — Classic AFK Arena Parchment & Gold Framed Panel */
export const ParchmentPanel: React.FC<{
  children: React.ReactNode;
  className?: string;
  tiltedBacking?: boolean;
  testId?: string;
}> = ({ children, className = '', tiltedBacking = false, testId }) => (
  <div data-testid={testId} className={`relative ${className}`}>
    {tiltedBacking && (
      <div className="absolute inset-0 bg-[#d5b47f] border-2 border-[#8c6430] rounded-2xl -rotate-1 shadow-xl pointer-events-none" />
    )}
    <div className="relative w-full h-full bg-gradient-to-b from-[#f5e6c8] via-[#ebd5ab] to-[#dcc08e] border-3 border-[#7c562b] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] overflow-hidden text-[#3b2412] flex flex-col">
      {/* Subtle Top Ornamental Sunburst Watermark */}
      <svg
        viewBox="0 0 400 70"
        className="w-full h-12 absolute top-0 inset-x-0 opacity-15 pointer-events-none"
        preserveAspectRatio="none"
      >
        <circle
          cx="200"
          cy="8"
          r="45"
          fill="none"
          stroke="#8c5820"
          strokeWidth="2"
        />
        <circle
          cx="200"
          cy="8"
          r="30"
          fill="none"
          stroke="#8c5820"
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />
      </svg>
      {children}
    </div>
  </div>
);

/** 5. TabSwitcher — Classic AFK Arena Carved Wood & Gold Tab Bar */
export const TabSwitcher: React.FC<{
  tabs: Array<{
    id: string;
    label: string;
    badge?: boolean;
    testId?: string;
  }>;
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}> = ({ tabs, activeId, onChange, className = '' }) => (
  <div className={`grid grid-cols-${tabs.length} gap-1 ${className}`}>
    {tabs.map((tab) => {
      const active = tab.id === activeId;
      return (
        <button
          key={tab.id}
          type="button"
          data-testid={tab.testId}
          onClick={() => onChange(tab.id)}
          className={`relative py-1.5 px-2 rounded-t-xl border-2 text-[11px] font-black transition-all cursor-pointer select-none ${
            active
              ? 'bg-gradient-to-b from-[#f5e6c8] to-[#d8b87c] border-[#fde047] text-[#3b2412] shadow-md -translate-y-0.5'
              : 'bg-gradient-to-b from-[#4a3019] to-[#2b1a0c] border-[#8c6430] text-[#d8be94] hover:text-[#fde047]'
          }`}
        >
          {tab.badge && (
            <RedNotificationDot className="absolute -top-1 right-1" />
          )}
          <span>{tab.label}</span>
        </button>
      );
    })}
  </div>
);

/** 6. PopupModal — Classic AFK Arena Double-Layered Parchment Dialog */
export const PopupModal: React.FC<{
  title: string;
  onClose: () => void;
  testId?: string;
  maxWidthClass?: string;
  children: React.ReactNode;
}> = ({
  title,
  onClose,
  testId,
  maxWidthClass = 'max-w-md',
  children,
}) => (
  <div
    role="dialog"
    aria-label={title}
    data-testid={testId}
    className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 pointer-events-auto"
  >
    <div className={`relative w-full ${maxWidthClass}`}>
      <div className="absolute inset-0 bg-[#c9a66b] border-2 border-[#7c562b] rounded-2xl -rotate-1.5 shadow-2xl pointer-events-none" />
      <div className="relative bg-gradient-to-b from-[#f5e6c8] via-[#ebd5ab] to-[#d8b87c] border-3 border-[#7c562b] rounded-2xl p-4 text-[#3b2412] shadow-[0_16px_50px_rgba(0,0,0,0.95)] space-y-3 max-h-[86vh] flex flex-col">
        {/* Top Ornate Ribbon Header */}
        <div className="flex items-center justify-between border-b-2 border-[#b8945e] pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rotate-45 bg-[#b45309] inline-block" />
            <h3
              className="text-sm sm:text-base font-black uppercase tracking-wider text-[#4d2f14]"
              style={{ fontFamily: '"Cinzel", serif' }}
            >
              {title}
            </h3>
          </div>
          <button
            type="button"
            data-testid="popup-close-btn"
            onClick={onClose}
            aria-label="Đóng"
            className="w-7 h-7 rounded-full bg-gradient-to-b from-[#734b2c] to-[#3d2514] border-2 border-[#d4af37] text-[#fde047] flex items-center justify-center cursor-pointer shadow hover:scale-105 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-0.5 space-y-3">{children}</div>
      </div>
    </div>
  </div>
);

/** 7. ResourceBadge — Classic AFK Arena Dark Recessed Currency Pill */
export const ResourceBadge: React.FC<{
  icon: React.ReactNode;
  value: string | number;
  testId?: string;
  onPlusClick?: () => void;
  plusTitle?: string;
  className?: string;
}> = ({ icon, value, testId, onPlusClick, plusTitle, className = '' }) => (
  <div
    className={`flex items-center gap-1 bg-[#160d06] border border-[#8c6430] rounded-full pl-1.5 pr-1 py-0.5 shadow-inner font-mono tabular-nums ${className}`}
  >
    {icon}
    <span
      data-testid={testId}
      className="text-[10px] font-extrabold text-[#fff1c2]"
    >
      {value}
    </span>
    {onPlusClick && (
      <button
        type="button"
        onClick={onPlusClick}
        title={plusTitle}
        className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-[#f5d061] to-[#966822] text-[#1e1209] flex items-center justify-center cursor-pointer"
      >
        <Plus className="w-2.5 h-2.5 stroke-[3]" />
      </button>
    )}
  </div>
);

/** 8. StatRow — Classic AFK Arena Attribute Line */
export const StatRow: React.FC<{
  icon: string;
  label: string;
  value: string | number;
  bonus?: string;
}> = ({ icon, label, value, bonus }) => (
  <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-black/35 border border-[#8c6430]/50 text-xs">
    <span className="flex items-center gap-1.5 text-[#e5cba0] font-bold">
      <span>{icon}</span>
      <span>{label}</span>
    </span>
    <span className="font-mono font-black text-[#fff2d1] tabular-nums">
      {value}
      {bonus && <span className="text-emerald-400 ml-1 text-[10px]">{bonus}</span>}
    </span>
  </div>
);

/** 9. FramedHeroCard — Classic AFK Arena Ornate Hero Portrait Card */
export const FramedHeroCard: React.FC<{
  hero: HeroDefinition;
  level: number;
  stars: number;
  isOwned: boolean;
  isSelected?: boolean;
  isDeployed?: boolean;
  canUpgrade?: boolean;
  showName?: boolean;
  onClick: () => void;
  testId?: string;
}> = ({
  hero,
  level,
  stars,
  isOwned,
  isSelected = false,
  isDeployed = false,
  canUpgrade = false,
  showName = true,
  onClick,
  testId,
}) => {
  const facMeta = REPO_FACTION_METADATA[getHeroRepoFaction(hero)];

  // Classic AFK Arena Rarity Frame Colors:
  // Ascended (Silver-White Rainbow + Gold), Mythic (Crimson + Gold), Legendary (Gold), Elite/Epic (Royal Purple), Rare (Sapphire Blue)
  const frameStyle =
    stars >= 4 || hero.rarity === 'Ascended'
      ? 'border-[#f8fafc] ring-1 ring-[#facc15] bg-gradient-to-b from-[#581c87] via-[#312e81] to-[#1e1b4b]'
      : stars === 3
        ? 'border-[#ef4444] ring-1 ring-[#f59e0b] bg-gradient-to-b from-[#7f1d1d] via-[#450a0a] to-[#280505]'
        : stars === 2
          ? 'border-[#facc15] bg-gradient-to-b from-[#713f12] via-[#422006] to-[#271203]'
          : 'border-[#a855f7] bg-gradient-to-b from-[#581c87] via-[#3b0764] to-[#1e0536]';

  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      className={`group relative flex flex-col items-center cursor-pointer select-none transition-transform ${
        isSelected ? 'scale-105 z-10' : 'hover:scale-102'
      }`}
    >
      <div
        className={`relative w-full aspect-square rounded-xl border-[2.5px] ${frameStyle} flex items-center justify-center overflow-hidden shadow-[0_4px_8px_rgba(45,26,12,0.55)] ${
          isSelected
            ? 'ring-2 ring-[#fde047] shadow-[0_0_14px_rgba(253,224,71,0.85)]'
            : ''
        }`}
      >
        <HeroAvatarSvg hero={hero} size="full" />

        {/* Classic AFK Arena Top-Left Faction Medallion */}
        {facMeta && (
          <div className="absolute top-0.5 left-0.5 z-10 w-4 h-4 rounded-full bg-[#1a1109] border border-[#facc15] flex items-center justify-center shadow">
            <img
              src={facMeta.icon}
              alt={facMeta.label}
              className="w-3.5 h-3.5 object-contain"
            />
          </div>
        )}

        {/* Classic AFK Arena Top-Right Level Text ("Lvl 240") */}
        <span className="absolute top-0.5 right-1 text-[9px] font-mono font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.98)] z-10">
          Lvl {level}
        </span>

        {/* Red Notification Dot */}
        {canUpgrade && (
          <RedNotificationDot className="absolute -top-0.5 -right-0.5 z-20" />
        )}

        {/* Bottom Gold Stars Strip */}
        <div className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-0.2 py-0.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
          {Array.from({ length: Math.min(5, stars) }).map((_, i) => (
            <span
              key={i}
              className="text-[8px] text-[#fde047] drop-shadow-[0_1px_1px_rgba(0,0,0,0.95)] leading-none"
            >
              ★
            </span>
          ))}
        </div>

        {/* Deployed Checkmark Overlay */}
        {isDeployed && (
          <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white flex items-center justify-center z-20">
            <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
          </span>
        )}

        {/* Locked Overlay */}
        {!isOwned && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center z-10">
            <div className="w-5 h-6 rounded bg-[#c7d2fe]/90 border border-[#4f46e5] flex items-center justify-center shadow">
              <Lock className="w-3 h-3 text-[#312e81]" />
            </div>
          </div>
        )}
      </div>

      {showName && (
        <span className="text-[9px] font-extrabold text-[#3b2412] truncate w-full text-center mt-0.5 leading-tight">
          {hero.name}
        </span>
      )}
    </button>
  );
};

/** 10. ItemCard — Classic AFK Arena Inventory Slot Card */
export interface ClassicBagItem {
  id: string;
  name: string;
  category: 'gear' | 'consumable' | 'shard' | 'artifact';
  rarity: 'Mythic' | 'Legendary' | 'Epic' | 'Rare';
  count: number;
  powerBadge?: string;
  iconEmoji: string;
  description: string;
  rewardGold?: number;
  rewardGems?: number;
  rewardExp?: number;
}

export const ItemCard: React.FC<{
  item: ClassicBagItem;
  isSelected?: boolean;
  onClick: () => void;
}> = ({ item, isSelected = false, onClick }) => {
  const borderMap = {
    Mythic: 'border-[#ef4444] bg-gradient-to-b from-[#7f1d1d] to-[#3b0707]',
    Legendary: 'border-[#facc15] bg-gradient-to-b from-[#713f12] to-[#3b1d06]',
    Epic: 'border-[#a855f7] bg-gradient-to-b from-[#581c87] to-[#2e1065]',
    Rare: 'border-[#38bdf8] bg-gradient-to-b from-[#1e3a8a] to-[#0f172a]',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative aspect-square rounded-xl border-2 ${
        borderMap[item.rarity]
      } flex flex-col items-center justify-center p-1 cursor-pointer shadow-md transition-transform ${
        isSelected ? 'ring-2 ring-[#fde047] scale-105' : 'hover:scale-102'
      }`}
    >
      {item.powerBadge && (
        <span className="absolute top-0.5 left-1 text-[8px] font-mono font-black text-[#fde047]">
          {item.powerBadge}
        </span>
      )}
      <span className="text-2xl drop-shadow">{item.iconEmoji}</span>
      <span className="absolute bottom-0.5 right-1 text-[9px] font-mono font-black text-white drop-shadow">
        x{item.count}
      </span>
    </button>
  );
};

/** 11. RewardPopup — Classic AFK Arena Glowing Loot Reveal Banner */
export const RewardPopup: React.FC<{
  title: string;
  rewards: Array<{ label: string; amount: string; emoji: string }>;
  onClose: () => void;
}> = ({ title, rewards, onClose }) => (
  <PopupModal title={title} onClose={onClose} testId="classic-reward-popup">
    <div className="text-center space-y-3 py-2">
      <div className="text-xs font-extrabold text-[#7c5121] uppercase">
        ★ Phần Thưởng Thu Thập Thành Công ★
      </div>
      <div className="grid grid-cols-3 gap-2">
        {rewards.map((r, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-xl bg-gradient-to-b from-[#4a3019] to-[#241509] border-2 border-[#fde047] text-[#fff2d1] flex flex-col items-center shadow-lg"
          >
            <span className="text-2xl">{r.emoji}</span>
            <span className="text-xs font-mono font-black text-[#fde047] mt-1">
              {r.amount}
            </span>
            <span className="text-[10px] text-[#e5cba0] font-bold">
              {r.label}
            </span>
          </div>
        ))}
      </div>
      <FantasyButton variant="cyan" size="md" onClick={onClose}>
        Xác Nhận
      </FantasyButton>
    </div>
  </PopupModal>
);

// ============================================================================
// REQUIRED CLASSIC AFK ARENA SYSTEM MODALS (I. BAG, J. GUILD, K. QUESTS, L. EVENTS, M. MAIL, N. SETTINGS)
// ============================================================================

const INITIAL_BAG_ITEMS: ClassicBagItem[] = [
  {
    id: 'duras_call',
    name: "Dura's Call · Tù Và Nữ Thần Dura",
    category: 'artifact',
    rarity: 'Mythic',
    count: 1,
    powerBadge: '★5',
    iconEmoji: '📯',
    description:
      'Thần Khí Tối Thượng của Nữ Thần Dura: Tăng +16 điểm Tốc Độ (Haste) và hồi +35 Nộ mỗi giây cho các đồng minh xung quanh.',
    rewardGold: 25000,
  },
  {
    id: 'duras_eye',
    name: "Dura's Eye · Con Mắt Nữ Thần",
    category: 'artifact',
    rarity: 'Mythic',
    count: 1,
    powerBadge: '★5',
    iconEmoji: '👁️',
    description:
      'Tăng +25% Tỷ Lệ Chí Mạng và +30% Tốc Đánh trong 3 giây sau mỗi đòn chí mạng.',
    rewardGold: 25000,
  },
  {
    id: 'mythic_sword_t4',
    name: 'Thánh Kiếm Ánh Sáng T4',
    category: 'gear',
    rarity: 'Mythic',
    count: 4,
    powerBadge: 'T4',
    iconEmoji: '⚔️',
    description:
      'Vũ khí Thần Thoại bậc T4 rèn tại Vương Đô Ranhorn, cộng +30% chỉ số Hệ Ánh Sáng.',
    rewardGold: 18000,
  },
  {
    id: 'mythic_plate_t4',
    name: 'Chiến Giáp Vĩnh Hằng T4',
    category: 'gear',
    rarity: 'Mythic',
    count: 3,
    powerBadge: 'T4',
    iconEmoji: '🛡️',
    description:
      'Giáp nặng Thần Thoại giảm 18% sát thương vật lý nhận vào từ kẻ địch.',
    rewardGold: 18000,
  },
  {
    id: 'gold_chest_24h',
    name: 'Rương Vàng AFK 24 Giờ',
    category: 'consumable',
    rarity: 'Legendary',
    count: 8,
    powerBadge: '24H',
    iconEmoji: '💰',
    description:
      'Sử dụng để nhận ngay lượng Vàng tương đương 24 giờ thu hoạch AFK tại chương hiện tại (+45.000 Vàng).',
    rewardGold: 45000,
  },
  {
    id: 'exp_chest_24h',
    name: 'Rương Tinh Hoa EXP 24 Giờ',
    category: 'consumable',
    rarity: 'Legendary',
    count: 6,
    powerBadge: '24H',
    iconEmoji: '🔮',
    description:
      'Sử dụng để nhận ngay +35.000 EXP Tướng và +1.200 Kim Cương Tinh Hoa.',
    rewardExp: 35000,
    rewardGems: 1200,
  },
  {
    id: 'elite_soulstone',
    name: 'Đá Linh Hồn Tướng Elite (60/60)',
    category: 'shard',
    rarity: 'Epic',
    count: 180,
    powerBadge: '60/60',
    iconEmoji: '💎',
    description:
      'Thu thập đủ 60 Đá Linh Hồn Tím để triệu hồi ngẫu nhiên 1 Anh Hùng phẩm chất Elite hoặc thưởng +1.800 Kim Cương.',
    rewardGems: 1800,
  },
  {
    id: 'guild_wagon_screw',
    name: 'Đinh Ốc Chiến Xa Công Hội',
    category: 'consumable',
    rarity: 'Epic',
    count: 880,
    powerBadge: 'EVENT',
    iconEmoji: '🔩',
    description:
      'Vật phẩm hoạt động dùng để tu sửa Chiến Xa Công Hội và nhận thưởng Quỹ Công Hội.',
    rewardGold: 15000,
  },
];

/** I. BAG / INVENTORY MODAL */
export const ClassicBagModal: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const store = useGameStore();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [items, setItems] = useState<ClassicBagItem[]>(INITIAL_BAG_ITEMS);
  const [selectedItemId, setSelectedItemId] = useState<string>(
    INITIAL_BAG_ITEMS[0].id
  );
  const [rewardBanner, setRewardBanner] = useState<string | null>(null);

  const filtered = items.filter(
    (it) => activeTab === 'all' || it.category === activeTab
  );
  const selectedItem =
    items.find((it) => it.id === selectedItemId) || filtered[0] || items[0];

  const handleUseItem = () => {
    if (!selectedItem || selectedItem.count <= 0) return;
    store.claimIdleTribute();
    if (selectedItem.rewardGems) {
      store.claimFreeSanctumGift();
    }
    setItems((prev) =>
      prev.map((it) =>
        it.id === selectedItem.id
          ? { ...it, count: Math.max(1, it.count - 1) }
          : it
      )
    );
    setRewardBanner(
      `Đã sử dụng ${selectedItem.name}! Nhận +${(
        selectedItem.rewardGold || 25000
      ).toLocaleString()} Vàng & Chiến Lợi Phẩm!`
    );
  };

  return (
    <PopupModal
      title="Bag · Túi Đồ Lãnh Chúa Esperia"
      onClose={onClose}
      testId="classic-bag-modal"
      maxWidthClass="max-w-lg"
    >
      <TabSwitcher
        tabs={[
          { id: 'all', label: 'Tất Cả' },
          { id: 'gear', label: 'Trang Bị' },
          { id: 'consumable', label: 'Tiêu Hao', badge: true },
          { id: 'shard', label: 'Mảnh Tướng', badge: true },
          { id: 'artifact', label: 'Thần Khí' },
        ]}
        activeId={activeTab}
        onChange={setActiveTab}
      />

      {rewardBanner && (
        <div className="px-3 py-1.5 rounded-xl bg-emerald-800 text-emerald-100 text-xs font-extrabold text-center shadow">
          {rewardBanner}
        </div>
      )}

      {/* 4-Column Classic AFK Arena Item Grid */}
      <div className="grid grid-cols-4 gap-2.5 p-2 rounded-xl bg-[#e3c796] border-2 border-[#9c723c]">
        {filtered.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            isSelected={selectedItem?.id === item.id}
            onClick={() => setSelectedItemId(item.id)}
          />
        ))}
      </div>

      {/* Selected Item Parchment Detail Box */}
      {selectedItem && (
        <div className="p-3 rounded-xl bg-[#faf0dc] border-2 border-[#8c6430] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">{selectedItem.iconEmoji}</span>
              <div>
                <h4 className="text-sm font-black text-[#3b2412]">
                  {selectedItem.name}
                </h4>
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#7c5121]">
                  <span>Phẩm chất: {selectedItem.rarity}</span>
                  <span>·</span>
                  <span>Đang có: {selectedItem.count}</span>
                </div>
              </div>
            </div>

            <FantasyButton
              variant="cyan"
              size="sm"
              testId="btn-use-bag-item"
              onClick={handleUseItem}
            >
              Sử Dụng / Mở
            </FantasyButton>
          </div>
          <p className="text-xs text-[#4d2f14] leading-relaxed border-t border-[#c9ab78] pt-1.5">
            {selectedItem.description}
          </p>
        </div>
      )}
    </PopupModal>
  );
};

/** J. GUILD MODAL (Classic AFK Arena Guild Grounds + Wrizz & Soren Guild Hunt) */
export const ClassicGuildModal: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const store = useGameStore();
  const [guildTab, setGuildTab] = useState<'hunt' | 'members' | 'wagon'>(
    'hunt'
  );
  const [huntLog, setHuntLog] = useState<string | null>(null);

  const handleGuildHunt = (bossName: string) => {
    store.claimIdleTribute();
    setHuntLog(
      `Đã càn quét ${bossName}! Thưởng +65.000 Vàng, +1.500 Xu Công Hội & Rương Trang Bị Thần Thoại!`
    );
  };

  return (
    <PopupModal
      title="Guild Grounds · Lãnh Địa Công Hội Esperia"
      onClose={onClose}
      testId="classic-guild-modal"
      maxWidthClass="max-w-lg"
    >
      {/* Guild Header Banner */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-[#3d2514] via-[#4a3019] to-[#2b1a0c] border-2 border-[#d4af37] text-[#fff2d1] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#fde047] to-[#b45309] border-2 border-white flex items-center justify-center text-xl shadow">
            🦅
          </div>
          <div>
            <div className="text-sm font-black text-[#fde047]">
              Hiệp Hội Ánh Sao · Cấp 9
            </div>
            <div className="text-[10px] text-[#e5cba0]">
              ID: 108492 · Thành viên: 68/70 · Điểm Năng Động: 48,900
            </div>
          </div>
        </div>
        <div className="text-right font-mono text-xs">
          <div className="text-[#fde047] font-black">🪙 24,500</div>
          <div className="text-[10px] text-amber-200">Xu Công Hội</div>
        </div>
      </div>

      <TabSwitcher
        tabs={[
          { id: 'hunt', label: 'Săn Boss (Guild Hunt)', badge: true },
          { id: 'members', label: 'Thành Viên (68/70)' },
          { id: 'wagon', label: 'Chiến Xa Công Hội' },
        ]}
        activeId={guildTab}
        onChange={(id) => setGuildTab(id as 'hunt' | 'members' | 'wagon')}
      />

      {huntLog && (
        <div className="p-2 rounded-xl bg-emerald-800 text-emerald-100 text-xs font-extrabold text-center">
          {huntLog}
        </div>
      )}

      {guildTab === 'hunt' && (
        <div className="space-y-2.5">
          {[
            {
              id: 'wrizz',
              name: 'Wrizz — Cuồng Chiến Bạo Chúa',
              sub: 'Mở mỗi ngày · Lượt khiêu chiến: 2/2',
              reward: '+65,000 Vàng · +1,500 Xu Công Hội · Rương T4',
              emoji: '👹',
            },
            {
              id: 'soren',
              name: 'Soren — Huyết Dực Manticore',
              sub: 'Đã mở khóa bởi Hội Trưởng · Lượt khiêu chiến: 2/2',
              reward: '+85,000 Vàng · +2,200 Xu Công Hội · Đá Thăng Hoa',
              emoji: '🦁',
            },
          ].map((boss) => (
            <div
              key={boss.id}
              className="p-3 rounded-xl bg-[#faf0dc] border-2 border-[#9c723c] flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-xl bg-[#3b1d12] border-2 border-[#ef4444] flex items-center justify-center text-2xl">
                  {boss.emoji}
                </div>
                <div>
                  <div className="text-xs font-black text-[#3b2412]">
                    {boss.name}
                  </div>
                  <div className="text-[10px] text-[#6b4826]">{boss.sub}</div>
                  <div className="text-[10px] font-mono font-bold text-amber-800 mt-0.5">
                    {boss.reward}
                  </div>
                </div>
              </div>
              <FantasyButton
                variant="cyan"
                size="sm"
                testId={`btn-guild-hunt-${boss.id}`}
                onClick={() => handleGuildHunt(boss.name)}
              >
                Càn Quét
              </FantasyButton>
            </div>
          ))}
        </div>
      )}

      {guildTab === 'members' && (
        <div className="space-y-1.5">
          {[
            { name: 'Van · Esperia (Bạn)', role: 'Hội Trưởng', power: '1,420K' },
            { name: 'Aurelia · Solar', role: 'Phó Hội', power: '1,280K' },
            { name: 'Kaelen · Night', role: 'Tinh Anh', power: '1,150K' },
            { name: 'Lyra · Tempest', role: 'Thành Viên', power: '980K' },
          ].map((m, i) => (
            <div
              key={i}
              className="px-3 py-2 rounded-xl bg-[#faf0dc] border border-[#9c723c] flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-black text-[#3b2412]">{m.name}</span>
                <span className="ml-2 px-1.5 py-0.5 rounded bg-[#4a3019] text-[#fde047] text-[9px] font-bold">
                  {m.role}
                </span>
              </div>
              <span className="font-mono font-black text-amber-900">
                ✊ {m.power}
              </span>
            </div>
          ))}
        </div>
      )}

      {guildTab === 'wagon' && (
        <div className="p-3 rounded-xl bg-[#faf0dc] border-2 border-[#9c723c] space-y-2 text-xs">
          <div className="font-black text-[#3b2412]">
            Tu Sửa Chiến Xa Công Hội (Đinh Ốc đang có: 🔩 880)
          </div>
          <p className="text-[#5c3818]">
            Nộp Đinh Ốc Chiến Xa Công Hội thu thập từ Chiến Dịch để nhận Kim Cương và Xu Công Hội cho toàn bộ thành viên.
          </p>
          <FantasyButton
            variant="gold"
            size="sm"
            onClick={() =>
              handleGuildHunt('Chiến Xa Công Hội (Nộp 100 Đinh Ốc)')
            }
          >
            Nộp 100 Đinh Ốc · Nhận Thưởng
          </FantasyButton>
        </div>
      )}
    </PopupModal>
  );
};

/** K. QUESTS / TASKS MODAL (Daily, Weekly, Campaign Quests with Activity Chests) */
export const ClassicQuestsModal: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const store = useGameStore();
  const [questTab, setQuestTab] = useState<'daily' | 'weekly' | 'campaign'>(
    'daily'
  );
  const [claimedIds, setClaimedIds] = useState<Record<string, boolean>>({});
  const [activityPts, setActivityPts] = useState<number>(80);

  const quests = [
    {
      id: 'q1',
      title: 'Nhận Thưởng Rương AFK 2 Lần',
      progress: '2/2',
      rewardText: '+500 💎 · +20 Điểm Năng Động',
    },
    {
      id: 'q2',
      title: 'Tăng Cấp Anh Hùng Tại Pha Lê 1 Lần',
      progress: '1/1',
      rewardText: '+35,000 Vàng · +20 Điểm Năng Động',
    },
    {
      id: 'q3',
      title: 'Chiêu Mộ Anh Hùng Tại Quán Rượu Dolly',
      progress: '1/1',
      rewardText: '+3 Cuộn Triệu Hồi · +30 Điểm Năng Động',
    },
    {
      id: 'q4',
      title: 'Chiến Thắng 1 Trận Chiến Dịch Hoặc Tháp Vua',
      progress: '1/1',
      rewardText: '+800 💎 · +30 Điểm Năng Động',
    },
  ];

  const handleClaimQuest = (id: string) => {
    if (claimedIds[id]) return;
    setClaimedIds((prev) => ({ ...prev, [id]: true }));
    setActivityPts((p) => Math.min(100, p + 20));
    store.claimIdleTribute();
  };

  const handleClaimAll = () => {
    const next: Record<string, boolean> = {};
    quests.forEach((q) => {
      next[q.id] = true;
    });
    setClaimedIds(next);
    setActivityPts(100);
    store.claimFreeSanctumGift();
  };

  return (
    <PopupModal
      title="Quests · Nhiệm Vụ Ngày & Chiến Dịch"
      onClose={onClose}
      testId="classic-quests-modal"
      maxWidthClass="max-w-lg"
    >
      {/* Classic AFK Arena Activity Chest Progress Track (20 / 40 / 60 / 80 / 100) */}
      <div className="p-3 rounded-xl bg-gradient-to-b from-[#3d2514] to-[#241509] border-2 border-[#c89b4b] text-[#fff2d1] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-black text-[#fde047]">
            🎁 Điểm Năng Động Hôm Nay: {activityPts}/100
          </span>
          <FantasyButton
            variant="gold"
            size="xs"
            testId="btn-quests-claim-all"
            onClick={handleClaimAll}
          >
            Nhận Tất Cả
          </FantasyButton>
        </div>
        <div className="w-full h-2.5 bg-[#140b05] border border-[#8c6430] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#f59e0b] to-[#fde047] transition-all"
            style={{ width: `${activityPts}%` }}
          />
        </div>
        <div className="grid grid-cols-5 gap-1 text-center text-[9px] font-mono text-[#fde047]">
          {[20, 40, 60, 80, 100].map((milestone) => (
            <div
              key={milestone}
              className={`py-0.5 rounded border ${
                activityPts >= milestone
                  ? 'bg-[#593a1e] border-[#fde047]'
                  : 'bg-[#1a0f07] border-[#6e4b26] opacity-60'
              }`}
            >
              🎁 Mốc {milestone}
            </div>
          ))}
        </div>
      </div>

      <TabSwitcher
        tabs={[
          { id: 'daily', label: 'Hàng Ngày', badge: true },
          { id: 'weekly', label: 'Hàng Tuần', badge: true },
          { id: 'campaign', label: 'Thành Tựu Ải' },
        ]}
        activeId={questTab}
        onChange={(id) => setQuestTab(id as 'daily' | 'weekly' | 'campaign')}
      />

      <div className="space-y-2">
        {quests.map((q) => {
          const isDone = Boolean(claimedIds[q.id]);
          return (
            <div
              key={q.id}
              className="p-2.5 rounded-xl bg-[#faf0dc] border-2 border-[#9c723c] flex items-center justify-between gap-2"
            >
              <div>
                <div className="text-xs font-black text-[#3b2412]">
                  {q.title}{' '}
                  <span className="text-emerald-700 font-mono">
                    ({q.progress})
                  </span>
                </div>
                <div className="text-[10px] font-mono font-bold text-[#7c5121] mt-0.5">
                  {q.rewardText}
                </div>
              </div>
              <FantasyButton
                variant={isDone ? 'bronze' : 'cyan'}
                size="sm"
                disabled={isDone}
                onClick={() => handleClaimQuest(q.id)}
              >
                {isDone ? 'Đã Nhận ✓' : 'Nhận Thưởng'}
              </FantasyButton>
            </div>
          );
        })}
      </div>
    </PopupModal>
  );
};

/** L. EVENTS MODAL (Classic AFK Arena Limited Banners & 7-Day Login) */
export const ClassicEventsModal: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const store = useGameStore();
  const [claimedEvent, setClaimedEvent] = useState<Record<string, boolean>>({});

  const events = [
    {
      id: 'ev1',
      badge: 'ĐĂNG NHẬP 7 NGÀY',
      title: 'Quà Tặng Nữ Thần Dura — Tặng Tướng Ascended & 10 Cuộn',
      desc: 'Điểm danh mỗi ngày nhận ngay Kim Cương, Cuộn Triệu Hồi và Rương Chọn Tướng Thần Tộc.',
      reward: '+2,400 💎 + 10 Cuộn',
    },
    {
      id: 'ev2',
      badge: 'DIMENSIONAL CROSSOVER',
      title: 'Khế Ước Dị Giới — Rimuru, Ainz Ooal Gown & Sung Jinwoo',
      desc: 'Kết nối linh hồn Tướng Dị Giới tại Đền Thăng Thiên để đồng bộ trực tiếp cấp độ và sao.',
      reward: 'Mở Khóa 254 Tướng',
    },
    {
      id: 'ev3',
      badge: 'CELESTIAL ISLES',
      title: 'Đảo Thiên Giới — Khám Phá Bảo Tàng Cổ Vật',
      desc: 'Vượt ải Chiến Dịch thu thập Chìa Khóa Vàng mở ô kho báu Thần Thoại.',
      reward: '+85,000 Vàng AFK',
    },
  ];

  return (
    <PopupModal
      title="Events · Sự Kiện Lễ Hội Esperia"
      onClose={onClose}
      testId="classic-events-modal"
      maxWidthClass="max-w-lg"
    >
      <div className="space-y-2.5">
        {events.map((ev) => {
          const done = Boolean(claimedEvent[ev.id]);
          return (
            <div
              key={ev.id}
              className="p-3 rounded-xl bg-gradient-to-r from-[#3d2514] via-[#4a3019] to-[#2b1a0c] border-2 border-[#d4af37] text-[#fff2d1] space-y-1.5 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-[#fde047] text-[#241407] text-[9px] font-mono font-black">
                  {ev.badge}
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-300">
                  {ev.reward}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-black text-[#fde047]">
                {ev.title}
              </h4>
              <p className="text-[11px] text-[#e5cba0] leading-snug">
                {ev.desc}
              </p>
              <div className="flex justify-end pt-1">
                <FantasyButton
                  variant={done ? 'bronze' : 'gold'}
                  size="sm"
                  disabled={done}
                  onClick={() => {
                    setClaimedEvent((p) => ({ ...p, [ev.id]: true }));
                    if (ev.id === 'ev2') {
                      store.unlockAllRepoHeroes();
                    } else {
                      store.claimFreeSanctumGift();
                    }
                  }}
                >
                  {done ? 'Đã Nhận Quà ✓' : 'Nhận Thưởng Sự Kiện'}
                </FantasyButton>
              </div>
            </div>
          );
        })}
      </div>
    </PopupModal>
  );
};

/** M. MAIL MODAL (Classic AFK Arena Parchment Inbox & Claim All) */
export const ClassicMailModal: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const store = useGameStore();
  const [mails, setMails] = useState([
    {
      id: 'm1',
      sender: 'Hội Đồng Vương Đô Ranhorn',
      title: 'Quà Tiếp Tế Lãnh Chúa Mới (2.400 Kim Cương & 10 Cuộn)',
      date: 'Hôm nay',
      body: 'Chào mừng Lãnh Chúa đến với lục địa Esperia! Hãy dùng Kim Cương và Cuộn Triệu Hồi tại Quán Rượu Quý Tộc Dolly để chiêu mộ đội hình 5v5 mạnh nhất.',
      claimed: false,
    },
    {
      id: 'm2',
      sender: 'Nữ Thần Dura',
      title: 'Thưởng Bảo Trì & Cập Nhật 254 Anh Hùng Classic',
      date: 'Hôm nay',
      body: 'Cảm ơn bạn đã đồng hành cùng Eternal Realms: Classic AFK Arena. Toàn bộ 8 Hệ Tộc và Hào Quang Khắc Chế đã sẵn sàng.',
      claimed: false,
    },
    {
      id: 'm3',
      sender: 'Quản Gia Lữ Quán Cây Sồi',
      title: 'Cổ Tức Nội Thất Độc Quyền 9/9 Hàng Ngày',
      date: 'Hôm qua',
      body: 'Các Anh Hùng bậc Ascended tại Lữ Quán Cây Sồi gửi tặng Lãnh Chúa túi Vàng và Tinh Hoa EXP.',
      claimed: false,
    },
  ]);
  const [selectedMailId, setSelectedMailId] = useState<string>('m1');

  const activeMail = mails.find((m) => m.id === selectedMailId) || mails[0];

  const handleClaimAllMail = () => {
    setMails((prev) => prev.map((m) => ({ ...m, claimed: true })));
    store.claimFreeSanctumGift();
  };

  return (
    <PopupModal
      title="Mail · Hộp Thư Vương Đô Ranhorn"
      onClose={onClose}
      testId="classic-mail-modal"
      maxWidthClass="max-w-lg"
    >
      <div className="space-y-2">
        {mails.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelectedMailId(m.id)}
            className={`w-full p-2.5 rounded-xl border-2 text-left flex items-center justify-between gap-2 cursor-pointer ${
              m.id === activeMail.id
                ? 'bg-[#fff8ea] border-[#d97706]'
                : 'bg-[#faf0dc] border-[#9c723c]'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Mail
                className={`w-4 h-4 shrink-0 ${
                  m.claimed ? 'text-[#8c6430]' : 'text-amber-600'
                }`}
              />
              <div className="truncate">
                <div className="text-xs font-black text-[#3b2412] truncate">
                  {m.title}
                </div>
                <div className="text-[10px] text-[#6b4826]">
                  Từ: {m.sender} · {m.date}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#4a3019] text-[#fde047] shrink-0">
              {m.claimed ? 'Đã Nhận' : '🎁 Có Quà'}
            </span>
          </button>
        ))}
      </div>

      {/* Selected Mail Reader */}
      <div className="p-3 rounded-xl bg-[#faf0dc] border-2 border-[#8c6430] space-y-2">
        <div className="text-xs font-black text-[#3b2412]">
          {activeMail.title}
        </div>
        <p className="text-xs text-[#4d2f14] leading-relaxed">
          {activeMail.body}
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-[#c9ab78]">
          <span className="text-[11px] font-mono font-bold text-amber-900">
            Đính kèm: 💎 2,400 · 📜 10 Cuộn · 💰 50,000G
          </span>
          <FantasyButton
            variant="cyan"
            size="sm"
            testId="btn-claim-all-mail"
            onClick={handleClaimAllMail}
          >
            Nhận Tất Cả Thư
          </FantasyButton>
        </div>
      </div>
    </PopupModal>
  );
};

/** N. SETTINGS MODAL (Classic AFK Arena Audio, 3D Graphics Presets, Camera, Telemetry & Giftcode) */
export const ClassicSettingsModal: React.FC<{
  isMuted: boolean;
  onToggleMute: () => void;
  onClose: () => void;
  graphicsPreset?: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA' | 'AUTO';
  onChangeGraphicsPreset?: (preset: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA' | 'AUTO') => void;
  arenaOverride?: 'auto' | 'enchanted_forest' | 'celestial_temple' | 'shadow_realm';
  onChangeArenaOverride?: (
    arena: 'auto' | 'enchanted_forest' | 'celestial_temple' | 'shadow_realm'
  ) => void;
  cameraShakeEnabled?: boolean;
  onToggleCameraShake?: () => void;
  ultimateCameraEnabled?: boolean;
  onToggleUltimateCamera?: () => void;
  reducedMotion?: boolean;
  onToggleReducedMotion?: () => void;
  showPerfOverlay?: boolean;
  onTogglePerfOverlay?: () => void;
}> = ({
  isMuted,
  onToggleMute,
  onClose,
  graphicsPreset = 'AUTO',
  onChangeGraphicsPreset,
  arenaOverride = 'auto',
  onChangeArenaOverride,
  cameraShakeEnabled = true,
  onToggleCameraShake,
  ultimateCameraEnabled = true,
  onToggleUltimateCamera,
  reducedMotion = false,
  onToggleReducedMotion,
  showPerfOverlay = false,
  onTogglePerfOverlay,
}) => {
  const store = useGameStore();
  const [voiceLang, setVoiceLang] = useState<'en' | 'vi' | 'jp' | 'kr'>('vi');
  const [giftCode, setGiftCode] = useState('AFK888');
  const [codeStatus, setCodeStatus] = useState<string | null>(null);

  const handleRedeemCode = () => {
    if (!giftCode.trim()) return;
    store.claimFreeSanctumGift();
    setCodeStatus(
      `Nhập Giftcode "${giftCode.toUpperCase()}" thành công! Nhận +2.400 Kim Cương & +10 Cuộn Triệu Hồi!`
    );
  };

  return (
    <PopupModal
      title="Settings · Cài Đặt Đồ Họa 3D & Hệ Thống"
      onClose={onClose}
      testId="classic-settings-modal"
      maxWidthClass="max-w-md"
    >
      {/* Player Account Card */}
      <div className="p-2.5 rounded-xl bg-[#3d2514] border border-[#c89b4b] text-[#fff2d1] flex items-center justify-between text-xs">
        <div>
          <div className="font-black text-[#fde047]">
            Lãnh Chúa: Van · Esperia (VIP 12)
          </div>
          <div className="text-[10px] text-[#e5cba0]">
            Máy chủ: S1 - Classic Ranhorn · Three.js 3D Engine
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-700 text-white text-[10px] font-bold">
          3D Active
        </span>
      </div>

      {/* 3D Graphics Quality Presets (LOW / MEDIUM / HIGH / ULTRA / AUTO) */}
      <div className="p-2.5 rounded-xl bg-[#faf0dc] border border-[#9c723c] space-y-1.5">
        <div className="text-xs font-black text-[#4d2f14]">
          Cấu Hình Đồ Họa 3D (Graphics Presets)
        </div>
        <div className="grid grid-cols-5 gap-1">
          {(['LOW', 'MEDIUM', 'HIGH', 'ULTRA', 'AUTO'] as const).map((preset) => (
            <button
              key={preset}
              type="button"
              data-testid={`preset-btn-${preset.toLowerCase()}`}
              onClick={() => onChangeGraphicsPreset?.(preset)}
              className={`py-1.5 rounded border text-[10px] font-black cursor-pointer transition-all ${
                graphicsPreset === preset
                  ? 'bg-gradient-to-b from-[#f5d061] to-[#b45309] text-[#241205] border-[#fef08a] shadow'
                  : 'bg-[#e8cfa0] text-[#4d2f14] border-[#8c6430] hover:brightness-105'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Battle Arena Environment Selector */}
      <div className="p-2.5 rounded-xl bg-[#faf0dc] border border-[#9c723c] space-y-1.5">
        <div className="text-xs font-black text-[#4d2f14]">
          Chiến Trường 3D (3D Arena Environment)
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'auto', label: 'Tự Động Theo Ải' },
            { id: 'enchanted_forest', label: 'Rừng Tinh Linh 3D' },
            { id: 'celestial_temple', label: 'Thánh Điện 3D' },
            { id: 'shadow_realm', label: 'Minh Giới 3D' },
          ].map((arena) => (
            <button
              key={arena.id}
              type="button"
              data-testid={`arena-btn-${arena.id}`}
              onClick={() =>
                onChangeArenaOverride?.(
                  arena.id as
                    | 'auto'
                    | 'enchanted_forest'
                    | 'celestial_temple'
                    | 'shadow_realm'
                )
              }
              className={`px-2 py-1.5 rounded border text-[10px] font-extrabold cursor-pointer text-left truncate ${
                arenaOverride === arena.id
                  ? 'bg-emerald-700 text-white border-emerald-300 shadow'
                  : 'bg-[#e8cfa0] text-[#3b2412] border-[#8c6430]'
              }`}
            >
              {arena.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audio, 3D Camera & Performance Telemetry Toggles */}
      <div className="space-y-1.5 text-xs font-bold">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#faf0dc] border border-[#9c723c]">
          <span className="flex items-center gap-1.5">
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-600" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-700" />
            )}
            <span>Hệ Thống Âm Thanh 8-Bus (Web Audio)</span>
          </span>
          <FantasyButton
            variant={isMuted ? 'bronze' : 'emerald'}
            size="xs"
            onClick={onToggleMute}
          >
            {isMuted ? 'Đang Tắt' : 'Đang Bật'}
          </FantasyButton>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-[#faf0dc] border border-[#9c723c]">
          <span>Camera Cận Cảnh Tuyệt Kỹ 3D (Ultimate Camera)</span>
          <FantasyButton
            variant={ultimateCameraEnabled ? 'emerald' : 'bronze'}
            size="xs"
            onClick={() => onToggleUltimateCamera?.()}
          >
            {ultimateCameraEnabled ? 'ON' : 'OFF'}
          </FantasyButton>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-[#faf0dc] border border-[#9c723c]">
          <span>Rung Chấn Camera Chí Mạng (Camera Shake)</span>
          <FantasyButton
            variant={cameraShakeEnabled ? 'emerald' : 'bronze'}
            size="xs"
            onClick={() => onToggleCameraShake?.()}
          >
            {cameraShakeEnabled ? 'ON' : 'OFF'}
          </FantasyButton>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-[#faf0dc] border border-[#9c723c]">
          <span>Giảm Chuyển Động (Reduced Motion)</span>
          <FantasyButton
            variant={reducedMotion ? 'emerald' : 'bronze'}
            size="xs"
            onClick={() => onToggleReducedMotion?.()}
          >
            {reducedMotion ? 'ON' : 'OFF'}
          </FantasyButton>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-[#faf0dc] border border-[#9c723c]">
          <span>Hiển Thị Chi Tiết FPS / Draw Calls / Triangles</span>
          <FantasyButton
            variant={showPerfOverlay ? 'emerald' : 'bronze'}
            size="xs"
            testId="toggle-perf-hud-btn"
            onClick={() => onTogglePerfOverlay?.()}
          >
            {showPerfOverlay ? 'ON' : 'OFF'}
          </FantasyButton>
        </div>
      </div>

      {/* Voice Settings */}
      <div className="p-2.5 rounded-xl bg-[#faf0dc] border border-[#9c723c] space-y-1.5">
        <div className="text-xs font-black text-[#4d2f14]">
          Ngôn Ngữ Lồng Tiếng (Voice Settings)
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {[
            { id: 'vi', label: 'Tiếng Việt' },
            { id: 'en', label: 'English' },
            { id: 'jp', label: '日本語 (Japanese)' },
            { id: 'kr', label: '한국어 (Korean)' },
          ].map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() =>
                setVoiceLang(lang.id as 'en' | 'vi' | 'jp' | 'kr')
              }
              className="flex items-center gap-2 p-1.5 rounded bg-[#e8cfa0] border border-[#8c6430] cursor-pointer text-left font-bold"
            >
              <span
                className={`w-4 h-4 rounded flex items-center justify-center ${
                  voiceLang === lang.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#3b2412]'
                }`}
              >
                {voiceLang === lang.id && <Check className="w-3 h-3" />}
              </span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Redemption Code Box */}
      <div className="p-2.5 rounded-xl bg-[#faf0dc] border border-[#9c723c] space-y-1.5">
        <div className="text-xs font-black text-[#4d2f14]">
          Mã Quà Tặng Classic AFK Arena (Redemption Code)
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={giftCode}
            onChange={(e) => setGiftCode(e.target.value)}
            placeholder="Nhập mã: AFK888, CLASSIC999..."
            className="flex-1 px-2.5 py-1 rounded bg-white border border-[#8c6430] text-xs font-mono font-bold text-[#3b2412]"
          />
          <FantasyButton
            variant="cyan"
            size="sm"
            testId="btn-redeem-giftcode"
            onClick={handleRedeemCode}
          >
            Đổi Quà
          </FantasyButton>
        </div>
        {codeStatus && (
          <div className="text-[11px] font-bold text-emerald-800">
            {codeStatus}
          </div>
        )}
      </div>
    </PopupModal>
  );
};

// ============================================================================
// PORTRAIT MOBILE SHELL, STRUCTURED CARDS & VERTICAL BATTLE PRIMITIVES
// (PHẦN 1, PHẦN 2, PHẦN 3 DELIVERABLES)
// ============================================================================

/** 12. MobileFrame — Fixed Mobile Portrait Container (460px max-width centered on desktop) */
export const MobileFrame: React.FC<{
  portraitMode?: boolean;
  children: React.ReactNode;
}> = ({ portraitMode = true, children }) => (
  <main className="relative w-screen h-screen overflow-hidden bg-[#0e0804] text-amber-50 select-none flex items-center justify-center">
    <div
      data-testid="mobile-portrait-frame"
      className={`relative h-full mx-auto flex flex-col justify-between overflow-hidden transition-all duration-200 ${
        portraitMode
          ? 'w-full max-w-[460px] border-x-[3px] border-[#b8893e] shadow-[0_0_90px_rgba(0,0,0,0.98)] bg-[#1c1209]'
          : 'w-full max-w-[960px] border-x-2 border-[#b8893e] bg-[#1c1209]'
      }`}
    >
      {children}
    </div>
  </main>
);

/** 13. AppShell — Vertical Flex Layout Container inside MobileFrame */
export const AppShell: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div
    data-testid="app-shell"
    className={`relative w-full h-full flex flex-col justify-between overflow-hidden ${className}`}
  >
    {children}
  </div>
);

/** 14. ResourceBar — Dedicated 4-Column Non-Overlapping Currency Row with Custom Beveled RPG Icons */
export const ResourceBar: React.FC<{
  gold: number;
  heroExp: number;
  essenceGems: number;
  summonScrolls: number;
  onClaimGold: () => void;
  onClaimGems: () => void;
}> = ({
  gold,
  heroExp,
  essenceGems,
  summonScrolls,
  onClaimGold,
  onClaimGems,
}) => {
  const fmt = (n: number) =>
    n >= 1000000
      ? `${(n / 1000000).toFixed(1)}M`
      : n >= 10000
        ? `${Math.floor(n / 1000)}K`
        : n.toLocaleString();

  return (
    <div
      data-testid="hud-resource-bar"
      className="grid grid-cols-4 gap-1.5 pt-1 border-t border-[#5c3c1e]/70"
    >
      {/* Gold */}
      <div className="flex items-center justify-between gap-1 bg-gradient-to-b from-[#1a0f07] to-[#110904] border border-[#8c6430] rounded-full pl-1 pr-0.5 py-0.5 min-w-0 font-mono tabular-nums shadow-inner">
        <div className="flex items-center gap-1 min-w-0">
          <IconResGoldCoin className="w-4 h-4 shrink-0" />
          <span
            data-testid="hud-gold"
            className="text-[10px] font-extrabold text-[#fff1c2] truncate"
          >
            {fmt(gold)}
          </span>
        </div>
        <button
          type="button"
          onClick={onClaimGold}
          title="Thu hoạch nhanh Vàng AFK"
          className="w-4 h-4 rounded-full flex items-center justify-center cursor-pointer shrink-0 hover:brightness-110"
        >
          <IconSysPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Hero EXP */}
      <div className="flex items-center justify-between gap-1 bg-gradient-to-b from-[#1a0f07] to-[#110904] border border-[#8c6430] rounded-full px-1.5 py-0.5 min-w-0 font-mono tabular-nums shadow-inner">
        <div className="flex items-center gap-1 min-w-0">
          <IconResHeroExp className="w-4 h-4 shrink-0" />
          <span
            data-testid="hud-exp"
            className="text-[10px] font-extrabold text-sky-200 truncate"
          >
            {fmt(heroExp)}
          </span>
        </div>
      </div>

      {/* Diamonds */}
      <div className="flex items-center justify-between gap-1 bg-gradient-to-b from-[#1a0f07] to-[#110904] border border-[#8c6430] rounded-full pl-1 pr-0.5 py-0.5 min-w-0 font-mono tabular-nums shadow-inner">
        <div className="flex items-center gap-1 min-w-0">
          <IconResDiamond className="w-4 h-4 shrink-0" />
          <span
            data-testid="hud-gems"
            className="text-[10px] font-extrabold text-[#fff1c2] truncate"
          >
            {fmt(essenceGems)}
          </span>
        </div>
        <button
          type="button"
          onClick={onClaimGems}
          title="Nhận Kim Cương & Cuộn Triệu Hồi"
          className="w-4 h-4 rounded-full flex items-center justify-center cursor-pointer shrink-0 hover:brightness-110"
        >
          <IconSysPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Summon Scrolls */}
      <div className="flex items-center justify-between gap-1 bg-gradient-to-b from-[#1a0f07] to-[#110904] border border-[#8c6430] rounded-full px-1.5 py-0.5 min-w-0 font-mono tabular-nums shadow-inner">
        <div className="flex items-center gap-1 min-w-0">
          <IconResScroll className="w-4 h-4 shrink-0" />
          <span
            data-testid="hud-scrolls"
            className="text-[10px] font-extrabold text-amber-200 truncate"
          >
            {summonScrolls}
          </span>
        </div>
      </div>
    </div>
  );
};

/** 15. TopHUD — 2-Row Non-Overlapping Classic AFK Arena Header
 *  Row 1: Player Avatar + Player Info + Combat Power | Custom Beveled Fantasy Utility Icons
 *  Row 2: ResourceBar (Gold, EXP, Diamonds, Scrolls)
 */
export const TopHUD: React.FC<{
  leaderHero: HeroDefinition;
  teamPower: number;
  gold: number;
  heroExp: number;
  essenceGems: number;
  summonScrolls: number;
  isMuted: boolean;
  portraitMode: boolean;
  onClaimGold: () => void;
  onClaimGems: () => void;
  onToggleMute: () => void;
  onTogglePortraitMode: () => void;
  onOpenAdbModal: () => void;
  onOpenSystemModal: (
    modal: 'bag' | 'guild' | 'quests' | 'events' | 'mail' | 'settings'
  ) => void;
}> = ({
  leaderHero,
  teamPower,
  gold,
  heroExp,
  essenceGems,
  summonScrolls,
  isMuted,
  portraitMode,
  onClaimGold,
  onClaimGems,
  onToggleMute,
  onTogglePortraitMode,
  onOpenAdbModal,
  onOpenSystemModal,
}) => (
  <header
    data-testid="classic-top-hud"
    className="relative z-30 pointer-events-auto shrink-0 bg-gradient-to-b from-[#332010] via-[#24160b] to-[#180e07] border-b-2 border-[#a87e3b] px-2.5 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.85)] space-y-1"
  >
    {/* Row 1: Player Avatar + Info + Power on Left | Custom Fantasy RPG Utility Icons on Right */}
    <div className="flex items-center justify-between gap-1 min-w-0">
      <div className="flex items-center gap-1.5 min-w-0 shrink-0">
        <button
          type="button"
          data-testid="hud-player-avatar-btn"
          onClick={() => onOpenSystemModal('settings')}
          className="relative shrink-0 cursor-pointer rounded-xl p-0.5 bg-gradient-to-b from-[#f5d061] to-[#8c6223] shadow"
          title="Hồ Sơ Lãnh Chúa & Cài Đặt (Settings)"
        >
          <div className="rounded-lg overflow-hidden border border-[#2b1b0e]">
            <HeroAvatarSvg hero={leaderHero} size="sm" />
          </div>
          <span className="absolute -bottom-1 inset-x-0.5 rounded bg-[#180e07] border border-[#d4af37] text-[7px] font-mono font-black text-[#fde047] text-center leading-none py-0.2">
            Lv.120
          </span>
        </button>

        <div className="min-w-0 leading-tight">
          <div className="flex items-center gap-1">
            <span className="text-[10.5px] font-extrabold text-[#fff3d1] whitespace-nowrap">
              Esperia Lord
            </span>
            <span className="hidden sm:inline-flex px-1 py-0.2 rounded bg-gradient-to-r from-[#f5d061] to-[#c69d53] text-[#241508] font-mono text-[7.5px] font-black items-center gap-0.5 shrink-0">
              <Crown className="w-2 h-2 fill-current" /> VIP12
            </span>
          </div>

          <div className="flex items-center gap-1 mt-0.5">
            <IconSysCombatFist className="w-3.5 h-3.5 shrink-0" />
            <span
              data-testid="hud-team-power"
              className="text-[11px] font-mono font-black text-[#fde047] tabular-nums whitespace-nowrap"
            >
              {teamPower.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Custom Fantasy RPG Beveled Utility Icon Group */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          data-testid="hud-bag-btn"
          onClick={() => onOpenSystemModal('bag')}
          title="Bag · Túi Đồ"
          className="relative w-6 h-6 rounded-md bg-gradient-to-b from-[#332010] to-[#1e1209] hover:brightness-110 border border-[#b8893e] flex items-center justify-center cursor-pointer shadow-inner"
        >
          <RedNotificationDot className="absolute -top-1 -right-1 z-10 scale-90" />
          <IconUtilBag className="w-4 h-4" />
        </button>

        <button
          type="button"
          data-testid="hud-quests-btn"
          onClick={() => onOpenSystemModal('quests')}
          title="Quests · Nhiệm Vụ"
          className="relative w-6 h-6 rounded-md bg-gradient-to-b from-[#332010] to-[#1e1209] hover:brightness-110 border border-[#b8893e] flex items-center justify-center cursor-pointer shadow-inner"
        >
          <RedNotificationDot count={3} className="absolute -top-1 -right-1 z-10 scale-90" />
          <IconUtilQuests className="w-4 h-4" />
        </button>

        <button
          type="button"
          data-testid="hud-events-btn"
          onClick={() => onOpenSystemModal('events')}
          title="Events · Sự Kiện"
          className="relative w-6 h-6 rounded-md bg-gradient-to-b from-[#332010] to-[#1e1209] hover:brightness-110 border border-[#b8893e] flex items-center justify-center cursor-pointer shadow-inner"
        >
          <RedNotificationDot className="absolute -top-1 -right-1 z-10 scale-90" />
          <IconUtilEvents className="w-4 h-4" />
        </button>

        <button
          type="button"
          data-testid="hud-guild-btn"
          onClick={() => onOpenSystemModal('guild')}
          title="Guild · Công Hội"
          className="w-6 h-6 rounded-md bg-gradient-to-b from-[#332010] to-[#1e1209] hover:brightness-110 border border-[#b8893e] flex items-center justify-center cursor-pointer shadow-inner"
        >
          <IconUtilGuild className="w-4 h-4" />
        </button>

        <button
          type="button"
          data-testid="hud-mail-btn"
          onClick={() => onOpenSystemModal('mail')}
          title="Mail · Hộp Thư"
          className="relative w-6 h-6 rounded-md bg-gradient-to-b from-[#332010] to-[#1e1209] hover:brightness-110 border border-[#b8893e] flex items-center justify-center cursor-pointer shadow-inner"
        >
          <RedNotificationDot count={2} className="absolute -top-1 -right-1 z-10 scale-90" />
          <IconUtilMail className="w-4 h-4" />
        </button>

        <button
          type="button"
          data-testid="hud-settings-btn"
          onClick={() => onOpenSystemModal('settings')}
          title="Settings · Cài Đặt"
          className="w-6 h-6 rounded-md bg-gradient-to-b from-[#332010] to-[#1e1209] hover:brightness-110 border border-[#b8893e] flex items-center justify-center cursor-pointer shadow-inner"
        >
          <IconUtilSettings className="w-4 h-4" />
        </button>

        <button
          type="button"
          aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          onClick={onToggleMute}
          className="w-6 h-6 rounded-md bg-gradient-to-b from-[#332010] to-[#1e1209] hover:brightness-110 border border-[#8c6430] flex items-center justify-center cursor-pointer shadow-inner"
        >
          <IconUtilAudio muted={isMuted} className="w-4 h-4" />
        </button>

        <button
          type="button"
          data-testid="hud-bluestacks-mode-btn"
          onClick={onTogglePortraitMode}
          title="Chuyển đổi Khung Dọc Mobile 9:16 / Widescreen"
          className={`w-6 h-6 rounded-md border text-[9px] font-bold flex items-center justify-center cursor-pointer ${
            portraitMode
              ? 'bg-[#d4af37] text-[#1e1209] border-amber-200'
              : 'bg-[#26170b] text-[#f3d38c] border-[#8c6430]'
          }`}
        >
          {portraitMode ? (
            <Smartphone className="w-3 h-3" />
          ) : (
            <Monitor className="w-3 h-3" />
          )}
        </button>

        <button
          type="button"
          data-testid="hud-adb-bridge-btn"
          onClick={onOpenAdbModal}
          title="Thông tin Kiến trúc Giao diện"
          className="h-6 px-1 rounded-md bg-[#26170b] border border-[#8c6430] text-[7.5px] font-mono font-bold text-amber-300 cursor-pointer"
        >
          UI
        </button>
      </div>
    </div>

    {/* Row 2: Dedicated 4-Column Resource Bar */}
    <ResourceBar
      gold={gold}
      heroExp={heroExp}
      essenceGems={essenceGems}
      summonScrolls={summonScrolls}
      onClaimGold={onClaimGold}
      onClaimGems={onClaimGems}
    />
  </header>
);

/** 16. FantasyCard — Structured Card with explicit Header / Body / Footer & Width Constraints */
export const FantasyCard: React.FC<{
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  testId?: string;
}> = ({ header, footer, children, className = '', testId }) => (
  <div
    data-testid={testId}
    className={`rounded-xl bg-[#faf0dc] border-2 border-[#9c723c] text-[#3b2412] shadow-md overflow-hidden flex flex-col justify-between min-w-0 ${className}`}
  >
    {header && (
      <div className="px-3 py-1.5 bg-[#ebd3a7] border-b border-[#c9ab78] flex items-center justify-between gap-2 min-w-0">
        {header}
      </div>
    )}
    <div className="p-2.5 flex-1 min-w-0">{children}</div>
    {footer && (
      <div className="px-3 py-1.5 bg-[#f3e3c3] border-t border-[#c9ab78] flex items-center justify-between gap-2 min-w-0">
        {footer}
      </div>
    )}
  </div>
);

/** 17. BuildingCard — Portrait-Friendly Ranhorn Building Card without Text Overflow */
export const BuildingCard: React.FC<{
  title: string;
  subtitle: string;
  badge: string;
  previewImg: string;
  onClick: () => void;
  testId?: string;
}> = ({ title, subtitle, badge, previewImg, onClick, testId }) => (
  <button
    type="button"
    data-testid={testId}
    onClick={onClick}
    className="group w-full p-2 rounded-xl bg-[#faf0dc] hover:bg-[#fff8ea] border-2 border-[#9c723c] hover:border-[#d4af37] text-left transition-all cursor-pointer flex items-center gap-2.5 shadow-sm min-w-0"
  >
    <img
      src={previewImg}
      alt=""
      aria-hidden="true"
      className="w-11 h-12 rounded-lg object-cover border-2 border-[#8c6430] shrink-0"
    />
    <div className="min-w-0 flex-1 overflow-hidden">
      <div className="flex items-center justify-between gap-1">
        <span className="inline-block text-[8px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-[#4a3019] text-[#fde047] truncate max-w-[140px]">
          {badge}
        </span>
      </div>
      <div className="text-xs font-extrabold text-[#3b2412] truncate mt-0.5">
        {title}
      </div>
      <div className="text-[10px] text-[#6b4826] line-clamp-1 leading-tight mt-0.5">
        {subtitle}
      </div>
    </div>
  </button>
);

/** 18. BattleHUD — Zone 1 (Top Bar of Vertical Mobile Portrait Battle Screen) */
export const BattleHUD: React.FC<{
  chapter: string;
  stageName: string;
  formattedTimer: string;
  battleSpeed: 1 | 2;
  autoUltimate: boolean;
  isPaused: boolean;
  onToggleSpeed: () => void;
  onToggleAuto: () => void;
  onRestart: () => void;
  onTogglePause: () => void;
  onOpenCampaign: () => void;
}> = ({
  chapter,
  stageName,
  formattedTimer,
  battleSpeed,
  autoUltimate,
  isPaused,
  onToggleSpeed,
  onToggleAuto,
  onRestart,
  onTogglePause,
  onOpenCampaign,
}) => (
  <div
    data-testid="battle-top-hud"
    className="relative z-20 pointer-events-auto shrink-0 px-2.5 py-1.5 bg-gradient-to-b from-[#26170b]/95 to-[#160d06]/95 border-b border-[#8c6430] flex items-center justify-between gap-1.5 min-w-0"
  >
    {/* Left: Stage Banner & Timer */}
    <div className="flex items-center gap-1.5 min-w-0 flex-1">
      <button
        type="button"
        onClick={onOpenCampaign}
        title="Mở Bản Đồ Chiến Dịch"
        className="px-2 py-0.5 rounded-lg bg-[#3b2412] hover:bg-[#4d2f18] border border-[#d4af37] text-[#fde047] font-mono text-[10px] font-black shrink-0 flex items-center gap-1 cursor-pointer"
      >
        <IconNavCampaign active className="w-3.5 h-3.5" />
        <span>{chapter}</span>
      </button>

      <span className="text-[11px] font-extrabold text-[#fff2d1] truncate min-w-0">
        {stageName}
      </span>

      <span
        data-testid="hud-battle-timer"
        className="px-1.5 py-0.5 rounded bg-[#0f0904] border border-[#7c582b] font-mono text-[10px] font-bold text-[#fde047] tabular-nums shrink-0"
      >
        ⏱ {formattedTimer}
      </span>
    </div>

    {/* Right: Compact Battle Controls (Auto, x2, Restart, Pause) */}
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        data-testid="toggle-auto-ult-btn"
        onClick={onToggleAuto}
        className={`px-2 py-0.5 rounded-lg border font-mono text-[10px] font-black cursor-pointer ${
          autoUltimate
            ? 'bg-gradient-to-b from-[#f5d061] to-[#7c5821] text-[#1e1209] border-[#fef08a]'
            : 'bg-[#2a190c] text-[#d6be96] border-[#8c6430]'
        }`}
      >
        Auto: {autoUltimate ? 'ON' : 'OFF'}
      </button>

      <button
        type="button"
        data-testid="toggle-speed-btn"
        onClick={onToggleSpeed}
        className={`px-2 py-0.5 rounded-lg border font-mono text-[10px] font-black cursor-pointer ${
          battleSpeed === 2
            ? 'bg-gradient-to-b from-[#f5d061] to-[#7c5821] text-[#1e1209] border-[#fef08a]'
            : 'bg-[#2a190c] text-[#fde047] border-[#8c6430]'
        }`}
      >
        x{battleSpeed}
      </button>

      <button
        type="button"
        data-testid="hud-restart-btn"
        aria-label="Đánh lại màn"
        onClick={onRestart}
        className="w-6 h-6 rounded-lg bg-[#26170b] hover:bg-[#3d2514] border border-[#8c6430] text-amber-200 flex items-center justify-center cursor-pointer"
      >
        <IconSysBack className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        data-testid="hud-pause-btn"
        aria-label="Tạm dừng"
        onClick={onTogglePause}
        className="w-6 h-6 rounded-lg bg-[#26170b] hover:bg-[#3d2514] border border-[#8c6430] text-amber-200 flex items-center justify-center cursor-pointer"
      >
        {isPaused ? (
          <Play className="w-3 h-3 text-emerald-400" />
        ) : (
          <Pause className="w-3 h-3" />
        )}
      </button>
    </div>
  </div>
);

/** 19. BattleField — Zone 2 (Middle Portrait Battlefield Container) */
export const BattleField: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <div
    data-testid="portrait-battlefield-zone"
    className="relative w-full flex-1 min-h-0 overflow-hidden bg-[#0b101b] flex items-center justify-center pointer-events-auto"
  >
    {children}
  </div>
);

/** 20. HeroUltimateBar — Zone 3 (Bottom 5 Arched Hero Cards + Quick Action Strip) */
export const HeroUltimateBar: React.FC<{
  formation: TeamFormationSlots;
  ownedHeroes: Record<string, OwnedHeroState>;
  liveSnapshot: BattleSnapshot | null;
  idleMinutes: number;
  onTriggerComboUlt: () => void;
  onClaimIdle: () => void;
  onAutoUpgrade: () => void;
  onTriggerHeroUlt: (heroId: string) => void;
  onOpenFormation: () => void;
}> = ({
  formation,
  ownedHeroes,
  liveSnapshot,
  idleMinutes,
  onTriggerComboUlt,
  onClaimIdle,
  onAutoUpgrade,
  onTriggerHeroUlt,
  onOpenFormation,
}) => (
  <div
    data-testid="battle-hero-ultimate-bar"
    className="pointer-events-auto w-full px-2 py-1.5 bg-gradient-to-t from-[#1a0f07] via-[#24150a]/95 to-[#160d06]/90 border-t border-[#8c6430] flex flex-col gap-1.5 shrink-0"
  >
    {/* Compact Action Strip above 5 Arched Hero Cards */}
    <div className="grid grid-cols-3 gap-1.5">
      <button
        type="button"
        data-testid="btn-combo-ultimates"
        onClick={onTriggerComboUlt}
        className="flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-gradient-to-b from-[#52351b] to-[#2b1a0c] border border-[#d4af37] text-[#fde047] font-extrabold text-[10px] cursor-pointer shadow min-w-0"
      >
        <IconSysStar className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">Combo Ult</span>
      </button>

      <button
        type="button"
        data-testid="hud-claim-idle-btn"
        onClick={onClaimIdle}
        className="flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-gradient-to-b from-[#fde047] via-[#e2af34] to-[#9a6b19] text-[#1e1209] font-black text-[10px] cursor-pointer shadow min-w-0"
      >
        <IconResAfkChest className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">AFK ({idleMinutes}m)</span>
      </button>

      <button
        type="button"
        data-testid="btn-auto-upgrade-all"
        onClick={onAutoUpgrade}
        className="flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-gradient-to-b from-[#67e8f9] via-[#22d3ee] to-[#0284c7] text-[#041019] font-black text-[10px] cursor-pointer shadow min-w-0"
      >
        <IconSysUpgrade className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">Level Up</span>
      </button>
    </div>

    {/* 5 Arched Classic AFK Arena Hero Battle Cards */}
    <div className="grid grid-cols-5 gap-1.5">
      {formation.map((heroId, idx) => {
        if (!heroId) {
          return (
            <button
              key={`empty_${idx}`}
              type="button"
              onClick={onOpenFormation}
              className="h-[84px] rounded-t-[18px] rounded-b-lg bg-[#1d1209]/90 border-2 border-dashed border-[#a87e3b] text-[9px] font-bold text-[#e5c483] flex items-center justify-center cursor-pointer"
            >
              + Ô #{idx + 1}
            </button>
          );
        }

        const hero = getHeroById(heroId);
        const owned = ownedHeroes[heroId];
        const liveUnit = liveSnapshot?.units.find(
          (u) => u.team === 'ally' && u.heroId === heroId
        );
        const hpPct =
          liveUnit && liveUnit.maxHp > 0
            ? Math.max(
                0,
                Math.min(100, Math.round((liveUnit.hp / liveUnit.maxHp) * 100))
              )
            : 100;
        const energy = liveUnit
          ? Math.min(100, Math.floor(liveUnit.energy))
          : 0;
        const isAlive = liveUnit ? liveUnit.isAlive : true;
        const isReady = isAlive && energy >= 100;
        const facMeta =
          hero.repoFaction && REPO_FACTION_METADATA[hero.repoFaction];

        return (
          <button
            key={`${hero.id}_${idx}`}
            type="button"
            data-testid={`ult-card-${hero.id}`}
            onClick={() => onTriggerHeroUlt(hero.id)}
            className={`group relative rounded-t-[18px] rounded-b-lg p-1 border-2 transition-all cursor-pointer flex flex-col items-center shadow-lg min-w-0 ${
              !isAlive
                ? 'bg-[#1a1310] border-stone-700 grayscale opacity-55'
                : isReady
                  ? 'bg-gradient-to-b from-[#6b3fa0] via-[#43236b] to-[#24113d] border-[#fde047] shadow-[0_0_14px_rgba(253,224,71,0.85)] -translate-y-0.5'
                  : 'bg-gradient-to-b from-[#553182] via-[#341c54] to-[#1b0e2e] border-[#c89b4b] hover:border-[#fde047]'
            }`}
          >
            <div className="relative w-full flex flex-col items-center">
              <HeroAvatarSvg hero={hero} size="sm" variant="framed" />
              {facMeta && (
                <img
                  src={facMeta.icon}
                  alt={facMeta.label}
                  className="w-3.5 h-3.5 rounded-full bg-[#1a1109] border border-[#d4af37] absolute top-0 left-0 object-contain"
                />
              )}
              <span className="absolute top-0 right-0 px-0.5 rounded bg-[#1a1109]/90 text-[8px] font-mono font-bold text-[#fde047]">
                Lvl {owned?.level ?? 1}
              </span>
            </div>

            {/* HP Bar (Green) */}
            <div className="w-full h-1.5 bg-[#140b06] border border-[#3d2514] rounded-sm overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-[#22c55e] to-[#86efac]"
                style={{ width: `${hpPct}%` }}
              />
            </div>

            {/* Energy Bar (Gold) */}
            <div className="w-full h-1.5 bg-[#140b06] border border-[#3d2514] rounded-sm overflow-hidden mt-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#d97706] to-[#fde047]"
                style={{ width: `${energy}%` }}
              />
            </div>

            <div className="w-full text-center text-[9px] font-extrabold text-[#fff2d1] truncate mt-0.5 leading-tight">
              {isReady ? '★ ULT!' : hero.name.split(' ')[0]}
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

