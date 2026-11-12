import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { BattleSimulation } from '../game/battleEngine';
import { getCampaignStage } from '../game/campaign';
import {
  BattleSnapshot,
  BattleUnitRuntime,
  CombatEvent,
  OwnedHeroState,
  TeamFormationSlots,
} from '../game/types';
import {
  ArenaEnvironmentBundle,
  ArenaEnvironmentId,
  BattlePerformanceMetrics,
  buildArenaEnvironment,
  buildThreeHeroRig,
  CameraBehaviorMode,
  GRAPHICS_PRESET_CONFIGS,
  GraphicsPreset,
  resolveArenaEnvironment,
  ResolvedGraphicsQuality,
  simToWorldPosition,
  ThreeHeroRig,
  ThreeVfxPool,
  updateThreeHeroAnimation,
} from '../game/threeBattleScene';
import { soundEngine } from '../game/audio';

export interface ThreeBattleCanvasProps {
  stageId: number;
  battleInstanceKey: number;
  formation: TeamFormationSlots;
  ownedHeroes: Record<string, OwnedHeroState>;
  battleSpeed: 1 | 2;
  autoUltimate: boolean;
  isPaused: boolean;
  manualUltimateRequest: {
    heroId: string;
    force: boolean;
    seq: number;
  } | null;
  graphicsPreset?: GraphicsPreset;
  arenaOverride?: 'auto' | ArenaEnvironmentId;
  cameraShakeEnabled?: boolean;
  ultimateCameraEnabled?: boolean;
  reducedMotion?: boolean;
  showPerfOverlay?: boolean;
  onSnapshotUpdate: (snapshot: BattleSnapshot) => void;
  onBattleFinished: (finalSnapshot: BattleSnapshot) => void;
}

interface FloatingCombatTextItem {
  id: number;
  text: string;
  color: string;
  worldX: number;
  worldY: number;
  worldZ: number;
  age: number;
  duration: number;
  isCrit: boolean;
}

interface ProjectedUnitOverlay {
  instanceId: string;
  heroId: string;
  name: string;
  level: number;
  isEnemy: boolean;
  isAlive: boolean;
  hp: number;
  maxHp: number;
  shield: number;
  energy: number;
  screenX: number;
  screenY: number;
  footScreenY: number;
  statusTags: string[];
}

