import {
  HeroDefinition,
  OwnedHeroState,
  OwnedEquipmentItem,
  ComputedHeroStats,
  FormationSlots,
  EquipmentSlotType,
  SummonPullResult,
  GameSaveData,
} from '../../types/game';
import { getHeroDefinition, HERO_DEFINITIONS } from '../../data/heroes';
import { getEquipmentTemplate } from '../../data/equipment';
import { SeededRng } from '../core/rng';

export const ASCENSION_RANK_NAMES = [
  'Tinh Anh (Elite)',
  'Tinh Anh+ (Elite+)',
  'Sử Thi (Epic)',
  'Sử Thi+ (Epic+)',
  'Huyền Thoại (Legendary)',
  'Thần Thoại (Ascended)',
] as const;

export const SUMMON_DROP_RATES = {
  Ascended: 15,
  Legendary: 30,
  Elite: 55,
  pityThreshold: 20,
  singleGemCost: 300,
  tenGemCost: 2700,
} as const;

export function computeHeroCombatStats(
  heroDef: HeroDefinition,
  owned: Pick<OwnedHeroState, 'level' | 'ascensionRank' | 'stars' | 'equipment'>,
  inventory: OwnedEquipmentItem[] = []
): ComputedHeroStats {
  const levelGrowth = 1 + (Math.max(1, owned.level) - 1) * 0.095;
  const starMultiplier = 1 + (Math.max(1, owned.stars) - 1) * 0.14;
  const ascensionMultiplier = 1 + Math.max(0, owned.ascensionRank) * 0.12;
  const totalScalar = levelGrowth * starMultiplier * ascensionMultiplier;

  let hp = Math.round(heroDef.baseStats.hp * totalScalar);
  let attack = Math.round(heroDef.baseStats.attack * totalScalar);
  let defense = Math.round(heroDef.baseStats.defense * totalScalar);
  let speed = heroDef.baseStats.speed;
  let critChance = heroDef.baseStats.critChance;
  const critDamage = heroDef.baseStats.critDamage + Math.max(0, owned.stars - 1) * 5;

  const passive = heroDef.passiveSkill;
  if (passive.bonusHpPct) {
    hp = Math.round(hp * (1 + passive.bonusHpPct));
  }
  if (passive.bonusAtkPct) {
    attack = Math.round(attack * (1 + passive.bonusAtkPct));
  }
  if (passive.bonusDefPct) {
    defense = Math.round(defense * (1 + passive.bonusDefPct));
  }
  if (passive.bonusCritChance) {
    critChance += passive.bonusCritChance;
  }

  const slots: EquipmentSlotType[] = ['weapon', 'armor', 'boots', 'accessory'];
  for (const slot of slots) {
    const instanceId = owned.equipment?.[slot];
    if (!instanceId) continue;
    const itemInstance = inventory.find((it) => it.instanceId === instanceId);
    if (!itemInstance) continue;
    const tmpl = getEquipmentTemplate(itemInstance.templateId);
    const enhanceMult = 1 + itemInstance.level * 0.12;
    hp += Math.round(tmpl.baseHp * enhanceMult);
    attack += Math.round(tmpl.baseAttack * enhanceMult);
    defense += Math.round(tmpl.baseDefense * enhanceMult);
    speed += Math.round(tmpl.baseSpeed * (1 + itemInstance.level * 0.05));
    critChance += tmpl.baseCritChance;
  }

  critChance = Math.min(85, Math.max(5, Math.round(critChance)));

  const combatPower = Math.round(
    hp * 0.25 +
      attack * 4.2 +
      defense * 3.1 +
      speed * 5.0 +
      critChance * 14 +
      (critDamage - 150) * 6
  );

  return {
    hp,
    attack,
    defense,
    speed,
    critChance,
    critDamage,
    combatPower,
  };
}

export function getHeroLevelUpCost(currentLevel: number): {
  gold: number;
  heroExp: number;
  arcaneEssence: number;
} {
  const lv = Math.max(1, currentLevel);
  const gold = Math.round(140 * Math.pow(1.13, lv - 1));
  const heroExp = Math.round(110 * Math.pow(1.13, lv - 1));
  const isBreakthrough = lv % 10 === 0;
  const arcaneEssence = isBreakthrough ? Math.round(25 * Math.pow(1.35, lv / 10 - 1)) : 0;
  return { gold, heroExp, arcaneEssence };
}

