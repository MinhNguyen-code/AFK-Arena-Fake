import {
  HeroDefinition,
  OwnedHeroState,
  ComputedHeroStats,
  TeamFormationSlots,
  HeroClass,
  FactionId,
  CrowdControlType,
} from './types';
import fullRepoCatalog from './fullRepoCatalog.json';

const CORE_12_RAW: HeroDefinition[] = [
  // ============================================================================
  // TANKS (3 Heroes)
  // ============================================================================
  {
    id: 'celestial_guardian',
    name: 'Celestial Guardian',
    title: 'Aurelius · Shield of the Solar Spire',
    faction: 'Solar Order',
    heroClass: 'Tank',
    rarity: 'Ascended',
    isRanged: false,
    attackRangePx: 88,
    moveSpeedPxPerSec: 120,
    baseStats: {
      hp: 3400,
      attack: 220,
      defense: 145,
      attackSpeed: 0.85,
      critChance: 0.12,
      startingEnergy: 25,
    },
    skills: {
      basic: {
        name: 'Sunforged Cleave',
        description: 'Strikes an enemy with a radiant broadsword for 105% ATK.',
        cooldownMs: 0,
        damageMultiplier: 1.05,
        targetType: 'current_target',
        vfxColor: '#F59E0B',
        vfxShape: 'slash',
      },
      active: {
        name: 'Judgement Bash',
        description:
          'Slams the frontline with a golden tower shield, dealing 165% ATK and Stunning the target for 2.2s.',
        cooldownMs: 6500,
        damageMultiplier: 1.65,
        targetType: 'current_target',
        ccType: 'stun',
        ccDurationMs: 2200,
        shieldMultiplier: 1.8,
        vfxColor: '#FDE047',
        vfxShape: 'beam',
      },
      ultimate: {
        name: 'Aegis of the Eternal Dawn',
        description:
          'Calls down a cathedral of solar light, granting all allies a massive Shield (320% ATK) and Defense +35% for 6s while dealing 180% ATK to frontline foes.',
        cooldownMs: 0,
        damageMultiplier: 1.8,
        targetType: 'all_allies',
        shieldMultiplier: 3.2,
        buffType: 'def_up',
        buffDurationMs: 6000,
        buffMagnitude: 0.35,
        vfxColor: '#FBBF24',
        vfxShape: 'nova',
      },
      passive: {
        name: 'Sacred Bulwark',
        description:
          'Begins every battle with a Solar Barrier equal to 18% Max HP and increases base Defense by 20%.',
        bonusHpPct: 0.15,
        bonusAtkPct: 0.05,
        bonusDefPct: 0.2,
        bonusCritPct: 0,
        bonusLifestealPct: 0,
        openingShieldPct: 0.18,
      },
    },
    lore: 'An immortal sentinel sworn to guard the Sunlit Citadel of Solaria against the encroaching abyss.',
    visual: {
      primaryColor: '#F59E0B',
      secondaryColor: '#1E3A8A',
      accentColor: '#FEF08A',
      helmStyle: 'crest',
      weaponStyle: 'greatsword',
      capeStyle: 'royal',
    },
  },
  {
    id: 'iron_bastion',
    name: 'Iron Bastion',
    title: 'Garrick · Titan of the Anvil Peaks',
    faction: 'Solar Order',
    heroClass: 'Tank',
    rarity: 'Legendary',
    isRanged: false,
    attackRangePx: 86,
    moveSpeedPxPerSec: 112,
    baseStats: {
      hp: 3650,
      attack: 205,
      defense: 160,
      attackSpeed: 0.78,
      critChance: 0.1,
      startingEnergy: 20,
    },
    skills: {
      basic: {
        name: 'Earthbreaker Maul',
        description: 'Crushes the target with a rune-carved warhammer for 110% ATK.',
        cooldownMs: 0,
        damageMultiplier: 1.1,
        targetType: 'current_target',
        vfxColor: '#D97706',
        vfxShape: 'slash',
      },
      active: {
        name: 'Tectonic Shockwave',
        description:
          'Smashes the arena floor, dealing 175% ATK and Knocking Back frontline enemies while slowing them.',
        cooldownMs: 7000,
        damageMultiplier: 1.75,
        targetType: 'frontline_enemies',
        ccType: 'knockback',
        ccDurationMs: 1200,
        vfxColor: '#F97316',
        vfxShape: 'meteor',
      },
      ultimate: {
        name: 'Colossus Fortification',
        description:
          'Shatters the battlefield for 230% ATK to all enemies, Stunning them for 1.8s and granting himself a 400% ATK iron shield.',
        cooldownMs: 0,
        damageMultiplier: 2.3,
        targetType: 'all_enemies',
        ccType: 'stun',
        ccDurationMs: 1800,
        shieldMultiplier: 4.0,
        vfxColor: '#FB923C',
        vfxShape: 'meteor',
      },
      passive: {
        name: 'Unbreakable Forging',
        description:
          'Tempered dwarven plate increases Max HP by 22% and Defense by 18%.',
        bonusHpPct: 0.22,
        bonusAtkPct: 0,
        bonusDefPct: 0.18,
        bonusCritPct: 0,
        bonusLifestealPct: 0,
        openingShieldPct: 0.12,
      },
    },
    lore: 'Forged in the volcanic heart of Mount Kravok, his armor has never yielded to blade or spell.',
    visual: {
      primaryColor: '#EA580C',
      secondaryColor: '#334155',
      accentColor: '#FDBA74',
      helmStyle: 'horned',
      weaponStyle: 'warhammer',
      capeStyle: 'royal',
    },
  },
  {
    id: 'abyssal_warden',
    name: 'Abyssal Warden',
    title: 'Vorath · Keeper of the Obsidian Gate',
    faction: 'Shadow Court',
    heroClass: 'Tank',
    rarity: 'Ascended',
    isRanged: false,
    attackRangePx: 92,
    moveSpeedPxPerSec: 118,
    baseStats: {
      hp: 3300,
      attack: 235,
      defense: 140,
      attackSpeed: 0.88,
      critChance: 0.15,
      startingEnergy: 30,
    },
    skills: {
      basic: {
        name: 'Rift Glaive',
        description: 'Reaps the target with a void-infused glaive for 108% ATK.',
        cooldownMs: 0,
        damageMultiplier: 1.08,
        targetType: 'current_target',
        lifestealPct: 0.15,
        vfxColor: '#9333EA',
        vfxShape: 'slash',
      },
      active: {
        name: 'Nullifying Chains',
        description:
          'Lashes frontline foes with void chains for 160% ATK and Silences their skills for 3.0s.',
        cooldownMs: 6800,
        damageMultiplier: 1.6,
        targetType: 'frontline_enemies',
        ccType: 'silence',
        ccDurationMs: 3000,
        vfxColor: '#A855F7',
        vfxShape: 'shadow',
      },
      ultimate: {
        name: 'Eclipse Singularity',
        description:
          'Collapses a dark star over the enemy formation, dealing 245% ATK to all enemies, Silencing for 2.5s, and healing himself for 35% of damage dealt.',
        cooldownMs: 0,
        damageMultiplier: 2.45,
        targetType: 'all_enemies',
        ccType: 'silence',
        ccDurationMs: 2500,
        lifestealPct: 0.35,
        vfxColor: '#C084FC',
        vfxShape: 'nova',
      },
      passive: {
        name: 'Void Carapace',
        description:
          'Absorbs ambient rift energy, granting +16% Max HP, +15% Defense, and 12% Lifesteal.',
        bonusHpPct: 0.16,
        bonusAtkPct: 0.08,
        bonusDefPct: 0.15,
        bonusCritPct: 0,
        bonusLifestealPct: 0.12,
        openingShieldPct: 0.15,
      },
    },
    lore: 'Once a fallen paladin, Vorath now stands watch at the threshold between mortal realms and the Astral Abyss.',
    visual: {
      primaryColor: '#7E22CE',
      secondaryColor: '#0F172A',
      accentColor: '#E9D5FF',
      helmStyle: 'horned',
      weaponStyle: 'void_glaive',
      capeStyle: 'tattered',
    },
  },

  // ============================================================================
  // DAMAGE DEALERS (3 Heroes)
  // ============================================================================
  {
    id: 'crimson_revenant',
    name: 'Crimson Revenant',
    title: 'Valerius · Lord of the Sanguine Moon',
    faction: 'Crimson Covenant',
    heroClass: 'Damage Dealer',
    rarity: 'Ascended',
    isRanged: false,
    attackRangePx: 90,
    moveSpeedPxPerSec: 145,
    baseStats: {
      hp: 2450,
      attack: 345,
      defense: 98,
      attackSpeed: 1.15,
      critChance: 0.28,
      startingEnergy: 25,
    },
    skills: {
      basic: {
        name: 'Bloodfang Rend',
        description:
          'Twin crimson blades lacerate the enemy for 115% ATK with 25% Lifesteal.',
        cooldownMs: 0,
        damageMultiplier: 1.15,
        targetType: 'current_target',
        lifestealPct: 0.25,
        vfxColor: '#EF4444',
        vfxShape: 'slash',
      },
      active: {
        name: 'Sanguine Flurry',
        description:
          'Unleashes a frenzied cross-slash dealing 210% ATK, healing himself for 45% of damage dealt, and boosting Attack +25% for 5s.',
        cooldownMs: 5200,
        damageMultiplier: 2.1,
        targetType: 'current_target',
        lifestealPct: 0.45,
        buffType: 'atk_up',
        buffDurationMs: 5000,
        buffMagnitude: 0.25,
        vfxColor: '#DC2626',
        vfxShape: 'slash',
      },
      ultimate: {
        name: 'Crimson Moon Banquet',
        description:
          'Transforms into a vortex of scarlet blades, striking all enemies for 295% ATK and draining 50% of all damage dealt as self-healing.',
        cooldownMs: 0,
        damageMultiplier: 2.95,
        targetType: 'all_enemies',
        lifestealPct: 0.5,
        vfxColor: '#F87171',
        vfxShape: 'nova',
      },
      passive: {
        name: 'Immortal Thirst',
        description:
          'Vampiric bloodline grants +25% Lifesteal on all attacks and +18% Attack.',
        bonusHpPct: 0.08,
        bonusAtkPct: 0.18,
        bonusDefPct: 0.05,
        bonusCritPct: 0.1,
        bonusLifestealPct: 0.25,
        openingShieldPct: 0,
      },
    },
    lore: 'An ancient blood-noble who feeds upon the vitality of tyrants to sustain his eternal crusade.',
    visual: {
      primaryColor: '#DC2626',
      secondaryColor: '#18181B',
      accentColor: '#FCA5A5',
      helmStyle: 'crown',
      weaponStyle: 'twinblades',
      capeStyle: 'wings',
    },
  },
  {
    id: 'shadow_sovereign',
    name: 'Shadow Sovereign',
    title: 'Kaelen · Whisper of the Nightfall',
    faction: 'Shadow Court',
    heroClass: 'Damage Dealer',
    rarity: 'Ascended',
    isRanged: false,
    attackRangePx: 84,
    moveSpeedPxPerSec: 168,
    baseStats: {
      hp: 2100,
      attack: 385,
      defense: 82,
      attackSpeed: 1.28,
      critChance: 0.38,
      startingEnergy: 35,
    },
    skills: {
      basic: {
        name: 'Nightshade Strike',
        description: 'Pierces vital armor gaps with twin daggers for 120% ATK.',
        cooldownMs: 0,
        damageMultiplier: 1.2,
        targetType: 'backline_enemy',
        vfxColor: '#6366F1',
        vfxShape: 'shadow',
      },
      active: {
        name: 'Phantom Blink',
        description:
          'Teleports behind the most vulnerable backline enemy, dealing 245% burst ATK and Silencing them for 2.0s.',
        cooldownMs: 5500,
        damageMultiplier: 2.45,
        targetType: 'backline_enemy',
        ccType: 'silence',
        ccDurationMs: 2000,
        vfxColor: '#818CF8',
        vfxShape: 'shadow',
      },
      ultimate: {
        name: 'Sovereign Execution',
        description:
          'Dissolves into living shadow and executes a lethal 380% ATK strike on the enemy backline with guaranteed critical lethality.',
        cooldownMs: 0,
        damageMultiplier: 3.8,
        targetType: 'backline_enemy',
        buffType: 'spd_up',
        buffDurationMs: 5000,
        buffMagnitude: 0.35,
        vfxColor: '#A5B4FC',
        vfxShape: 'slash',
      },
      passive: {
        name: 'Lethal Precision',
        description:
          'Mastery of unseen assassination increases Critical Chance by +18% and Attack by +20%.',
        bonusHpPct: 0.05,
        bonusAtkPct: 0.2,
        bonusDefPct: 0,
        bonusCritPct: 0.18,
        bonusLifestealPct: 0.1,
        openingShieldPct: 0,
      },
    },
    lore: 'Ruler of the Guild of Mirrors, Kaelen steps through shadows to end wars before the first horn sounds.',
    visual: {
      primaryColor: '#4F46E5',
      secondaryColor: '#090D16',
      accentColor: '#C7D2FE',
      helmStyle: 'hood',
      weaponStyle: 'daggers',
      capeStyle: 'tattered',
    },
  },
  {
    id: 'emerald_valkyrie',
    name: 'Emerald Valkyrie',
    title: 'Sylvara · Windrunner of Elderwood',
    faction: 'Verdant Wilds',
    heroClass: 'Damage Dealer',
    rarity: 'Legendary',
    isRanged: true,
    attackRangePx: 360,
    moveSpeedPxPerSec: 140,
    baseStats: {
      hp: 2180,
      attack: 355,
      defense: 85,
      attackSpeed: 1.32,
      critChance: 0.32,
      startingEnergy: 20,
    },
    skills: {
      basic: {
        name: 'Gale Feather Shot',
        description: 'Fires a wind-guided emerald arrow dealing 112% ATK from afar.',
        cooldownMs: 0,
        damageMultiplier: 1.12,
        targetType: 'current_target',
        vfxColor: '#10B981',
        vfxShape: 'arrow',
      },
      active: {
        name: 'Piercing Tempest Volley',
        description:
          'Looses a triple-arrow gale that hits frontline enemies for 195% ATK and grants herself +30% Attack Speed for 5s.',
        cooldownMs: 5000,
        damageMultiplier: 1.95,
        targetType: 'frontline_enemies',
        buffType: 'spd_up',
        buffDurationMs: 5000,
        buffMagnitude: 0.3,
        vfxColor: '#34D399',
        vfxShape: 'arrow',
      },
      ultimate: {
        name: 'Starfall Arrowstorm',
        description:
          'Rains ratusan radiant sylvan arrows across the entire enemy team for 310% ATK and Knocking Back their frontline.',
        cooldownMs: 0,
        damageMultiplier: 3.1,
        targetType: 'all_enemies',
        ccType: 'knockback',
        ccDurationMs: 1000,
        vfxColor: '#6EE7B7',
        vfxShape: 'arrow',
      },
      passive: {
        name: 'Sylvan Swiftness',
        description:
          'Blessing of the wind spirits increases Attack by 16% and Critical Chance by 14%.',
        bonusHpPct: 0.06,
        bonusAtkPct: 0.16,
        bonusDefPct: 0.04,
        bonusCritPct: 0.14,
        bonusLifestealPct: 0.08,
        openingShieldPct: 0,
      },
    },
    lore: 'Commander of the Canopy Rangers whose arrows never miss under the boughs of the World Tree.',
    visual: {
      primaryColor: '#059669',
      secondaryColor: '#064E3B',
      accentColor: '#A7F3D0',
      helmStyle: 'circlet',
      weaponStyle: 'longbow',
      capeStyle: 'sylvan',
    },
  },

  // ============================================================================
  // MAGES (2 Heroes)
  // ============================================================================
  {
    id: 'storm_empress',
    name: 'Storm Empress',
    title: 'Lyra · Sovereign of the Thunderhead',
    faction: 'Arcane Conclave',
    heroClass: 'Mage',
    rarity: 'Ascended',
    isRanged: true,
    attackRangePx: 340,
    moveSpeedPxPerSec: 122,
    baseStats: {
      hp: 2050,
      attack: 390,
      defense: 78,
      attackSpeed: 0.96,
      critChance: 0.3,
      startingEnergy: 30,
    },
    skills: {
      basic: {
        name: 'Arc Lightning Bolt',
        description: 'Hurls a crackling sphere of lightning for 115% magic ATK.',
        cooldownMs: 0,
        damageMultiplier: 1.15,
        targetType: 'current_target',
        vfxColor: '#38BDF8',
        vfxShape: 'lightning',
      },
      active: {
        name: 'Chain Fulmination',
        description:
          'Unleashes jumping arcs of high-voltage lightning across all enemies for 185% ATK and Slowing them for 3.0s.',
        cooldownMs: 5800,
        damageMultiplier: 1.85,
        targetType: 'all_enemies',
        ccType: 'slow',
        ccDurationMs: 3000,
        vfxColor: '#0EA5E9',
        vfxShape: 'lightning',
      },
      ultimate: {
        name: 'Wrath of the Storm Heavens',
        description:
          'Summons a cataclysmic tempest that strikes all enemies for 340% ATK and Stuns them with thunderbolts for 1.8s.',
        cooldownMs: 0,
        damageMultiplier: 3.4,
        targetType: 'all_enemies',
        ccType: 'stun',
        ccDurationMs: 1800,
        vfxColor: '#7DD3FC',
        vfxShape: 'lightning',
      },
      passive: {
        name: 'Tempest Conductance',
        description:
          'Static charge amplifies magical Attack by +22% and Critical Chance by +12%.',
        bonusHpPct: 0.05,
        bonusAtkPct: 0.22,
        bonusDefPct: 0.04,
        bonusCritPct: 0.12,
        bonusLifestealPct: 0,
        openingShieldPct: 0.08,
      },
    },
    lore: 'Crowned atop the Sky-Spire of Aethon, Lyra commands the hurricanes and lightning of the upper firmament.',
    visual: {
      primaryColor: '#0284C7',
      secondaryColor: '#1E1B4B',
      accentColor: '#BAE6FD',
      helmStyle: 'crown',
      weaponStyle: 'storm_orb',
      capeStyle: 'arcane',
    },
  },
  {
    id: 'pyre_archon',
    name: 'Pyre Archon',
    title: 'Ignatius · High Magus of the Cinder Star',
    faction: 'Crimson Covenant',
    heroClass: 'Mage',
    rarity: 'Legendary',
    isRanged: true,
    attackRangePx: 335,
    moveSpeedPxPerSec: 118,
    baseStats: {
      hp: 2120,
      attack: 398,
      defense: 80,
      attackSpeed: 0.92,
      critChance: 0.28,
      startingEnergy: 25,
    },
    skills: {
      basic: {
        name: 'Solar Flare Bolt',
        description: 'Launches a searing fireball that deals 118% ATK.',
        cooldownMs: 0,
        damageMultiplier: 1.18,
        targetType: 'current_target',
        vfxColor: '#F97316',
        vfxShape: 'meteor',
      },
      active: {
        name: 'Pillar of Immolation',
        description:
          'Erupts a column of magma beneath frontline enemies for 215% ATK and Knocks them back.',
        cooldownMs: 6000,
        damageMultiplier: 2.15,
        targetType: 'frontline_enemies',
        ccType: 'knockback',
        ccDurationMs: 900,
        vfxColor: '#EA580C',
        vfxShape: 'meteor',
      },
      ultimate: {
        name: 'Astral Meteor Cataclysm',
        description:
          'Calls down a blazing comet from the cosmos, obliterating all enemies for 365% ATK and boosting his own Attack by +30%.',
        cooldownMs: 0,
        damageMultiplier: 3.65,
        targetType: 'all_enemies',
        buffType: 'atk_up',
        buffDurationMs: 6000,
        buffMagnitude: 0.3,
        vfxColor: '#FB923C',
        vfxShape: 'meteor',
      },
      passive: {
        name: 'Heart of the Furnace',
        description:
          'Internal dragon-fire grants +24% Attack and +10% Critical Chance.',
        bonusHpPct: 0.06,
        bonusAtkPct: 0.24,
        bonusDefPct: 0.04,
        bonusCritPct: 0.1,
        bonusLifestealPct: 0,
        openingShieldPct: 0,
      },
    },
    lore: 'Keeper of the Forbidden Grimoire of Ash, Ignatius channels the primordial fire that birthed the stars.',
    visual: {
      primaryColor: '#EA580C',
      secondaryColor: '#27272A',
      accentColor: '#FDE047',
      helmStyle: 'halo',
      weaponStyle: 'pyre_tome',
      capeStyle: 'arcane',
    },
  },

  // ============================================================================
  // SUPPORTS (2 Heroes)
  // ============================================================================
  {
    id: 'dawn_oracle',
    name: 'Dawn Oracle',
    title: 'Seraphina · Voice of the Morning Star',
    faction: 'Solar Order',
    heroClass: 'Support',
    rarity: 'Ascended',
    isRanged: true,
    attackRangePx: 350,
    moveSpeedPxPerSec: 124,
    baseStats: {
      hp: 2550,
      attack: 285,
      defense: 110,
      attackSpeed: 1.0,
      critChance: 0.18,
      startingEnergy: 40,
    },
    skills: {
      basic: {
        name: 'Luminous Ray',
        description: 'Projects a beam of dawnlight dealing 100% ATK to the target.',
        cooldownMs: 0,
        damageMultiplier: 1.0,
        targetType: 'current_target',
        vfxColor: '#FDE047',
        vfxShape: 'beam',
      },
      active: {
        name: 'Blessing of Radiance',
        description:
          'Restores HP equal to 220% ATK to the most injured ally and grants them +25 Energy.',
        cooldownMs: 5200,
        damageMultiplier: 0,
        healMultiplier: 2.2,
        energyGrant: 25,
        targetType: 'lowest_hp_ally',
        vfxColor: '#FEF08A',
        vfxShape: 'beam',
      },
      ultimate: {
        name: 'Symphony of Eternal Dawn',
        description:
          'Bathes the entire allied team in golden sanctuary light, healing all allies for 280% ATK, granting +30 Energy, and boosting Attack +25% for 6s.',
        cooldownMs: 0,
        damageMultiplier: 0,
        healMultiplier: 2.8,
        energyGrant: 30,
        targetType: 'all_allies',
        buffType: 'atk_up',
        buffDurationMs: 6000,
        buffMagnitude: 0.25,
        vfxColor: '#FACC15',
        vfxShape: 'nova',
      },
      passive: {
        name: 'Halo of Serenity',
        description:
          'Divine presence increases Max HP by +18%, Defense by +14%, and grants an opening 15% HP shield.',
        bonusHpPct: 0.18,
        bonusAtkPct: 0.12,
        bonusDefPct: 0.14,
        bonusCritPct: 0.05,
        bonusLifestealPct: 0,
        openingShieldPct: 0.15,
      },
    },
    lore: 'High Prophetess of the Astral Sanctuary whose hymns mend shattered steel and awaken dormant power.',
    visual: {
      primaryColor: '#EAB308',
      secondaryColor: '#1E293B',
      accentColor: '#FEF9C3',
      helmStyle: 'halo',
      weaponStyle: 'scepter',
      capeStyle: 'wings',
    },
  },
  {
    id: 'grove_mystic',
    name: 'Grove Mystic',
    title: 'Elowen · Keeper of the World-Bloom',
    faction: 'Verdant Wilds',
    heroClass: 'Support',
    rarity: 'Legendary',
    isRanged: true,
    attackRangePx: 345,
    moveSpeedPxPerSec: 126,
    baseStats: {
      hp: 2620,
      attack: 270,
      defense: 115,
      attackSpeed: 0.98,
      critChance: 0.16,
      startingEnergy: 35,
    },
    skills: {
      basic: {
        name: 'Briar Chord',
        description: 'Strums an enchanted harp that sends a nature bolt for 102% ATK.',
        cooldownMs: 0,
        damageMultiplier: 1.02,
        targetType: 'current_target',
        vfxColor: '#34D399',
        vfxShape: 'beam',
      },
      active: {
        name: 'Verdant Cocoon',
        description:
          'Heals the lowest-HP ally for 205% ATK and wraps them in a 150% ATK bark Shield.',
        cooldownMs: 5400,
        damageMultiplier: 0,
        healMultiplier: 2.05,
        shieldMultiplier: 1.5,
        targetType: 'lowest_hp_ally',
        vfxColor: '#10B981',
        vfxShape: 'nova',
      },
      ultimate: {
        name: 'Sanctuary of the World Tree',
        description:
          'Awakens ancient roots across the arena, healing all allies for 260% ATK, granting a 180% ATK Shield, and increasing Attack Speed by +25% for 6s.',
        cooldownMs: 0,
        damageMultiplier: 0,
        healMultiplier: 2.6,
        shieldMultiplier: 1.8,
        targetType: 'all_allies',
        buffType: 'spd_up',
        buffDurationMs: 6000,
        buffMagnitude: 0.25,
        vfxColor: '#6EE7B7',
        vfxShape: 'nova',
      },
      passive: {
        name: 'Photosynthetic Grace',
        description:
          'Nature harmony grants +20% Max HP and +12% Attack.',
        bonusHpPct: 0.2,
        bonusAtkPct: 0.12,
        bonusDefPct: 0.12,
        bonusCritPct: 0,
        bonusLifestealPct: 0,
        openingShieldPct: 0.1,
      },
    },
    lore: 'Wherever Elowen walks, withered battlefields bloom with luminescent flora that ward off death.',
    visual: {
      primaryColor: '#10B981',
      secondaryColor: '#064E3B',
      accentColor: '#D1FAE5',
      helmStyle: 'circlet',
      weaponStyle: 'nature_harp',
      capeStyle: 'sylvan',
    },
  },

  // ============================================================================
  // CROWD CONTROLLERS (2 Heroes)
  // ============================================================================
  {
    id: 'arcane_serpent',
    name: 'Arcane Serpent',
    title: 'Nagaendra · Medusa of the Sunken Vault',
    faction: 'Arcane Conclave',
    heroClass: 'Crowd Controller',
    rarity: 'Ascended',
    isRanged: true,
    attackRangePx: 330,
    moveSpeedPxPerSec: 125,
    baseStats: {
      hp: 2320,
      attack: 330,
      defense: 95,
      attackSpeed: 1.02,
      critChance: 0.24,
      startingEnergy: 35,
    },
    skills: {
      basic: {
        name: 'Venomous Fang Bolt',
        description: 'Spits a bolt of crystalline serpent venom for 110% ATK.',
        cooldownMs: 0,
        damageMultiplier: 1.1,
        targetType: 'current_target',
        vfxColor: '#A855F7',
        vfxShape: 'serpent',
      },
      active: {
        name: 'Miasma of Lethargy',
        description:
          'Coils frontline enemies in mystic serpent mist, dealing 175% ATK and Slowing their movement & attack speed for 3.5s.',
        cooldownMs: 5600,
        damageMultiplier: 1.75,
        targetType: 'frontline_enemies',
        ccType: 'slow',
        ccDurationMs: 3500,
        vfxColor: '#C084FC',
        vfxShape: 'serpent',
      },
      ultimate: {
        name: 'Gaze of Stone Eternity',
        description:
          'Unleashes the forbidden Ophidian Gaze across all enemies, dealing 275% ATK and Petrifying them into solid stone for 2.6s!',
        cooldownMs: 0,
        damageMultiplier: 2.75,
        targetType: 'all_enemies',
        ccType: 'petrify',
        ccDurationMs: 2600,
        vfxColor: '#D8B4FE',
        vfxShape: 'serpent',
      },
      passive: {
        name: 'Ophidian Scales',
        description:
          'Iridescent scales grant +15% Attack, +15% Defense, and +10% Lifesteal.',
        bonusHpPct: 0.12,
        bonusAtkPct: 0.15,
        bonusDefPct: 0.15,
        bonusCritPct: 0.08,
        bonusLifestealPct: 0.1,
        openingShieldPct: 0.1,
      },
    },
    lore: 'Guardian of the Sunken Library of Nyx, whoseemerald-and-violet gaze turns invading armies into marble statues.',
    visual: {
      primaryColor: '#9333EA',
      secondaryColor: '#065F46',
      accentColor: '#E9D5FF',
      helmStyle: 'crown',
      weaponStyle: 'serpent_staff',
      capeStyle: 'arcane',
    },
  },
  {
    id: 'frost_arbiter',
    name: 'Frost Arbiter',
    title: 'Vaelis · Judge of the Glacial Throne',
    faction: 'Arcane Conclave',
    heroClass: 'Crowd Controller',
    rarity: 'Legendary',
    isRanged: true,
    attackRangePx: 320,
    moveSpeedPxPerSec: 120,
    baseStats: {
      hp: 2420,
      attack: 315,
      defense: 105,
      attackSpeed: 0.95,
      critChance: 0.22,
      startingEnergy: 30,
    },
    skills: {
      basic: {
        name: 'Rime Shard Lance',
        description: 'Hurls a jagged icicle spear that deals 108% ATK.',
        cooldownMs: 0,
        damageMultiplier: 1.08,
        targetType: 'current_target',
        vfxColor: '#38BDF8',
        vfxShape: 'beam',
      },
      active: {
        name: 'Hoarfrost Verdict',
        description:
          'Encases the target in ancient glacier ice, dealing 185% ATK and Stunning them for 2.4s.',
        cooldownMs: 5800,
        damageMultiplier: 1.85,
        targetType: 'current_target',
        ccType: 'stun',
        ccDurationMs: 2400,
        vfxColor: '#06B6D4',
        vfxShape: 'beam',
      },
      ultimate: {
        name: 'Absolute Zero Decree',
        description:
          'Freezes the entire battlefield in a blizzard of silence, dealing 265% ATK to all enemies while applying Silence (3.0s) and Slow (4.0s).',
        cooldownMs: 0,
        damageMultiplier: 2.65,
        targetType: 'all_enemies',
        ccType: 'silence',
        ccDurationMs: 3000,
        vfxColor: '#67E8F9',
        vfxShape: 'nova',
      },
      passive: {
        name: 'Permafrost Aura',
        description:
          'Crystalline frost armor boosts Max HP by +15%, Attack by +14%, and Defense by +16%.',
        bonusHpPct: 0.15,
        bonusAtkPct: 0.14,
        bonusDefPct: 0.16,
        bonusCritPct: 0.06,
        bonusLifestealPct: 0,
        openingShieldPct: 0.12,
      },
    },
    lore: 'An immortal magistrate from the Polar Citadel who halts the march of chaos beneath unyielding ice.',
    visual: {
      primaryColor: '#0891B2',
      secondaryColor: '#0F172A',
      accentColor: '#CFFAFE',
      helmStyle: 'crest',
      weaponStyle: 'frost_halberd',
      capeStyle: 'royal',
    },
  },
];

