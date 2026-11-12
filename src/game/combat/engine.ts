import {
  ActiveStatusEffect,
  CampaignStageDefinition,
  CombatEvent,
  CombatResultSummary,
  CombatUnitState,
  FormationSlots,
  HeroSkillSpec,
  OwnedEquipmentItem,
  OwnedHeroState,
  TargetPriority,
} from '../../types/game';
import { getHeroDefinition } from '../../data/heroes';
import {
  calculateFactionSynergy,
  computeHeroCombatStats,
} from '../systems/statCalculator';
import { SeededRng } from '../core/rng';

export const FIXED_TIMESTEP_SEC = 0.05;
export const MAX_BATTLE_DURATION_SEC = 90;

export const ALLY_SLOT_COORDS: Array<{ x: number; y: number }> = [
  { x: 335, y: 225 }, // Slot 0: Frontline Top
  { x: 315, y: 365 }, // Slot 1: Frontline Bottom
  { x: 175, y: 175 }, // Slot 2: Backline Top
  { x: 145, y: 295 }, // Slot 3: Backline Middle
  { x: 170, y: 415 }, // Slot 4: Backline Bottom
];

export const ENEMY_SLOT_COORDS: Array<{ x: number; y: number }> = [
  { x: 665, y: 225 }, // Slot 0: Frontline Top
  { x: 685, y: 365 }, // Slot 1: Frontline Bottom
  { x: 825, y: 175 }, // Slot 2: Backline Top
  { x: 855, y: 295 }, // Slot 3: Backline Middle
  { x: 830, y: 415 }, // Slot 4: Backline Bottom
];

export interface CombatEngineConfig {
  stage: CampaignStageDefinition;
  formation: FormationSlots;
  ownedHeroes: Record<string, OwnedHeroState>;
  inventory: OwnedEquipmentItem[];
  seed?: number;
  autoSkill?: boolean;
}

export class CombatEngine {
  public readonly seed: number;
  public readonly stage: CampaignStageDefinition;
  public readonly rng: SeededRng;
  public units: CombatUnitState[] = [];
  public events: CombatEvent[] = [];
  private unreadEvents: CombatEvent[] = [];
  private nextEventId: number = 1;
  public elapsedSec: number = 0;
  public isFinished: boolean = false;
  public outcome: 'victory' | 'defeat' | null = null;
  public autoSkill: boolean;

  constructor(config: CombatEngineConfig) {
    this.stage = config.stage;
    this.seed = config.seed ?? 133742;
    this.rng = new SeededRng(this.seed);
    this.autoSkill = config.autoSkill ?? true;

    this.initializeUnits(config);
  }

