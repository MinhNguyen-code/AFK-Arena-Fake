import { create } from 'zustand';
import {
  OwnedHeroState,
  TeamFormationSlots,
  SavedTeamPreset,
  HeroDefinition,
} from '../game/types';
import {
  HERO_ROSTER,
  getHeroById,
  getHeroLevelUpCost,
  getEquipmentUpgradeCost,
  validateTeamFormation,
} from '../game/heroes';
import { getCampaignStage, CAMPAIGN_STAGES } from '../game/campaign';
import { soundEngine } from '../game/audio';

export type AppScreen =
  | 'battle'
  | 'lobby'
  | 'formation'
  | 'collection'
  | 'details'
  | 'upgrades'
  | 'campaign'
  | 'summon'
  | 'videos';

export interface SummonPullResult {
  hero: HeroDefinition;
  isNew: boolean;
  copiesGranted: number;
}

export interface BattleRewardSummary {
  stageId: number;
  didWin: boolean;
  isFirstClear: boolean;
  gold: number;
  heroExp: number;
  essenceGems: number;
  summonScrolls: number;
  unlockedNextStage: boolean;
}

export interface EternalRealmsState {
  // Navigation & UI
  activeScreen: AppScreen;
  selectedHeroId: string;
  toastMessage: string | null;

  // Player Economy
  gold: number;
  heroExp: number;
  essenceGems: number;
  summonScrolls: number;
  ascensionStones: number;
  idleAccumulatedSeconds: number;

  // Collection & Formation
  ownedHeroes: Record<string, OwnedHeroState>;
  formation: TeamFormationSlots;
  savedPresets: SavedTeamPreset[];

  // Campaign Progress
  currentStageId: number;
  maxUnlockedStageId: number;
  clearedStageIds: number[];

  // Combat Controls
  battleSpeed: 1 | 2;
  autoUltimate: boolean;
  battleInstanceKey: number;

  // Summon State
  pityCounter: number;
  totalSummons: number;
  lastSummonResults: SummonPullResult[];

  // Actions
  setActiveScreen: (screen: AppScreen, inspectHeroId?: string) => void;
  setSelectedHeroId: (heroId: string) => void;
  showToast: (msg: string) => void;
  clearToast: () => void;

  // Combat Control Actions
  toggleBattleSpeed: () => void;
  toggleAutoUltimate: () => void;
  restartCurrentBattle: () => void;

  // Formation Actions
  assignHeroToSlot: (heroId: string, slotIndex: number) => void;
  swapFormationSlots: (fromIndex: number, toIndex: number) => void;
  removeHeroFromSlot: (slotIndex: number) => void;
  saveTeamPreset: (name: string) => void;
  loadTeamPreset: (presetId: string) => void;

  // Hero Progression Actions
  levelUpHero: (heroId: string) => boolean;
  ascendHeroStar: (heroId: string) => boolean;
  upgradeEquipment: (heroId: string, slot: 'weapon' | 'armor' | 'relic') => boolean;
  autoUpgradeSquad: () => number;
  recruitHeroDirect: (heroId: string) => boolean;
  unlockAllRepoHeroes: () => void;
  deployShowcaseTeam: (teamIds: TeamFormationSlots, label: string) => void;

  // Campaign & Idle Rewards
  selectCampaignStage: (stageId: number, startImmediately?: boolean) => void;
  recordBattleOutcome: (stageId: number, didWin: boolean) => BattleRewardSummary;
  tickIdleTimer: (seconds: number) => void;
  claimIdleTribute: () => void;

  // Summon Actions
  summonHeroes: (count: 1 | 10) => SummonPullResult[];
  claimFreeSanctumGift: () => void;
  clearSummonResults: () => void;
}

const STORAGE_KEY = 'eternal_realms_save_v1';