// ============================================================================
// 6 ADDITIONAL ORIGINAL HERO DEFINITIONS (Across All 5 Archetypes: Tanks, DPS, Mage, Support, CC)
// ============================================================================
const ADDITIONAL_6_RAW: HeroDefinition[] = [
  // 13. TANK — Obsidian Juggernaut (Undying Vengeance & Frontline Stun/Shield)
  {
    id: 'obsidian_juggernaut',
    name: 'Obsidian Juggernaut',
    title: 'Malakor · Sovereign of the Fallen Crown',
    faction: 'Shadow Court',
    heroClass: 'Tank',
    rarity: 'Ascended',
    isRanged: false,
    attackRangePx: 88,
    moveSpeedPxPerSec: 114,
    baseStats: {
      hp: 3820,
      attack: 215,
      defense: 168,
      attackSpeed: 0.82,
      critChance: 0.12,
      startingEnergy: 25,
    },
    skills: {
      basic: {
        name: 'Soulcleaver Greatsword',
        description:
          'Swings a cursed obsidian greatsword at the frontline foe for 112% ATK.',
        cooldownMs: 0,
        damageMultiplier: 1.12,
        targetType: 'current_target',
        vfxColor: '#14B8A6',
        vfxShape: 'slash',
      },
      active: {
        name: 'Taint of the Undying',
        description:
          'Binds the target with soul-chains for 170% ATK, Slowing them for 2.6s while granting self a 200% ATK Bone Barrier.',
        cooldownMs: 6200,
        damageMultiplier: 1.7,
        targetType: 'current_target',
        ccType: 'slow',
        ccDurationMs: 2600,
        shieldMultiplier: 2.0,
        vfxColor: '#2DD4BF',
        vfxShape: 'shadow',
      },
      ultimate: {
        name: 'Retaliation of the Fallen King',
        description:
          'Unleashes accumulated royal wrath across all frontline enemies for 235% ATK, Stunning them for 2.4s and raising all allies Defense by +38% for 6s.',
        cooldownMs: 0,
        damageMultiplier: 2.35,
        targetType: 'frontline_enemies',
        ccType: 'stun',
        ccDurationMs: 2400,
        buffType: 'def_up',
        buffDurationMs: 6000,
        buffMagnitude: 0.38,
        vfxColor: '#10B981',
        vfxShape: 'nova',
      },
      passive: {
        name: 'Dominion of Resurrection',
        description:
          'Begins every battle with a 22% Max HP Undying Barrier, +18% Max HP, +22% Defense, and +10% Lifesteal.',
        bonusHpPct: 0.18,
        bonusAtkPct: 0.06,
        bonusDefPct: 0.22,
        bonusCritPct: 0.04,
        bonusLifestealPct: 0.1,
        openingShieldPct: 0.22,
      },
    },
    lore: 'An ancient monarch who refused the slumber of death, rising in obsidian plate to absorb every blow aimed at his realm.',
    visual: {
      primaryColor: '#14B8A6',
      secondaryColor: '#0F172A',
      accentColor: '#99F6E4',
      helmStyle: 'crown',
      weaponStyle: 'greatsword',
      capeStyle: 'tattered',
    },
  },

  // 14. TANK — Solar Templar (Dimensional Fortress & Team Haste/Shield)
  {
    id: 'solar_paladin',
    name: 'Solar Templar',
    title: 'Pendragon · High King of the Golden Table',
    faction: 'Solar Order',
    heroClass: 'Tank',
    rarity: 'Ascended',
    isRanged: false,
    attackRangePx: 86,
    moveSpeedPxPerSec: 118,
    baseStats: {
      hp: 3740,
      attack: 225,
      defense: 165,
      attackSpeed: 0.86,
      critChance: 0.14,
      startingEnergy: 30,
    },
    skills: {
      basic: {
        name: 'Caliburn Slash',
        description:
          'Strikes the target with a sacred broadsword for 110% ATK.',
        cooldownMs: 0,
        damageMultiplier: 1.1,
        targetType: 'current_target',
        vfxColor: '#F59E0B',
        vfxShape: 'slash',
      },
      active: {
        name: 'Aegis of Camelot',
        description:
          'Bashes frontline enemies for 180% ATK, Knocking Back the target and erecting a 210% ATK royal bulwark.',
        cooldownMs: 5800,
        damageMultiplier: 1.8,
        targetType: 'frontline_enemies',
        ccType: 'knockback',
        ccDurationMs: 1400,
        shieldMultiplier: 2.1,
        vfxColor: '#FDE047',
        vfxShape: 'beam',
      },
      ultimate: {
        name: 'Sanctuary of the Round Table',
        description:
          'Consecrates the battlefield in golden light, granting all allies a 340% ATK Shield and +30% Attack Speed for 6s.',
        cooldownMs: 0,
        damageMultiplier: 1.95,
        targetType: 'all_allies',
        shieldMultiplier: 3.4,
        buffType: 'spd_up',
        buffDurationMs: 6000,
        buffMagnitude: 0.3,
        vfxColor: '#FBBF24',
        vfxShape: 'nova',
      },
      passive: {
        name: 'Unconquered Sovereign',
        description:
          'Reduces incoming frontline pressure with +20% Max HP, +24% Defense, and a 20% Max HP opening shield.',
        bonusHpPct: 0.2,
        bonusAtkPct: 0.08,
        bonusDefPct: 0.24,
        bonusCritPct: 0.05,
        bonusLifestealPct: 0,
        openingShieldPct: 0.2,
      },
    },
    lore: 'Summoned across dimensional rifts, the High King stands unmoved before any tempest, inspiring allies behind his golden banner.',
    visual: {
      primaryColor: '#F59E0B',
      secondaryColor: '#1E3A8A',
      accentColor: '#FEF9C3',
      helmStyle: 'crown',
      weaponStyle: 'greatsword',
      capeStyle: 'royal',
    },
  },

  // 15. DAMAGE DEALER — Astral Blademaster (Backline Gale Duelist & Crit Flurry)
  {
    id: 'astral_blademaster',
    name: 'Astral Blademaster',
    title: 'Vaelis · Grandmaster of the Gale Blade',
    faction: 'Solar Order',
    heroClass: 'Damage Dealer',
    rarity: 'Ascended',
    isRanged: false,
    attackRangePx: 92,
    moveSpeedPxPerSec: 158,
    baseStats: {
      hp: 2560,
      attack: 325,
      defense: 108,
      attackSpeed: 1.24,
      critChance: 0.32,
      startingEnergy: 25,
    },
    skills: {
      basic: {
        name: 'Zephyr Riposte',
        description:
          'Executes a lightning-fast rapier thrust dealing 118% ATK with heightened critical precision.',
        cooldownMs: 0,
        damageMultiplier: 1.18,
        targetType: 'current_target',
        vfxColor: '#38BDF8',
        vfxShape: 'slash',
      },
      active: {
        name: 'Tempest Lunge',
        description:
          'Steps through the wind to strike the enemy backline for 230% ATK with 25% Lifesteal and Silences the target for 2.0s.',
        cooldownMs: 5200,
        damageMultiplier: 2.3,
        targetType: 'backline_enemy',
        lifestealPct: 0.25,
        ccType: 'silence',
        ccDurationMs: 2000,
        vfxColor: '#7DD3FC',
        vfxShape: 'slash',
      },
      ultimate: {
        name: 'Eviscerate of the Seven Stars',
        description:
          'Unleashes a seven-fold blade hurricane across all enemies for 295% ATK while boosting own Attack by +40% for 6s.',
        cooldownMs: 0,
        damageMultiplier: 2.95,
        targetType: 'all_enemies',
        lifestealPct: 0.2,
        buffType: 'atk_up',
        buffDurationMs: 6000,
        buffMagnitude: 0.4,
        vfxColor: '#BAE6FD',
        vfxShape: 'nova',
      },
      passive: {
        name: 'Windveil Focus',
        description:
          'Mastery of the gale blade grants +20% Attack, +16% Critical Chance, and +14% Lifesteal.',
        bonusHpPct: 0.08,
        bonusAtkPct: 0.2,
        bonusDefPct: 0.08,
        bonusCritPct: 0.16,
        bonusLifestealPct: 0.14,
        openingShieldPct: 0.08,
      },
    },
    lore: 'A peerless duelist whose blade moves faster than the eye can follow, severing enemy spellcasters before their incantations finish.',
    visual: {
      primaryColor: '#38BDF8',
      secondaryColor: '#1E3A8A',
      accentColor: '#E0F2FE',
      helmStyle: 'crest',
      weaponStyle: 'twinblades',
      capeStyle: 'royal',
    },
  },

  // 16. MAGE — Celestial Weaver (Prismatic Starlight AoE & Team Attack Buff)
  {
    id: 'celestial_weaver',
    name: 'Celestial Weaver',
    title: 'Aurelia · Steward of the Solstice Star',
    faction: 'Arcane Conclave',
    heroClass: 'Mage',
    rarity: 'Ascended',
    isRanged: true,
    attackRangePx: 295,
    moveSpeedPxPerSec: 112,
    baseStats: {
      hp: 2480,
      attack: 342,
      defense: 96,
      attackSpeed: 1.04,
      critChance: 0.26,
      startingEnergy: 30,
    },
    skills: {
      basic: {
        name: 'Solstice Bolt',
        description:
          'Projects a brush-stroke of radiant starlight for 115% ATK.',
        cooldownMs: 0,
        damageMultiplier: 1.15,
        targetType: 'current_target',
        vfxColor: '#F472B6',
        vfxShape: 'beam',
      },
      active: {
        name: 'Prism of the Solstice',
        description:
          'Refracts celestial light through frontline foes for 215% ATK and Slows their movement and attack speed for 2.8s.',
        cooldownMs: 6000,
        damageMultiplier: 2.15,
        targetType: 'frontline_enemies',
        ccType: 'slow',
        ccDurationMs: 2800,
        vfxColor: '#F9A8D4',
        vfxShape: 'beam',
      },
      ultimate: {
        name: 'Canvas of the Astral Firmament',
        description:
          'Paints the entire sky in cosmic fire, dealing 310% ATK to all enemies and increasing all allies Attack by +32% for 6s.',
        cooldownMs: 0,
        damageMultiplier: 3.1,
        targetType: 'all_enemies',
        buffType: 'atk_up',
        buffDurationMs: 6000,
        buffMagnitude: 0.32,
        vfxColor: '#EC4899',
        vfxShape: 'meteor',
      },
      passive: {
        name: 'Brush of Creation',
        description:
          'Infuses every spell with starlight, increasing Attack by +22%, Crit Chance by +12%, and Max HP by +10%.',
        bonusHpPct: 0.1,
        bonusAtkPct: 0.22,
        bonusDefPct: 0.08,
        bonusCritPct: 0.12,
        bonusLifestealPct: 0,
        openingShieldPct: 0.1,
      },
    },
    lore: 'An artist of the upper firmament whose living constellations reshape the battlefield in hues of dawn and supernova.',
    visual: {
      primaryColor: '#EC4899',
      secondaryColor: '#312E81',
      accentColor: '#FBCFE8',
      helmStyle: 'halo',
      weaponStyle: 'scepter',
      capeStyle: 'wings',
    },
  },

  // 17. SUPPORT — Soul Alchemist (Plague Mist Healer, Energy Infusion & Attack Elixir)
  {
    id: 'soul_alchemist',
    name: 'Soul Alchemist',
    title: 'Morbius · Chirurgeon of the Crimson Mist',
    faction: 'Shadow Court',
    heroClass: 'Support',
    rarity: 'Ascended',
    isRanged: true,
    attackRangePx: 285,
    moveSpeedPxPerSec: 114,
    baseStats: {
      hp: 2840,
      attack: 265,
      defense: 122,
      attackSpeed: 1.06,
      critChance: 0.16,
      startingEnergy: 35,
    },
    skills: {
      basic: {
        name: 'Alchemical Needle',
        description:
          'Hurls a volatile phial at the enemy target dealing 105% ATK.',
        cooldownMs: 0,
        damageMultiplier: 1.05,
        targetType: 'current_target',
        vfxColor: '#34D399',
        vfxShape: 'beam',
      },
      active: {
        name: 'Vitality Elixir',
        description:
          'Infuses the lowest-HP ally with concentrated serum, restoring 245% ATK as HP and granting +30% Attack for 5s.',
        cooldownMs: 5400,
        damageMultiplier: 0,
        targetType: 'lowest_hp_ally',
        healMultiplier: 2.45,
        buffType: 'atk_up',
        buffDurationMs: 5000,
        buffMagnitude: 0.3,
        vfxColor: '#10B981',
        vfxShape: 'nova',
      },
      ultimate: {
        name: 'Cloud of Stimulating Fury',
        description:
          'Blankets the entire allied team in a regenerating alchemical fog, healing for 270% ATK, shielding for 190% ATK, and granting +35 Energy.',
        cooldownMs: 0,
        damageMultiplier: 0,
        targetType: 'all_allies',
        healMultiplier: 2.7,
        shieldMultiplier: 1.9,
        energyGrant: 35,
        buffType: 'spd_up',
        buffDurationMs: 6000,
        buffMagnitude: 0.28,
        vfxColor: '#6EE7B7',
        vfxShape: 'nova',
      },
      passive: {
        name: 'Adrenaline Distillation',
        description:
          'Potent alchemical vapors increase Max HP by +16%, Attack by +15%, and Defense by +14%.',
        bonusHpPct: 0.16,
        bonusAtkPct: 0.15,
        bonusDefPct: 0.14,
        bonusCritPct: 0.05,
        bonusLifestealPct: 0,
        openingShieldPct: 0.14,
      },
    },
    lore: 'A brilliant yet eccentric alchemist of the Shadow Court whose elixirs push allies beyond mortal limits.',
    visual: {
      primaryColor: '#10B981',
      secondaryColor: '#134E4A',
      accentColor: '#A7F3D0',
      helmStyle: 'hood',
      weaponStyle: 'pyre_tome',
      capeStyle: 'tattered',
    },
  },

  // 18. CROWD CONTROLLER — Chrono Warden (Temporal Petrification & Battlefield Stun)
  {
    id: 'chrono_warden',
    name: 'Chrono Warden',
    title: 'Kronos · Voidbinder of the Shattered Hourglass',
    faction: 'Arcane Conclave',
    heroClass: 'Crowd Controller',
    rarity: 'Ascended',
    isRanged: true,
    attackRangePx: 275,
    moveSpeedPxPerSec: 118,
    baseStats: {
      hp: 2680,
      attack: 292,
      defense: 118,
      attackSpeed: 1.02,
      critChance: 0.2,
      startingEnergy: 30,
    },
    skills: {
      basic: {
        name: 'Chrono Cleave',
        description:
          'Slices through the timeline to strike the target for 112% ATK.',
        cooldownMs: 0,
        damageMultiplier: 1.12,
        targetType: 'current_target',
        vfxColor: '#C084FC',
        vfxShape: 'shadow',
      },
      active: {
        name: 'Temporal Fracture',
        description:
          'Locks the enemy target in a fractured time loop, dealing 190% ATK and Petrifying them for 2.4s.',
        cooldownMs: 6400,
        damageMultiplier: 1.9,
        targetType: 'current_target',
        ccType: 'petrify',
        ccDurationMs: 2400,
        vfxColor: '#A855F7',
        vfxShape: 'serpent',
      },
      ultimate: {
        name: 'Deja Vu Cataclysm',
        description:
          'Shatters the cosmic hourglass across the entire enemy team, dealing 275% ATK to all enemies and Stunning them for 2.6s.',
        cooldownMs: 0,
        damageMultiplier: 2.75,
        targetType: 'all_enemies',
        ccType: 'stun',
        ccDurationMs: 2600,
        vfxColor: '#E9D5FF',
        vfxShape: 'nova',
      },
      passive: {
        name: 'Annals of Entropy',
        description:
          'Foresight of every timeline grants +16% Attack, +14% Defense, +10% Crit Chance, and a 14% Max HP temporal shield.',
        bonusHpPct: 0.14,
        bonusAtkPct: 0.16,
        bonusDefPct: 0.14,
        bonusCritPct: 0.1,
        bonusLifestealPct: 0,
        openingShieldPct: 0.14,
      },
    },
    lore: 'An eternal watcher who rewinds and freezes moments of battle, trapping whole armies inside a single heartbeat.',
    visual: {
      primaryColor: '#A855F7',
      secondaryColor: '#3B0764',
      accentColor: '#F3E8FF',
      helmStyle: 'horned',
      weaponStyle: 'void_glaive',
      capeStyle: 'wings',
    },
  },
];

