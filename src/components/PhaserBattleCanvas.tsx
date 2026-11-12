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
import { getHeroById } from '../game/heroes';
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

const PORTRAIT_WIDTH = 448;
const PORTRAIT_HEIGHT = 430;

// Well-separated Portrait 5v5 Formation Coordinates
// Allies: Lower-left / Foreground advancing Up-Right
const ALLY_PORTRAIT_SLOTS: Array<{ x: number; y: number }> = [
  { x: 176, y: 266 }, // Slot 0: Frontline 1
  { x: 112, y: 296 }, // Slot 1: Frontline 2
  { x: 208, y: 348 }, // Slot 2: Backline 3
  { x: 134, y: 382 }, // Slot 3: Backline 4
  { x: 58, y: 354 },  // Slot 4: Backline 5
];

// Enemies: Upper-right / Background advancing Down-Left
const ENEMY_PORTRAIT_SLOTS: Array<{ x: number; y: number }> = [
  { x: 272, y: 198 }, // Slot 0: Frontline 1
  { x: 336, y: 168 }, // Slot 1: Frontline 2
  { x: 240, y: 118 }, // Slot 2: Backline 3
  { x: 314, y: 88 },  // Slot 3: Backline 4
  { x: 390, y: 114 }, // Slot 4: Backline 5
];

function projectUnitToPortrait(u: BattleUnitRuntime): {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
} {
  const slots = u.team === 'ally' ? ALLY_PORTRAIT_SLOTS : ENEMY_PORTRAIT_SLOTS;
  const idx = Math.max(0, Math.min(4, u.position));
  const home = slots[idx] || slots[0];

  // Map simulation movement delta (u.x - u.homeX) onto the diagonal portrait clash axis
  const simDx = u.x - u.homeX;
  const simDy = u.y - u.homeY;

  const px = Phaser.Math.Clamp(home.x + simDx * 0.22, 42, PORTRAIT_WIDTH - 42);
  const py = Phaser.Math.Clamp(
    home.y - simDx * 0.14 + simDy * 0.1,
    72,
    PORTRAIT_HEIGHT - 32
  );

  return {
    x: px,
    y: py,
    homeX: home.x,
    homeY: home.y,
  };
}

const STATUS_SHORT_LABELS: Record<string, string> = {
  stun: '⚡STUN',
  freeze: '❄️FREEZE',
  petrify: '🪨PETR',
  silence: '🔇SIL',
  slow: '🐌SLOW',
  atk_up: '⚔️ATK+',
  spd_up: '⚡SPD+',
  shield: '🛡️SHLD',
};