export function getHeroAscensionCost(currentStars: number): {
  shardsNeeded: number;
  goldCost: number;
} {
  const s = Math.max(1, currentStars);
  return {
    shardsNeeded: s * 2,
    goldCost: s * 800,
  };
}

export function getEquipmentUpgradeCost(currentLevel: number): {
  gold: number;
} {
  return {
    gold: Math.round(250 * Math.pow(1.28, Math.max(0, currentLevel))),
  };
}

export function validateFormation(
  slots: FormationSlots,
  ownedHeroes: Record<string, OwnedHeroState>
): { valid: boolean; error?: string; cleanedSlots: FormationSlots } {
  const seen = new Set<string>();
  const cleaned: FormationSlots = [null, null, null, null, null];

  for (let i = 0; i < 5; i++) {
    const hId = slots[i];
    if (!hId) continue;
    if (!ownedHeroes[hId]) continue;
    if (seen.has(hId)) {
      return {
        valid: false,
        error: 'Một tướng không thể chiếm 2 vị trí trong cùng đội hình.',
        cleanedSlots: cleaned,
      };
    }
    seen.add(hId);
    cleaned[i] = hId;
  }

  if (seen.size === 0) {
    return {
      valid: false,
      error: 'Đội hình phải có ít nhất 1 Anh Hùng xuất trận.',
      cleanedSlots: cleaned,
    };
  }

  return { valid: true, cleanedSlots: cleaned };
}

export function calculateTeamPower(
  slots: FormationSlots,
  ownedHeroes: Record<string, OwnedHeroState>,
  inventory: OwnedEquipmentItem[]
): number {
  let total = 0;
  for (const heroId of slots) {
    if (!heroId) continue;
    const owned = ownedHeroes[heroId];
    if (!owned) continue;
    const def = getHeroDefinition(heroId);
    total += computeHeroCombatStats(def, owned, inventory).combatPower;
  }
  return total;
}

export function calculateFactionSynergy(slots: FormationSlots): {
  bonusHpPct: number;
  bonusAtkPct: number;
  label: string;
} {
  const counts: Record<string, number> = {};
  let astralCount = 0;
  let totalDeployed = 0;

  for (const hId of slots) {
    if (!hId) continue;
    totalDeployed++;
    const def = getHeroDefinition(hId);
    if (def.faction === 'astral_choir') {
      astralCount++;
    } else {
      counts[def.faction] = (counts[def.faction] || 0) + 1;
    }
  }

  if (totalDeployed === 0) {
    return { bonusHpPct: 0, bonusAtkPct: 0, label: 'Chưa có tướng xuất trận' };
  }

  const maxSameFaction = Math.max(0, ...Object.values(counts)) + astralCount;

  if (maxSameFaction >= 5) {
    return {
      bonusHpPct: 0.22,
      bonusAtkPct: 0.18,
      label: 'Ngũ Tinh Cộng Hưởng (+22% HP, +18% ATK)',
    };
  }
  if (maxSameFaction === 4) {
    return {
      bonusHpPct: 0.16,
      bonusAtkPct: 0.14,
      label: 'Tứ Trụ Đồng Tâm (+16% HP, +14% ATK)',
    };
  }
  if (maxSameFaction === 3) {
    return {
      bonusHpPct: 0.12,
      bonusAtkPct: 0.1,
      label: 'Tam Hợp Liên Kết (+12% HP, +10% ATK)',
    };
  }
  if (maxSameFaction === 2) {
    return {
      bonusHpPct: 0.07,
      bonusAtkPct: 0.06,
      label: 'Song Hệ Giao Hòa (+7% HP, +6% ATK)',
    };
  }

  return {
    bonusHpPct: 0.04,
    bonusAtkPct: 0.04,
    label: 'Liên Minh Đa Tộc (+4% HP, +4% ATK)',
  };
}

export const OFFLINE_CAP_SECONDS = 12 * 3600;