const CORE_UNIT_ID_MAP: Record<string, number> = {
  celestial_guardian: 44, // Lucius
  iron_bastion: 50, // Hendrik
  abyssal_warden: 85, // Mezoth
  crimson_revenant: 242, // Dracula
  shadow_sovereign: 55, // Athalia
  emerald_valkyrie: 16, // Lyca
  storm_empress: 96, // Zaphrael
  pyre_archon: 51, // Safiya
  dawn_oracle: 150, // Palmer
  grove_mystic: 147, // Nevanthi
  arcane_serpent: 252, // Medusa
  frost_arbiter: 76, // Khazard
  obsidian_juggernaut: 32, // Thoran
  solar_paladin: 78, // Arthur
  astral_blademaster: 45, // Thane
  celestial_weaver: 162, // Daemia
  soul_alchemist: 63, // Silas
  chrono_warden: 64, // Zolrath
};

type RepoCatalogEntry = (typeof fullRepoCatalog)[number];

const repoByUnitId = new Map<number, RepoCatalogEntry>(
  fullRepoCatalog.map((entry) => [entry.unitId, entry])
);

function enrichOriginalHero(h: HeroDefinition): HeroDefinition {
  const uid = CORE_UNIT_ID_MAP[h.id];
  const repo = repoByUnitId.get(uid);
  return {
    ...h,
    title: repo ? `${repo.name} · ${h.title}` : h.title,
    unitId: uid,
    codeName: repo?.codeName,
    repoFaction: (repo?.faction as HeroDefinition['repoFaction']) || 'Lightbearer',
    rawClass: repo?.rawClass || h.heroClass,
    isAwakened: repo?.isAwakened || false,
    overallRank: repo?.overallRank || 'S+',
    tierScore: repo?.tierScore || 70,
    investment: repo?.investment || {
      minimum: 'Mythic SI 20',
      optimal: 'A3* SI 30',
      competitive: 'A5* SI 30',
    },
    modes: repo?.modes || { arena: 'S+', dreamRealm: 'S', guildHunt: 'S+' },
    framedUrl: `/assets/heroes/${h.id}_framed.webp`,
    battleUrl: `/assets/heroes/${h.id}_battle.webp`,
    iconUrl: `/assets/heroes/${h.id}_icon.webp`,
    sigItem: repo?.sigItem || null,
  };
}

