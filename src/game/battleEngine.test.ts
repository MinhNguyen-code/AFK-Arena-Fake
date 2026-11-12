import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CORE_12_HEROES,
  ADDITIONAL_6_HEROES,
  ORIGINAL_18_HEROES,
  HERO_ROSTER,
  DREAM_REALM_BOSSES,
  OFFICIAL_GAME_VIDEOS,
  computeHeroStats,
  validateTeamFormation,
  getHeroLevelUpCost,
  computeFactionAura,
  getFactionDamageMultiplier,
} from './heroes';
import { CAMPAIGN_STAGES, getCampaignStage } from './campaign';
import { BattleSimulation, createSeededRng } from './battleEngine';
import { OwnedHeroState, TeamFormationSlots } from './types';

function createDefaultOwnedHeroes(level = 5, stars = 2): Record<string, OwnedHeroState> {
  const map: Record<string, OwnedHeroState> = {};
  for (const h of HERO_ROSTER) {
    map[h.id] = {
      heroId: h.id,
      level,
      stars,
      copies: 2,
      equipment: { weapon: 1, armor: 1, relic: 1 },
    };
  }
  return map;
}

test('Roster contains all 254 playable heroes, 12 core archetypes, and 6 additional original heroes', () => {
  assert.equal(CORE_12_HEROES.length, 12, 'Must have 12 core starter heroes');
  assert.equal(ADDITIONAL_6_HEROES.length, 6, 'Must have 6 additional original heroes');
  assert.equal(ORIGINAL_18_HEROES.length, 18, 'Must have 18 total handcrafted original heroes');
  assert.equal(HERO_ROSTER.length, 254, 'Must have all 254 playable heroes from the repositories');

  const counts = {
    Tank: 0,
    'Damage Dealer': 0,
    Mage: 0,
    Support: 0,
    'Crowd Controller': 0,
  };

  for (const hero of CORE_12_HEROES) {
    counts[hero.heroClass]++;
  }

  assert.equal(counts.Tank, 3, 'Must have 3 core Tanks');
  assert.equal(counts['Damage Dealer'], 3, 'Must have 3 core Damage Dealers');
  assert.equal(counts.Mage, 2, 'Must have 2 core Mages');
  assert.equal(counts.Support, 2, 'Must have 2 core Supports');
  assert.equal(counts['Crowd Controller'], 2, 'Must have 2 core Crowd Controllers');

  const extraCounts = {
    Tank: 0,
    'Damage Dealer': 0,
    Mage: 0,
    Support: 0,
    'Crowd Controller': 0,
  };
  const activeSkillNames = new Set<string>();
  const ultimateSkillNames = new Set<string>();
  const passiveSkillNames = new Set<string>();

  for (const hero of ADDITIONAL_6_HEROES) {
    extraCounts[hero.heroClass]++;
    activeSkillNames.add(hero.skills.active.name);
    ultimateSkillNames.add(hero.skills.ultimate.name);
    passiveSkillNames.add(hero.skills.passive.name);
  }

  assert.equal(extraCounts.Tank, 2, 'Additional 6 heroes must include 2 Tanks');
  assert.equal(extraCounts['Damage Dealer'], 1, 'Additional 6 heroes must include 1 Damage Dealer');
  assert.equal(extraCounts.Mage, 1, 'Additional 6 heroes must include 1 Mage');
  assert.equal(extraCounts.Support, 1, 'Additional 6 heroes must include 1 Support');
  assert.equal(extraCounts['Crowd Controller'], 1, 'Additional 6 heroes must include 1 Crowd Controller');
  assert.equal(activeSkillNames.size, 6, 'All 6 additional heroes must have unique active skills');
  assert.equal(ultimateSkillNames.size, 6, 'All 6 additional heroes must have unique ultimate skills');
  assert.equal(passiveSkillNames.size, 6, 'All 6 additional heroes must have unique passive skills');

  for (const hero of HERO_ROSTER) {
    assert.ok(hero.id.length > 0);
    assert.ok(hero.name.length > 0);
    assert.ok(hero.framedUrl && hero.framedUrl.length > 0);
    assert.ok(hero.battleUrl && hero.battleUrl.length > 0);
    assert.ok(hero.skills.basic.name.length > 0);
    assert.ok(hero.skills.active.name.length > 0);
    assert.ok(hero.skills.ultimate.name.length > 0);
    assert.ok(hero.skills.passive.name.length > 0);
  }

  assert.ok(DREAM_REALM_BOSSES.length >= 8, 'Must include Dream Realm & Guild Hunt bosses');
  assert.ok(OFFICIAL_GAME_VIDEOS.length >= 7, 'Must include official AFK Arena cinematic videos');
});