  private initializeUnits(config: CombatEngineConfig): void {
    const synergy = calculateFactionSynergy(config.formation);

    // Spawn Ally Team (up to 5 slots)
    config.formation.forEach((heroId, slotIdx) => {
      if (!heroId) return;
      const owned = config.ownedHeroes[heroId];
      if (!owned) return;
      const def = getHeroDefinition(heroId);
      const computed = computeHeroCombatStats(def, owned, config.inventory);
      const pos = ALLY_SLOT_COORDS[slotIdx] || ALLY_SLOT_COORDS[0];

      const maxHp = Math.round(computed.hp * (1 + synergy.bonusHpPct));
      const attack = Math.round(computed.attack * (1 + synergy.bonusAtkPct));
      const startingShield = def.passiveSkill.startingShieldPct
        ? Math.round(maxHp * def.passiveSkill.startingShieldPct)
        : 0;

      this.units.push({
        unitId: `ally_${slotIdx}_${heroId}`,
        heroId,
        name: def.name,
        title: def.title,
        team: 'ally',
        slotIndex: slotIdx,
        isFrontline: slotIdx < 2,
        isBoss: false,
        role: def.role,
        faction: def.faction,
        damageType: def.damageType,
        isMelee: def.isMelee,
        attackRange: def.attackRange,
        level: owned.level,
        stars: owned.stars,
        maxHp,
        hp: maxHp,
        attack,
        defense: computed.defense,
        speed: computed.speed,
        critChance: computed.critChance,
        critDamage: computed.critDamage,
        shield: startingShield,
        energy: 25,
        x: pos.x,
        y: pos.y,
        homeX: pos.x,
        homeY: pos.y,
        animState: 'idle',
        animTimer: 0,
        attackCooldown: 0.4 + slotIdx * 0.12,
        activeSkillCooldown: 2.5 + slotIdx * 0.3,
        statusEffects: [],
        totalDamageDealt: 0,
        totalHealingDone: 0,
        totalDamageTaken: 0,
        isAlive: true,
      });
    });

    // Spawn Stage Enemies (5 units)
    config.stage.enemies.forEach((enemySpec, idx) => {
      const def = getHeroDefinition(enemySpec.heroId);
      const computed = computeHeroCombatStats(
        def,
        {
          level: enemySpec.level,
          ascensionRank: enemySpec.ascensionRank,
          stars: enemySpec.stars,
          equipment: {
            weapon: null,
            armor: null,
            boots: null,
            accessory: null,
          },
        },
        []
      );
      const slotIdx = Math.min(4, Math.max(0, enemySpec.slotIndex));
      const pos = ENEMY_SLOT_COORDS[slotIdx] || ENEMY_SLOT_COORDS[idx % 5];

      const bossHpScalar = enemySpec.isBoss ? 1.25 : 0.88;
      const bossAtkScalar = enemySpec.isBoss ? 1.12 : 0.86;
      const maxHp = Math.round(computed.hp * bossHpScalar);
      const attack = Math.round(computed.attack * bossAtkScalar);
      const startingShield = def.passiveSkill.startingShieldPct
        ? Math.round(maxHp * def.passiveSkill.startingShieldPct)
        : 0;

      this.units.push({
        unitId: `enemy_${slotIdx}_${enemySpec.heroId}_${idx}`,
        heroId: enemySpec.heroId,
        name: def.name,
        title: def.title,
        team: 'enemy',
        slotIndex: slotIdx,
        isFrontline: slotIdx < 2,
        isBoss: Boolean(enemySpec.isBoss),
        role: def.role,
        faction: def.faction,
        damageType: def.damageType,
        isMelee: def.isMelee,
        attackRange: def.attackRange,
        level: enemySpec.level,
        stars: enemySpec.stars,
        maxHp,
        hp: maxHp,
        attack,
        defense: Math.round(computed.defense * 0.9),
        speed: computed.speed,
        critChance: computed.critChance,
        critDamage: computed.critDamage,
        shield: startingShield,
        energy: 15,
        x: pos.x,
        y: pos.y,
        homeX: pos.x,
        homeY: pos.y,
        animState: 'idle',
        animTimer: 0,
        attackCooldown: 0.65 + idx * 0.15,
        activeSkillCooldown: 3.5 + idx * 0.4,
        statusEffects: [],
        totalDamageDealt: 0,
        totalHealingDone: 0,
        totalDamageTaken: 0,
        isAlive: true,
      });
    });
  }

  private pushEvent(
    partial: Omit<CombatEvent, 'id' | 'timestampSec'>
  ): CombatEvent {
    const ev: CombatEvent = {
      ...partial,
      id: this.nextEventId++,
      timestampSec: Number(this.elapsedSec.toFixed(2)),
    };
    this.events.push(ev);
    this.unreadEvents.push(ev);
    return ev;
  }

  public drainRecentEvents(): CombatEvent[] {
    if (this.unreadEvents.length === 0) return [];
    const batch = this.unreadEvents;
    this.unreadEvents = [];
    return batch;
  }

  public consumeEvents(): CombatEvent[] {
    return this.drainRecentEvents();
  }

