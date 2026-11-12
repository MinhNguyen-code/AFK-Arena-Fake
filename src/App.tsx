import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Swords,
  Users,
  Layers,
  Map,
  Sparkles,
  Home,
  Zap,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Gift,
  Film,
  Smartphone,
  Monitor,
  Trophy,
  Shield,
  Plus,
  Crown,
  Flame,
  ScrollText,
  X,
} from 'lucide-react';
import { useGameStore, AppScreen, BattleRewardSummary } from './store/gameStore';
import {
  getHeroById,
  computeTeamPower,
  HERO_ROSTER,
  REPO_FACTION_METADATA,
  computeFactionAura,
} from './game/heroes';
import { getCampaignStage, CAMPAIGN_STAGES } from './game/campaign';
import { BattleSnapshot } from './game/types';
import { PhaserBattleCanvas } from './components/PhaserBattleCanvas';
import { HeroAvatarSvg } from './components/HeroAvatarSvg';
import { TitleScreen } from './components/TitleScreen';
import {
  LobbyPanel,
  FormationPanel,
  HeroCollectionAndDetailsPanel,
  CampaignMapPanel,
  SummonSanctumPanel,
  VideosAndBossesPanel,
  BattleResultsModal,
} from './components/Screens';
import { soundEngine } from './game/audio';

