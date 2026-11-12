export type HeroClass =
  | 'Tank'
  | 'Damage Dealer'
  | 'Mage'
  | 'Support'
  | 'Crowd Controller';

export type FactionId =
  | 'Solar Order'
  | 'Crimson Covenant'
  | 'Verdant Wilds'
  | 'Arcane Conclave'
  | 'Shadow Court';

export type HeroRarity = 'Elite' | 'Legendary' | 'Ascended';

export type CrowdControlType =
  | 'stun'
  | 'silence'
  | 'slow'
  | 'knockback'
  | 'petrify';

export type BuffType = 'shield' | 'atk_up' | 'def_up' | 'spd_up' | 'regen';

export type StatusEffectType = CrowdControlType | BuffType;

export interface StatusEffectInstance {
  id: string;
  type: StatusEffectType;
  durationMs: number;
  remainingMs: number;
  magnitude: number; // e.g. shield HP, or percentage modifier (0.35 = 35%)
  sourceUnitId: string;
}

export type SkillTargetType =
  | 'current_target'
  | 'all_enemies'
  | 'frontline_enemies'
  | 'backline_enemy'
  | 'lowest_hp_ally'
  | 'all_allies'
  | 'self';

export interface HeroSkillSpec {
  name: string;
  description: string;
  cooldownMs: number; // 0 for basic attack / passive / ultimate (ultimate uses 100 energy)
  damageMultiplier: number; // % of ATK
  targetType: SkillTargetType;
  healMultiplier?: number; // % of ATK healed
  shieldMultiplier?: number; // % of maxHP or ATK as shield
  lifestealPct?: number; // 0..1 fraction of damage restored as HP
  energyGrant?: number; // bonus energy given to allies/self
  ccType?: CrowdControlType;
  ccDurationMs?: number;
  buffType?: BuffType;
  buffDurationMs?: number;
  buffMagnitude?: number;
  vfxColor: string;
  vfxShape: 'slash' | 'beam' | 'meteor' | 'lightning' | 'serpent' | 'nova' | 'arrow' | 'shadow';
}

export interface HeroVisualSpec {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  helmStyle: 'crown' | 'horned' | 'hood' | 'halo' | 'crest' | 'circlet';
  weaponStyle:
    | 'greatsword'
    | 'twinblades'
    | 'serpent_staff'
    | 'daggers'
    | 'storm_orb'
    | 'scepter'
    | 'warhammer'
    | 'longbow'
    | 'pyre_tome'
    | 'frost_halberd'
    | 'nature_harp'
    | 'void_glaive';
  capeStyle: 'royal' | 'wings' | 'tattered' | 'sylvan' | 'arcane';
}

export interface HeroDefinition {
  id: string;
  name: string;
  title: string;
  faction: FactionId;
  heroClass: HeroClass;
  rarity: HeroRarity;
  isRanged: boolean;
  attackRangePx: number;
  moveSpeedPxPerSec: number;
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    attackSpeed: number; // attacks per second (e.g. 0.85 to 1.35)
    critChance: number; // 0.05 to 0.45
    startingEnergy: number;
  };
  skills: {
    basic: HeroSkillSpec;
    active: HeroSkillSpec;
    ultimate: HeroSkillSpec;
    passive: {
      name: string;
      description: string;
      bonusHpPct: number;
      bonusAtkPct: number;
      bonusDefPct: number;
      bonusCritPct: number;
      bonusLifestealPct: number;
      openingShieldPct: number;
    };
  };
  lore: string;
  visual: HeroVisualSpec;
  // Repository & CDN Metadata (floofpire/cdn + AFKArenaCompanionsHub + AFKBuilder)
  unitId?: number;
  codeName?: string;
  repoFaction?:
    | 'Lightbearer'
    | 'Mauler'
    | 'Wilder'
    | 'Graveborn'
    | 'Celestial'
    | 'Hypogean'
    | 'Dimensional'
    | 'Draconis';
  rawClass?: string;
  isAwakened?: boolean;
  overallRank?: string;
  tierScore?: number;
  investment?: {
    minimum: string;
    optimal: string;
    competitive: string;
  };
  modes?: {
    arena: string;
    dreamRealm: string;
    guildHunt: string;
  };
  framedUrl?: string;
  iconUrl?: string;
  battleUrl?: string;
  sigItem?: {
    name: string;
    desc: string;
  } | null;
}