  public selectTargets(
    actor: CombatUnitState,
    priority: TargetPriority,
    targetAllies: boolean = false
  ): CombatUnitState[] {
    const pool = this.units.filter((u) =>
      targetAllies
        ? u.team === actor.team && u.isAlive
        : u.team !== actor.team && u.isAlive
    );

    if (pool.length === 0) return [];

    if (priority === 'aoe') {
      return pool;
    }

    if (priority === 'frontline') {
      const frontliners = pool.filter((u) => u.isFrontline);
      const candidates = frontliners.length > 0 ? frontliners : pool;
      return [this.findNearest(actor, candidates)];
    }

    if (priority === 'lowest_hp') {
      const sorted = [...pool].sort(
        (a, b) => a.hp / a.maxHp - b.hp / b.maxHp
      );
      return [sorted[0]];
    }

    if (priority === 'highest_atk') {
      const sorted = [...pool].sort((a, b) => b.attack - a.attack);
      return [sorted[0]];
    }

    if (priority === 'random') {
      return [this.rng.pick(pool)];
    }

    return [this.findNearest(actor, pool)];
  }

  private findNearest(
    actor: CombatUnitState,
    candidates: CombatUnitState[]
  ): CombatUnitState {
    let best = candidates[0];
    let bestDist = Infinity;
    for (const c of candidates) {
      const dx = c.x - actor.x;
      const dy = c.y - actor.y;
      const dist = Math.hypot(dx, dy);
      if (dist < bestDist) {
        bestDist = dist;
        best = c;
      }
    }
    return best;
  }

  private getEffectiveStat(
    unit: CombatUnitState,
    stat: 'attack' | 'defense' | 'speed'
  ): number {
    let val = unit[stat];
    for (const st of unit.statusEffects) {
      if (stat === 'attack' && st.type === 'atk_up') val *= 1 + st.magnitude;
      if (stat === 'defense' && st.type === 'def_up') val *= 1 + st.magnitude;
      if (stat === 'speed' && st.type === 'spd_up') val *= 1 + st.magnitude;
      if (stat === 'speed' && st.type === 'slow')
        val *= Math.max(0.35, 1 - st.magnitude);
    }
    return Math.max(10, Math.round(val));
  }

  private hasStatus(
    unit: CombatUnitState,
    type: ActiveStatusEffect['type']
  ): boolean {
    return unit.statusEffects.some((s) => s.type === type && s.remainingSec > 0);
  }

  public triggerManualUltimate(
    unitId: string,
    _ignoreAutoFlag: boolean = true
  ): boolean {
    if (this.isFinished) return false;
    const unit = this.units.find((u) => u.unitId === unitId);
    if (!unit || !unit.isAlive || unit.energy < 100) return false;
    if (this.hasStatus(unit, 'stun') || this.hasStatus(unit, 'silence')) {
      return false;
    }

    const def = getHeroDefinition(unit.heroId);
    this.executeSkill(unit, def.ultimateSkill, true);
    return true;
  }