export default function App() {
  const initialShellState = useMemo<'title' | 'playing'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return 'playing';
      }
    }
    return 'title';
  }, []);

  const [shellState, setShellState] = useState<
    'title' | 'playing' | 'paused' | 'gameover'
  >(initialShellState);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [bluestacksFrameMode, setBluestacksFrameMode] = useState<boolean>(true);
  const [showAdbModal, setShowAdbModal] = useState<boolean>(false);
  const [liveSnapshot, setLiveSnapshot] = useState<BattleSnapshot | null>(null);
  const [lastRewardSummary, setLastRewardSummary] =
    useState<BattleRewardSummary | null>(null);
  const [manualUltimateRequest, setManualUltimateRequest] = useState<{
    heroId: string;
    force: boolean;
    seq: number;
  } | null>(null);

  const store = useGameStore();
  const currentStage = getCampaignStage(store.currentStageId);
  const teamPower = computeTeamPower(store.formation, store.ownedHeroes);
  const allyAura = useMemo(
    () => computeFactionAura(store.formation),
    [store.formation]
  );
  const enemyAura = useMemo(
    () => computeFactionAura(currentStage.enemies.map((e) => e.heroId)),
    [currentStage]
  );
  const idleMinutes = Math.max(1, Math.floor(store.idleAccumulatedSeconds / 60));

  // Sync document.body.dataset.state
  useEffect(() => {
    document.body.dataset.state = shellState;
  }, [shellState]);

  // Auto-clear toast after 3.2s
  useEffect(() => {
    if (!store.toastMessage) return;
    const t = window.setTimeout(() => {
      store.clearToast();
    }, 3200);
    return () => window.clearTimeout(t);
  }, [store.toastMessage, store]);

  // 1Hz AFK Idle Tribute Timer
  useEffect(() => {
    const interval = window.setInterval(() => {
      store.tickIdleTimer(5);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [store]);

  const handleStartFromTitle = useCallback(
    (initialScreen: AppScreen = 'battle') => {
      document.body.dataset.state = 'playing';
      setShellState('playing');
      setLastRewardSummary(null);
      store.setActiveScreen(initialScreen);
      store.restartCurrentBattle();
    },
    [store]
  );

  const handleBattleFinished = useCallback(
    (finalSnapshot: BattleSnapshot) => {
      const didWin = finalSnapshot.status === 'victory';
      const summary = store.recordBattleOutcome(store.currentStageId, didWin);
      setLiveSnapshot(finalSnapshot);
      setLastRewardSummary(summary);
      document.body.dataset.state = 'gameover';
      setShellState('gameover');
    },
    [store]
  );

  const handleRetryBattle = useCallback(() => {
    setLastRewardSummary(null);
    document.body.dataset.state = 'playing';
    setShellState('playing');
    store.restartCurrentBattle();
  }, [store]);

  const handleNextStageBattle = useCallback(() => {
    const nextId = Math.min(CAMPAIGN_STAGES.length, store.currentStageId + 1);
    setLastRewardSummary(null);
    document.body.dataset.state = 'playing';
    setShellState('playing');
    store.selectCampaignStage(nextId, true);
  }, [store]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (shellState === 'title') {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          handleStartFromTitle('battle');
        }
        return;
      }

      if (shellState === 'gameover') {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          if (
            lastRewardSummary?.didWin &&
            lastRewardSummary.stageId < CAMPAIGN_STAGES.length
          ) {
            handleNextStageBattle();
          } else {
            handleRetryBattle();
          }
        }
        return;
      }

      if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        if (store.activeScreen !== 'battle') {
          store.setActiveScreen('battle');
        } else {
          setShellState((s) => (s === 'paused' ? 'playing' : 'paused'));
        }
      } else if (e.code === 'Space') {
        e.preventDefault();
        store.toggleBattleSpeed();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleRetryBattle();
      } else if (e.code === 'KeyC') {
        e.preventDefault();
        setManualUltimateRequest({
          heroId: '__ALL__',
          force: true,
          seq: Date.now(),
        });
      } else if (
        ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].includes(e.code)
      ) {
        const idx = Number(e.code.replace('Digit', '')) - 1;
        const heroId = store.formation[idx];
        if (heroId) {
          setManualUltimateRequest({
            heroId,
            force: true,
            seq: Date.now(),
          });
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    shellState,
    store,
    lastRewardSummary,
    handleStartFromTitle,
    handleNextStageBattle,
    handleRetryBattle,
  ]);

  // Compute enemy team remaining HP %
  const enemyHpPct = useMemo(() => {
    if (!liveSnapshot) return 100;
    const enemies = liveSnapshot.units.filter((u) => u.team === 'enemy');
    if (enemies.length === 0) return 0;
    const cur = enemies.reduce((sum, u) => sum + u.hp, 0);
    const max = enemies.reduce((sum, u) => sum + u.maxHp, 0);
    return max > 0 ? Math.round((cur / max) * 100) : 0;
  }, [liveSnapshot]);

  const remainingSec = useMemo(() => {
    if (!liveSnapshot) return 90;
    return Math.max(
      0,
      Math.ceil((liveSnapshot.maxDurationMs - liveSnapshot.elapsedMs) / 1000)
    );
  }, [liveSnapshot]);

  const formattedTimer = useMemo(() => {
    const mins = Math.floor(remainingSec / 60);
    const secs = remainingSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [remainingSec]);

  const isSimulationPaused =
    shellState !== 'playing' || store.activeScreen !== 'battle';

  const leaderHero = getHeroById(store.formation[0] || 'celestial_guardian');

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#120b06] text-amber-50 select-none flex items-center justify-center">
      {/* OUTER BLUESTACKS / MOBILE PORTRAIT CONTAINER (468px logical mobile artboard centered on desktop) */}
      <div
        className={`relative h-full flex flex-col justify-between overflow-hidden transition-all duration-300 ${
          bluestacksFrameMode
            ? 'w-full max-w-[468px] border-x-[3px] border-[#b8893e] shadow-[0_0_90px_rgba(0,0,0,0.98)] bg-[#1c1209]'
            : 'w-full'
        }`}
      >
        {/* FULL-VIEWPORT PHASER 2.5D BATTLE SCENE */}
        <div className="fixed inset-0 z-0">
          <PhaserBattleCanvas
            stageId={store.currentStageId}
            battleInstanceKey={store.battleInstanceKey}
            formation={store.formation}
            ownedHeroes={store.ownedHeroes}
            battleSpeed={store.battleSpeed}
            autoUltimate={store.autoUltimate}
            isPaused={isSimulationPaused}
            manualUltimateRequest={manualUltimateRequest}
            onSnapshotUpdate={setLiveSnapshot}
            onBattleFinished={handleBattleFinished}
          />
        </div>

        {/* STATE 1: TITLE SCREEN */}
        {shellState === 'title' && (
          <TitleScreen
            onStartGame={handleStartFromTitle}
            maxStage={store.maxUnlockedStageId}
            teamPower={teamPower}
          />
        )}

        {/* STATE 2: AUTHENTIC AFK ARENA: COMPANIONS IN-GAME SHELL */}
        {shellState !== 'title' && (
          <>
            {/* TOP COMPACT HUD BAR (Matching 01_hero_reveal_dracula.jpg & 18_roster_late.jpg) */}
            <header className="relative z-30 pointer-events-auto bg-gradient-to-b from-[#332010] via-[#24160b] to-[#180e07] border-b-2 border-[#a87e3b] px-2 py-1 shadow-[0_4px_16px_rgba(0,0,0,0.85)] flex flex-wrap items-center justify-between gap-1">
              {/* Left: Circular Bronze Player Avatar + Level + Golden Fist Power */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => store.setActiveScreen('lobby')}
                  className="relative shrink-0 cursor-pointer rounded-full p-0.5 bg-gradient-to-b from-[#f5d061] to-[#8c6223] shadow"
                  title="Hồ Sơ Lãnh Chúa Esperia"
                >
                  <div className="rounded-full overflow-hidden border border-[#2b1b0e]">
                    <HeroAvatarSvg hero={leaderHero} size="sm" />
                  </div>
                </button>

                <div className="leading-tight">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-extrabold text-[#fff3d1] truncate max-w-[85px]">
                      Tân Thủ
                    </span>
                    <span className="px-1 py-0.2 rounded bg-gradient-to-r from-[#f5d061] to-[#c69d53] text-[#241508] font-mono text-[8px] font-black flex items-center gap-0.5">
                      <Crown className="w-2 h-2 fill-current" /> VIP12
                    </span>
                  </div>

                  {/* Golden Fist Combat Rating + Stage Timer */}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex items-center gap-0.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-[#fde047] to-[#b45309] text-[#1e1209] flex items-center justify-center text-[8px] font-black">
                        ✊
                      </span>
                      <span
                        data-testid="hud-team-power"
                        className="text-[11px] font-mono font-black text-[#fde047] tabular-nums"
                      >
                        {teamPower.toLocaleString()}
                      </span>
                    </span>
                    <span
                      data-testid="hud-battle-timer"
                      className="px-1 rounded bg-[#0f0904] border border-[#7c582b] font-mono text-[9px] text-[#fde047] tabular-nums"
                    >
                      {currentStage.chapter} · {formattedTimer}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Compact Currency Pills (Gold, EXP, Diamonds, Scrolls) & Frame Controls */}
              <div className="flex flex-wrap items-center justify-end gap-1">
                {/* Gold Pill */}
                <div className="flex items-center gap-1 bg-[#160d06] border border-[#7c582b] rounded-full pl-1.5 pr-0.5 py-0.5 font-mono tabular-nums">
                  <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-[#fde047] to-[#b45309] flex items-center justify-center text-[8px] font-black text-[#241508]">
                    G
                  </span>
                  <span
                    data-testid="hud-gold"
                    className="text-[10px] font-extrabold text-[#fff1c2]"
                  >
                    {store.gold >= 10000
                      ? `${Math.floor(store.gold / 1000)}K`
                      : store.gold.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => store.claimIdleTribute()}
                    title="Thu hoạch nhanh Vàng AFK"
                    className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-[#e5b85c] to-[#966822] text-[#1e1209] flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5 stroke-[3]" />
                  </button>
                </div>

                {/* Hero EXP (always in DOM for testid) */}
                <div className="hidden sm:flex items-center gap-1 bg-[#160d06] border border-[#7c582b] rounded-full px-1.5 py-0.5 font-mono tabular-nums">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
                  <span
                    data-testid="hud-exp"
                    className="text-[10px] font-extrabold text-sky-200"
                  >
                    {store.heroExp >= 10000
                      ? `${Math.floor(store.heroExp / 1000)}K`
                      : store.heroExp.toLocaleString()}
                  </span>
                </div>

                {/* Diamonds Pill */}
                <div className="flex items-center gap-1 bg-[#160d06] border border-[#7c582b] rounded-full pl-1.5 pr-0.5 py-0.5 font-mono tabular-nums">
                  <span className="w-2.5 h-2.5 rotate-45 bg-gradient-to-br from-white via-sky-200 to-cyan-400 inline-block" />
                  <span
                    data-testid="hud-gems"
                    className="text-[10px] font-extrabold text-[#fff1c2]"
                  >
                    {store.essenceGems.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => store.claimFreeSanctumGift()}
                    title="Nhận Kim Cương & Cuộn Triệu Hồi"
                    className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-[#e5b85c] to-[#966822] text-[#1e1209] flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5 stroke-[3]" />
                  </button>
                </div>

                {/* Scrolls Pill */}
                <div className="flex items-center gap-0.5 bg-[#160d06] border border-[#7c582b] rounded-full px-1.5 py-0.5 font-mono tabular-nums">
                  <ScrollText className="w-3 h-3 text-amber-300" />
                  <span
                    data-testid="hud-scrolls"
                    className="text-[10px] font-extrabold text-amber-200"
                  >
                    {store.summonScrolls}
                  </span>
                </div>

                {/* Mobile Portrait / Widescreen Toggle */}
                <button
                  type="button"
                  data-testid="hud-bluestacks-mode-btn"
                  onClick={() => setBluestacksFrameMode((v) => !v)}
                  title="Chuyển đổi Khung Dọc Mobile 9:16 / Widescreen"
                  className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[9px] font-bold cursor-pointer ${
                    bluestacksFrameMode
                      ? 'bg-[#d4af37] text-[#1e1209] border-amber-200'
                      : 'bg-[#26170b] text-[#f3d38c] border-[#8c6430]'
                  }`}
                >
                  {bluestacksFrameMode ? (
                    <Smartphone className="w-3 h-3" />
                  ) : (
                    <Monitor className="w-3 h-3" />
                  )}
                  <span>{bluestacksFrameMode ? '9:16' : 'Wide'}</span>
                </button>

                {/* ADB Info */}
                <button
                  type="button"
                  data-testid="hud-adb-bridge-btn"
                  onClick={() => setShowAdbModal(true)}
                  className="px-1.5 py-0.5 rounded bg-[#26170b] border border-[#8c6430] text-[9px] font-mono font-bold text-amber-300 cursor-pointer"
                >
                  ADB
                </button>

                {/* Mute */}
                <button
                  type="button"
                  aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    setIsMuted(soundEngine.toggleMute());
                  }}
                  className="p-1 rounded bg-[#26170b] border border-[#8c6430] text-amber-200 cursor-pointer"
                >
                  {isMuted ? (
                    <VolumeX className="w-3 h-3 text-rose-400" />
                  ) : (
                    <Volume2 className="w-3 h-3 text-amber-300" />
                  )}
                </button>

                {/* Restart Stage */}
                <button
                  type="button"
                  data-testid="hud-restart-btn"
                  aria-label="Đánh lại màn"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    handleRetryBattle();
                  }}
                  className="p-1 rounded bg-[#26170b] border border-[#8c6430] text-amber-200 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>

                {/* Pause Battle */}
                <button
                  type="button"
                  data-testid="hud-pause-btn"
                  aria-label="Tạm dừng"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    setShellState((s) => (s === 'paused' ? 'playing' : 'paused'));
                  }}
                  className="p-1 rounded bg-[#26170b] border border-[#8c6430] text-amber-200 cursor-pointer"
                >
                  {shellState === 'paused' ? (
                    <Play className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Pause className="w-3 h-3" />
                  )}
                </button>
              </div>
            </header>

            {/* CENTER ACTIVE SCREEN AREA */}
            <div className="relative z-20 flex-1 min-h-0 flex flex-col items-center justify-start overflow-hidden pointer-events-none w-full">
              {store.toastMessage && (
                <div
                  role="status"
                  data-testid="toast-banner"
                  className="pointer-events-auto absolute top-1.5 inset-x-3 px-3 py-1 rounded-full bg-gradient-to-r from-[#3d2614] via-[#59381e] to-[#3d2614] border-2 border-[#fde047] text-[#fff4d4] text-[11px] font-extrabold text-center shadow-2xl z-50"
                >
                  {store.toastMessage}
                </div>
              )}

              {store.activeScreen !== 'battle' && (
                <div className="pointer-events-auto w-full h-full min-h-0 flex flex-col overflow-y-auto">
                  {store.activeScreen === 'lobby' && (
                    <LobbyPanel
                      onCloseToBattle={() => store.setActiveScreen('battle')}
                    />
                  )}
                  {store.activeScreen === 'formation' && (
                    <FormationPanel
                      onCloseToBattle={() => store.setActiveScreen('battle')}
                    />
                  )}
                  {(store.activeScreen === 'collection' ||
                    store.activeScreen === 'details' ||
                    store.activeScreen === 'upgrades') && (
                    <HeroCollectionAndDetailsPanel
                      onCloseToBattle={() => store.setActiveScreen('battle')}
                    />
                  )}
                  {store.activeScreen === 'campaign' && (
                    <CampaignMapPanel
                      onCloseToBattle={() => store.setActiveScreen('battle')}
                    />
                  )}
                  {store.activeScreen === 'summon' && (
                    <SummonSanctumPanel
                      onCloseToBattle={() => store.setActiveScreen('battle')}
                    />
                  )}
                  {store.activeScreen === 'videos' && (
                    <VideosAndBossesPanel
                      onCloseToBattle={() => store.setActiveScreen('battle')}
                    />
                  )}
                </div>
              )}
            </div>

            {/* BOTTOM AFK ARENA: COMPANIONS HUD & CARVED NAVIGATION DOCK (Exact match to 18_roster_late.jpg) */}
            <footer className="relative z-50 pointer-events-none flex flex-col items-center w-full shrink-0">
              {/* Row 1: IN-BATTLE 5 ARCHED HERO PORTRAIT CARDS + PAUSE / AUTO / x2 */}
              {store.activeScreen === 'battle' && (
                <div className="pointer-events-auto w-full px-2 pb-1.5 flex flex-col gap-1.5">
                  {/* Top Control Strip above Arched Cards */}
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        data-testid="btn-combo-ultimates"
                        onClick={() => {
                          setShellState('playing');
                          store.setActiveScreen('battle');
                          setManualUltimateRequest({
                            heroId: '__ALL__',
                            force: true,
                            seq: Date.now(),
                          });
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-b from-[#52351b] to-[#2b1a0c] border border-[#d4af37] text-[#fde047] font-extrabold text-[10px] cursor-pointer shadow"
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>Combo Ult</span>
                      </button>

                      <button
                        type="button"
                        data-testid="hud-claim-idle-btn"
                        onClick={() => store.claimIdleTribute()}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-b from-[#fde047] via-[#e2af34] to-[#9a6b19] text-[#1e1209] font-black text-[10px] cursor-pointer shadow"
                      >
                        <Gift className="w-3 h-3" />
                        <span>Rương AFK ({idleMinutes}p)</span>
                      </button>

                      <button
                        type="button"
                        data-testid="btn-auto-upgrade-all"
                        onClick={() => store.autoUpgradeSquad()}
                        className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-b from-[#67e8f9] via-[#22d3ee] to-[#0284c7] text-[#041019] font-black text-[10px] cursor-pointer shadow"
                      >
                        <Zap className="w-3 h-3 fill-current" />
                        <span>Nâng Nhanh</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        data-testid="toggle-auto-ult-btn"
                        onClick={() => store.toggleAutoUltimate()}
                        className={`px-2.5 py-1 rounded-full border font-mono text-[10px] font-black cursor-pointer shadow ${
                          store.autoUltimate
                            ? 'bg-gradient-to-b from-[#f5d061] to-[#7c5821] text-[#1e1209] border-[#fef08a]'
                            : 'bg-[#2a190c] text-[#d6be96] border-[#8c6430]'
                        }`}
                      >
                        AUTO: {store.autoUltimate ? 'ON' : 'OFF'}
                      </button>

                      <button
                        type="button"
                        data-testid="toggle-speed-btn"
                        onClick={() => store.toggleBattleSpeed()}
                        className={`px-2 py-1 rounded-full border font-mono text-[10px] font-black cursor-pointer shadow ${
                          store.battleSpeed === 2
                            ? 'bg-gradient-to-b from-[#f5d061] to-[#7c5821] text-[#1e1209] border-[#fef08a]'
                            : 'bg-[#2a190c] text-[#fde047] border-[#8c6430]'
                        }`}
                      >
                        x{store.battleSpeed}
                      </button>
                    </div>
                  </div>

                  {/* 5 ARCHED HERO BATTLE CARDS */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {store.formation.map((heroId, idx) => {
                      if (!heroId) {
                        return (
                          <button
                            key={`empty_${idx}`}
                            type="button"
                            onClick={() => {
                              setShellState('playing');
                              store.setActiveScreen('formation');
                            }}
                            className="h-[88px] rounded-t-[20px] rounded-b-lg bg-[#1d1209]/90 border-2 border-dashed border-[#a87e3b] text-[9px] font-bold text-[#e5c483] flex items-center justify-center cursor-pointer"
                          >
                            + Ô #{idx + 1}
                          </button>
                        );
                      }

                      const hero = getHeroById(heroId);
                      const owned = store.ownedHeroes[heroId];
                      const liveUnit = liveSnapshot?.units.find(
                        (u) => u.team === 'ally' && u.heroId === heroId
                      );
                      const hpPct =
                        liveUnit && liveUnit.maxHp > 0
                          ? Math.max(
                              0,
                              Math.min(
                                100,
                                Math.round((liveUnit.hp / liveUnit.maxHp) * 100)
                              )
                            )
                          : 100;
                      const energy = liveUnit
                        ? Math.min(100, Math.floor(liveUnit.energy))
                        : 0;
                      const isAlive = liveUnit ? liveUnit.isAlive : true;
                      const isReady = isAlive && energy >= 100;
                      const facMeta =
                        hero.repoFaction &&
                        REPO_FACTION_METADATA[hero.repoFaction];

                      return (
                        <button
                          key={`${hero.id}_${idx}`}
                          type="button"
                          data-testid={`ult-card-${hero.id}`}
                          onClick={() => {
                            setShellState('playing');
                            store.setActiveScreen('battle');
                            setManualUltimateRequest({
                              heroId: hero.id,
                              force: true,
                              seq: Date.now(),
                            });
                          }}
                          className={`group relative rounded-t-[20px] rounded-b-lg p-1 border-2 transition-all cursor-pointer flex flex-col items-center shadow-xl ${
                            !isAlive
                              ? 'bg-[#1a1310] border-stone-700 grayscale opacity-55'
                              : isReady
                                ? 'bg-gradient-to-b from-[#6b3fa0] via-[#43236b] to-[#24113d] border-[#fde047] shadow-[0_0_16px_rgba(253,224,71,0.85)] -translate-y-1'
                                : 'bg-gradient-to-b from-[#553182] via-[#341c54] to-[#1b0e2e] border-[#c89b4b] hover:border-[#fde047]'
                          }`}
                        >
                          <div className="relative w-full flex flex-col items-center">
                            <HeroAvatarSvg
                              hero={hero}
                              size="sm"
                              variant="framed"
                            />
                            {facMeta && (
                              <img
                                src={facMeta.icon}
                                alt={facMeta.label}
                                className="w-3.5 h-3.5 rounded-full bg-[#1a1109] border border-[#d4af37] absolute top-0 left-0 object-contain"
                              />
                            )}
                            <span className="absolute top-0 right-0 px-0.5 rounded bg-[#1a1109]/90 text-[8px] font-mono font-bold text-[#fde047]">
                              {owned?.level ?? 1}级
                            </span>
                          </div>

                          {/* HP Bar */}
                          <div className="w-full h-1.5 bg-[#140b06] border border-[#3d2514] rounded-sm overflow-hidden mt-1">
                            <div
                              className="h-full bg-gradient-to-r from-[#22c55e] to-[#86efac]"
                              style={{ width: `${hpPct}%` }}
                            />
                          </div>

                          {/* Energy Bar */}
                          <div className="w-full h-1.5 bg-[#140b06] border border-[#3d2514] rounded-sm overflow-hidden mt-0.5">
                            <div
                              className="h-full bg-gradient-to-r from-[#d97706] to-[#fde047]"
                              style={{ width: `${energy}%` }}
                            />
                          </div>

                          <div className="w-full text-center text-[9px] font-extrabold text-[#fff2d1] truncate mt-0.5">
                            {isReady ? '★ ULT!' : hero.name.split(' ')[0]}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Row 2: AUTHENTIC AFK ARENA: COMPANIONS BOTTOM DOCK (Matching 18_roster_late.jpg: 领地 | 野外 | 战役 | 英雄 | 编队 | 酒馆) */}
              <nav
                aria-label="Thanh điều hướng chính AFK Arena: Companions"
                className="pointer-events-auto w-full bg-gradient-to-b from-[#2c1c11] via-[#1f130b] to-[#120a05] border-t-2 border-[#b8893e] px-1.5 py-1 shadow-[0_-8px_24px_rgba(0,0,0,0.95)]"
              >
                <div className="max-w-[1060px] mx-auto grid grid-cols-7 gap-1">
                  {/* Tab 1: Lãnh Địa (领地) */}
                  <button
                    type="button"
                    data-testid="nav-btn-lobby"
                    onClick={() => {
                      setShellState('playing');
                      store.setActiveScreen(
                        store.activeScreen === 'lobby' ? 'battle' : 'lobby'
                      );
                    }}
                    className={`relative flex flex-col items-center justify-center py-1 rounded-lg border transition-all cursor-pointer ${
                      store.activeScreen === 'lobby'
                        ? 'bg-gradient-to-b from-[#d9a84e] via-[#a67629] to-[#6e4a16] border-[#fde047] text-[#fff8e7]'
                        : 'bg-[#24160c] border-[#6e4b26]/60 text-[#d8be94] hover:text-[#fff1c2]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500 border border-white absolute top-0.5 right-1" />
                    <Home className="w-3.5 h-3.5 text-[#f7d27a]" />
                    <span className="text-[9px] font-extrabold mt-0.5 leading-none">
                      Lãnh Địa
                    </span>
                  </button>

                  {/* Tab 2: Dã Ngoại (野外) */}
                  <button
                    type="button"
                    data-testid="nav-btn-videos"
                    onClick={() => {
                      setShellState('playing');
                      store.setActiveScreen(
                        store.activeScreen === 'videos' ? 'battle' : 'videos'
                      );
                    }}
                    className={`relative flex flex-col items-center justify-center py-1 rounded-lg border transition-all cursor-pointer ${
                      store.activeScreen === 'videos'
                        ? 'bg-gradient-to-b from-[#d9a84e] via-[#a67629] to-[#6e4a16] border-[#fde047] text-[#fff8e7]'
                        : 'bg-[#24160c] border-[#6e4b26]/60 text-[#d8be94] hover:text-[#fff1c2]'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5 text-[#f7d27a]" />
                    <span className="text-[9px] font-extrabold mt-0.5 leading-none">
                      Dã Ngoại
                    </span>
                  </button>

                  {/* Tab 3: Bản Đồ Ải (地图) */}
                  <button
                    type="button"
                    data-testid="nav-btn-campaign"
                    onClick={() => {
                      setShellState('playing');
                      store.setActiveScreen(
                        store.activeScreen === 'campaign'
                          ? 'battle'
                          : 'campaign'
                      );
                    }}
                    className={`relative flex flex-col items-center justify-center py-1 rounded-lg border transition-all cursor-pointer ${
                      store.activeScreen === 'campaign'
                        ? 'bg-gradient-to-b from-[#d9a84e] via-[#a67629] to-[#6e4a16] border-[#fde047] text-[#fff8e7]'
                        : 'bg-[#24160c] border-[#6e4b26]/60 text-[#d8be94] hover:text-[#fff1c2]'
                    }`}
                  >
                    <Map className="w-3.5 h-3.5 text-[#f7d27a]" />
                    <span className="text-[9px] font-extrabold mt-0.5 leading-none">
                      Bản Đồ
                    </span>
                  </button>

                  {/* Tab 4: Chiến Dịch (战役 - Center Highlighted Crest) */}
                  <button
                    type="button"
                    data-testid="nav-btn-battle"
                    onClick={() => {
                      setShellState('playing');
                      store.setActiveScreen('battle');
                    }}
                    className={`relative flex flex-col items-center justify-center py-1 rounded-lg border-2 transition-all cursor-pointer ${
                      store.activeScreen === 'battle'
                        ? 'bg-gradient-to-b from-[#f5d061] via-[#c8963e] to-[#80571a] border-[#fef08a] text-[#1e1208] shadow-[0_0_14px_rgba(245,158,11,0.55)]'
                        : 'bg-[#382210] border-[#b8893e] text-[#fde047]'
                    }`}
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase mt-0.5 leading-none">
                      Chiến Dịch
                    </span>
                  </button>

                  {/* Tab 5: Anh Hùng (英雄 - with green upgrade arrow & red dot matching 18_roster_late.jpg) */}
                  <button
                    type="button"
                    data-testid="nav-btn-collection"
                    onClick={() => {
                      setShellState('playing');
                      store.setActiveScreen(
                        store.activeScreen === 'collection' ||
                          store.activeScreen === 'details' ||
                          store.activeScreen === 'upgrades'
                          ? 'battle'
                          : 'collection'
                      );
                    }}
                    className={`relative flex flex-col items-center justify-center py-1 rounded-lg border transition-all cursor-pointer ${
                      store.activeScreen === 'collection' ||
                      store.activeScreen === 'details' ||
                      store.activeScreen === 'upgrades'
                        ? 'bg-gradient-to-b from-[#d9a84e] via-[#a67629] to-[#6e4a16] border-[#fde047] text-[#fff8e7]'
                        : 'bg-[#24160c] border-[#6e4b26]/60 text-[#d8be94] hover:text-[#fff1c2]'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-amber-200 text-[7px] text-white font-black flex items-center justify-center absolute top-0.5 right-1">
                      !
                    </span>
                    <Users className="w-3.5 h-3.5 text-[#4ade80]" />
                    <span className="text-[9px] font-extrabold mt-0.5 leading-none">
                      Anh Hùng
                    </span>
                  </button>

                  {/* Tab 6: Đội Hình (编队) */}
                  <button
                    type="button"
                    data-testid="nav-btn-formation"
                    onClick={() => {
                      setShellState('playing');
                      store.setActiveScreen(
                        store.activeScreen === 'formation'
                          ? 'battle'
                          : 'formation'
                      );
                    }}
                    className={`relative flex flex-col items-center justify-center py-1 rounded-lg border transition-all cursor-pointer ${
                      store.activeScreen === 'formation'
                        ? 'bg-gradient-to-b from-[#d9a84e] via-[#a67629] to-[#6e4a16] border-[#fde047] text-[#fff8e7]'
                        : 'bg-[#24160c] border-[#6e4b26]/60 text-[#d8be94] hover:text-[#fff1c2]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-[#f7d27a]" />
                    <span className="text-[9px] font-extrabold mt-0.5 leading-none">
                      Đội Hình
                    </span>
                  </button>

                  {/* Tab 7: Quán Rượu (酒馆) */}
                  <button
                    type="button"
                    data-testid="nav-btn-summon"
                    onClick={() => {
                      setShellState('playing');
                      store.setActiveScreen(
                        store.activeScreen === 'summon' ? 'battle' : 'summon'
                      );
                    }}
                    className={`relative flex flex-col items-center justify-center py-1 rounded-lg border transition-all cursor-pointer ${
                      store.activeScreen === 'summon'
                        ? 'bg-gradient-to-b from-[#d9a84e] via-[#a67629] to-[#6e4a16] border-[#fde047] text-[#fff8e7]'
                        : 'bg-[#24160c] border-[#6e4b26]/60 text-[#d8be94] hover:text-[#fff1c2]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500 border border-white absolute top-0.5 right-1" />
                    <Sparkles className="w-3.5 h-3.5 text-[#f7d27a]" />
                    <span className="text-[9px] font-extrabold mt-0.5 leading-none">
                      Quán Rượu
                    </span>
                  </button>
                </div>
              </nav>
            </footer>
          </>
        )}

        {/* STATE 3: PAUSE OVERLAY MODAL */}
        {shellState === 'paused' && (
          <div
            role="dialog"
            aria-label="Tạm dừng trận đấu"
            data-testid="pause-modal"
            className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 pointer-events-auto"
          >
            <div className="w-full max-w-md bg-[#f2e2c4] border-4 border-[#8c6430] rounded-2xl p-6 text-center shadow-2xl space-y-4 text-[#3b2512]">
              <h2
                className="text-2xl font-extrabold text-[#5c3818] uppercase"
                style={{ fontFamily: '"Cinzel", serif' }}
              >
                Tạm Dừng Giao Tranh
              </h2>
              <p className="text-xs text-[#6b4826]">
                {currentStage.chapter} — {currentStage.name}
              </p>

              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  type="button"
                  data-testid="resume-battle-btn"
                  onClick={() => setShellState('playing')}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-b from-[#67e8f9] to-[#0284c7] text-[#041019] font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow"
                >
                  Tiếp Tục Chiến Đấu
                </button>
                <button
                  type="button"
                  onClick={handleRetryBattle}
                  className="w-full py-2.5 rounded-xl bg-[#8c6239] hover:bg-[#734f2c] text-amber-100 font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Đánh Lại Từ Đầu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STATE 4: VICTORY / DEFEAT RESULTS MODAL */}
        {shellState === 'gameover' &&
          liveSnapshot &&
          lastRewardSummary && (
            <BattleResultsModal
              snapshot={liveSnapshot}
              rewardSummary={lastRewardSummary}
              onRetry={handleRetryBattle}
              onNextStage={handleNextStageBattle}
              onOpenScreen={(scr) => {
                setShellState('playing');
                store.setActiveScreen(scr);
              }}
            />
          )}

        {/* BLUESTACKS ADB BRIDGE MODAL */}
        {showAdbModal && (
          <div
            role="dialog"
            aria-label="Kết nối ADB BlueStacks"
            data-testid="adb-bridge-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 pointer-events-auto"
          >
            <div className="w-full max-w-xl bg-[#f3e3c3] border-4 border-[#8c6430] rounded-2xl p-5 shadow-2xl text-[#3b2512] space-y-3">
              <div className="flex items-center justify-between border-b border-[#8c6430]/40 pb-2.5">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#7c5121]" />
                  <h3
                    className="text-base font-extrabold text-[#4d2f14] uppercase"
                    style={{ fontFamily: '"Cinzel", serif' }}
                  >
                    Đồng Bộ Giao Diện BlueStacks &amp; 50 Ảnh Chụp AFK Arena
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdbModal(false)}
                  className="p-1 rounded-lg bg-[#8c6239] text-amber-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-[#4d2f14] space-y-2 leading-relaxed">
                <p>
                  Giao diện hiện tại đã được dựng lại trực tiếp theo đúng <strong>50 ảnh chụp màn hình AFK Arena</strong> (bảng màu giấy da cổ Parchment <code>#ebd6ad</code>, khung gỗ đồng Ranhorn, Sanctuary Tướng với vòng phép 4 Kỹ năng &amp; 6 ô Trang bị, màn hình VS 5v5, Quán Rượu Dolly và 5 thẻ tướng vòm cung trong trận).
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setBluestacksFrameMode(true);
                    setShowAdbModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-b from-[#67e8f9] to-[#0284c7] text-[#041019] font-extrabold text-xs cursor-pointer"
                >
                  Bật Khung Dọc Mobile (9:16)
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdbModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#8c6239] text-amber-100 font-bold text-xs cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
