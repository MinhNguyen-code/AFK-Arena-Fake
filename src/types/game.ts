export type FactionId =
  | 'solar_order'
  | 'ironclad_clan'
  | 'sylvan_glade'
  | 'nether_pact'
  | 'astral_choir'
  | 'abyssal_void';

export type HeroRole = 'TANK' | 'DPS' | 'SUPPORT' | 'CC' | 'HYBRID';

export type HeroClass =
  | 'Paladin'
  | 'Berserker'
  | 'Ranger'
  | 'Arcanist'
  | 'Oracle'
  | 'Assassin'
  | 'Warden';

export type HeroRarity = 'Elite' | 'Epic' | 'Legendary' | 'Ascended';

export type DamageType = 'physical' | 'magical';

export type TargetPriority =
  | 'nearest'
  | 'lowest_hp'
  | 'highest_atk'
  | 'frontline'
  | 'random'
  | 'aoe';

export type StatusEffectType =
  | 'stun'
  | 'silence'
  | 'slow'
  | 'atk_up'
  | 'def_up'
  | 'spd_up'
  | 'burn'
  | 'regen';

export type EquipmentSlotType = 'weapon' | 'armor' | 'boots' | 'accessory';

export type EquipmentRarity = 'Common' | 'Rare' | 'Epic' | 'Mythic';

export type CharacterAnimState =
  | 'idle'
  | 'move'
  | 'attack'
  | 'skill'
  | 'hit'
  | 'defeat'
  | 'ultimate';

export interface StatusEffectSpec {
  type: StatusEffectType;
  durationSec: number;
  magnitude: number;
  targetSelfOrAlly?: boolean;
}

export interface HeroSkillSpec {
  id: string;
  name: string;
  description: string;
  cooldownSec: number;
  damageMultiplier: number;
  healMultiplier?: number;
  shieldMultiplier?: number;
  energyRestore?: number;
  targetPriority: TargetPriority;
  isAoe?: boolean;
  statusEffect?: StatusEffectSpec;
  vfxColor: string;
  vfxShape: 'beam' | 'nova' | 'slash' | 'meteor' | 'arrow_rain' | 'sanctuary' | 'void_rift';
}

export interface HeroPassiveSpec {
  id: string;
  name: string;
  description: string;
  bonusHpPct?: number;
  bonusAtkPct?: number;
  bonusDefPct?: number;
  bonusCritChance?: number;
  startingShieldPct?: number;
  lifestealPct?: number;
  energyPerSec?: number;
}

export interface HeroVisualStyle {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  glowColor: string;
  weaponType: 'sword_shield' | 'greatsword' | 'staff' | 'bow' | 'twin_daggers' | 'halberd' | 'tome';
  headgear: 'crown' | 'horned_helm' | 'hood' | 'halo' | 'circlet' | 'mask';
  hasWings?: boolean;
  hasCape?: boolean;
}

export interface HeroDefinition {
  id: string;
  name: string;
  title: string;
  lore: string;
  faction: FactionId;
  role: HeroRole;
  heroClass: HeroClass;
  baseRarity: HeroRarity;
  damageType: DamageType;
  isMelee: boolean;
  attackRange: number;
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    critChance: number;
    critDamage: number;
  };
  basicAttack: {
    name: string;
    description: string;
    multiplier: number;
    targetPriority: TargetPriority;
  };
  activeSkill: HeroSkillSpec;
  ultimateSkill: HeroSkillSpec;
  passiveSkill: HeroPassiveSpec;
  visual: HeroVisualStyle;
}

export interface EquipmentTemplate {
  id: string;
  name: string;
  slot: EquipmentSlotType;
  rarity: EquipmentRarity;
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  baseCritChance: number;
  description: string;
}

export interface OwnedEquipmentItem {
  instanceId: string;
  templateId: string;
  level: number;
  equippedHeroId: string | null;
}

export interface OwnedHeroState {
  heroId: string;
  level: number;
  ascensionRank: number;
  stars: number;
  shards: number;
  equipment: Record<EquipmentSlotType, string | null>;
}

export interface ComputedHeroStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  critChance: number;
  critDamage: number;
  combatPower: number;
}

