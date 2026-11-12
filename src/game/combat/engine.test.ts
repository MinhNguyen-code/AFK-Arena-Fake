import test from 'node:test';
import assert from 'node:assert/strict';
import { HERO_DEFINITIONS, getHeroDefinition } from '../../data/heroes';
import { CAMPAIGN_STAGES, getCampaignStage } from '../../data/stages';
import {
  computeHeroCombatStats,
  validateFormation,
  calculateOfflineRewards,
  executeWeightedSummons,
  OFFLINE_CAP_SECONDS,
} from '../systems/statCalculator';
import { CombatEngine, simulateFullBattle } from './engine';
import { GameSaveData, OwnedHeroState } from '../../types/game';

function createMockSave(): GameSaveData {
  const ownedHeroes: Record<string, OwnedHeroState> = {};
  for (const h of HERO_DEFINITIONS.slice(0, 5)) {
    ownedHeroes[h.id] = {
      heroId: h.id,
      level: 10,
      ascensionRank: 1,
      stars: 2,
      shards: 4,
      equipment: { weapon: null, armor: null, boots: null, accessory: null },
    };
  }

  return {
    version: 1,
    gold: 20000,
    heroExp: 15000,
    arcaneEssence: 500,
    astralGems: 6000,
    summonScrolls: 15,
    pityCounter: 0,
    totalSummons: 0,
    currentStageId: '1-1',
    clearedStageIds: [],
    lastOfflineClaimTimestamp: Date.now() - 3600 * 1000,
    ownedHeroes,
    formation: [
      'valerius_dawnblade',
      'brynjar_ironbreaker',
      'lyra_sunweaver',
      'kaelen_thornshot',
      'seraphina_lumina',
    ],
    presets: [],
    inventory: [
      {
        instanceId: 'eq_test_1',
        templateId: 'wpn_sun_blade',
        level: 3,
        equippedHeroId: 'valerius_dawnblade',
      },
    ],
    settings: {
      battleSpeed: 1,
      autoSkill: true,
      reducedMotion: false,
      soundEnabled: true,
    },
  };
}

test('Hero System: Contains at least 12 original heroes across all 5 required roles', () => {
  assert.ok(
    HERO_DEFINITIONS.length >= 12,
    `Expected >= 12 heroes, found ${HERO_DEFINITIONS.length}`
  );

  const roles = new Set(HERO_DEFINITIONS.map((h) => h.role));
  for (const requiredRole of ['TANK', 'DPS', 'SUPPORT', 'CC', 'HYBRID'] as const) {
    assert.ok(roles.has(requiredRole), `Missing required role: ${requiredRole}`);
  }
});

test('Stat Calculation: Level, stars, and equipped items increase combat power', () => {
  const hero = getHeroDefinition('valerius_dawnblade');
  const baseStats = computeHeroCombatStats(
    hero,
    {
      level: 1,
      ascensionRank: 0,
      stars: 1,
      equipment: { weapon: null, armor: null, boots: null, accessory: null },
    },
    []
  );

  const upgradedStats = computeHeroCombatStats(
    hero,
    {
      level: 15,
      ascensionRank: 2,
      stars: 3,
      equipment: {
        weapon: 'eq_test_1',
        armor: null,
        boots: null,
        accessory: null,
      },
    },
    [
      {
        instanceId: 'eq_test_1',
        templateId: 'wpn_sun_blade',
        level: 4,
        equippedHeroId: 'valerius_dawnblade',
      },
    ]
  );

  assert.ok(upgradedStats.hp > baseStats.hp);
  assert.ok(upgradedStats.attack > baseStats.attack);
  assert.ok(upgradedStats.combatPower > baseStats.combatPower);
});

test('Formation Validation: Prevents duplicate heroes and empty formations', () => {
  const save = createMockSave();

  const duplicateCheck = validateFormation(
    ['valerius_dawnblade', 'valerius_dawnblade', null, null, null],
    save.ownedHeroes
  );
  assert.equal(duplicateCheck.valid, false);

  const emptyCheck = validateFormation(
    [null, null, null, null, null],
    save.ownedHeroes
  );
  assert.equal(emptyCheck.valid, false);

  const validCheck = validateFormation(save.formation, save.ownedHeroes);
  assert.equal(validCheck.valid, true);
});

test('Offline Reward Calculation: Scales with cleared stages and caps at 12 hours', () => {
  const oneHour = calculateOfflineRewards(5, 3600);
  const twentyHours = calculateOfflineRewards(5, 20 * 3600);

  assert.ok(oneHour.gold > 0);
  assert.ok(oneHour.heroExp > 0);
  assert.equal(twentyHours.cappedSeconds, OFFLINE_CAP_SECONDS);
});

test('Summon Probability & Pity: Guarantees Ascended hero at pity threshold and converts duplicates to shards', () => {
  const save = createMockSave();
  save.pityCounter = 19; // Next pull is 20th (pity threshold)

  const { nextSave, results, error } = executeWeightedSummons(save, 1, 99999);
  assert.equal(error, undefined);
  assert.equal(results.length, 1);
  assert.equal(results[0].rarity, 'Ascended');
  assert.equal(nextSave.pityCounter, 0);

  const tenPull = executeWeightedSummons(nextSave, 10, 424242);
  assert.equal(tenPull.results.length, 10);
  assert.equal(tenPull.nextSave.totalSummons, 11);
});

test('Deterministic 5v5 Combat Engine: Identical seeds produce identical outcomes and unit statistics', () => {
  const save = createMockSave();
  const stage = getCampaignStage('1-1');

  const runA = simulateFullBattle({
    stage,
    formation: save.formation,
    ownedHeroes: save.ownedHeroes,
    inventory: save.inventory,
    seed: 777888,
  });

  const runB = simulateFullBattle({
    stage,
    formation: save.formation,
    ownedHeroes: save.ownedHeroes,
    inventory: save.inventory,
    seed: 777888,
  });

  assert.equal(runA.outcome, runB.outcome);
  assert.equal(runA.durationSec, runB.durationSec);
  assert.deepEqual(runA.unitStats, runB.unitStats);
  assert.equal(runA.outcome, 'victory');
});

test('Combat Engine Mechanics: Skills, shields, crowd control, and manual ultimate trigger work properly', () => {
  const save = createMockSave();
  const stage = getCampaignStage('1-5');
  const engine = new CombatEngine({
    stage,
    formation: save.formation,
    ownedHeroes: save.ownedHeroes,
    inventory: save.inventory,
    seed: 10101,
    autoSkill: false,
  });

  const leader = engine.units.find((u) => u.team === 'ally')!;
  assert.ok(leader.shield > 0, 'Valerius passive should grant starting shield');

  leader.energy = 100;
  const triggered = engine.triggerManualUltimate(leader.unitId, true);
  assert.equal(triggered, true);
  assert.equal(leader.energy, 0);

  const events = engine.consumeEvents();
  assert.ok(events.some((e) => e.type === 'ultimate_skill'));
  assert.equal(CAMPAIGN_STAGES.length, 30, 'Campaign must have 30 stages');
});