export const CORE_12_HEROES: HeroDefinition[] = CORE_12_RAW.map(enrichOriginalHero);
export const ADDITIONAL_6_HEROES: HeroDefinition[] =
  ADDITIONAL_6_RAW.map(enrichOriginalHero);
export const ORIGINAL_18_HEROES: HeroDefinition[] = [
  ...CORE_12_HEROES,
  ...ADDITIONAL_6_HEROES,
];

const FACTION_TO_INTERNAL: Record<string, FactionId> = {
  Lightbearer: 'Solar Order',
  Celestial: 'Solar Order',
  Mauler: 'Crimson Covenant',
  Draconis: 'Crimson Covenant',
  Wilder: 'Verdant Wilds',
  Dimensional: 'Arcane Conclave',
  Graveborn: 'Shadow Court',
  Hypogean: 'Shadow Court',
};

const FACTION_COLORS_HEX: Record<
  string,
  { primary: string; secondary: string; accent: string }
> = {
  Lightbearer: { primary: '#F59E0B', secondary: '#1E3A8A', accent: '#FEF08A' },
  Mauler: { primary: '#EA580C', secondary: '#431407', accent: '#FDBA74' },
  Wilder: { primary: '#10B981', secondary: '#064E3B', accent: '#6EE7B7' },
  Graveborn: { primary: '#14B8A6', secondary: '#134E4A', accent: '#99F6E4' },
  Celestial: { primary: '#FBBF24', secondary: '#312E81', accent: '#FEF9C3' },
  Hypogean: { primary: '#A855F7', secondary: '#3B0764', accent: '#E9D5FF' },
  Dimensional: { primary: '#38BDF8', secondary: '#0C4A6E', accent: '#BAE6FD' },
  Draconis: { primary: '#EF4444', secondary: '#450A0A', accent: '#FCA5A5' },
};

