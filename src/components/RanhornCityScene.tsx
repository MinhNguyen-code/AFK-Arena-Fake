import React, { useState } from 'react';
import {
  HERO_ROSTER,
  getHeroById,
  computeTeamPower,
  computeFactionAura,
} from '../game/heroes';
import { getCampaignStage } from '../game/campaign';
import { useGameStore } from '../store/gameStore';
import { HeroAvatarSvg } from './HeroAvatarSvg';
import { RedNotificationDot } from './ClassicUiKit';
import {
  IconNavTavern,
  IconUtilGuild,
  IconUtilLibrary,
  IconUtilBag,
  IconUtilQuests,
  IconUtilEvents,
  IconUtilMail,
  IconUtilSettings,
  IconResAfkChest,
  IconResGoldCoin,
  IconResDiamond,
  IconResScroll,
  IconResHeroExp,
  IconSysUpgrade,
} from './FantasyIcons';
import ranhornCityMapImg from '../assets/images/ranhorn_city_map_1794495603705.jpg';

// ============================================================================
// 1. NORMALIZED RANHORN CITY BUILDING DEFINITIONS (8 Interactive Locations)
// ============================================================================

export type RanhornBuildingId =
  | 'tavern'
  | 'temple'
  | 'crystal'
  | 'library'
  | 'oak_inn'
  | 'guild'
  | 'store'
  | 'cart';

export interface RanhornBuildingDef {
  id: RanhornBuildingId;
  name: string;
  viSub: string;
  left: string;
  top: string;
  notify?: boolean;
  badgeText?: string;
}

const RANHORN_BUILDINGS: RanhornBuildingDef[] = [
  {
    id: 'guild',
    name: 'Guild Grounds',
    viSub: 'Công Hội',
    left: '72%',
    top: '16%',
    notify: true,
  },
  {
    id: 'oak_inn',
    name: 'The Oak Inn',
    viSub: 'Nội Thất 9/9',
    left: '38%',
    top: '31%',
    notify: true,
  },
  {
    id: 'temple',
    name: 'Temple of Ascension',
    viSub: 'Đền Thăng Thiên',
    left: '74%',
    top: '34%',
    notify: true,
  },
  {
    id: 'crystal',
    name: 'Resonating Crystal',
    viSub: 'Pha Lê Cộng Hưởng',
    left: '78%',
    top: '50%',
    notify: true,
  },
  {
    id: 'library',
    name: 'Library',
    viSub: 'Thư Viện Liên Kết',
    left: '48%',
    top: '61%',
    notify: true,
  },
  {
    id: 'tavern',
    name: 'The Noble Tavern',
    viSub: 'Quán Rượu Quý Tộc',
    left: '75%',
    top: '68%',
    notify: true,
  },
  {
    id: 'cart',
    name: 'Rickety Cart',
    viSub: 'Xe Cũ Hoàn Cấp',
    left: '68%',
    top: '79%',
    notify: false,
  },
  {
    id: 'store',
    name: 'Ranhorn Store',
    viSub: 'Cửa Hàng Vật Phẩm',
    left: '28%',
    top: '80%',
    notify: true,
  },
];

// ============================================================================
// 2. AMBIENT EFFECTS (Floating Golden Motes, Clouds & Fountain Shimmer)
// ============================================================================

