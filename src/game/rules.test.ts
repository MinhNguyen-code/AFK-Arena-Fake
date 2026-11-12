import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialPlayerState,
  calculateLevelUpCost,
  calculateHeroStats,
  getHeroTemplate,
  performAutoUpgradePass,
  calculateAfkRewards,
  executeGachaSummon,
  calculateEloDelta,
  calculateSquadCombatPower,
  generateArenaOpponents,
  HERO_CATALOG,
} from './rules';

test('all 16 heroes in HERO_CATALOG have a complete 3-skill kit and 3D VFX style', () => {
  assert.equal(HERO_CATALOG.length, 16);
  for (const hero of HERO_CATALOG) {
    assert.ok(hero.ultimateName.length > 0, `${hero.id} missing ultimateName`);
    assert.ok(hero.ultimateDesc.length > 0, `${hero.id} missing ultimateDesc`);
    assert.ok(hero.activeSkillName.length > 0, `${hero.id} missing activeSkillName`);
    assert.ok(hero.activeSkillDesc.length > 0, `${hero.id} missing activeSkillDesc`);
    assert.ok(hero.activeSkillCooldown >= 3, `${hero.id} invalid activeSkillCooldown`);
    assert.ok(hero.passiveSkillName.length > 0, `${hero.id} missing passiveSkillName`);
    assert.ok(hero.passiveSkillDesc.length > 0, `${hero.id} missing passiveSkillDesc`);
    assert.ok(hero.vfxStyle.length > 0, `${hero.id} missing vfxStyle`);
  }
});

test('calculateLevelUpCost scales monotonically and requires dust at breakthrough levels', () => {
  const lv1 = calculateLevelUpCost(1);
  const lv9 = calculateLevelUpCost(9);
  const lv10 = calculateLevelUpCost(10);

  assert.equal(lv1.dust, 0);
  assert.equal(lv9.dust, 0);
  assert.ok(lv10.dust > 0, 'Level 10 breakthrough requires arcane dust');
  assert.ok(lv10.gold > lv1.gold);
  assert.ok(lv10.exp > lv1.exp);
});

test('performAutoUpgradePass levels up lowest-level deployed heroes and ascends stars', () => {
  const initial = createInitialPlayerState();
  initial.heroes['lucius_paladin'].shards = 6; // Enough to ascend from 2 stars (needs 4 shards)
  const initialPower = calculateSquadCombatPower(initial.heroes);

  const { nextState, upgradesCount, ascensionsCount } = performAutoUpgradePass(initial);

  assert.ok(upgradesCount > 0, 'Should perform multiple automatic level upgrades');
  assert.ok(ascensionsCount >= 1, 'Should ascend hero with sufficient shards');
  assert.ok(nextState.gold < initial.gold, 'Gold should be deducted');
  assert.ok(
    calculateSquadCombatPower(nextState.heroes) > initialPower,
    'Combat power must increase after auto-upgrade'
  );
});

test('executeGachaSummon handles 10-pull, guarantees Ascended on pity, and converts duplicates to shards', () => {
  const state = createInitialPlayerState();
  state.summonScrolls = 0;
  state.gems = 3000;
  state.pityCounter = 19; // Next pull is 20th -> guaranteed Ascended!

  let seed = 0.5;
  const deterministicRng = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const { nextState, results, error } = executeGachaSummon(state, 10, deterministicRng);
  assert.equal(error, undefined);
  assert.equal(results.length, 10);
  assert.equal(nextState.gems, 300); // 3000 - 2700
  assert.equal(results[0].isPityTriggered, true);
  assert.equal(results[0].template.baseRarity, 'ascended');
});

test('calculateAfkRewards computes proportional idle loot and caps at 12 hours', () => {
  const oneHour = calculateAfkRewards(5, 3600);
  const twentyHours = calculateAfkRewards(5, 72000);
  const twelveHours = calculateAfkRewards(5, 43200);

  assert.ok(oneHour.gold > 0);
  assert.ok(oneHour.heroExp > 0);
  assert.equal(twentyHours.gold, twelveHours.gold, 'Capped at 12 hours (43200s)');
});

test('Ranked Arena ELO delta rewards higher points for beating stronger opponents', () => {
  const beatHigher = calculateEloDelta(1200, 1500, true);
  const beatLower = calculateEloDelta(1500, 1200, true);
  const loseToHigher = calculateEloDelta(1200, 1500, false);

  assert.ok(beatHigher > beatLower);
  assert.ok(loseToHigher < 0);

  const opponents = generateArenaOpponents(1250, 15000);
  assert.equal(opponents.length, 5);
});
