import {
  BattleUnitRuntime,
  BattleSnapshot,
  CombatEvent,
  HeroSkillSpec,
  OwnedHeroState,
  TeamFormationSlots,
  CampaignEnemySlot,
  CrowdControlType,
  BuffType,
} from './types';
import {
  getHeroById,
  computeHeroStats,
  computeFactionAura,
  getHeroRepoFaction,
  getFactionDamageMultiplier,
} from './heroes';

/**
 * Deterministic Mulberry32 Seeded PRNG (returns 0..1)
 */
export function createSeededRng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Virtual 2.5D Battlefield Coordinates (1000 x 540 arena)
 * Frontline: Position 1 (Top Front), Position 2 (Bottom Front)
 * Backline: Position 3 (Top Back), Position 4 (Mid Back), Position 5 (Bottom Back)
 */
export const ALLY_SLOT_COORDS: Record<1 | 2 | 3 | 4 | 5, { x: number; y: number }> = {
  1: { x: 295, y: 215 }, // Frontline 1
  2: { x: 295, y: 365 }, // Frontline 2
  3: { x: 155, y: 165 }, // Backline 3
  4: { x: 135, y: 290 }, // Backline 4
  5: { x: 155, y: 415 }, // Backline 5
};

export const ENEMY_SLOT_COORDS: Record<1 | 2 | 3 | 4 | 5, { x: number; y: number }> = {
  1: { x: 705, y: 215 }, // Frontline 1
  2: { x: 705, y: 365 }, // Frontline 2
  3: { x: 845, y: 165 }, // Backline 3
  4: { x: 865, y: 290 }, // Backline 4
  5: { x: 845, y: 415 }, // Backline 5
};

export interface BattleSimulationConfig {
  allyFormation: TeamFormationSlots;
  ownedHeroes: Record<string, OwnedHeroState>;
  enemies: CampaignEnemySlot[];
  seed?: number;
  autoUltimate?: boolean;
  maxDurationMs?: number;
}

export class BattleSimulation {
  private units: BattleUnitRuntime[] = [];
  private events: CombatEvent[] = [];
  private nextEventId = 1;
  private elapsedMs = 0;
  private maxDurationMs: number;
  private status: 'running' | 'victory' | 'defeat' = 'running';
  private rng: () => number;
  public autoUltimate: boolean;

  constructor(config: BattleSimulationConfig) {
    this.rng = createSeededRng(config.seed ?? 1337);
    this.autoUltimate = config.autoUltimate ?? true;
    this.maxDurationMs = config.maxDurationMs ?? 90000;
    this.initUnits(config);
  }