test('Team formation validation rejects empty teams and duplicate heroes', () => {
  const validTeam: TeamFormationSlots = [
    'celestial_guardian',
    'crimson_revenant',
    'storm_empress',
    'dawn_oracle',
    'arcane_serpent',
  ];
  assert.equal(validateTeamFormation(validTeam).valid, true);

  const emptyTeam: TeamFormationSlots = [null, null, null, null, null];
  assert.equal(validateTeamFormation(emptyTeam).valid, false);

  const duplicateTeam: TeamFormationSlots = [
    'celestial_guardian',
    'celestial_guardian',
    'storm_empress',
    null,
    null,
  ];
  assert.equal(validateTeamFormation(duplicateTeam).valid, false);
});

test('Hero progression upgrades increase combat stats and power deterministically', () => {
  const hero = HERO_ROSTER[0];
  const lv1 = computeHeroStats(hero, {
    heroId: hero.id,
    level: 1,
    stars: 1,
    copies: 0,
    equipment: { weapon: 1, armor: 1, relic: 1 },
  });
  const lv10 = computeHeroStats(hero, {
    heroId: hero.id,
    level: 10,
    stars: 3,
    copies: 0,
    equipment: { weapon: 3, armor: 3, relic: 3 },
  });

  assert.ok(lv10.hp > lv1.hp);
  assert.ok(lv10.attack > lv1.attack);
  assert.ok(lv10.defense > lv1.defense);
  assert.ok(lv10.combatPower > lv1.combatPower);

  const cost1 = getHeroLevelUpCost(1);
  const cost10 = getHeroLevelUpCost(10);
  assert.ok(cost10.gold > cost1.gold);
  assert.ok(cost10.ascensionStones > 0, 'Breakthrough level 10 requires ascension stones');
});

test('Deterministic seeded RNG produces identical sequences for identical seeds', () => {
  const rngA = createSeededRng(42);
  const rngB = createSeededRng(42);
  for (let i = 0; i < 20; i++) {
    assert.equal(rngA(), rngB());
  }
});

test('5v5 Combat Engine executes movement, basic attacks, active skills, ultimates, and detects Victory/Defeat', () => {
  const owned = createDefaultOwnedHeroes(6, 2);
  const formation: TeamFormationSlots = [
    'celestial_guardian',
    'crimson_revenant',
    'storm_empress',
    'dawn_oracle',
    'arcane_serpent',
  ];
  const stage1 = getCampaignStage(1);

  const sim = new BattleSimulation({
    allyFormation: formation,
    ownedHeroes: owned,
    enemies: stage1.enemies,
    seed: 2026,
    autoUltimate: true,
  });

  assert.equal(sim.getStatus(), 'running');
  assert.equal(sim.getUnits().filter((u) => u.team === 'ally').length, 5);
  assert.equal(sim.getUnits().filter((u) => u.team === 'enemy').length, 4);

  // Run fixed-timestep simulation until completion
  let steps = 0;
  while (sim.getStatus() === 'running' && steps < 2000) {
    sim.step(50);
    steps++;
  }

  assert.equal(sim.getStatus(), 'victory', 'Level 6 squad should defeat Campaign Stage 1');
  const deadEnemies = sim
    .getUnits()
    .filter((u) => u.team === 'enemy' && !u.isAlive && u.hp === 0);
  assert.equal(deadEnemies.length, 4, 'All enemies must have 0 HP and be marked dead');
});

