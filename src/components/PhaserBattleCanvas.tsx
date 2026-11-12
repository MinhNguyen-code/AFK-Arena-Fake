import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import {
  BattleSnapshot,
  BattleUnitRuntime,
  CombatEvent,
  OwnedHeroState,
  TeamFormationSlots,
} from '../game/types';
import { BattleSimulation } from '../game/battleEngine';
import { getHeroById, HERO_ROSTER } from '../game/heroes';
import { getCampaignStage } from '../game/campaign';
import { soundEngine } from '../game/audio';

export interface PhaserBattleCanvasProps {
  stageId: number;
  battleInstanceKey: number;
  formation: TeamFormationSlots;
  ownedHeroes: Record<string, OwnedHeroState>;
  battleSpeed: 1 | 2;
  autoUltimate: boolean;
  isPaused: boolean;
  manualUltimateRequest: { heroId: string; force: boolean; seq: number } | null;
  onSnapshotUpdate: (snapshot: BattleSnapshot) => void;
  onBattleFinished: (snapshot: BattleSnapshot) => void;
}

interface UnitVisualNode {
  root: Phaser.GameObjects.Container;
  shadow: Phaser.GameObjects.Ellipse;
  ring: Phaser.GameObjects.Ellipse;
  body: Phaser.GameObjects.Container;
  spriteGraphics: Phaser.GameObjects.Graphics;
  shieldDome: Phaser.GameObjects.Ellipse;
  stoneOverlay: Phaser.GameObjects.Ellipse;
  hpBarFill: Phaser.GameObjects.Rectangle;
  shieldBarFill: Phaser.GameObjects.Rectangle;
  energyBarFill: Phaser.GameObjects.Rectangle;
  statusText: Phaser.GameObjects.Text;
  nameText: Phaser.GameObjects.Text;
  walkPhase: number;
}

const THEME_PALETTES = {
  sanctuary: {
    skyTop: 0x0b1120,
    skyBottom: 0x1e293b,
    floorMain: 0x172033,
    floorGrid: 0x334155,
    pillar: 0x1e293b,
    rune: 0xf59e0b,
  },
  catacombs: {
    skyTop: 0x180910,
    skyBottom: 0x2d121e,
    floorMain: 0x1f121b,
    floorGrid: 0x4c1d2e,
    pillar: 0x291522,
    rune: 0xef4444,
  },
  sylvan: {
    skyTop: 0x071a15,
    skyBottom: 0x113028,
    floorMain: 0x0f241f,
    floorGrid: 0x1e463b,
    pillar: 0x132a23,
    rune: 0x10b981,
  },
  tempest: {
    skyTop: 0x081426,
    skyBottom: 0x162b4d,
    floorMain: 0x111f38,
    floorGrid: 0x233d69,
    pillar: 0x172847,
    rune: 0x38bdf8,
  },
  obsidian: {
    skyTop: 0x0f071e,
    skyBottom: 0x22103d,
    floorMain: 0x160d29,
    floorGrid: 0x3b1d66,
    pillar: 0x1e1136,
    rune: 0xa855f7,
  },
};

function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16) || 0xf59e0b;
}