function createInitialData() {
  const starterIds = [
    'celestial_guardian',
    'crimson_revenant',
    'storm_empress',
    'dawn_oracle',
    'arcane_serpent',
    'iron_bastion',
    'shadow_sovereign',
    'emerald_valkyrie',
  ];

  const ownedHeroes: Record<string, OwnedHeroState> = {};
  starterIds.forEach((id, idx) => {
    const def = getHeroById(id);
    ownedHeroes[id] = {
      heroId: id,
      level: idx < 5 ? 3 : 2,
      stars: def.rarity === 'Ascended' ? 2 : 1,
      copies: 2,
      equipment: {
        weapon: 1,
        armor: 1,
        relic: 1,
      },
    };
  });

  const formation: TeamFormationSlots = [
    'celestial_guardian', // Pos 1 Frontline
    'crimson_revenant', // Pos 2 Frontline
    'storm_empress', // Pos 3 Backline
    'dawn_oracle', // Pos 4 Backline
    'arcane_serpent', // Pos 5 Backline
  ];

  const savedPresets: SavedTeamPreset[] = [
    {
      id: 'preset_balanced',
      name: 'Đội Hình Cân Bằng Mặt Trời',
      slots: [...formation] as TeamFormationSlots,
    },
    {
      id: 'preset_assault',
      name: 'Đội Hình Đột Kích Bóng Đêm',
      slots: [
        'iron_bastion',
        'crimson_revenant',
        'shadow_sovereign',
        'emerald_valkyrie',
        'dawn_oracle',
      ],
    },
  ];

  return {
    gold: 16500,
    heroExp: 12800,
    essenceGems: 4200,
    summonScrolls: 12,
    ascensionStones: 180,
    idleAccumulatedSeconds: 3600,
    ownedHeroes,
    formation,
    savedPresets,
    currentStageId: 1,
    maxUnlockedStageId: 1,
    clearedStageIds: [] as number[],
    battleSpeed: 1 as 1 | 2,
    autoUltimate: true,
    pityCounter: 0,
    totalSummons: 0,
  };
}

function loadSavedData() {
  const defaults = createInitialData();
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.gold === 'number' &&
      parsed.ownedHeroes &&
      Array.isArray(parsed.formation) &&
      parsed.formation.length === 5
    ) {
      return {
        ...defaults,
        ...parsed,
      };
    }
  } catch {
    // ignore corrupted localStorage
  }
  return defaults;
}

function persistData(state: EternalRealmsState) {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      gold: state.gold,
      heroExp: state.heroExp,
      essenceGems: state.essenceGems,
      summonScrolls: state.summonScrolls,
      ascensionStones: state.ascensionStones,
      idleAccumulatedSeconds: state.idleAccumulatedSeconds,
      ownedHeroes: state.ownedHeroes,
      formation: state.formation,
      savedPresets: state.savedPresets,
      currentStageId: state.currentStageId,
      maxUnlockedStageId: state.maxUnlockedStageId,
      clearedStageIds: state.clearedStageIds,
      battleSpeed: state.battleSpeed,
      autoUltimate: state.autoUltimate,
      pityCounter: state.pityCounter,
      totalSummons: state.totalSummons,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage quota errors
  }
}