function mapRepoHeroToDefinition(entry: RepoCatalogEntry): HeroDefinition {
  const role = entry.mainRole || 'Continuous Damage';
  const rawCls = entry.rawClass || 'Warrior';

  let heroClass: HeroClass = 'Damage Dealer';
  if (role === 'Tank' || rawCls === 'Tank') {
    heroClass = 'Tank';
  } else if (role === 'Heal' || role === 'Buff' || rawCls === 'Support') {
    heroClass = 'Support';
  } else if (role === 'Control' || role === 'Debuff' || entry.secondRole === 'Control') {
    heroClass = 'Crowd Controller';
  } else if (rawCls === 'Mage') {
    heroClass = 'Mage';
  } else {
    heroClass = 'Damage Dealer';
  }

  const isRanged =
    heroClass === 'Mage' ||
    heroClass === 'Support' ||
    heroClass === 'Crowd Controller' ||
    rawCls === 'Ranger';

  const rankBoost =
    entry.overallRank === 'SS'
      ? 1.14
      : entry.overallRank === 'S+'
        ? 1.08
        : entry.overallRank === 'S'
          ? 1.04
          : 1.0;

  const baseHp =
    Math.round(
      (heroClass === 'Tank'
        ? 3500
        : heroClass === 'Support'
          ? 2750
          : heroClass === 'Damage Dealer'
            ? 2650
            : 2500) * rankBoost
    );
  const baseAtk =
    Math.round(
      (heroClass === 'Mage'
        ? 305
        : heroClass === 'Damage Dealer'
          ? 295
          : heroClass === 'Crowd Controller'
            ? 270
            : heroClass === 'Support'
              ? 245
              : 215) * rankBoost
    );
  const baseDef =
    Math.round(
      (heroClass === 'Tank' ? 155 : heroClass === 'Damage Dealer' ? 110 : 95) *
        rankBoost
    );

  const colors =
    FACTION_COLORS_HEX[entry.faction] || FACTION_COLORS_HEX.Lightbearer;

  const s0 = entry.builderSkills?.[0];
  const s1 = entry.builderSkills?.[1];
  const s2 = entry.builderSkills?.[2];
  const s3 = entry.builderSkills?.[3];

  const ccList: CrowdControlType[] = ['stun', 'silence', 'slow', 'knockback', 'petrify'];
  const defaultCc: CrowdControlType = ccList[entry.unitId % ccList.length];

  return {
    id: entry.slug,
    name: entry.name,
    title: `${entry.faction} · ${entry.rawClass} (${entry.mainRole})`,
    faction: FACTION_TO_INTERNAL[entry.faction] || 'Solar Order',
    heroClass,
    rarity: entry.rarity === 'Legendary' ? 'Legendary' : 'Ascended',
    isRanged,
    attackRangePx: isRanged ? 255 + (entry.unitId % 45) : 88,
    moveSpeedPxPerSec: isRanged ? 115 : 132,
    baseStats: {
      hp: baseHp,
      attack: baseAtk,
      defense: baseDef,
      attackSpeed: Number((0.92 + (entry.unitId % 5) * 0.06).toFixed(2)),
      critChance: Number((0.14 + (entry.unitId % 4) * 0.04).toFixed(2)),
      startingEnergy: 20 + (entry.unitId % 4) * 5,
    },
    skills: {
      basic: {
        name: s3?.name || `${entry.name} Strike`,
        description:
          s3?.desc ||
          `Strikes the enemy target with ${entry.faction} power for 110% ATK.`,
        cooldownMs: 0,
        damageMultiplier: 1.1,
        targetType: 'current_target',
        vfxColor: colors.primary,
        vfxShape: isRanged ? 'beam' : 'slash',
      },
      active: {
        name: s1?.name || `${entry.name} Tactical Art`,
        description:
          s1?.desc ||
          `Unleashes a signature ${entry.mainRole} technique dealing 185% ATK and applying tactical pressure.`,
        cooldownMs: 6500,
        damageMultiplier: 1.85,
        targetType:
          heroClass === 'Support'
            ? 'lowest_hp_ally'
            : heroClass === 'Mage'
              ? 'frontline_enemies'
              : 'current_target',
        healMultiplier: heroClass === 'Support' ? 1.9 : undefined,
        shieldMultiplier: heroClass === 'Tank' ? 1.8 : undefined,
        ccType:
          heroClass === 'Crowd Controller' || heroClass === 'Tank'
            ? defaultCc
            : undefined,
        ccDurationMs:
          heroClass === 'Crowd Controller' || heroClass === 'Tank'
            ? 2200
            : undefined,
        vfxColor: colors.accent,
        vfxShape: isRanged ? 'lightning' : 'slash',
      },
      ultimate: {
        name: s0?.name || `Awakening of ${entry.name}`,
        description:
          s0?.desc ||
          `Channels ultimate ${entry.faction} dominion across the battlefield, dealing 250% ATK and empowering allies.`,
        cooldownMs: 0,
        damageMultiplier: heroClass === 'Support' ? 1.35 : 2.5,
        targetType:
          heroClass === 'Support' || heroClass === 'Tank'
            ? 'all_allies'
            : 'all_enemies',
        healMultiplier: heroClass === 'Support' ? 2.4 : undefined,
        shieldMultiplier: heroClass === 'Tank' ? 2.8 : undefined,
        energyGrant: heroClass === 'Support' ? 30 : undefined,
        ccType: heroClass === 'Crowd Controller' ? defaultCc : undefined,
        ccDurationMs: heroClass === 'Crowd Controller' ? 2800 : undefined,
        buffType:
          heroClass === 'Tank'
            ? 'def_up'
            : heroClass === 'Support'
              ? 'atk_up'
              : undefined,
        buffDurationMs: 6000,
        buffMagnitude: 0.3,
        vfxColor: colors.primary,
        vfxShape: 'nova',
      },
      passive: {
        name: entry.sigItem?.name || s2?.name || `${entry.faction} Bloodline`,
        description:
          entry.sigItem?.desc ||
          s2?.desc ||
          `Increases combat attributes and grants ${entry.faction} battlefield mastery.`,
        bonusHpPct: heroClass === 'Tank' ? 0.16 : 0.08,
        bonusAtkPct: heroClass === 'Damage Dealer' || heroClass === 'Mage' ? 0.16 : 0.08,
        bonusDefPct: heroClass === 'Tank' ? 0.18 : 0.08,
        bonusCritPct: 0.06,
        bonusLifestealPct: role === 'Continuous Damage' ? 0.12 : 0,
        openingShieldPct: heroClass === 'Tank' ? 0.15 : 0,
      },
    },
    lore:
      entry.sigItem?.desc ||
      `${entry.name} (${entry.codeName}) — ${entry.faction} ${entry.rawClass} specializing in ${entry.mainRole} and ${entry.secondRole}.`,
    visual: {
      primaryColor: colors.primary,
      secondaryColor: colors.secondary,
      accentColor: colors.accent,
      helmStyle: 'crown',
      weaponStyle: isRanged ? 'storm_orb' : 'greatsword',
      capeStyle: 'royal',
    },
    unitId: entry.unitId,
    codeName: entry.codeName,
    repoFaction: entry.faction as HeroDefinition['repoFaction'],
    rawClass: entry.rawClass,
    isAwakened: entry.isAwakened,
    overallRank: entry.overallRank,
    tierScore: entry.tierScore,
    investment: entry.investment,
    modes: entry.modes,
    framedUrl: entry.framedUrl,
    battleUrl: entry.battleUrl,
    iconUrl: entry.iconUrl,
    sigItem: entry.sigItem,
  };
}

