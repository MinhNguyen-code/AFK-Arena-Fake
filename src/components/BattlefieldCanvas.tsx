import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  HeroTemplate,
  OwnedHero,
  EnemyBehaviorPolicy,
  getHeroTemplate,
  calculateHeroStats,
  calculateFactionSynergyBonus,
} from '../game/rules';
import {
  ActorRig3D,
  buildCharacterRig,
  buildSanctuaryEnvironment,
} from '../game/models3d';
import { soundEngine } from '../game/audio';

export interface LiveUnitHudState {
  id: string;
  templateId: string;
  name: string;
  slotIndex: number;
  hp: number;
  maxHp: number;
  energy: number; // 0 to 100
  isAlive: boolean;
  shield: number;
  lastSkillCast?: string;
}

export interface BattleOutcomeSummary {
  didWin: boolean;
  mode: 'campaign' | 'arena';
  clearTimeSec: number;
  totalDamageDealt: number;
  survivingAllies: number;
  bossHpRemainingPct: number;
}

export interface EnemySpawnSpec {
  templateId: string;
  level: number;
  stars: number;
  slotIndex: number;
  policy: EnemyBehaviorPolicy;
  isBoss?: boolean;
}

export interface SkillCastNotification {
  heroId: string;
  heroName: string;
  skillName: string;
  skillType: 'ultimate' | 'active';
  accentColor: string;
  seq: number;
}

interface BattlefieldCanvasProps {
  gameState: 'title' | 'playing' | 'paused' | 'gameover';
  battleMode: 'campaign' | 'arena';
  battleWaveId: number;
  deployedHeroes: OwnedHero[];
  enemies: EnemySpawnSpec[];
  battleSpeed: 1 | 2;
  autoUltimate: boolean;
  cameraPreset: 'tactical' | 'cinematic' | 'overhead';
  castUltimateRequest: { slotIndex: number; seq: number; forceUltimate?: boolean } | null;
  onHudSync: (units: LiveUnitHudState[], elapsedSec: number, enemyTotalHpPct: number) => void;
  onBattleOutcome: (summary: BattleOutcomeSummary) => void;
  onSkillCast?: (notification: SkillCastNotification) => void;
}

interface SimActor {
  id: string;
  template: HeroTemplate;
  isEnemy: boolean;
  slotIndex: number;
  policy: EnemyBehaviorPolicy;
  isBoss: boolean;
  maxHp: number;
  hp: number;
  atk: number;
  def: number;
  shield: number;
  energy: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  facingAngle: number;
  walkDistance: number;
  squashTime: number;
  attackCooldown: number;
  activeSkillCooldown: number;
  attackPhase: 'idle' | 'windup' | 'active' | 'recovery';
  phaseTimer: number;
  isHeavySkill: boolean;
  targetId: string | null;
  hitFlashTimer: number;
  koTimer: number;
  isDead: boolean;
  rig: ActorRig3D;
}

interface ParticleSlot {
  active: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
  scale: number;
  color: THREE.Color;
}

interface ShockwaveSlot {
  active: boolean;
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  life: number;
  maxLife: number;
  maxScale: number;
}

interface SkyBeamSlot {
  active: boolean;
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  life: number;
  maxLife: number;
  maxRadius: number;
}

interface ProjectileSlot {
  active: boolean;
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  life: number;
  maxLife: number;
  arcHeight: number;
  colorHex: number;
}

interface FloatingCombatTextSlot {
  active: boolean;
  sprite: THREE.Sprite;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  texture: THREE.CanvasTexture;
  mat: THREE.SpriteMaterial;
  life: number;
  maxLife: number;
  baseScaleX: number;
  baseScaleY: number;
}

// Pre-allocated module-scope scratch objects (Zero GC inside render loop)
const _scratchVecA = new THREE.Vector3();
const _scratchMat4 = new THREE.Matrix4();
const _scratchQuat = new THREE.Quaternion();
const _scratchScale = new THREE.Vector3();
const _scratchEuler = new THREE.Euler();
const _desiredCamPos = new THREE.Vector3();
const _desiredLookAt = new THREE.Vector3();

// Formation coordinates: 2 Frontline slots (0, 1), 3 Backline slots (2, 3, 4)
const ALLY_SLOT_POSITIONS: [number, number][] = [
  [-2.6, -1.7], // Front Top
  [-2.6, 1.7],  // Front Bottom
  [-6.2, -3.1], // Back Top
  [-6.5, 0.0],  // Back Center
  [-6.2, 3.1],  // Back Bottom
];

const ENEMY_SLOT_POSITIONS: [number, number][] = [
  [2.6, -1.7],
  [2.6, 1.7],
  [6.2, -3.1],
  [6.5, 0.0],
  [6.2, 3.1],
];

