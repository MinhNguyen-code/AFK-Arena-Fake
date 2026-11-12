import React, { useState } from 'react';
import {
  Users,
  Sparkles,
  Trophy,
  Package,
  Zap,
  Shield,
  Sword,
  Wand2,
  Crosshair,
  Heart,
  ChevronUp,
  ChevronDown,
  Star,
  Check,
  ArrowUpCircle,
  Swords,
  Lock,
  UserPlus,
  Gift,
  RotateCcw,
  Layers,
  Camera,
} from 'lucide-react';
import {
  PlayerState,
  HERO_CATALOG,
  HeroTemplate,
  OwnedHero,
  FactionId,
  HeroRole,
  FACTION_INFO,
  ROLE_INFO,
  getHeroTemplate,
  calculateHeroStats,
  calculateLevelUpCost,
  calculateFactionSynergyBonus,
  getArenaRankTier,
  calculateAfkRewards,
  ArenaOpponent,
  SummonResultItem,
} from '../game/rules';
import { LiveUnitHudState } from './BattlefieldCanvas';
import { HeroPortraitSvg } from './HeroPortraitSvg';

export type ActiveDrawerTab = 'none' | 'heroes' | 'gacha' | 'arena' | 'stages';

interface BottomDockProps {
  playerState: PlayerState;
  liveUnits: LiveUnitHudState[];
  activeTab: ActiveDrawerTab;
  onSelectTab: (tab: ActiveDrawerTab) => void;
  isHudCollapsed: boolean;
  onToggleCollapse: () => void;
  cameraPreset: 'tactical' | 'cinematic' | 'overhead';
  onCycleCamera: () => void;
  onToggleSpeed: () => void;
  onToggleAutoUltimate: () => void;
  onToggleAutoUpgrade: () => void;
  onRunAutoUpgradeNow: () => void;
  onCastHeroUltimate: (slotIndex: number) => void;
  onUpgradeSingleHero: (templateId: string) => void;
  onAscendSingleHero: (templateId: string) => void;
  onUpgradeHeroGear: (templateId: string) => void;
  onToggleDeployHero: (templateId: string) => void;
  onAssignHeroToSlot: (templateId: string, slotIndex: number) => void;
  onRecruitHeroDirect: (templateId: string) => void;
  onSummonGacha: (count: 1 | 10) => void;
  onClaimFreeSupply: () => void;
  lastSummonResults: SummonResultItem[];
  onClearSummonResults: () => void;
  gachaError: string | null;
  arenaOpponents: ArenaOpponent[];
  onChallengeArenaOpponent: (opponent: ArenaOpponent) => void;
  onSelectCampaignStage: (stageIdx: number) => void;
  onFastForwardAfkRewards: () => void;
  statusBanner: string | null;
}

const ROLE_ICONS: Record<HeroRole, React.ReactNode> = {
  tank: <Shield className="w-3.5 h-3.5" />,
  warrior: <Sword className="w-3.5 h-3.5" />,
  mage: <Wand2 className="w-3.5 h-3.5" />,
  ranger: <Crosshair className="w-3.5 h-3.5" />,
  support: <Heart className="w-3.5 h-3.5" />,
};