  private initUnits(config: BattleSimulationConfig): void {
    const allyAura = computeFactionAura(config.allyFormation);
    const enemyAura = computeFactionAura(config.enemies.map((e) => e.heroId));

    // 1. Spawn Allies from 5-slot formation
    config.allyFormation.forEach((heroId, idx) => {
      if (!heroId) return;
      const pos = (idx + 1) as 1 | 2 | 3 | 4 | 5;
      const def = getHeroById(heroId);
      const owned = config.ownedHeroes[heroId] ?? {
        heroId,
        level: 1,
        stars: 1,
        copies: 0,
        equipment: { weapon: 1, armor: 1, relic: 1 },
      };
      const stats = computeHeroStats(def, owned);
      const coord = ALLY_SLOT_COORDS[pos];
      const maxHp = Math.round(stats.hp * (1 + allyAura.hpBonusPct));
      const baseAttack = Math.round(stats.attack * (1 + allyAura.atkBonusPct));
      const baseDefense = Math.round(stats.defense * (1 + allyAura.defBonusPct));
      const critChance = Math.min(0.85, stats.critChance + allyAura.critBonusPct);
      const openingShield = Math.round(maxHp * def.skills.passive.openingShieldPct);

      this.units.push({
        instanceId: `ally_${pos}_${heroId}`,
        heroId: def.id,
        name: def.name,
        title: def.title,
        team: 'ally',
        position: pos,
        heroClass: def.heroClass,
        faction: def.faction,
        level: owned.level,
        stars: owned.stars,
        isBoss: false,
        isRanged: def.isRanged,
        attackRangePx: def.attackRangePx,
        moveSpeedPxPerSec: def.moveSpeedPxPerSec,
        x: coord.x,
        y: coord.y,
        homeX: coord.x,
        homeY: coord.y,
        facing: 1,
        maxHp,
        hp: maxHp,
        shield: openingShield,
        energy: stats.startingEnergy,
        baseAttack,
        baseDefense,
        baseAttackSpeed: stats.attackSpeed,
        critChance,
        lifestealPct: def.skills.passive.bonusLifestealPct,
        basicAttackCooldownMs: 400 + pos * 90,
        activeSkillCooldownMs: Math.round(def.skills.active.cooldownMs * 0.45),
        activeSkillMaxCooldownMs: def.skills.active.cooldownMs,
        actionAnimTimerMs: 0,
        lastActionType: 'idle',
        targetInstanceId: null,
        statusEffects: [],
        isAlive: true,
        totalDamageDealt: 0,
        totalHealingDone: 0,
        totalDamageTaken: 0,
      });
    });

    // 2. Spawn Enemies
    config.enemies.forEach((slot) => {
      const def = getHeroById(slot.heroId);
      const bossMult = slot.isBoss ? 1.25 : 1.0;
      const stats = computeHeroStats(def, {
        heroId: def.id,
        level: slot.level,
        stars: slot.stars,
        copies: 0,
        equipment: {
          weapon: Math.max(1, Math.floor(slot.level / 3)),
          armor: Math.max(1, Math.floor(slot.level / 3)),
          relic: Math.max(1, Math.floor(slot.level / 4)),
        },
      });
      const coord = ENEMY_SLOT_COORDS[slot.position];
      const maxHp = Math.round(stats.hp * bossMult * (1 + enemyAura.hpBonusPct));
      const openingShield = Math.round(maxHp * def.skills.passive.openingShieldPct);

      this.units.push({
        instanceId: `enemy_${slot.position}_${def.id}`,
        heroId: def.id,
        name: def.name,
        title: def.title,
        team: 'enemy',
        position: slot.position,
        heroClass: def.heroClass,
        faction: def.faction,
        level: slot.level,
        stars: slot.stars,
        isBoss: Boolean(slot.isBoss),
        isRanged: def.isRanged,
        attackRangePx: def.attackRangePx,
        moveSpeedPxPerSec: def.moveSpeedPxPerSec,
        x: coord.x,
        y: coord.y,
        homeX: coord.x,
        homeY: coord.y,
        facing: -1,
        maxHp,
        hp: maxHp,
        shield: openingShield,
        energy: stats.startingEnergy,
        baseAttack: Math.round(
          stats.attack * (slot.isBoss ? 1.15 : 1.0) * (1 + enemyAura.atkBonusPct)
        ),
        baseDefense: Math.round(stats.defense * (1 + enemyAura.defBonusPct)),
        baseAttackSpeed: stats.attackSpeed,
        critChance: Math.min(0.85, stats.critChance + enemyAura.critBonusPct),
        lifestealPct: def.skills.passive.bonusLifestealPct,
        basicAttackCooldownMs: 600 + slot.position * 110,
        activeSkillCooldownMs: Math.round(def.skills.active.cooldownMs * 0.55),
        activeSkillMaxCooldownMs: def.skills.active.cooldownMs,
        actionAnimTimerMs: 0,
        lastActionType: 'idle',
        targetInstanceId: null,
        statusEffects: [],
        isAlive: true,
        totalDamageDealt: 0,
        totalHealingDone: 0,
        totalDamageTaken: 0,
      });
    });
  }

  public getSnapshot(): BattleSnapshot {
    return {
      status: this.status,
      elapsedMs: this.elapsedMs,
      maxDurationMs: this.maxDurationMs,
      units: this.units.map((u) => ({
        ...u,
        statusEffects: u.statusEffects.map((s) => ({ ...s })),
      })),
      recentEvents: [...this.events],
    };
  }