const coreUnitIdSet = new Set(Object.values(CORE_UNIT_ID_MAP));
const EXTRA_REPO_HEROES: HeroDefinition[] = fullRepoCatalog
  .filter((entry) => !coreUnitIdSet.has(entry.unitId))
  .map(mapRepoHeroToDefinition);

export const HERO_ROSTER: HeroDefinition[] = [
  ...ORIGINAL_18_HEROES,
  ...EXTRA_REPO_HEROES,
];

export const HERO_MAP: Record<string, HeroDefinition> = Object.fromEntries(
  HERO_ROSTER.map((h) => [h.id, h])
);

export function getHeroById(heroId: string): HeroDefinition {
  return HERO_MAP[heroId] || HERO_ROSTER[0];
}

export function computeHeroStats(
  hero: HeroDefinition,
  owned?: OwnedHeroState
): ComputedHeroStats {
  const level = owned?.level ?? 1;
  const stars = owned?.stars ?? (hero.rarity === 'Ascended' ? 2 : 1);
  const eq = owned?.equipment ?? { weapon: 1, armor: 1, relic: 1 };

  // Level multiplier: +11% per level above 1
  const levelMult = 1 + (level - 1) * 0.11;
  // Star multiplier: +16% per star above 1
  const starMult = 1 + (stars - 1) * 0.16;

  // Passive multipliers
  const p = hero.skills.passive;

  // Equipment flat + percentage bonuses
  const weaponAtkBonus = eq.weapon * 26 + hero.baseStats.attack * (eq.weapon * 0.045);
  const armorHpBonus = eq.armor * 240 + hero.baseStats.hp * (eq.armor * 0.05);
  const armorDefBonus = eq.armor * 14 + hero.baseStats.defense * (eq.armor * 0.045);
  const relicSpdBonus = eq.relic * 0.025;
  const relicEnergyBonus = eq.relic * 4;

  const hp = Math.round(
    (hero.baseStats.hp * levelMult * starMult + armorHpBonus) * (1 + p.bonusHpPct)
  );
  const attack = Math.round(
    (hero.baseStats.attack * levelMult * starMult + weaponAtkBonus) * (1 + p.bonusAtkPct)
  );
  const defense = Math.round(
    (hero.baseStats.defense * levelMult * starMult + armorDefBonus) * (1 + p.bonusDefPct)
  );
  const attackSpeed = Number(
    Math.min(2.4, hero.baseStats.attackSpeed + relicSpdBonus).toFixed(2)
  );
  const critChance = Number(
    Math.min(0.75, hero.baseStats.critChance + p.bonusCritPct + eq.weapon * 0.01).toFixed(2)
  );
  const startingEnergy = Math.min(85, hero.baseStats.startingEnergy + relicEnergyBonus);

  const combatPower = Math.round(
    hp * 0.28 +
      attack * 3.8 +
      defense * 2.5 +
      attackSpeed * 420 +
      critChance * 950 +
      stars * 320
  );

  return {
    hp,
    attack,
    defense,
    attackSpeed,
    critChance,
    startingEnergy,
    combatPower,
  };
}

export function getHeroLevelUpCost(currentLevel: number): {
  gold: number;
  heroExp: number;
  ascensionStones: number;
} {
  const gold = Math.round(180 * Math.pow(1.16, currentLevel - 1));
  const heroExp = Math.round(140 * Math.pow(1.16, currentLevel - 1));
  const ascensionStones = currentLevel % 10 === 0 ? Math.floor(currentLevel / 10) * 15 : 0;
  return { gold, heroExp, ascensionStones };
}

export function getEquipmentUpgradeCost(currentTier: number): {
  gold: number;
} {
  return {
    gold: Math.round(350 * Math.pow(1.35, currentTier)),
  };
}

export function computeTeamPower(
  formation: TeamFormationSlots,
  ownedHeroes: Record<string, OwnedHeroState>
): number {
  let total = 0;
  const seen = new Set<string>();
  for (const heroId of formation) {
    if (!heroId || seen.has(heroId)) continue;
    seen.add(heroId);
    const def = HERO_MAP[heroId];
    const owned = ownedHeroes[heroId];
    if (def && owned) {
      total += computeHeroStats(def, owned).combatPower;
    }
  }
  return total;
}