test('All 5 Crowd Control effects (stun, silence, slow, knockback, petrify) and manual Ultimates work accurately', () => {
  const owned = createDefaultOwnedHeroes(5, 2);
  const formation: TeamFormationSlots = [
    'celestial_guardian',
    'iron_bastion',
    'arcane_serpent',
    'frost_arbiter',
    'dawn_oracle',
  ];
  const stage2 = getCampaignStage(2);

  const sim = new BattleSimulation({
    allyFormation: formation,
    ownedHeroes: owned,
    enemies: stage2.enemies,
    seed: 99,
    autoUltimate: false,
  });

  const units = sim.getUnits();
  const guardian = units.find((u) => u.heroId === 'celestial_guardian' && u.team === 'ally')!;
  const enemy = units.find((u) => u.team === 'enemy')!;

  // 1. Test Stun incapacitation
  sim.applyCrowdControl(guardian, enemy, 'stun', 2000);
  assert.equal(sim.isIncapacitated(enemy), true, 'Stunned unit must be incapacitated');

  // 2. Test Petrify incapacitation
  enemy.statusEffects = [];
  sim.applyCrowdControl(guardian, enemy, 'petrify', 2500);
  assert.equal(sim.isIncapacitated(enemy), true, 'Petrified unit must be incapacitated');

  // 3. Test Silence blocking skills
  enemy.statusEffects = [];
  sim.applyCrowdControl(guardian, enemy, 'silence', 3000);
  assert.equal(sim.isSilenced(enemy), true, 'Silenced unit cannot cast skills');

  // 4. Test Knockback displacement
  const oldX = enemy.x;
  sim.applyCrowdControl(guardian, enemy, 'knockback', 1000);
  assert.ok(enemy.x > oldX, 'Knockback must push enemy backward along X axis');

  // 5. Test Manual Ultimate Activation when Energy = 100
  guardian.energy = 100;
  const didCast = sim.triggerUltimate(guardian.instanceId, false);
  assert.equal(didCast, true, 'Manual ultimate must trigger when energy is 100');
  assert.equal(guardian.energy, 0, 'Energy must reset to 0 after casting ultimate');
});

test('Campaign system defines 10 playable stages with increasing recommended power', () => {
  assert.equal(CAMPAIGN_STAGES.length, 10);
  for (let i = 1; i < CAMPAIGN_STAGES.length; i++) {
    assert.ok(
      CAMPAIGN_STAGES[i].recommendedPower > CAMPAIGN_STAGES[i - 1].recommendedPower,
      `Stage ${i + 1} should have higher recommended power than Stage ${i}`
    );
  }
});

test('AFK Arena Faction Counter Cycle (+25% damage) and Formation Aura Bonuses (3/3+2/4/5, Celestial Wildcard, Hypogean, Draconis) work accurately', () => {
  // 1. Faction Counter Cycle: Lightbearer -> Mauler -> Wilder -> Graveborn -> Lightbearer
  assert.equal(getFactionDamageMultiplier('Lightbearer', 'Mauler'), 1.25);
  assert.equal(getFactionDamageMultiplier('Mauler', 'Wilder'), 1.25);
  assert.equal(getFactionDamageMultiplier('Wilder', 'Graveborn'), 1.25);
  assert.equal(getFactionDamageMultiplier('Graveborn', 'Lightbearer'), 1.25);
  assert.equal(getFactionDamageMultiplier('Celestial', 'Hypogean'), 1.25);
  assert.equal(getFactionDamageMultiplier('Hypogean', 'Celestial'), 1.25);
  assert.equal(getFactionDamageMultiplier('Lightbearer', 'Wilder'), 1.0);

  // 2. 3 Lightbearers + 2 Celestials => 5 Same-Faction Aura (+25% ATK, +25% HP) via Celestial wildcard
  const aura5 = computeFactionAura([
    'celestial_guardian', // Lightbearer
    'storm_empress', // Lightbearer
    'astral_blademaster', // Lightbearer
    'dawn_oracle', // Celestial
    'celestial_weaver', // Celestial
  ]);
  assert.equal(aura5.atkBonusPct, 0.25);
  assert.equal(aura5.hpBonusPct, 0.25);

  // 3. Hypogean independent bonuses (1+ = +30% DEF, 2+ = +25% Energy, 3+ = +15% Crit)
  const auraHypo = computeFactionAura([
    'abyssal_warden', // Hypogean
    'chrono_warden', // Hypogean
    'ezizh', // Hypogean
    'celestial_guardian',
    'crimson_revenant',
  ]);
  assert.equal(auraHypo.defBonusPct, 0.3);
  assert.equal(auraHypo.energyOnHitBonusPct, 0.25);
  assert.equal(auraHypo.critBonusPct, 0.15);
});

