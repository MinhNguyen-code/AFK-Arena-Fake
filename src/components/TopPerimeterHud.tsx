import React from 'react';
import { calculateAfkRewards } from '../game/rules';

interface TopPerimeterHudProps {
  gold: number;
  heroExp: number;
  gems: number;
  arcaneDust: number;
  combatPower: number;
  stageIndex: number;
  stageName: string;
  battleMode: 'campaign' | 'arena';
  arenaOpponentName?: string;
  arenaPoints: number;
  elapsedSec: number;
  enemyTotalHpPct: number;
  afkSeconds: number;
  isMuted: boolean;
  onClaimAfkChest: () => void;
  onToggleMute: () => void;
  onPause: () => void;
  onRestartStage: () => void;
}

export const TopPerimeterHud: React.FC<TopPerimeterHudProps> = ({
  gold,
  heroExp,
  gems,
  arcaneDust,
  combatPower,
  stageIndex,
  stageName,
  battleMode,
  arenaOpponentName,
  arenaPoints,
  elapsedSec,
  enemyTotalHpPct,
  afkSeconds,
  isMuted,
  onClaimAfkChest,
  onToggleMute,
  onPause,
  onRestartStage,
}) => {
  const afkPreview = calculateAfkRewards(stageIndex, afkSeconds);
  const afkMinutes = Math.floor(afkSeconds / 60);

  return (
    <div className="fixed top-0 left-0 right-0 z-20 p-3 md:px-5 md:py-3.5 flex items-start justify-between gap-3 pointer-events-none">
      {/* Top-Left Cluster: Squad Power & Resource Treasury */}
      <div className="flex flex-wrap items-center gap-3 bg-[#0d1322]/92 border border-[#c69d53]/50 rounded-md px-3.5 py-2 shadow-[0_6px_20px_rgba(0,0,0,0.75)] pointer-events-auto">
        {/* Combat Power Primary Readout */}
        <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
          <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0" aria-hidden="true">
            <polygon
              points="12,2 21,7 18,19 12,22 6,19 3,7"
              fill="#1e293b"
              stroke="#eab308"
              strokeWidth="2"
            />
            <polygon points="12,5 17,9 15,17 12,19 9,17 7,9" fill="#eab308" />
          </svg>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] leading-none">
              LỰC CHIẾN
            </div>
            <div
              data-testid="squad-combat-power"
              className="font-mono-num text-lg md:text-xl font-extrabold text-[#fef08a] leading-tight stroke-text"
            >
              {Math.round(combatPower).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Gold */}
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
            <circle cx="12" cy="12" r="9" fill="#ca8a04" stroke="#090c15" strokeWidth="2" />
            <circle cx="12" cy="12" r="6" fill="#facc15" />
            <path d="M10 9h4M12 8v8" stroke="#713f12" strokeWidth="1.8" />
          </svg>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">
              VÀNG
            </div>
            <div
              data-testid="hud-gold"
              className="font-mono-num text-sm md:text-base font-bold text-amber-300 leading-tight"
            >
              {Math.round(gold).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Hero EXP */}
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
            <polygon
              points="12,2 19,9 16,21 8,21 5,9"
              fill="#059669"
              stroke="#090c15"
              strokeWidth="2"
            />
            <polygon points="12,5 16,10 14,18 10,18 8,10" fill="#34d399" />
          </svg>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">
              EXP TƯỚNG
            </div>
            <div
              data-testid="hud-exp"
              className="font-mono-num text-sm md:text-base font-bold text-emerald-300 leading-tight"
            >
              {Math.round(heroExp).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Gems */}
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
            <polygon
              points="12,2 21,10 12,22 3,10"
              fill="#0284c7"
              stroke="#090c15"
              strokeWidth="2"
            />
            <polygon points="12,5 17,10 12,18 7,10" fill="#38bdf8" />
          </svg>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">
              KIM CƯƠNG
            </div>
            <div
              data-testid="hud-gems"
              className="font-mono-num text-sm md:text-base font-bold text-sky-300 leading-tight"
            >
              {Math.round(gems).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Arcane Dust */}
        <div className="hidden sm:flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
            <circle cx="12" cy="12" r="8" fill="#7e22ce" stroke="#090c15" strokeWidth="2" />
            <circle cx="12" cy="12" r="4" fill="#d8b4fe" />
          </svg>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">
              BỤI THẦN
            </div>
            <div
              data-testid="hud-dust"
              className="font-mono-num text-sm md:text-base font-bold text-purple-300 leading-tight"
            >
              {Math.round(arcaneDust).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Top-Center Cluster: Active Stage / Ranked Arena Encounter Progress */}
      <div className="hidden lg:flex flex-col items-center bg-[#0d1322]/92 border border-[#c69d53]/50 rounded-md px-5 py-2 shadow-[0_6px_20px_rgba(0,0,0,0.75)] pointer-events-auto min-w-[300px]">
        <div className="flex items-center justify-between w-full gap-4 mb-1">
          <span className="text-xs font-display font-bold tracking-wider text-[#f8f5ee] truncate">
            {battleMode === 'arena'
              ? `ĐẤU TRƯỜNG · VS ${arenaOpponentName || 'Đối Thủ'}`
              : stageName}
          </span>
          <span className="font-mono-num text-xs font-bold text-[#eab308] shrink-0">
            {Math.max(0, 90 - elapsedSec)}s
          </span>
        </div>
        {/* Enemy Force Vitality Bar */}
        <div className="w-full h-2.5 bg-[#070a12] rounded overflow-hidden border border-slate-800 relative">
          <div
            className="h-full bg-rose-600 transition-transform duration-150 origin-left"
            style={{ transform: `scaleX(${Math.max(0, Math.min(1, enemyTotalHpPct / 100))})` }}
          />
        </div>
        <div className="flex items-center justify-between w-full text-[10px] text-slate-400 mt-1">
          <span>SINH LỰC ĐỘI ĐỊCH: {enemyTotalHpPct}%</span>
          <span>HẠNG ELO: {arenaPoints}</span>
        </div>
      </div>

      {/* Top-Right Cluster: AFK Chest Quick Claim + Utility Controls (Mute [M], Pause [P], Restart [R]) */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={(e) => {
            e.currentTarget.blur();
            onClaimAfkChest();
          }}
          className="flex items-center gap-2 px-3 py-2 bg-[#172136] hover:bg-[#22304d] border border-[#eab308]/70 rounded-md shadow-[0_4px_14px_rgba(0,0,0,0.75)] cursor-pointer transition-colors whitespace-nowrap shrink-0"
          title="Thu thập chiến lợi phẩm treo máy AFK"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
            <rect
              x="3"
              y="8"
              width="18"
              height="12"
              rx="2"
              fill="#b45309"
              stroke="#090c15"
              strokeWidth="2"
            />
            <path d="M3 12h18" stroke="#facc15" strokeWidth="2" />
            <rect x="10" y="10" width="4" height="5" fill="#fef08a" />
          </svg>
          <div className="text-left">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#eab308] leading-none">
              KHO BÁU AFK ({afkMinutes}p)
            </div>
            <div className="font-mono-num text-xs font-bold text-slate-100 leading-tight">
              +{afkPreview.gold.toLocaleString()} Vàng
            </div>
          </div>
        </button>

        {/* Compact Square Utility Buttons with tabIndex={-1} and blur() */}
        <button
          type="button"
          tabIndex={-1}
          aria-label={isMuted ? 'Bật âm thanh (M)' : 'Tắt âm thanh (M)'}
          onClick={(e) => {
            e.currentTarget.blur();
            onToggleMute();
          }}
          className="w-10 h-10 flex items-center justify-center bg-[#0d1322]/92 hover:bg-[#1a253d] border border-slate-700 rounded-md text-slate-200 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            {isMuted ? (
              <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
            ) : (
              <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
            )}
          </svg>
        </button>

        <button
          type="button"
          tabIndex={-1}
          aria-label="Đánh lại màn (R)"
          onClick={(e) => {
            e.currentTarget.blur();
            onRestartStage();
          }}
          className="w-10 h-10 flex items-center justify-center bg-[#0d1322]/92 hover:bg-[#1a253d] border border-slate-700 rounded-md text-slate-200 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>

        <button
          type="button"
          tabIndex={-1}
          aria-label="Tạm dừng (P)"
          onClick={(e) => {
            e.currentTarget.blur();
            onPause();
          }}
          className="w-10 h-10 flex items-center justify-center bg-[#0d1322]/92 hover:bg-[#1a253d] border border-slate-700 rounded-md text-slate-200 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        </button>
      </div>
    </div>
  );
};