export function validateTeamFormation(formation: TeamFormationSlots): {
  valid: boolean;
  error?: string;
} {
  const activeIds = formation.filter((id): id is string => Boolean(id));
  if (activeIds.length === 0) {
    return { valid: false, error: 'Đội hình phải có ít nhất 1 Anh Hùng xuất trận.' };
  }
  const uniqueIds = new Set(activeIds);
  if (uniqueIds.size !== activeIds.length) {
    return {
      valid: false,
      error: 'Một Anh Hùng không thể đứng ở nhiều vị trí trong cùng một đội hình.',
    };
  }
  return { valid: true };
}

export const CLASS_METADATA: Record<
  HeroClass,
  { label: string; viLabel: string; color: string; description: string }
> = {
  Tank: {
    label: 'Tank',
    viLabel: 'Đỡ Đòn',
    color: '#F59E0B',
    description: 'Chắn sát thương ở Tiền Tuyến và bảo vệ đồng đội bằng Khiên & Khống Chế.',
  },
  'Damage Dealer': {
    label: 'Damage Dealer',
    viLabel: 'Sát Thương Vật Lý',
    color: '#EF4444',
    description: 'Gây sát thương chuẩn liên tục, hút máu hoặc ám sát hậu phương.',
  },
  Mage: {
    label: 'Mage',
    viLabel: 'Pháp Sư',
    color: '#38BDF8',
    description: 'Bùng nổ sát thương phép thuật diện rộng hủy diệt đội hình địch.',
  },
  Support: {
    label: 'Support',
    viLabel: 'Hỗ Trợ',
    color: '#10B981',
    description: 'Hồi máu, bơm Nộ (Energy) và cường hóa chỉ số cho toàn đội.',
  },
  'Crowd Controller': {
    label: 'Crowd Controller',
    viLabel: 'Khống Chế',
    color: '#A855F7',
    description: 'Hóa Đá (Petrify), Làm Choáng (Stun), Câm Lặng (Silence) và Làm Chậm kẻ địch.',
  },
};

export const FACTION_METADATA: Record<
  FactionId,
  { name: string; viName: string; color: string }
> = {
  'Solar Order': {
    name: 'Solar Order',
    viName: 'Thánh Điện Mặt Trời',
    color: '#F59E0B',
  },
  'Crimson Covenant': {
    name: 'Crimson Covenant',
    viName: 'Giao Ước Huyết Nguyệt',
    color: '#EF4444',
  },
  'Verdant Wilds': {
    name: 'Verdant Wilds',
    viName: 'Rừng Già Vĩnh Cửu',
    color: '#10B981',
  },
  'Arcane Conclave': {
    name: 'Arcane Conclave',
    viName: 'Hội Đồng Bí Thuật',
    color: '#38BDF8',
  },
  'Shadow Court': {
    name: 'Shadow Court',
    viName: 'Vương Triều Bóng Đêm',
    color: '#A855F7',
  },
};

export const REPO_FACTION_METADATA: Record<
  NonNullable<HeroDefinition['repoFaction']>,
  { label: string; viLabel: string; color: string; icon: string }
> = {
  Lightbearer: {
    label: 'Lightbearer',
    viLabel: 'Người Mang Ánh Sáng',
    color: '#F59E0B',
    icon: '/assets/factions/lightbearer.png',
  },
  Mauler: {
    label: 'Mauler',
    viLabel: 'Bộ Tộc Dã Thú',
    color: '#EA580C',
    icon: '/assets/factions/mauler.png',
  },
  Wilder: {
    label: 'Wilder',
    viLabel: 'Cư Dân Rừng Già',
    color: '#10B981',
    icon: '/assets/factions/wilder.png',
  },
  Graveborn: {
    label: 'Graveborn',
    viLabel: 'Quân Đoàn Vong Linh',
    color: '#14B8A6',
    icon: '/assets/factions/graveborn.png',
  },
  Celestial: {
    label: 'Celestial',
    viLabel: 'Thần Tộc (Celestial)',
    color: '#FBBF24',
    icon: '/assets/factions/celestial.png',
  },
  Hypogean: {
    label: 'Hypogean',
    viLabel: 'Ác Ma (Hypogean)',
    color: '#A855F7',
    icon: '/assets/factions/hypogean.png',
  },
  Dimensional: {
    label: 'Dimensional',
    viLabel: 'Dị Giới (Dimensional)',
    color: '#38BDF8',
    icon: '/assets/factions/dimensional.png',
  },
  Draconis: {
    label: 'Draconis',
    viLabel: 'Long Tộc (Draconis)',
    color: '#EF4444',
    icon: '/assets/factions/celestial.png',
  },
};

export interface DreamRealmBossSpec {
  id: string;
  unitId: number;
  name: string;
  mode: 'Dream Realm' | 'Guild Hunt';
  title: string;
  recommendedPower: number;
  imageUrl: string;
  rewardGold: number;
  rewardEssence: number;
  rewardScrolls: number;
  enemyLineup: [string, string, string, string, string];
}

export const DREAM_REALM_BOSSES: DreamRealmBossSpec[] = [
  {
    id: 'kane',
    unitId: 1003,
    name: 'Kane',
    mode: 'Dream Realm',
    title: 'Thực Thể Hủy Diệt Cổ Đại · Dream Realm Boss',
    recommendedPower: 28000,
    imageUrl: 'https://raw.githubusercontent.com/floofpire/cdn/main/unit_icon_by_id/1003_2x.webp',
    rewardGold: 6500,
    rewardEssence: 900,
    rewardScrolls: 3,
    enemyLineup: ['abyssal_warden', 'crimson_revenant', 'pyre_archon', 'frost_arbiter', 'arcane_serpent'],
  },
  {
    id: 'ice-shemira',
    unitId: 1016,
    name: 'Ice Shemira',
    mode: 'Dream Realm',
    title: 'Nữ Hoàng Băng Giá Vĩnh Cửu · Dream Realm Boss',
    recommendedPower: 32000,
    imageUrl: 'https://raw.githubusercontent.com/floofpire/cdn/main/unit_icon_by_id/1016_2x.webp',
    rewardGold: 7500,
    rewardEssence: 1100,
    rewardScrolls: 3,
    enemyLineup: ['frost_arbiter', 'celestial_guardian', 'shemira', 'storm_empress', 'dawn_oracle'],
  },
  {
    id: 'demonic-entity',
    unitId: 1012,
    name: 'Demonic Entity',
    mode: 'Dream Realm',
    title: 'Chúa Tể Hư Không Ác Mộng · Dream Realm Boss',
    recommendedPower: 36000,
    imageUrl: 'https://raw.githubusercontent.com/floofpire/cdn/main/unit_icon_by_id/1012_2x.webp',
    rewardGold: 8500,
    rewardEssence: 1250,
    rewardScrolls: 4,
    enemyLineup: ['abyssal_warden', 'ezizh', 'lucilla', 'mehira', 'zolrath'],
  },
  {
    id: 'grotesque-mage',
    unitId: 1025,
    name: 'Grotesque Mage',
    mode: 'Dream Realm',
    title: 'Pháp Sư Hỗn Mang · Dream Realm Boss',
    recommendedPower: 40000,
    imageUrl: 'https://raw.githubusercontent.com/floofpire/cdn/main/unit_icon_by_id/1025_2x.webp',
    rewardGold: 9500,
    rewardEssence: 1400,
    rewardScrolls: 4,
    enemyLineup: ['iron_bastion', 'oden', 'pyre_archon', 'isabella', 'silas'],
  },
  {
    id: 'the-unhinged',
    unitId: 1022,
    name: 'The Unhinged',
    mode: 'Dream Realm',
    title: 'Cuồng Chiến Thần Vực Thẳm · Dream Realm Boss',
    recommendedPower: 44000,
    imageUrl: 'https://raw.githubusercontent.com/floofpire/cdn/main/unit_icon_by_id/1022_2x.webp',
    rewardGold: 11000,
    rewardEssence: 1600,
    rewardScrolls: 5,
    enemyLineup: ['awakened-brutus', 'brutus', 'khasos', 'warek', 'kren'],
  },
  {
    id: 'burning-brute',
    unitId: 1017,
    name: 'Burning Brute',
    mode: 'Dream Realm',
    title: 'Khổng Lồ Hỏa Ngục · Dream Realm Boss',
    recommendedPower: 48000,
    imageUrl: 'https://raw.githubusercontent.com/floofpire/cdn/main/unit_icon_by_id/1017_2x.webp',
    rewardGold: 12500,
    rewardEssence: 1800,
    rewardScrolls: 5,
    enemyLineup: ['framton', 'awakened-talene', 'pyre_archon', 'satrana', 'talene'],
  },
  {
    id: 'wrizz',
    unitId: 1006,
    name: 'Wrizz',
    mode: 'Guild Hunt',
    title: 'Vua Yêu Tinh Kho Báu · Guild Hunt Boss',
    recommendedPower: 25000,
    imageUrl: 'https://raw.githubusercontent.com/floofpire/cdn/main/unit_icon_by_id/1006_2x.webp',
    rewardGold: 15000,
    rewardEssence: 1000,
    rewardScrolls: 3,
    enemyLineup: ['iron_bastion', 'kren', 'numisu', 'drez', 'skreg'],
  },
  {
    id: 'dune-destroyer',
    unitId: 1075,
    name: 'Dune Destroyer',
    mode: 'Guild Hunt',
    title: 'Quái Thú Sa Mạc Cổ Đại · Guild Hunt Boss',
    recommendedPower: 35000,
    imageUrl: 'https://raw.githubusercontent.com/floofpire/cdn/main/unit_icon_by_id/1075_2x.webp',
    rewardGold: 18000,
    rewardEssence: 1500,
    rewardScrolls: 4,
    enemyLineup: ['skreg', 'anasta', 'crassio', 'skriath', 'salaki'],
  },
];

export interface OfficialGameVideo {
  id: string;
  youtubeId: string;
  title: string;
  subtitle: string;
  category: 'Companions Launch' | 'Crossover Event' | 'Awakened Cinematic' | 'Lore Animation';
  duration: string;
  description: string;
  showcaseTeam: [string, string, string, string, string];
}