export const BottomDock: React.FC<BottomDockProps> = ({
  playerState,
  liveUnits,
  activeTab,
  onSelectTab,
  isHudCollapsed,
  onToggleCollapse,
  cameraPreset,
  onCycleCamera,
  onToggleSpeed,
  onToggleAutoUltimate,
  onToggleAutoUpgrade,
  onRunAutoUpgradeNow,
  onCastHeroUltimate,
  onUpgradeSingleHero,
  onAscendSingleHero,
  onUpgradeHeroGear,
  onToggleDeployHero,
  onAssignHeroToSlot,
  onRecruitHeroDirect,
  onSummonGacha,
  onClaimFreeSupply,
  lastSummonResults,
  onClearSummonResults,
  gachaError,
  arenaOpponents,
  onChallengeArenaOpponent,
  onSelectCampaignStage,
  onFastForwardAfkRewards,
  statusBanner,
}) => {
  const [selectedHeroId, setSelectedHeroId] = useState<string>('lucius_paladin');
  const [factionFilter, setFactionFilter] = useState<FactionId | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<HeroRole | 'all'>('all');

  const deployedList = Object.values(playerState.heroes)
    .filter((h) => h.isDeployed)
    .sort((a, b) => a.slotIndex - b.slotIndex);

  const synergy = calculateFactionSynergyBonus(deployedList);
  const rankTier = getArenaRankTier(playerState.arenaPoints);

  const selectedTemplate: HeroTemplate = getHeroTemplate(selectedHeroId);
  const selectedOwned: OwnedHero | undefined = playerState.heroes[selectedHeroId];

  // Virtual preview for unowned heroes so players can inspect all 16 heroes
  const previewOwned: OwnedHero = selectedOwned || {
    templateId: selectedTemplate.id,
    level: 1,
    stars: selectedTemplate.baseRarity === 'ascended' ? 2 : 1,
    shards: 0,
    gearTier: 1,
    isDeployed: false,
    slotIndex: -1,
  };

  const inspectedStats = calculateHeroStats(selectedTemplate, previewOwned);
  const inspectedCost = calculateLevelUpCost(previewOwned.level);

  const filteredCatalog = HERO_CATALOG.filter((tmpl) => {
    if (factionFilter !== 'all' && tmpl.faction !== factionFilter) return false;
    if (roleFilter !== 'all' && tmpl.role !== roleFilter) return false;
    return true;
  });

  // Sort deployed first (by slotIndex), then owned by combatPower, then unowned
  const sortedCatalog = [...filteredCatalog].sort((a, b) => {
    const ownedA = playerState.heroes[a.id];
    const ownedB = playerState.heroes[b.id];
    if (ownedA?.isDeployed && !ownedB?.isDeployed) return -1;
    if (!ownedA?.isDeployed && ownedB?.isDeployed) return 1;
    if (ownedA?.isDeployed && ownedB?.isDeployed) {
      return ownedA.slotIndex - ownedB.slotIndex;
    }
    if (ownedA && !ownedB) return -1;
    if (!ownedA && ownedB) return 1;
    if (ownedA && ownedB) {
      return (
        calculateHeroStats(b, ownedB).combatPower -
        calculateHeroStats(a, ownedA).combatPower
      );
    }
    return 0;
  });

  const toggleTab = (tab: ActiveDrawerTab) => {
    onSelectTab(activeTab === tab ? 'none' : tab);
  };

  const afkPreview = calculateAfkRewards(
    playerState.stageIndex,
    Math.max(60, playerState.afkAccumulatedSeconds)
  );
  const afkMinutes = Math.max(1, Math.floor(playerState.afkAccumulatedSeconds / 60));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none flex flex-col items-center justify-end p-3">
      {/* Transient Action Toast Banner */}
      {statusBanner && (
        <div
          role="status"
          data-testid="toast-banner"
          className="mb-2 px-4 py-1.5 bg-[#151f36] border border-[#eab308] text-[#fef08a] text-xs font-semibold rounded shadow-[0_4px_14px_rgba(0,0,0,0.85)] pointer-events-auto"
        >
          {statusBanner}
        </div>
      )}

      {/* Expandable Management Drawer */}
      {!isHudCollapsed && activeTab !== 'none' && (
        <div
          role="region"
          aria-label="Bảng Quản Lý"
          data-testid={`drawer-${activeTab}`}
          className="pointer-events-auto w-full max-w-6xl mb-2.5 bg-[#0B0E17]/96 border-2 border-[#c69d53] rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.92)] overflow-hidden"
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#121726] border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              {activeTab === 'heroes' && <Users className="w-4 h-4 text-[#F59E0B]" />}
              {activeTab === 'gacha' && <Sparkles className="w-4 h-4 text-[#A855F7]" />}
              {activeTab === 'arena' && <Trophy className="w-4 h-4 text-[#F59E0B]" />}
              {activeTab === 'stages' && <Package className="w-4 h-4 text-[#10B981]" />}
              <h2 className="font-display text-sm md:text-base font-bold uppercase tracking-wider text-[#fef08a]">
                {activeTab === 'heroes' &&
                  `Quản Lý Tướng & Đội Hình (${Object.keys(playerState.heroes).length}/${HERO_CATALOG.length} Tướng)`}
                {activeTab === 'gacha' && 'Đài Triệu Hồi Gacha — Thánh Điện Tinh Tú'}
                {activeTab === 'arena' && 'Đấu Trường Xếp Hạng Vinh Quang'}
                {activeTab === 'stages' && 'Bản Đồ Chiến Dịch & Kho Báu AFK'}
              </h2>
              <span className="hidden md:inline text-xs text-slate-400">
                · {synergy.label}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {activeTab === 'heroes' && (
                <>
                  <button
                    type="button"
                    onClick={onToggleAutoUpgrade}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded border cursor-pointer ${
                      playerState.autoUpgradeEnabled
                        ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    Tự Động Nâng: {playerState.autoUpgradeEnabled ? 'BẬT' : 'TẮT'}
                  </button>
                  <button
                    type="button"
                    data-testid="drawer-quick-auto-upgrade"
                    onClick={onRunAutoUpgradeNow}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#d4af37] hover:bg-[#e5c14d] text-[#090c15] text-[11px] font-bold cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Nâng Cấp Tự Động Ngay
                  </button>
                </>
              )}
              {activeTab === 'gacha' && (
                <button
                  type="button"
                  data-testid="btn-claim-free-supply"
                  onClick={onClaimFreeSupply}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-[11px] font-bold text-emerald-300 cursor-pointer"
                >
                  <Gift className="w-3.5 h-3.5" />
                  Nhận Tiếp Tế (+10 Cuộn & +3.000 KC)
                </button>
              )}
              <button
                type="button"
                data-testid="close-drawer-btn"
                onClick={() => onSelectTab('none')}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 cursor-pointer"
              >
                <span>Thu Gọn</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* TAB 1: HERO MANAGEMENT & TACTICAL 5-SLOT FORMATION */}
          {activeTab === 'heroes' && (
            <div className="flex flex-col">
              {/* Top 5-Slot Tactical Formation Selector */}
              <div className="px-4 py-2.5 bg-[#0E1322] border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-200">
                      Đội Hình Xuất Trận 5 Tướng ({deployedList.length}/5)
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Bấm vào Ô 1–5 để xếp hoặc đổi vị trí cho tướng đang chọn:{' '}
                      <span className="text-amber-300 font-semibold">
                        {selectedTemplate.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5 Interactive Formation Slots (Ô 1-2 Tiền Tuyến, Ô 3-5 Hậu Phương) */}
                <div className="flex items-center gap-2 overflow-x-auto max-w-full py-0.5">
                  {[0, 1, 2, 3, 4].map((slotIdx) => {
                    const heroInSlot = Object.values(playerState.heroes).find(
                      (h) => h.isDeployed && h.slotIndex === slotIdx
                    );
                    const tmplInSlot = heroInSlot
                      ? getHeroTemplate(heroInSlot.templateId)
                      : null;
                    const isFrontline = slotIdx < 2;
                    const isSelectedHeroHere =
                      heroInSlot?.templateId === selectedTemplate.id;

                    return (
                      <button
                        key={slotIdx}
                        type="button"
                        data-testid={`formation-slot-${slotIdx}`}
                        onClick={() => {
                          if (selectedOwned) {
                            onAssignHeroToSlot(selectedTemplate.id, slotIdx);
                          } else if (tmplInSlot) {
                            setSelectedHeroId(tmplInSlot.id);
                          }
                        }}
                        className={`group relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer shrink-0 ${
                          isSelectedHeroHere
                            ? 'bg-amber-950/60 border-[#F59E0B] ring-1 ring-[#F59E0B]/50'
                            : tmplInSlot
                              ? 'bg-[#141A29] hover:bg-[#1A2236] border-slate-700 hover:border-amber-400/60'
                              : 'bg-[#0B0E17] hover:bg-slate-900 border-dashed border-slate-700'
                        }`}
                      >
                        <div className="relative">
                          {tmplInSlot ? (
                            <HeroPortraitSvg template={tmplInSlot} size="sm" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-slate-600">
                              +{slotIdx + 1}
                            </div>
                          )}
                          <span
                            className={`absolute -top-1.5 -left-1.5 px-1 py-0.2 rounded text-[9px] font-mono font-bold ${
                              isFrontline
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-sky-500 text-slate-950'
                            }`}
                          >
                            Ô {slotIdx + 1}
                          </span>
                        </div>
                        <div className="min-w-[82px] max-w-[108px]">
                          <div className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">
                            {isFrontline ? 'Tiền Tuyến' : 'Hậu Phương'}
                          </div>
                          <div className="text-[11px] font-bold text-slate-100 truncate">
                            {tmplInSlot ? tmplInSlot.name : 'Ô Trống'}
                          </div>
                          {heroInSlot && (
                            <div className="text-[9px] font-mono text-amber-400">
                              Lv.{heroInSlot.level} · {'★'.repeat(Math.min(5, heroInSlot.stars))}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Roster Grid + Hero Inspector */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 p-3.5 items-start">
                {/* Left 7 Cols: Filters & Independently Scrollable 16-Hero Roster */}
                <div className="lg:col-span-7 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex flex-wrap items-center gap-1">
                      {(
                        [
                          'all',
                          'lightbearer',
                          'mauler',
                          'wilder',
                          'graveborn',
                          'celestial',
                          'hypogean',
                        ] as const
                      ).map((f) => (
                        <button
                          key={f}
                          type="button"
                          data-testid={`filter-faction-${f}`}
                          onClick={() => setFactionFilter(f)}
                          className={`px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider cursor-pointer transition-colors ${
                            factionFilter === f
                              ? 'bg-[#d4af37] text-[#090c15] font-bold'
                              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          {f === 'all' ? 'Tất Cả Hệ' : FACTION_INFO[f].name}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      {(['all', 'tank', 'warrior', 'mage', 'ranger', 'support'] as const).map(
                        (r) => (
                          <button
                            key={r}
                            type="button"
                            data-testid={`filter-role-${r}`}
                            onClick={() => setRoleFilter(r)}
                            className={`px-2 py-1 rounded text-[10px] font-semibold cursor-pointer transition-colors ${
                              roleFilter === r
                                ? 'bg-indigo-500 text-white font-bold'
                                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            {r === 'all' ? 'Mọi Vai Trò' : ROLE_INFO[r].label}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* 16-Hero Roster Cards (Independently Scrollable) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[305px] overflow-y-auto pr-1">
                    {sortedCatalog.map((tmpl) => {
                      const owned = playerState.heroes[tmpl.id];
                      const isSelected = selectedHeroId === tmpl.id;
                      const stats = owned ? calculateHeroStats(tmpl, owned) : null;
                      const factionInfo = FACTION_INFO[tmpl.faction];

                      return (
                        <button
                          key={tmpl.id}
                          type="button"
                          data-testid={`roster-hero-${tmpl.id}`}
                          onClick={() => setSelectedHeroId(tmpl.id)}
                          className={`relative flex flex-col justify-between p-2 rounded-lg border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#1E263D] border-[#F59E0B] shadow-lg ring-1 ring-[#F59E0B]/40'
                              : owned
                                ? 'bg-[#121726] border-slate-800 hover:border-slate-600'
                                : 'bg-[#0B0E17]/85 border-slate-900 hover:border-slate-700 opacity-80'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <HeroPortraitSvg template={tmpl} size="sm" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span
                                  className="text-[9px] font-bold uppercase px-1 py-0.2 rounded truncate"
                                  style={{
                                    backgroundColor: `${factionInfo.color}22`,
                                    color: factionInfo.color,
                                  }}
                                >
                                  {factionInfo.name}
                                </span>
                                {owned?.isDeployed && (
                                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] px-1 py-0.2 rounded font-mono font-bold">
                                    Ô {owned.slotIndex + 1}
                                  </span>
                                )}
                              </div>
                              <div className="font-bold text-[11px] text-slate-100 truncate mt-0.5">
                                {tmpl.name}
                              </div>
                              <div className="text-[9px] text-slate-400 truncate">
                                {tmpl.title}
                              </div>
                            </div>
                          </div>

                          <div className="mt-1.5 pt-1 border-t border-slate-800/80 flex items-center justify-between w-full">
                            {owned && stats ? (
                              <>
                                <div>
                                  <span className="font-mono text-[10px] font-bold text-amber-300">
                                    Lv.{owned.level}
                                  </span>
                                  <span className="text-[10px] text-amber-400 ml-1">
                                    {'★'.repeat(Math.min(5, owned.stars))}
                                  </span>
                                </div>
                                <span className="font-mono text-[10px] text-sky-300">
                                  {stats.combatPower.toLocaleString()} LC
                                </span>
                              </>
                            ) : (
                              <div className="w-full flex items-center justify-between text-[10px] text-slate-400">
                                <span className="flex items-center gap-1 text-amber-400/90 font-semibold">
                                  <Lock className="w-2.5 h-2.5" /> Chưa Mở
                                </span>
                                <span className="text-[9px] underline text-slate-300">
                                  Chiêu Mộ
                                </span>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right 5 Cols: Selected Hero Inspector & Upgrade/Recruit Controls (Always Fully Visible) */}
                <div className="lg:col-span-5 bg-[#121726] border border-[#c69d53]/40 rounded-xl p-3 flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-start justify-between gap-2.5 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2.5">
                        <HeroPortraitSvg template={selectedTemplate} size="md" />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-display text-sm font-bold text-white">
                              {selectedTemplate.name}
                            </h3>
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                              style={{
                                backgroundColor: `${FACTION_INFO[selectedTemplate.faction].color}25`,
                                color: FACTION_INFO[selectedTemplate.faction].color,
                              }}
                            >
                              {FACTION_INFO[selectedTemplate.faction].name}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold flex items-center gap-1">
                              {ROLE_ICONS[selectedTemplate.role]}
                              {ROLE_INFO[selectedTemplate.role].label}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            {selectedTemplate.title} ·{' '}
                            <span className="text-amber-300 font-medium">
                              {selectedTemplate.weaponName}
                            </span>
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {Array.from({ length: previewOwned.stars }).map((_, idx) => (
                              <Star
                                key={idx}
                                className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]"
                              />
                            ))}
                            <span className="text-[10px] font-mono text-slate-400 ml-1">
                              {selectedOwned
                                ? `Mảnh hồn: ${selectedOwned.shards}/${selectedOwned.stars * 2}`
                                : 'Chưa chiêu mộ'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[9px] uppercase text-slate-400">Lực Chiến</div>
                        <div className="font-mono text-sm font-bold text-[#F59E0B]">
                          {inspectedStats.combatPower.toLocaleString()}
                        </div>
                        <div
                          data-testid="inspected-hero-level"
                          className="text-[10px] font-mono font-bold text-[#38bdf8]"
                        >
                          {selectedOwned ? `Lv.${selectedOwned.level}` : 'Lv.1 (Xem trước)'}
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-1.5 my-2">
                      <div className="bg-[#0B0E17] p-1.5 rounded border border-slate-800/80">
                        <div className="text-[9px] text-slate-400">Sinh Lực</div>
                        <div className="font-mono text-xs font-bold text-emerald-400">
                          {inspectedStats.maxHp.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-[#0B0E17] p-1.5 rounded border border-slate-800/80">
                        <div className="text-[9px] text-slate-400">Tấn Công</div>
                        <div className="font-mono text-xs font-bold text-rose-400">
                          {inspectedStats.atk.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-[#0B0E17] p-1.5 rounded border border-slate-800/80">
                        <div className="text-[9px] text-slate-400">Phòng Thủ</div>
                        <div className="font-mono text-xs font-bold text-sky-400">
                          {inspectedStats.def.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-[#0B0E17] p-1.5 rounded border border-slate-800/80">
                        <div className="text-[9px] text-slate-400">Trang Bị</div>
                        <div className="font-mono text-xs font-bold text-amber-400">
                          Bậc {previewOwned.gearTier}
                        </div>
                      </div>
                    </div>

                    {/* 3-Skill Kit Showcase (Ultimate + Active + Passive) */}
                    <div
                      data-testid="hero-skill-kit"
                      className="bg-[#0B0E17] p-2 rounded-lg border border-slate-800/90 space-y-1.5"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Bộ 3 Kỹ Năng & Hiệu Ứng 3D ({selectedTemplate.vfxStyle})
                        </span>
                        {selectedOwned?.isDeployed && (
                          <button
                            type="button"
                            data-testid="btn-preview-hero-skill"
                            onClick={() => {
                              onSelectTab('none');
                              onCastHeroUltimate(selectedOwned.slotIndex);
                            }}
                            className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-[10px] font-bold text-amber-300 cursor-pointer flex items-center gap-1"
                          >
                            <Zap className="w-2.5 h-2.5" />
                            Biểu Diễn Tuyệt Kỹ 3D
                          </button>
                        )}
                      </div>

                      {/* 1. Ultimate Skill */}
                      <div className="bg-[#121726] px-2 py-1 rounded border border-amber-500/30">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-amber-300">
                            ★ Tuyệt Kỹ: {selectedTemplate.ultimateName}
                          </span>
                          <span className="text-[9px] font-mono px-1 rounded bg-amber-500/20 text-amber-200">
                            100 Nộ
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-snug mt-0.5">
                          {selectedTemplate.ultimateDesc}
                        </p>
                      </div>

                      {/* 2. Active Tactical Skill + 3. Passive Skill */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        <div className="bg-[#121726] px-2 py-1 rounded border border-sky-500/25">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold text-sky-300 truncate">
                              ⚡ Chủ Động: {selectedTemplate.activeSkillName}
                            </span>
                            <span className="text-[9px] font-mono text-sky-400 shrink-0">
                              CD {selectedTemplate.activeSkillCooldown}s
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-400 leading-snug mt-0.5 line-clamp-2">
                            {selectedTemplate.activeSkillDesc}
                          </p>
                        </div>

                        <div className="bg-[#121726] px-2 py-1 rounded border border-purple-500/25">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold text-purple-300 truncate">
                              ✦ Nội Tại: {selectedTemplate.passiveSkillName}
                            </span>
                            <span className="text-[9px] font-mono text-purple-400 shrink-0">
                              Bị Động
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-400 leading-snug mt-0.5 line-clamp-2">
                            {selectedTemplate.passiveSkillDesc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Owned vs Unowned Actions */}
                  {selectedOwned ? (
                    <div className="flex flex-col gap-1.5">
                      {/* 1-Click Slot Assignment Bar */}
                      <div className="flex items-center justify-between gap-1 bg-[#0B0E17] px-2.5 py-1.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] font-bold uppercase text-slate-300">
                          Xếp Vào Ô Đội Hình:
                        </span>
                        <div className="flex items-center gap-1">
                          {[0, 1, 2, 3, 4].map((slotIdx) => {
                            const activeHere =
                              selectedOwned.isDeployed &&
                              selectedOwned.slotIndex === slotIdx;
                            return (
                              <button
                                key={slotIdx}
                                type="button"
                                data-testid={`assign-slot-btn-${slotIdx}`}
                                onClick={() =>
                                  onAssignHeroToSlot(selectedTemplate.id, slotIdx)
                                }
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                                  activeHere
                                    ? 'bg-[#F59E0B] text-slate-950'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                                }`}
                              >
                                Ô {slotIdx + 1}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          data-testid="btn-level-up-hero"
                          onClick={() => onUpgradeSingleHero(selectedTemplate.id)}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#d4af37] hover:bg-[#e5c14d] text-[#090c15] font-bold text-xs cursor-pointer shadow"
                        >
                          <span className="flex items-center gap-1">
                            <ArrowUpCircle className="w-3.5 h-3.5" />
                            Tăng Cấp
                          </span>
                          <span className="font-mono text-[10px]">
                            {inspectedCost.gold} Vàng
                          </span>
                        </button>

                        <button
                          type="button"
                          data-testid="btn-ascend-hero"
                          onClick={() => onAscendSingleHero(selectedTemplate.id)}
                          disabled={
                            selectedOwned.stars >= 5 ||
                            selectedOwned.shards < selectedOwned.stars * 2
                          }
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg font-bold text-xs cursor-pointer border ${
                            selectedOwned.stars < 5 &&
                            selectedOwned.shards >= selectedOwned.stars * 2
                              ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400'
                              : 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed'
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5" />
                            Đột Phá Sao
                          </span>
                          <span className="font-mono text-[10px]">
                            {selectedOwned.shards}/{selectedOwned.stars * 2} Mảnh
                          </span>
                        </button>

                        <button
                          type="button"
                          data-testid="btn-upgrade-gear"
                          onClick={() => onUpgradeHeroGear(selectedTemplate.id)}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs cursor-pointer border border-slate-700"
                        >
                          <span>Rèn Trang Bị</span>
                          <span className="font-mono text-[10px] text-amber-400">
                            {selectedOwned.gearTier * 850} Vàng
                          </span>
                        </button>

                        <button
                          type="button"
                          data-testid="btn-toggle-deploy"
                          onClick={() => onToggleDeployHero(selectedTemplate.id)}
                          className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg font-bold text-xs cursor-pointer border ${
                            selectedOwned.isDeployed
                              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                              : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400 text-white'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          {selectedOwned.isDeployed
                            ? 'Thu Hồi Khỏi Đội'
                            : 'Triển Khai Ra Trận'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Direct Recruitment for Unowned Hero */
                    <div className="bg-[#0B0E17] p-2.5 rounded-xl border border-amber-500/40 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-amber-300">
                          Chiêu Mộ Trực Tiếp {selectedTemplate.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Mở khóa ngay anh hùng này để xếp vào đội hình 3D hoặc quay tại Đài Gacha.
                        </div>
                      </div>
                      <button
                        type="button"
                        data-testid="btn-recruit-direct"
                        onClick={() => onRecruitHeroDirect(selectedTemplate.id)}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#d4af37] hover:bg-[#e5c14d] text-[#090c15] font-bold text-xs cursor-pointer shadow-lg"
                      >
                        <UserPlus className="w-4 h-4" />
                        Chiêu Mộ Ngay
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GACHA SUMMON TAVERN */}
          {activeTab === 'gacha' && (
            <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 max-h-[390px] overflow-y-auto">
              {/* Left 5 Cols: Banner & Summon Buttons */}
              <div className="lg:col-span-5 bg-[#121726] border border-purple-500/40 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-purple-500/20 border border-purple-400/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" />
                      Banner Thánh Điện 16 Anh Hùng
                    </div>
                    <span className="font-mono text-[11px] text-amber-300 font-bold">
                      Đã quay: {playerState.totalSummons} lần
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-white mt-2">
                    Triệu Hồi Thần Tướng Huyền Thoại
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Chiêu mộ 16 Anh Hùng thuộc 6 Hệ Tộc. Tướng trùng lặp tự động chuyển hóa thành{' '}
                    <span className="text-amber-300 font-semibold">Mảnh Sao</span> để Đột Phá tới 5★!
                  </p>

                  {/* Live Currency & Pity Bar */}
                  <div className="mt-3 p-2.5 rounded-lg bg-[#0B0E17] border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Tài nguyên hiện có:</span>
                      <div className="flex items-center gap-3 font-mono font-bold">
                        <span
                          data-testid="gacha-scrolls-count"
                          className="text-amber-300"
                        >
                          {playerState.summonScrolls} Cuộn
                        </span>
                        <span className="text-sky-300">
                          {playerState.gems.toLocaleString()} Kim Cương
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">
                          Bảo hiểm Tướng Thần Thoại (Pity):
                        </span>
                        <span className="font-mono font-bold text-amber-400">
                          {playerState.pityCounter} / 20
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-[#d4af37] transition-all duration-300"
                          style={{
                            width: `${Math.min(100, (playerState.pityCounter / 20) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {gachaError && (
                    <div
                      data-testid="gacha-error-msg"
                      className="mt-2 p-2 rounded-lg bg-rose-950/80 border border-rose-500/40 flex items-center justify-between gap-2 text-xs text-rose-200 font-medium"
                    >
                      <span>{gachaError}</span>
                      <button
                        type="button"
                        onClick={onClaimFreeSupply}
                        className="px-2 py-1 rounded bg-emerald-500 text-slate-950 font-bold text-[10px] cursor-pointer shrink-0"
                      >
                        +Nhận Tiếp Tế Miễn Phí
                      </button>
                    </div>
                  )}
                </div>

                {/* Summon 1x & 10x Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5 mt-3">
                  <button
                    type="button"
                    data-testid="btn-summon-1"
                    onClick={() => onSummonGacha(1)}
                    className="flex flex-col items-center justify-center py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white cursor-pointer transition-all active:scale-95"
                  >
                    <span className="font-bold text-xs">Triệu Hồi x1</span>
                    <span className="font-mono text-[10px] text-amber-300 mt-0.5">
                      {playerState.summonScrolls >= 1
                        ? 'Dùng 1 Cuộn (Đang có)'
                        : '300 Kim Cương'}
                    </span>
                  </button>

                  <button
                    type="button"
                    data-testid="btn-summon-10"
                    onClick={() => onSummonGacha(10)}
                    className="flex flex-col items-center justify-center py-2.5 px-3 rounded-lg bg-[#d4af37] hover:bg-[#e5c14d] text-[#090c15] cursor-pointer shadow-lg transition-all active:scale-95"
                  >
                    <span className="font-bold text-xs">Triệu Hồi x10</span>
                    <span className="font-mono text-[10px] text-slate-900 font-semibold mt-0.5">
                      {playerState.summonScrolls >= 10
                        ? 'Dùng 10 Cuộn (Đang có)'
                        : '2.700 Kim Cương (-10%)'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Right 7 Cols: Summon Results Display OR Featured Pool */}
              <div className="lg:col-span-7 bg-[#121726] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {lastSummonResults.length > 0
                      ? `Kết Quả Triệu Hồi Mới Nhất (${lastSummonResults.length} Lượt)`
                      : 'Danh Sách Anh Hùng Tiêu Biểu Trong Đài Triệu Hồi'}
                  </span>
                  {lastSummonResults.length > 0 && (
                    <button
                      type="button"
                      data-testid="btn-clear-gacha-results"
                      onClick={onClearSummonResults}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Xem Danh Sách Tướng
                    </button>
                  )}
                </div>

                {lastSummonResults.length === 0 ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {HERO_CATALOG.slice(0, 8).map((tmpl) => {
                        const isOwned = Boolean(playerState.heroes[tmpl.id]);
                        return (
                          <button
                            key={tmpl.id}
                            type="button"
                            onClick={() => {
                              setSelectedHeroId(tmpl.id);
                              onSelectTab('heroes');
                            }}
                            className="p-2 rounded-lg bg-[#0B0E17] border border-slate-800/90 hover:border-purple-500/50 flex flex-col items-center text-center cursor-pointer transition-all"
                          >
                            <HeroPortraitSvg template={tmpl} size="md" />
                            <div className="text-[11px] font-bold text-slate-100 truncate w-full mt-1">
                              {tmpl.name}
                            </div>
                            <div className="text-[9px] text-amber-400">
                              {FACTION_INFO[tmpl.faction].name} · {ROLE_INFO[tmpl.role].label}
                            </div>
                            <span
                              className={`mt-1 text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                isOwned
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-purple-500/20 text-purple-300'
                              }`}
                            >
                              {isOwned ? 'Đã Sở Hữu' : 'Có Thể Quay'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-2 text-center text-xs text-slate-400">
                      Bấm <strong className="text-amber-300">Triệu Hồi x1</strong> hoặc{' '}
                      <strong className="text-amber-300">Triệu Hồi x10</strong> ở khung bên trái để mở cổng triệu hồi!
                    </div>
                  </div>
                ) : (
                  <div
                    data-testid="gacha-results-grid"
                    className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-auto"
                  >
                    {lastSummonResults.map((res, idx) => (
                      <button
                        key={`${res.template.id}-${idx}`}
                        type="button"
                        onClick={() => {
                          setSelectedHeroId(res.template.id);
                          onSelectTab('heroes');
                        }}
                        className={`p-2 rounded-lg border flex flex-col items-center text-center transition-all cursor-pointer hover:scale-105 ${
                          res.isNew
                            ? 'bg-amber-950/40 border-[#F59E0B] shadow-md ring-1 ring-[#F59E0B]/40'
                            : 'bg-[#0B0E17] border-slate-800'
                        }`}
                      >
                        <HeroPortraitSvg template={res.template} size="md" />
                        <div className="text-[11px] font-bold text-white truncate w-full mt-1">
                          {res.template.name}
                        </div>
                        <div className="text-[9px] text-slate-400 truncate w-full">
                          {res.template.title}
                        </div>
                        <div className="text-[9px] text-amber-400 my-0.5">
                          {res.template.baseRarity === 'ascended' ? '★★ Thần Thoại' : '★ Tinh Anh'}
                        </div>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            res.isNew
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-purple-950 text-purple-300 border border-purple-700/50'
                          }`}
                        >
                          {res.isNew ? 'TƯỚNG MỚI!' : `+${res.shardsGranted} Mảnh`}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: RANKED ARENA */}
          {activeTab === 'arena' && (
            <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 max-h-[360px] overflow-y-auto">
              <div className="lg:col-span-4 bg-[#121726] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Hạng Hiện Tại Của Bạn
                  </div>
                  <h3
                    className="font-display text-xl font-bold mt-1"
                    style={{ color: rankTier.tierColor }}
                  >
                    {rankTier.tierName}
                  </h3>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-xs bg-[#0B0E17] p-2 rounded border border-slate-800">
                      <span className="text-slate-400">Điểm ELO Xếp Hạng:</span>
                      <span className="font-mono font-bold text-[#F59E0B]">
                        {playerState.arenaPoints} Điểm
                      </span>
                    </div>
                    <div className="flex justify-between text-xs bg-[#0B0E17] p-2 rounded border border-slate-800">
                      <span className="text-slate-400">Tổng Trận Thắng:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {playerState.arenaWins} Trận Thắng
                      </span>
                    </div>
                    <div className="flex justify-between text-xs bg-[#0B0E17] p-2 rounded border border-slate-800">
                      <span className="text-slate-400">Thưởng Hàng Ngày:</span>
                      <span className="font-mono font-bold text-sky-400">
                        +{rankTier.dailyGems} Kim Cương
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-3">
                  Chọn đối thủ bên phải để bước vào trận chiến 5v5 trực tiếp trên Đấu Trường 3D!
                </p>
              </div>

              <div className="lg:col-span-8 flex flex-col gap-2">
                {arenaOpponents.map((opp, idx) => (
                  <div
                    key={opp.id}
                    data-testid={`arena-opp-${idx}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#121726] border border-slate-800 hover:border-amber-500/40 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-display font-bold text-amber-400">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{opp.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-semibold">
                            {opp.tierName}
                          </span>
                          <span className="text-[10px] text-slate-400">[{opp.guild}]</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-mono">
                          <span>ELO: {opp.rankPoints}</span>
                          <span>•</span>
                          <span className="text-rose-400 font-semibold">
                            Lực Chiến: {opp.combatPower.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      data-testid={`btn-challenge-${idx}`}
                      onClick={() => onChallengeArenaOpponent(opp)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#d4af37] hover:bg-[#e5c14d] text-[#090c15] font-bold text-xs cursor-pointer shadow-md"
                    >
                      <Swords className="w-4 h-4" />
                      Khiêu Chiến
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CAMPAIGN STAGES & AFK CHEST */}
          {activeTab === 'stages' && (
            <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              <div className="lg:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase">
                  Tích Lũy Tự Động 24/7 — Ải Hiện Tại: 1-{playerState.stageIndex}
                </div>
                <h3 className="font-display text-lg font-bold text-white">
                  Rương Chiến Lợi Phẩm AFK ({afkMinutes} phút tích lũy)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sản lượng hiện tại: <strong className="text-amber-300">+{afkPreview.goldPerMin} Vàng/phút</strong> ·{' '}
                  <strong className="text-emerald-300">+{afkPreview.expPerMin} EXP/phút</strong> ·{' '}
                  <strong className="text-purple-300">+{afkPreview.dustPerHour} Bụi/giờ</strong>.
                </p>

                {/* Quick Stage Selector */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {Array.from(
                    { length: Math.max(5, playerState.highestReachedStage + 1) },
                    (_, i) => i + 1
                  )
                    .slice(0, 10)
                    .map((sIdx) => {
                      const isCurrent = sIdx === playerState.stageIndex;
                      const isUnlocked = sIdx <= playerState.highestReachedStage;
                      return (
                        <button
                          key={sIdx}
                          type="button"
                          disabled={!isUnlocked}
                          onClick={() => onSelectCampaignStage(sIdx)}
                          className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer border ${
                            isCurrent
                              ? 'bg-[#d4af37] text-[#090c15] border-amber-200'
                              : isUnlocked
                                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                                : 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed'
                          }`}
                        >
                          Ải 1-{sIdx}
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#121726] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#0B0E17] p-2 rounded-lg border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 uppercase">Vàng AFK</div>
                    <div className="font-mono text-sm font-bold text-[#F59E0B] mt-0.5">
                      +{afkPreview.gold.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-[#0B0E17] p-2 rounded-lg border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 uppercase">EXP Tướng</div>
                    <div className="font-mono text-sm font-bold text-emerald-400 mt-0.5">
                      +{afkPreview.heroExp.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-[#0B0E17] p-2 rounded-lg border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 uppercase">Bụi Thần</div>
                    <div className="font-mono text-sm font-bold text-purple-400 mt-0.5">
                      +{afkPreview.arcaneDust.toLocaleString()}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  data-testid="btn-claim-afk-rewards"
                  onClick={onFastForwardAfkRewards}
                  className="w-full py-2.5 rounded-lg bg-[#d4af37] hover:bg-[#e5c14d] text-[#090c15] font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg"
                >
                  Càn Quét Nhanh 2 Giờ AFK (+Vàng & EXP)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Bottom Command Bar (5 Hero Ultimate Cards + Feature Navigation Tabs) */}
      <div className="pointer-events-auto w-full max-w-[99vw] xl:max-w-[1420px] bg-[#0B0E17]/95 border border-[#c69d53]/50 rounded-xl px-2 py-1.5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-1.5">
        {/* Left: All 5 Deployed Hero Ultimate Cards Visible Side-by-Side */}
        <div className="grid grid-cols-5 gap-1 w-full lg:w-auto shrink-0">
          {deployedList.map((owned, idx) => {
            const tmpl = getHeroTemplate(owned.templateId);
            const live = liveUnits.find((u) => u.slotIndex === owned.slotIndex);
            const energy = live ? Math.min(100, Math.floor(live.energy)) : 0;
            const hpPct =
              live && live.maxHp > 0
                ? Math.max(0, Math.min(100, Math.round((live.hp / live.maxHp) * 100)))
                : 100;
            const isReady = energy >= 100 && (!live || live.isAlive);

            return (
              <button
                key={tmpl.id}
                type="button"
                data-testid={`ult-card-${tmpl.id}`}
                onClick={() => onCastHeroUltimate(owned.slotIndex)}
                className={`relative group flex items-center gap-1 px-1.5 py-1 rounded-lg border transition-all cursor-pointer w-[112px] xl:w-[118px] ${
                  isReady
                    ? 'bg-[#1E263D] border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.35)] -translate-y-0.5'
                    : 'bg-[#121726] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="relative shrink-0">
                  <HeroPortraitSvg template={tmpl} size="sm" />
                  <span className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded bg-slate-950/90 border border-slate-700 text-[9px] font-mono font-bold text-amber-300 flex items-center justify-center">
                    {idx + 1}
                  </span>
                </div>

                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between gap-0.5">
                    <span className="text-[10px] font-bold text-white truncate">
                      {tmpl.name.split(' ')[0]}
                    </span>
                    <span className="font-mono text-[9px] text-amber-400">
                      Lv.{owned.level}
                    </span>
                  </div>

                  <div className="text-[8px] text-amber-300/90 truncate font-medium">
                    {tmpl.ultimateName}
                  </div>

                  {/* HP Bar */}
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden mt-0.5">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-200"
                      style={{ width: `${hpPct}%` }}
                    />
                  </div>

                  {/* Energy Bar */}
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden mt-0.5">
                    <div
                      className={`h-full transition-all duration-200 ${
                        isReady ? 'bg-[#F59E0B]' : 'bg-sky-400'
                      }`}
                      style={{ width: `${energy}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Feature Drawer Triggers, 5-Hero Skill Combo & 1-Click Auto Upgrade */}
        <div className="flex items-center gap-1 flex-wrap justify-end">
          <button
            type="button"
            data-testid="btn-combo-ultimates"
            onClick={() => onCastHeroUltimate(-1)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-[10px] cursor-pointer shadow-md transition-transform active:scale-95"
            title="Kích hoạt đồng loạt Tuyệt Kỹ & Hiệu Ứng 3D của cả 5 Tướng (Phím C)"
          >
            <Sparkles className="w-3 h-3 fill-slate-950" />
            <span>Combo 5 Tuyệt Kỹ</span>
          </button>

          <button
            type="button"
            data-testid="btn-auto-upgrade-all"
            onClick={onRunAutoUpgradeNow}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#d4af37] hover:bg-[#e5c14d] text-[#090c15] font-bold text-[10px] cursor-pointer shadow-md transition-transform active:scale-95"
          >
            <Zap className="w-3 h-3 fill-[#090c15]" />
            <span>Nâng Tự Động</span>
          </button>

          <button
            type="button"
            data-testid="tab-btn-heroes"
            onClick={() => toggleTab('heroes')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-[10px] font-semibold cursor-pointer transition-colors ${
              activeTab === 'heroes'
                ? 'bg-[#1E263D] border-[#F59E0B] text-[#F59E0B]'
                : 'bg-[#121726] border-slate-800 text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Users className="w-3 h-3 text-amber-400" />
            <span>Quản Lý Tướng</span>
            <ChevronUp
              className={`w-3 h-3 transition-transform ${
                activeTab === 'heroes' ? 'rotate-180' : ''
              }`}
            />
          </button>

          <button
            type="button"
            data-testid="tab-btn-gacha"
            onClick={() => toggleTab('gacha')}
            className={`relative flex items-center gap-1 px-2 py-1.5 rounded-lg border text-[10px] font-semibold cursor-pointer transition-colors ${
              activeTab === 'gacha'
                ? 'bg-[#1E263D] border-[#A855F7] text-purple-300'
                : 'bg-[#121726] border-slate-800 text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Triệu Hồi Gacha</span>
            {playerState.summonScrolls > 0 && (
              <span className="px-1 py-0.1 rounded-full bg-purple-600 text-white font-mono text-[9px] font-bold">
                {playerState.summonScrolls}
              </span>
            )}
          </button>

          <button
            type="button"
            data-testid="tab-btn-arena"
            onClick={() => toggleTab('arena')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-[10px] font-semibold cursor-pointer transition-colors ${
              activeTab === 'arena'
                ? 'bg-[#1E263D] border-[#F59E0B] text-[#F59E0B]'
                : 'bg-[#121726] border-slate-800 text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-3 h-3 text-amber-400" />
            <span>Đấu Trường</span>
          </button>

          <button
            type="button"
            data-testid="tab-btn-stages"
            onClick={() => toggleTab('stages')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-[10px] font-semibold cursor-pointer transition-colors ${
              activeTab === 'stages'
                ? 'bg-[#1E263D] border-emerald-500 text-emerald-300'
                : 'bg-[#121726] border-slate-800 text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Package className="w-3 h-3 text-emerald-400" />
            <span>Rương AFK</span>
          </button>

          <button
            type="button"
            data-testid="toggle-speed-btn"
            onClick={onToggleSpeed}
            className={`px-2 py-1.5 rounded-lg border font-mono text-[10px] font-bold cursor-pointer ${
              playerState.battleSpeed === 2
                ? 'bg-[#d4af37] text-[#090c15] border-amber-300'
                : 'bg-[#121726] text-slate-300 border-slate-800'
            }`}
            title="Đổi tốc độ chiến đấu (Space)"
          >
            x{playerState.battleSpeed}
          </button>

          <button
            type="button"
            onClick={onCycleCamera}
            className="p-1.5 rounded-lg bg-[#121726] hover:bg-slate-800 border border-slate-800 text-slate-300 cursor-pointer"
            title={`Góc máy 3D: ${cameraPreset}`}
          >
            <Camera className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="px-2 py-1.5 rounded-lg bg-[#121726] hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-400 cursor-pointer"
            title="Ẩn/Hiện bảng điều khiển (H)"
          >
            {isHudCollapsed ? 'Hiện' : 'Ẩn'}
          </button>
        </div>
      </div>
    </div>
  );
};