const THEME_PALETTES = {
  sanctuary: {
    skyTop: 0x0b1320,
    skyBottom: 0x1a283b,
    floorMain: 0x182232,
    floorPath: 0x243247,
    floorGrid: 0x334155,
    pillar: 0x1e293b,
    rune: 0xf59e0b,
  },
  catacombs: {
    skyTop: 0x180910,
    skyBottom: 0x2d121e,
    floorMain: 0x1f121b,
    floorPath: 0x331826,
    floorGrid: 0x4c1d2e,
    pillar: 0x291522,
    rune: 0xef4444,
  },
  sylvan: {
    skyTop: 0x071a15,
    skyBottom: 0x113028,
    floorMain: 0x0f241f,
    floorPath: 0x16382f,
    floorGrid: 0x1e463b,
    pillar: 0x132a23,
    rune: 0x10b981,
  },
  tempest: {
    skyTop: 0x081426,
    skyBottom: 0x162b4d,
    floorMain: 0x111f38,
    floorPath: 0x192e52,
    floorGrid: 0x233d69,
    pillar: 0x172847,
    rune: 0x38bdf8,
  },
  obsidian: {
    skyTop: 0x0f071e,
    skyBottom: 0x22103d,
    floorMain: 0x160d29,
    floorPath: 0x241542,
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
    const activeFloaterCounts = new Map<string, number>();
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
      const scale = unit.isBoss ? 0.92 : 0.78;

      g.clear();
      g.save();
      g.scaleCanvas(dir * scale, scale);

      // 1. Cape / Wings
      g.fillStyle(secondary, 0.95);
      g.lineStyle(2, primary, 0.9);
      if (def.visual.capeStyle === 'wings') {
        g.beginPath();
        g.moveTo(-6, -42);
        g.lineTo(-32, -60);
        g.lineTo(-24, -24);
        g.lineTo(-8, -14);
        g.closePath();
        g.fillPath();
        g.strokePath();
      } else {
        g.beginPath();
        g.moveTo(-8, -46);
        g.lineTo(-24, -8);
        g.lineTo(-6, -6);
        g.closePath();
        g.fillPath();
        g.strokePath();
      }

      // 2. Legs
      g.fillStyle(0x0f172a, 1);
      g.fillRoundedRect(-10, -16, 7, 16, 3);
      g.fillRoundedRect(3, -16, 7, 16, 3);

      // 3. Armored Torso
      g.fillStyle(primary, 1);
      g.lineStyle(2, accent, 0.9);
      g.fillRoundedRect(-13, -44, 26, 30, 6);
      g.strokeRoundedRect(-13, -44, 26, 30, 6);

      // 4. Head
      g.fillStyle(0x1e293b, 1);
      g.lineStyle(2, accent, 0.95);
      g.fillCircle(0, -55, 10);
      g.strokeCircle(0, -55, 10);

      // 5. Weapon
      g.lineStyle(2.5, accent, 1);
      g.lineBetween(12, -14, 22, -54);

      g.restore();
    };

    class BattleArenaScene extends Phaser.Scene {
      constructor() {
        super('BattleArenaScene');
      }

      preload() {
        this.load.crossOrigin = 'anonymous';
        const activeHeroIds = new Set(
          sim.getSnapshot().units.map((u) => u.heroId)
        );
        for (const hId of activeHeroIds) {
          const def = getHeroById(hId);
          this.load.image(
            `battle_${def.id}`,
            def.battleUrl || `/assets/heroes/${def.id}_battle.webp`
          );
        }
      }

      create() {
        // 1. Classic AFK Arena Vertical Portrait Battlefield Environment (448 x 430)
        const bg = this.add.graphics();

        // Upper Distant Sky & Ancient Archway Backdrop (y: 0..68)
        bg.fillGradientStyle(
          palette.skyTop,
          palette.skyTop,
          palette.skyBottom,
          palette.skyBottom,
          1
        );
        bg.fillRect(0, 0, PORTRAIT_WIDTH, 76);

        // Gothic pillars & torches along the upper horizon
        bg.fillStyle(palette.pillar, 0.9);
        for (let i = 0; i < 5; i++) {
          const px = 44 + i * 90;
          bg.fillRect(px - 14, 12, 28, 62);
          bg.fillTriangle(px - 18, 12, px + 18, 12, px, 2);
          bg.fillStyle(palette.rune, 0.35);
          bg.fillRoundedRect(px - 5, 24, 10, 22, 4);
          bg.fillStyle(palette.pillar, 0.9);
        }

        // Main Vertical Stone Courtyard Floor (y: 66..430)
        bg.fillStyle(palette.floorMain, 1);
        bg.fillRect(0, 66, PORTRAIT_WIDTH, PORTRAIT_HEIGHT - 66);

        // Diagonal Stone Battle Road connecting Ally Foreground (Bottom-Left) to Enemy Background (Top-Right)
        bg.fillStyle(palette.floorPath, 0.85);
        bg.beginPath();
        bg.moveTo(16, 420);
        bg.lineTo(260, 420);
        bg.lineTo(432, 72);
        bg.lineTo(190, 72);
        bg.closePath();
        bg.fillPath();

        // Perspective Stone Tile Grid Lines
        bg.lineStyle(1, palette.floorGrid, 0.55);
        for (let r = 0; r <= 7; r++) {
          const y = 70 + r * 50;
          bg.lineBetween(12, y, PORTRAIT_WIDTH - 12, y);
        }
        for (let c = 0; c <= 6; c++) {
          const topX = 48 + c * 58;
          const botX = 12 + c * 70;
          bg.lineBetween(topX, 66, botX, PORTRAIT_HEIGHT);
        }

        // Ornate Gold Border Frame around Portrait Arena
        bg.lineStyle(2, palette.rune, 0.45);
        bg.strokeRoundedRect(8, 68, PORTRAIT_WIDTH - 16, PORTRAIT_HEIGHT - 76, 10);

        // Central Classic AFK Arena Runic Magic Circle at Clash Center (224, 232)
        bg.lineStyle(2, palette.rune, 0.42);
        bg.strokeEllipse(224, 232, 168, 88);
        bg.lineStyle(1.2, palette.rune, 0.28);
        bg.strokeEllipse(224, 232, 124, 64);

        // Team Zone Labels (Subtle non-overlapping tactical floor markers)
        this.add
          .text(368, 60, 'ENEMY FORCE', {
            fontFamily: '"Cinzel", serif',
            fontSize: '9px',
            fontStyle: 'bold',
            color: '#fda4af',
          })
          .setOrigin(0.5, 0.5)
          .setAlpha(0.75);

        this.add
          .text(84, 414, 'ALLY SQUAD', {
            fontFamily: '"Cinzel", serif',
            fontSize: '9px',
            fontStyle: 'bold',
            color: '#7dd3fc',
          })
          .setOrigin(0.5, 0.5)
          .setAlpha(0.75);

        // 2. Tactical Portrait Slot Pedestals & Unit Visual Nodes
        const snap = sim.getSnapshot();
        for (const u of snap.units) {
          const pos = projectUnitToPortrait(u);
          const slotColor = u.team === 'ally' ? 0x38bdf8 : 0xf43f5e;
          bg.lineStyle(1.5, slotColor, 0.35);
          bg.strokeEllipse(pos.homeX, pos.homeY, 46, 16);

          const root = this.add.container(pos.x, pos.y);
          root.setDepth(Math.round(pos.y));

          const shadow = this.add.ellipse(0, 2, 40, 13, 0x000000, 0.55);
          const ring = this.add.ellipse(0, 0, 44, 15);
          ring.setStrokeStyle(1.8, slotColor, 0.85);

          const body = this.add.container(0, 0);
          const spriteGraphics = this.add.graphics();
          const def = getHeroById(u.heroId);
          const primaryNum = hexToNumber(def.visual.primaryColor);
          const accentNum = hexToNumber(def.visual.accentColor);

          if (this.textures.exists(`battle_${u.heroId}`)) {
            const aura = this.add.ellipse(
              0,
              -28,
              u.isBoss ? 48 : 40,
              u.isBoss ? 56 : 46,
              primaryNum,
              0.24
            );
            aura.setStrokeStyle(1.5, accentNum, 0.8);
            const battleImg = this.add.image(0, -28, `battle_${u.heroId}`);
            const targetH = u.isBoss ? 64 : 52;
            const scaleFactor = targetH / (battleImg.height || 200);
            battleImg.setScale(scaleFactor);
            battleImg.setFlipX(u.team === 'enemy');
            body.add([aura, battleImg]);
          } else {
            drawCharacterGraphic(spriteGraphics, u);
            body.add(spriteGraphics);
          }

          const shieldDome = this.add.ellipse(0, -28, 50, 56, 0x38bdf8, 0.18);
          shieldDome.setStrokeStyle(1.5, 0x7dd3fc, 0.75);
          shieldDome.setVisible(u.shield > 0);

          const stoneOverlay = this.add.ellipse(0, -28, 42, 54, 0x94a3b8, 0.65);
          stoneOverlay.setVisible(false);

          // Compact Overhead HP & Energy Bars (46px wide — zero collision between units)
          const barBgHp = this.add.rectangle(0, -61, 46, 5.5, 0x090d16, 0.95);
          barBgHp.setStrokeStyle(1, 0x334155, 0.9);
          const hpColor = u.team === 'ally' ? 0x22c55e : 0xef4444;
          const hpBarFill = this.add
            .rectangle(-22, -61, 44, 3.8, hpColor, 1)
            .setOrigin(0, 0.5);
          const shieldBarFill = this.add
            .rectangle(-22, -61, 0, 3.8, 0x38bdf8, 0.9)
            .setOrigin(0, 0.5);

          const barBgEn = this.add.rectangle(0, -55, 46, 4, 0x090d16, 0.95);
          const energyBarFill = this.add
            .rectangle(
              -22,
              -55,
              Math.min(44, (u.energy / 100) * 44),
              2.5,
              0xf59e0b,
              1
            )
            .setOrigin(0, 0.5);

          // Short non-overlapping Nameplate (first word only, 9.5px bold)
          const shortName = u.name.split(' ')[0].slice(0, 9);
          const nameText = this.add
            .text(0, -71, `${u.isBoss ? '★' : ''}${shortName}`, {
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: '9.5px',
              fontStyle: 'bold',
              color: u.team === 'ally' ? '#e2e8f0' : '#fecdd3',
              stroke: '#020617',
              strokeThickness: 2.5,
            })
            .setOrigin(0.5, 0.5);

          // Compact Single Status Badge (e.g. ⚡STUN) above nameplate
          const statusText = this.add
            .text(0, -83, '', {
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '8.5px',
              fontStyle: 'bold',
              color: '#fef08a',
              backgroundColor: 'rgba(15,23,42,0.88)',
              padding: { x: 3, y: 1 },
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

        // 3. VFX Layer & Compact Portrait Ultimate Callout Banner
        vfxLayer = this.add.container(0, 0);
        vfxLayer.setDepth(2000);

        bannerContainer = this.add.container(PORTRAIT_WIDTH / 2, 26);
        bannerContainer.setDepth(3000);
        bannerContainer.setVisible(false);
        const bannerBg = this.add.rectangle(0, 0, 320, 26, 0x160d06, 0.94);
        bannerBg.setStrokeStyle(1.5, 0xfde047, 1);
        bannerText = this.add
          .text(0, 0, '', {
            fontFamily: '"Cinzel", serif',
            fontSize: '11px',
            fontStyle: 'bold',
            color: '#fde047',
          })
          .setOrigin(0.5, 0.5);
        bannerContainer.add([bannerBg, bannerText]);
      }

      update(_time: number, deltaMs: number) {
        if (!simRef.current || pausedRef.current) return;
        const sim = simRef.current;

        // 1. Step deterministic simulation
        if (sim.getStatus() === 'running') {
          simAccumulatorMs += Math.min(deltaMs, 100) * speedRef.current;
          while (simAccumulatorMs >= 50 && sim.getStatus() === 'running') {
            sim.step(50);
            simAccumulatorMs -= 50;
          }
        }

        // 2. Consume combat events and spawn Portrait VFX
        const newEvents = sim.consumeEvents();
        if (newEvents.length > 0 && vfxLayer) {
          this.renderCombatEvents(newEvents, sim.getUnits());
        }

        // 3. Update Unit Visual Nodes in Portrait Coordinates
        const liveUnits = sim.getUnits();
        for (const u of liveUnits) {
          const node = unitVisuals.get(u.instanceId);
          if (!node) continue;

          if (!u.isAlive) {
            node.root.setAlpha(
              Math.max(0.15, node.root.alpha - deltaMs * 0.003)
            );
            node.body.setRotation(u.team === 'ally' ? -1.3 : 1.3);
            node.hpBarFill.width = 0;
            node.shieldBarFill.width = 0;
            node.energyBarFill.width = 0;
            node.shieldDome.setVisible(false);
            node.stoneOverlay.setVisible(false);
            node.statusText.setVisible(false);
            continue;
          }

          const targetPos = projectUnitToPortrait(u);
          node.root.x = Phaser.Math.Linear(node.root.x, targetPos.x, 0.35);
          node.root.y = Phaser.Math.Linear(node.root.y, targetPos.y, 0.35);
          node.root.setDepth(Math.round(node.root.y));

          // Walk bob or action lunge along portrait diagonal
          node.walkPhase += (deltaMs / 1000) * 8 * speedRef.current;
          if (u.lastActionType === 'move') {
            node.body.y = Math.abs(Math.sin(node.walkPhase)) * -4;
            node.body.x = 0;
          } else if (
            u.actionAnimTimerMs > 0 &&
            (u.lastActionType === 'basic' ||
              u.lastActionType === 'skill' ||
              u.lastActionType === 'ultimate')
          ) {
            const lunge = Math.sin((u.actionAnimTimerMs / 500) * Math.PI) * 9;
            node.body.x = u.facing * lunge;
            node.body.y = -u.facing * lunge * 0.5;
          } else if (u.actionAnimTimerMs > 0 && u.lastActionType === 'hit') {
            node.body.x = -u.facing * 4;
            node.body.y = 0;
          } else {
            node.body.x = 0;
            node.body.y = Math.sin(node.walkPhase * 0.4) * -1.5;
          }

          // Update HP, Shield, and Energy Bars (44px max fill width)
          const hpRatio = Math.max(0, Math.min(1, u.hp / u.maxHp));
          node.hpBarFill.width = 44 * hpRatio;

          const shieldRatio = Math.max(0, Math.min(1, u.shield / u.maxHp));
          node.shieldBarFill.width = 44 * shieldRatio;
          node.shieldDome.setVisible(u.shield > 0);

          const energyRatio = Math.max(0, Math.min(1, u.energy / 100));
          node.energyBarFill.width = 44 * energyRatio;
          node.energyBarFill.fillColor =
            u.energy >= 100 ? 0xfde047 : 0xf59e0b;

          // Compact Single Status Badge (prevents long multi-word overlaps)
          const isPetrified = u.statusEffects.some((s) => s.type === 'petrify');
          node.stoneOverlay.setVisible(isPetrified);

          if (u.statusEffects.length > 0) {
            const topStatus = u.statusEffects[0];
            const label =
              STATUS_SHORT_LABELS[topStatus.type] ||
              topStatus.type.slice(0, 4).toUpperCase();
            node.statusText.setText(label);
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

        const spawnLimitedFloater = (
          unitId: string,
          x: number,
          y: number,
          textStr: string,
          style: Phaser.Types.GameObjects.Text.TextStyle,
          durationMs: number
        ) => {
          if (!vfxLayer) return;
          const currentCount = activeFloaterCounts.get(unitId) || 0;
          // Limit max simultaneous floating combat texts per unit to 2 to prevent overlap
          if (currentCount >= 2) return;
          activeFloaterCounts.set(unitId, currentCount + 1);

          const txt = this.add
            .text(x, y - currentCount * 13, textStr, style)
            .setOrigin(0.5, 0.5);
          vfxLayer.add(txt);
          this.tweens.add({
            targets: txt,
            y: txt.y - 20,
            alpha: 0,
            duration: durationMs,
            onComplete: () => {
              txt.destroy();
              const c = activeFloaterCounts.get(unitId) || 1;
              activeFloaterCounts.set(unitId, Math.max(0, c - 1));
            },
          });
        };

        for (const ev of events) {
          const source = unitMap.get(ev.sourceId);
          const target = ev.targetId ? unitMap.get(ev.targetId) : undefined;
          const colorNum = ev.vfxColor ? hexToNumber(ev.vfxColor) : 0xf59e0b;

          const sourcePos = source ? projectUnitToPortrait(source) : null;
          const targetPos = target ? projectUnitToPortrait(target) : null;

          if (ev.type === 'ultimate_cast' && source && sourcePos) {
            if (bannerContainer && bannerText) {
              const shortCaster = source.name.split(' ')[0].toUpperCase();
              const shortSkill = (ev.skillName || 'ULTIMATE').slice(0, 22);
              bannerText.setText(`★ ${shortCaster}: ${shortSkill} ★`);
              bannerContainer.setVisible(true);
              bannerTimerMs = 1400;
            }
            const ring = this.add.ellipse(
              sourcePos.x,
              sourcePos.y - 16,
              24,
              12
            );
            ring.setStrokeStyle(2.5, colorNum, 0.95);
            vfxLayer.add(ring);
            this.tweens.add({
              targets: ring,
              scaleX: 4.2,
              scaleY: 4.2,
              alpha: 0,
              duration: 450,
              onComplete: () => ring.destroy(),
            });
          }

          if (
            (ev.type === 'basic_attack' || ev.type === 'active_skill') &&
            sourcePos &&
            targetPos
          ) {
            soundEngine.playHit(ev.type === 'active_skill');
            const line = this.add.graphics();
            line.lineStyle(
              ev.type === 'active_skill' ? 3 : 1.5,
              colorNum,
              0.85
            );
            line.lineBetween(
              sourcePos.x,
              sourcePos.y - 26,
              targetPos.x,
              targetPos.y - 26
            );
            vfxLayer.add(line);
            this.tweens.add({
              targets: line,
              alpha: 0,
              duration: 200,
              onComplete: () => line.destroy(),
            });
          }

          if (ev.type === 'damage' && target && targetPos && ev.value) {
            const impact = this.add.circle(
              targetPos.x,
              targetPos.y - 28,
              ev.isCrit ? 15 : 9,
              colorNum,
              0.6
            );
            vfxLayer.add(impact);
            this.tweens.add({
              targets: impact,
              scale: 1.6,
              alpha: 0,
              duration: 210,
              onComplete: () => impact.destroy(),
            });

            spawnLimitedFloater(
              target.instanceId,
              targetPos.x + (Math.random() - 0.5) * 14,
              targetPos.y - 50,
              `${ev.isCrit ? '💥-' : '-'}${ev.value}`,
              {
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: ev.isCrit ? '12px' : '10.5px',
                fontStyle: 'bold',
                color: ev.isCrit ? '#fde047' : '#ffffff',
                stroke: '#020617',
                strokeThickness: 2.5,
              },
              460
            );
          }

          if (ev.type === 'heal' && target && targetPos && ev.value) {
            spawnLimitedFloater(
              target.instanceId,
              targetPos.x,
              targetPos.y - 52,
              `+${ev.value}`,
              {
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '10.5px',
                fontStyle: 'bold',
                color: '#34d399',
                stroke: '#020617',
                strokeThickness: 2.5,
              },
              460
            );
          }

          if (ev.type === 'crowd_control' && target && targetPos && ev.ccType) {
            const shortCc =
              STATUS_SHORT_LABELS[ev.ccType] || ev.ccType.toUpperCase();
            spawnLimitedFloater(
              target.instanceId,
              targetPos.x,
              targetPos.y - 64,
              shortCc,
              {
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '10px',
                fontStyle: 'bold',
                color: '#f472b6',
                stroke: '#020617',
                strokeThickness: 2.5,
              },
              520
            );
          }
        }
      }
    }

    const game = new Phaser.Game({
      type: Phaser.CANVAS,
      parent: mountEl,
      width: PORTRAIT_WIDTH,
      height: PORTRAIT_HEIGHT,
      backgroundColor: '#0b101b',
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
      className="w-full h-full flex items-center justify-center bg-[#0b101b] overflow-hidden select-none"
    />
  );
};