  public stepTick(dt: number = FIXED_TIMESTEP_SEC): void {
    if (this.isFinished) return;

    this.elapsedSec += dt;

    const aliveAllies = this.units.filter((u) => u.team === 'ally' && u.isAlive);
    const aliveEnemies = this.units.filter(
      (u) => u.team === 'enemy' && u.isAlive
    );

    if (aliveAllies.length === 0 || aliveEnemies.length === 0) {
      this.finishBattle(aliveAllies.length > 0 ? 'victory' : 'defeat');
      return;
    }

    if (this.elapsedSec >= MAX_BATTLE_DURATION_SEC) {
      const allyHpRatio =
        aliveAllies.reduce((acc, u) => acc + u.hp / u.maxHp, 0) /
        Math.max(1, aliveAllies.length);
      const enemyHpRatio =
        aliveEnemies.reduce((acc, u) => acc + u.hp / u.maxHp, 0) /
        Math.max(1, aliveEnemies.length);
      this.finishBattle(allyHpRatio >= enemyHpRatio ? 'victory' : 'defeat');
      return;
    }

    for (const unit of this.units) {
      if (!unit.isAlive) continue;

      const def = getHeroDefinition(unit.heroId);

      if (def.passiveSkill.energyPerSec) {
        unit.energy = Math.min(
          100,
          unit.energy + def.passiveSkill.energyPerSec * dt
        );
      }

      this.tickUnitStatusEffects(unit, dt);
      if (!unit.isAlive) continue;

      if (unit.animTimer > 0) {
        unit.animTimer = Math.max(0, unit.animTimer - dt);
        if (unit.animTimer === 0 && unit.isAlive) {
          unit.animState = 'idle';
        }
      }

      if (this.hasStatus(unit, 'stun')) {
        continue;
      }

      const speedFactor = this.getEffectiveStat(unit, 'speed') / 100;
      unit.attackCooldown = Math.max(0, unit.attackCooldown - dt * speedFactor);
      unit.activeSkillCooldown = Math.max(0, unit.activeSkillCooldown - dt);

      const isSilenced = this.hasStatus(unit, 'silence');
      const canAutoUlt = unit.team === 'enemy' || this.autoSkill;
      if (!isSilenced && canAutoUlt && unit.energy >= 100) {
        this.executeSkill(unit, def.ultimateSkill, true);
        continue;
      }

      if (!isSilenced && unit.activeSkillCooldown <= 0) {
        this.executeSkill(unit, def.activeSkill, false);
        unit.activeSkillCooldown = def.activeSkill.cooldownSec;
        continue;
      }

      const primaryTargets = this.selectTargets(
        unit,
        def.basicAttack.targetPriority,
        false
      );
      const target = primaryTargets[0];
      if (!target) continue;

      const dx = target.x - unit.x;
      const dy = target.y - unit.y;
      const dist = Math.hypot(dx, dy);

      if (dist > unit.attackRange) {
        const moveSpeed = (unit.isMelee ? 145 : 95) * speedFactor;
        const step = Math.min(dist - unit.attackRange + 4, moveSpeed * dt);
        unit.x += (dx / dist) * step;
        unit.y += (dy / dist) * step;
        if (unit.animTimer <= 0) {
          unit.animState = 'move';
        }
      } else if (unit.attackCooldown <= 0) {
        this.executeBasicAttack(unit, target);
        unit.attackCooldown = Math.max(0.45, 1.35 / speedFactor);
      } else if (unit.animTimer <= 0) {
        unit.animState = 'idle';
      }
    }

    const postAllies = this.units.filter((u) => u.team === 'ally' && u.isAlive);
    const postEnemies = this.units.filter(
      (u) => u.team === 'enemy' && u.isAlive
    );
    if (postAllies.length === 0 || postEnemies.length === 0) {
      this.finishBattle(postAllies.length > 0 ? 'victory' : 'defeat');
    }
  }

  private tickUnitStatusEffects(unit: CombatUnitState, dt: number): void {
    const remaining: ActiveStatusEffect[] = [];

    for (const st of unit.statusEffects) {
      const nextRemaining = st.remainingSec - dt;

      if (st.type === 'burn') {
        const burnDmg = Math.max(1, Math.round(unit.maxHp * st.magnitude * dt));
        this.applyDirectDamage(unit, burnDmg, 'magical', false, st.sourceUnitId);
      } else if (st.type === 'regen' && unit.isAlive) {
        const healAmt = Math.max(1, Math.round(unit.maxHp * st.magnitude * dt));
        unit.hp = Math.min(unit.maxHp, unit.hp + healAmt);
        unit.totalHealingDone += healAmt;
      }

      if (nextRemaining > 0 && unit.isAlive) {
        remaining.push({ ...st, remainingSec: nextRemaining });
      }
    }

    unit.statusEffects = remaining;
  }

  private executeBasicAttack(
    actor: CombatUnitState,
    target: CombatUnitState
  ): void {
    const def = getHeroDefinition(actor.heroId);
    actor.animState = 'attack';
    actor.animTimer = 0.32;
    actor.energy = Math.min(100, actor.energy + 18);

    this.pushEvent({
      type: 'basic_attack',
      actorUnitId: actor.unitId,
      targetUnitId: target.unitId,
      skillName: def.basicAttack.name,
    });

    this.dealComputedDamage(
      actor,
      target,
      def.basicAttack.multiplier,
      actor.damageType
    );
  }