export const AmbientEffects: React.FC = () => (
  <div
    className="pointer-events-none absolute inset-0 overflow-hidden z-10"
    aria-hidden="true"
  >
    {/* Soft sunlight rays from top-left citadel */}
    <div
      className="absolute -top-16 -left-16 w-72 h-72 rounded-full opacity-25"
      style={{
        background:
          'radial-gradient(circle, rgba(254,240,138,0.55) 0%, rgba(250,204,21,0.15) 45%, transparent 70%)',
      }}
    />
    {/* Crystal Plaza Arcane Glow */}
    <div
      className="absolute w-36 h-36 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 animate-pulse"
      style={{
        left: '70%',
        top: '51%',
        background:
          'radial-gradient(circle, rgba(56,189,248,0.6) 0%, rgba(168,85,247,0.2) 55%, transparent 75%)',
      }}
    />
    {/* Temple of Ascension Warm Golden Halo */}
    <div
      className="absolute w-36 h-36 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 animate-pulse"
      style={{
        left: '28%',
        top: '45%',
        background:
          'radial-gradient(circle, rgba(253,224,71,0.55) 0%, rgba(217,119,6,0.2) 55%, transparent 75%)',
      }}
    />
    {/* Subtle Floating Magical Motes */}
    {[
      { left: '18%', top: '28%' },
      { left: '62%', top: '22%' },
      { left: '36%', top: '39%' },
      { left: '74%', top: '46%' },
      { left: '24%', top: '65%' },
      { left: '54%', top: '76%' },
    ].map((p, idx) => (
      <span
        key={idx}
        style={{ left: p.left, top: p.top }}
        className="absolute w-1.5 h-1.5 rounded-full bg-[#fef08a] shadow-[0_0_8px_#fde047] opacity-80 animate-ping"
      />
    ))}
  </div>
);

// ============================================================================
// 3. CUSTOM ISOMETRIC BUILDING ARTWORK (SVG Architectural Landmarks)
// ============================================================================

export const CityBuilding: React.FC<{
  id: RanhornBuildingId;
  selected: boolean;
}> = ({ id, selected }) => {
  // Interactive landmark hit-region + subtle golden selection ring over the painted building
  const ringClass = selected
    ? 'border-2 border-[#fef08a] bg-[#fde047]/20 shadow-[0_0_24px_rgba(253,224,71,0.85)] scale-105'
    : 'border border-transparent group-hover:border-[#fde047]/65 group-hover:bg-[#fde047]/10 group-hover:shadow-[0_0_16px_rgba(253,224,71,0.45)]';

  return (
    <div
      data-building-crest={id}
      className={`w-24 h-14 rounded-2xl transition-all duration-200 flex items-center justify-center ${ringClass}`}
      aria-hidden="true"
    />
  );
};

// ============================================================================
// 4. BUILDING LABEL & BUILDING HOTSPOT (Anchored Nameplates + Selection Pulse)
// ============================================================================

export const BuildingLabel: React.FC<{
  name: string;
  notify?: boolean;
  selected?: boolean;
}> = ({ name, notify = false, selected = false }) => (
  <div
    className={`relative -mt-1 z-20 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border transition-all ${
      selected
        ? 'bg-gradient-to-b from-[#5c3818] to-[#29160a] border-[#fef08a] shadow-[0_0_12px_rgba(253,224,71,0.85)]'
        : 'bg-gradient-to-b from-[#2b1a0e]/95 to-[#140b05]/95 border-[#c69d53] shadow-[0_3px_8px_rgba(0,0,0,0.95)] group-hover:border-[#fde047]'
    }`}
  >
    <span
      className="text-[10.5px] font-extrabold tracking-wide text-[#fff8e7] whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,1)]"
      style={{ fontFamily: '"Cinzel", Georgia, serif' }}
    >
      {name}
    </span>
    {notify && <RedNotificationDot className="ml-0.5 -mr-1" />}
  </div>
);

export const BuildingHotspot: React.FC<{
  building: RanhornBuildingDef;
  selected: boolean;
  onSelect: (id: RanhornBuildingId) => void;
}> = ({ building, selected, onSelect }) => (
  <button
    type="button"
    data-testid={`ranhorn-hotspot-${building.id}`}
    aria-label={`${building.name} — ${building.viSub}`}
    onClick={() => onSelect(building.id)}
    style={{ left: building.left, top: building.top }}
    className="group absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#fde047] rounded-2xl p-1"
  >
    <CityBuilding id={building.id} selected={selected} />
    <BuildingLabel
      name={building.name}
      notify={building.notify}
      selected={selected}
    />
  </button>
);