  public consumeEvents(): CombatEvent[] {
    const out = [...this.events];
    this.events = [];
    return out;
  }

  public getUnits(): BattleUnitRuntime[] {
    return this.units;
  }

  public getStatus(): 'running' | 'victory' | 'defeat' {
    return this.status;
  }

  public getElapsedMs(): number {
    return this.elapsedMs;
  }

  private pushEvent( event: Omit<CombatEvent, 'id' | 'timestampMs'> ): void {
    this.events.push({
      ...event,
      id: this.nextEventId++,
      timestampMs: this.elapsedMs,
    });
  }

  public isIncapacitated(unit: BattleUnitRuntime): boolean {
    return unit.statusEffects.some(
      (s) => s.type === 'stun' || s.type === 'petrify'
    );
  }

  public isSilenced(unit: BattleUnitRuntime): boolean {
    return unit.statusEffects.some((s) => s.type === 'silence');
  }

  private getEffectiveAttack(unit: BattleUnitRuntime): number {
    let mult = 1;
    for (const s of unit.statusEffects) {
      if (s.type === 'atk_up') mult += s.magnitude;
    }
    return Math.round(unit.baseAttack * mult);
  }

  private getEffectiveDefense(unit: BattleUnitRuntime): number {
    let mult = 1;
    for (const s of unit.statusEffects) {
      if (s.type === 'def_up') mult += s.magnitude;
    }
    return Math.max(10, Math.round(unit.baseDefense * mult));
  }

  private getEffectiveSpeedMultiplier(unit: BattleUnitRuntime): number {
    let mult = 1;
    for (const s of unit.statusEffects) {
      if (s.type === 'spd_up') mult += s.magnitude;
      if (s.type === 'slow') mult *= 0.6;
    }
    return Math.max(0.35, mult);
  }

  /**
   * Manually or automatically trigger a hero's Ultimate ability.
   * When force = true, casts even if energy < 100 (for manual test/showcase or instant combo).
   */
  public triggerUltimate(unitOrHeroId: string, force: boolean = false): boolean {
    if (this.status !== 'running') return false;
    const unit = this.units.find(
      (u) =>
        u.isAlive &&
        (u.instanceId === unitOrHeroId ||
          (u.team === 'ally' && u.heroId === unitOrHeroId))
    );
    if (!unit) return false;
    if (!force && unit.energy < 100) return false;
    if (this.isIncapacitated(unit) || this.isSilenced(unit)) return false;

    const def = getHeroById(unit.heroId);
    unit.energy = 0;
    unit.actionAnimTimerMs = 650;
    unit.lastActionType = 'ultimate';

    this.pushEvent({
      type: 'ultimate_cast',
      sourceId: unit.instanceId,
      sourceName: unit.name,
      skillName: def.skills.ultimate.name,
      vfxColor: def.skills.ultimate.vfxColor,
      vfxShape: def.skills.ultimate.vfxShape,
    });

    this.executeSkillSpec(unit, def.skills.ultimate, true);
    this.checkOutcome();
    return true;
  }