export const useGameStore = create<EternalRealmsState>((set, get) => {
  const initial = loadSavedData();

  return {
    activeScreen: 'battle',
    selectedHeroId: 'celestial_guardian',
    toastMessage: null,

    ...initial,
    battleInstanceKey: 1,
    lastSummonResults: [],

    setActiveScreen: (screen, inspectHeroId) => {
      set((state) => ({
        activeScreen: screen,
        selectedHeroId: inspectHeroId ?? state.selectedHeroId,
      }));
    },

    setSelectedHeroId: (heroId) => {
      set({ selectedHeroId: heroId });
    },

    showToast: (msg) => {
      set({ toastMessage: msg });
    },

    clearToast: () => {
      set({ toastMessage: null });
    },

    toggleBattleSpeed: () => {
      set((state) => {
        const nextSpeed = state.battleSpeed === 1 ? 2 : 1;
        const next = { ...state, battleSpeed: nextSpeed as 1 | 2 };
        persistData(next);
        return { battleSpeed: nextSpeed as 1 | 2 };
      });
    },

    toggleAutoUltimate: () => {
      set((state) => {
        const nextAuto = !state.autoUltimate;
        const next = { ...state, autoUltimate: nextAuto };
        persistData(next);
        return { autoUltimate: nextAuto };
      });
    },

    restartCurrentBattle: () => {
      set((state) => ({
        battleInstanceKey: state.battleInstanceKey + 1,
        activeScreen: 'battle',
      }));
    },

    assignHeroToSlot: (heroId, slotIndex) => {
      if (slotIndex < 0 || slotIndex > 4) return;
      const state = get();
      if (!state.ownedHeroes[heroId]) {
        state.showToast('Hãy chiêu mộ Anh Hùng này trước khi xếp vào đội hình!');
        return;
      }

      const nextFormation = [...state.formation] as TeamFormationSlots;
      const existingSlotIndex = nextFormation.findIndex((id) => id === heroId);
      const occupantAtTarget = nextFormation[slotIndex];

      if (existingSlotIndex !== -1) {
        // Swap positions so hero never occupies multiple slots
        nextFormation[existingSlotIndex] = occupantAtTarget;
      }
      nextFormation[slotIndex] = heroId;

      const check = validateTeamFormation(nextFormation);
      if (!check.valid) {
        state.showToast(check.error || 'Đội hình không hợp lệ');
        return;
      }

      const heroDef = getHeroById(heroId);
      const posLabel = slotIndex < 2 ? `Tiền Tuyến #${slotIndex + 1}` : `Hậu Phương #${slotIndex + 1}`;

      set((prev) => {
        const updated = {
          ...prev,
          formation: nextFormation,
          battleInstanceKey: prev.battleInstanceKey + 1,
          toastMessage: `Đã xếp ${heroDef.name} vào vị trí ${posLabel}!`,
        };
        persistData(updated);
        return updated;
      });
    },

    swapFormationSlots: (fromIndex, toIndex) => {
      if (
        fromIndex < 0 ||
        fromIndex > 4 ||
        toIndex < 0 ||
        toIndex > 4 ||
        fromIndex === toIndex
      ) {
        return;
      }
      set((state) => {
        const nextFormation = [...state.formation] as TeamFormationSlots;
        const temp = nextFormation[fromIndex];
        nextFormation[fromIndex] = nextFormation[toIndex];
        nextFormation[toIndex] = temp;

        const updated = {
          ...state,
          formation: nextFormation,
          battleInstanceKey: state.battleInstanceKey + 1,
          toastMessage: `Đã hoán đổi vị trí Ô #${fromIndex + 1} và Ô #${toIndex + 1}!`,
        };
        persistData(updated);
        return updated;
      });
    },

    removeHeroFromSlot: (slotIndex) => {
      const state = get();
      const activeCount = state.formation.filter(Boolean).length;
      if (activeCount <= 1) {
        state.showToast('Đội hình phải có ít nhất 1 Anh Hùng xuất trận!');
        return;
      }
      set((prev) => {
        const nextFormation = [...prev.formation] as TeamFormationSlots;
        nextFormation[slotIndex] = null;
        const updated = {
          ...prev,
          formation: nextFormation,
          battleInstanceKey: prev.battleInstanceKey + 1,
          toastMessage: `Đã rút tướng khỏi Ô #${slotIndex + 1}.`,
        };
        persistData(updated);
        return updated;
      });
    },

    saveTeamPreset: (name) => {
      const trimmed = name.trim() || `Đội Hình Chiến Thuật #${get().savedPresets.length + 1}`;
      set((state) => {
        const newPreset: SavedTeamPreset = {
          id: `preset_${Date.now()}`,
          name: trimmed,
          slots: [...state.formation] as TeamFormationSlots,
        };
        const updated = {
          ...state,
          savedPresets: [...state.savedPresets, newPreset],
          toastMessage: `Đã lưu đội hình "${trimmed}"!`,
        };
        persistData(updated);
        return updated;
      });
    },

    loadTeamPreset: (presetId) => {
      const state = get();
      const preset = state.savedPresets.find((p) => p.id === presetId);
      if (!preset) return;
      const validSlots = preset.slots.map((id) =>
        id && state.ownedHeroes[id] ? id : null
      ) as TeamFormationSlots;
      if (validSlots.filter(Boolean).length === 0) return;

      set((prev) => {
        const updated = {
          ...prev,
          formation: validSlots,
          battleInstanceKey: prev.battleInstanceKey + 1,
          toastMessage: `Đã tải đội hình "${preset.name}"!`,
        };
        persistData(updated);
        return updated;
      });
    },

    levelUpHero: (heroId) => {
      const state = get();
      const owned = state.ownedHeroes[heroId];
      if (!owned) return false;
      const cost = getHeroLevelUpCost(owned.level);

      if (
        state.gold < cost.gold ||
        state.heroExp < cost.heroExp ||
        state.ascensionStones < cost.ascensionStones
      ) {
        state.showToast('Không đủ Vàng, EXP hoặc Đá Thăng Hoa để tăng cấp!');
        return false;
      }

      soundEngine.playLevelUp();
      const def = getHeroById(heroId);

      set((prev) => {
        const target = prev.ownedHeroes[heroId];
        const nextOwned: OwnedHeroState = {
          ...target,
          level: target.level + 1,
        };
        const updated: EternalRealmsState = {
          ...prev,
          gold: prev.gold - cost.gold,
          heroExp: prev.heroExp - cost.heroExp,
          ascensionStones: prev.ascensionStones - cost.ascensionStones,
          ownedHeroes: {
            ...prev.ownedHeroes,
            [heroId]: nextOwned,
          },
          battleInstanceKey: prev.formation.includes(heroId)
            ? prev.battleInstanceKey + 1
            : prev.battleInstanceKey,
          toastMessage: `Đã nâng cấp ${def.name} lên Cấp ${nextOwned.level}!`,
        };
        persistData(updated);
        return updated;
      });
      return true;
    },

    ascendHeroStar: (heroId) => {
      const state = get();
      const owned = state.ownedHeroes[heroId];
      if (!owned || owned.stars >= 5) return false;
      const copiesNeeded = owned.stars * 2;
      if (owned.copies < copiesNeeded) {
        state.showToast(`Cần ${copiesNeeded} Bản Sao (Mảnh Tướng) để Đột Phá Sao!`);
        return false;
      }

      soundEngine.playLevelUp();
      const def = getHeroById(heroId);

      set((prev) => {
        const target = prev.ownedHeroes[heroId];
        const nextOwned: OwnedHeroState = {
          ...target,
          stars: target.stars + 1,
          copies: target.copies - copiesNeeded,
        };
        const updated: EternalRealmsState = {
          ...prev,
          ownedHeroes: {
            ...prev.ownedHeroes,
            [heroId]: nextOwned,
          },
          battleInstanceKey: prev.formation.includes(heroId)
            ? prev.battleInstanceKey + 1
            : prev.battleInstanceKey,
          toastMessage: `Đột Phá thành công: ${def.name} đạt ${nextOwned.stars}★!`,
        };
        persistData(updated);
        return updated;
      });
      return true;
    },

    upgradeEquipment: (heroId, slot) => {
      const state = get();
      const owned = state.ownedHeroes[heroId];
      if (!owned) return false;
      const currentTier = owned.equipment[slot];
      if (currentTier >= 10) {
        state.showToast('Trang bị này đã đạt cấp tối đa (Bậc 10)!');
        return false;
      }

      const { gold } = getEquipmentUpgradeCost(currentTier);
      if (state.gold < gold) {
        state.showToast(`Cần ${gold.toLocaleString()} Vàng để cường hóa trang bị!`);
        return false;
      }

      soundEngine.playLevelUp();
      const slotNames = {
        weapon: 'Vũ Khí Thần Binh',
        armor: 'Giáp Hộ Mệnh',
        relic: 'Thánh Vật Cổ Ngữ',
      };

      set((prev) => {
        const target = prev.ownedHeroes[heroId];
        const nextOwned: OwnedHeroState = {
          ...target,
          equipment: {
            ...target.equipment,
            [slot]: currentTier + 1,
          },
        };
        const updated: EternalRealmsState = {
          ...prev,
          gold: prev.gold - gold,
          ownedHeroes: {
            ...prev.ownedHeroes,
            [heroId]: nextOwned,
          },
          battleInstanceKey: prev.formation.includes(heroId)
            ? prev.battleInstanceKey + 1
            : prev.battleInstanceKey,
          toastMessage: `Đã rèn ${slotNames[slot]} lên Bậc ${currentTier + 1}!`,
        };
        persistData(updated);
        return updated;
      });
      return true;
    },

    autoUpgradeSquad: () => {
      const state = get();
      let gold = state.gold;
      let heroExp = state.heroExp;
      let stones = state.ascensionStones;
      const nextOwnedMap = { ...state.ownedHeroes };
      let upgradesCount = 0;

      const deployedIds = state.formation.filter((id): id is string => Boolean(id));
      const targetIds = deployedIds.length > 0 ? deployedIds : Object.keys(nextOwnedMap);

      for (let step = 0; step < 25; step++) {
        const sorted = [...targetIds]
          .filter((id) => Boolean(nextOwnedMap[id]))
          .sort((a, b) => nextOwnedMap[a].level - nextOwnedMap[b].level);

        let didAny = false;
        for (const id of sorted) {
          const h = nextOwnedMap[id];
          const cost = getHeroLevelUpCost(h.level);
          if (
            gold >= cost.gold &&
            heroExp >= cost.heroExp &&
            stones >= cost.ascensionStones
          ) {
            gold -= cost.gold;
            heroExp -= cost.heroExp;
            stones -= cost.ascensionStones;
            nextOwnedMap[id] = {
              ...h,
              level: h.level + 1,
            };
            upgradesCount++;
            didAny = true;
            break;
          }
        }
        if (!didAny) break;
      }

      if (upgradesCount > 0) {
        soundEngine.playLevelUp();
        set((prev) => {
          const updated: EternalRealmsState = {
            ...prev,
            gold,
            heroExp,
            ascensionStones: stones,
            ownedHeroes: nextOwnedMap,
            battleInstanceKey: prev.battleInstanceKey + 1,
            toastMessage: `Nâng Cấp Tự Động: Đã tăng tổng cộng +${upgradesCount} Cấp cho đội hình xuất trận!`,
          };
          persistData(updated);
          return updated;
        });
      } else {
        state.showToast('Cần thêm Vàng hoặc EXP Tướng để nâng cấp đội hình!');
      }

      return upgradesCount;
    },

    recruitHeroDirect: (heroId) => {
      const state = get();
      if (state.ownedHeroes[heroId]) {
        state.showToast('Bạn đã sở hữu Anh Hùng này!');
        return false;
      }
      const def = getHeroById(heroId);
      let scrolls = state.summonScrolls;
      let gems = state.essenceGems;

      if (scrolls >= 2) {
        scrolls -= 2;
      } else if (gems >= 600) {
        gems -= 600;
      } else {
        state.showToast('Cần 2 Cuộn Triệu Hồi hoặc 600 Tinh Thạch để chiêu mộ!');
        return false;
      }

      soundEngine.playGachaSummon(def.rarity === 'Ascended');

      set((prev) => {
        const nextOwned: OwnedHeroState = {
          heroId: def.id,
          level: 3,
          stars: def.rarity === 'Ascended' ? 2 : 1,
          copies: 1,
          equipment: { weapon: 1, armor: 1, relic: 1 },
        };
        const nextFormation = [...prev.formation] as TeamFormationSlots;
        const emptyIdx = nextFormation.findIndex((s) => s === null);
        if (emptyIdx !== -1) {
          nextFormation[emptyIdx] = def.id;
        }
        const updated: EternalRealmsState = {
          ...prev,
          summonScrolls: scrolls,
          essenceGems: gems,
          ownedHeroes: {
            ...prev.ownedHeroes,
            [def.id]: nextOwned,
          },
          formation: nextFormation,
          toastMessage: `Đã chiêu mộ thành công ${def.name}!`,
        };
        persistData(updated);
        return updated;
      });
      return true;
    },

    unlockAllRepoHeroes: () => {
      soundEngine.playGachaSummon(true);
      set((prev) => {
        const nextOwned: Record<string, OwnedHeroState> = { ...prev.ownedHeroes };
        for (const h of HERO_ROSTER) {
          if (!nextOwned[h.id]) {
            nextOwned[h.id] = {
              heroId: h.id,
              level: 5,
              stars: h.rarity === 'Ascended' ? 3 : 2,
              copies: 4,
              equipment: { weapon: 2, armor: 2, relic: 2 },
            };
          }
        }
        const updated: EternalRealmsState = {
          ...prev,
          ownedHeroes: nextOwned,
          gold: prev.gold + 35000,
          heroExp: prev.heroExp + 28000,
          essenceGems: prev.essenceGems + 6000,
          summonScrolls: prev.summonScrolls + 20,
          toastMessage: `Đã mở khóa toàn bộ ${HERO_ROSTER.length} Anh Hùng từ 4 Repo + Tặng 35.000 Vàng & 20 Cuộn Triệu Hồi!`,
        };
        persistData(updated);
        return updated;
      });
    },

    deployShowcaseTeam: (teamIds, label) => {
      soundEngine.playUltimateCast();
      set((prev) => {
        const nextOwned: Record<string, OwnedHeroState> = { ...prev.ownedHeroes };
        for (const id of teamIds) {
          if (!id) continue;
          const def = getHeroById(id);
          if (!nextOwned[def.id]) {
            nextOwned[def.id] = {
              heroId: def.id,
              level: 6,
              stars: 3,
              copies: 4,
              equipment: { weapon: 2, armor: 2, relic: 2 },
            };
          }
        }
        const updated: EternalRealmsState = {
          ...prev,
          ownedHeroes: nextOwned,
          formation: [...teamIds] as TeamFormationSlots,
          activeScreen: 'battle',
          battleInstanceKey: prev.battleInstanceKey + 1,
          toastMessage: `Đã triệu hồi & xuất trận đội hình: ${label}!`,
        };
        persistData(updated);
        return updated;
      });
    },

    selectCampaignStage: (stageId, startImmediately = true) => {
      const state = get();
      if (stageId > state.maxUnlockedStageId) {
        state.showToast(`Hãy vượt qua Ải 1-${stageId - 1} trước để mở khóa ải này!`);
        return;
      }
      set((prev) => {
        const updated: EternalRealmsState = {
          ...prev,
          currentStageId: stageId,
          activeScreen: startImmediately ? 'battle' : prev.activeScreen,
          battleInstanceKey: prev.battleInstanceKey + 1,
        };
        persistData(updated);
        return updated;
      });
    },

    recordBattleOutcome: (stageId, didWin) => {
      const state = get();
      const stage = getCampaignStage(stageId);
      const isFirstClear = didWin && !state.clearedStageIds.includes(stageId);

      if (!didWin) {
        const consolationGold = Math.round(stage.replayRewards.gold * 0.35);
        const consolationExp = Math.round(stage.replayRewards.heroExp * 0.35);
        set((prev) => {
          const updated: EternalRealmsState = {
            ...prev,
            gold: prev.gold + consolationGold,
            heroExp: prev.heroExp + consolationExp,
          };
          persistData(updated);
          return updated;
        });
        return {
          stageId,
          didWin: false,
          isFirstClear: false,
          gold: consolationGold,
          heroExp: consolationExp,
          essenceGems: 0,
          summonScrolls: 0,
          unlockedNextStage: false,
        };
      }

      const gold = isFirstClear
        ? stage.firstClearRewards.gold
        : stage.replayRewards.gold;
      const heroExp = isFirstClear
        ? stage.firstClearRewards.heroExp
        : stage.replayRewards.heroExp;
      const essenceGems = isFirstClear
        ? stage.firstClearRewards.essenceGems
        : stage.replayRewards.essenceGems;
      const summonScrolls = isFirstClear
        ? stage.firstClearRewards.summonScrolls
        : 0;

      const nextStageId = Math.min(CAMPAIGN_STAGES.length, stageId + 1);
      const unlockedNextStage = nextStageId > state.maxUnlockedStageId;

      set((prev) => {
        const nextCleared = prev.clearedStageIds.includes(stageId)
          ? prev.clearedStageIds
          : [...prev.clearedStageIds, stageId];
        const updated: EternalRealmsState = {
          ...prev,
          gold: prev.gold + gold,
          heroExp: prev.heroExp + heroExp,
          essenceGems: prev.essenceGems + essenceGems,
          summonScrolls: prev.summonScrolls + summonScrolls,
          ascensionStones: prev.ascensionStones + (isFirstClear ? 35 : 8),
          clearedStageIds: nextCleared,
          maxUnlockedStageId: Math.max(prev.maxUnlockedStageId, nextStageId),
        };
        persistData(updated);
        return updated;
      });

      return {
        stageId,
        didWin: true,
        isFirstClear,
        gold,
        heroExp,
        essenceGems,
        summonScrolls,
        unlockedNextStage,
      };
    },

    tickIdleTimer: (seconds) => {
      set((prev) => ({
        idleAccumulatedSeconds: Math.min(
          43200,
          prev.idleAccumulatedSeconds + seconds
        ),
      }));
    },

    claimIdleTribute: () => {
      const state = get();
      const minutes = Math.max(2, Math.floor(state.idleAccumulatedSeconds / 60));
      const stageFactor = 1 + (state.maxUnlockedStageId - 1) * 0.25;
      const goldGain = Math.round(minutes * 65 * stageFactor);
      const expGain = Math.round(minutes * 52 * stageFactor);
      const gemGain = Math.round(minutes * 4);

      soundEngine.playLevelUp();

      set((prev) => {
        const updated: EternalRealmsState = {
          ...prev,
          gold: prev.gold + goldGain,
          heroExp: prev.heroExp + expGain,
          essenceGems: prev.essenceGems + gemGain,
          idleAccumulatedSeconds: 0,
          toastMessage: `Đã nhận Kho Báu AFK: +${goldGain.toLocaleString()} Vàng, +${expGain.toLocaleString()} EXP, +${gemGain} Tinh Thạch!`,
        };
        persistData(updated);
        return updated;
      });
    },

    summonHeroes: (count) => {
      const state = get();
      const gemCost = count === 10 ? 2400 : 300;
      let nextScrolls = state.summonScrolls;
      let nextGems = state.essenceGems;

      if (nextScrolls >= count) {
        nextScrolls -= count;
      } else if (nextGems >= gemCost) {
        nextGems -= gemCost;
      } else {
        state.showToast(
          `Không đủ Cuộn Triệu Hồi hoặc Tinh Thạch! Hãy bấm "Nhận Tiếp Tế Miễn Phí" bên dưới.`
        );
        return [];
      }

      const nextOwned = { ...state.ownedHeroes };
      let pity = state.pityCounter;
      const results: SummonPullResult[] = [];

      const ascendedPool = HERO_ROSTER.filter((h) => h.rarity === 'Ascended');
      const legendaryPool = HERO_ROSTER.filter((h) => h.rarity !== 'Ascended');

      for (let i = 0; i < count; i++) {
        pity++;
        const isAscended = pity >= 10 || Math.random() < 0.28;
        if (isAscended) pity = 0;

        const pool = isAscended ? ascendedPool : legendaryPool;
        const chosen = pool[Math.floor(Math.random() * pool.length)] || HERO_ROSTER[0];
        const alreadyOwned = Boolean(nextOwned[chosen.id]);

        if (alreadyOwned) {
          nextOwned[chosen.id] = {
            ...nextOwned[chosen.id],
            copies: nextOwned[chosen.id].copies + 2,
          };
          results.push({
            hero: chosen,
            isNew: false,
            copiesGranted: 2,
          });
        } else {
          nextOwned[chosen.id] = {
            heroId: chosen.id,
            level: 1,
            stars: chosen.rarity === 'Ascended' ? 2 : 1,
            copies: 1,
            equipment: { weapon: 1, armor: 1, relic: 1 },
          };
          results.push({
            hero: chosen,
            isNew: true,
            copiesGranted: 1,
          });
        }
      }

      const hasAscended = results.some((r) => r.hero.rarity === 'Ascended');
      soundEngine.playGachaSummon(hasAscended);

      set((prev) => {
        const updated: EternalRealmsState = {
          ...prev,
          summonScrolls: nextScrolls,
          essenceGems: nextGems,
          ownedHeroes: nextOwned,
          pityCounter: pity,
          totalSummons: prev.totalSummons + count,
          lastSummonResults: results,
          toastMessage: `Đã triệu hồi ${count} Anh Hùng tại Thánh Điện!`,
        };
        persistData(updated);
        return updated;
      });

      return results;
    },

    claimFreeSanctumGift: () => {
      soundEngine.playLevelUp();
      set((prev) => {
        const updated: EternalRealmsState = {
          ...prev,
          summonScrolls: prev.summonScrolls + 10,
          essenceGems: prev.essenceGems + 2400,
          gold: prev.gold + 10000,
          heroExp: prev.heroExp + 8000,
          toastMessage:
            'Đã nhận Quà Tiếp Tế Thánh Điện: +10 Cuộn Triệu Hồi, +2.400 Tinh Thạch & +10.000 Vàng!',
        };
        persistData(updated);
        return updated;
      });
    },

    clearSummonResults: () => {
      set({ lastSummonResults: [] });
    },
  };
});