// ============================================================================
// 5. RANHORN SCENE & CITY VIEWPORT (Scrollable Fantasy City Hub)
// ============================================================================

export const RanhornScene: React.FC<{
  selectedBuilding: RanhornBuildingId | null;
  onSelectBuilding: (id: RanhornBuildingId) => void;
}> = ({ selectedBuilding, onSelectBuilding }) => (
  <div
    data-testid="ranhorn-interactive-scene"
    className="relative w-full h-[780px] shrink-0 overflow-hidden select-none bg-[#1e2f28]"
  >
    {/* 1. Bespoke Hand-Painted Classic AFK Arena Isometric Ranhorn City Map */}
    <img
      src={ranhornCityMapImg}
      alt="Thành trì Ranhorn"
      className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
    />

    {/* 2. Subtle Top & Bottom Vignettes for HUD & Bottom Navigation Contrast */}
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/45 to-transparent"
      aria-hidden="true"
    />
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent"
      aria-hidden="true"
    />

    {/* 3. Ambient Floating Particles & Halos */}
    <AmbientEffects />

    {/* 4. All 8 Interactive City Buildings & Anchored Nameplates */}
    {RANHORN_BUILDINGS.map((b) => (
      <BuildingHotspot
        key={b.id}
        building={b}
        selected={selectedBuilding === b.id}
        onSelect={onSelectBuilding}
      />
    ))}
  </div>
);

export const CityViewport: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <div
    data-testid="ranhorn-city-viewport"
    className="relative flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden scroll-smooth"
  >
    {children}
  </div>
);

// ============================================================================
// 6. FULL RANHORN CITY HUB CONTAINER (Replaces Vertical Card List in LobbyPanel)
// ============================================================================