  /**
   * Fixed-timestep simulation step (e.g. dtMs = 50ms)
   */
  public step(dtMs: number): void {
    if (this.status !== 'running') return;

    const clampedDt = Math.min(dtMs, 100);
    this.elapsedMs += clampedDt;

    // 1. Check battle timeout
    if (this.elapsedMs >= this.maxDurationMs) {
      this.status = 'defeat';
      return;
    }

    // 2. Update each living unit
    for (const unit of this.units) {
      if (!unit.isAlive) continue;

      // Tick status effects
      unit.statusEffects = unit.statusEffects
        .map((eff) => ({ ...eff, remainingMs: eff.remainingMs - clampedDt }))
        .filter((eff) => eff.remainingMs > 0);

      if (unit.actionAnimTimerMs > 0) {
        unit.actionAnimTimerMs = Math.max(0, unit.actionAnimTimerMs - clampedDt);
      }

      // Passive continuous energy trickle
      unit.energy = Math.min(100, unit.energy + (clampedDt / 1000) * 4.5);

      // If Stunned or Petrified, unit cannot move, attack, or cast skills
      if (this.isIncapacitated(unit)) {
        continue;
      }

      const speedMult = this.getEffectiveSpeedMultiplier(unit);
      unit.basicAttackCooldownMs = Math.max(
        0,
        unit.basicAttackCooldownMs - clampedDt * speedMult
      );
      unit.activeSkillCooldownMs = Math.max(
        0,
        unit.activeSkillCooldownMs - clampedDt * speedMult
      );

      // Auto-Ultimate check (allies if autoUltimate=true, enemies always when energy >= 100)
      if (
        unit.energy >= 100 &&
        !this.isSilenced(unit) &&
        (unit.team === 'enemy' || this.autoUltimate)
      ) {
        this.triggerUltimate(unit.instanceId, false);
        if (this.status !== 'running') return;
        continue;
      }

      // Select target
      const def = getHeroById(unit.heroId);
      const preferredTarget = this.selectTarget(unit, def.skills.basic.targetType);
      if (!preferredTarget) {
        continue;
      }
      unit.targetInstanceId = preferredTarget.instanceId;
      unit.facing = preferredTarget.x >= unit.x ? 1 : -1;

      const dx = preferredTarget.x - unit.x;
      const dy = preferredTarget.y - unit.y;
      const dist = Math.hypot(dx, dy);

      // Move toward target if outside attackRangePx
      if (dist > unit.attackRangePx) {
        const moveStep =
          unit.moveSpeedPxPerSec * speedMult * (clampedDt / 1000);
        const ratio = Math.min(1, moveStep / dist);
        unit.x = Math.max(70, Math.min(930, unit.x + dx * ratio));
        unit.y = Math.max(120, Math.min(460, unit.y + dy * ratio));
        if (unit.actionAnimTimerMs <= 0) {
          unit.lastActionType = 'move';
        }
        continue;
      }

      // In range: Check Active Skill first (if not silenced)
      if (unit.activeSkillCooldownMs <= 0 && !this.isSilenced(unit)) {
        unit.activeSkillCooldownMs = unit.activeSkillMaxCooldownMs;
        unit.basicAttackCooldownMs = Math.round(900 / unit.baseAttackSpeed);
        unit.actionAnimTimerMs = 480;
        unit.lastActionType = 'skill';
        unit.energy = Math.min(100, unit.energy + 22);

        // Shadow Sovereign teleports behind backline target on Active Skill
        if (unit.heroId === 'shadow_sovereign') {
          const backTarget =
            this.selectTarget(unit, 'backline_enemy') || preferredTarget;
          unit.x = Math.max(
            90,
            Math.min(910, backTarget.x + (unit.team === 'ally' ? -55 : 55))
          );
          unit.y = backTarget.y;
        }

        this.pushEvent({
          type: 'active_skill',
          sourceId: unit.instanceId,
          sourceName: unit.name,
          targetId: preferredTarget.instanceId,
          targetName: preferredTarget.name,
          skillName: def.skills.active.name,
          vfxColor: def.skills.active.vfxColor,
          vfxShape: def.skills.active.vfxShape,
        });

        this.executeSkillSpec(unit, def.skills.active, false);
        this.checkOutcome();
        if (this.status !== 'running') return;
        continue;
      }

      // Otherwise execute Basic Attack when ready
      if (unit.basicAttackCooldownMs <= 0) {
        unit.basicAttackCooldownMs = Math.round(1000 / unit.baseAttackSpeed);
        unit.actionAnimTimerMs = 340;
        unit.lastActionType = 'basic';
        unit.energy = Math.min(100, unit.energy + 16);

        this.pushEvent({
          type: 'basic_attack',
          sourceId: unit.instanceId,
          sourceName: unit.name,
          targetId: preferredTarget.instanceId,
          targetName: preferredTarget.name,
          skillName: def.skills.basic.name,
          vfxColor: def.skills.basic.vfxColor,
          vfxShape: def.skills.basic.vfxShape,
        });

        this.executeSkillSpec(unit, def.skills.basic, false);
        this.checkOutcome();
        if (this.status !== 'running') return;
      }
    }

    this.checkOutcome();
  }