export function calculateOfflineRewards(
  clearedStageCount: number,
  elapsedSeconds: number
): {
  cappedSeconds: number;
  gold: number;
  heroExp: number;
  arcaneEssence: number;
  goldPerMin: number;
  expPerMin: number;
} {
  const cappedSeconds = Math.max(0, Math.min(OFFLINE_CAP_SECONDS, Math.floor(elapsedSeconds)));
  const minutes = cappedSeconds / 60;
  const stageMultiplier = 1 + Math.max(0, clearedStageCount) * 0.22;

  const goldPerMin = Math.round(90 * stageMultiplier);
  const expPerMin = Math.round(75 * stageMultiplier);

  return {
    cappedSeconds,
    gold: Math.round(minutes * goldPerMin),
    heroExp: Math.round(minutes * expPerMin),
    arcaneEssence: Math.round((minutes / 8) * (5 + clearedStageCount * 1.5)),
    goldPerMin,
    expPerMin,
  };
}

export function executeWeightedSummons(
  save: GameSaveData,
  count: 1 | 10,
  seed: number = Date.now()
): {
  nextSave: GameSaveData;
  results: SummonPullResult[];
  error?: string;
} {
  const gemCost = count === 1 ? SUMMON_DROP_RATES.singleGemCost : SUMMON_DROP_RATES.tenGemCost;
  const useScrolls = save.summonScrolls >= count;

  if (!useScrolls && save.astralGems < gemCost) {
    return {
      nextSave: save,
      results: [],
      error: `Không đủ tài nguyên! Cần ${count} Cuộn Triệu Hồi hoặc ${gemCost.toLocaleString()} Đá Tinh Tú.`,
    };
  }

  const rng = new SeededRng(seed);
  const nextOwned: Record<string, OwnedHeroState> = { ...save.ownedHeroes };
  let pity = save.pityCounter;
  const results: SummonPullResult[] = [];

  const ascendedPool = HERO_DEFINITIONS.filter((h) => h.baseRarity === 'Ascended');
  const legendaryPool = HERO_DEFINITIONS.filter((h) => h.baseRarity === 'Legendary');
  const elitePool = HERO_DEFINITIONS.filter((h) => h.baseRarity === 'Elite');

  for (let i = 0; i < count; i++) {
    pity += 1;
    const isPity = pity >= SUMMON_DROP_RATES.pityThreshold;
    const roll = rng.next() * 100;

    let chosenPool = elitePool;
    if (isPity || roll < SUMMON_DROP_RATES.Ascended) {
      chosenPool = ascendedPool;
      pity = 0;
    } else if (roll < SUMMON_DROP_RATES.Ascended + SUMMON_DROP_RATES.Legendary) {
      chosenPool = legendaryPool.length > 0 ? legendaryPool : ascendedPool;
    } else {
      chosenPool = rng.chance(40) ? HERO_DEFINITIONS : elitePool.length > 0 ? elitePool : HERO_DEFINITIONS;
    }

    const picked = rng.pick(chosenPool);
    const existing = nextOwned[picked.id];

    if (existing) {
      const shardsGranted = picked.baseRarity === 'Ascended' ? 3 : 2;
      nextOwned[picked.id] = {
        ...existing,
        shards: existing.shards + shardsGranted,
      };
      results.push({
        heroId: picked.id,
        rarity: picked.baseRarity,
        isNew: false,
        shardsGranted,
        isPity,
      });
    } else {
      nextOwned[picked.id] = {
        heroId: picked.id,
        level: 1,
        ascensionRank: picked.baseRarity === 'Ascended' ? 2 : picked.baseRarity === 'Legendary' ? 1 : 0,
        stars: picked.baseRarity === 'Ascended' ? 2 : 1,
        shards: 1,
        equipment: {
          weapon: null,
          armor: null,
          boots: null,
          accessory: null,
        },
      };
      results.push({
        heroId: picked.id,
        rarity: picked.baseRarity,
        isNew: true,
        shardsGranted: 0,
        isPity,
      });
    }
  }

  const nextSave: GameSaveData = {
    ...save,
    summonScrolls: useScrolls ? save.summonScrolls - count : save.summonScrolls,
    astralGems: useScrolls ? save.astralGems : save.astralGems - gemCost,
    pityCounter: pity,
    totalSummons: save.totalSummons + count,
    ownedHeroes: nextOwned,
  };

  return { nextSave, results };
}