  private executeSkill(
    actor: CombatUnitState,
    skill: HeroSkillSpec,
    isUltimate: boolean
  ): void {
    actor.animState = isUltimate ? 'ultimate' : 'skill';
    actor.animTimer = isUltimate ? 0.65 : 0.45;

    if (isUltimate) {
      actor.energy = 0;
    } else {
      actor.energy = Math.min(100, actor.energy + 24);
    }

    this.pushEvent({
      type: isUltimate ? 'ultimate_skill' : 'active_skill',
      actorUnitId: actor.unitId,
      skillName: skill.name,
      vfxColor: skill.vfxColor,
      vfxShape: skill.vfxShape,
    });

    if (skill.damageMultiplier > 0) {
      const enemies = skill.isAoe
        ? this.selectTargets(actor, 'aoe', false)
        : this.selectTargets(actor, skill.targetPriority, false);

      for (const target of enemies) {
        this.dealComputedDamage(
          actor,
          target,
          skill.damageMultiplier,
          actor.damageType
        );
        if (
          skill.statusEffect &&
          !skill.statusEffect.targetSelfOrAlly &&
          target.isAlive
        ) {
          this.inflictStatus(actor, target, skill.statusEffect);
        }
      }
    }

    if (skill.healMultiplier && skill.healMultiplier > 0) {
      const allies =
        skill.isAoe || skill.targetPriority === 'aoe'
          ? this.selectTargets(actor, 'aoe', true)
          : this.selectTargets(actor, 'lowest_hp', true);

      const baseAtk = this.getEffectiveStat(actor, 'attack');
      for (const ally of allies) {
        const healValue = Math.round(baseAtk * skill.healMultiplier);
        ally.hp = Math.min(ally.maxHp, ally.hp + healValue);
        actor.totalHealingDone += healValue;
        this.pushEvent({
          type: 'heal',
          actorUnitId: actor.unitId,
          targetUnitId: ally.unitId,
          value: healValue,
          skillName: skill.name,
        });
      }
    }

    if (skill.shieldMultiplier && skill.shieldMultiplier > 0) {
      const allies = this.selectTargets(actor, 'aoe', true);
      for (const ally of allies) {
        const addShield = Math.round(ally.maxHp * skill.shieldMultiplier);
        ally.shield += addShield;
        this.pushEvent({
          type: 'shield',
          actorUnitId: actor.unitId,
          targetUnitId: ally.unitId,
          value: addShield,
          skillName: skill.name,
        });
      }
    }

    if (skill.energyRestore && skill.energyRestore > 0) {
      const allies = this.selectTargets(actor, 'aoe', true);
      for (const ally of allies) {
        if (ally.unitId === actor.unitId && isUltimate) continue;
        ally.energy = Math.min(100, ally.energy + skill.energyRestore);
      }
    }

    if (skill.statusEffect && skill.statusEffect.targetSelfOrAlly) {
      const allies = this.selectTargets(actor, 'aoe', true);
      for (const ally of allies) {
        this.inflictStatus(actor, ally, skill.statusEffect);
      }
    }
  }

  private inflictStatus(
    actor: CombatUnitState,
    target: CombatUnitState,
    spec: NonNullable<HeroSkillSpec['statusEffect']>
  ): void {
    target.statusEffects = target.statusEffects.filter(
      (s) => s.type !== spec.type
    );
    target.statusEffects.push({
      id: `${spec.type}_${this.nextEventId}`,
      type: spec.type,
      remainingSec: spec.durationSec,
      magnitude: spec.magnitude,
      sourceUnitId: actor.unitId,
    });

    this.pushEvent({
      type: 'status_applied',
      actorUnitId: actor.unitId,
      targetUnitId: target.unitId,
      statusType: spec.type,
    });
  }

