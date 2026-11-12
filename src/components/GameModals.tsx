import React from 'react';
import { BattleOutcomeSummary } from './BattlefieldCanvas';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onReturnTitle: () => void;
  stageName: string;
  combatPower: number;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onReturnTitle,
  stageName,
  combatPower,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tạm Dừng Trận Đấu"
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(7, 10, 18, 0.78)' }}
    >
      <div className="w-full max-w-md bg-[#111726] border-2 border-[#c69d53] rounded-lg p-6 shadow-[0_16px_48px_rgba(0,0,0,0.9)] text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-[#d4af37] mb-1">
          TẠM DỪNG CHIẾN ĐẤU
        </div>
        <h2 className="font-display text-2xl font-bold text-[#f8f5ee] mb-5">{stageName}</h2>

        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
          <div className="bg-[#0b0f1a] border border-slate-800 rounded p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">Lực Chiến Đội</div>
            <div className="font-mono-num text-lg font-bold text-[#eab308]">
              {combatPower.toLocaleString()}
            </div>
          </div>
          <div className="bg-[#0b0f1a] border border-slate-800 rounded p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">Cộng Hưởng</div>
            <div className="font-mono-num text-lg font-bold text-[#38bdf8]">Pha Lê Đồng Bộ</div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onResume();
            }}
            className="w-full py-3 bg-[#d4af37] hover:bg-[#e5c14d] text-[#090c15] font-display font-bold text-sm tracking-wider rounded border border-[#fef08a] cursor-pointer"
          >
            Tiếp Tục Chiến Đấu (Esc / P)
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onRestart();
            }}
            className="w-full py-2.5 bg-[#1b2438] hover:bg-[#25314d] text-slate-100 font-semibold text-sm rounded border border-slate-700 cursor-pointer"
          >
            Đánh Lại Màn Này (R)
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onReturnTitle();
            }}
            className="w-full py-2.5 bg-[#0d121f] hover:bg-[#161e31] text-slate-300 font-medium text-sm rounded border border-slate-800 cursor-pointer"
          >
            Về Màn Hình Chính
          </button>
        </div>
      </div>
    </div>
  );
};

interface OutcomeModalProps {
  outcome: BattleOutcomeSummary;
  stageIndex: number;
  rewardGold: number;
  rewardExp: number;
  rewardGems: number;
  eloDelta: number;
  newArenaPoints: number;
  onNextOrRetry: () => void;
  onReturnCampaign: () => void;
}

export const OutcomeModal: React.FC<OutcomeModalProps> = ({
  outcome,
  stageIndex,
  rewardGold,
  rewardExp,
  rewardGems,
  eloDelta,
  newArenaPoints,
  onNextOrRetry,
  onReturnCampaign,
}) => {
  const isWin = outcome.didWin;
  const isArena = outcome.mode === 'arena';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isWin ? 'Chiến Thắng' : 'Thất Bại'}
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(7, 10, 18, 0.82)' }}
    >
      <div
        className={`w-full max-w-lg bg-[#111726] border-2 ${
          isWin ? 'border-[#eab308]' : 'border-rose-500/80'
        } rounded-lg p-6 shadow-[0_18px_55px_rgba(0,0,0,0.92)] text-center`}
      >
        <div
          className={`text-xs font-bold uppercase tracking-widest mb-1 ${
            isWin ? 'text-[#eab308]' : 'text-rose-400'
          }`}
        >
          {isArena ? 'KẾT QUẢ ĐẤU TRƯỜNG XẾP HẠNG' : `CHIẾN DỊCH CHƯƠNG 1-${stageIndex}`}
        </div>

        <h2
          className={`font-display text-3xl font-extrabold tracking-wide mb-5 ${
            isWin ? 'text-[#fef08a]' : 'text-rose-300'
          }`}
        >
          {isWin ? 'CHIẾN THẮNG HUY HOÀNG' : 'ĐỘI HÌNH THẤT THỦ'}
        </h2>

        {/* 3 Tabular-Nums Mastery / Progress Stat Tiles */}
        <div className="grid grid-cols-3 gap-3 mb-5 text-left">
          <div className="bg-[#0b0f1a] border border-slate-800 rounded p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              Thời Gian
            </div>
            <div className="font-mono-num text-lg font-bold text-slate-100">
              {outcome.clearTimeSec}s
            </div>
          </div>

          <div className="bg-[#0b0f1a] border border-slate-800 rounded p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              Tổng Sát Thương
            </div>
            <div className="font-mono-num text-lg font-bold text-[#38bdf8]">
              {outcome.totalDamageDealt.toLocaleString()}
            </div>
          </div>

          <div className="bg-[#0b0f1a] border border-slate-800 rounded p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              {isArena ? 'Điểm Xếp Hạng' : isWin ? 'Tướng Sống Sót' : 'Máu Địch Còn'}
            </div>
            <div
              className={`font-mono-num text-lg font-bold ${
                isArena
                  ? eloDelta >= 0
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                  : isWin
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {isArena
                ? `${newArenaPoints} (${eloDelta >= 0 ? `+${eloDelta}` : eloDelta})`
                : isWin
                ? `${outcome.survivingAllies}/5`
                : `${outcome.bossHpRemainingPct}%`}
            </div>
          </div>
        </div>

        {/* Loot / Reward Breakdown */}
        <div className="bg-[#0b0f1a] border border-[#c69d53]/40 rounded p-3.5 mb-6 flex items-center justify-around text-sm">
          <div>
            <span className="text-slate-400 text-xs block">Vàng Thưởng</span>
            <span className="font-mono-num font-bold text-[#eab308]">
              +{rewardGold.toLocaleString()}
            </span>
          </div>
          <div className="h-6 w-[1px] bg-slate-800" />
          <div>
            <span className="text-slate-400 text-xs block">EXP Tướng</span>
            <span className="font-mono-num font-bold text-emerald-400">
              +{rewardExp.toLocaleString()}
            </span>
          </div>
          <div className="h-6 w-[1px] bg-slate-800" />
          <div>
            <span className="text-slate-400 text-xs block">Kim Cương</span>
            <span className="font-mono-num font-bold text-[#38bdf8]">
              +{rewardGems.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isArena ? (
            <button
              type="button"
              data-start="true"
              onClick={(e) => {
                e.currentTarget.blur();
                onReturnCampaign();
              }}
              className="w-full py-3 bg-[#d4af37] hover:bg-[#e5c14d] text-[#090c15] font-display font-bold text-sm tracking-wider rounded border border-[#fef08a] cursor-pointer"
            >
              Quay Lại Chiến Dịch & Đấu Trường
            </button>
          ) : (
            <button
              type="button"
              data-start="true"
              onClick={(e) => {
                e.currentTarget.blur();
                onNextOrRetry();
              }}
              className="w-full py-3 bg-[#d4af37] hover:bg-[#e5c14d] text-[#090c15] font-display font-bold text-sm tracking-wider rounded border border-[#fef08a] cursor-pointer"
            >
              {isWin ? `Tiến Tới Chương 1-${stageIndex} (Enter)` : 'Thử Lại Màn Này (Enter)'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