  private selectTarget(
    caster: BattleUnitRuntime,
    targetType: HeroSkillSpec['targetType']
  ): BattleUnitRuntime | null {
    const opponents = this.units.filter(
      (u) => u.isAlive && u.team !== caster.team
    );
    const allies = this.units.filter(
      (u) => u.isAlive && u.team === caster.team
    );

    if (targetType === 'self') return caster;
    if (targetType === 'lowest_hp_ally') {
      if (allies.length === 0) return null;
      return [...allies].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    }

    if (opponents.length === 0) return null;

    if (targetType === 'backline_enemy') {
      const backline = opponents.filter((o) => o.position >= 3);
      const pool = backline.length > 0 ? backline : opponents;
      return [...pool].sort((a, b) => a.hp - b.hp)[0];
    }

    // Default Frontline priority (Positions 1 & 2 first, then nearest)
    const frontline = opponents.filter((o) => o.position <= 2);
    const pool = frontline.length > 0 ? frontline : opponents;

    return [...pool].sort((a, b) => {
      const distA = Math.hypot(a.x - caster.x, a.y - caster.y);
      const distB = Math.hypot(b.x - caster.x, b.y - caster.y);
      return distA - distB;
    })[0];
  }

  private resolveTargetsForSkill(
    caster: BattleUnitRuntime,
    skill: HeroSkillSpec
  ): BattleUnitRuntime[] {
    const opponents = this.units.filter(
      (u) => u.isAlive && u.team !== caster.team
    );
    const allies = this.units.filter(
      (u) => u.isAlive && u.team === caster.team
    );

    switch (skill.targetType) {
      case 'self':
        return [caster];
      case 'all_allies':
        return allies;
      case 'lowest_hp_ally': {
        const lowest = this.selectTarget(caster, 'lowest_hp_ally');
        return lowest ? [lowest] : [];
      }
      case 'all_enemies':
        return opponents;
      case 'frontline_enemies': {
        const front = opponents.filter((o) => o.position <= 2);
        return front.length > 0 ? front : opponents;
      }
      case 'backline_enemy': {
        const back = this.selectTarget(caster, 'backline_enemy');
        return back ? [back] : [];
      }
      case 'current_target':
      default: {
        const cur = this.selectTarget(caster, 'current_target');
        return cur ? [cur] : [];
      }
    }
  }

  private executeSkillSpec(
    caster: BattleUnitRuntime,
    skill: HeroSkillSpec,
    isUltimate: boolean
  ): void {
    const effectiveAtk = this.getEffectiveAttack(caster);
    const targets = this.resolveTargetsForSkill(caster, skill);

    // 1. Handle Allied Support Effects (Heal, Shield, Energy, Buffs) on all_allies / lowest_hp_ally
    if (
      skill.targetType === 'all_allies' ||
      skill.targetType === 'lowest_hp_ally' ||
      skill.targetType === 'self'
    ) {
      for (const ally of targets) {
        if (!ally.isAlive) continue;

        if (skill.healMultiplier && skill.healMultiplier > 0) {
          const healAmount = Math.round(effectiveAtk * skill.healMultiplier);
          this.applyHeal(caster, ally, healAmount, skill.name);
        }

        if (skill.shieldMultiplier && skill.shieldMultiplier > 0) {
          const shieldAmount = Math.round(effectiveAtk * skill.shieldMultiplier);
          this.applyShield(caster, ally, shieldAmount, skill.name);
        }

        if (skill.energyGrant && skill.energyGrant > 0) {
          ally.energy = Math.min(100, ally.energy + skill.energyGrant);
        }

        if (skill.buffType && skill.buffDurationMs && skill.buffMagnitude) {
          this.applyBuff(
            caster,
            ally,
            skill.buffType,
            skill.buffDurationMs,
            skill.buffMagnitude
          );
        }
      }

      // If this support skill ALSO deals damage (e.g. Celestial Guardian ultimate), damage frontline enemies
      if (skill.damageMultiplier > 0) {
        const enemyTargets = this.units.filter(
          (u) => u.isAlive && u.team !== caster.team
        );
        for (const enemy of enemyTargets) {
          this.applyDamageAndEffectsToEnemy(
            caster,
            enemy,
            effectiveAtk,
            skill,
            isUltimate
          );
        }
      }
      return;
    }

    // 2. Self-shield or self-buff on offensive skills (e.g., Iron Bastion ultimate, Crimson Revenant active)
    if (skill.shieldMultiplier && skill.shieldMultiplier > 0) {
      const shieldAmt = Math.round(effectiveAtk * skill.shieldMultiplier);
      this.applyShield(caster, caster, shieldAmt, skill.name);
    }
    if (skill.buffType && skill.buffDurationMs && skill.buffMagnitude) {
      this.applyBuff(
        caster,
        caster,
        skill.buffType,
        skill.buffDurationMs,
        skill.buffMagnitude
      );
    }

    // 3. Offensive Execution on Enemy Targets
    for (const target of targets) {
      if (!target.isAlive) continue;
      this.applyDamageAndEffectsToEnemy(
        caster,
        target,
        effectiveAtk,
        skill,
        isUltimate
      );
    }
  }