export const RanhornCityHub: React.FC<{
  onCloseToBattle: () => void;
  onOpenSystemModal?: (
    modal: 'bag' | 'guild' | 'quests' | 'events' | 'mail' | 'settings'
  ) => void;
}> = ({ onCloseToBattle, onOpenSystemModal }) => {
  const state = useGameStore();
  const [activeBuildingModal, setActiveBuildingModal] = useState<
    null | 'crystal' | 'temple' | 'library' | 'oak_inn' | 'store' | 'cart'
  >(null);
  const [utilityMenuExpanded, setUtilityMenuExpanded] = useState<boolean>(true);
  const [selectedResetHeroId, setSelectedResetHeroId] = useState<string>(
    state.formation[0] || 'celestial_guardian'
  );

  const teamPower = computeTeamPower(state.formation, state.ownedHeroes);
  const currentStage = getCampaignStage(state.currentStageId);
  const idleMinutes = Math.max(1, Math.floor(state.idleAccumulatedSeconds / 60));
  const allyAura = computeFactionAura(state.formation);

  const handleSelectBuilding = (id: RanhornBuildingId) => {
    switch (id) {
      case 'tavern':
        state.setActiveScreen('summon');
        break;
      case 'guild':
        if (onOpenSystemModal) {
          onOpenSystemModal('guild');
        }
        break;
      case 'crystal':
        state.autoUpgradeSquad();
        setActiveBuildingModal('crystal');
        break;
      case 'temple':
        setActiveBuildingModal('temple');
        break;
      case 'library':
        setActiveBuildingModal('library');
        break;
      case 'oak_inn':
        setActiveBuildingModal('oak_inn');
        break;
      case 'store':
        setActiveBuildingModal('store');
        break;
      case 'cart':
        setActiveBuildingModal('cart');
        break;
    }
  };

  return (
    <div
      data-testid="screen-lobby"
      className="relative w-full h-full flex flex-col overflow-hidden bg-[#1a1109] select-none"
    >
      {/* FLOATING CLASSIC AFK ARENA LEFT-SIDE MEDALLIONS (Events & AFK Chest) */}
      <div className="pointer-events-none absolute top-2.5 left-2 z-30 flex flex-col gap-2">
        {onOpenSystemModal && (
          <button
            type="button"
            data-testid="ranhorn-open-events"
            onClick={() => onOpenSystemModal('events')}
            className="pointer-events-auto relative w-12 py-1 rounded-xl bg-gradient-to-b from-[#3d2514]/95 to-[#1c1008]/95 border-2 border-[#c69d53] shadow-[0_4px_12px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform"
          >
            <RedNotificationDot className="absolute -top-1 -right-1" />
            <IconUtilEvents className="w-5 h-5" />
            <span className="text-[8.5px] font-extrabold text-[#fff2d1] leading-tight mt-0.5">
              Events
            </span>
          </button>
        )}

        <button
          type="button"
          data-testid="lobby-claim-idle-btn"
          onClick={() => state.claimIdleTribute()}
          title={`Thu hoạch Rương AFK (${idleMinutes} phút)`}
          className="pointer-events-auto relative w-12 py-1 rounded-xl bg-gradient-to-b from-[#3d2514]/95 to-[#1c1008]/95 border-2 border-[#fde047] shadow-[0_4px_12px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform"
        >
          <RedNotificationDot className="absolute -top-1 -right-1" />
          <IconResAfkChest className="w-5 h-5" />
          <span className="text-[8px] font-extrabold text-[#fde047] leading-tight mt-0.5">
            AFK {idleMinutes}m
          </span>
        </button>
      </div>

      {/* FLOATING CLASSIC AFK ARENA RIGHT-SIDE COLLAPSIBLE HANGING PENNANT BANNER (Quests, Bag, Mail, Guild, Settings) */}
      {onOpenSystemModal && (
        <div className="pointer-events-none absolute top-2 right-2 z-30 flex flex-col items-center">
          <div className="pointer-events-auto w-12 bg-gradient-to-b from-[#3d2614]/95 via-[#2a190d]/95 to-[#180e07]/95 border-2 border-[#c69d53] rounded-b-2xl rounded-t-lg shadow-[0_6px_18px_rgba(0,0,0,0.95)] py-1.5 px-1 flex flex-col items-center gap-1.5">
            {/* Quests (Always visible at top of pennant like Reference Screenshot 2 & 3) */}
            <button
              type="button"
              data-testid="ranhorn-open-quests"
              onClick={() => onOpenSystemModal('quests')}
              className="relative w-full py-1 rounded-lg hover:bg-[#4a3019] flex flex-col items-center justify-center cursor-pointer"
            >
              <RedNotificationDot count={3} className="absolute -top-0.5 right-0" />
              <IconUtilQuests className="w-5 h-5" />
              <span className="text-[8.5px] font-extrabold text-[#fff2d1] leading-none mt-0.5">
                Quests
              </span>
            </button>

            {utilityMenuExpanded && (
              <>
                <div className="w-8 h-[1px] bg-[#8c6430]/60" />
                <button
                  type="button"
                  data-testid="ranhorn-open-bag"
                  onClick={() => onOpenSystemModal('bag')}
                  className="relative w-full py-1 rounded-lg hover:bg-[#4a3019] flex flex-col items-center justify-center cursor-pointer"
                >
                  <RedNotificationDot className="absolute -top-0.5 right-0" />
                  <IconUtilBag className="w-5 h-5" />
                  <span className="text-[8.5px] font-extrabold text-[#fff2d1] leading-none mt-0.5">
                    Bag
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="ranhorn-open-mail"
                  onClick={() => onOpenSystemModal('mail')}
                  className="relative w-full py-1 rounded-lg hover:bg-[#4a3019] flex flex-col items-center justify-center cursor-pointer"
                >
                  <RedNotificationDot count={2} className="absolute -top-0.5 right-0" />
                  <IconUtilMail className="w-5 h-5" />
                  <span className="text-[8.5px] font-extrabold text-[#fff2d1] leading-none mt-0.5">
                    Mail
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="ranhorn-open-guild"
                  onClick={() => onOpenSystemModal('guild')}
                  className="relative w-full py-1 rounded-lg hover:bg-[#4a3019] flex flex-col items-center justify-center cursor-pointer"
                >
                  <IconUtilGuild className="w-5 h-5" />
                  <span className="text-[8.5px] font-extrabold text-[#fff2d1] leading-none mt-0.5">
                    Guild
                  </span>
                </button>

                <button
                  type="button"
                  data-testid="ranhorn-open-settings"
                  onClick={() => onOpenSystemModal('settings')}
                  className="relative w-full py-1 rounded-lg hover:bg-[#4a3019] flex flex-col items-center justify-center cursor-pointer"
                >
                  <IconUtilSettings className="w-5 h-5" />
                  <span className="text-[8.5px] font-extrabold text-[#fff2d1] leading-none mt-0.5">
                    Settings
                  </span>
                </button>
              </>
            )}

            {/* Golden Chevron Pennant Toggle Button */}
            <button
              type="button"
              data-testid="ranhorn-toggle-utility-pennant"
              aria-label={utilityMenuExpanded ? 'Thu gọn menu tiện ích' : 'Mở rộng menu tiện ích'}
              onClick={() => setUtilityMenuExpanded((v) => !v)}
              className="w-full pt-0.5 flex items-center justify-center cursor-pointer"
            >
              <IconSysUpgrade
                className={`w-4 h-4 transition-transform ${
                  utilityMenuExpanded ? '' : 'rotate-180'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* MAIN SCROLLABLE INTERACTIVE FANTASY CITY VIEWPORT */}
      <CityViewport>
        <RanhornScene
          selectedBuilding={activeBuildingModal}
          onSelectBuilding={handleSelectBuilding}
        />
      </CityViewport>

      {/* =====================================================================
          INTERACTIVE BUILDING MODALS (Temple, Crystal, Library, Oak Inn, Store, Cart)
          ===================================================================== */}
      {activeBuildingModal && (
        <div
          role="dialog"
          aria-label="Chi tiết công trình Ranhorn"
          data-testid={`ranhorn-building-modal-${activeBuildingModal}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        >
          <div className="w-full max-w-sm bg-gradient-to-b from-[#f3e3c3] via-[#ead4aa] to-[#dec28f] border-4 border-[#7c562b] rounded-2xl p-4 shadow-2xl text-[#3b2412] space-y-3 max-h-[84vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-[#9c723c]/50 pb-2 gap-2">
              <h3
                className="text-xs font-extrabold text-[#4d2f14] uppercase truncate"
                style={{ fontFamily: '"Cinzel", serif' }}
              >
                {activeBuildingModal === 'crystal' &&
                  'Resonating Crystal · Pha Lê Cộng Hưởng'}
                {activeBuildingModal === 'temple' &&
                  'Temple of Ascension · Đền Thăng Thiên'}
                {activeBuildingModal === 'library' &&
                  'Library · Thư Viện Liên Kết Anh Hùng'}
                {activeBuildingModal === 'oak_inn' &&
                  'The Oak Inn · Lữ Quán Cây Sồi (Nội Thất 9/9)'}
                {activeBuildingModal === 'store' &&
                  'Ranhorn Store · Cửa Hàng Vương Đô'}
                {activeBuildingModal === 'cart' &&
                  'Rickety Cart · Xe Cũ Hoàn Cấp Tướng'}
              </h3>
              <button
                type="button"
                data-testid="ranhorn-modal-close-btn"
                onClick={() => setActiveBuildingModal(null)}
                className="px-2 py-0.5 rounded-lg bg-[#6e4b26] text-[#fde047] font-black text-xs cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* 1. RESONATING CRYSTAL MODAL */}
            {activeBuildingModal === 'crystal' && (
              <div className="space-y-2.5">
                <img
                  src="/assets/aistudio/f91c89a4-2348-11ef-8204-02420a00018f_d7da0e81.webp"
                  alt="Resonating Crystal"
                  className="w-full max-h-[180px] rounded-xl border-2 border-[#7c562b] object-cover"
                />
                <p className="text-xs text-[#4d2f14] leading-relaxed">
                  Ngôi Sao Năm Cánh (Pentagram) đồng bộ cấp độ 5 Anh Hùng chủ lực (Lực chiến đội: <strong>{teamPower.toLocaleString()}</strong> · {allyAura.tierLabel}).
                </p>
                <div className="grid grid-cols-5 gap-1.5">
                  {state.formation.map((heroId, idx) => {
                    const hero = heroId ? getHeroById(heroId) : null;
                    const owned = heroId ? state.ownedHeroes[heroId] : undefined;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveBuildingModal(null);
                          if (hero) state.setActiveScreen('details', hero.id);
                          else state.setActiveScreen('formation');
                        }}
                        className="p-1 rounded-lg bg-[#241509] border border-[#b8893e] flex flex-col items-center text-center cursor-pointer"
                      >
                        {hero && owned ? (
                          <>
                            <HeroAvatarSvg hero={hero} size="sm" variant="icon" />
                            <span className="text-[9px] font-mono font-bold text-[#fde047] mt-0.5">
                              Lv.{owned.level}
                            </span>
                          </>
                        ) : (
                          <span className="h-10 flex items-center text-[9px] text-[#e5cba0]">
                            +Ô #{idx + 1}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => state.autoUpgradeSquad()}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-b from-[#fde047] to-[#b45309] text-[#1e1209] font-black text-xs uppercase cursor-pointer shadow"
                  >
                    Đồng Bộ &amp; Tăng Cấp Đội
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveBuildingModal(null);
                      state.setActiveScreen('formation');
                    }}
                    className="px-3 py-2 rounded-xl bg-[#4a3019] text-[#fde047] font-bold text-xs cursor-pointer"
                  >
                    Xếp Đội
                  </button>
                </div>
              </div>
            )}

            {/* 2. TEMPLE OF ASCENSION MODAL */}
            {activeBuildingModal === 'temple' && (
              <div className="space-y-2.5">
                <img
                  src="/assets/aistudio/e4cb1de4-2348-11ef-ade0-02420a00018c_95067586.webp"
                  alt="Temple of Ascension"
                  className="w-full max-h-[180px] rounded-xl border-2 border-[#7c562b] object-cover"
                />
                <p className="text-xs text-[#4d2f14] leading-relaxed">
                  Hợp nhất các bản sao Anh Hùng tại Đền Thăng Thiên để đột phá phẩm chất lên bậc <strong>Ascended 5 Sao</strong>!
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const firstHero = state.formation[0] || 'celestial_guardian';
                      state.ascendHeroStar(firstHero);
                    }}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-b from-[#fde047] to-[#b45309] text-[#1e1209] font-black text-xs uppercase cursor-pointer shadow"
                  >
                    Smart Ascend · Đột Phá Nhanh
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveBuildingModal(null);
                      state.setActiveScreen('collection');
                    }}
                    className="px-3 py-2 rounded-xl bg-[#4a3019] text-[#fde047] font-bold text-xs cursor-pointer"
                  >
                    Mở Heroes
                  </button>
                </div>
              </div>
            )}

            {/* 3. LIBRARY & OAK INN MODALS */}
            {(activeBuildingModal === 'library' ||
              activeBuildingModal === 'oak_inn') && (
              <div className="space-y-2.5">
                <img
                  src="/assets/aistudio/e230a004-2348-11ef-83ca-02420a00018c_da3912c3.webp"
                  alt="Library and Oak Inn"
                  className="w-full max-h-[180px] rounded-xl border-2 border-[#7c562b] object-cover"
                />
                <p className="text-xs text-[#4d2f14] leading-relaxed">
                  {activeBuildingModal === 'library'
                    ? 'Thư Viện Liên Kết (Unions) kích hoạt cộng hưởng cốt truyện giữa các bộ 3 Anh Hùng, cộng trực tiếp HP +15%, ATK +15% cho toàn đội.'
                    : 'Lữ Quán Cây Sồi (The Oak Inn) chế tác Nội Thất Đỏ 3/9 và 9/9 mở khóa kỹ năng độc quyền cho các Tướng bậc Ascended.'}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      state.unlockAllRepoHeroes();
                      setActiveBuildingModal(null);
                    }}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-b from-[#fde047] to-[#b45309] text-[#1e1209] font-black text-xs uppercase cursor-pointer shadow"
                  >
                    Kích Hoạt Toàn Bộ Liên Kết ({HERO_ROSTER.length} Tướng)
                  </button>
                </div>
              </div>
            )}

            {/* 4. RANHORN STORE MODAL */}
            {activeBuildingModal === 'store' && (
              <div className="space-y-2.5">
                <p className="text-xs text-[#4d2f14]">
                  Trao đổi Vàng, Kim Cương, Bụi Tinh Hoa và Cuộn Triệu Hồi hằng ngày tại Cửa Hàng Ranhorn:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => state.claimFreeSanctumGift()}
                    className="p-2.5 rounded-xl bg-[#29160a] border-2 border-[#c69d53] text-[#fff2d1] flex flex-col items-center gap-1 cursor-pointer hover:brightness-110"
                  >
                    <IconResScroll className="w-6 h-6" />
                    <span className="text-xs font-extrabold text-[#fde047]">
                      Gói Cuộn Chiêu Mộ
                    </span>
                    <span className="text-[10px] font-mono text-emerald-300">
                      Nhận Miễn Phí
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => state.claimIdleTribute()}
                    className="p-2.5 rounded-xl bg-[#29160a] border-2 border-[#c69d53] text-[#fff2d1] flex flex-col items-center gap-1 cursor-pointer hover:brightness-110"
                  >
                    <IconResGoldCoin className="w-6 h-6" />
                    <span className="text-xs font-extrabold text-[#fde047]">
                      Rương Vàng &amp; EXP
                    </span>
                    <span className="text-[10px] font-mono text-emerald-300">
                      +{currentStage.id * 460} Vàng
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* 5. RICKETY CART MODAL (Hero Reset & Level Sync) */}
            {activeBuildingModal === 'cart' && (
              <div className="space-y-2.5">
                <p className="text-xs text-[#4d2f14] leading-relaxed">
                  Chọn Anh Hùng trên <strong>Rickety Cart</strong> để quản lý cấp độ, hoàn trả tài nguyên hoặc điều chỉnh đội hình xuất trận:
                </p>
                <div className="grid grid-cols-5 gap-1.5">
                  {Object.keys(state.ownedHeroes)
                    .slice(0, 10)
                    .map((id) => {
                      const h = getHeroById(id);
                      const owned = state.ownedHeroes[id];
                      const active = selectedResetHeroId === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setSelectedResetHeroId(id)}
                          className={`p-1 rounded-lg border-2 flex flex-col items-center cursor-pointer ${
                            active
                              ? 'bg-[#3d2514] border-[#fde047]'
                              : 'bg-[#241509] border-[#7c562b]'
                          }`}
                        >
                          <HeroAvatarSvg hero={h} size="sm" variant="icon" />
                          <span className="text-[9px] font-mono font-bold text-[#fde047] mt-0.5">
                            Lv.{owned?.level ?? 1}
                          </span>
                        </button>
                      );
                    })}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      state.levelUpHero(selectedResetHeroId);
                    }}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-b from-[#fde047] to-[#b45309] text-[#1e1209] font-black text-xs uppercase cursor-pointer shadow"
                  >
                    Tăng Cấp Tướng Chọn
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveBuildingModal(null);
                      onCloseToBattle();
                    }}
                    className="px-3 py-2 rounded-xl bg-[#4a3019] text-[#fde047] font-bold text-xs cursor-pointer"
                  >
                    Ra Trận
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