export type FormationSlots = [
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
];

export interface TeamPreset {
  id: string;
  name: string;
  slots: FormationSlots;
}

export interface StageEnemyUnitSpec {
  heroId: string;
  slotIndex: number;
  level: number;
  stars: number;
  ascensionRank: number;
  isBoss?: boolean;
}

export interface CampaignStageDefinition {
  id: string;
  stageNumber: number;
  chapter: number;
  stageInChapter: number;
  name: string;
  chapterTitle: string;
  description: string;
  theme: 'dawn_valley' | 'iron_citadel' | 'void_rift';
  enemies: StageEnemyUnitSpec[];
  firstClearReward: {
    gold: number;
    heroExp: number;
    astralGems: number;
    summonScrolls: number;
    equipmentTemplateId?: string;
  };
  repeatReward: {
    gold: number;
    heroExp: number;
    arcaneEssence: number;
  };
}

export interface ActiveStatusEffect {
  id: string;
  type: StatusEffectType;
  remainingSec: number;
  magnitude: number;
  sourceUnitId: string;
}

export interface CombatUnitState {
  unitId: string;
  heroId: string;
  name: string;
  title: string;
  team: 'ally' | 'enemy';
  slotIndex: number;
  isFrontline: boolean;
  isBoss: boolean;
  role: HeroRole;
  faction: FactionId;
  damageType: DamageType;
  isMelee: boolean;
  attackRange: number;
  level: number;
  stars: number;
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  critChance: number;
  critDamage: number;
  shield: number;
  energy: number;
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  animState: CharacterAnimState;
  animTimer: number;
  attackCooldown: number;
  activeSkillCooldown: number;
  statusEffects: ActiveStatusEffect[];
  totalDamageDealt: number;
  totalHealingDone: number;
  totalDamageTaken: number;
  isAlive: boolean;
}

export interface CombatEvent {
  id: number;
  timestampSec: number;
  type:
    | 'basic_attack'
    | 'active_skill'
    | 'ultimate_skill'
    | 'damage'
    | 'heal'
    | 'shield'
    | 'status_applied'
    | 'unit_defeated'
    | 'battle_end';
  actorUnitId: string;
  targetUnitId?: string;
  skillName?: string;
  value?: number;
  isCrit?: boolean;
  damageType?: DamageType;
  statusType?: StatusEffectType;
  vfxShape?: HeroSkillSpec['vfxShape'];
  vfxColor?: string;
}

export interface CombatResultSummary {
  stageId: string;
  outcome: 'victory' | 'defeat';
  durationSec: number;
  seed: number;
  allySurvivors: number;
  enemySurvivors: number;
  unitStats: Array<{
    unitId: string;
    heroId: string;
    name: string;
    team: 'ally' | 'enemy';
    damageDealt: number;
    healingDone: number;
    damageTaken: number;
    survived: boolean;
  }>;
  rewardsGranted?: {
    isFirstClear: boolean;
    gold: number;
    heroExp: number;
    astralGems: number;
    arcaneEssence: number;
    summonScrolls: number;
    equipmentDropped?: string;
  };
}

export type AppScreenId =
  | 'home'
  | 'heroes'
  | 'hero_detail'
  | 'formation'
  | 'campaign'
  | 'battle'
  | 'inventory'
  | 'summon';

export interface SummonPullResult {
  heroId: string;
  rarity: HeroRarity;
  isNew: boolean;
  shardsGranted: number;
  isPity: boolean;
}

export interface GameSaveData {
  version: number;
  gold: number;
  heroExp: number;
  arcaneEssence: number;
  astralGems: number;
  summonScrolls: number;
  pityCounter: number;
  totalSummons: number;
  currentStageId: string;
  clearedStageIds: string[];
  lastOfflineClaimTimestamp: number;
  ownedHeroes: Record<string, OwnedHeroState>;
  formation: FormationSlots;
  presets: TeamPreset[];
  inventory: OwnedEquipmentItem[];
  settings: {
    battleSpeed: 1 | 2;
    autoSkill: boolean;
    reducedMotion: boolean;
    soundEnabled: boolean;
  };
}