export interface EquipmentLevels {
  weapon: number; // Tier 0..10 (+Attack & Crit)
  armor: number; // Tier 0..10 (+HP & Defense)
  relic: number; // Tier 0..10 (+Starting Energy & Attack Speed)
}

export interface OwnedHeroState {
  heroId: string;
  level: number;
  stars: number; // 1..5
  copies: number; // duplicate shards used for star promotion
  equipment: EquipmentLevels;
}

export interface ComputedHeroStats {
  hp: number;
  attack: number;
  defense: number;
  attackSpeed: number;
  critChance: number;
  startingEnergy: number;
  combatPower: number;
}

// 5-Position Tactical Formation:
// Index 0 = Frontline Pos 1 (Top Front)
// Index 1 = Frontline Pos 2 (Bottom Front)
// Index 2 = Backline Pos 3 (Top Back)
// Index 3 = Backline Pos 4 (Mid Back)
// Index 4 = Backline Pos 5 (Bottom Back)
export type TeamFormationSlots = [
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
];

export interface SavedTeamPreset {
  id: string;
  name: string;
  slots: TeamFormationSlots;
}

export interface CampaignEnemySlot {
  position: 1 | 2 | 3 | 4 | 5;
  heroId: string;
  level: number;
  stars: number;
  isBoss?: boolean;
}

export interface CampaignStageDefinition {
  id: number;
  chapter: string;
  name: string;
  subtitle: string;
  theme: 'sanctuary' | 'catacombs' | 'sylvan' | 'tempest' | 'obsidian';
  recommendedPower: number;
  enemies: CampaignEnemySlot[];
  firstClearRewards: {
    gold: number;
    heroExp: number;
    essenceGems: number;
    summonScrolls: number;
  };
  replayRewards: {
    gold: number;
    heroExp: number;
    essenceGems: number;
  };
}

export interface CombatEvent {
  id: number;
  timestampMs: number;
  type:
    | 'basic_attack'
    | 'active_skill'
    | 'ultimate_cast'
    | 'damage'
    | 'heal'
    | 'shield'
    | 'crowd_control'
    | 'buff'
    | 'knockback'
    | 'death';
  sourceId: string;
  sourceName: string;
  targetId?: string;
  targetName?: string;
  skillName?: string;
  value?: number;
  isCrit?: boolean;
  ccType?: CrowdControlType;
  buffType?: BuffType;
  vfxColor?: string;
  vfxShape?: HeroSkillSpec['vfxShape'];
}

export interface BattleUnitRuntime {
  instanceId: string;
  heroId: string;
  name: string;
  title: string;
  team: 'ally' | 'enemy';
  position: 1 | 2 | 3 | 4 | 5; // 1-2 Frontline, 3-5 Backline
  heroClass: HeroClass;
  faction: FactionId;
  level: number;
  stars: number;
  isBoss: boolean;
  isRanged: boolean;
  attackRangePx: number;
  moveSpeedPxPerSec: number;
  // Coordinates on the 1000x540 virtual battlefield plane
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  facing: 1 | -1;
  // Combat Stats
  maxHp: number;
  hp: number;
  shield: number;
  energy: number; // 0..100
  baseAttack: number;
  baseDefense: number;
  baseAttackSpeed: number;
  critChance: number;
  lifestealPct: number;
  // Timers & State
  basicAttackCooldownMs: number;
  activeSkillCooldownMs: number;
  activeSkillMaxCooldownMs: number;
  actionAnimTimerMs: number;
  lastActionType: 'idle' | 'move' | 'basic' | 'skill' | 'ultimate' | 'hit' | 'dead';
  targetInstanceId: string | null;
  statusEffects: StatusEffectInstance[];
  isAlive: boolean;
  // Telemetry
  totalDamageDealt: number;
  totalHealingDone: number;
  totalDamageTaken: number;
}

export interface BattleSnapshot {
  status: 'running' | 'victory' | 'defeat';
  elapsedMs: number;
  maxDurationMs: number;
  units: BattleUnitRuntime[];
  recentEvents: CombatEvent[];
}