export const PhaserBattleCanvas: React.FC<PhaserBattleCanvasProps> = ({
  stageId,
  battleInstanceKey,
  formation,
  ownedHeroes,
  battleSpeed,
  autoUltimate,
  isPaused,
  manualUltimateRequest,
  onSnapshotUpdate,
  onBattleFinished,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const simRef = useRef<BattleSimulation | null>(null);
  const speedRef = useRef<1 | 2>(battleSpeed);
  const autoUltRef = useRef<boolean>(autoUltimate);
  const pausedRef = useRef<boolean>(isPaused);
  const finishedReportedRef = useRef<boolean>(false);
  const onSnapshotRef = useRef(onSnapshotUpdate);
  const onFinishedRef = useRef(onBattleFinished);

  speedRef.current = battleSpeed;
  autoUltRef.current = autoUltimate;
  pausedRef.current = isPaused;
  onSnapshotRef.current = onSnapshotUpdate;
  onFinishedRef.current = onBattleFinished;

  if (simRef.current) {
    simRef.current.autoUltimate = autoUltimate;
  }

  // Handle manual ultimate activation from React HUD
  useEffect(() => {
    if (!manualUltimateRequest || !simRef.current) return;
    const sim = simRef.current;
    if (manualUltimateRequest.heroId === '__ALL__') {
      // Trigger all living allies' ultimates
      for (const u of sim.getUnits()) {
        if (u.team === 'ally' && u.isAlive) {
          sim.triggerUltimate(u.instanceId, manualUltimateRequest.force);
        }
      }
      soundEngine.playUltimateCast();
      onSnapshotRef.current(sim.getSnapshot());
    } else {
      const ok = sim.triggerUltimate(
        manualUltimateRequest.heroId,
        manualUltimateRequest.force
      );
      if (ok) {
        soundEngine.playUltimateCast();
        onSnapshotRef.current(sim.getSnapshot());
      }
    }
  }, [manualUltimateRequest]);

  // Mount & Re-initialize Phaser Scene when stageId or battleInstanceKey changes
  useEffect(() => {
    const mountEl = containerRef.current;
    if (!mountEl) return;

    const stage = getCampaignStage(stageId);
    const palette = THEME_PALETTES[stage.theme] || THEME_PALETTES.sanctuary;

    const sim = new BattleSimulation({
      allyFormation: formation,
      ownedHeroes,
      enemies: stage.enemies,
      seed: stageId * 1000 + battleInstanceKey * 37,
      autoUltimate: autoUltRef.current,
    });
    simRef.current = sim;
    finishedReportedRef.current = false;
    onSnapshotRef.current(sim.getSnapshot());

    const unitVisuals = new Map<string, UnitVisualNode>();
    let vfxLayer: Phaser.GameObjects.Container | null = null;
    let bannerContainer: Phaser.GameObjects.Container | null = null;
    let bannerText: Phaser.GameObjects.Text | null = null;
    let bannerTimerMs = 0;
    let simAccumulatorMs = 0;
    let hudSyncAccumulatorMs = 0;

    const drawCharacterGraphic = (
      g: Phaser.GameObjects.Graphics,
      unit: BattleUnitRuntime
    ) => {
      const def = getHeroById(unit.heroId);
      const primary = hexToNumber(def.visual.primaryColor);
      const secondary = hexToNumber(def.visual.secondaryColor);
      const accent = hexToNumber(def.visual.accentColor);
      const dir = unit.facing;
      const scale = unit.isBoss ? 1.24 : 1.0;

      g.clear();
      g.save();
      g.scaleCanvas(dir * scale, scale);

      // 1. Flowing Cape / Wings behind torso
      g.fillStyle(secondary, 0.95);
      g.lineStyle(2, primary, 0.9);
      if (def.visual.capeStyle === 'wings') {
        g.beginPath();
        g.moveTo(-6, -42);
        g.lineTo(-34, -62);
        g.lineTo(-26, -24);
        g.lineTo(-8, -14);
        g.closePath();
        g.fillPath();
        g.strokePath();
      } else {
        g.beginPath();
        g.moveTo(-8, -46);
        g.lineTo(-26, -8);
        g.lineTo(-6, -6);
        g.closePath();
        g.fillPath();
        g.strokePath();
      }

      // 2. Legs / Boots
      g.fillStyle(0x0f172a, 1);
      g.fillRoundedRect(-11, -16, 8, 16, 3);
      g.fillRoundedRect(3, -16, 8, 16, 3);

      // 3. Armored Torso & Tunic
      g.fillStyle(primary, 1);
      g.lineStyle(2, accent, 0.9);
      g.fillRoundedRect(-14, -44, 28, 30, 6);
      g.strokeRoundedRect(-14, -44, 28, 30, 6);

      // Chest Core Emblem
      g.fillStyle(accent, 0.95);
      g.fillCircle(0, -31, 4.5);

      // 4. Shoulder Pauldrons
      g.fillStyle(secondary, 1);
      g.lineStyle(1.8, accent, 0.9);
      g.fillCircle(-15, -40, 7);
      g.strokeCircle(-15, -40, 7);
      g.fillCircle(15, -40, 7);
      g.strokeCircle(15, -40, 7);

      // 5. Head & Glowing Eyes
      g.fillStyle(0x1e293b, 1);
      g.lineStyle(2, accent, 0.95);
      g.fillCircle(0, -56, 11);
      g.strokeCircle(0, -56, 11);

      // Eyes facing right (+X in local space)
      g.fillStyle(accent, 1);
      g.fillCircle(4, -56, 2.2);
      g.fillCircle(9, -56, 2.0);

      // 6. Distinct Helm / Crown / Horns / Halo
      if (def.visual.helmStyle === 'crown') {
        g.fillStyle(accent, 1);
        g.beginPath();
        g.moveTo(-10, -64);
        g.lineTo(-6, -75);
        g.lineTo(0, -67);
        g.lineTo(5, -76);
        g.lineTo(10, -64);
        g.closePath();
        g.fillPath();
      } else if (def.visual.helmStyle === 'horned') {
        g.fillStyle(accent, 1);
        g.beginPath();
        g.moveTo(-8, -63);
        g.lineTo(-18, -77);
        g.lineTo(-2, -66);
        g.closePath();
        g.fillPath();
        g.beginPath();
        g.moveTo(8, -63);
        g.lineTo(18, -77);
        g.lineTo(2, -66);
        g.closePath();
        g.fillPath();
      } else if (def.visual.helmStyle === 'halo') {
        g.lineStyle(2.5, accent, 0.95);
        g.strokeEllipse(0, -73, 22, 6);
      } else if (def.visual.helmStyle === 'crest') {
        g.fillStyle(primary, 1);
        g.lineStyle(1.5, accent, 1);
        g.fillTriangle(-6, -65, 6, -65, 0, -79);
        g.strokeTriangle(-6, -65, 6, -65, 0, -79);
      } else if (def.visual.helmStyle === 'hood') {
        g.fillStyle(primary, 0.95);
        g.beginPath();
        g.moveTo(-13, -52);
        g.lineTo(-4, -73);
        g.lineTo(12, -62);
        g.closePath();
        g.fillPath();
      }

      // 7. Signature Weapon in Forward Hand
      g.lineStyle(2.5, accent, 1);
      g.fillStyle(accent, 0.95);
      const w = def.visual.weaponStyle;
      if (w === 'greatsword' || w === 'twinblades' || w === 'daggers') {
        g.fillStyle(accent, 1);
        g.beginPath();
        g.moveTo(14, -28);
        g.lineTo(38, -56);
        g.lineTo(32, -60);
        g.lineTo(11, -33);
        g.closePath();
        g.fillPath();
        // Crossguard
        g.lineStyle(3, primary, 1);
        g.lineBetween(10, -36, 20, -25);
      } else if (w === 'warhammer' || w === 'frost_halberd' || w === 'void_glaive') {
        g.lineStyle(3, 0xcbd5e1, 1);
        g.lineBetween(14, -12, 26, -62);
        g.fillStyle(primary, 1);
        g.lineStyle(2, accent, 1);
        g.fillRoundedRect(17, -68, 18, 12, 3);
        g.strokeRoundedRect(17, -68, 18, 12, 3);
      } else if (w === 'longbow') {
        g.lineStyle(2.8, accent, 1);
        g.beginPath();
        g.arc(16, -34, 20, -1.1, 1.1, false);
        g.strokePath();
      } else {
        // Staff / Scepter / Orb / Tome / Harp
        g.lineStyle(2.8, accent, 1);
        g.lineBetween(16, -12, 22, -58);
        g.fillStyle(primary, 1);
        g.fillCircle(22, -62, 7);
        g.strokeCircle(22, -62, 7);
      }

      g.restore();
    };

    class BattleArenaScene extends Phaser.Scene {
      constructor() {
        super('BattleArenaScene');
      }

      preload() {
        this.load.crossOrigin = 'anonymous';
        const activeHeroIds = new Set(sim.getSnapshot().units.map((u) => u.heroId));
        for (const hId of activeHeroIds) {
          const def = getHeroById(hId);
          this.load.image(
            `battle_${def.id}`,
            def.battleUrl || `/assets/heroes/${def.id}_battle.webp`
          );
          this.load.image(
            `framed_${def.id}`,
            def.framedUrl || `/assets/heroes/${def.id}_framed.webp`
          );
        }
      }

      create() {
        // 1. Layered 2.5D Dark-Fantasy Background
        const bg = this.add.graphics();

        // Sky gradient
        bg.fillGradientStyle(
          palette.skyTop,
          palette.skyTop,
          palette.skyBottom,
          palette.skyBottom,
          1
        );
        bg.fillRect(0, 0, 1000, 210);

        // Distant Castle & Ancient Temple Silhouettes
        bg.fillStyle(palette.pillar, 0.85);
        for (let i = 0; i < 7; i++) {
          const px = 70 + i * 140;
          bg.fillRect(px - 22, 45, 44, 155);
          bg.fillTriangle(px - 28, 45, px + 28, 45, px, 14);
          // Glowing gothic temple window
          bg.fillStyle(palette.rune, 0.25);
          bg.fillRoundedRect(px - 7, 72, 14, 36, 6);
          bg.fillStyle(palette.pillar, 0.85);
        }

        // 2.5D Perspective Arena Floor (Trapezoid + Grid)
        bg.fillStyle(palette.floorMain, 1);
        bg.fillRect(0, 140, 1000, 400);

        bg.lineStyle(2, palette.rune, 0.45);
        bg.strokeRect(36, 138, 928, 344);

        // Perspective Grid Lines
        bg.lineStyle(1, palette.floorGrid, 0.65);
        for (let row = 0; row <= 6; row++) {
          const y = 140 + row * 57;
          bg.lineBetween(36, y, 964, y);
        }
        for (let col = 0; col <= 10; col++) {
          const topX = 90 + col * 82;
          const botX = 36 + col * 92.8;
          bg.lineBetween(topX, 140, botX, 482);
        }

        // Central Sanctuary Rune Circle
        bg.lineStyle(2, palette.rune, 0.35);
        bg.strokeEllipse(500, 300, 240, 125);
        bg.strokeEllipse(500, 300, 180, 92);

        // Tactical Slot Markers (Frontline 1-2 & Backline 3-5)
        const snap = sim.getSnapshot();
        for (const u of snap.units) {
          const slotColor = u.team === 'ally' ? 0x38bdf8 : 0xf43f5e;
          bg.lineStyle(1.5, slotColor, 0.32);
          bg.strokeEllipse(u.homeX, u.homeY, 68, 26);
        }

        // 2. Create Visual Nodes for all Units
        for (const u of snap.units) {
          const root = this.add.container(u.x, u.y);
          root.setDepth(Math.round(u.y));

          const shadow = this.add.ellipse(0, 2, 54, 18, 0x000000, 0.55);
          const ringColor = u.team === 'ally' ? 0x38bdf8 : 0xf43f5e;
          const ring = this.add.ellipse(0, 0, 62, 22);
          ring.setStrokeStyle(2, ringColor, 0.85);

          const body = this.add.container(0, 0);
          const spriteGraphics = this.add.graphics();
          const def = getHeroById(u.heroId);
          const primaryNum = hexToNumber(def.visual.primaryColor);
          const accentNum = hexToNumber(def.visual.accentColor);

          if (this.textures.exists(`battle_${u.heroId}`)) {
            // Ornate faction aura backplate behind the official hero battle sprite
            const aura = this.add.ellipse(0, -40, u.isBoss ? 66 : 56, u.isBoss ? 78 : 66, primaryNum, 0.25);
            aura.setStrokeStyle(2, accentNum, 0.85);
            const battleImg = this.add.image(0, -40, `battle_${u.heroId}`);
            const targetH = u.isBoss ? 92 : 76;
            const scaleFactor = targetH / (battleImg.height || 200);
            battleImg.setScale(scaleFactor);
            battleImg.setFlipX(u.team === 'enemy');
            body.add([aura, battleImg]);
          } else {
            drawCharacterGraphic(spriteGraphics, u);
            body.add(spriteGraphics);
          }

          const shieldDome = this.add.ellipse(0, -38, 72, 82, 0x38bdf8, 0.18);
          shieldDome.setStrokeStyle(2, 0x7dd3fc, 0.75);
          shieldDome.setVisible(u.shield > 0);

          const stoneOverlay = this.add.ellipse(0, -38, 56, 76, 0x94a3b8, 0.65);
          stoneOverlay.setVisible(false);

          // Overhead Bars & Nameplate
          const barBgHp = this.add.rectangle(0, -94, 64, 7, 0x090d16, 0.95);
          barBgHp.setStrokeStyle(1, 0x334155, 0.9);
          const hpColor = u.team === 'ally' ? 0x10b981 : 0xef4444;
          const hpBarFill = this.add
            .rectangle(-31, -94, 62, 5, hpColor, 1)
            .setOrigin(0, 0.5);
          const shieldBarFill = this.add
            .rectangle(-31, -94, 0, 5, 0x38bdf8, 0.9)
            .setOrigin(0, 0.5);

          const barBgEn = this.add.rectangle(0, -85, 64, 5, 0x090d16, 0.95);
          const energyBarFill = this.add
            .rectangle(-31, -85, Math.min(62, (u.energy / 100) * 62), 3.5, 0xf59e0b, 1)
            .setOrigin(0, 0.5);

          const nameText = this.add
            .text(
              0,
              -109,
              `${u.isBoss ? '★ ' : ''}${u.name.split(' ')[0]} Lv.${u.level}`,
              {
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '11px',
                fontStyle: 'bold',
                color: u.team === 'ally' ? '#e2e8f0' : '#fecdd3',
                stroke: '#020617',
                strokeThickness: 3,
              }
            )
            .setOrigin(0.5, 0.5);

          const statusText = this.add
            .text(0, -123, '', {
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '10px',
              fontStyle: 'bold',
              color: '#fef08a',
              backgroundColor: 'rgba(15,23,42,0.85)',
              padding: { x: 4, y: 1 },
            })
            .setOrigin(0.5, 0.5)
            .setVisible(false);

          root.add([
            shadow,
            ring,
            body,
            shieldDome,
            stoneOverlay,
            barBgHp,
            hpBarFill,
            shieldBarFill,
            barBgEn,
            energyBarFill,
            nameText,
            statusText,
          ]);

          unitVisuals.set(u.instanceId, {
            root,
            shadow,
            ring,
            body,
            spriteGraphics,
            shieldDome,
            stoneOverlay,
            hpBarFill,
            shieldBarFill,
            energyBarFill,
            statusText,
            nameText,
            walkPhase: u.position * 1.1,
          });
        }

        // 3. VFX Layer & Ultimate Callout Banner
        vfxLayer = this.add.container(0, 0);
        vfxLayer.setDepth(2000);

        bannerContainer = this.add.container(500, 68);
        bannerContainer.setDepth(3000);
        bannerContainer.setVisible(false);
        const bannerBg = this.add.rectangle(0, 0, 440, 40, 0x090d16, 0.92);
        bannerBg.setStrokeStyle(2, 0xf59e0b, 1);
        bannerText = this.add
          .text(0, 0, '', {
            fontFamily: '"Cinzel", serif',
            fontSize: '15px',
            fontStyle: 'bold',
            color: '#fef08a',
          })
          .setOrigin(0.5, 0.5);
        bannerContainer.add([bannerBg, bannerText]);
      }

      update(_time: number, deltaMs: number) {
        if (!simRef.current || pausedRef.current) return;
        const sim = simRef.current;

        // 1. Step deterministic simulation if still running
        if (sim.getStatus() === 'running') {
          simAccumulatorMs += Math.min(deltaMs, 100) * speedRef.current;
          while (simAccumulatorMs >= 50 && sim.getStatus() === 'running') {
            sim.step(50);
            simAccumulatorMs -= 50;
          }
        }

        // 2. Consume combat events and spawn Phaser VFX
        const newEvents = sim.consumeEvents();
        if (newEvents.length > 0 && vfxLayer) {
          this.renderCombatEvents(newEvents, sim.getUnits());
        }

        // 3. Update Unit Visual Nodes
        const liveUnits = sim.getUnits();
        for (const u of liveUnits) {
          const node = unitVisuals.get(u.instanceId);
          if (!node) continue;

          if (!u.isAlive) {
            node.root.setAlpha(Math.max(0.18, node.root.alpha - deltaMs * 0.003));
            node.body.setRotation(u.team === 'ally' ? -1.4 : 1.4);
            node.hpBarFill.width = 0;
            node.shieldBarFill.width = 0;
            node.energyBarFill.width = 0;
            node.shieldDome.setVisible(false);
            node.stoneOverlay.setVisible(false);
            node.statusText.setVisible(false);
            continue;
          }

          // Smooth position interpolation
          node.root.x = Phaser.Math.Linear(node.root.x, u.x, 0.35);
          node.root.y = Phaser.Math.Linear(node.root.y, u.y, 0.35);
          node.root.setDepth(Math.round(node.root.y));

          // Walk bob or action lunge
          node.walkPhase += (deltaMs / 1000) * 8 * speedRef.current;
          if (u.lastActionType === 'move') {
            node.body.y = Math.abs(Math.sin(node.walkPhase)) * -6;
            node.body.x = 0;
          } else if (
            u.actionAnimTimerMs > 0 &&
            (u.lastActionType === 'basic' ||
              u.lastActionType === 'skill' ||
              u.lastActionType === 'ultimate')
          ) {
            const lunge = Math.sin((u.actionAnimTimerMs / 500) * Math.PI) * 14;
            node.body.x = u.facing * lunge;
            node.body.y = u.lastActionType === 'ultimate' ? -10 : 0;
          } else if (u.actionAnimTimerMs > 0 && u.lastActionType === 'hit') {
            node.body.x = -u.facing * 6;
            node.body.y = 0;
          } else {
            node.body.x = 0;
            node.body.y = Math.sin(node.walkPhase * 0.4) * -2;
          }

          // Update HP, Shield, and Energy Bars
          const hpRatio = Math.max(0, Math.min(1, u.hp / u.maxHp));
          node.hpBarFill.width = 62 * hpRatio;

          const shieldRatio = Math.max(0, Math.min(1, u.shield / u.maxHp));
          node.shieldBarFill.width = 62 * shieldRatio;
          node.shieldDome.setVisible(u.shield > 0);

          const energyRatio = Math.max(0, Math.min(1, u.energy / 100));
          node.energyBarFill.width = 62 * energyRatio;
          node.energyBarFill.fillColor = u.energy >= 100 ? 0xfde047 : 0xf59e0b;

          // Crowd Control & Buff Badges
          const isPetrified = u.statusEffects.some((s) => s.type === 'petrify');
          node.stoneOverlay.setVisible(isPetrified);

          if (u.statusEffects.length > 0) {
            const labels = u.statusEffects
              .slice(0, 2)
              .map((s) => s.type.toUpperCase());
            node.statusText.setText(labels.join(' · '));
            node.statusText.setVisible(true);
          } else {
            node.statusText.setVisible(false);
          }
        }

        // 4. Update Ultimate Banner Timer
        if (bannerTimerMs > 0 && bannerContainer) {
          bannerTimerMs -= deltaMs;
          if (bannerTimerMs <= 0) {
            bannerContainer.setVisible(false);
          }
        }

        // 5. Periodic React HUD Snapshot Sync (every 120ms)
        hudSyncAccumulatorMs += deltaMs;
        if (hudSyncAccumulatorMs >= 120) {
          hudSyncAccumulatorMs = 0;
          onSnapshotRef.current(sim.getSnapshot());
        }

        // 6. Check Battle Completion
        if (sim.getStatus() !== 'running' && !finishedReportedRef.current) {
          finishedReportedRef.current = true;
          const finalSnap = sim.getSnapshot();
          onSnapshotRef.current(finalSnap);
          onFinishedRef.current(finalSnap);
        }
      }

      renderCombatEvents(events: CombatEvent[], units: BattleUnitRuntime[]) {
        if (!vfxLayer) return;
        const unitMap = new Map(units.map((u) => [u.instanceId, u]));

        for (const ev of events) {
          const source = unitMap.get(ev.sourceId);
          const target = ev.targetId ? unitMap.get(ev.targetId) : undefined;
          const colorNum = ev.vfxColor ? hexToNumber(ev.vfxColor) : 0xf59e0b;

          if (ev.type === 'ultimate_cast' && source) {
            if (bannerContainer && bannerText) {
              bannerText.setText(`★ ${source.name.toUpperCase()} — ${ev.skillName} ★`);
              bannerContainer.setVisible(true);
              bannerTimerMs = 1800;
            }
            // Expanding golden shockwave ring around caster
            const ring = this.add.ellipse(source.x, source.y - 20, 30, 14);
            ring.setStrokeStyle(3, colorNum, 0.95);
            vfxLayer.add(ring);
            this.tweens.add({
              targets: ring,
              scaleX: 5.5,
              scaleY: 5.5,
              alpha: 0,
              duration: 550,
              onComplete: () => ring.destroy(),
            });
          }

          if (
            (ev.type === 'basic_attack' || ev.type === 'active_skill') &&
            source &&
            target
          ) {
            soundEngine.playHit(ev.type === 'active_skill');
            // Projectile / Beam Line from source to target
            const line = this.add.graphics();
            line.lineStyle(ev.type === 'active_skill' ? 4 : 2, colorNum, 0.9);
            line.lineBetween(source.x, source.y - 36, target.x, target.y - 36);
            vfxLayer.add(line);
            this.tweens.add({
              targets: line,
              alpha: 0,
              duration: 240,
              onComplete: () => line.destroy(),
            });
          }

          if (ev.type === 'damage' && target && ev.value) {
            // Impact burst circle
            const impact = this.add.circle(
              target.x,
              target.y - 38,
              ev.isCrit ? 22 : 13,
              colorNum,
              0.65
            );
            vfxLayer.add(impact);
            this.tweens.add({
              targets: impact,
              scale: 1.8,
              alpha: 0,
              duration: 260,
              onComplete: () => impact.destroy(),
            });

            // Floating Damage Number
            const txt = this.add
              .text(
                target.x + (Math.random() - 0.5) * 24,
                target.y - 72,
                `${ev.isCrit ? 'CRIT! -' : '-'}${ev.value}`,
                {
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: ev.isCrit ? '15px' : '12px',
                  fontStyle: 'bold',
                  color: ev.isCrit ? '#fde047' : '#ffffff',
                  stroke: '#020617',
                  strokeThickness: 3,
                }
              )
              .setOrigin(0.5, 0.5);
            vfxLayer.add(txt);
            this.tweens.add({
              targets: txt,
              y: txt.y - 34,
              alpha: 0,
              duration: 680,
              onComplete: () => txt.destroy(),
            });
          }

          if (ev.type === 'heal' && target && ev.value) {
            const txt = this.add
              .text(target.x, target.y - 76, `+${ev.value} HP`, {
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '12px',
                fontStyle: 'bold',
                color: '#34d399',
                stroke: '#020617',
                strokeThickness: 3,
              })
              .setOrigin(0.5, 0.5);
            vfxLayer.add(txt);
            this.tweens.add({
              targets: txt,
              y: txt.y - 28,
              alpha: 0,
              duration: 650,
              onComplete: () => txt.destroy(),
            });
          }

          if (ev.type === 'crowd_control' && target && ev.ccType) {
            const ccTxt = this.add
              .text(target.x, target.y - 92, ev.ccType.toUpperCase(), {
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '12px',
                fontStyle: 'bold',
                color: '#f472b6',
                stroke: '#020617',
                strokeThickness: 3,
              })
              .setOrigin(0.5, 0.5);
            vfxLayer.add(ccTxt);
            this.tweens.add({
              targets: ccTxt,
              y: ccTxt.y - 26,
              alpha: 0,
              duration: 750,
              onComplete: () => ccTxt.destroy(),
            });
          }
        }
      }
    }

    const game = new Phaser.Game({
      type: Phaser.CANVAS,
      parent: mountEl,
      width: 1000,
      height: 540,
      backgroundColor: '#070a12',
      fps: {
        target: 30,
        forceSetTimeOut: true,
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [BattleArenaScene],
      banner: false,
      audio: {
        noAudio: true,
      },
    });

    return () => {
      game.destroy(true);
    };
  }, [stageId, battleInstanceKey, formation]);

  return (
    <div
      data-testid="phaser-battle-container"
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-[#070a12] overflow-hidden select-none"
    />
  );
};