  private applyDamageAndEffectsToEnemy(
    caster: BattleUnitRuntime,
    target: BattleUnitRuntime,
    effectiveAtk: number,
    skill: HeroSkillSpec,
    isUltimate: boolean
  ): void {
    const targetDef = this.getEffectiveDefense(target);
    const mitigation = 100 / (100 + targetDef);
    const isCrit = this.rng() < caster.critChance;
    const critMult = isCrit ? 1.75 : 1.0;

    // Authentic AFK Arena +25% Faction Advantage Counter Multiplier
    const casterRepoFac = getHeroRepoFaction(getHeroById(caster.heroId));
    const targetRepoFac = getHeroRepoFaction(getHeroById(target.heroId));
    const factionCounterMult = getFactionDamageMultiplier(casterRepoFac, targetRepoFac);

    // Petrified targets take +15% bonus damage
    const isPetrified = target.statusEffects.some((s) => s.type === 'petrify');
    const petrifyMult = isPetrified ? 1.15 : 1.0;

    // Small deterministic variance (0.95..1.05)
    const variance = 0.95 + this.rng() * 0.1;

    const rawDamage =
      effectiveAtk *
      skill.damageMultiplier *
      mitigation *
      critMult *
      factionCounterMult *
      petrifyMult *
      variance;
    const finalDamage = Math.max(12, Math.round(rawDamage));

    // Absorb with Shield first
    let remainingDmg = finalDamage;
    if (target.shield > 0) {
      const absorbed = Math.min(target.shield, remainingDmg);
      target.shield -= absorbed;
      remainingDmg -= absorbed;
    }

    target.hp = Math.max(0, target.hp - remainingDmg);
    target.totalDamageTaken += finalDamage;
    caster.totalDamageDealt += finalDamage;

    // Target gains energy from taking damage
    if (target.hp > 0) {
      target.energy = Math.min(100, target.energy + 8);
      if (target.actionAnimTimerMs <= 0) {
        target.lastActionType = 'hit';
        target.actionAnimTimerMs = 200;
      }
    }

    this.pushEvent({
      type: 'damage',
      sourceId: caster.instanceId,
      sourceName: caster.name,
      targetId: target.instanceId,
      targetName: target.name,
      skillName: skill.name,
      value: finalDamage,
      isCrit,
      vfxColor: skill.vfxColor,
      vfxShape: skill.vfxShape,
    });

    // Lifesteal (Passive + Skill Lifesteal)
    const totalLifesteal =
      caster.lifestealPct + (skill.lifestealPct ?? 0);
    if (totalLifesteal > 0 && caster.isAlive) {
      const healVal = Math.max(1, Math.round(finalDamage * totalLifesteal));
      this.applyHeal(caster, caster, healVal, 'Lifesteal');
    }

    // Apply Crowd Control if target survived
    if (target.hp > 0 && skill.ccType && skill.ccDurationMs) {
      this.applyCrowdControl(
        caster,
        target,
        skill.ccType,
        skill.ccDurationMs
      );
    }

    // Death Check
    if (target.hp <= 0 && target.isAlive) {
      target.hp = 0;
      target.shield = 0;
      target.isAlive = false;
      target.statusEffects = [];
      target.lastActionType = 'dead';
      caster.energy = Math.min(100, caster.energy + (isUltimate ? 20 : 35));

      this.pushEvent({
        type: 'death',
        sourceId: caster.instanceId,
        sourceName: caster.name,
        targetId: target.instanceId,
        targetName: target.name,
      });
    }
  }