export const OFFICIAL_GAME_VIDEOS: OfficialGameVideo[] = [
  {
    id: 'companions-launch',
    youtubeId: '20M7fUslmMA',
    title: 'AFK Arena: Companions — Official Launch Trailer',
    subtitle: 'A Whole New Esperia Awaits Your Return',
    category: 'Companions Launch',
    duration: '01:32',
    description:
      'Trailer chính thức giới thiệu chế độ AFK Arena: Companions với hệ thống liên kết anh hùng, triệu hồi tốc độ cao và chiến trường 5v5 kinh điển.',
    showcaseTeam: ['celestial_guardian', 'awakened-brutus', 'awakened-talene', 'dawn_oracle', 'emerald_valkyrie'],
  },
  {
    id: 'solo-leveling-collab',
    youtubeId: 'MmsKulCqCLQ',
    title: 'AFK Arena × Solo Leveling — Sung Jin-Woo & Cha Hae-In',
    subtitle: 'Official Dimensional Crossover Trailer',
    category: 'Crossover Event',
    duration: '01:45',
    description:
      'Sự kiện kết hợp bom tấn giữa AFK Arena và Solo Leveling: Thợ Săn Sung Jin-Woo và Cha Hae-In bước vào lục địa Esperia với kỹ năng Triệu Hồi Bóng Tối.',
    showcaseTeam: ['sung-jinwoo', 'cha-hae-in', 'albedo', 'ainz-ooal-gown', 'merlin'],
  },
  {
    id: 'order-and-chaos',
    youtubeId: 'hEBx9294Q4Y',
    title: 'Order and Chaos — Liberta & Lucilla Official Cinematic',
    subtitle: 'Celestial & Hypogean Twin Fates',
    category: 'Awakened Cinematic',
    duration: '02:58',
    description:
      'Phim ngắn chính thức về hai anh hùng đứng đầu bảng xếp hạng Companions Tier List: Liberta (Thần Tộc) và Lucilla (Ác Ma).',
    showcaseTeam: ['liberta', 'lucilla', 'dawn_oracle', 'storm_empress', 'abyssal_warden'],
  },
  {
    id: 'spark-of-hope',
    youtubeId: 'K1tMmxQN0Sg',
    title: 'Sacred Dawn — Awakened Belinda: Spark of Hope',
    subtitle: 'Lightbearer Awakened Hero Cinematic',
    category: 'Awakened Cinematic',
    duration: '02:35',
    description:
      'Cinematic thức tỉnh của Belinda với sức mạnh Ánh Sáng Thánh Điện hủy diệt toàn bộ chiến trường.',
    showcaseTeam: ['celestial_guardian', 'arthur', 'belinda', 'rowan', 'rosaline'],
  },
  {
    id: 'lions-pride',
    youtubeId: 'GKc1fnvxLuM',
    title: "Brutus: Lion's Pride — Awakened Brutus Official Trailer",
    subtitle: 'Mauler Awakened Hero Cinematic',
    category: 'Awakened Cinematic',
    duration: '02:20',
    description:
      'Chiến thần sư tử Awakened Brutus thức tỉnh sức mạnh cuồng nộ, càn quét tiền tuyến kẻ địch.',
    showcaseTeam: ['awakened-brutus', 'brutus', 'anasta', 'skriath', 'pyre_archon'],
  },
  {
    id: 'flame-reborn',
    youtubeId: 'rhWRlcq0n2Y',
    title: 'Soar | A Flame Reborn — Awakened Talene Cinematic',
    subtitle: 'Celestial Phoenix Awakening',
    category: 'Awakened Cinematic',
    duration: '03:12',
    description:
      'Phượng hoàng lửa Awakened Talene tái sinh từ tro tàn, vừa gây sát thương diện rộng vừa hồi sinh bất tử trên sân đấu.',
    showcaseTeam: ['awakened-talene', 'talene', 'haelus', 'elijah-lailah', 'shadow_sovereign'],
  },
  {
    id: 'tales-of-esperia',
    youtubeId: 'o63fPWyezNs',
    title: 'Tales of Esperia: Desperation — Official Animated Short',
    subtitle: 'Lore & Worldbuilding Animation',
    category: 'Lore Animation',
    duration: '04:15',
    description:
      'Phim hoạt hình cốt truyện chính thức tái hiện cuộc đại chiến giữa Ánh Sáng, Rừng Già và Quân Đoàn Vong Linh tại Esperia.',
    showcaseTeam: ['grezhul', 'thoran', 'daimon', 'shemira', 'ferael'],
  },
];

export type RepoFactionId = NonNullable<HeroDefinition['repoFaction']>;

export function getHeroRepoFaction(hero: HeroDefinition): RepoFactionId {
  if (hero.repoFaction) return hero.repoFaction;
  switch (hero.faction) {
    case 'Solar Order':
      return 'Lightbearer';
    case 'Crimson Covenant':
      return 'Mauler';
    case 'Verdant Wilds':
      return 'Wilder';
    case 'Shadow Court':
      return 'Graveborn';
    case 'Arcane Conclave':
    default:
      return 'Celestial';
  }
}

/**
 * Authentic AFK Arena Faction Counter Cycle (+25% Damage Bonus):
 * - Lightbearer -> Mauler -> Wilder -> Graveborn -> Lightbearer
 * - Celestial <-> Hypogean deal +25% damage to each other
 * - Draconis <-> Draconis deal +25% damage to each other
 */
export function getFactionDamageMultiplier(
  attackerFaction?: RepoFactionId,
  defenderFaction?: RepoFactionId
): number {
  if (!attackerFaction || !defenderFaction) return 1.0;
  if (attackerFaction === 'Lightbearer' && defenderFaction === 'Mauler') return 1.25;
  if (attackerFaction === 'Mauler' && defenderFaction === 'Wilder') return 1.25;
  if (attackerFaction === 'Wilder' && defenderFaction === 'Graveborn') return 1.25;
  if (attackerFaction === 'Graveborn' && defenderFaction === 'Lightbearer') return 1.25;
  if (
    (attackerFaction === 'Celestial' && defenderFaction === 'Hypogean') ||
    (attackerFaction === 'Hypogean' && defenderFaction === 'Celestial')
  ) {
    return 1.25;
  }
  if (attackerFaction === 'Draconis' && defenderFaction === 'Draconis') {
    return 1.25;
  }
  return 1.0;
}

export interface FactionAuraBonus {
  tierLabel: string;
  atkBonusPct: number;
  hpBonusPct: number;
  defBonusPct: number;
  energyOnHitBonusPct: number;
  critBonusPct: number;
  critDmgBonusPct: number;
  hypogeanCount: number;
  celestialCount: number;
  draconisCount: number;
  dominantFaction: RepoFactionId | null;
  factionCounts: Record<RepoFactionId, number>;
}

/**
 * Authentic AFK Arena Formation Aura Calculation (from in-game Faction Advantage rules):
 * - 3 same faction: ATK +10%, HP +10%
 * - 3 same + 2 another: ATK +15%, HP +15%
 * - 4 same faction: ATK +15%, HP +20%
 * - 5 same faction: ATK +25%, HP +25%
 * - Celestials count as any faction (except Hypogean) toward same-faction bonuses.
 * - Hypogeans grant independent buffs: 1+ (+30% DEF), 2+ (+25% Energy on hit), 3+ (+15% Crit, +30% Crit Dmg).
 * - Draconis grant +2% ATK & +2% HP per deployed Draconis hero.
 */
export function computeFactionAura(
  heroIds: (string | null | undefined)[]
): FactionAuraBonus {
  const factionCounts: Record<RepoFactionId, number> = {
    Lightbearer: 0,
    Mauler: 0,
    Wilder: 0,
    Graveborn: 0,
    Celestial: 0,
    Hypogean: 0,
    Dimensional: 0,
    Draconis: 0,
  };

  for (const id of heroIds) {
    if (!id) continue;
    const hero = getHeroById(id);
    const fac = getHeroRepoFaction(hero);
    factionCounts[fac] = (factionCounts[fac] || 0) + 1;
  }

  const celestialCount = factionCounts.Celestial;
  const hypogeanCount = factionCounts.Hypogean;
  const draconisCount = factionCounts.Draconis;

  // Non-Hypogean base factions that Celestial can augment
  const poolFactions: RepoFactionId[] = [
    'Lightbearer',
    'Mauler',
    'Wilder',
    'Graveborn',
    'Dimensional',
    'Draconis',
  ];

  const sortedNonCel = poolFactions
    .map((f) => ({ faction: f, count: factionCounts[f] }))
    .sort((a, b) => b.count - a.count);

  const primaryCount = (sortedNonCel[0]?.count || 0) + celestialCount;
  const secondaryCount = sortedNonCel[1]?.count || 0;
  const dominantFaction: RepoFactionId | null =
    primaryCount > 0
      ? sortedNonCel[0] && sortedNonCel[0].count > 0
        ? sortedNonCel[0].faction
        : celestialCount > 0
          ? 'Celestial'
          : hypogeanCount > 0
            ? 'Hypogean'
            : null
      : hypogeanCount > 0
        ? 'Hypogean'
        : null;

  let atkBonusPct = 0;
  let hpBonusPct = 0;
  let tierLabel = 'Chưa Kích Hoạt Cộng Hưởng (0%)';

  if (primaryCount >= 5) {
    atkBonusPct = 0.25;
    hpBonusPct = 0.25;
    tierLabel = '5 Tướng Cùng Hệ (+25% Công, +25% Máu)';
  } else if (primaryCount === 4) {
    atkBonusPct = 0.15;
    hpBonusPct = 0.2;
    tierLabel = '4 Tướng Cùng Hệ (+15% Công, +20% Máu)';
  } else if (primaryCount === 3 && secondaryCount >= 2) {
    atkBonusPct = 0.15;
    hpBonusPct = 0.15;
    tierLabel = 'Đội Hình 3 + 2 Hệ (+15% Công, +15% Máu)';
  } else if (primaryCount >= 3) {
    atkBonusPct = 0.1;
    hpBonusPct = 0.1;
    tierLabel = '3 Tướng Cùng Hệ (+10% Công, +10% Máu)';
  } else if (hypogeanCount > 0) {
    tierLabel = `Ác Ma Hypogean (${hypogeanCount} Tướng)`;
  }

  // Add Draconis per-hero bonus (+2% ATK, +2% HP each)
  if (draconisCount > 0) {
    atkBonusPct = Number((atkBonusPct + draconisCount * 0.02).toFixed(2));
    hpBonusPct = Number((hpBonusPct + draconisCount * 0.02).toFixed(2));
  }

  // Hypogean independent bonuses
  const defBonusPct = hypogeanCount >= 1 ? 0.3 : 0;
  const energyOnHitBonusPct = hypogeanCount >= 2 ? 0.25 : 0;
  const critBonusPct = hypogeanCount >= 3 ? 0.15 : 0;
  const critDmgBonusPct = hypogeanCount >= 3 ? 0.3 : 0;

  return {
    tierLabel,
    atkBonusPct,
    hpBonusPct,
    defBonusPct,
    energyOnHitBonusPct,
    critBonusPct,
    critDmgBonusPct,
    hypogeanCount,
    celestialCount,
    draconisCount,
    dominantFaction,
    factionCounts,
  };
}