export const ThreeBattleCanvas: React.FC<ThreeBattleCanvasProps> = ({
  stageId,
  battleInstanceKey,
  formation,
  ownedHeroes,
  battleSpeed,
  autoUltimate,
  isPaused,
  manualUltimateRequest,
  graphicsPreset = 'AUTO',
  arenaOverride = 'auto',
  cameraShakeEnabled = true,
  ultimateCameraEnabled = true,
  reducedMotion = false,
  showPerfOverlay = false,
  onSnapshotUpdate,
  onBattleFinished,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const simRef = useRef<BattleSimulation | null>(null);
  const lastHandledUltSeqRef = useRef<number>(0);

  const stageDef = getCampaignStage(stageId);

  // Re-initialize deterministic BattleSimulation whenever stageId, battleInstanceKey, or formation changes
  useEffect(() => {
    const stage = getCampaignStage(stageId);
    const seed = stageId * 1009 + battleInstanceKey * 97 + 1337;
    const sim = new BattleSimulation({
      allyFormation: formation,
      ownedHeroes,
      enemies: stage.enemies,
      seed,
      autoUltimate,
      maxDurationMs: 90000,
    });
    simRef.current = sim;
    onSnapshotUpdate(sim.getSnapshot());
  }, [stageId, battleInstanceKey, formation, ownedHeroes]);

  // Keep autoUltimate synced on live simulation
  useEffect(() => {
    if (simRef.current) {
      simRef.current.autoUltimate = autoUltimate;
    }
  }, [autoUltimate]);

  // Handle manual ultimate or combo ultimate requests from HeroUltimateBar / keyboard
  useEffect(() => {
    if (
      !manualUltimateRequest ||
      manualUltimateRequest.seq === lastHandledUltSeqRef.current ||
      !simRef.current
    ) {
      return;
    }
    lastHandledUltSeqRef.current = manualUltimateRequest.seq;
    const sim = simRef.current;

    if (manualUltimateRequest.heroId === '__ALL__') {
      for (const u of sim.getUnits()) {
        if (u.team === 'ally' && u.isAlive) {
          sim.triggerUltimate(u.instanceId, manualUltimateRequest.force);
        }
      }
    } else {
      sim.triggerUltimate(manualUltimateRequest.heroId, manualUltimateRequest.force);
    }
    onSnapshotUpdate(sim.getSnapshot());
  }, [manualUltimateRequest, onSnapshotUpdate]);

  const runtimePropsRef = useRef({
    stageTheme: stageDef.theme,
    battleSpeed,
    autoUltimate,
    isPaused,
    graphicsPreset,
    arenaOverride,
    cameraShakeEnabled,
    ultimateCameraEnabled,
    reducedMotion,
    showPerfOverlay,
    onSnapshotUpdate,
    onBattleFinished,
  });

  useEffect(() => {
    runtimePropsRef.current = {
      stageTheme: stageDef.theme,
      battleSpeed,
      autoUltimate,
      isPaused,
      graphicsPreset,
      arenaOverride,
      cameraShakeEnabled,
      ultimateCameraEnabled,
      reducedMotion,
      showPerfOverlay,
      onSnapshotUpdate,
      onBattleFinished,
    };
  }, [
    stageDef.theme,
    battleSpeed,
    autoUltimate,
    isPaused,
    graphicsPreset,
    arenaOverride,
    cameraShakeEnabled,
    ultimateCameraEnabled,
    reducedMotion,
    showPerfOverlay,
    onSnapshotUpdate,
    onBattleFinished,
  ]);

  const [unitOverlays, setUnitOverlays] = useState<ProjectedUnitOverlay[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<
    Array<{
      id: number;
      text: string;
      color: string;
      screenX: number;
      screenY: number;
      opacity: number;
      scale: number;
      isCrit: boolean;
    }>
  >([]);
  const [ultimateBanner, setUltimateBanner] = useState<{
    heroName: string;
    skillName: string;
    isEnemy: boolean;
  } | null>(null);
  const [perfMetrics, setPerfMetrics] = useState<BattlePerformanceMetrics | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = Math.max(320, container.clientWidth || 390);
    const height = Math.max(300, container.clientHeight || 420);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setSize(width, height, false);
    renderer.domElement.className = 'w-full h-full block select-none touch-none';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const gl = renderer.getContext();
    const dbgInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const unmaskedRenderer = dbgInfo
      ? String(gl.getParameter(dbgInfo.UNMASKED_RENDERER_WEBGL) || '')
      : '';
    const rendererStr = `${String(gl.getParameter(gl.RENDERER) || '')} ${unmaskedRenderer}`;
    const isSoftwareGl = /SwiftShader|llvmpipe|Software|Basic Render Driver/i.test(rendererStr);

    const resolveQuality = (preset: GraphicsPreset): ResolvedGraphicsQuality => {
      if (preset !== 'AUTO') return preset;
      return isSoftwareGl ? 'LOW' : 'HIGH';
    };

    let currentQuality = resolveQuality(runtimePropsRef.current.graphicsPreset);
    let presetCfg = GRAPHICS_PRESET_CONFIGS[currentQuality];

    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, presetCfg.maxDpr)
    );
    renderer.shadowMap.enabled = !isSoftwareGl && presetCfg.shadowsEnabled;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const scene = new THREE.Scene();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    // Portrait 3D Battle Camera
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.5, 65);
    const baseCameraPos = new THREE.Vector3(0, 7.2, 12.2);
    const baseLookTarget = new THREE.Vector3(0, 0.65, -0.25);
    const currentLookTarget = baseLookTarget.clone();
    camera.position.copy(baseCameraPos);
    camera.lookAt(currentLookTarget);

    // 3-Point Fantasy Arena Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.82);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfef08a, 2.2);
    keyLight.position.set(5.5, 11.5, 6.5);
    keyLight.castShadow = !isSoftwareGl && presetCfg.shadowsEnabled;
    if (presetCfg.shadowMapSize > 0) {
      keyLight.shadow.mapSize.set(presetCfg.shadowMapSize, presetCfg.shadowMapSize);
    }
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 28;
    const d = 7.5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.15);
    rimLight.position.set(-6.0, 6.5, -5.5);
    scene.add(rimLight);

    let currentArenaId: ArenaEnvironmentId = resolveArenaEnvironment(
      runtimePropsRef.current.stageTheme,
      runtimePropsRef.current.arenaOverride
    );
    let arenaBundle: ArenaEnvironmentBundle = buildArenaEnvironment(currentArenaId, presetCfg);
    scene.add(arenaBundle.group);
    scene.background = new THREE.Color(arenaBundle.fogColor);
    scene.fog = new THREE.FogExp2(arenaBundle.fogColor, 0.032);
    ambientLight.color.setHex(arenaBundle.ambientColor);
    keyLight.color.setHex(arenaBundle.keyLightColor);
    rimLight.color.setHex(arenaBundle.rimLightColor);
    soundEngine.setArenaAmbient(currentArenaId);

    const vfxPool = new ThreeVfxPool(presetCfg.maxParticles);
    scene.add(vfxPool.group);

    const rigsMap = new Map<string, ThreeHeroRig>();
    const rigsRoot = new THREE.Group();
    scene.add(rigsRoot);

    const activeFloatingTexts: FloatingCombatTextItem[] = [];

    let activeCameraMode: CameraBehaviorMode = 'standard';
    const cameraFocusTarget = new THREE.Vector3(0, 0.9, 0);
    let cameraModeTimer = 0;
    let cameraShakeIntensity = 0;
    let finishedReportedForSim: BattleSimulation | null = null;
    let lastBannerClearTimeout: number | null = null;

    // Click on 3D ally hero rig to trigger Ultimate if energy is full
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const handlePointerDown = (ev: PointerEvent) => {
      const sim = simRef.current;
      if (!sim) return;
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      pointerNdc.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(rigsRoot.children, true);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj && !obj.name.startsWith('hero_rig_')) {
          obj = obj.parent;
        }
        if (obj && obj.name.startsWith('hero_rig_')) {
          const instanceId = obj.name.replace('hero_rig_', '');
          sim.triggerUltimate(instanceId, false);
        }
      }
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(280, Math.floor(entry.contentRect.width));
        const h = Math.max(240, Math.floor(entry.contentRect.height));
        camera.aspect = w / h;
        const aspectFactor = Math.max(0.7, Math.min(1.3, w / h));
        baseCameraPos.set(
          0,
          7.0 / Math.pow(aspectFactor, 0.2),
          11.8 / Math.pow(aspectFactor, 0.32)
        );
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      }
    });
    resizeObserver.observe(container);

    const syncRigsWithSimulation = (sim: BattleSimulation) => {
      const units = sim.getUnits();
      const activeIds = new Set<string>();
      for (const unit of units) {
        activeIds.add(unit.instanceId);
        let rig = rigsMap.get(unit.instanceId);
        if (!rig || rig.heroId !== unit.heroId) {
          if (rig) {
            rigsRoot.remove(rig.root);
          }
          rig = buildThreeHeroRig(unit, !isSoftwareGl && presetCfg.shadowsEnabled);
          rigsMap.set(unit.instanceId, rig);
          rigsRoot.add(rig.root);
        }
      }

      for (const [id, rig] of rigsMap.entries()) {
        if (!activeIds.has(id)) {
          rigsRoot.remove(rig.root);
          rigsMap.delete(id);
        }
      }
    };

    const processCombatEvents = (sim: BattleSimulation, events: CombatEvent[]) => {
      const props = runtimePropsRef.current;
      const units = sim.getUnits();

      for (const ev of events) {
        const sourceUnit = units.find((u) => u.instanceId === ev.sourceId);
        const targetUnit = ev.targetId
          ? units.find((u) => u.instanceId === ev.targetId)
          : undefined;
        const sourceRig = sourceUnit ? rigsMap.get(sourceUnit.instanceId) : undefined;
        const targetRig = targetUnit ? rigsMap.get(targetUnit.instanceId) : undefined;

        const sourcePos = sourceUnit
          ? simToWorldPosition(sourceUnit.x, sourceUnit.y)
          : { x: 0, z: 0 };
        const targetPos = targetUnit
          ? simToWorldPosition(targetUnit.x, targetUnit.y)
          : sourcePos;
        const isEnemySource = sourceUnit?.team === 'enemy';

        switch (ev.type) {
          case 'basic_attack': {
            if (sourceRig) {
              sourceRig.animState = 'BasicAttack';
              sourceRig.animTimer = 0.34;
            }
            if (sourceUnit?.isRanged) {
              vfxPool.spawnProjectile(
                sourcePos,
                targetPos,
                sourceRig ? sourceRig.archetype.glowHex : 0x38bdf8,
                0.24
              );
              soundEngine.playBasicAttack(
                sourceUnit.heroClass === 'Mage' || sourceUnit.heroClass === 'Support'
                  ? 'magic'
                  : 'ranged'
              );
            } else {
              vfxPool.spawnSlashArc(
                targetPos,
                sourceRig ? sourceRig.archetype.glowHex : 0xfbbf24,
                Boolean(isEnemySource)
              );
              soundEngine.playBasicAttack('melee');
            }
            break;
          }

          case 'active_skill': {
            if (sourceRig) {
              sourceRig.animState = 'Skill';
              sourceRig.animTimer = 0.5;
            }
            const skillColor = isEnemySource ? 0xf43f5e : 0x38bdf8;
            vfxPool.spawnCastBurst(sourcePos, skillColor, 1.15);
            if (targetUnit && targetUnit.instanceId !== sourceUnit?.instanceId) {
              vfxPool.spawnProjectile(sourcePos, targetPos, skillColor, 0.28);
            }
            if (!props.reducedMotion && activeCameraMode === 'standard') {
              activeCameraMode = 'focus';
              cameraFocusTarget.set(sourcePos.x * 0.35, 0.85, sourcePos.z * 0.35);
              cameraModeTimer = 0.55;
            }
            soundEngine.playSkillCast('arcane');
            break;
          }

          case 'ultimate_cast': {
            if (sourceRig) {
              sourceRig.animState = 'Ultimate';
              sourceRig.animTimer = 0.78;
            }
            const ultColor = isEnemySource ? 0xe11d48 : 0xfbbf24;
            vfxPool.spawnCastBurst(sourcePos, ultColor, 1.85);
            vfxPool.spawnImpact(
              { x: isEnemySource ? -1.5 : 1.5, z: 0 },
              ultColor,
              2.1,
              true
            );

            if (props.ultimateCameraEnabled && !props.reducedMotion) {
              activeCameraMode = 'ultimate';
              cameraFocusTarget.set(sourcePos.x * 0.55, 1.0, sourcePos.z * 0.45);
              cameraModeTimer = 0.85;
            }
            if (props.cameraShakeEnabled && !props.reducedMotion) {
              cameraShakeIntensity = Math.max(cameraShakeIntensity, 0.24);
            }
            soundEngine.playUltimateCast();

            if (sourceUnit) {
              setUltimateBanner({
                heroName: sourceUnit.name,
                skillName: ev.skillName || 'Tuyệt Kỹ Tối Thượng',
                isEnemy: isEnemySource,
              });
              if (lastBannerClearTimeout) window.clearTimeout(lastBannerClearTimeout);
              lastBannerClearTimeout = window.setTimeout(() => {
                setUltimateBanner(null);
              }, 1150);
            }
            break;
          }

          case 'damage': {
            if (targetRig) {
              targetRig.hitFlashTimer = 0.16;
              if (targetRig.animState === 'Idle' || targetRig.animState === 'Move') {
                targetRig.animState = 'Hit';
                targetRig.animTimer = 0.2;
              }
            }
            const hitColor = ev.isCrit ? 0xfbbf24 : 0xf87171;
            vfxPool.spawnImpact(targetPos, hitColor, ev.isCrit ? 1.15 : 0.75, false);

            if (ev.isCrit && props.cameraShakeEnabled && !props.reducedMotion) {
              cameraShakeIntensity = Math.max(cameraShakeIntensity, 0.12);
            }
            soundEngine.playHit(Boolean(ev.isCrit));

            if (ev.value && ev.value > 0 && activeFloatingTexts.length < 18) {
              activeFloatingTexts.push({
                id: ev.id,
                text: `${ev.isCrit ? 'CRIT ' : ''}-${Math.round(ev.value)}`,
                color: ev.isCrit ? '#fbbf24' : '#f8fafc',
                worldX: targetPos.x + (Math.random() - 0.5) * 0.42,
                worldY: 1.8,
                worldZ: targetPos.z,
                age: 0,
                duration: 0.68,
                isCrit: Boolean(ev.isCrit),
              });
            }
            break;
          }

          case 'heal': {
            vfxPool.spawnCastBurst(targetPos, 0x34d399, 0.95);
            if (ev.value && ev.value > 0 && activeFloatingTexts.length < 18) {
              activeFloatingTexts.push({
                id: ev.id,
                text: `+${Math.round(ev.value)}`,
                color: '#4ade80',
                worldX: targetPos.x,
                worldY: 1.85,
                worldZ: targetPos.z,
                age: 0,
                duration: 0.65,
                isCrit: false,
              });
            }
            break;
          }

          case 'shield': {
            vfxPool.spawnCastBurst(targetPos, 0x38bdf8, 1.0);
            break;
          }

          case 'crowd_control': {
            if (targetRig) {
              targetRig.animState = 'Stun';
              targetRig.animTimer = 0.6;
            }
            vfxPool.spawnImpact(targetPos, 0xa855f7, 1.05, false);
            if (ev.ccType && activeFloatingTexts.length < 18) {
              activeFloatingTexts.push({
                id: ev.id,
                text: ev.ccType.toUpperCase(),
                color: '#c084fc',
                worldX: targetPos.x,
                worldY: 2.0,
                worldZ: targetPos.z,
                age: 0,
                duration: 0.7,
                isCrit: false,
              });
            }
            break;
          }

          case 'knockback': {
            if (targetRig && targetUnit) {
              targetRig.knockbackOffset = targetUnit.team === 'enemy' ? 0.52 : -0.52;
              targetRig.animState = 'Knockback';
              targetRig.animTimer = 0.35;
            }
            break;
          }

          case 'death': {
            if (targetRig) {
              targetRig.animState = 'Defeat';
            }
            vfxPool.spawnImpact(targetPos, 0x94a3b8, 1.25, true);
            break;
          }
        }
      }
    };

    const frameDeltaHistory: number[] = [];
    let elapsedSec = 0;
    let simAccumulatorMs = 0;
    let hudSyncAccumulator = 0;
    let perfSyncAccumulator = 0;
    let lastFrameTime = performance.now();
    let rafId = 0;
    let disposed = false;

    const projectWorldToScreen = (
      wx: number,
      wy: number,
      wz: number,
      canvasW: number,
      canvasH: number
    ) => {
      const vec = new THREE.Vector3(wx, wy, wz);
      vec.project(camera);
      return {
        x: (vec.x * 0.5 + 0.5) * canvasW,
        y: (-vec.y * 0.5 + 0.5) * canvasH,
      };
    };

    const renderFrame = (now: number) => {
      if (disposed) return;

      const rawDtMs = Math.max(1, Math.min(100, now - lastFrameTime));
      lastFrameTime = now;
      const dt = Math.min(0.05, rawDtMs / 1000);
      elapsedSec += dt;

      frameDeltaHistory.push(rawDtMs);
      if (frameDeltaHistory.length > 90) {
        frameDeltaHistory.shift();
      }

      const props = runtimePropsRef.current;

      // Dynamic Arena or Graphics Preset switching
      const desiredArenaId = resolveArenaEnvironment(props.stageTheme, props.arenaOverride);
      const desiredQuality = resolveQuality(props.graphicsPreset);
      if (desiredArenaId !== currentArenaId || desiredQuality !== currentQuality) {
        currentArenaId = desiredArenaId;
        currentQuality = desiredQuality;
        presetCfg = GRAPHICS_PRESET_CONFIGS[currentQuality];
        vfxPool.setBudget(presetCfg.maxParticles);

        scene.remove(arenaBundle.group);
        arenaBundle.dispose();
        arenaBundle = buildArenaEnvironment(currentArenaId, presetCfg);
        scene.add(arenaBundle.group);
        scene.background = new THREE.Color(arenaBundle.fogColor);
        scene.fog = new THREE.FogExp2(arenaBundle.fogColor, 0.032);
        ambientLight.color.setHex(arenaBundle.ambientColor);
        keyLight.color.setHex(arenaBundle.keyLightColor);
        rimLight.color.setHex(arenaBundle.rimLightColor);
        soundEngine.setArenaAmbient(currentArenaId);
      }

      const sim = simRef.current;
      if (sim) {
        syncRigsWithSimulation(sim);

        if (!props.isPaused && sim.getStatus() === 'running') {
          simAccumulatorMs += rawDtMs * props.battleSpeed;
          const fixedStepMs = 50;
          let steps = 0;
          while (simAccumulatorMs >= fixedStepMs && steps < 6 && sim.getStatus() === 'running') {
            sim.step(fixedStepMs);
            simAccumulatorMs -= fixedStepMs;
            steps++;
          }

          const newEvents = sim.consumeEvents();
          if (newEvents.length > 0) {
            processCombatEvents(sim, newEvents);
          }

          const currentStatus = sim.getStatus();
          if (
            (currentStatus === 'victory' || currentStatus === 'defeat') &&
            finishedReportedForSim !== sim
          ) {
            finishedReportedForSim = sim;
            activeCameraMode = 'victory';
            cameraModeTimer = 4.0;
            if (currentStatus === 'victory') {
              soundEngine.playVictoryFanfare();
            } else {
              soundEngine.playDefeatSting();
            }
            const finalSnap = sim.getSnapshot();
            props.onSnapshotUpdate(finalSnap);
            props.onBattleFinished(finalSnap);
          }
        }

        const simStatus = sim.getStatus();
        for (const unit of sim.getUnits()) {
          const rig = rigsMap.get(unit.instanceId);
          if (rig) {
            updateThreeHeroAnimation(rig, unit, dt, elapsedSec, simStatus);
          }
        }
      }

      arenaBundle.update(elapsedSec);
      vfxPool.update(dt);

      // Update 4-Mode Camera Choreography
      if (cameraModeTimer > 0) {
        cameraModeTimer = Math.max(0, cameraModeTimer - dt);
        if (cameraModeTimer === 0 && activeCameraMode !== 'victory') {
          activeCameraMode = 'standard';
        }
      }

      const targetCamPos = baseCameraPos.clone();
      const targetLookAt = baseLookTarget.clone();

      if (activeCameraMode === 'ultimate' && !props.reducedMotion) {
        targetCamPos.set(
          cameraFocusTarget.x * 0.65,
          baseCameraPos.y - 1.25,
          baseCameraPos.z - 2.3
        );
        targetLookAt.lerp(cameraFocusTarget, 0.55);
      } else if (activeCameraMode === 'focus' && !props.reducedMotion) {
        targetCamPos.set(
          cameraFocusTarget.x * 0.35,
          baseCameraPos.y - 0.4,
          baseCameraPos.z - 0.75
        );
        targetLookAt.lerp(cameraFocusTarget, 0.3);
      } else if (activeCameraMode === 'victory' && !props.reducedMotion) {
        targetCamPos.set(
          Math.sin(elapsedSec * 0.6) * 1.25,
          baseCameraPos.y - 1.0,
          baseCameraPos.z - 1.4
        );
      }

      if (cameraShakeIntensity > 0.005) {
        cameraShakeIntensity = Math.max(0, cameraShakeIntensity - dt * 1.2);
        if (props.cameraShakeEnabled && !props.reducedMotion) {
          targetCamPos.x += (Math.random() - 0.5) * cameraShakeIntensity * 1.3;
          targetCamPos.y += (Math.random() - 0.5) * cameraShakeIntensity * 1.0;
        }
      }

      camera.position.lerp(targetCamPos, Math.min(1, dt * 8));
      currentLookTarget.lerp(targetLookAt, Math.min(1, dt * 10));
      camera.lookAt(currentLookTarget);

      renderer.render(scene, camera);

      // Update World-Space Overlays & Snapshot at ~16Hz
      hudSyncAccumulator += dt;
      for (let i = activeFloatingTexts.length - 1; i >= 0; i--) {
        activeFloatingTexts[i].age += dt;
        activeFloatingTexts[i].worldY += dt * 1.15;
        if (activeFloatingTexts[i].age >= activeFloatingTexts[i].duration) {
          activeFloatingTexts.splice(i, 1);
        }
      }

      if (hudSyncAccumulator >= 0.065 && sim) {
        hudSyncAccumulator = 0;
        const canvasW = renderer.domElement.clientWidth || width;
        const canvasH = renderer.domElement.clientHeight || height;

        const projectedUnits: ProjectedUnitOverlay[] = sim
          .getUnits()
          .map((u: BattleUnitRuntime) => {
            const rig = rigsMap.get(u.instanceId);
            const wx = rig ? rig.root.position.x : simToWorldPosition(u.x, u.y).x;
            const wz = rig ? rig.root.position.z : simToWorldPosition(u.x, u.y).z;
            const headPos = projectWorldToScreen(
              wx,
              1.95 * (rig?.archetype.scale || 1),
              wz,
              canvasW,
              canvasH
            );
            const footPos = projectWorldToScreen(wx, 0.05, wz, canvasW, canvasH);

            const tags: string[] = [];
            for (const eff of u.statusEffects) {
              if (eff.type === 'stun') tags.push('CHOÁNG');
              if (eff.type === 'petrify') tags.push('HÓA ĐÁ');
              if (eff.type === 'silence') tags.push('CÂM LẶNG');
            }

            return {
              instanceId: u.instanceId,
              heroId: u.heroId,
              name: u.name,
              level: u.level,
              isEnemy: u.team === 'enemy',
              isAlive: u.isAlive,
              hp: u.hp,
              maxHp: u.maxHp,
              shield: u.shield,
              energy: u.energy,
              screenX: headPos.x,
              screenY: headPos.y,
              footScreenY: footPos.y,
              statusTags: tags,
            };
          });
        setUnitOverlays(projectedUnits);

        setFloatingTexts(
          activeFloatingTexts.map((ft) => {
            const p = projectWorldToScreen(ft.worldX, ft.worldY, ft.worldZ, canvasW, canvasH);
            const lifeRatio = ft.age / ft.duration;
            return {
              id: ft.id,
              text: ft.text,
              color: ft.color,
              screenX: p.x,
              screenY: p.y,
              opacity: Math.max(0, 1 - Math.pow(lifeRatio, 1.6)),
              scale: ft.isCrit ? 1.18 : 1.0,
              isCrit: ft.isCrit,
            };
          })
        );

        props.onSnapshotUpdate(sim.getSnapshot());
      }

      // Update Live Performance Telemetry every 0.4s
      perfSyncAccumulator += dt;
      if (perfSyncAccumulator >= 0.4) {
        perfSyncAccumulator = 0;
        const sortedDeltas = [...frameDeltaHistory].sort((a, b) => a - b);
        const avgDelta =
          sortedDeltas.reduce((acc, v) => acc + v, 0) / Math.max(1, sortedDeltas.length);
        const p99Delta =
          sortedDeltas[Math.min(sortedDeltas.length - 1, Math.floor(sortedDeltas.length * 0.95))] ||
          avgDelta;

        setPerfMetrics({
          avgFps: Math.min(120, Math.round(1000 / Math.max(1, avgDelta))),
          low1PctFps: Math.min(120, Math.round(1000 / Math.max(1, p99Delta))),
          frameTimeMs: Number(avgDelta.toFixed(1)),
          drawCalls: renderer.info.render.calls,
          triangles: renderer.info.render.triangles,
          geometries: renderer.info.memory.geometries,
          textures: renderer.info.memory.textures,
          activeRigs: rigsMap.size,
          activeVfx: vfxPool.getActiveCount(),
          activePreset: currentQuality,
          isSoftwareGl,
          arenaId: currentArenaId,
          cameraMode: activeCameraMode,
        });
      }

      const scheduleNext = () => {
        if (disposed) return;
        if (isSoftwareGl) {
          window.setTimeout(() => {
            rafId = requestAnimationFrame(renderFrame);
          }, 48);
        } else {
          rafId = requestAnimationFrame(renderFrame);
        }
      };

      if (isSoftwareGl && 'fenceSync' in gl) {
        const gl2 = gl as WebGL2RenderingContext;
        const sync = gl2.fenceSync(gl2.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl2.flush();
        const pollFence = () => {
          if (disposed || !sync) return;
          const status = gl2.clientWaitSync(sync, 0, 0);
          if (status === gl2.TIMEOUT_EXPIRED) {
            window.setTimeout(pollFence, 8);
          } else {
            gl2.deleteSync(sync);
            scheduleNext();
          }
        };
        window.setTimeout(pollFence, 0);
      } else {
        scheduleNext();
      }
    };

    rafId = requestAnimationFrame(renderFrame);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      if (lastBannerClearTimeout) window.clearTimeout(lastBannerClearTimeout);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      soundEngine.setArenaAmbient(null);
      vfxPool.dispose();
      arenaBundle.dispose();
      envTex.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
    };
  }, []);

  const arenaLabel =
    perfMetrics?.arenaId === 'enchanted_forest'
      ? 'Rừng Tinh Linh 3D'
      : perfMetrics?.arenaId === 'celestial_temple'
      ? 'Thánh Điện Thiên Giới 3D'
      : 'Minh Giới Hắc Ám 3D';

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* Three.js WebGL Mount Container */}
      <div
        ref={mountRef}
        className="w-full h-full"
        data-testid="three-battle-canvas"
      />

      {/* Cinematic Ultimate Dim & Callout Banner */}
      {ultimateBanner && (
        <div className="pointer-events-none absolute inset-x-0 top-10 z-20 flex justify-center px-3">
          <div
            className={`flex items-center gap-2 rounded-lg border px-3 py-1 shadow-xl backdrop-blur-sm ${
              ultimateBanner.isEnemy
                ? 'border-rose-400/70 bg-rose-950/85 text-rose-100'
                : 'border-amber-300/80 bg-amber-950/85 text-amber-100'
            }`}
          >
            <span className="text-[10px] font-black tracking-widest uppercase text-amber-300">
              TUYỆT KỸ 3D
            </span>
            <span className="text-xs font-extrabold text-white">
              {ultimateBanner.heroName}
            </span>
            <span className="text-[11px] font-semibold text-amber-200">
              • {ultimateBanner.skillName}
            </span>
          </div>
        </div>
      )}

      {/* World-Space Projected Unit HP / Shield / Energy Bars */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        {unitOverlays.map((u) => {
          if (!u.isAlive) return null;
          const hpPct = Math.max(0, Math.min(100, (u.hp / Math.max(1, u.maxHp)) * 100));
          const shieldPct = Math.max(0, Math.min(100, (u.shield / Math.max(1, u.maxHp)) * 100));
          const energyPct = Math.max(0, Math.min(100, u.energy));

          return (
            <div
              key={u.instanceId}
              className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center"
              style={{
                left: `${Math.round(u.screenX)}px`,
                top: `${Math.round(u.screenY)}px`,
              }}
            >
              {u.statusTags.length > 0 && (
                <span className="mb-0.5 rounded bg-purple-950/90 border border-purple-400/60 px-1 py-0.2 text-[8px] font-black tracking-wider text-purple-200">
                  {u.statusTags[0]}
                </span>
              )}

              <div className="w-11 rounded-sm bg-slate-950/90 p-[1.5px] border border-amber-900/75 shadow">
                <div className="relative h-1.5 w-full overflow-hidden rounded-[1px] bg-slate-900">
                  <div
                    className={`h-full transition-all duration-75 ${
                      u.isEnemy
                        ? 'bg-gradient-to-r from-red-600 to-rose-400'
                        : 'bg-gradient-to-r from-emerald-600 to-lime-400'
                    }`}
                    style={{ width: `${hpPct}%` }}
                  />
                  {shieldPct > 0 && (
                    <div
                      className="absolute inset-y-0 left-0 bg-sky-300/75"
                      style={{ width: `${shieldPct}%` }}
                    />
                  )}
                </div>
                <div className="mt-[1px] h-1 w-full overflow-hidden rounded-[1px] bg-slate-900">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-75"
                    style={{ width: `${energyPct}%` }}
                  />
                </div>
              </div>
              <span className="mt-0.5 rounded bg-slate-950/75 px-1 text-[8px] font-bold text-amber-100/90 leading-tight">
                Lv.{u.level}
              </span>
            </div>
          );
        })}

        {/* Floating Damage / Heal / Crit Numbers */}
        {floatingTexts.map((ft) => (
          <div
            key={ft.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 font-black tracking-tight drop-shadow-[0_2px_3px_rgba(0,0,0,0.95)]"
            style={{
              left: `${Math.round(ft.screenX)}px`,
              top: `${Math.round(ft.screenY)}px`,
              color: ft.color,
              opacity: ft.opacity,
              transform: `translate(-50%, -50%) scale(${ft.scale})`,
              fontSize: ft.isCrit ? '14px' : '11px',
            }}
          >
            {ft.text}
          </div>
        ))}
      </div>

      {/* Compact 3D Arena & Live Measured Telemetry Badge */}
      {perfMetrics && (
        <div
          className="pointer-events-none absolute left-2 top-1.5 z-20 flex flex-wrap items-center gap-1.5 rounded-md border border-amber-500/40 bg-slate-950/80 px-2 py-0.5 text-[9px] font-bold text-amber-100/90 backdrop-blur-xs"
          data-testid="three-perf-hud"
        >
          <span className="text-amber-300">{arenaLabel}</span>
          <span className="text-slate-500">•</span>
          <span>
            {perfMetrics.avgFps} FPS ({perfMetrics.frameTimeMs}ms)
          </span>
          <span className="text-slate-500">•</span>
          <span>Draws: {perfMetrics.drawCalls}</span>
          {showPerfOverlay && (
            <>
              <span className="text-slate-500">•</span>
              <span>1% Low: {perfMetrics.low1PctFps}</span>
              <span className="text-slate-500">•</span>
              <span>Tris: {perfMetrics.triangles}</span>
              <span className="text-slate-500">•</span>
              <span>Rigs: {perfMetrics.activeRigs}</span>
              <span className="text-slate-500">•</span>
              <span>VFX: {perfMetrics.activeVfx}</span>
              <span className="text-slate-500">•</span>
              <span>Preset: {perfMetrics.activePreset}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
