import React, { useState } from 'react';
import { AppScreen } from '../store/gameStore';
import { HERO_ROSTER } from '../game/heroes';

interface TitleScreenProps {
  onStartGame: (initialScreen?: AppScreen) => void;
  maxStage: number;
  teamPower: number;
}

const SPLASH_THEMES = [
  {
    id: 'draconic',
    name: 'Draconic Resurgence',
    viName: 'Long Tộc Trỗi Dậy (v1.143)',
    image: '/assets/aistudio/d15f2b2e-2348-11ef-955c-02420a00018c_49bd0100.webp',
  },
  {
    id: 'resurgent',
    name: 'Resurgent Glory',
    viName: 'Phượng Hoàng Tái Sinh (Awakened Talene)',
    image: '/assets/aistudio/d639ac0a-2348-11ef-8ca5-02420a00018f_1e3a529e.webp',
  },
  {
    id: 'rimuru',
    name: 'Dimensional Crossover',
    viName: 'Dị Giới Liên Kết (Rimuru & Shuna)',
    image: '/assets/aistudio/d3a3522a-2348-11ef-bb0a-02420a00018f_12eecd99.webp',
  },
];

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  maxStage,
  teamPower,
}) => {
  const [splashIdx, setSplashIdx] = useState(0);
  const currentSplash = SPLASH_THEMES[splashIdx];

  return (
    <div
      role="dialog"
      aria-label="Eternal Realms Title Screen"
      className="fixed inset-0 z-40 flex flex-col justify-between p-5 md:p-8 pointer-events-auto select-none bg-[#070a12]"
    >
      {/* Authentic AFK Arena Splash Art Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={currentSplash.image}
          alt={currentSplash.name}
          className="w-full h-full object-cover object-center opacity-50 scale-105 blur-[1px] transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060913]/95 via-[#070b16]/80 to-[#060913]/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-transparent to-[#050811]/70" />
      </div>

      {/* Top Safe Margin: Realm Chronicle Readout & Splash Screen Switcher */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        <div className="bg-[#0e1424]/95 border-2 border-[#c69d53]/80 px-4 py-2 rounded-xl shadow-2xl">
          <div className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold">
            AFK ARENA · ETERNAL REALMS ({HERO_ROSTER.length} PLAYABLE HEROES · 8 FACTIONS)
          </div>
          <div className="text-xs font-mono text-slate-200 mt-0.5 tabular-nums">
            Tiến Độ Chiến Dịch: Chương 1-{maxStage} · Lực Chiến Đội Hình:{' '}
            <span className="text-[#fde047] font-extrabold">
              {teamPower.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Splash Screen Selector (matching screenshot d639ac0a) */}
        <div className="flex items-center gap-1.5 bg-[#0e1424]/95 border border-[#c69d53]/60 rounded-xl p-1.5 shadow-xl">
          <span className="text-[10px] font-mono uppercase text-amber-200 px-2">
            Splash Screen:
          </span>
          {SPLASH_THEMES.map((sp, i) => (
            <button
              key={sp.id}
              type="button"
              onClick={() => setSplashIdx(i)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                splashIdx === i
                  ? 'bg-[#d4af37] text-[#090d16]'
                  : 'bg-[#151e34] text-slate-300 hover:text-amber-200'
              }`}
            >
              {sp.name}
            </button>
          ))}
        </div>
      </div>

      {/* Center Split: Left Monumental Title Lockup + Right Live BlueStacks Splash Frame */}
      <div className="relative z-10 my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center max-w-6xl w-full mx-auto">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-4 mb-4">
            <img
              src="/assets/ui/ascended.png"
              alt="AFK Arena Crest"
              className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_0_20px_rgba(245,158,11,0.6)] shrink-0"
            />
            <div>
              <div className="text-xs font-mono uppercase tracking-[0.25em] text-[#fde047] font-bold">
                AFK ARENA: COMPANIONS &amp; DRACONIC RESURGENCE
              </div>
              <h1
                className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-[#fffbeb]"
                style={{
                  fontFamily: '"Cinzel", serif',
                  textShadow: '0 4px 24px rgba(0,0,0,0.95)',
                }}
              >
                ETERNAL REALMS
              </h1>
            </div>
          </div>

          <p className="text-sm md:text-base text-slate-200 max-w-xl mb-5 leading-relaxed">
            Trải nghiệm trọn vẹn thế giới <strong>AFK Arena</strong> với đầy đủ{' '}
            <strong>{HERO_ROSTER.length} Anh Hùng</strong> thuộc <strong>8 Hệ Tộc</strong>{' '}
            (Ánh Sáng, Dã Thú, Rừng Già, Vong Linh, Thần Tộc, Ác Ma, Dị Giới, Long Tộc),
            vòng khắc chế <strong>+25% sát thương</strong>, hào quang đội hình 5v5, Thành
            Chính Ranhorn, Rừng Đen, Tháp Vua và Quán Rượu Quý Tộc.
          </p>

          {/* 8 Faction Emblem Bar Preview */}
          <div className="flex flex-wrap items-center gap-2 mb-6 bg-[#0d1424]/90 border border-[#c69d53]/50 rounded-xl px-3.5 py-2 max-w-xl">
            <img src="/assets/factions/lightbearer.png" alt="Lightbearer" className="w-6 h-6 object-contain" title="Lightbearer (Người Mang Ánh Sáng)" />
            <img src="/assets/factions/mauler.png" alt="Mauler" className="w-6 h-6 object-contain" title="Mauler (Bộ Tộc Dã Thú)" />
            <img src="/assets/factions/wilder.png" alt="Wilder" className="w-6 h-6 object-contain" title="Wilder (Cư Dân Rừng Già)" />
            <img src="/assets/factions/graveborn.png" alt="Graveborn" className="w-6 h-6 object-contain" title="Graveborn (Quân Đoàn Vong Linh)" />
            <img src="/assets/factions/celestial.png" alt="Celestial" className="w-6 h-6 object-contain" title="Celestial (Thần Tộc)" />
            <img src="/assets/factions/hypogean.png" alt="Hypogean" className="w-6 h-6 object-contain" title="Hypogean (Ác Ma)" />
            <img src="/assets/factions/dimensional.png" alt="Dimensional" className="w-6 h-6 object-contain" title="Dimensional (Dị Giới)" />
            <span className="text-xs text-amber-200 font-semibold ml-1">
              8 Hệ Tộc · Khắc Chế +25% · Hào Quang Đội Hình +25% ATK/HP
            </span>
          </div>

          {/* Primary & Secondary Actions (3 total) */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              data-start="true"
              data-testid="title-start-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                onStartGame('battle');
              }}
              className="px-7 py-3.5 rounded-xl bg-gradient-to-b from-[#38bdf8] via-[#06b6d4] to-[#0284c7] hover:brightness-110 active:scale-95 text-[#041019] font-extrabold text-sm uppercase tracking-wider border-2 border-cyan-200 shadow-[0_6px_28px_rgba(6,182,212,0.55)] transition-all cursor-pointer"
            >
              Bắt Đầu Chiến Đấu (Enter)
            </button>

            <button
              type="button"
              data-testid="title-formation-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                onStartGame('formation');
              }}
              className="px-5 py-3.5 rounded-xl bg-[#141c2f]/95 hover:bg-[#1e2942] border-2 border-[#c69d53]/80 text-amber-200 font-bold text-sm transition-colors cursor-pointer shadow-lg"
            >
              Xếp Đội Hình 5v5
            </button>

            <button
              type="button"
              data-testid="title-summon-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                onStartGame('summon');
              }}
              className="px-5 py-3.5 rounded-xl bg-[#141c2f]/95 hover:bg-[#1e2942] border-2 border-purple-400/70 text-purple-200 font-bold text-sm transition-colors cursor-pointer shadow-lg"
            >
              Quán Rượu Quý Tộc (Summon)
            </button>
          </div>
        </div>

        {/* Right: Authentic Vertical AFK Arena Splash Art Card */}
        <div className="hidden lg:flex lg:col-span-5 justify-center">
          <div className="relative w-[270px] h-[460px] rounded-2xl overflow-hidden border-4 border-[#c69d53] shadow-[0_0_50px_rgba(0,0,0,0.95)] bg-[#090d16]">
            <img
              src={currentSplash.image}
              alt={currentSplash.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent text-center">
              <div className="text-[11px] font-bold text-[#fde047]">
                {currentSplash.viName}
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-1.5 border border-amber-500/40">
                <div className="w-full h-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500" />
              </div>
              <div className="text-[9px] font-mono text-amber-200/90 mt-1">
                rel-afkarena_v1.143.02 · Tap to Begin
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Safe Margin: Flat Single-Line Control Hint */}
      <div className="relative z-10 text-xs font-mono text-slate-300">
        Phím tắt: 1-5 Thi Triển Tuyệt Kỹ · C Combo 5 Tuyệt Kỹ · Space Tốc Độ 1x/2x · P Tạm Dừng · R Đánh Lại
      </div>
    </div>
  );
};