export const BattlefieldCanvas: React.FC<BattlefieldCanvasProps> = ({
  gameState,
  battleMode,
  battleWaveId,
  deployedHeroes,
  enemies,
  battleSpeed,
  autoUltimate,
  cameraPreset,
  castUltimateRequest,
  onHudSync,
  onBattleOutcome,
  onSkillCast,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const propsRef = useRef({
    gameState,
    battleMode,
    battleWaveId,
    deployedHeroes,
    enemies,
    battleSpeed,
    autoUltimate,
    cameraPreset,
    onHudSync,
    onBattleOutcome,
    onSkillCast,
  });

  useEffect(() => {
    propsRef.current = {
      gameState,
      battleMode,
      battleWaveId,
      deployedHeroes,
      enemies,
      battleSpeed,
      autoUltimate,
      cameraPreset,
      onHudSync,
      onBattleOutcome,
      onSkillCast,
    };
  });

  const rebuildWaveRef = useRef<(() => void) | null>(null);
  const castUltSlotRef = useRef<((slotIndex: number, forceUltimate?: boolean) => void) | null>(
    null
  );

  useEffect(() => {
    if (rebuildWaveRef.current) {
      rebuildWaveRef.current();
    }
  }, [battleWaveId, battleMode, deployedHeroes.length]);

  useEffect(() => {
    if (castUltimateRequest && castUltSlotRef.current) {
      castUltSlotRef.current(
        castUltimateRequest.slotIndex,
        castUltimateRequest.forceUltimate ?? true
      );
    }
  }, [castUltimateRequest]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL Guard
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const initW = container.clientWidth || window.innerWidth;
    const initH = container.clientHeight || window.innerHeight;
    renderer.setSize(initW, initH);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const horizonHex = 0x0b101d;
    scene.background = new THREE.Color(horizonHex);
    scene.fog = new THREE.FogExp2(horizonHex, 0.022);

    // 2. Studio PBR Environment Reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(42, initW / initH, 0.5, 110);
    const currentCamPos = new THREE.Vector3(0, 12.5, 16.5);
    const currentLookAt = new THREE.Vector3(0, 1.0, -0.5);
    camera.position.copy(currentCamPos);
    camera.lookAt(currentLookAt);

    // 3. Balanced Warm/Cool Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x60a5fa, 0x1e293b, 0.88);
    hemiLight.position.set(0, 25, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff2d6, 2.35);
    keyLight.position.set(9, 16, 10);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    const d = 11.5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 38;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.95);
    rimLight.position.set(-10, 9, -9);
    scene.add(rimLight);

    // 4. Build Celestial Sanctuary Outdoor Environment
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const { animatedCrystals, crystalBaseMatrices } = buildSanctuaryEnvironment(
      scene,
      maxAnisotropy
    );

    // 5. Pooled InstancedMesh Particle Ring Buffer (140 particles, zero GC)
    const PARTICLE_CAPACITY = 140;
    const particleGeo = new THREE.OctahedronGeometry(0.18, 0);
    const particleMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });
    const particleMesh = new THREE.InstancedMesh(particleGeo, particleMat, PARTICLE_CAPACITY);
    particleMesh.frustumCulled = false;
    scene.add(particleMesh);

    const particlePool: ParticleSlot[] = Array.from({ length: PARTICLE_CAPACITY }, () => ({
      active: false,
      pos: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      life: 0,
      maxLife: 0.5,
      scale: 1,
      color: new THREE.Color(0xffffff),
    }));
    let particleHead = 0;

    const spawnParticles = (
      origin: THREE.Vector3,
      count: number,
      hexColor: number,
      speed: number = 4.2,
      scale: number = 1.0
    ) => {
      for (let i = 0; i < count; i++) {
        const slot = particlePool[particleHead];
        particleHead = (particleHead + 1) % PARTICLE_CAPACITY;
        slot.active = true;
        slot.pos.copy(origin);
        slot.pos.y += 0.9 + Math.random() * 0.5;
        const angle = Math.random() * Math.PI * 2;
        const spd = (0.4 + Math.random() * 0.8) * speed;
        slot.vel.set(Math.cos(angle) * spd, 2.2 + Math.random() * 3.5, Math.sin(angle) * spd);
        slot.life = 0;
        slot.maxLife = 0.35 + Math.random() * 0.28;
        slot.scale = scale * (0.75 + Math.random() * 0.65);
        slot.color.setHex(hexColor);
      }
    };

    // 6. Pooled 3D Skill VFX Meshes (Ground Shockwaves, Sky Pillars, Projectiles, Floating Text)
    const vfxRoot = new THREE.Group();
    scene.add(vfxRoot);

    // 6a. Ground Shockwave Rings (Flat horizontal rings at y = 0.06)
    const SHOCKWAVE_CAPACITY = 12;
    const shockwaveGeo = new THREE.RingGeometry(0.45, 0.88, 28);
    shockwaveGeo.rotateX(-Math.PI / 2);
    const shockwavePool: ShockwaveSlot[] = Array.from({ length: SHOCKWAVE_CAPACITY }, () => {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(shockwaveGeo, mat);
      mesh.visible = false;
      vfxRoot.add(mesh);
      return {
        active: false,
        mesh,
        mat,
        life: 0,
        maxLife: 0.5,
        maxScale: 3.5,
      };
    });
    let shockwaveHead = 0;

    const spawnShockwave = (
      pos: THREE.Vector3,
      hexColor: number,
      maxScale: number = 3.6,
      duration: number = 0.52
    ) => {
      const slot = shockwavePool[shockwaveHead];
      shockwaveHead = (shockwaveHead + 1) % SHOCKWAVE_CAPACITY;
      slot.active = true;
      slot.life = 0;
      slot.maxLife = duration;
      slot.maxScale = maxScale;
      slot.mat.color.setHex(hexColor);
      slot.mat.opacity = 0.92;
      slot.mesh.position.set(pos.x, 0.06, pos.z);
      slot.mesh.scale.set(0.2, 1, 0.2);
      slot.mesh.visible = true;
    };

    // 6b. Sky Pillars / Heaven Beams / Lightning Strikes
    const BEAM_CAPACITY = 10;
    const beamGeo = new THREE.CylinderGeometry(0.48, 0.72, 9.5, 16, 1, true);
    const beamPool: SkyBeamSlot[] = Array.from({ length: BEAM_CAPACITY }, () => {
      const mat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0,
        side: THREE.FrontSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(beamGeo, mat);
      mesh.visible = false;
      vfxRoot.add(mesh);
      return {
        active: false,
        mesh,
        mat,
        life: 0,
        maxLife: 0.48,
        maxRadius: 1.1,
      };
    });
    let beamHead = 0;

    const spawnSkyBeam = (
      pos: THREE.Vector3,
      hexColor: number,
      maxRadius: number = 1.1,
      duration: number = 0.48
    ) => {
      const slot = beamPool[beamHead];
      beamHead = (beamHead + 1) % BEAM_CAPACITY;
      slot.active = true;
      slot.life = 0;
      slot.maxLife = duration;
      slot.maxRadius = maxRadius;
      slot.mat.color.setHex(hexColor);
      slot.mat.opacity = 0.58;
      slot.mesh.position.set(pos.x, 4.75, pos.z);
      slot.mesh.scale.set(0.2, 1, 0.2);
      slot.mesh.visible = true;
    };

    // 6c. 3D Spell Projectiles & Crescent Sword Waves
    const PROJECTILE_CAPACITY = 16;
    const projGeo = new THREE.OctahedronGeometry(0.34, 1);
    const projectilePool: ProjectileSlot[] = Array.from({ length: PROJECTILE_CAPACITY }, () => {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(projGeo, mat);
      mesh.visible = false;
      vfxRoot.add(mesh);
      return {
        active: false,
        mesh,
        mat,
        startPos: new THREE.Vector3(),
        endPos: new THREE.Vector3(),
        life: 0,
        maxLife: 0.28,
        arcHeight: 1.2,
        colorHex: 0xfef08a,
      };
    });
    let projectileHead = 0;

    const spawnProjectile = (
      from: THREE.Vector3,
      to: THREE.Vector3,
      hexColor: number,
      duration: number = 0.26,
      arcHeight: number = 1.1,
      scale: number = 1.0
    ) => {
      const slot = projectilePool[projectileHead];
      projectileHead = (projectileHead + 1) % PROJECTILE_CAPACITY;
      slot.active = true;
      slot.life = 0;
      slot.maxLife = duration;
      slot.arcHeight = arcHeight;
      slot.colorHex = hexColor;
      slot.startPos.set(from.x, 1.35, from.z);
      slot.endPos.set(to.x, 1.15, to.z);
      slot.mat.color.setHex(hexColor);
      slot.mat.opacity = 0.95;
      slot.mesh.position.copy(slot.startPos);
      slot.mesh.scale.set(scale, scale * 0.7, scale * 1.6);
      slot.mesh.lookAt(slot.endPos);
      slot.mesh.visible = true;
    };

    // 6d. 3D Floating Skill Banners & Damage Callouts
    const FLOATING_TEXT_CAPACITY = 14;
    const floatingTextPool: FloatingCombatTextSlot[] = Array.from(
      { length: FLOATING_TEXT_CAPACITY },
      () => {
        const canvas = document.createElement('canvas');
        canvas.width = 384;
        canvas.height = 84;
        const ctx = canvas.getContext('2d');
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        const mat = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          opacity: 0,
          depthTest: false,
          depthWrite: false,
        });
        const sprite = new THREE.Sprite(mat);
        sprite.visible = false;
        sprite.renderOrder = 25;
        vfxRoot.add(sprite);
        return {
          active: false,
          sprite,
          canvas,
          ctx,
          texture,
          mat,
          life: 0,
          maxLife: 0.95,
          baseScaleX: 3.1,
          baseScaleY: 0.68,
        };
      }
    );
    let floatingTextHead = 0;

    const spawnFloatingCallout = (
      pos: THREE.Vector3,
      text: string,
      subText: string,
      hexColorStr: string,
      isUltimate: boolean = false
    ) => {
      const slot = floatingTextPool[floatingTextHead];
      floatingTextHead = (floatingTextHead + 1) % FLOATING_TEXT_CAPACITY;
      const { ctx, canvas } = slot;
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Pill badge background
      ctx.fillStyle = isUltimate ? 'rgba(15, 23, 42, 0.92)' : 'rgba(9, 13, 24, 0.85)';
      ctx.strokeStyle = hexColorStr;
      ctx.lineWidth = isUltimate ? 4 : 2.5;
      ctx.beginPath();
      ctx.roundRect(8, 8, canvas.width - 16, canvas.height - 16, 14);
      ctx.fill();
      ctx.stroke();

      // Main skill/damage text
      ctx.font = isUltimate
        ? '800 26px "Plus Jakarta Sans", sans-serif'
        : '700 22px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = isUltimate ? '#fef08a' : '#ffffff';
      ctx.fillText(text, canvas.width / 2, subText ? 38 : 50);

      if (subText) {
        ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = hexColorStr;
        ctx.fillText(subText, canvas.width / 2, 62);
      }

      slot.texture.needsUpdate = true;
      slot.active = true;
      slot.life = 0;
      slot.maxLife = isUltimate ? 1.25 : 0.85;
      slot.baseScaleX = isUltimate ? 3.5 : 2.65;
      slot.baseScaleY = isUltimate ? 0.78 : 0.58;
      slot.sprite.position.set(pos.x, isUltimate ? 3.6 : 2.9, pos.z);
      slot.sprite.scale.set(slot.baseScaleX, slot.baseScaleY, 1);
      slot.mat.opacity = 1;
      slot.sprite.visible = true;
    };

    // Actors container
    const actorsRoot = new THREE.Group();
    scene.add(actorsRoot);

    let actors: SimActor[] = [];
    let simElapsedSec = 0;
    let totalDamageDealt = 0;
    let hitstopTimer = 0;
    let cameraTrauma = 0;
    let outcomePending: 'none' | 'victory' | 'defeat' = 'none';
    let outcomeBeatTimer = 0;
    let lastHudSyncTime = 0;
    let concurrentEnemyAttackers = 0;
    let skillSeq = 1;

    // Build / Reset Wave Actors
    const setupWave = () => {
      while (actorsRoot.children.length > 0) {
        actorsRoot.remove(actorsRoot.children[0]);
      }
      actors = [];
      simElapsedSec = 0;
      totalDamageDealt = 0;
      hitstopTimer = 0;
      cameraTrauma = 0;
      outcomePending = 'none';
      outcomeBeatTimer = 0;

      const { deployedHeroes: allies, enemies: enemySpecs } = propsRef.current;
      const synergy = calculateFactionSynergyBonus(allies);
      const hpMult = 1 + synergy.hpBonusPct / 100;
      const atkMult = 1 + synergy.atkBonusPct / 100;

      // Spawn Allies
      allies.forEach((owned, idx) => {
        const slot = owned.slotIndex >= 0 && owned.slotIndex < 5 ? owned.slotIndex : idx % 5;
        const [sx, sz] = ALLY_SLOT_POSITIONS[slot];
        const tmpl = getHeroTemplate(owned.templateId);
        const stats = calculateHeroStats(tmpl, owned);
        const rig = buildCharacterRig(
          tmpl,
          false,
          false,
          'vanguard_shield',
          owned.level,
          owned.stars
        );
        rig.root.position.set(sx, 0, sz);
        rig.root.rotation.y = Math.PI / 2;
        actorsRoot.add(rig.root);

        const maxHp = Math.round(stats.maxHp * hpMult);
        actors.push({
          id: `ally_${owned.templateId}_${slot}`,
          template: tmpl,
          isEnemy: false,
          slotIndex: slot,
          policy: 'vanguard_shield',
          isBoss: false,
          maxHp,
          hp: maxHp,
          atk: Math.round(stats.atk * atkMult),
          def: stats.def,
          shield: 0,
          energy: 45, // Start with 45 tactical energy so Ultimates charge fast
          pos: new THREE.Vector3(sx, 0, sz),
          vel: new THREE.Vector3(),
          facingAngle: Math.PI / 2,
          walkDistance: 0,
          squashTime: 0,
          attackCooldown: 0.35 + idx * 0.1,
          activeSkillCooldown: 1.5 + idx * 0.65,
          attackPhase: 'idle',
          phaseTimer: 0,
          isHeavySkill: false,
          targetId: null,
          hitFlashTimer: 0,
          koTimer: 0,
          isDead: false,
          rig,
        });
      });

      // Spawn Enemies
      enemySpecs.forEach((spec, idx) => {
        const slot = spec.slotIndex >= 0 && spec.slotIndex < 5 ? spec.slotIndex : idx % 5;
        const [sx, sz] = ENEMY_SLOT_POSITIONS[slot];
        const tmpl = getHeroTemplate(spec.templateId);
        const fakeOwned: OwnedHero = {
          templateId: spec.templateId,
          level: spec.level,
          stars: spec.stars,
          shards: 0,
          gearTier: Math.max(1, Math.floor(spec.level / 5)),
          isDeployed: true,
          slotIndex: slot,
        };
        const stats = calculateHeroStats(tmpl, fakeOwned);
        const bossMult = spec.isBoss ? 1.45 : 1.0;
        const rig = buildCharacterRig(
          tmpl,
          true,
          Boolean(spec.isBoss),
          spec.policy,
          spec.level,
          spec.stars
        );
        rig.root.position.set(sx, 0, sz);
        rig.root.rotation.y = -Math.PI / 2;
        actorsRoot.add(rig.root);

        const maxHp = Math.round(stats.maxHp * bossMult);
        actors.push({
          id: `enemy_${idx}_${spec.templateId}`,
          template: tmpl,
          isEnemy: true,
          slotIndex: slot,
          policy: spec.policy,
          isBoss: Boolean(spec.isBoss),
          maxHp,
          hp: maxHp,
          atk: Math.round(stats.atk * (spec.isBoss ? 1.2 : 0.95)),
          def: stats.def,
          shield: 0,
          energy: 20,
          pos: new THREE.Vector3(sx, 0, sz),
          vel: new THREE.Vector3(),
          facingAngle: -Math.PI / 2,
          walkDistance: 0,
          squashTime: 0,
          attackCooldown: 0.6 + idx * 0.16,
          activeSkillCooldown: 2.8 + idx * 0.8,
          attackPhase: 'idle',
          phaseTimer: 0,
          isHeavySkill: false,
          targetId: null,
          hitFlashTimer: 0,
          koTimer: 0,
          isDead: false,
          rig,
        });
      });
    };

    // Execute Hero Active Tactical Skill (Skill 2) with custom 3D VFX
    const executeActorActiveSkill = (caster: SimActor, target: SimActor) => {
      if (caster.isDead) return;
      caster.activeSkillCooldown = caster.template.activeSkillCooldown || 5.0;
      caster.squashTime = 0.22;
      soundEngine.playTelegraphWindup();

      const accentHex = new THREE.Color(caster.template.accentColor).getHex();
      const primaryHex = new THREE.Color(caster.template.primaryColor).getHex();

      spawnShockwave(caster.pos, accentHex, 2.5, 0.42);
      spawnFloatingCallout(
        caster.pos,
        caster.template.activeSkillName,
        caster.template.name,
        caster.template.accentColor,
        false
      );

      if (!caster.isEnemy && propsRef.current.onSkillCast) {
        propsRef.current.onSkillCast({
          heroId: caster.template.id,
          heroName: caster.template.name,
          skillName: caster.template.activeSkillName,
          skillType: 'active',
          accentColor: caster.template.accentColor,
          seq: ++skillSeq,
        });
      }

      const alliesList = actors.filter((a) => a.isEnemy === caster.isEnemy && !a.isDead);

      if (caster.template.role === 'support' || caster.template.role === 'tank') {
        // Support / Tank tactical skill heals lowest HP ally + strikes target
        alliesList.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
        const needyAlly = alliesList[0] || caster;
        const healAmt = Math.round(needyAlly.maxHp * 0.16);
        needyAlly.hp = Math.min(needyAlly.maxHp, needyAlly.hp + healAmt);
        needyAlly.shield = Math.min(needyAlly.maxHp * 0.4, needyAlly.shield + Math.round(healAmt * 0.8));
        spawnSkyBeam(needyAlly.pos, accentHex, 0.9, 0.38);
        spawnParticles(needyAlly.pos, 12, accentHex, 4.0, 1.1);
      }

      // Launch 3D projectile / energy wave + sky beam on target
      spawnProjectile(caster.pos, target.pos, accentHex, 0.24, 1.3, 1.35);
      spawnSkyBeam(target.pos, primaryHex, 1.0, 0.36);
      spawnShockwave(target.pos, accentHex, 2.4, 0.4);
      const skillDmg = Math.round(caster.atk * 1.85);
      applyDamage(caster, target, skillDmg, true);
    };

    // Execute Hero Ultimate Skill (Skill 1) with Full-Screen 3D Spectacle VFX
    const executeActorUltimate = (caster: SimActor, forceCast: boolean = false) => {
      if (caster.isDead) return;
      if (!forceCast && caster.energy < 100) return;

      caster.energy = 0;
      caster.squashTime = 0.32;
      hitstopTimer = 0.065;
      cameraTrauma = Math.min(1.0, cameraTrauma + 0.62);
      soundEngine.playUltimateCast();

      const accentHex = new THREE.Color(caster.template.accentColor).getHex();
      const primaryHex = new THREE.Color(caster.template.primaryColor).getHex();

      // Caster aura explosion
      spawnShockwave(caster.pos, accentHex, 4.5, 0.6);
      spawnSkyBeam(caster.pos, accentHex, 1.5, 0.55);
      spawnParticles(caster.pos, 26, accentHex, 6.5, 1.45);
      spawnFloatingCallout(
        caster.pos,
        `★ ${caster.template.ultimateName.toUpperCase()} ★`,
        caster.template.name,
        caster.template.accentColor,
        true
      );

      if (!caster.isEnemy && propsRef.current.onSkillCast) {
        propsRef.current.onSkillCast({
          heroId: caster.template.id,
          heroName: caster.template.name,
          skillName: caster.template.ultimateName,
          skillType: 'ultimate',
          accentColor: caster.template.accentColor,
          seq: ++skillSeq,
        });
      }

      const enemiesList = actors.filter((a) => a.isEnemy !== caster.isEnemy && !a.isDead);
      const alliesList = actors.filter((a) => a.isEnemy === caster.isEnemy && !a.isDead);

      if (caster.template.ultimateType === 'team_heal_shield') {
        alliesList.forEach((ally) => {
          const healAmt = Math.round(ally.maxHp * 0.35);
          const shieldAmt = Math.round(ally.maxHp * 0.25);
          ally.hp = Math.min(ally.maxHp, ally.hp + healAmt);
          ally.shield = Math.min(ally.maxHp * 0.55, ally.shield + shieldAmt);
          ally.energy = Math.min(100, ally.energy + 25);
          spawnSkyBeam(ally.pos, accentHex, 1.15, 0.5);
          spawnShockwave(ally.pos, primaryHex, 2.8, 0.48);
          spawnParticles(ally.pos, 14, accentHex, 4.2, 1.15);
        });
        // Also deal holy/nature wave damage to enemies
        enemiesList.forEach((victim) => {
          const splashDmg = Math.round(caster.atk * 1.35);
          applyDamage(caster, victim, splashDmg, true);
        });
      } else if (
        caster.template.ultimateType === 'execution_dash' ||
        caster.template.ultimateType === 'single_nuke'
      ) {
        if (enemiesList.length > 0) {
          enemiesList.sort((a, b) => a.hp - b.hp);
          const victim = enemiesList[0];
          if (caster.template.ultimateType === 'execution_dash') {
            spawnProjectile(caster.pos, victim.pos, accentHex, 0.18, 0.4, 1.6);
            caster.pos.set(
              victim.pos.x + (caster.isEnemy ? 1.2 : -1.2),
              0,
              victim.pos.z
            );
          } else {
            spawnProjectile(caster.pos, victim.pos, accentHex, 0.22, 2.4, 1.7);
          }
          const rawDmg = Math.round(caster.atk * caster.template.ultimateMultiplier);
          applyDamage(caster, victim, rawDmg, true);
          spawnSkyBeam(victim.pos, accentHex, 1.65, 0.58);
          spawnShockwave(victim.pos, primaryHex, 3.8, 0.55);
          spawnParticles(victim.pos, 28, accentHex, 6.2, 1.5);
        }
      } else {
        // AoE Cataclysm across entire enemy team
        enemiesList.forEach((victim) => {
          spawnProjectile(caster.pos, victim.pos, accentHex, 0.25, 1.8, 1.4);
          spawnSkyBeam(victim.pos, accentHex, 1.35, 0.52);
          spawnShockwave(victim.pos, primaryHex, 3.2, 0.5);
          const rawDmg = Math.round(caster.atk * caster.template.ultimateMultiplier * 0.78);
          applyDamage(caster, victim, rawDmg, true);
          spawnParticles(victim.pos, 16, accentHex, 5.2, 1.3);
        });
      }
    };

    const applyDamage = (
      attacker: SimActor,
      defender: SimActor,
      rawDmg: number,
      isHeavy: boolean
    ) => {
      if (defender.isDead) return;
      const mitigation = 100 / (100 + defender.def * 0.55);
      // Critical strike chance
      const isCrit = isHeavy || Math.random() < 0.25;
      const critMult = isCrit ? 1.35 : 1.0;
      let finalDmg = Math.max(12, Math.round(rawDmg * mitigation * critMult));

      if (defender.shield > 0) {
        const absorbed = Math.min(defender.shield, finalDmg);
        defender.shield -= absorbed;
        finalDmg -= absorbed;
      }

      defender.hp = Math.max(0, defender.hp - finalDmg);
      defender.hitFlashTimer = 0.065;
      defender.energy = Math.min(100, defender.energy + 14);
      attacker.energy = Math.min(100, attacker.energy + (isHeavy ? 14 : 24));

      // Passive lifesteal for warriors & graveborn
      if (attacker.template.role === 'warrior' || attacker.template.faction === 'graveborn') {
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + Math.round(finalDmg * 0.18));
      }

      if (!attacker.isEnemy) {
        totalDamageDealt += finalDmg;
      }

      if (isHeavy) {
        hitstopTimer = Math.max(hitstopTimer, 0.04);
        cameraTrauma = Math.min(1.0, cameraTrauma + 0.35);
        const pushDir = defender.isEnemy ? 0.38 : -0.38;
        defender.pos.x = THREE.MathUtils.clamp(defender.pos.x + pushDir, -8.5, 8.5);
      }

      if (defender.hp <= 0 && defender.koTimer === 0) {
        defender.koTimer = 0.001;
        hitstopTimer = Math.max(hitstopTimer, 0.05);
        cameraTrauma = Math.min(1.0, cameraTrauma + 0.42);
        soundEngine.playHit(true);
        spawnShockwave(defender.pos, defender.isEnemy ? 0xef4444 : 0x38bdf8, 2.8, 0.45);
        spawnParticles(defender.pos, 22, defender.isEnemy ? 0xef4444 : 0x38bdf8, 5.4, 1.35);
      } else {
        soundEngine.playHit(isHeavy);
        spawnParticles(
          defender.pos,
          isHeavy ? 12 : 5,
          isHeavy ? 0xfbbf24 : 0xe2e8f0,
          3.4,
          0.95
        );
      }
    };

    rebuildWaveRef.current = setupWave;
    castUltSlotRef.current = (slotIndex: number, forceUltimate: boolean = true) => {
      if (slotIndex === -1) {
        // Combo All 5 Deployed Heroes!
        const aliveAllies = actors.filter((a) => !a.isEnemy && !a.isDead);
        aliveAllies.forEach((hero) => {
          executeActorUltimate(hero, true);
        });
        return;
      }
      const hero = actors.find((a) => !a.isEnemy && a.slotIndex === slotIndex && !a.isDead);
      if (hero) {
        executeActorUltimate(hero, forceUltimate);
      }
    };

    setupWave();

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    let frameId = 0;
    let lastTime = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const selectTargetForActor = (actor: SimActor, opponents: SimActor[]): SimActor | null => {
      if (opponents.length === 0) return null;
      if (actor.isEnemy && actor.policy === 'flanker_assassin') {
        const backliners = opponents.filter((o) => o.slotIndex >= 2);
        const pool = backliners.length > 0 ? backliners : opponents;
        return pool.reduce((best, cur) => (cur.hp < best.hp ? cur : best), pool[0]);
      }
      let nearest = opponents[0];
      let minDist = actor.pos.distanceToSquared(nearest.pos);
      for (let i = 1; i < opponents.length; i++) {
        const dSq = actor.pos.distanceToSquared(opponents[i].pos);
        if (dSq < minDist) {
          minDist = dSq;
          nearest = opponents[i];
        }
      }
      return nearest;
    };

    const tick = () => {
      const now = performance.now();
      const rawDt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const {
        gameState: curState,
        battleSpeed: speedMult,
        autoUltimate: isAutoUlt,
        cameraPreset: camMode,
        battleMode: curBattleMode,
      } = propsRef.current;

      // 1. Camera Rig Choreography
      const timeSec = now * 0.001;
      if (curState === 'title') {
        const orbitAngle = timeSec * 0.22;
        _desiredCamPos.set(
          Math.sin(orbitAngle) * 15.5,
          8.2 + Math.sin(timeSec * 0.4) * 1.1,
          Math.cos(orbitAngle) * 15.5
        );
        _desiredLookAt.set(0, 1.4, -1.2);
      } else if (camMode === 'cinematic') {
        _desiredCamPos.set(Math.sin(timeSec * 0.15) * 4.5, 7.2, 13.8);
        _desiredLookAt.set(0, 1.1, 0);
      } else if (camMode === 'overhead') {
        _desiredCamPos.set(0, 18.5, 8.5);
        _desiredLookAt.set(0, 0.4, -0.4);
      } else {
        _desiredCamPos.set(0, 11.8, 15.6);
        _desiredLookAt.set(0, 0.9, -0.6);
      }

      const dampAlpha = 1 - Math.exp(-5.5 * rawDt);
      currentCamPos.lerp(_desiredCamPos, dampAlpha);
      currentLookAt.lerp(_desiredLookAt, dampAlpha);

      camera.position.copy(currentCamPos);
      if (cameraTrauma > 0) {
        const shake = cameraTrauma * cameraTrauma * 0.38;
        camera.position.x += (Math.random() - 0.5) * shake;
        camera.position.y += (Math.random() - 0.5) * shake;
        cameraTrauma = Math.max(0, cameraTrauma - rawDt * 2.4);
      }
      camera.lookAt(currentLookAt);

      // Animate floating perimeter Aether crystals
      for (let i = 0; i < crystalBaseMatrices.length; i++) {
        _scratchMat4.copy(crystalBaseMatrices[i]);
        _scratchMat4.decompose(_scratchVecA, _scratchQuat, _scratchScale);
        _scratchVecA.y += Math.sin(timeSec * 1.8 + i * 0.7) * 0.22;
        _scratchEuler.set(0.2, timeSec * 0.8 + i * 0.5, 0.1);
        _scratchQuat.setFromEuler(_scratchEuler);
        _scratchMat4.compose(_scratchVecA, _scratchQuat, _scratchScale);
        animatedCrystals.setMatrixAt(i, _scratchMat4);
      }
      animatedCrystals.instanceMatrix.needsUpdate = true;

      // 2. Update Particles, Shockwaves, Sky Beams, Projectiles & Floating Callouts
      for (let i = 0; i < PARTICLE_CAPACITY; i++) {
        const p = particlePool[i];
        if (p.active) {
          p.life += rawDt;
          if (p.life >= p.maxLife) {
            p.active = false;
            _scratchMat4.makeScale(0, 0, 0);
            particleMesh.setMatrixAt(i, _scratchMat4);
          } else {
            p.vel.y -= 9.8 * rawDt;
            p.pos.addScaledVector(p.vel, rawDt);
            const s = p.scale * (1 - p.life / p.maxLife);
            _scratchMat4.makeTranslation(p.pos.x, Math.max(0.05, p.pos.y), p.pos.z);
            _scratchScale.set(s, s, s);
            _scratchMat4.scale(_scratchScale);
            particleMesh.setMatrixAt(i, _scratchMat4);
            particleMesh.setColorAt(i, p.color);
          }
        } else {
          _scratchMat4.makeScale(0, 0, 0);
          particleMesh.setMatrixAt(i, _scratchMat4);
        }
      }
      particleMesh.instanceMatrix.needsUpdate = true;
      if (particleMesh.instanceColor) particleMesh.instanceColor.needsUpdate = true;

      // Update Shockwaves
      for (const sw of shockwavePool) {
        if (!sw.active) continue;
        sw.life += rawDt;
        if (sw.life >= sw.maxLife) {
          sw.active = false;
          sw.mesh.visible = false;
        } else {
          const t = sw.life / sw.maxLife;
          const curScale = 0.25 + t * sw.maxScale;
          sw.mesh.scale.set(curScale, 1, curScale);
          sw.mat.opacity = (1 - t) * 0.88;
        }
      }

      // Update Sky Beams
      for (const bm of beamPool) {
        if (!bm.active) continue;
        bm.life += rawDt;
        if (bm.life >= bm.maxLife) {
          bm.active = false;
          bm.mesh.visible = false;
        } else {
          const t = bm.life / bm.maxLife;
          const r = bm.maxRadius * Math.sin(t * Math.PI);
          bm.mesh.scale.set(Math.max(0.08, r), 1, Math.max(0.08, r));
          bm.mat.opacity = (1 - t) * 0.45;
        }
      }

      // Update 3D Projectiles
      for (const pr of projectilePool) {
        if (!pr.active) continue;
        pr.life += rawDt;
        if (pr.life >= pr.maxLife) {
          pr.active = false;
          pr.mesh.visible = false;
        } else {
          const t = pr.life / pr.maxLife;
          pr.mesh.position.lerpVectors(pr.startPos, pr.endPos, t);
          pr.mesh.position.y += Math.sin(t * Math.PI) * pr.arcHeight;
          pr.mesh.rotation.z += rawDt * 12;
        }
      }

      // Update Floating Skill Callouts
      for (const ft of floatingTextPool) {
        if (!ft.active) continue;
        ft.life += rawDt;
        if (ft.life >= ft.maxLife) {
          ft.active = false;
          ft.sprite.visible = false;
        } else {
          const t = ft.life / ft.maxLife;
          ft.sprite.position.y += rawDt * 1.15;
          ft.mat.opacity = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
        }
      }

      // Update actor hit flashes
      for (const actor of actors) {
        if (actor.hitFlashTimer > 0) {
          actor.hitFlashTimer = Math.max(0, actor.hitFlashTimer - rawDt);
          const isFlashing = actor.hitFlashTimer > 0;
          actor.rig.hitFlashMaterials.forEach((mat, idx) => {
            mat.emissive.setHex(isFlashing ? 0xffffff : actor.rig.baseColors[idx]);
            mat.emissiveIntensity = isFlashing ? 0.9 : idx === 2 ? 0.28 : 0.0;
          });
        }
      }

      // 3. Advance Combat Simulation only in 'playing'
      if (curState === 'playing') {
        if (hitstopTimer > 0) {
          hitstopTimer = Math.max(0, hitstopTimer - rawDt);
        } else {
          const simDt = rawDt * speedMult;
          simElapsedSec += simDt;

          concurrentEnemyAttackers = actors.filter(
            (a) => a.isEnemy && !a.isDead && a.attackPhase !== 'idle'
          ).length;

          for (const actor of actors) {
            if (actor.isDead) continue;

            // Handle KO Topple Transition (0.42s)
            if (actor.koTimer > 0) {
              actor.koTimer += simDt;
              const progress = Math.min(1, actor.koTimer / 0.42);
              actor.rig.bodyGroup.rotation.x = -progress * (Math.PI / 2);
              actor.rig.bodyGroup.position.y = Math.max(0.05, 0.14 * (1 - progress));
              (actor.rig.telegraphRing.material as THREE.MeshBasicMaterial).opacity = 0;
              if (actor.koTimer >= 0.42) {
                actor.isDead = true;
                actor.rig.root.visible = false;
              }
              continue;
            }

            // Shield dome visual
            const domeMat = actor.rig.shieldDome.material as THREE.MeshBasicMaterial;
            domeMat.opacity = actor.shield > 0 ? 0.28 + Math.sin(timeSec * 5) * 0.08 : 0;

            // Squash & Stretch recovery
            if (actor.squashTime > 0) {
              actor.squashTime = Math.max(0, actor.squashTime - simDt);
              const s = 1 + Math.sin((actor.squashTime / 0.28) * Math.PI) * 0.22;
              actor.rig.bodyGroup.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s));
            } else {
              actor.rig.bodyGroup.scale.set(1, 1, 1);
            }

            // Auto-Ultimate check
            if (actor.energy >= 100) {
              if (!actor.isEnemy && isAutoUlt) {
                executeActorUltimate(actor, false);
                continue;
              } else if (actor.isEnemy) {
                executeActorUltimate(actor, false);
                continue;
              }
            }

            const opponents = actors.filter(
              (o) => o.isEnemy !== actor.isEnemy && !o.isDead && o.koTimer === 0
            );
            if (opponents.length === 0) continue;

            const target = selectTargetForActor(actor, opponents);
            if (!target) continue;

            // Tick Active Tactical Skill Cooldown (Skill 2)
            actor.activeSkillCooldown = Math.max(0, actor.activeSkillCooldown - simDt);
            if (actor.activeSkillCooldown <= 0 && actor.attackPhase === 'idle') {
              executeActorActiveSkill(actor, target);
              continue;
            }

            const dist = actor.pos.distanceTo(target.pos);
            _scratchVecA.subVectors(target.pos, actor.pos);
            const desiredAngle = Math.atan2(_scratchVecA.x, _scratchVecA.z);
            actor.facingAngle = desiredAngle;
            actor.rig.root.rotation.y = desiredAngle;

            // Attack State Machine
            if (actor.attackPhase !== 'idle') {
              actor.phaseTimer -= simDt;
              if (actor.attackPhase === 'windup') {
                actor.rig.weaponArm.rotation.x = -1.15;
                const teleMat = actor.rig.telegraphRing.material as THREE.MeshBasicMaterial;
                teleMat.opacity = actor.isHeavySkill ? 0.68 : 0.25;
                if (actor.phaseTimer <= 0) {
                  actor.attackPhase = 'active';
                  actor.phaseTimer = 0.14;
                  actor.rig.weaponArm.rotation.x = 0.85;
                  teleMat.opacity = 0;

                  // Launch ranged projectile if ranged attacker or heavy skill
                  const accentHex = new THREE.Color(actor.template.accentColor).getHex();
                  if (actor.template.attackRange > 3.0 || actor.isHeavySkill) {
                    spawnProjectile(
                      actor.pos,
                      target.pos,
                      accentHex,
                      0.2,
                      actor.template.attackRange > 3.0 ? 0.8 : 0.3,
                      actor.isHeavySkill ? 1.15 : 0.8
                    );
                  }

                  const mult = actor.isHeavySkill ? 1.65 : 1.0;
                  applyDamage(
                    actor,
                    target,
                    Math.round(actor.atk * mult),
                    actor.isHeavySkill
                  );

                  if (
                    actor.isEnemy &&
                    actor.policy === 'vanguard_shield' &&
                    actor.isHeavySkill
                  ) {
                    actor.shield = Math.min(
                      actor.maxHp * 0.35,
                      actor.shield + Math.round(actor.maxHp * 0.15)
                    );
                  }
                }
              } else if (actor.attackPhase === 'active') {
                if (actor.phaseTimer <= 0) {
                  actor.attackPhase = 'recovery';
                  actor.phaseTimer = 0.22;
                }
              } else if (actor.attackPhase === 'recovery') {
                actor.rig.weaponArm.rotation.x = THREE.MathUtils.lerp(
                  actor.rig.weaponArm.rotation.x,
                  0,
                  0.25
                );
                if (actor.phaseTimer <= 0) {
                  actor.attackPhase = 'idle';
                  actor.attackCooldown = Math.max(0.35, 1.0 / actor.template.atkSpeed);
                }
              }
              continue;
            }

            actor.attackCooldown = Math.max(0, actor.attackCooldown - simDt);

            let movedDistance = 0;
            if (
              actor.isEnemy &&
              actor.policy === 'arcane_kiter' &&
              dist < 3.1 &&
              actor.pos.x < 7.8
            ) {
              const kiteStep = actor.template.moveSpeed * 0.75 * simDt;
              actor.pos.x = Math.min(8.2, actor.pos.x + kiteStep);
              movedDistance = kiteStep;
            } else if (dist > actor.template.attackRange) {
              const spd =
                actor.isEnemy && actor.policy === 'flanker_assassin'
                  ? actor.template.moveSpeed * 1.35
                  : actor.template.moveSpeed;
              _scratchVecA.subVectors(target.pos, actor.pos).normalize();

              if (
                actor.isEnemy &&
                actor.policy === 'flanker_assassin' &&
                Math.abs(actor.pos.x - target.pos.x) > 2.5
              ) {
                _scratchVecA.z += actor.slotIndex % 2 === 0 ? -0.45 : 0.45;
                _scratchVecA.normalize();
              }

              const step = spd * simDt;
              actor.pos.addScaledVector(_scratchVecA, step);
              actor.pos.x = THREE.MathUtils.clamp(actor.pos.x, -8.4, 8.4);
              actor.pos.z = THREE.MathUtils.clamp(actor.pos.z, -5.2, 5.2);
              movedDistance = step;
            } else if (actor.attackCooldown <= 0) {
              if (!actor.isEnemy || concurrentEnemyAttackers < 3) {
                actor.attackPhase = 'windup';
                actor.isHeavySkill =
                  actor.isBoss ||
                  actor.policy === 'berserker_charger' ||
                  actor.energy >= 75;
                actor.phaseTimer = actor.isHeavySkill ? 0.34 : 0.2;
                if (actor.isEnemy) concurrentEnemyAttackers++;
                if (actor.isHeavySkill) {
                  soundEngine.playTelegraphWindup();
                }
              }
            }

            if (movedDistance > 0.0001) {
              actor.walkDistance += movedDistance * 4.5;
              actor.rig.bodyGroup.position.y =
                0.14 + Math.abs(Math.sin(actor.walkDistance)) * 0.12;
            } else {
              actor.rig.bodyGroup.position.y =
                0.14 + Math.sin(timeSec * 2.5 + actor.slotIndex) * 0.03;
            }

            actor.rig.root.position.copy(actor.pos);
          }

          // Check Victory / Defeat condition
          const aliveAllies = actors.filter((a) => !a.isEnemy && !a.isDead);
          const aliveEnemies = actors.filter((a) => a.isEnemy && !a.isDead);

          if (outcomePending === 'none') {
            if (aliveEnemies.length === 0) {
              outcomePending = 'victory';
              outcomeBeatTimer = 0.55;
            } else if (aliveAllies.length === 0) {
              outcomePending = 'defeat';
              outcomeBeatTimer = 0.55;
            }
          } else {
            outcomeBeatTimer -= rawDt;
            if (outcomeBeatTimer <= 0) {
              const didWin = outcomePending === 'victory';
              outcomePending = 'none';
              if (didWin) {
                soundEngine.playVictoryFanfare();
              } else {
                soundEngine.playDefeatSting();
              }

              const enemyMaxSum = actors
                .filter((a) => a.isEnemy)
                .reduce((acc, a) => acc + a.maxHp, 0);
              const enemyCurSum = actors
                .filter((a) => a.isEnemy)
                .reduce((acc, a) => acc + a.hp, 0);

              propsRef.current.onBattleOutcome({
                didWin,
                mode: curBattleMode,
                clearTimeSec: Math.max(1, Math.round(simElapsedSec)),
                totalDamageDealt: Math.round(totalDamageDealt),
                survivingAllies: aliveAllies.length,
                bossHpRemainingPct:
                  enemyMaxSum > 0 ? Math.round((enemyCurSum / enemyMaxSum) * 100) : 0,
              });
            }
          }
        }
      } else {
        for (const actor of actors) {
          if (!actor.isDead) {
            actor.rig.bodyGroup.position.y =
              0.14 + Math.sin(timeSec * 2.2 + actor.slotIndex) * 0.035;
          }
        }
      }

      // 4. Throttled HUD State Sync (<= 10Hz)
      if (now - lastHudSyncTime >= 110) {
        lastHudSyncTime = now;
        const hudUnits: LiveUnitHudState[] = actors
          .filter((a) => !a.isEnemy)
          .map((a) => ({
            id: a.id,
            templateId: a.template.id,
            name: a.template.name,
            slotIndex: a.slotIndex,
            hp: Math.round(a.hp),
            maxHp: Math.round(a.maxHp),
            energy: Math.round(a.energy),
            isAlive: !a.isDead && a.koTimer === 0,
            shield: Math.round(a.shield),
          }));

        const enemyMaxSum = actors
          .filter((a) => a.isEnemy)
          .reduce((acc, a) => acc + a.maxHp, 0);
        const enemyCurSum = actors
          .filter((a) => a.isEnemy)
          .reduce((acc, a) => acc + a.hp, 0);
        const enemyPct =
          enemyMaxSum > 0 ? Math.round((enemyCurSum / enemyMaxSum) * 100) : 0;

        propsRef.current.onHudSync(hudUnits, Math.round(simElapsedSec), enemyPct);
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      data-testid="battlefield-canvas-container"
      className="fixed inset-0 w-full h-full overflow-hidden z-0"
    />
  );
};