  private dealComputedDamage(
    actor: CombatUnitState,
    target: CombatUnitState,
    multiplier: number,
    damageType: 'physical' | 'magical'
  ): void {
    if (!target.isAlive) return;

    const atk = this.getEffectiveStat(actor, 'attack');
    const def = this.getEffectiveStat(target, 'defense');

    const defenseWeight = damageType === 'physical' ? 1.0 : 0.78;
    const mitigation = 1000 / (1000 + def * defenseWeight * 2.2);
    const isCrit = this.rng.chance(actor.critChance);
    const critMult = isCrit ? actor.critDamage / 100 : 1.0;

    const rawDamage = Math.max(
      12,
      Math.round(atk * multiplier * mitigation * critMult)
    );

    this.applyDirectDamage(target, rawDamage, damageType, isCrit, actor.unitId);

    const actorDef = getHeroDefinition(actor.heroId);
    if (actorDef.passiveSkill.lifestealPct && actor.isAlive) {
      const leech = Math.round(rawDamage * actorDef.passiveSkill.lifestealPct);
      if (leech > 0) {
        actor.hp = Math.min(actor.maxHp, actor.hp + leech);
        actor.totalHealingDone += leech;
      }
    }
  }

  private applyDirectDamage(
    target: CombatUnitState,
    amount: number,
    damageType: 'physical' | 'magical',
    isCrit: boolean,
    sourceUnitId: string
  ): void {
    if (!target.isAlive) return;

    const source = this.units.find((u) => u.unitId === sourceUnitId);
    let remainingDmg = amount;

    if (target.shield > 0) {
      const absorbed = Math.min(target.shield, remainingDmg);
      target.shield -= absorbed;
      remainingDmg -= absorbed;
    }

    target.hp = Math.max(0, target.hp - remainingDmg);
    target.totalDamageTaken += amount;
    target.energy = Math.min(100, target.energy + 8);

    if (source) {
      source.totalDamageDealt += amount;
    }

    if (target.hp > 0 && target.animState !== 'ultimate') {
      target.animState = 'hit';
      target.animTimer = 0.2;
    }

    this.pushEvent({
      type: 'damage',
      actorUnitId: sourceUnitId,
      targetUnitId: target.unitId,
      value: amount,
      isCrit,
      damageType,
    });

    if (target.hp <= 0) {
      target.hp = 0;
      target.isAlive = false;
      target.shield = 0;
      target.energy = 0;
      target.animState = 'defeat';
      target.animTimer = 999;

      this.pushEvent({
        type: 'unit_defeated',
        actorUnitId: sourceUnitId,
        targetUnitId: target.unitId,
      });
    }
  }

  private finishBattle(outcome: 'victory' | 'defeat'): void {
    if (this.isFinished) return;
    this.isFinished = true;
    this.outcome = outcome;

    this.pushEvent({
      type: 'battle_end',
      actorUnitId: outcome,
    });
  }

  public getResultSummary(): CombatResultSummary {
    const outcome = this.outcome ?? 'defeat';
    return {
      stageId: this.stage.id,
      outcome,
      durationSec: Number(this.elapsedSec.toFixed(1)),
      seed: this.seed,
      allySurvivors: this.units.filter((u) => u.team === 'ally' && u.isAlive)
        .length,
      enemySurvivors: this.units.filter((u) => u.team === 'enemy' && u.isAlive)
        .length,
      unitStats: this.units.map((u) => ({
        unitId: u.unitId,
        heroId: u.heroId,
        name: u.name,
        team: u.team,
        damageDealt: u.totalDamageDealt,
        healingDone: u.totalHealingDone,
        damageTaken: u.totalDamageTaken,
        survived: u.isAlive,
      })),
    };
  }
}

export function simulateFullBattle(
  config: CombatEngineConfig
): CombatResultSummary {
  const engine = new CombatEngine(config);
  const maxSteps = Math.ceil(MAX_BATTLE_DURATION_SEC / FIXED_TIMESTEP_SEC) + 10;
  let step = 0;
  while (!engine.isFinished && step < maxSteps) {
    engine.stepTick(FIXED_TIMESTEP_SEC);
    step++;
  }
  return engine.getResultSummary();
}
