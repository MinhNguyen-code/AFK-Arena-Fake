import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Smartphone,
  X,
} from 'lucide-react';
import {
  IconNavRanhorn,
  IconNavDarkForest,
  IconNavCampaign,
  IconNavBattle,
  IconNavHeroes,
  IconNavFormation,
  IconNavTavern,
} from './components/FantasyIcons';
import { useGameStore, AppScreen, BattleRewardSummary } from './store/gameStore';
import { getHeroById, computeTeamPower } from './game/heroes';
import { getCampaignStage, CAMPAIGN_STAGES } from './game/campaign';
import { BattleSnapshot } from './game/types';
import { ThreeBattleCanvas } from './components/ThreeBattleCanvas';
import { ArenaEnvironmentId, GraphicsPreset } from './game/threeBattleScene';
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
import {
  ClassicBagModal,
  ClassicGuildModal,
  ClassicQuestsModal,
  ClassicEventsModal,
  ClassicMailModal,
  ClassicSettingsModal,
  RedNotificationDot,
  MobileFrame,
  AppShell,
  TopHUD,
  BattleHUD,
  BattleField,
  HeroUltimateBar,
} from './components/ClassicUiKit';
import { soundEngine } from './game/audio';

export type ClassicSystemModalType =
  | null
  | 'bag'
  | 'guild'
  | 'quests'
  | 'events'
  | 'mail'
  | 'settings';

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
  const [activeSystemModal, setActiveSystemModal] =
    useState<ClassicSystemModalType>(null);
  const [liveSnapshot, setLiveSnapshot] = useState<BattleSnapshot | null>(null);
  const [lastRewardSummary, setLastRewardSummary] =
    useState<BattleRewardSummary | null>(null);
  const [manualUltimateRequest, setManualUltimateRequest] = useState<{
    heroId: string;
    force: boolean;
    seq: number;
  } | null>(null);
  const [graphicsPreset, setGraphicsPreset] = useState<GraphicsPreset>('AUTO');
  const [arenaOverride, setArenaOverride] = useState<'auto' | ArenaEnvironmentId>('auto');
  const [cameraShakeEnabled, setCameraShakeEnabled] = useState<boolean>(true);
  const [ultimateCameraEnabled, setUltimateCameraEnabled] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [showPerfOverlay, setShowPerfOverlay] = useState<boolean>(false);

  const store = useGameStore();
  const currentStage = getCampaignStage(store.currentStageId);
  const teamPower = computeTeamPower(store.formation, store.ownedHeroes);
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
        if (activeSystemModal) {
          setActiveSystemModal(null);
        } else if (store.activeScreen !== 'battle') {
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
    activeSystemModal,
    handleStartFromTitle,
    handleNextStageBattle,
    handleRetryBattle,
  ]);

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
    shellState !== 'playing' ||
    store.activeScreen !== 'battle' ||
    activeSystemModal !== null;

  const leaderHero = getHeroById(store.formation[0] || 'celestial_guardian');

  return (
    <MobileFrame portraitMode={bluestacksFrameMode}>
      <AppShell>
        {/* STATE 1: TITLE SCREEN */}
        {shellState === 'title' && (
          <TitleScreen
            onStartGame={handleStartFromTitle}
            maxStage={store.maxUnlockedStageId}
            teamPower={teamPower}
          />
        )}

        {/* STATE 2: CLASSIC AFK ARENA IN-GAME SHELL */}
        {shellState !== 'title' && (
          <>
            {/* 2-ROW TOP HUD (Player Info + Uniform Utility Icons + 4-Col ResourceBar) */}
            <TopHUD
              leaderHero={leaderHero}
              teamPower={teamPower}
              gold={store.gold}
              heroExp={store.heroExp}
              essenceGems={store.essenceGems}
              summonScrolls={store.summonScrolls}
              isMuted={isMuted}
              portraitMode={bluestacksFrameMode}
              onClaimGold={() => store.claimIdleTribute()}
              onClaimGems={() => store.claimFreeSanctumGift()}
              onToggleMute={() => setIsMuted(soundEngine.toggleMute())}
              onTogglePortraitMode={() => setBluestacksFrameMode((v) => !v)}
              onOpenAdbModal={() => setShowAdbModal(true)}
              onOpenSystemModal={(m) => setActiveSystemModal(m)}
            />

            {/* MIDDLE FLEXIBLE PORTRAIT VIEWPORT */}
            <div className="relative flex-1 min-h-0 w-full flex flex-col overflow-hidden">
              {store.toastMessage && (
                <div
                  role="status"
                  data-testid="toast-banner"
                  className="pointer-events-auto absolute top-2 inset-x-3 px-3 py-1 rounded-full bg-gradient-to-r from-[#3d2614] via-[#59381e] to-[#3d2614] border-2 border-[#fde047] text-[#fff4d4] text-[11px] font-extrabold text-center shadow-2xl z-50 truncate"
                >
                  {store.toastMessage}
                </div>
              )}

              {/* VERTICAL MOBILE PORTRAIT BATTLE LAYOUT (3 ZONES: BattleHUD -> BattleField -> HeroUltimateBar) */}
              <div
                className={`w-full h-full flex flex-col justify-between overflow-hidden ${
                  store.activeScreen === 'battle' ? 'flex' : 'hidden'
                }`}
              >
                {/* ZONE 1: BattleHUD (Stage Name, Timer, Auto, x2, Restart, Pause) */}
                <BattleHUD
                  chapter={currentStage.chapter}
                  stageName={currentStage.name}
                  formattedTimer={formattedTimer}
                  battleSpeed={store.battleSpeed}
                  autoUltimate={store.autoUltimate}
                  isPaused={shellState === 'paused'}
                  onToggleSpeed={() => store.toggleBattleSpeed()}
                  onToggleAuto={() => store.toggleAutoUltimate()}
                  onRestart={handleRetryBattle}
                  onTogglePause={() =>
                    setShellState((s) => (s === 'paused' ? 'playing' : 'paused'))
                  }
                  onOpenCampaign={() => store.setActiveScreen('campaign')}
                />

                {/* ZONE 2: BattleField (Portrait 3D Arena — Allies Left vs Enemies Right) */}
                <BattleField>
                  {store.activeScreen === 'battle' && (
                    <ThreeBattleCanvas
                      stageId={store.currentStageId}
                      battleInstanceKey={store.battleInstanceKey}
                      formation={store.formation}
                      ownedHeroes={store.ownedHeroes}
                      battleSpeed={store.battleSpeed}
                      autoUltimate={store.autoUltimate}
                      isPaused={isSimulationPaused}
                      manualUltimateRequest={manualUltimateRequest}
                      graphicsPreset={graphicsPreset}
                      arenaOverride={arenaOverride}
                      cameraShakeEnabled={cameraShakeEnabled}
                      ultimateCameraEnabled={ultimateCameraEnabled}
                      reducedMotion={reducedMotion}
                      showPerfOverlay={showPerfOverlay}
                      onSnapshotUpdate={setLiveSnapshot}
                      onBattleFinished={handleBattleFinished}
                    />
                  )}
                </BattleField>

                {/* ZONE 3: HeroUltimateBar (Combo Ult / AFK Chest / Level Up + 5 Arched Hero Cards) */}
                <HeroUltimateBar
                  formation={store.formation}
                  ownedHeroes={store.ownedHeroes}
                  liveSnapshot={liveSnapshot}
                  idleMinutes={idleMinutes}
                  onTriggerComboUlt={() => {
                    setShellState('playing');
                    store.setActiveScreen('battle');
                    setManualUltimateRequest({
                      heroId: '__ALL__',
                      force: true,
                      seq: Date.now(),
                    });
                  }}
                  onClaimIdle={() => store.claimIdleTribute()}
                  onAutoUpgrade={() => store.autoUpgradeSquad()}
                  onTriggerHeroUlt={(heroId) => {
                    setShellState('playing');
                    store.setActiveScreen('battle');
                    setManualUltimateRequest({
                      heroId,
                      force: true,
                      seq: Date.now(),
                    });
                  }}
                  onOpenFormation={() => {
                    setShellState('playing');
                    store.setActiveScreen('formation');
                  }}
                />
              </div>

              {/* NON-BATTLE ACTIVE SCREENS (Portrait-First Full Height Scrollable Panels) */}
              {store.activeScreen !== 'battle' && (
                <div className="pointer-events-auto w-full h-full min-h-0 flex flex-col overflow-y-auto bg-[#1c1209]">
                  {store.activeScreen === 'lobby' && (
                    <LobbyPanel
                      onCloseToBattle={() => store.setActiveScreen('battle')}
                      onOpenSystemModal={(m) => setActiveSystemModal(m)}
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

            {/* CLASSIC AFK ARENA BOTTOM NAVIGATION DOCK — CARVED BRONZE & GOLD RPG MENU BAR */}
            <footer
              data-testid="classic-bottom-nav"
              className="relative z-40 pointer-events-auto w-full shrink-0"
            >
              <nav
                aria-label="Thanh điều hướng chính AFK Arena Classic"
                className="w-full bg-gradient-to-b from-[#3e2513] via-[#27170b] to-[#140b05] border-t-2 border-[#d9a84e] shadow-[inset_0_1px_0_#fef08a,0_-8px_24px_rgba(0,0,0,0.95)]"
              >
                <div className="grid grid-cols-7 divide-x divide-[#52341a]/75 items-stretch h-[58px]">
                  {/* Tab 1: Ranhorn (Main City Hub) */}
                  {(() => {
                    const isActive = store.activeScreen === 'lobby';
                    return (
                      <button
                        type="button"
                        data-testid="nav-btn-lobby"
                        onClick={() => {
                          setShellState('playing');
                          store.setActiveScreen(isActive ? 'battle' : 'lobby');
                        }}
                        className={`group relative flex flex-col items-center justify-between px-0.5 pt-1 pb-1 transition-all cursor-pointer min-w-0 ${
                          isActive
                            ? '-mt-1.5 pt-1.5 z-10 rounded-t-md bg-gradient-to-b from-[#fce6b0] via-[#dfa84f] to-[#8c5518] border-t-2 border-x border-[#fff6d1] shadow-[0_-3px_14px_rgba(245,158,11,0.55),inset_0_1px_2px_#ffffff]'
                            : 'bg-gradient-to-b from-[#331e0f]/75 via-[#221309]/90 to-[#140a04] hover:from-[#432814]/85'
                        }`}
                      >
                        <RedNotificationDot className="absolute top-0.5 right-1 z-20" />
                        <div className="flex-1 flex items-center justify-center">
                          <IconNavRanhorn
                            active={isActive}
                            className={`w-7 h-7 transition-transform duration-150 ${
                              isActive
                                ? 'scale-110 -translate-y-0.5 drop-shadow-[0_2px_6px_rgba(254,240,138,0.65)]'
                                : 'opacity-90 group-hover:opacity-100 group-hover:scale-105'
                            }`}
                          />
                        </div>
                        <span
                          className={`text-[9px] font-extrabold leading-none truncate w-full text-center tracking-tight ${
                            isActive
                              ? 'text-[#fffdf5] [text-shadow:0_1px_2px_#241104,0_0_4px_#451a03]'
                              : 'text-[#d2b483] group-hover:text-[#fbe5be] [text-shadow:0_1px_2px_#000000]'
                          }`}
                        >
                          Ranhorn
                        </span>
                      </button>
                    );
                  })()}

                  {/* Tab 2: Dark Forest */}
                  {(() => {
                    const isActive = store.activeScreen === 'videos';
                    return (
                      <button
                        type="button"
                        data-testid="nav-btn-videos"
                        onClick={() => {
                          setShellState('playing');
                          store.setActiveScreen(isActive ? 'battle' : 'videos');
                        }}
                        className={`group relative flex flex-col items-center justify-between px-0.5 pt-1 pb-1 transition-all cursor-pointer min-w-0 ${
                          isActive
                            ? '-mt-1.5 pt-1.5 z-10 rounded-t-md bg-gradient-to-b from-[#fce6b0] via-[#dfa84f] to-[#8c5518] border-t-2 border-x border-[#fff6d1] shadow-[0_-3px_14px_rgba(245,158,11,0.55),inset_0_1px_2px_#ffffff]'
                            : 'bg-gradient-to-b from-[#331e0f]/75 via-[#221309]/90 to-[#140a04] hover:from-[#432814]/85'
                        }`}
                      >
                        <div className="flex-1 flex items-center justify-center">
                          <IconNavDarkForest
                            active={isActive}
                            className={`w-7 h-7 transition-transform duration-150 ${
                              isActive
                                ? 'scale-110 -translate-y-0.5 drop-shadow-[0_2px_6px_rgba(254,240,138,0.65)]'
                                : 'opacity-90 group-hover:opacity-100 group-hover:scale-105'
                            }`}
                          />
                        </div>
                        <span
                          className={`text-[9px] font-extrabold leading-none truncate w-full text-center tracking-tight ${
                            isActive
                              ? 'text-[#fffdf5] [text-shadow:0_1px_2px_#241104,0_0_4px_#451a03]'
                              : 'text-[#d2b483] group-hover:text-[#fbe5be] [text-shadow:0_1px_2px_#000000]'
                          }`}
                        >
                          Rừng Đen
                        </span>
                      </button>
                    );
                  })()}

                  {/* Tab 3: Campaign */}
                  {(() => {
                    const isActive = store.activeScreen === 'campaign';
                    return (
                      <button
                        type="button"
                        data-testid="nav-btn-campaign"
                        onClick={() => {
                          setShellState('playing');
                          store.setActiveScreen(
                            isActive ? 'battle' : 'campaign'
                          );
                        }}
                        className={`group relative flex flex-col items-center justify-between px-0.5 pt-1 pb-1 transition-all cursor-pointer min-w-0 ${
                          isActive
                            ? '-mt-1.5 pt-1.5 z-10 rounded-t-md bg-gradient-to-b from-[#fce6b0] via-[#dfa84f] to-[#8c5518] border-t-2 border-x border-[#fff6d1] shadow-[0_-3px_14px_rgba(245,158,11,0.55),inset_0_1px_2px_#ffffff]'
                            : 'bg-gradient-to-b from-[#331e0f]/75 via-[#221309]/90 to-[#140a04] hover:from-[#432814]/85'
                        }`}
                      >
                        <div className="flex-1 flex items-center justify-center">
                          <IconNavCampaign
                            active={isActive}
                            className={`w-7 h-7 transition-transform duration-150 ${
                              isActive
                                ? 'scale-110 -translate-y-0.5 drop-shadow-[0_2px_6px_rgba(254,240,138,0.65)]'
                                : 'opacity-90 group-hover:opacity-100 group-hover:scale-105'
                            }`}
                          />
                        </div>
                        <span
                          className={`text-[9px] font-extrabold leading-none truncate w-full text-center tracking-tight ${
                            isActive
                              ? 'text-[#fffdf5] [text-shadow:0_1px_2px_#241104,0_0_4px_#451a03]'
                              : 'text-[#d2b483] group-hover:text-[#fbe5be] [text-shadow:0_1px_2px_#000000]'
                          }`}
                        >
                          Campaign
                        </span>
                      </button>
                    );
                  })()}

                  {/* Tab 4: Battle (Center Highlighted Crest) */}
                  {(() => {
                    const isActive = store.activeScreen === 'battle';
                    return (
                      <button
                        type="button"
                        data-testid="nav-btn-battle"
                        onClick={() => {
                          setShellState('playing');
                          store.setActiveScreen('battle');
                        }}
                        className={`group relative flex flex-col items-center justify-between px-0.5 pt-1 pb-1 transition-all cursor-pointer min-w-0 ${
                          isActive
                            ? '-mt-1.5 pt-1.5 z-10 rounded-t-md bg-gradient-to-b from-[#fce6b0] via-[#dfa84f] to-[#8c5518] border-t-2 border-x border-[#fff6d1] shadow-[0_-3px_14px_rgba(245,158,11,0.65),inset_0_1px_2px_#ffffff]'
                            : 'bg-gradient-to-b from-[#3d2412]/85 via-[#28160a]/95 to-[#160b04] hover:from-[#4c2e17]'
                        }`}
                      >
                        <div className="flex-1 flex items-center justify-center">
                          <IconNavBattle
                            active={isActive}
                            className={`w-7 h-7 transition-transform duration-150 ${
                              isActive
                                ? 'scale-110 -translate-y-0.5 drop-shadow-[0_2px_6px_rgba(254,240,138,0.75)]'
                                : 'opacity-95 group-hover:opacity-100 group-hover:scale-105'
                            }`}
                          />
                        </div>
                        <span
                          className={`text-[9px] font-black leading-none truncate w-full text-center tracking-tight ${
                            isActive
                              ? 'text-[#fffdf5] [text-shadow:0_1px_2px_#241104,0_0_4px_#451a03]'
                              : 'text-[#e5c687] group-hover:text-[#fff3d1] [text-shadow:0_1px_2px_#000000]'
                          }`}
                        >
                          Chiến Đấu
                        </span>
                      </button>
                    );
                  })()}

                  {/* Tab 5: Heroes Roster */}
                  {(() => {
                    const isActive =
                      store.activeScreen === 'collection' ||
                      store.activeScreen === 'details' ||
                      store.activeScreen === 'upgrades';
                    return (
                      <button
                        type="button"
                        data-testid="nav-btn-collection"
                        onClick={() => {
                          setShellState('playing');
                          store.setActiveScreen(
                            isActive ? 'battle' : 'collection'
                          );
                        }}
                        className={`group relative flex flex-col items-center justify-between px-0.5 pt-1 pb-1 transition-all cursor-pointer min-w-0 ${
                          isActive
                            ? '-mt-1.5 pt-1.5 z-10 rounded-t-md bg-gradient-to-b from-[#fce6b0] via-[#dfa84f] to-[#8c5518] border-t-2 border-x border-[#fff6d1] shadow-[0_-3px_14px_rgba(245,158,11,0.55),inset_0_1px_2px_#ffffff]'
                            : 'bg-gradient-to-b from-[#331e0f]/75 via-[#221309]/90 to-[#140a04] hover:from-[#432814]/85'
                        }`}
                      >
                        <RedNotificationDot className="absolute top-0.5 right-1 z-20" />
                        <div className="flex-1 flex items-center justify-center">
                          <IconNavHeroes
                            active={isActive}
                            className={`w-7 h-7 transition-transform duration-150 ${
                              isActive
                                ? 'scale-110 -translate-y-0.5 drop-shadow-[0_2px_6px_rgba(254,240,138,0.65)]'
                                : 'opacity-90 group-hover:opacity-100 group-hover:scale-105'
                            }`}
                          />
                        </div>
                        <span
                          className={`text-[9px] font-extrabold leading-none truncate w-full text-center tracking-tight ${
                            isActive
                              ? 'text-[#fffdf5] [text-shadow:0_1px_2px_#241104,0_0_4px_#451a03]'
                              : 'text-[#d2b483] group-hover:text-[#fbe5be] [text-shadow:0_1px_2px_#000000]'
                          }`}
                        >
                          Heroes
                        </span>
                      </button>
                    );
                  })()}

                  {/* Tab 6: Formations */}
                  {(() => {
                    const isActive = store.activeScreen === 'formation';
                    return (
                      <button
                        type="button"
                        data-testid="nav-btn-formation"
                        onClick={() => {
                          setShellState('playing');
                          store.setActiveScreen(
                            isActive ? 'battle' : 'formation'
                          );
                        }}
                        className={`group relative flex flex-col items-center justify-between px-0.5 pt-1 pb-1 transition-all cursor-pointer min-w-0 ${
                          isActive
                            ? '-mt-1.5 pt-1.5 z-10 rounded-t-md bg-gradient-to-b from-[#fce6b0] via-[#dfa84f] to-[#8c5518] border-t-2 border-x border-[#fff6d1] shadow-[0_-3px_14px_rgba(245,158,11,0.55),inset_0_1px_2px_#ffffff]'
                            : 'bg-gradient-to-b from-[#331e0f]/75 via-[#221309]/90 to-[#140a04] hover:from-[#432814]/85'
                        }`}
                      >
                        <div className="flex-1 flex items-center justify-center">
                          <IconNavFormation
                            active={isActive}
                            className={`w-7 h-7 transition-transform duration-150 ${
                              isActive
                                ? 'scale-110 -translate-y-0.5 drop-shadow-[0_2px_6px_rgba(254,240,138,0.65)]'
                                : 'opacity-90 group-hover:opacity-100 group-hover:scale-105'
                            }`}
                          />
                        </div>
                        <span
                          className={`text-[9px] font-extrabold leading-none truncate w-full text-center tracking-tight ${
                            isActive
                              ? 'text-[#fffdf5] [text-shadow:0_1px_2px_#241104,0_0_4px_#451a03]'
                              : 'text-[#d2b483] group-hover:text-[#fbe5be] [text-shadow:0_1px_2px_#000000]'
                          }`}
                        >
                          Đội Hình
                        </span>
                      </button>
                    );
                  })()}

                  {/* Tab 7: The Noble Tavern */}
                  {(() => {
                    const isActive = store.activeScreen === 'summon';
                    return (
                      <button
                        type="button"
                        data-testid="nav-btn-summon"
                        onClick={() => {
                          setShellState('playing');
                          store.setActiveScreen(isActive ? 'battle' : 'summon');
                        }}
                        className={`group relative flex flex-col items-center justify-between px-0.5 pt-1 pb-1 transition-all cursor-pointer min-w-0 ${
                          isActive
                            ? '-mt-1.5 pt-1.5 z-10 rounded-t-md bg-gradient-to-b from-[#fce6b0] via-[#dfa84f] to-[#8c5518] border-t-2 border-x border-[#fff6d1] shadow-[0_-3px_14px_rgba(245,158,11,0.55),inset_0_1px_2px_#ffffff]'
                            : 'bg-gradient-to-b from-[#331e0f]/75 via-[#221309]/90 to-[#140a04] hover:from-[#432814]/85'
                        }`}
                      >
                        <RedNotificationDot className="absolute top-0.5 right-1 z-20" />
                        <div className="flex-1 flex items-center justify-center">
                          <IconNavTavern
                            active={isActive}
                            className={`w-7 h-7 transition-transform duration-150 ${
                              isActive
                                ? 'scale-110 -translate-y-0.5 drop-shadow-[0_2px_6px_rgba(254,240,138,0.65)]'
                                : 'opacity-90 group-hover:opacity-100 group-hover:scale-105'
                            }`}
                          />
                        </div>
                        <span
                          className={`text-[9px] font-extrabold leading-none truncate w-full text-center tracking-tight ${
                            isActive
                              ? 'text-[#fffdf5] [text-shadow:0_1px_2px_#241104,0_0_4px_#451a03]'
                              : 'text-[#d2b483] group-hover:text-[#fbe5be] [text-shadow:0_1px_2px_#000000]'
                          }`}
                        >
                          Tavern
                        </span>
                      </button>
                    );
                  })()}
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 pointer-events-auto"
          >
            <div className="w-full max-w-sm bg-[#f2e2c4] border-4 border-[#8c6430] rounded-2xl p-5 text-center shadow-2xl space-y-3 text-[#3b2512]">
              <h2
                className="text-xl font-extrabold text-[#5c3818] uppercase"
                style={{ fontFamily: '"Cinzel", serif' }}
              >
                Paused · Tạm Dừng
              </h2>
              <p className="text-xs text-[#6b4826] truncate">
                {currentStage.chapter} — {currentStage.name}
              </p>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  data-testid="resume-battle-btn"
                  onClick={() => setShellState('playing')}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-b from-[#67e8f9] to-[#0284c7] text-[#041019] font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow"
                >
                  Continue · Tiếp Tục Chiến Đấu
                </button>
                <button
                  type="button"
                  onClick={handleRetryBattle}
                  className="w-full py-2.5 rounded-xl bg-[#8c6239] hover:bg-[#734f2c] text-amber-100 font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Try Again · Đánh Lại Từ Đầu
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

        {/* CLASSIC AFK ARENA SYSTEM MODALS */}
        {activeSystemModal === 'bag' && (
          <ClassicBagModal onClose={() => setActiveSystemModal(null)} />
        )}
        {activeSystemModal === 'guild' && (
          <ClassicGuildModal onClose={() => setActiveSystemModal(null)} />
        )}
        {activeSystemModal === 'quests' && (
          <ClassicQuestsModal onClose={() => setActiveSystemModal(null)} />
        )}
        {activeSystemModal === 'events' && (
          <ClassicEventsModal onClose={() => setActiveSystemModal(null)} />
        )}
        {activeSystemModal === 'mail' && (
          <ClassicMailModal onClose={() => setActiveSystemModal(null)} />
        )}
        {activeSystemModal === 'settings' && (
          <ClassicSettingsModal
            onClose={() => setActiveSystemModal(null)}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(soundEngine.toggleMute())}
            graphicsPreset={graphicsPreset}
            onChangeGraphicsPreset={setGraphicsPreset}
            arenaOverride={arenaOverride}
            onChangeArenaOverride={setArenaOverride}
            cameraShakeEnabled={cameraShakeEnabled}
            onToggleCameraShake={() => setCameraShakeEnabled((v) => !v)}
            ultimateCameraEnabled={ultimateCameraEnabled}
            onToggleUltimateCamera={() => setUltimateCameraEnabled((v) => !v)}
            reducedMotion={reducedMotion}
            onToggleReducedMotion={() => setReducedMotion((v) => !v)}
            showPerfOverlay={showPerfOverlay}
            onTogglePerfOverlay={() => setShowPerfOverlay((v) => !v)}
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
            <div className="w-full max-w-md bg-[#f3e3c3] border-4 border-[#8c6430] rounded-2xl p-4 shadow-2xl text-[#3b2512] space-y-3">
              <div className="flex items-center justify-between border-b border-[#8c6430]/40 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Smartphone className="w-4 h-4 text-[#7c5121] shrink-0" />
                  <h3
                    className="text-sm font-extrabold text-[#4d2f14] uppercase truncate"
                    style={{ fontFamily: '"Cinzel", serif' }}
                  >
                    Kiến Trúc Mobile Portrait AFK Arena Classic
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdbModal(false)}
                  className="p-1 rounded-lg bg-[#8c6239] text-amber-100 cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-[#4d2f14] space-y-2 leading-relaxed">
                <p>
                  Giao diện được cố định theo chuẩn <strong>Mobile Portrait 9:16 (460px)</strong> của <strong>AFK Arena Classic</strong>: TopHUD 2 hàng tách biệt, sân đấu dọc 3 phân vùng (<code>BattleHUD</code> ➔ <code>BattleField</code> ➔ <code>HeroUltimateBar</code>), và hệ thống thẻ chống tràn chữ.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setBluestacksFrameMode(true);
                    setShowAdbModal(false);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-b from-[#67e8f9] to-[#0284c7] text-[#041019] font-extrabold text-xs cursor-pointer"
                >
                  Khung Dọc 9:16
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdbModal(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#8c6239] text-amber-100 font-bold text-xs cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </AppShell>
    </MobileFrame>
  );
}
