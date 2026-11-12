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

const CLASS_ICONS: Record<HeroClass, React.ReactNode> = {
  Tank: <Shield className="w-3.5 h-3.5 text-amber-400" />,
  'Damage Dealer': <Sword className="w-3.5 h-3.5 text-rose-400" />,
  Mage: <Wand2 className="w-3.5 h-3.5 text-sky-400" />,
  Support: <Heart className="w-3.5 h-3.5 text-emerald-400" />,
  'Crowd Controller': <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
};

// ============================================================================
// 1. RANHORN CITY HUB (Matching screenshot e04c13f4, e4cb1de4, f91c89a4, e230a004)
// ============================================================================
export const LobbyPanel: React.FC<{ onCloseToBattle: () => void }> = ({
  onCloseToBattle,
}) => {
  const state = useGameStore();
  const [ranhornModal, setRanhornModal] = useState<
    null | 'map' | 'crystal' | 'temple' | 'library'
  >(null);
  const teamPower = computeTeamPower(state.formation, state.ownedHeroes);
  const currentStage = getCampaignStage(state.currentStageId);
  const idleMinutes = Math.max(1, Math.floor(state.idleAccumulatedSeconds / 60));
  const ownedCount = Object.keys(state.ownedHeroes).length;
  const allyAura = computeFactionAura(state.formation);

  const ranhornBuildings = [
    {
      id: 'tavern',
      title: 'The Noble Tavern · Quán Rượu Quý Tộc',
      subtitle: `Gặp Dolly chiêu mộ Anh Hùng & Wishlist (${state.summonScrolls} Cuộn)`,
      badge: 'WISHLIST',
      previewImg:
        '/assets/aistudio/e5c92df8-2348-11ef-834c-02420a00018d_edbebfd3.webp',
      onClick: () => state.setActiveScreen('summon'),
    },
    {
      id: 'crystal',
      title: 'Resonating Crystal · Pha Lê Cộng Hưởng',
      subtitle: 'Ngôi Sao Năm Cánh đồng bộ cấp độ 5 Tướng chủ lực',
      badge: 'PENTAGRAM',
      previewImg:
        '/assets/aistudio/f91c89a4-2348-11ef-8204-02420a00018f_d7da0e81.webp',
      onClick: () => {
        state.autoUpgradeSquad();
        setRanhornModal('crystal');
      },
    },
    {
      id: 'temple',
      title: 'Temple of Ascension · Đền Thăng Thiên',
      subtitle: `Hợp nhất bản sao đột phá Ascended (${ownedCount}/${HERO_ROSTER.length} Tướng)`,
      badge: 'SMART ASCEND',
      previewImg:
        '/assets/aistudio/e4cb1de4-2348-11ef-ade0-02420a00018c_95067586.webp',
      onClick: () => setRanhornModal('temple'),
    },
    {
      id: 'oak_inn',
      title: 'The Oak Inn & Library · Thư Viện Liên Kết',
      subtitle: 'Liên kết Anh Hùng (The Gallant Three), Nội Thất 9/9 & Thần Khí',
      badge: 'UNIONS + 9/9',
      previewImg:
        '/assets/aistudio/e230a004-2348-11ef-83ca-02420a00018c_da3912c3.webp',
      onClick: () => setRanhornModal('library'),
    },
    {
      id: 'dark_forest',
      title: 'Dark Forest · Rừng Đen & Tháp Vua',
      subtitle: "King's Tower, Arcane Labyrinth, Boss Mộng Cảnh & Trailer",
      badge: "KING'S TOWER",
      previewImg:
        '/assets/aistudio/e9a24a7c-2348-11ef-834c-02420a00018d_0935de9a.webp',
      onClick: () => state.setActiveScreen('videos'),
    },
    {
      id: 'arena',
      title: 'Legends Championship · Đấu Trường 5v5',
      subtitle: `Xếp đội hình 5v5 tranh tài · Lực Chiến: ${teamPower.toLocaleString()}`,
      badge: 'ARENA VS',
      previewImg:
        '/assets/aistudio/ef3fec6e-2348-11ef-a581-02420a00018c_503f2249.webp',
      onClick: () => state.setActiveScreen('formation'),
    },
  ];

  return (
    <div
      data-testid="screen-lobby"
      className="w-full max-w-6xl mx-auto bg-gradient-to-b from-[#f3e4c6] via-[#ebd5ab] to-[#dcc08e] border-4 border-[#6e4b26] rounded-2xl shadow-[0_12px_50px_rgba(0,0,0,0.95)] overflow-hidden text-[#3b2412] relative"
    >
      {/* Ornate AFK Arena Wood & Gold Header Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 bg-gradient-to-b from-[#4a3019] via-[#34200f] to-[#241509] border-b-4 border-[#b8893e] text-[#fff2d1]">
        <div className="flex items-center gap-3">
          <img
            src="/assets/ui/ascended.png"
            alt="Ranhorn Crest"
            className="w-7 h-7 object-contain"
          />
          <div>
            <h2
              className="text-base md:text-lg font-extrabold tracking-wider uppercase text-[#fde047]"
              style={{ fontFamily: '"Cinzel", serif' }}
            >
              Ranhorn — Vương Đô Esperia
            </h2>
            <p className="text-[11px] text-[#e5cba0]">
              The Oak Inn · Dragon Isle · Guild · Library · Temple of Ascension · Resonating Crystal · The Noble Tavern
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setRanhornModal('map')}
            className="px-3 py-1.5 rounded-lg bg-[#593a1e] hover:bg-[#6e4826] border border-[#d4af37] text-[#fde047] font-bold text-xs cursor-pointer"
          >
            Bản Đồ Toàn Cảnh Ranhorn
          </button>
          <button
            type="button"
            onClick={() => state.unlockAllRepoHeroes()}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-b from-[#f5d061] to-[#b8862d] text-[#241509] font-extrabold text-xs cursor-pointer shadow"
          >
            Mở Toàn Bộ {HERO_ROSTER.length} Tướng
          </button>
          <button
            type="button"
            onClick={onCloseToBattle}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-gradient-to-b from-[#67e8f9] via-[#22d3ee] to-[#0284c7] text-[#041019] font-extrabold text-xs cursor-pointer shadow"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Về Chiến Trường
          </button>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left 4 Cols: Authentic Vertical Ranhorn City Map Preview (e04c13f4) */}
        <div className="lg:col-span-4 relative rounded-xl overflow-hidden border-4 border-[#7c562b] shadow-xl bg-[#24160b] min-h-[360px] flex flex-col justify-end">
          <img
            src="/assets/aistudio/e04c13f4-2348-11ef-8204-02420a00018f_6a33075f.webp"
            alt="Ranhorn City Map"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-10 bg-gradient-to-t from-[#1e1208] via-[#1e1208]/85 to-transparent p-3 text-[#fff2d1]">
            <div className="text-xs font-extrabold text-[#fde047] uppercase">
              Thành Chính Ranhorn (In-Game Map)
            </div>
            <p className="text-[11px] text-[#e5cba0] mt-0.5">
              Bấm vào từng công trình bên phải để mở Đền Thăng Thiên, Pha Lê Cộng Hưởng, Quán Rượu Quý Tộc và Thư Viện.
            </p>
          </div>
        </div>

        {/* Right 8 Cols: 6 Ranhorn Buildings on Warm Parchment Cards + Resonating Crystal & AFK Chest */}
        <div className="lg:col-span-8 flex flex-col justify-between gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ranhornBuildings.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={b.onClick}
                className="group p-2.5 rounded-xl bg-[#faf0dc] hover:bg-[#fff8ea] border-2 border-[#9c723c] hover:border-[#d4af37] text-left transition-all cursor-pointer flex items-center gap-3 shadow-md hover:-translate-y-0.5"
              >
                <img
                  src={b.previewImg}
                  alt=""
                  aria-hidden="true"
                  className="w-14 h-16 rounded-lg object-cover border-2 border-[#8c6430] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="inline-block text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-[#4a3019] text-[#fde047]">
                    {b.badge}
                  </span>
                  <div className="text-xs font-extrabold text-[#3b2412] truncate mt-1">
                    {b.title}
                  </div>
                  <div className="text-[11px] text-[#6b4826] mt-0.5 line-clamp-2">
                    {b.subtitle}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Bottom Strip: Resonating Crystal 5 Heroes + AFK Tribute Chest */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-7 p-3 rounded-xl bg-[#332010] border-2 border-[#a87e3b] text-[#fff2d1]">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs font-extrabold text-[#fde047] uppercase">
                    Ngôi Sao Năm Cánh · Pha Lê Cộng Hưởng
                  </h4>
                  <p className="text-[10px] text-[#e5cba0] font-mono">
                    LC: {teamPower.toLocaleString()} · {allyAura.tierLabel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => state.setActiveScreen('formation')}
                  className="px-2.5 py-1 rounded bg-[#d4af37] text-[#241509] text-[10px] font-extrabold cursor-pointer"
                >
                  Đổi Đội Hình
                </button>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {state.formation.map((heroId, idx) => {
                  const hero = heroId ? getHeroById(heroId) : null;
                  const owned = heroId ? state.ownedHeroes[heroId] : undefined;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        hero
                          ? state.setActiveScreen('details', hero.id)
                          : state.setActiveScreen('formation')
                      }
                      className="p-1 rounded-lg bg-[#221409] border border-[#8c6430] hover:border-[#fde047] flex flex-col items-center text-center cursor-pointer"
                    >
                      {hero && owned ? (
                        <>
                          <HeroAvatarSvg hero={hero} size="sm" variant="framed" />
                          <span className="text-[9px] font-bold text-[#fff2d1] truncate w-full mt-0.5">
                            {hero.name.split(' ')[0]}
                          </span>
                          <span className="text-[8px] font-mono text-[#fde047]">
                            Lv.{owned.level}
                          </span>
                        </>
                      ) : (
                        <div className="h-12 flex items-center justify-center text-[10px] text-[#a88b65]">
                          + Ô #{idx + 1}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-5 p-3 rounded-xl bg-[#faf0dc] border-2 border-[#9c723c] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-[#5c3818]">
                    ★ Rương Thưởng AFK ({idleMinutes}p)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#8c5820]">
                    {currentStage.chapter}
                  </span>
                </div>
                <p className="text-[11px] text-[#6b4826] mt-1">
                  +{currentStage.id * 46} Vàng/p · +{currentStage.id * 62} EXP/p
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  data-testid="lobby-claim-idle-btn"
                  onClick={() => state.claimIdleTribute()}
                  className="py-2 rounded-lg bg-gradient-to-b from-[#67e8f9] via-[#22d3ee] to-[#0284c7] text-[#041019] font-extrabold text-xs uppercase cursor-pointer shadow"
                >
                  Collect AFK
                </button>
                <button
                  type="button"
                  onClick={onCloseToBattle}
                  className="py-2 rounded-lg bg-gradient-to-b from-[#f5d061] to-[#b8862d] text-[#241509] font-extrabold text-xs uppercase cursor-pointer shadow"
                >
                  Begin {currentStage.chapter}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ranhorn Building Sub-Modal */}
      {ranhornModal && (
        <div
          role="dialog"
          aria-label="Chi tiết công trình Ranhorn"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        >
          <div className="w-full max-w-3xl bg-[#f3e3c3] border-4 border-[#7c562b] rounded-2xl p-4 shadow-2xl text-[#3b2412] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-[#9c723c]/40 pb-2">
              <h3
                className="text-base font-extrabold text-[#4d2f14] uppercase"
                style={{ fontFamily: '"Cinzel", serif' }}
              >
                {ranhornModal === 'map' && 'Bản Đồ Thành Chính Ranhorn'}
                {ranhornModal === 'crystal' && 'Resonating Crystal — Pha Lê Cộng Hưởng'}
                {ranhornModal === 'temple' && 'Temple of Ascension — Đền Thăng Thiên'}
                {ranhornModal === 'library' && 'Library Unions — The Gallant Three'}
              </h3>
              <button
                type="button"
                onClick={() => setRanhornModal(null)}
                className="p-1.5 rounded-lg bg-[#8c6239] text-amber-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-5 flex justify-center">
                <img
                  src={
                    ranhornModal === 'map'
                      ? '/assets/aistudio/e04c13f4-2348-11ef-8204-02420a00018f_6a33075f.webp'
                      : ranhornModal === 'crystal'
                        ? '/assets/aistudio/f91c89a4-2348-11ef-8204-02420a00018f_d7da0e81.webp'
                        : ranhornModal === 'temple'
                          ? '/assets/aistudio/e4cb1de4-2348-11ef-ade0-02420a00018c_95067586.webp'
                          : '/assets/aistudio/e230a004-2348-11ef-83ca-02420a00018c_da3912c3.webp'
                  }
                  alt={ranhornModal}
                  className="max-h-[340px] rounded-xl border-2 border-[#7c562b] object-contain"
                />
              </div>
              <div className="md:col-span-7 space-y-3 text-xs text-[#4d2f14]">
                <p className="leading-relaxed">
                  {ranhornModal === 'map' &&
                    'Thành Chính Ranhorn bao gồm Lữ Quán Cây Sồi (The Oak Inn), Đảo Rồng (Dragon Isle), Hội Quán (Guild), Thư Viện (Library), Đền Thăng Thiên (Temple of Ascension), Pha Lê Cộng Hưởng (Resonating Crystal), Quán Rượu Quý Tộc (The Noble Tavern) và Trại Linh Thú (Beast Grounds).'}
                  {ranhornModal === 'crystal' &&
                    '5 Anh Hùng có cấp độ cao nhất đứng trên Ngôi Sao Năm Cánh (Pentagram). Mọi Anh Hùng trong các ô Pha Lê bên dưới sẽ tự động kế thừa cấp độ thấp nhất của 5 Tướng Thủ Lĩnh.'}
                  {ranhornModal === 'temple' &&
                    'Đền Thăng Thiên (Smart Ascend) hợp nhất các bản sao Anh Hùng cùng Hệ Tộc để đột phá từ Rare+ ➔ Elite+ ➔ Legendary+ ➔ Mythic+ ➔ Ascended 5 Sao.'}
                  {ranhornModal === 'library' &&
                    'Thư Viện Liên Kết (Unions) kích hoạt cộng hưởng cốt truyện giữa các bộ 3 Anh Hùng (ví dụ: The Gallant Three), cộng trực tiếp HP+10%, ATK+5%, DEF+10% cho toàn đội.'}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      state.autoUpgradeSquad();
                      setRanhornModal(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-b from-[#67e8f9] to-[#0284c7] text-[#041019] font-extrabold text-xs cursor-pointer shadow"
                  >
                    Smart Ascend &amp; Đồng Bộ Cấp Độ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRanhornModal(null);
                      state.setActiveScreen('collection');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#8c6239] text-amber-100 font-extrabold text-xs cursor-pointer"
                  >
                    Mở Túi Tướng ({HERO_ROSTER.length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. PRE-BATTLE 5V5 VS FORMATION SCREEN (Exact match to screenshots eb998d40 & f222d810!)
// ============================================================================
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

  const currentStage = getCampaignStage(state.currentStageId);
  const teamPower = computeTeamPower(state.formation, state.ownedHeroes);
  const allyAura = computeFactionAura(state.formation);
  const enemyAura = computeFactionAura(
    currentStage.enemies.map((e) => e.heroId)
  );

  const ownedList = HERO_ROSTER.filter((h) => {
    if (!state.ownedHeroes[h.id]) return false;
    if (factionFilter !== 'All' && getHeroRepoFaction(h) !== factionFilter) {
      return false;
    }
    return true;
  });

  const renderRuneSlot = (slotIdx: number) => {
    const heroId = state.formation[slotIdx];
    const hero = heroId ? getHeroById(heroId) : null;
    const owned = heroId ? state.ownedHeroes[heroId] : undefined;
    const stats = hero && owned ? computeHeroStats(hero, owned) : null;
    const isSelected = selectedSlotIdx === slotIdx;
    const facMeta = hero
      ? REPO_FACTION_METADATA[getHeroRepoFaction(hero)]
      : null;

    return (
      <div
        key={slotIdx}
        data-testid={`formation-slot-${slotIdx}`}
        draggable={Boolean(heroId)}
        onDragStart={() => {
          setDraggedSlotIdx(slotIdx);
          setDraggedHeroId(heroId);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => {
          if (draggedSlotIdx !== null && draggedSlotIdx !== slotIdx) {
            state.swapFormationSlots(draggedSlotIdx, slotIdx);
          } else if (draggedHeroId) {
            state.assignHeroToSlot(draggedHeroId, slotIdx);
          }
          setDraggedSlotIdx(null);
          setDraggedHeroId(null);
        }}
        onClick={() => setSelectedSlotIdx(slotIdx)}
        className={`relative flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all cursor-pointer select-none ${
          isSelected
            ? 'bg-[#3d2516]/95 border-[#fde047] shadow-[0_0_18px_rgba(253,224,71,0.5)]'
            : 'bg-[#23140b]/85 border-[#9c723c]/70 hover:border-[#fde047]'
        }`}
      >
        <div className="flex items-center justify-between w-full mb-1">
          <span className="text-[9px] font-mono font-bold text-[#e5cba0]">
            {slotIdx < 2 ? `Tiền Tuyến #${slotIdx + 1}` : `Hậu Phương #${slotIdx + 1}`}
          </span>
          {heroId && (
            <button
              type="button"
              aria-label={`Rút tướng vị trí ${slotIdx + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                state.removeHeroFromSlot(slotIdx);
              }}
              className="text-[9px] px-1 rounded bg-red-950/90 text-rose-300 hover:bg-red-800 cursor-pointer"
            >
              Rút
            </button>
          )}
        </div>

        {hero && owned && stats ? (
          <div className="flex items-center gap-2 w-full">
            <div className="relative shrink-0">
              <HeroAvatarSvg hero={hero} size="sm" variant="framed" />
              {/* Glowing Purple Rune Pedestal Effect */}
              <span className="absolute -bottom-1 inset-x-1 h-1.5 rounded-full bg-purple-500/60 blur-[1px]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-extrabold text-[#fff2d1] truncate">
                {hero.name}
              </div>
              {/* Authentic AFK Arena Faction Badge + Level/Power Pill under Hero (eb998d40 & f222d810) */}
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#140b05] border border-[#8c6430] mt-0.5">
                {facMeta && (
                  <img
                    src={facMeta.icon}
                    alt={facMeta.label}
                    className="w-3.5 h-3.5 object-contain"
                  />
                )}
                <span className="text-[10px] font-mono font-extrabold text-[#fde047]">
                  Lvl {owned.level} · {stats.combatPower.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-11 w-full flex items-center justify-center text-[10px] text-[#c7a97e] border border-dashed border-[#8c6430] rounded-lg">
            + Chọn Tướng Ô #{slotIdx + 1}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      data-testid="screen-formation"
      className="w-full max-w-6xl mx-auto rounded-2xl border-4 border-[#6e4b26] shadow-[0_12px_50px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col bg-[#2b1a10]"
    >
      {/* UPPER HALF: BATTLEFIELD VS STAGE (Exact match to screenshots eb998d40 & f222d810) */}
      <div className="relative bg-gradient-to-b from-[#422518] via-[#593422] to-[#331d12] p-3.5 border-b-4 border-[#8c6430]">
        {/* Top VS Header Bar: Left Ally Faction Circle + 33K | Center Gold VS | Right Enemy Faction Circle + 30K */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#8c6430]/50">
          {/* Left: Ally Faction Aura Medallion Button */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              data-testid="btn-open-faction-aura"
              onClick={() => setShowFactionAuraModal(true)}
              title="Mở Bảng Khắc Chế Hệ Tộc & Hào Quang Đội Hình"
              className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#1e1209] hover:bg-[#331f10] border-2 border-[#fde047] cursor-pointer shadow-lg"
            >
              <img
                src={
                  allyAura.dominantFaction
                    ? REPO_FACTION_METADATA[allyAura.dominantFaction].icon
                    : '/assets/factions/wilder.png'
                }
                alt="Ally Faction Aura"
                className="w-7 h-7 object-contain"
              />
              <div className="text-left pr-1">
                <div className="text-[10px] font-extrabold text-[#fde047] uppercase flex items-center gap-1">
                  <span>Hào Quang Tộc</span>
                  <Info className="w-3 h-3" />
                </div>
                <div className="text-[10px] font-mono font-bold text-emerald-300">
                  +{Math.round(allyAura.atkBonusPct * 100)}% ATK · +
                  {Math.round(allyAura.hpBonusPct * 100)}% HP
                </div>
              </div>
            </button>

            <div className="flex items-center gap-1.5 bg-[#1a0f07]/90 px-3 py-1 rounded-full border border-[#a87e3b]">
              <span className="text-sm">✊</span>
              <span className="text-sm font-mono font-black text-[#fde047] tabular-nums">
                {teamPower.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Center: Iconic AFK Arena Gold VS Banner */}
          <div className="flex flex-col items-center">
            <span
              className="text-2xl sm:text-3xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#fff6c2] via-[#fde047] to-[#b45309] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              style={{ fontFamily: '"Cinzel", serif' }}
            >
              VS
            </span>
            <span className="text-[11px] font-extrabold text-[#f7d98c]">
              {currentStage.chapter} · {currentStage.name}
            </span>
          </div>

          {/* Right: Enemy Power & Faction Medallion */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-[#1a0f07]/90 px-3 py-1 rounded-full border border-[#a87e3b]">
              <span className="text-sm">✊</span>
              <span className="text-sm font-mono font-black text-rose-300 tabular-nums">
                {currentStage.recommendedPower.toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              data-testid="formation-swap-frontline-btn"
              onClick={() => state.swapFormationSlots(0, 1)}
              className="px-2.5 py-1.5 rounded-lg bg-[#26170b] hover:bg-[#382210] border border-[#a87e3b] text-[11px] font-bold text-[#fde047] cursor-pointer"
            >
              Đổi Tiền Tuyến (1↔2)
            </button>
          </div>
        </div>

        {/* 5v5 Battlefield Formation Runes: Left Ally (Backline 3,4,5 + Frontline 1,2) vs Right Enemy Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-3 items-center">
          {/* Ally Backline (Slots 3, 4, 5) */}
          <div className="lg:col-span-4 space-y-1.5">
            {[2, 3, 4].map((slotIdx) => renderRuneSlot(slotIdx))}
          </div>

          {/* Ally Frontline (Slots 1, 2) */}
          <div className="lg:col-span-4 space-y-2">
            {[0, 1].map((slotIdx) => renderRuneSlot(slotIdx))}
          </div>

          {/* Enemy Formation Preview on Purple Runes */}
          <div className="lg:col-span-4 bg-[#1d1109]/80 border border-[#8c6430]/60 rounded-xl p-2.5 space-y-1.5">
            <div className="text-[10px] font-extrabold uppercase text-rose-300 flex items-center justify-between">
              <span>Đội Hình Địch ({currentStage.chapter})</span>
              <span>{enemyAura.tierLabel}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {currentStage.enemies.map((en, i) => {
                const h = getHeroById(en.heroId);
                const fac = REPO_FACTION_METADATA[getHeroRepoFaction(h)];
                return (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#140b05] border border-[#5c3c1e]"
                  >
                    <HeroAvatarSvg hero={h} size="sm" />
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-[#fff2d1] truncate">
                        {h.name.split(' ')[0]}
                      </div>
                      <div className="flex items-center gap-1 text-[9px] font-mono text-[#fde047]">
                        {fac && (
                          <img
                            src={fac.icon}
                            alt=""
                            className="w-3 h-3 object-contain"
                          />
                        )}
                        <span>Lvl {en.level}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* LOWER HALF: AUTHENTIC AFK ARENA WARM PARCHMENT HERO DRAWER (#ebd6ad, Matching eb998d40 & f222d810!) */}
      <div className="bg-gradient-to-b from-[#f3e3c3] via-[#ead4aa] to-[#dec28f] p-3.5 text-[#3b2412] space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-extrabold text-[#4d2f14]">
            Chọn Tướng Vào Ô #{selectedSlotIdx + 1} (Bấm chọn Tướng để xuất trận · Kéo thả để đổi chỗ)
          </div>

          {/* Preset Save Bar */}
          <div className="flex flex-wrap items-center gap-1.5">
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Tên đội hình lưu..."
              aria-label="Tên đội hình lưu"
              className="px-2.5 py-1 rounded bg-[#fff8ea] border border-[#8c6430] text-xs text-[#3b2412] w-36"
            />
            <button
              type="button"
              data-testid="save-preset-btn"
              onClick={() => {
                state.saveTeamPreset(presetName);
                setPresetName('');
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#4a3019] text-[#fde047] text-xs font-bold cursor-pointer"
            >
              <Save className="w-3 h-3" />
              Formations
            </button>
            {state.savedPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => state.loadTeamPreset(preset.id)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-[#d9c093] hover:bg-[#c9ab78] border border-[#8c6430] text-[11px] font-bold text-[#3b2412] cursor-pointer"
              >
                <FolderOpen className="w-3 h-3" />
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* 5-to-8 Column Square Hero Portrait Grid with Green Checkmarks & HP Bars (Exact match to f222d810!) */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-[168px] overflow-y-auto pr-1">
          {ownedList.map((hero) => {
            const owned = state.ownedHeroes[hero.id];
            const currentSlot = state.formation.indexOf(hero.id);
            const isDeployed = currentSlot !== -1;
            const facMeta = REPO_FACTION_METADATA[getHeroRepoFaction(hero)];

            return (
              <button
                key={hero.id}
                type="button"
                data-testid={`formation-hero-pick-${hero.id}`}
                draggable
                onDragStart={() => {
                  setDraggedHeroId(hero.id);
                  setDraggedSlotIdx(null);
                }}
                onClick={() => state.assignHeroToSlot(hero.id, selectedSlotIdx)}
                className="group flex flex-col items-center cursor-pointer select-none"
              >
                <div
                  className={`relative w-full aspect-square rounded-lg p-1 border-2 flex items-center justify-center overflow-hidden shadow-md ${
                    isDeployed
                      ? 'bg-[#2c193d] border-[#9333ea] ring-2 ring-emerald-500'
                      : 'bg-[#36204a] border-[#9333ea] hover:border-[#fde047]'
                  }`}
                >
                  <HeroAvatarSvg hero={hero} size="md" />
                  {/* Top-left Faction Icon */}
                  {facMeta && (
                    <img
                      src={facMeta.icon}
                      alt={facMeta.label}
                      className="w-4 h-4 rounded-full bg-[#1a1109] border border-[#d4af37] absolute top-0.5 left-0.5 object-contain"
                    />
                  )}
                  {/* Top-right Level Text (f222d810) */}
                  <span className="absolute top-0.5 right-1 text-[10px] font-mono font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
                    Lvl {owned.level}
                  </span>
                  {/* Deployed Green Checkmark Overlay (eb998d40 & f222d810) */}
                  {isDeployed && (
                    <span className="absolute inset-0 bg-black/45 flex items-center justify-center">
                      <Check className="w-8 h-8 text-[#4ade80] stroke-[3.5] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" />
                    </span>
                  )}
                </div>
                {/* Green HP Bar underneath portrait (f222d810) */}
                <div className="w-full h-1.5 bg-[#3b2412] rounded-full overflow-hidden mt-1">
                  <div className="h-full w-full bg-gradient-to-r from-[#22c55e] to-[#86efac]" />
                </div>
                <span className="text-[10px] font-bold text-[#3b2412] truncate w-full text-center mt-0.5">
                  {hero.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Authentic AFK Arena Dark-Bronze Circular Faction Filter Bar + Bottom Glowing Cyan Battle Button */}
        <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Dark Bronze Pill with Circular Faction Icons */}
          <div className="flex items-center gap-1.5 bg-[#2b1b0e] border-2 border-[#8c6430] rounded-full px-2.5 py-1 overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setFactionFilter('All')}
              className={`w-7 h-7 rounded-full border-2 text-[10px] font-black flex items-center justify-center shrink-0 cursor-pointer ${
                factionFilter === 'All'
                  ? 'bg-[#d4af37] text-[#1e1209] border-[#fef08a]'
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
                  onClick={() =>
                    setFactionFilter(active ? 'All' : facKey)
                  }
                  title={`${meta.label} (${meta.viLabel})`}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-transform ${
                    active
                      ? 'bg-[#3d2614] border-[#fde047] scale-110 shadow-[0_0_10px_rgba(253,224,71,0.6)]'
                      : 'bg-[#1a0f07] border-[#6e4b26] opacity-85 hover:opacity-100'
                  }`}
                >
                  <img
                    src={meta.icon}
                    alt={meta.label}
                    className="w-5 h-5 object-contain"
                  />
                </button>
              );
            })}
          </div>

          {/* Bottom Action Row: Back Arrow + Glowing Cyan Hexagonal Battle Button (eb998d40 & f222d810) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCloseToBattle}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-b from-[#6e4b26] to-[#3d2714] border-2 border-[#b8893e] text-[#fde047] font-bold text-xs flex items-center gap-1 cursor-pointer shadow"
            >
              <CornerUpLeft className="w-4 h-4" />
              Quay Lại
            </button>

            <button
              type="button"
              onClick={onCloseToBattle}
              className="px-10 py-2.5 rounded-2xl bg-gradient-to-b from-[#7ef3ff] via-[#22d3ee] to-[#0284c7] hover:brightness-110 text-[#041624] font-black text-sm uppercase tracking-wider border-2 border-[#cffafe] shadow-[0_0_24px_rgba(34,211,238,0.65)] cursor-pointer"
            >
              Battle · Xuất Trận
            </button>
          </div>
        </div>
      </div>

      {/* Authentic AFK Arena Faction Advantage & Aura Popup Modal (matching screenshot dbcb90b6) */}
      {showFactionAuraModal && (
        <div
          role="dialog"
          aria-label="Bảng Khắc Chế Hệ Tộc & Hào Quang Đội Hình"
          data-testid="faction-aura-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
        >
          <div className="w-full max-w-3xl bg-[#1a1410] border-2 border-[#d4af37] rounded-2xl p-4 shadow-2xl text-amber-100 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
              <h3
                className="text-base font-extrabold text-[#fde047] uppercase"
                style={{ fontFamily: '"Cinzel", serif' }}
              >
                Faction Advantage — Khắc Chế Hệ Tộc &amp; Hào Quang Đội Hình
              </h3>
              <button
                type="button"
                onClick={() => setShowFactionAuraModal(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-5 flex justify-center">
                <img
                  src="/assets/aistudio/dbcb90b6-2348-11ef-85c2-02420a000190_64a07731.webp"
                  alt="AFK Arena Faction Advantage Rules"
                  className="max-h-[380px] rounded-xl border-2 border-[#c69d53] object-contain"
                />
              </div>

              <div className="md:col-span-7 space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#2a1b10] border border-amber-400/50">
                  <div className="text-[#fde047] font-extrabold uppercase">
                    Trạng Thái Đội Hình Hiện Tại: {allyAura.tierLabel}
                  </div>
                  <div className="text-emerald-300 font-mono mt-1">
                    ATK +{Math.round(allyAura.atkBonusPct * 100)}% · HP +
                    {Math.round(allyAura.hpBonusPct * 100)}% · DEF +
                    {Math.round(allyAura.defBonusPct * 100)}% · Crit +
                    {Math.round(allyAura.critBonusPct * 100)}%
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#24170e] border border-[#6e4b26] space-y-1.5">
                  <div className="font-bold text-amber-300">
                    1. Vòng Khắc Chế Hệ Tộc (+25% Sát Thương):
                  </div>
                  <p className="text-amber-100/90">
                    <strong>Lightbearer (Ánh Sáng)</strong> ➔ khắc{' '}
                    <strong>Mauler (Dã Thú)</strong> ➔ khắc{' '}
                    <strong>Wilder (Rừng Già)</strong> ➔ khắc{' '}
                    <strong>Graveborn (Vong Linh)</strong> ➔ khắc{' '}
                    <strong>Lightbearer</strong>. <strong>Celestial ↔ Hypogean</strong> và{' '}
                    <strong>Draconis ↔ Draconis</strong> gây thêm{' '}
                    <strong>+25% sát thương</strong> lên nhau.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#24170e] border border-[#6e4b26] space-y-1">
                  <div className="font-bold text-amber-300">
                    2. Hào Quang Xuất Trận Cùng Hệ (Formation Bonus):
                  </div>
                  <ul className="list-disc pl-4 text-amber-100/90 space-y-0.5">
                    <li>
                      3 Tướng cùng Hệ: <strong>Tấn Công +10%, Máu +10%</strong>
                    </li>
                    <li>
                      3 Tướng cùng Hệ + 2 Tướng Hệ khác:{' '}
                      <strong>Tấn Công +15%, Máu +15%</strong>
                    </li>
                    <li>
                      4 Tướng cùng Hệ: <strong>Tấn Công +15%, Máu +20%</strong>
                    </li>
                    <li>
                      5 Tướng cùng Hệ: <strong>Tấn Công +25%, Máu +25%</strong>
                    </li>
                    <li>
                      <strong>Thần Tộc (Celestial):</strong> Được tính như bất kỳ Hệ nào (trừ Ác Ma) để ghép đủ mốc 3/4/5!
                    </li>
                    <li>
                      <strong>Ác Ma (Hypogean):</strong> 1+ (+30% Thủ), 2+ (+25% Nộ khi nhận đòn), 3+ (+15% Chí Mạng, +30% Sát Thương Chí Mạng).
                    </li>
                    <li>
                      <strong>Long Tộc (Draconis):</strong> Mỗi Tướng Long Tộc cộng thêm <strong>+2% Công, +2% Máu</strong> cho toàn đội.
                    </li>
                  </ul>
                </div>
              </div>
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
          {/* Top Resonating Crystal Header Bar (Matching 02_roster_early.png & 18_roster_late.jpg) */}
          <div className="px-2.5 pt-2 pb-1.5 border-b border-[#b8945e] space-y-1.5 bg-[#edd4a4]/90">
            <div className="flex items-center justify-between gap-1">
              {/* Left: Golden Winged Shield 150 + Cấp Đấu Trường: 150 */}
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#fde047] via-[#d97706] to-[#78350f] border-2 border-[#fef08a] flex items-center justify-center text-[11px] font-mono font-black text-[#241407] shadow z-10">
                  150
                </div>
                <div className="-ml-2 pl-3 pr-2.5 py-0.5 rounded-r-full bg-[#6e4f2d] border border-[#a88252] text-[11px] font-extrabold text-[#fff5dc] shadow-inner">
                  Cấp Đấu Trường: 150
                </div>
              </div>

              {/* Right: Resonating Crystal ⬆️ + Hero Capacity 185/400 [+] + Sort ⇅ */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  data-testid="collection-auto-upgrade-btn"
                  onClick={() => state.autoUpgradeSquad()}
                  title="Pha Lê Cộng Hưởng · Tự động đồng bộ cấp độ"
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
                  title="Mở Chi Tiết Tướng (Hero Sanctuary)"
                  className="px-2 py-1 rounded bg-[#6e4f2d] hover:bg-[#593e22] border border-[#a88252] text-[10px] font-extrabold text-[#fde047] cursor-pointer"
                >
                  Chi Tiết ⇅
                </button>
              </div>
            </div>

            {/* Companions Reference Feature Bar: Search + Beast Select (06) + Duo Co-op (14-16) + Guild Screw Item (17) */}
            <div className="flex flex-wrap items-center justify-between gap-1">
              <div className="relative flex-1 min-w-[120px]">
                <Search className="w-3 h-3 text-[#7c562b] absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm tướng (Medusa, Athena, Dracula, Rem...)"
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
                <span>Linh Thú</span>
              </button>

              <button
                type="button"
                data-testid="btn-open-duo-modal"
                onClick={() => setShowDuoSettingsModal(true)}
                className="px-2 py-0.5 rounded bg-[#4a3019] border border-[#b8893e] text-[10px] font-extrabold text-amber-200 cursor-pointer"
              >
                Tổ Đội Co-op
              </button>

              <button
                type="button"
                data-testid="btn-open-item-tooltip"
                onClick={() =>
                  setInspectedItemModal({
                    name: 'Đinh Ốc Chiến Xa Công Hội',
                    cnName: '公会战车螺钉',
                    category: 'Vật Phẩm Hoạt Động',
                    count: 880,
                    badgeText: '880',
                    desc: 'Dùng để sửa chữa Chiến Xa Công Hội, nộp để tăng tiến độ tu sửa và nhận thưởng Công Hội.',
                  })
                }
                className="px-2 py-0.5 rounded bg-[#581c87] border border-[#c084fc] text-[10px] font-extrabold text-purple-100 cursor-pointer"
              >
                🔩 Đinh Ốc x880
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
                    ? `Tất Cả (${filteredRoster.length})`
                    : CLASS_METADATA[cls].viLabel}
                </button>
              ))}
            </div>
          </div>

          {/* CENTER: STRICTLY 5-COLUMN HERO PORTRAIT GRID (Exact match to 02_roster_early.png, 07-13, 18_roster_late.jpg) */}
          <div className="px-2.5 py-2 flex-1 min-h-0 overflow-y-auto">
            {rosterSubTab !== 'portraits' ? (
              <div
                data-testid="companions-5col-grid"
                className="grid grid-cols-5 gap-2"
              >
                {filteredRoster.map((hero) => {
                  const owned = state.ownedHeroes[hero.id];
                  const isSelected = hero.id === selectedHero.id;
                  const slotIdx = state.formation.indexOf(hero.id);
                  const facMeta =
                    REPO_FACTION_METADATA[getHeroRepoFaction(hero)];
                  const stars = owned?.stars ?? 1;
                  const level = owned?.level ?? 1;
                  const cardStyle = getCompanionsCardStyle(hero.rarity, stars);
                  const canNotify = Boolean(owned && state.gold >= 500);

                  return (
                    <button
                      key={hero.id}
                      type="button"
                      data-testid={`hero-card-${hero.id}`}
                      onClick={() => {
                        state.setSelectedHeroId(hero.id);
                        setViewMode('detail');
                      }}
                      className={`group relative flex flex-col items-center cursor-pointer select-none transition-transform ${
                        isSelected ? 'scale-105 z-10' : 'hover:scale-102'
                      }`}
                    >
                      {/* Authentic Companions Asymmetric Cut-Corner Portrait Frame (03_hero_icons_medusa_athena.png & 18_roster_late.jpg) */}
                      <div
                        className={`relative w-full aspect-square rounded-tl-[6px] rounded-tr-[6px] rounded-bl-[6px] rounded-br-[18px] border-[2.5px] ${cardStyle.frameClass} flex items-center justify-center overflow-hidden shadow-[0_3px_6px_rgba(61,39,24,0.45)] ${
                          isSelected ? 'ring-2 ring-[#fde047]' : ''
                        }`}
                      >
                        <HeroAvatarSvg hero={hero} size="full" />

                        {/* Top-Left Faction Medallion (with Silver Wings for Ascended matching 18_roster_late.jpg) */}
                        {facMeta && (
                          <div
                            className={`absolute top-0.5 left-0.5 z-10 flex items-center justify-center rounded-full ${
                              cardStyle.isAscendedWinged
                                ? 'w-5 h-5 bg-gradient-to-b from-white via-slate-200 to-amber-300 p-0.5 shadow'
                                : 'w-4 h-4 bg-[#1a1109] border border-[#d4af37]'
                            }`}
                          >
                            <img
                              src={facMeta.icon}
                              alt={facMeta.label}
                              className="w-3.5 h-3.5 object-contain"
                            />
                          </div>
                        )}

                        {/* Top-Right Level Label (e.g. 230级 / 80级 matching 02_roster_early.png & 18_roster_late.jpg) */}
                        <span className="absolute top-0.5 right-1.5 text-[10px] font-mono font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.98)] z-10">
                          {level}级
                        </span>

                        {/* Top-Right Red Exclamation Notification Dot (03_hero_icons_medusa_athena.png) */}
                        {canNotify && (
                          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-gradient-to-b from-[#ff5a36] to-[#d9230f] border border-[#ffd8a8] text-[8px] font-black text-white flex items-center justify-center shadow z-20">
                            !
                          </span>
                        )}

                        {/* Bottom Gold Stars Row (18_roster_late.jpg) */}
                        <div className="absolute bottom-0.5 inset-x-0 flex items-center justify-center gap-0.2 z-10 bg-gradient-to-t from-black/70 to-transparent pt-1">
                          {Array.from({ length: Math.min(5, stars) }).map(
                            (_, i) => (
                              <span
                                key={i}
                                className="text-[8px] text-[#fde047] drop-shadow-[0_1px_1px_rgba(0,0,0,0.95)] leading-none"
                              >
                                ★
                              </span>
                            )
                          )}
                        </div>

                        {/* Deployed Green Checkmark Badge */}
                        {slotIdx !== -1 && (
                          <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white flex items-center justify-center z-20">
                            <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
                          </span>
                        )}

                        {/* Locked Padlock Overlay */}
                        {!owned && (
                          <div className="absolute inset-0 bg-black/55 flex items-center justify-center z-10">
                            <Lock className="w-3.5 h-3.5 text-amber-200" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* ĐỒ GIÁM (图鉴) PORTRAITS MODE */
              <div className="grid grid-cols-5 gap-2">
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
                      className={`relative aspect-[1/1.65] rounded-t-lg rounded-b-xl border-2 border-[#7c562b] bg-gradient-to-b from-[#3d2817] to-[#170d06] p-1 flex flex-col items-center justify-between overflow-hidden shadow cursor-pointer ${
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
                        className="w-full flex-1 object-cover rounded"
                      />
                      <span className="text-[8px] font-bold text-[#f7d98c] truncate w-full text-center mt-0.5">
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
                  Lv.{selectedOwned?.level ?? 1}
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
                      ? '⚔️VK'
                      : slot === 'armor'
                        ? '🛡️Giáp'
                        : '👑TV'}{' '}
                    B{selectedOwned.equipment[slot]}
                  </button>
                ))}
                <button
                  type="button"
                  data-testid="btn-level-up-hero"
                  onClick={() => state.levelUpHero(selectedHero.id)}
                  className="px-2 py-0.5 rounded bg-gradient-to-b from-[#7ef3ff] to-[#0284c7] text-[#041624] font-black text-[9px] cursor-pointer"
                >
                  Tăng Cấp ({levelCost.gold.toLocaleString()}G)
                </button>
                <button
                  type="button"
                  data-testid="btn-ascend-hero"
                  onClick={() => state.ascendHeroStar(selectedHero.id)}
                  className="px-2 py-0.5 rounded bg-gradient-to-b from-[#fde047] to-[#ca8a04] text-[#241407] font-black text-[9px] cursor-pointer"
                >
                  Tiến Hóa ({selectedOwned.copies}/{selectedOwned.stars * 2})
                </button>
              </div>
            ) : (
              <button
                type="button"
                data-testid="btn-recruit-direct"
                onClick={() => state.recruitHeroDirect(selectedHero.id)}
                className="px-2.5 py-0.5 rounded bg-gradient-to-b from-[#7ef3ff] to-[#0284c7] text-[#041624] font-black text-[10px] cursor-pointer"
              >
                Chiêu Mộ Ngay
              </button>
            )}
          </div>

          {/* Sticky Dark-Brown Circular Faction Filter Bar + 4 Carved Sub-Tabs (Exact match to 07-13 & 18_roster_late.jpg) */}
          <div className="px-2 pt-1.5 pb-1 bg-[#d5b47f] border-t-2 border-[#a88252] space-y-1.5">
            {/* Dark Brown Pill with Collapse Chevron ⌃ + 全部 (Tất Cả) + 8 Circular Faction Icons */}
            <div className="flex items-center gap-1 bg-[#382415] border-2 border-[#8c6430] rounded-full px-2 py-1 overflow-x-auto shadow-inner">
              <span className="w-5 h-5 rounded-full bg-[#241509] border border-[#8c6430] text-[#e5cba0] text-[10px] flex items-center justify-center shrink-0">
                ⌃
              </span>
              <button
                type="button"
                onClick={() => setFactionFilter('All')}
                className={`px-2 h-6 rounded-full border text-[10px] font-black flex items-center justify-center shrink-0 cursor-pointer ${
                  factionFilter === 'All'
                    ? 'bg-gradient-to-b from-[#f5d061] to-[#b8862d] text-[#241407] border-[#fef08a]'
                    : 'bg-[#1f1208] text-[#e5cba0] border-[#6e4b26]'
                }`}
              >
                Tất Cả
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

            {/* 4 Carved Wooden Sub-Tabs: 编队 (Đội Hình) | 热度 (Độ Nóng) | 英雄 (Anh Hùng) | 图鉴 (Đồ Giám) (Exact match to 18_roster_late.jpg) */}
            <div className="grid grid-cols-4 gap-1">
              <button
                type="button"
                onClick={() => state.setActiveScreen('formation')}
                className="py-1 rounded-t-lg bg-[#4a3019] border border-[#8c6430] text-[#d8be94] hover:text-[#fde047] text-[10px] font-extrabold cursor-pointer"
              >
                Đội Hình (编队)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRosterSubTab('popularity');
                  setViewMode('detail');
                }}
                className="py-1 rounded-t-lg bg-[#4a3019] border border-[#8c6430] text-[#d8be94] hover:text-[#fde047] text-[10px] font-extrabold cursor-pointer"
              >
                Độ Nóng (热度)
              </button>
              <button
                type="button"
                onClick={() => setRosterSubTab('heroes')}
                className={`py-1 rounded-t-lg border-2 text-[10px] font-black cursor-pointer ${
                  rosterSubTab !== 'portraits'
                    ? 'bg-gradient-to-b from-[#f3deb1] to-[#d6b272] border-[#fde047] text-[#3b2412] shadow'
                    : 'bg-[#4a3019] border-[#8c6430] text-[#d8be94]'
                }`}
              >
                Anh Hùng (英雄)
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
                <span>Đồ Giám (图鉴)</span>
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 text-white text-[7px] flex items-center justify-center absolute -top-1 right-1">
                  !
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 2: FULL-SCREEN HERO DETAIL & SKILL REVEAL SANCTUARY
          (Exact match to 04_hero_detail_medusa.png, 05_hero_detail_athena.png, 01_hero_reveal_dracula.jpg)
         ===================================================================== */}
      {viewMode === 'detail' && (
        <div
          data-testid="companions-hero-detail-view"
          className={`relative z-10 flex-1 min-h-0 bg-gradient-to-b ${sanctuaryBgClass} text-[#fff3d6] flex flex-col justify-between p-2.5 overflow-y-auto`}
        >
          {/* Enchanted Forest & Floating Crystal Sanctuary Backdrop SVG (Matching 04_hero_detail_medusa.png & 05_hero_detail_athena.png) */}
          <svg
            viewBox="0 0 450 560"
            className="absolute inset-0 w-full h-full pointer-events-none opacity-45"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <radialGradient id="sanctuaryCrystalGlow" cx="50%" cy="28%" r="48%">
                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.65" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="sanctuaryFloorRing" cx="50%" cy="74%" r="36%">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.4" />
                <stop offset="70%" stopColor="#0284c7" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="225" cy="150" r="190" fill="url(#sanctuaryCrystalGlow)" />
            <polygon
              points="225,35 280,125 245,220 195,205 170,115"
              fill="#a855f7"
              fillOpacity="0.28"
              stroke="#e9d5ff"
              strokeWidth="1.5"
            />
            <ellipse cx="225" cy="405" rx="145" ry="48" fill="url(#sanctuaryFloorRing)" />
            <ellipse
              cx="225"
              cy="405"
              rx="125"
              ry="36"
              fill="none"
              stroke="#38bdf8"
              strokeOpacity="0.35"
              strokeWidth="2"
              strokeDasharray="8 6"
            />
          </svg>
          {/* TOP BAR: Left Diamond Buttons (故事 Story + 热度 Popularity) | Center Rarity Gem Crest + Title + Name | Right Diamond Buttons (发送 Share + 🔒 Lock) */}
          <div className="flex items-start justify-between gap-1">
            {/* Top-Left Diamond Buttons (04_hero_detail_medusa.png) */}
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
                  Cốt Truyện
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowDuoSettingsModal(true)}
                className="px-2 py-1 rounded-lg bg-[#3b2512]/90 hover:bg-[#59381c] border border-[#d4af37] flex flex-col items-center cursor-pointer shadow"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[9px] font-extrabold text-[#fff2d1]">
                  Độ Nóng
                </span>
              </button>
            </div>

            {/* Top-Center: Ornate Diamond Rarity Gem Crest + Rarity Title + Hero Title + Hero Name (04_hero_detail_medusa.png) */}
            <div className="flex flex-col items-center text-center">
              <div className="w-9 h-9 rotate-45 rounded-md bg-gradient-to-br from-[#6e4826] to-[#2b1a0c] border-2 border-[#fde047] flex items-center justify-center shadow-[0_0_16px_rgba(239,68,68,0.65)]">
                <div
                  className={`w-5 h-5 rounded-sm ${
                    selectedHero.rarity === 'Ascended'
                      ? 'bg-gradient-to-br from-rose-400 via-red-600 to-amber-500'
                      : 'bg-gradient-to-br from-purple-400 to-indigo-700'
                  } border border-white/80`}
                />
              </div>
              <span className="mt-1 text-[10px] font-black tracking-widest uppercase text-rose-400 drop-shadow">
                {selectedHero.rarity === 'Ascended' ? 'Truyền Thuyết · 传说' : 'Sử Thi · 史诗'}
              </span>
              <span className="text-[10px] font-bold text-[#fef08a] drop-shadow">
                {selectedHero.title}
              </span>
              <h3
                className="text-base font-black text-rose-400 tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
                style={{ fontFamily: '"Cinzel", serif' }}
              >
                {selectedHero.name}
              </h3>
            </div>

            {/* Top-Right Diamond Buttons: Share (发送) + Lock (🔒) (04_hero_detail_medusa.png) */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSanctuaryTab('skills')}
                className="px-2 py-1 rounded-lg bg-[#3b2512]/90 hover:bg-[#59381c] border border-[#d4af37] flex flex-col items-center cursor-pointer shadow"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#f5d061]" />
                <span className="text-[9px] font-extrabold text-[#fff2d1]">
                  Chia Sẻ
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
                  {isHeroLocked ? 'Đã Khóa' : 'Khóa'}
                </span>
              </button>
            </div>
          </div>

          {/* CENTER STAGE: 6 CUT-CORNER EQUIPMENT SLOTS (04_hero_detail_medusa.png) OR 4 SKILL MEDALLIONS (01_hero_reveal_dracula.jpg) */}
          {sanctuaryTab === 'story' ? (
            <div className="my-1 p-3 rounded-xl bg-gradient-to-b from-[#f3deb1] to-[#d5b47f] border-3 border-[#7c562b] text-[#3b2412] shadow-2xl space-y-2">
              <div className="flex items-center justify-between border-b border-[#9c723c] pb-1">
                <div>
                  <div className="text-[10px] font-bold uppercase text-[#7c5121]">
                    {selectedHero.title}
                  </div>
                  <h4 className="text-sm font-black text-[#3b2412]">
                    Biên Niên Sử Anh Hùng — {selectedHero.name}
                  </h4>
                </div>
                <HeroAvatarSvg hero={selectedHero} size="sm" variant="framed" />
              </div>
              <p className="text-xs leading-relaxed text-[#4d2f14] italic">
                &ldquo;{selectedHero.lore}&rdquo;
              </p>
            </div>
          ) : (
            <div className="relative my-1 flex-1 flex flex-col items-center justify-center min-h-[210px]">
              {/* Left & Right Diamond Hero-Cycle Arrows (< and > matching 04_hero_detail_medusa.png) */}
              <button
                type="button"
                onClick={() => handleCycleHero(-1)}
                title="Tướng trước"
                className="absolute left-1 bottom-3 z-20 w-7 h-7 rotate-45 bg-[#3b2512] hover:bg-[#59381c] border-2 border-[#fde047] flex items-center justify-center cursor-pointer shadow-lg"
              >
                <ChevronLeft className="w-4 h-4 -rotate-45 text-[#fde047]" />
              </button>
              <button
                type="button"
                onClick={() => handleCycleHero(1)}
                title="Tướng tiếp theo"
                className="absolute right-1 bottom-3 z-20 w-7 h-7 rotate-45 bg-[#3b2512] hover:bg-[#59381c] border-2 border-[#fde047] flex items-center justify-center cursor-pointer shadow-lg"
              >
                <ChevronRight className="w-4 h-4 -rotate-45 text-[#fde047]" />
              </button>

              {sanctuaryTab === 'gear' ? (
                /* 6 EQUIPMENT SLOTS FLANKING STANDING CHARACTER (Exact match to 04_hero_detail_medusa.png & 05_hero_detail_athena.png) */
                <div className="w-full grid grid-cols-12 items-center gap-1 px-1">
                  {/* Left 3 Equipment Slots: Vũ Khí, Mũ Giáp, Phù Chú */}
                  <div className="col-span-3 flex flex-col items-center gap-2">
                    <button
                      type="button"
                      data-testid="upgrade-eq-weapon"
                      onClick={() =>
                        selectedOwned &&
                        state.upgradeEquipment(selectedHero.id, 'weapon')
                      }
                      className="relative w-14 h-14 rounded-tl-md rounded-tr-md rounded-bl-md rounded-br-xl bg-gradient-to-b from-[#312e81] to-[#1e1b4b] border-2 border-[#a855f7] flex flex-col items-center justify-center cursor-pointer shadow-lg"
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-[#1a1109] border border-[#d4af37] text-[8px] flex items-center justify-center absolute top-0.5 left-0.5">
                        ⚔️
                      </span>
                      <Sword className="w-6 h-6 text-sky-200" />
                      <span className="text-[8px] font-mono font-bold text-[#fde047]">
                        Bậc {selectedOwned?.equipment.weapon ?? 1}
                      </span>
                    </button>

                    <button
                      type="button"
                      data-testid="upgrade-eq-relic"
                      onClick={() =>
                        selectedOwned &&
                        state.upgradeEquipment(selectedHero.id, 'relic')
                      }
                      className="relative w-14 h-14 rounded-tl-md rounded-tr-md rounded-bl-md rounded-br-xl bg-gradient-to-b from-[#7f1d1d] to-[#450a0a] border-2 border-[#ef4444] flex flex-col items-center justify-center cursor-pointer shadow-lg"
                    >
                      <img
                        src={selectedFactionMeta.icon}
                        alt=""
                        className="w-3.5 h-3.5 rounded-full bg-[#1a1109] border border-[#d4af37] absolute top-0.5 left-0.5 object-contain"
                      />
                      <Shield className="w-6 h-6 text-amber-200" />
                      <span className="text-[8px] font-mono font-bold text-[#fde047]">
                        Bậc {selectedOwned?.equipment.relic ?? 1}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setInspectedItemModal({
                          name: 'Roi Xà Nữ Huyền Bí',
                          cnName: '蛇发魔鞭',
                          category: 'Trang Bị Độc Quyền',
                          count: 1,
                          badgeText: 'Lv.80',
                          desc: 'Tăng +18% Tấn Công và +12% Chính Xác cho tướng sở hữu trong Chiến Dịch và Đấu Trường.',
                        })
                      }
                      className="relative w-14 h-14 rounded-tl-md rounded-tr-md rounded-bl-md rounded-br-xl bg-gradient-to-b from-[#4c1d95] to-[#1e1b4b] border-2 border-[#a855f7] flex flex-col items-center justify-center cursor-pointer shadow-lg"
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-red-600 text-white text-[8px] font-black flex items-center justify-center absolute -top-1 -right-1">
                        !
                      </span>
                      <Sparkles className="w-6 h-6 text-purple-300" />
                      <span className="text-[8px] font-mono font-bold text-purple-200">
                        Cổ Vật
                      </span>
                    </button>
                  </div>

                  {/* Center Standing Full-Body Character Art */}
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

                  {/* Right 3 Equipment Slots: Giáp Ngực, Giày Chiến, Ô Trống La Bàn (04_hero_detail_medusa.png) */}
                  <div className="col-span-3 flex flex-col items-center gap-2">
                    <button
                      type="button"
                      data-testid="upgrade-eq-armor"
                      onClick={() =>
                        selectedOwned &&
                        state.upgradeEquipment(selectedHero.id, 'armor')
                      }
                      className="relative w-14 h-14 rounded-tl-md rounded-tr-md rounded-bl-md rounded-br-xl bg-gradient-to-b from-[#1e3a8a] to-[#0f172a] border-2 border-[#38bdf8] flex flex-col items-center justify-center cursor-pointer shadow-lg"
                    >
                      <Shield className="w-6 h-6 text-sky-200" />
                      <span className="text-[8px] font-mono font-bold text-[#fde047]">
                        Bậc {selectedOwned?.equipment.armor ?? 1}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        selectedOwned &&
                        state.upgradeEquipment(selectedHero.id, 'armor')
                      }
                      className="relative w-14 h-14 rounded-tl-md rounded-tr-md rounded-bl-md rounded-br-xl bg-gradient-to-b from-[#1e3a8a] to-[#0f172a] border-2 border-[#38bdf8] flex flex-col items-center justify-center cursor-pointer shadow-lg"
                    >
                      <Zap className="w-6 h-6 text-amber-200" />
                      <span className="text-[8px] font-mono font-bold text-sky-200">
                        Giày Chiến
                      </span>
                    </button>

                    {/* Empty Cut-Corner Slot with Compass Watermark (Exact match to 04_hero_detail_medusa.png & 05_hero_detail_athena.png) */}
                    <button
                      type="button"
                      onClick={() => setShowBeastModal(true)}
                      title="Ô Thần Khí / Linh Thú"
                      className="relative w-14 h-14 rounded-tl-md rounded-tr-md rounded-bl-md rounded-br-xl bg-[#24160c]/85 border-2 border-[#6e4b26] flex flex-col items-center justify-center cursor-pointer shadow-inner"
                    >
                      <span className="text-lg text-[#6e4b26]">✦</span>
                      <span className="text-[8px] text-[#a88252]">Thần Khí</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* SKILLS / HERO REVEAL VIEW (Exact match to 01_hero_reveal_dracula.jpg: 新英雄 + 4 Circular Red/Gold Skill Medallions + Parchment Scroll Banner) */
                <div className="w-full flex flex-col items-center gap-1.5 px-1">
                  <div className="w-full flex items-center justify-end pr-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#fef08a] via-[#fde047] to-[#f59e0b] text-[#241407] font-black text-xs shadow-[0_0_14px_rgba(253,224,71,0.8)]">
                      ✨ Tân Anh Hùng · 新英雄
                    </span>
                  </div>

                  <div className="w-full grid grid-cols-12 items-center gap-1">
                    {/* Left 2 Circular Skill Medallions (必杀技 Ultimate + Active) */}
                    <div className="col-span-3 flex flex-col items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveSkillSlot('ultimate')}
                        className={`flex flex-col items-center cursor-pointer ${
                          activeSkillSlot === 'ultimate' ? 'scale-105' : 'opacity-85'
                        }`}
                      >
                        <span className="px-1 rounded bg-gradient-to-r from-[#f59e0b] to-[#fde047] text-[#1e1208] text-[8px] font-black mb-0.5">
                          Bất Sát Kỹ · 必杀技
                        </span>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-b from-[#991b1b] to-[#450a0a] border-2 border-[#fde047] flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.8)]">
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
                        <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#991b1b] to-[#450a0a] border-2 border-[#d4af37] flex items-center justify-center shadow">
                          <Zap className="w-5 h-5 text-rose-300" />
                        </div>
                        <span className="text-[9px] font-bold text-[#e5cba0] truncate max-w-[75px] mt-0.5">
                          {selectedHero.skills.active.name}
                        </span>
                      </button>
                    </div>

                    {/* Center Standing Hero + Parchment Scroll Banner (01_hero_reveal_dracula.jpg) */}
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
                      <div className="w-full mt-1 px-2 py-1 rounded-xl bg-gradient-to-r from-[#d5b47f] via-[#f3deb1] to-[#d5b47f] border-2 border-[#8c6430] text-[#3b2412] text-center shadow-lg">
                        <div className="text-[10px] font-black text-[#5c3818]">
                          {inspectedSkill.name}
                        </div>
                        <p className="text-[9px] text-[#4d2f14] line-clamp-2 leading-tight">
                          {inspectedSkill.description}
                        </p>
                      </div>
                    </div>

                    {/* Right 2 Circular Skill Medallions (Passive + Basic) */}
                    <div className="col-span-3 flex flex-col items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveSkillSlot('passive')}
                        className={`flex flex-col items-center cursor-pointer ${
                          activeSkillSlot === 'passive' ? 'scale-105' : 'opacity-85'
                        }`}
                      >
                        <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#991b1b] to-[#450a0a] border-2 border-[#d4af37] flex items-center justify-center shadow">
                          <Shield className="w-5 h-5 text-rose-300" />
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
                        <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#991b1b] to-[#450a0a] border-2 border-[#d4af37] flex items-center justify-center shadow">
                          <Sword className="w-5 h-5 text-amber-300" />
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

          {/* LOWER SANCTUARY PANEL (Exact match to 04_hero_detail_medusa.png & 05_hero_detail_athena.png) */}
          <div className="bg-gradient-to-b from-[#132226]/95 to-[#0b1417]/98 border-2 border-[#9c723c] rounded-xl p-2 space-y-1.5">
            {/* Row 1: Faction + Armor Type + ✊ 25213 Combat Power Banner + Damage Type + Role */}
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-[#1a1109] border border-[#d4af37] flex items-center justify-center">
                  <img
                    src={selectedFactionMeta.icon}
                    alt={selectedFactionMeta.label}
                    className="w-4 h-4 object-contain"
                  />
                </div>
                <div className="w-7 h-7 rounded-full bg-[#143322] border border-[#4ade80] flex items-center justify-center text-[11px]">
                  🥾
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
                <div className="w-7 h-7 rounded-full bg-[#143322] border border-[#4ade80] flex items-center justify-center">
                  {CLASS_ICONS[selectedHero.heroClass]}
                </div>
                <div className="w-7 h-7 rounded-full bg-[#3b2512] border border-[#fde047] flex items-center justify-center text-[11px]">
                  ✨
                </div>
              </div>
            </div>

            {/* Row 2: 等级 80 | ❤️ 44,358 | ⚔️ 4019 | 🛡️ 454 | [!] (04_hero_detail_medusa.png) */}
            <div className="flex items-center justify-between px-2 py-1 rounded bg-black/40 border border-[#6e4b26]/50 font-mono text-[11px] tabular-nums">
              <span
                data-testid="inspected-hero-level"
                className="font-black text-[#fff2d1]"
              >
                Cấp {selectedOwned ? selectedOwned.level : 1}
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

            {/* Row 3: Left Glowing Gold Evolution Card (进化 4/2) + Center Hexagonal Level Up Button (升级) (04_hero_detail_medusa.png) */}
            {selectedOwned ? (
              <div className="grid grid-cols-12 gap-2 items-center pt-0.5">
                {/* Left Glowing Gold Evolution Box (04_hero_detail_medusa.png) */}
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
                      Tiến Hóa · 进化
                    </div>
                    <div className="px-1.5 py-0.2 rounded-full bg-emerald-700 text-white font-mono text-[9px] font-black inline-block mt-0.5">
                      {selectedOwned.copies}/{selectedOwned.stars * 2}
                    </div>
                  </div>
                </button>

                {/* Right Hexagonal Silver/Cyan Level Up Button (升级) */}
                <div className="col-span-7 flex flex-col items-center">
                  <span className="text-[9px] text-[#e5cba0] mb-0.5">
                    Cần Vàng: {levelCost.gold.toLocaleString()} · EXP:{' '}
                    {levelCost.heroExp.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    data-testid="btn-level-up-hero"
                    onClick={() => state.levelUpHero(selectedHero.id)}
                    className="w-full py-2 px-3 rounded-full bg-gradient-to-b from-[#e2e8f0] via-[#cbd5e1] to-[#94a3b8] hover:from-[#7ef3ff] hover:to-[#0284c7] border-2 border-white text-[#1e293b] font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg"
                  >
                    Tăng Cấp · 升级 (Lv.{selectedOwned.level + 1})
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-1.5 rounded-xl bg-black/45 border border-[#d4af37]">
                <span className="text-xs font-bold text-[#fde047]">
                  Chiêu mộ {selectedHero.name}
                </span>
                <button
                  type="button"
                  data-testid="btn-recruit-direct"
                  onClick={() => state.recruitHeroDirect(selectedHero.id)}
                  className="px-3 py-1 rounded-lg bg-gradient-to-b from-[#7ef3ff] to-[#0284c7] text-[#041624] font-black text-xs cursor-pointer"
                >
                  Chiêu Mộ Ngay
                </button>
              </div>
            )}

            {/* Row 4: Bottom Back Ribbon Button (↩) + 2 Diamond Tabs: 英雄 (Anh Hùng) & 技能 (Kỹ Năng) (04_hero_detail_medusa.png) */}
            <div className="flex items-center justify-between pt-1 border-t border-[#8c6430]/50">
              <button
                type="button"
                data-testid="btn-back-to-roster"
                onClick={() => setViewMode('roster')}
                className="px-3.5 py-1 rounded-r-xl bg-gradient-to-b from-[#6e4b26] to-[#3d2714] border-2 border-[#b8893e] text-[#fde047] font-black text-xs flex items-center gap-1 cursor-pointer shadow"
              >
                <CornerUpLeft className="w-3.5 h-3.5" />
                <span>Túi Tướng (5 Cột)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSanctuaryTab('gear')}
                  className={`px-3 py-1 rounded-lg border-2 text-[10px] font-black cursor-pointer ${
                    sanctuaryTab === 'gear'
                      ? 'bg-gradient-to-b from-[#f5d061] to-[#b8862d] text-[#241407] border-[#fef08a]'
                      : 'bg-[#24160c] text-[#d8be94] border-[#8c6430]'
                  }`}
                >
                  🛡️ Anh Hùng (英雄)
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
                  <span>✨ Kỹ Năng (技能)</span>
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
      className="w-full max-w-6xl mx-auto bg-gradient-to-b from-[#f3e3c3] via-[#ebd5ab] to-[#dcc08e] border-4 border-[#6e4b26] rounded-2xl shadow-[0_12px_50px_rgba(0,0,0,0.95)] overflow-hidden text-[#3b2412]"
    >
      {/* Ornate Carved Wood Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 bg-gradient-to-b from-[#4a3019] via-[#34200f] to-[#241509] border-b-4 border-[#b8893e] text-[#fff2d1]">
        <div>
          <h2
            className="text-base md:text-lg font-extrabold tracking-wider uppercase text-[#fde047]"
            style={{ fontFamily: '"Cinzel", serif' }}
          >
            Campaign &amp; World Map — Chiến Dịch Lục Địa Esperia
          </h2>
          <p className="text-xs text-[#e5cba0]">
            Chương 1–20 · Rương Thưởng AFK Giấy Da Cổ · Khiêu chiến 10 Ải Cốt Truyện
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCampaignView('stages')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
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
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
              campaignView === 'worldmap'
                ? 'bg-[#d4af37] text-[#1e1209]'
                : 'bg-[#3b2512] text-[#e5cba0] border border-[#8c6430]'
            }`}
          >
            World Map (Lục Địa Esperia)
          </button>
          <button
            type="button"
            onClick={() => setCampaignView('afkrewards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
              campaignView === 'afkrewards'
                ? 'bg-[#38bdf8] text-[#041019]'
                : 'bg-[#3b2512] text-[#fde047] border border-[#8c6430]'
            }`}
          >
            AFK Timer ({idleMinutes}p)
          </button>
          <button
            type="button"
            onClick={onCloseToBattle}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-b from-[#7ef3ff] via-[#22d3ee] to-[#0284c7] text-[#041624] text-xs font-black uppercase cursor-pointer shadow"
          >
            ⚔️ Begin
          </button>
        </div>
      </div>

      {campaignView === 'stages' && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[430px] overflow-y-auto">
          {CAMPAIGN_STAGES.map((stage) => {
            const isUnlocked = stage.id <= state.maxUnlockedStageId;
            const isCleared = state.clearedStageIds.includes(stage.id);
            const isCurrent = stage.id === state.currentStageId;

            return (
              <div
                key={stage.id}
                data-testid={`campaign-stage-${stage.id}`}
                className={`p-3.5 rounded-xl border-2 flex flex-col justify-between gap-2.5 shadow-md ${
                  isCurrent
                    ? 'bg-[#fff8ea] border-[#d97706] ring-2 ring-[#f59e0b]'
                    : isUnlocked
                      ? 'bg-[#faf0dc] border-[#9c723c]'
                      : 'bg-[#e2c99b]/70 border-[#a88b65] opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#4a3019] text-xs font-mono font-bold text-[#fde047]">
                        {stage.chapter}
                      </span>
                      {isCleared && (
                        <span className="text-[11px] font-extrabold text-emerald-700 flex items-center gap-0.5">
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Cleared
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-black text-[#3b2412] mt-1">
                      {stage.name}
                    </h3>
                    <p className="text-[11px] text-[#6b4826] font-mono tabular-nums">
                      ✊ Lực Chiến Đề Xuất: {stage.recommendedPower.toLocaleString()}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={!isUnlocked}
                    data-testid={`start-stage-${stage.id}`}
                    onClick={() => state.selectCampaignStage(stage.id, true)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase cursor-pointer shrink-0 shadow ${
                      isUnlocked
                        ? 'bg-gradient-to-b from-[#7ef3ff] via-[#22d3ee] to-[#0284c7] hover:brightness-110 text-[#041624] border border-cyan-100'
                        : 'bg-[#bfa06b] text-[#6b4826] cursor-not-allowed'
                    }`}
                  >
                    {isUnlocked
                      ? isCleared
                        ? 'Đánh Lại'
                        : 'Begin · Khiêu Chiến'
                      : 'Chưa Mở'}
                  </button>
                </div>

                {/* Enemy Formation Lineup Preview */}
                <div className="flex items-center justify-between pt-2 border-t border-[#c9ab78]">
                  <div className="flex items-center gap-1.5">
                    {stage.enemies.map((en, i) => {
                      const h = getHeroById(en.heroId);
                      return (
                        <div
                          key={i}
                          className="relative"
                          title={`${h.name} Lv.${en.level}`}
                        >
                          <HeroAvatarSvg hero={h} size="sm" variant="framed" />
                          <span className="absolute -bottom-1 right-0 bg-[#2b1b0e] px-1 rounded text-[8px] font-mono text-[#fde047]">
                            Lv.{en.level}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-right text-[10px] font-mono text-[#5c3818] tabular-nums">
                    <div className="font-bold">
                      {isCleared ? 'Thưởng Đánh Lại:' : 'Thưởng Vượt Lần Đầu:'}
                    </div>
                    <div>
                      +
                      {(isCleared
                        ? stage.replayRewards.gold
                        : stage.firstClearRewards.gold
                      ).toLocaleString()}{' '}
                      Gold · +
                      {isCleared
                        ? stage.replayRewards.essenceGems
                        : stage.firstClearRewards.essenceGems}{' '}
                      Gems
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {campaignView === 'worldmap' && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5 flex justify-center">
            <img
              src="/assets/aistudio/f6ad29da-2348-11ef-85c2-02420a000190_4ccb1cbf.webp"
              alt="Esperia World Map"
              className="max-h-[380px] rounded-xl border-4 border-[#7c562b] object-contain shadow-xl"
            />
          </div>
          <div className="md:col-span-7 space-y-3">
            <h3
              className="text-base font-extrabold text-[#4d2f14] uppercase"
              style={{ fontFamily: '"Cinzel", serif' }}
            >
              World Map — Bản Đồ Lục Địa Esperia (Chương 1 – 20)
            </h3>
            <p className="text-xs text-[#5c3818] leading-relaxed">
              Từ <strong>Rừng Đen (Dark Forest)</strong>, <strong>Lãnh Địa Dã Thú (Mauler&apos;s Enclave)</strong>, <strong>Vương Đô Maldan</strong> cho tới <strong>Đế Chế Vong Linh Bantus</strong>. Chọn chương bất kỳ bên dưới để tiến quân.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CAMPAIGN_STAGES.slice(0, 6).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => state.selectCampaignStage(st.id, true)}
                  className="p-2.5 rounded-xl bg-[#faf0dc] hover:bg-[#fff8ea] border-2 border-[#9c723c] text-left cursor-pointer shadow"
                >
                  <div className="text-[10px] font-mono text-[#8c5820] font-bold">
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
        <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5 flex justify-center">
            <img
              src="/assets/aistudio/f59f7bc4-2348-11ef-8204-02420a00018f_396d4909.webp"
              alt="AFK Rewards Parchment"
              className="max-h-[380px] rounded-xl border-4 border-[#7c562b] object-contain shadow-xl"
            />
          </div>
          <div className="md:col-span-7 bg-[#faf0dc] text-[#3a2614] border-4 border-[#8c6430] rounded-2xl p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b-2 border-[#9a7422]/40 pb-2">
              <h3
                className="text-base font-extrabold uppercase text-[#5c3a18]"
                style={{ fontFamily: '"Cinzel", serif' }}
              >
                AFK Timer &amp; AFK Rewards
              </h3>
              <span className="font-mono text-xs font-bold bg-[#3a2614] text-amber-300 px-2.5 py-0.5 rounded-full">
                12:00:00 ({idleMinutes}m)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
              <div className="p-2 rounded-lg bg-[#e6d2a4] border border-[#9a7422]/50">
                <div className="text-[10px] font-bold">GOLD / M</div>
                <div className="text-sm font-black text-amber-800">
                  +{(currentStage.id * 46).toLocaleString()}/m
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#e6d2a4] border border-[#9a7422]/50">
                <div className="text-[10px] font-bold">HERO EXP / M</div>
                <div className="text-sm font-black text-emerald-800">
                  +{(currentStage.id * 62).toLocaleString()}/m
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#e6d2a4] border border-[#9a7422]/50">
                <div className="text-[10px] font-bold">ESSENCE / D</div>
                <div className="text-sm font-black text-purple-800">
                  +{(currentStage.id * 120).toLocaleString()}/d
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCampaignView('stages')}
                className="px-5 py-2 rounded-xl bg-[#8c6239] hover:bg-[#734f2c] text-amber-100 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  state.claimIdleTribute();
                  setCampaignView('stages');
                }}
                className="px-6 py-2 rounded-xl bg-gradient-to-b from-[#7ef3ff] to-[#0284c7] text-[#041624] font-black text-xs uppercase cursor-pointer shadow-lg"
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

      <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left 5 Cols: Authentic Dolly Tavern Counter & Gold Summon Banner (Matching e5c92df8!) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#452b16] to-[#26160a] border-2 border-[#c89b4b] rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow-xl">
          <div className="relative rounded-xl overflow-hidden border-2 border-[#a87e3b] h-52 bg-[#1a0f07]">
            <img
              src="/assets/aistudio/e5c92df8-2348-11ef-834c-02420a00018d_edbebfd3.webp"
              alt="Dolly at The Noble Tavern"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute bottom-2 inset-x-2 p-2 rounded-lg bg-black/80 border border-[#c89b4b] text-[11px] text-[#fff2d1]">
              <strong className="text-[#fde047]">Dolly:</strong> &ldquo;I&apos;m your one and only lucky charm, Dolly! Trust me for the best Elite cards!&rdquo;
            </div>
          </div>

          {/* Authentic Gold Summon Buttons (Summon 1 & Summon x10 from e5c92df8) */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              data-testid="btn-summon-1"
              onClick={() => state.summonHeroes(1)}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-b from-[#f3d89c] via-[#d4a853] to-[#966b22] hover:brightness-110 border-2 border-[#fff2c2] text-[#241407] font-black text-xs cursor-pointer shadow-lg"
            >
              <div>Summon x1</div>
              <div className="text-[10px] font-mono font-bold mt-0.5">
                📜 {state.summonScrolls >= 1 ? '1 Cuộn' : '300 💎'}
              </div>
            </button>

            <button
              type="button"
              data-testid="btn-summon-10"
              onClick={() => state.summonHeroes(10)}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-b from-[#f3d89c] via-[#d4a853] to-[#966b22] hover:brightness-110 border-2 border-[#fff2c2] text-[#241407] font-black text-xs cursor-pointer shadow-lg"
            >
              <div>Summon x10</div>
              <div className="text-[10px] font-mono font-bold mt-0.5">
                📜 {state.summonScrolls >= 10 ? '10 Cuộn' : '2700 💎'}
              </div>
            </button>
          </div>
        </div>

        {/* Right 7 Cols: 10-Card Stained-Glass Tarot Flip Results (e88485e2) OR Parchment Hero Pool */}
        <div className="lg:col-span-7 bg-gradient-to-b from-[#f3e3c3] via-[#ebd5ab] to-[#dcc08e] border-2 border-[#8c6430] rounded-xl p-3.5 text-[#3b2412] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 border-b border-[#b8945e] pb-1.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#4d2f14]">
              {state.lastSummonResults.length > 0
                ? `Kết Quả Lật Bài Tarot (${state.lastSummonResults.length} Thẻ Anh Hùng)`
                : `Danh Sách Anh Hùng Tại Quán Rượu (${HERO_ROSTER.length} Tướng)`}
            </span>
            {state.lastSummonResults.length > 0 && (
              <button
                type="button"
                onClick={() => state.clearSummonResults()}
                className="text-xs font-bold text-[#6e4826] hover:text-[#3b2412] flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Xem Danh Sách Tướng
              </button>
            )}
          </div>

          {state.lastSummonResults.length > 0 ? (
            <div
              data-testid="summon-results-grid"
              className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 my-auto"
            >
              {state.lastSummonResults.map((item, idx) => (
                <button
                  key={`${item.hero.id}_${idx}`}
                  type="button"
                  onClick={() => state.setActiveScreen('details', item.hero.id)}
                  className={`p-2 rounded-xl border-2 flex flex-col items-center text-center cursor-pointer transition-transform hover:scale-105 shadow-lg ${
                    item.hero.rarity === 'Ascended'
                      ? 'bg-gradient-to-b from-[#4c1d95] to-[#1e1035] border-[#fde047] text-[#fff2d1]'
                      : 'bg-gradient-to-b from-[#1e3a8a] to-[#0f172a] border-[#60a5fa] text-white'
                  }`}
                >
                  <HeroAvatarSvg hero={item.hero} size="md" variant="framed" />
                  <div className="text-xs font-extrabold truncate w-full mt-1.5">
                    {item.hero.name}
                  </div>
                  <div className="text-[9px] text-[#fde047] font-bold">
                    {item.hero.rarity}
                  </div>
                  <span className="mt-0.5 text-[9px] font-mono font-bold text-emerald-300">
                    {item.isNew ? 'NEW HERO!' : `+${item.copiesGranted} Bản Sao`}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[290px] overflow-y-auto pr-1">
              {HERO_ROSTER.slice(0, 48).map((hero) => {
                const isOwned = Boolean(state.ownedHeroes[hero.id]);
                const facMeta = REPO_FACTION_METADATA[getHeroRepoFaction(hero)];
                return (
                  <button
                    key={hero.id}
                    type="button"
                    onClick={() => state.setActiveScreen('details', hero.id)}
                    className="p-1.5 rounded-lg bg-[#faf0dc] border-2 border-[#9c723c] hover:border-[#4d2f14] flex flex-col items-center text-center cursor-pointer shadow-sm"
                  >
                    <div className="relative">
                      <HeroAvatarSvg hero={hero} size="sm" variant="framed" />
                      {facMeta && (
                        <img
                          src={facMeta.icon}
                          alt={facMeta.label}
                          className="w-3.5 h-3.5 rounded-full bg-[#1a1109] border border-[#d4af37] absolute -top-1 -left-1 object-contain"
                        />
                      )}
                    </div>
                    <div className="text-[10px] font-extrabold text-[#3b2412] truncate w-full mt-1">
                      {hero.name}
                    </div>
                    <div className="text-[9px] font-semibold text-[#6e4826]">
                      {isOwned ? '✓ Đã Sở Hữu' : 'Chưa Mở'}
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
        <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-7 bg-[#faf0dc] border-2 border-[#9c723c] rounded-xl p-3.5 space-y-3 shadow">
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black border-2 border-[#7c562b] relative">
              <iframe
                key={activeVideo.youtubeId}
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?rel=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#4a3019] text-[#fde047] font-bold">
                {activeVideo.category} · {activeVideo.duration}
              </span>
              <h3 className="text-sm md:text-base font-black text-[#3b2412] mt-1">
                {activeVideo.title}
              </h3>
              <p className="text-xs text-[#6b4826] mt-0.5">
                {activeVideo.description}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#e6cfa3] border border-[#9c723c] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {activeVideo.showcaseTeam.map((hId, idx) => {
                  const hero = getHeroById(hId);
                  return (
                    <div
                      key={`${hId}_${idx}`}
                      className="flex flex-col items-center"
                      title={hero.name}
                    >
                      <HeroAvatarSvg hero={hero} size="sm" variant="framed" />
                      <span className="text-[9px] font-bold text-[#3b2412] truncate max-w-[52px] mt-0.5">
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
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-b from-[#7ef3ff] via-[#22d3ee] to-[#0284c7] text-[#041624] font-black text-xs cursor-pointer shadow"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Triệu Hồi &amp; Đấu Thử Đội Hình Video
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-2 max-h-[430px] overflow-y-auto pr-1">
            {OFFICIAL_GAME_VIDEOS.map((vid) => {
              const isSelected = vid.id === activeVideo.id;
              return (
                <button
                  key={vid.id}
                  type="button"
                  data-testid={`video-card-${vid.id}`}
                  onClick={() => setSelectedVideoId(vid.id)}
                  className={`w-full p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center gap-3 shadow-sm ${
                    isSelected
                      ? 'bg-[#fff8ea] border-[#d97706] ring-2 ring-[#f59e0b]'
                      : 'bg-[#faf0dc] border-[#9c723c] hover:bg-[#fff8ea]'
                  }`}
                >
                  <div className="w-24 h-14 rounded-lg overflow-hidden bg-slate-950 border border-[#7c562b] shrink-0 relative flex items-center justify-center">
                    <img
                      src={`https://i.ytimg.com/vi/${vid.youtubeId}/hqdefault.jpg`}
                      alt={vid.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                      <Play className="w-5 h-5 text-amber-300 fill-amber-300" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#8c5820]">
                      <span>{vid.category}</span>
                      <span>{vid.duration}</span>
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
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 max-h-[440px] overflow-y-auto">
          {DREAM_REALM_BOSSES.map((boss) => (
            <div
              key={boss.id}
              data-testid={`boss-card-${boss.id}`}
              className="p-3 rounded-xl bg-[#faf0dc] border-2 border-[#9c723c] flex flex-col justify-between gap-3 shadow"
            >
              <div className="flex items-center gap-3">
                <img
                  src={boss.imageUrl}
                  alt={boss.name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="w-14 h-14 rounded-xl object-contain bg-[#2b1b0e] border-2 border-[#a87e3b] shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#4a3019] text-[#fde047] font-bold">
                    {boss.mode}
                  </span>
                  <h3 className="text-sm font-black text-[#3b2412] truncate mt-0.5">
                    {boss.name}
                  </h3>
                  <p className="text-[10px] text-[#6b4826] font-mono">
                    LC Đề Xuất: {boss.recommendedPower.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="text-[11px] font-mono text-[#4d2f14] bg-[#e6cfa3] p-2 rounded border border-[#9c723c]">
                Thưởng: +{boss.rewardGold.toLocaleString()} Vàng · +
                {boss.rewardEssence} Kim Cương · +{boss.rewardScrolls} Cuộn
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
                className="w-full py-2 rounded-xl bg-gradient-to-b from-[#7ef3ff] via-[#22d3ee] to-[#0284c7] text-[#041624] text-xs font-black uppercase cursor-pointer shadow"
              >
                Challenge · Khiêu Chiến {boss.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'darkforest' && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[440px] overflow-y-auto">
          <div className="p-3 rounded-xl bg-[#faf0dc] border-2 border-[#9c723c] flex flex-col justify-between gap-2.5 shadow">
            <img
              src="/assets/aistudio/e9a24a7c-2348-11ef-834c-02420a00018d_0935de9a.webp"
              alt="Dark Forest Map"
              className="h-52 w-full object-cover rounded-lg border-2 border-[#7c562b]"
            />
            <div>
              <h3 className="text-sm font-black text-[#3b2412]">
                Dark Forest Map — Bản Đồ Rừng Đen
              </h3>
              <p className="text-xs text-[#6b4826] mt-1">
                Peaks of Time, Voyage of Wonders, King&apos;s Tower, Temporal Rift, Arcane Labyrinth, Arena of Heroes và Bounty Board.
              </p>
            </div>
            <button
              type="button"
              onClick={() => state.selectCampaignStage(2, true)}
              className="w-full py-2 rounded-xl bg-gradient-to-b from-[#7ef3ff] to-[#0284c7] text-[#041624] font-black text-xs uppercase cursor-pointer shadow"
            >
              Tiến Vào Rừng Đen
            </button>
          </div>

          <div className="p-3 rounded-xl bg-[#faf0dc] border-2 border-[#9c723c] flex flex-col justify-between gap-2.5 shadow">
            <img
              src="/assets/aistudio/ea8ba712-2348-11ef-a4be-02420a000190_39526e7f.webp"
              alt="King's Tower"
              className="h-52 w-full object-cover rounded-lg border-2 border-[#7c562b]"
            />
            <div>
              <h3 className="text-sm font-black text-[#3b2412]">
                King&apos;s Tower — Tháp Vua (Floor 43)
              </h3>
              <p className="text-xs text-[#6b4826] mt-1">
                Leo từng tầng Tháp Vua đối đầu 5 Tướng Thủ Hộ để nhận Đá Đột Phá, Vàng và Mảnh Tướng Elite.
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
              className="w-full py-2 rounded-xl bg-gradient-to-b from-[#7ef3ff] to-[#0284c7] text-[#041624] font-black text-xs uppercase cursor-pointer shadow"
            >
              Challenge · Floor 43
            </button>
          </div>

          <div className="p-3 rounded-xl bg-[#faf0dc] border-2 border-[#9c723c] flex flex-col justify-between gap-2.5 shadow">
            <img
              src="/assets/aistudio/f04d7338-2348-11ef-8204-02420a00018f_5e8b6414.webp"
              alt="Arcane Labyrinth"
              className="h-52 w-full object-cover rounded-lg border-2 border-[#7c562b]"
            />
            <div>
              <h3 className="text-sm font-black text-[#3b2412]">
                Arcane Labyrinth — Mê Cung Bí Thuật (Floor 1/3)
              </h3>
              <p className="text-xs text-[#6b4826] mt-1">
                Di chuyển trên các ô đá lục giác, chiêu mộ Tướng Trợ Chiến (Abandoned Wagon) và thu thập Di Vật (Relics).
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
              className="w-full py-2 rounded-xl bg-gradient-to-b from-[#f5d061] to-[#b8862d] text-[#241509] font-black text-xs uppercase cursor-pointer shadow"
            >
              Choose A Relic · Nhận Di Vật
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