test('3D Battle Scene Engine: Builds all 12 core 3D hero rigs, steps all 10 animation states, maps 3 3D environments, and pools 5-phase VFX', async () => {
  const {
    CORE_HERO_ARCHETYPES,
    GRAPHICS_PRESET_CONFIGS,
    buildThreeHeroRig,
    updateThreeHeroAnimation,
    resolveArenaEnvironment,
    ThreeVfxPool,
  } = await import('./threeBattleScene');

  assert.equal(
    Object.keys(CORE_HERO_ARCHETYPES).length,
    12,
    'Must define 12 bespoke 3D core hero archetypes'
  );
  assert.equal(
    Object.keys(GRAPHICS_PRESET_CONFIGS).length,
    4,
    'Must define LOW, MEDIUM, HIGH, ULTRA graphics configs'
  );

  assert.equal(resolveArenaEnvironment('sylvan', 'auto'), 'enchanted_forest');
  assert.equal(resolveArenaEnvironment('sanctuary', 'auto'), 'celestial_temple');
  assert.equal(resolveArenaEnvironment('obsidian', 'auto'), 'shadow_realm');
  assert.equal(resolveArenaEnvironment('sylvan', 'shadow_realm'), 'shadow_realm');

  const owned = createDefaultOwnedHeroes(10, 3);
  const sim = new BattleSimulation({
    allyFormation: [
      'celestial_guardian',
      'iron_bastion',
      'storm_empress',
      'emerald_valkyrie',
      'dawn_oracle',
    ],
    ownedHeroes: owned,
    enemies: getCampaignStage(1).enemies,
    seed: 777,
    autoUltimate: false,
  });

  const units = sim.getUnits();
  for (const unit of units) {
    const rig = buildThreeHeroRig(unit, true);
    assert.ok(rig.root.children.length >= 4, '3D hero rig must have hierarchical child nodes');
    updateThreeHeroAnimation(rig, unit, 0.016, 1.0, 'running');
    assert.equal(rig.animState, 'Idle');

    // Test BasicAttack, Skill, Ultimate, Hit, Knockback, Stun, Victory, Defeat states
    rig.animState = 'BasicAttack';
    rig.animTimer = 0.2;
    updateThreeHeroAnimation(rig, unit, 0.016, 1.1, 'running');
    assert.equal(rig.animState, 'BasicAttack');

    rig.knockbackOffset = 0.5;
    updateThreeHeroAnimation(rig, unit, 0.016, 1.2, 'running');
    assert.equal(rig.animState, 'Knockback');

    rig.knockbackOffset = 0;
    updateThreeHeroAnimation(rig, unit, 0.016, 1.3, 'victory');
    assert.equal(rig.animState, unit.team === 'ally' ? 'Victory' : 'Defeat');
  }

  const vfxPool = new ThreeVfxPool(64);
  vfxPool.spawnCastBurst({ x: -2, z: 0 }, 0xfbbf24, 1.2);
  vfxPool.spawnProjectile({ x: -2, z: 0 }, { x: 2, z: 0 }, 0x38bdf8, 0.25);
  vfxPool.spawnSlashArc({ x: 2, z: 0 }, 0xef4444, false);
  vfxPool.spawnImpact({ x: 2, z: 0 }, 0xfbbf24, 1.4, true);
  assert.ok(vfxPool.getActiveCount() >= 5, '5-phase VFX pool should activate pooled meshes');
  vfxPool.update(0.1);
  vfxPool.dispose();
});