  private applyHeal(
    source: BattleUnitRuntime,
    target: BattleUnitRuntime,
    amount: number,
    skillName: string
  ): void {
    if (!target.isAlive || amount <= 0) return;
    const before = target.hp;
    target.hp = Math.min(target.maxHp, target.hp + amount);
    const actualHeal = target.hp - before;
    source.totalHealingDone += actualHeal > 0 ? actualHeal : amount;

    this.pushEvent({
      type: 'heal',
      sourceId: source.instanceId,
      sourceName: source.name,
      targetId: target.instanceId,
      targetName: target.name,
      skillName,
      value: amount,
    });
  }

  private applyShield(
    source: BattleUnitRuntime,
    target: BattleUnitRuntime,
    amount: number,
    skillName: string
  ): void {
    if (!target.isAlive || amount <= 0) return;
    target.shield += amount;
    this.pushEvent({
      type: 'shield',
      sourceId: source.instanceId,
      sourceName: source.name,
      targetId: target.instanceId,
      targetName: target.name,
      skillName,
      value: amount,
    });
  }

  private applyBuff(
    source: BattleUnitRuntime,
    target: BattleUnitRuntime,
    buffType: BuffType,
    durationMs: number,
    magnitude: number
  ): void {
    if (!target.isAlive) return;
    target.statusEffects = target.statusEffects.filter(
      (s) => s.type !== buffType
    );
    target.statusEffects.push({
      id: `${buffType}_${this.nextEventId}`,
      type: buffType,
      durationMs,
      remainingMs: durationMs,
      magnitude,
      sourceUnitId: source.instanceId,
    });

    this.pushEvent({
      type: 'buff',
      sourceId: source.instanceId,
      sourceName: source.name,
      targetId: target.instanceId,
      targetName: target.name,
      buffType,
      value: Math.round(magnitude * 100),
    });
  }

  public applyCrowdControl(
    source: BattleUnitRuntime,
    target: BattleUnitRuntime,
    ccType: CrowdControlType,
    durationMs: number
  ): void {
    if (!target.isAlive) return;

    if (ccType === 'knockback') {
      const pushDir = target.team === 'enemy' ? 1 : -1;
      target.x = Math.max(80, Math.min(920, target.x + pushDir * 58));
      target.basicAttackCooldownMs += 350;
      this.pushEvent({
        type: 'knockback',
        sourceId: source.instanceId,
        sourceName: source.name,
        targetId: target.instanceId,
        targetName: target.name,
        ccType: 'knockback',
      });
    }

    target.statusEffects = target.statusEffects.filter(
      (s) => s.type !== ccType
    );
    target.statusEffects.push({
      id: `${ccType}_${this.nextEventId}`,
      type: ccType,
      durationMs,
      remainingMs: durationMs,
      magnitude: 1,
      sourceUnitId: source.instanceId,
    });

    this.pushEvent({
      type: 'crowd_control',
      sourceId: source.instanceId,
      sourceName: source.name,
      targetId: target.instanceId,
      targetName: target.name,
      ccType,
      value: durationMs,
    });
  }

  private checkOutcome(): void {
    if (this.status !== 'running') return;
    const alliesAlive = this.units.some(
      (u) => u.team === 'ally' && u.isAlive
    );
    const enemiesAlive = this.units.some(
      (u) => u.team === 'enemy' && u.isAlive
    );

    if (!enemiesAlive) {
      this.status = 'victory';
    } else if (!alliesAlive) {
      this.status = 'defeat';
    }
  }
}
