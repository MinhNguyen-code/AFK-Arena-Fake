import * as THREE from 'three';
import { HeroTemplate, EnemyBehaviorPolicy, FACTION_INFO } from './rules';

export function createArenaFloorTextures(maxAnisotropy: number): {
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  ctx.fillStyle = '#1e2436';
  ctx.fillRect(0, 0, size, size);

  const tiles = 8;
  const step = size / tiles;
  for (let y = 0; y < tiles; y++) {
    for (let x = 0; x < tiles; x++) {
      const shade = 26 + ((x * 7 + y * 13) % 14);
      ctx.fillStyle = `rgb(${shade}, ${shade + 6}, ${shade + 18})`;
      ctx.fillRect(x * step + 2, y * step + 2, step - 4, step - 4);

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x * step + 3, y * step + 3, step - 6, step - 6);
    }
  }

  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.42)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.38, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.32)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.33, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    ctx.save();
    ctx.rotate(angle);
    ctx.fillStyle = 'rgba(212, 175, 55, 0.35)';
    ctx.fillRect(size * 0.335, -3, 16, 6);
    ctx.restore();
  }
  ctx.restore();

  const colorMap = new THREE.CanvasTexture(colorCanvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;
  colorMap.anisotropy = maxAnisotropy;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);
  for (let y = 0; y < tiles; y++) {
    for (let x = 0; x < tiles; x++) {
      bCtx.fillStyle = '#a8a8a8';
      bCtx.fillRect(x * step + 3, y * step + 3, step - 6, step - 6);
    }
  }

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.colorSpace = THREE.NoColorSpace;
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.anisotropy = maxAnisotropy;

  return { colorMap, bumpMap };
}

/**
 * Creates a crisp 3D Overhead Nameplate Sprite showing Character Name, Level, and Faction Accent
 */
export function createCharacterNameplateSprite(
  template: HeroTemplate,
  level: number,
  stars: number,
  isEnemy: boolean,
  isBoss: boolean
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dark obsidian nameplate backing with faction/team border
  const borderColor = isEnemy ? '#f43f5e' : FACTION_INFO[template.faction].color;
  ctx.fillStyle = 'rgba(9, 13, 24, 0.86)';
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 3.5;

  const rx = 12;
  const ry = 10;
  const rw = 360;
  const rh = 72;
  ctx.beginPath();
  ctx.roundRect(rx, ry, rw, rh, 10);
  ctx.fill();
  ctx.stroke();

  // Top line: Character Name + Stars
  ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = isEnemy ? '#fecdd3' : '#fef08a';
  const displayName = isBoss ? `★ TRÙM: ${template.name}` : template.name;
  ctx.fillText(displayName, 192, 42);

  // Bottom line: Level + Title / Role
  ctx.font = '600 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#cbd5e1';
  const starStr = '★'.repeat(Math.min(5, Math.max(1, stars)));
  ctx.fillText(`Lv.${level} ${starStr} · ${template.title}`, 192, 68);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(2.55, 0.64, 1);
  sprite.renderOrder = 20;
  return sprite;
}

export interface ActorRig3D {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  weaponArm: THREE.Group;
  offhandArm: THREE.Group;
  headMesh: THREE.Mesh;
  telegraphRing: THREE.Mesh;
  shieldDome: THREE.Mesh;
  hitFlashMaterials: THREE.MeshStandardMaterial[];
  baseColors: number[];
}

// Shared base geometries
const sharedShadowGeo = new THREE.CircleGeometry(0.95, 20);
sharedShadowGeo.rotateX(-Math.PI / 2);

const sharedTelegraphGeo = new THREE.RingGeometry(0.85, 1.18, 24);
sharedTelegraphGeo.rotateX(-Math.PI / 2);

const sharedPlinthGeo = new THREE.CylinderGeometry(0.68, 0.78, 0.14, 16);
const sharedTorsoGeo = new THREE.CylinderGeometry(0.36, 0.44, 0.88, 12);
const sharedBeltGeo = new THREE.CylinderGeometry(0.45, 0.46, 0.14, 12);
const sharedCapeGeo = new THREE.BoxGeometry(0.64, 1.05, 0.07);
const sharedHeadGeo = new THREE.SphereGeometry(0.28, 14, 12);
const sharedEyeGeo = new THREE.BoxGeometry(0.08, 0.045, 0.05);
const sharedPauldronGeo = new THREE.SphereGeometry(0.22, 10, 10);
const sharedLegGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.55, 8);
const sharedShieldDomeGeo = new THREE.SphereGeometry(1.15, 16, 12);

/**
 * Builds a bespoke 10-14 part 3D character rig tailored to each hero's unique
 * `modelArchetype` and `id`, plus an overhead floating nameplate showing their name & title.
 */
export function buildCharacterRig(
  template: HeroTemplate,
  isEnemy: boolean,
  isBoss: boolean = false,
  policy?: EnemyBehaviorPolicy,
  level: number = 5,
  stars: number = 2
): ActorRig3D {
  const root = new THREE.Group();
  const scale = isBoss ? 1.35 : 1.0;
  root.scale.set(scale, scale, scale);

  const hitFlashMaterials: THREE.MeshStandardMaterial[] = [];
  const baseColors: number[] = [];

  const registerMat = (mat: THREE.MeshStandardMaterial) => {
    hitFlashMaterials.push(mat);
    baseColors.push(mat.emissive.getHex());
    return mat;
  };

  // 1. Soft radial contact shadow disc at y = 0.015
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x05070c,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  const shadowMesh = new THREE.Mesh(sharedShadowGeo, shadowMat);
  shadowMesh.position.y = 0.015;
  root.add(shadowMesh);

  // 2. Tactical Faction Plinth + Inner Runic Ring
  const plinthColor = isEnemy ? 0x7f1d1d : 0x1e3a8a;
  const plinthMat = new THREE.MeshStandardMaterial({
    color: plinthColor,
    roughness: 0.65,
    metalness: 0.35,
  });
  const plinthMesh = new THREE.Mesh(sharedPlinthGeo, plinthMat);
  plinthMesh.position.y = 0.07;
  plinthMesh.receiveShadow = true;
  root.add(plinthMesh);

  // 3. Telegraph Windup Ring
  const telegraphMat = new THREE.MeshBasicMaterial({
    color: isEnemy ? 0xef4444 : 0x38bdf8,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const telegraphRing = new THREE.Mesh(sharedTelegraphGeo, telegraphMat);
  telegraphRing.position.y = 0.035;
  root.add(telegraphRing);

  // Body container for walk cycle and squash-and-stretch
  const bodyGroup = new THREE.Group();
  bodyGroup.position.y = 0.14;
  root.add(bodyGroup);

  const primaryHex = new THREE.Color(template.primaryColor).getHex();
  const secondaryHex = new THREE.Color(template.secondaryColor).getHex();
  const accentHex = new THREE.Color(template.accentColor).getHex();

  const armorMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: primaryHex,
      roughness: 0.25,
      metalness: 0.78,
    })
  );
  const clothMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: secondaryHex,
      roughness: 0.78,
      metalness: 0.12,
    })
  );
  const accentMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: accentHex,
      emissive: accentHex,
      emissiveIntensity: 0.35,
      roughness: 0.16,
      metalness: 0.85,
    })
  );
  const skinColor =
    template.faction === 'graveborn'
      ? 0xc4b5fd
      : template.faction === 'hypogean'
      ? 0xfda4af
      : template.modelArchetype === 'treant_colossus'
      ? 0x78350f
      : 0xfde68a;

  const skinMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.62,
      metalness: 0.08,
    })
  );

  // Legs / Greaves
  const leftLeg = new THREE.Mesh(sharedLegGeo, clothMat);
  leftLeg.position.set(-0.16, 0.27, 0);
  leftLeg.castShadow = true;
  bodyGroup.add(leftLeg);

  const rightLeg = new THREE.Mesh(sharedLegGeo, clothMat);
  rightLeg.position.set(0.16, 0.27, 0);
  rightLeg.castShadow = true;
  bodyGroup.add(rightLeg);

  // Torso & Waist Belt
  const torso = new THREE.Mesh(sharedTorsoGeo, armorMat);
  torso.position.set(0, 0.92, 0);
  if (template.modelArchetype === 'treant_colossus' || template.modelArchetype === 'thunder_forgelord') {
    torso.scale.set(1.22, 1.05, 1.18);
  }
  torso.castShadow = true;
  torso.receiveShadow = true;
  bodyGroup.add(torso);

  const belt = new THREE.Mesh(sharedBeltGeo, accentMat);
  belt.position.set(0, 0.56, 0);
  bodyGroup.add(belt);

  // Flowing Battle Cape
  const cape = new THREE.Mesh(sharedCapeGeo, clothMat);
  cape.position.set(0, 0.88, -0.34);
  cape.rotation.x = 0.18;
  cape.castShadow = true;
  bodyGroup.add(cape);

  // Shoulder Pauldrons
  const leftPauldron = new THREE.Mesh(sharedPauldronGeo, armorMat);
  leftPauldron.position.set(-0.46, 1.26, 0);
  leftPauldron.scale.set(1.15, 0.88, 1.15);
  bodyGroup.add(leftPauldron);

  const rightPauldron = new THREE.Mesh(sharedPauldronGeo, armorMat);
  rightPauldron.position.set(0.46, 1.26, 0);
  rightPauldron.scale.set(1.15, 0.88, 1.15);
  bodyGroup.add(rightPauldron);

  // Head + Glowing Eyes
  const headMesh = new THREE.Mesh(sharedHeadGeo, skinMat);
  headMesh.position.set(0, 1.62, 0);
  headMesh.castShadow = true;
  bodyGroup.add(headMesh);

  const leftEye = new THREE.Mesh(sharedEyeGeo, accentMat);
  leftEye.position.set(-0.09, 0.04, 0.25);
  headMesh.add(leftEye);

  const rightEye = new THREE.Mesh(sharedEyeGeo, accentMat);
  rightEye.position.set(0.09, 0.04, 0.25);
  headMesh.add(rightEye);

  // Weapon & Offhand Arms
  const weaponArm = new THREE.Group();
  weaponArm.position.set(0.48, 1.2, 0);
  bodyGroup.add(weaponArm);

  const offhandArm = new THREE.Group();
  offhandArm.position.set(-0.48, 1.2, 0);
  bodyGroup.add(offhandArm);

  // ============================================================================
  // BESPOKE 16-CHARACTER ARCHETYPE GEOMETRIES (Headgear, Wings/Back, Weapons)
  // ============================================================================
  const arch = template.modelArchetype;

  if (arch === 'paladin_wingshield') {
    // Aldric: Winged Paladin Greathelm + Sunblade + Lion Tower Shield
    const wingGeo = new THREE.BoxGeometry(0.06, 0.36, 0.22);
    const leftWing = new THREE.Mesh(wingGeo, accentMat);
    leftWing.position.set(-0.28, 0.18, 0);
    leftWing.rotation.z = 0.3;
    headMesh.add(leftWing);
    const rightWing = new THREE.Mesh(wingGeo, accentMat);
    rightWing.position.set(0.28, 0.18, 0);
    rightWing.rotation.z = -0.3;
    headMesh.add(rightWing);

    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.25, 0.22), accentMat);
    blade.position.set(0, 0.45, 0.36);
    blade.rotation.x = Math.PI / 4;
    weaponArm.add(blade);

    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.2, 0.82), armorMat);
    shield.position.set(-0.14, -0.1, 0.4);
    shield.rotation.y = 0.35;
    offhandArm.add(shield);
  } else if (arch === 'duelist_twinblade') {
    // Vaelen: Cavalier Plume Visor + Twin Rapier & Parrying Blade
    const plume = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.55, 8), accentMat);
    plume.position.set(0.12, 0.3, -0.12);
    plume.rotation.x = -0.45;
    headMesh.add(plume);

    const rapierGeo = new THREE.CylinderGeometry(0.02, 0.06, 1.35, 8);
    const mainRapier = new THREE.Mesh(rapierGeo, accentMat);
    mainRapier.position.set(0, 0.4, 0.42);
    mainRapier.rotation.x = Math.PI / 3;
    weaponArm.add(mainRapier);

    const offDagger = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.05, 0.85, 8), armorMat);
    offDagger.position.set(0, 0.2, 0.38);
    offDagger.rotation.x = Math.PI / 3;
    offhandArm.add(offDagger);
  } else if (arch === 'archmage_sunhalo') {
    // Seraphina: Sunburst Tiara + Floating Solar Halo + Prism Staff
    const sunHalo = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.05, 8, 24), accentMat);
    sunHalo.position.set(0, 0.28, -0.14);
    headMesh.add(sunHalo);

    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 1.7, 8), armorMat);
    staff.position.set(0, 0.22, 0.32);
    staff.rotation.x = 0.2;
    weaponArm.add(staff);

    const sunOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.26, 0), accentMat);
    sunOrb.position.set(0, 1.12, 0.48);
    weaponArm.add(sunOrb);
  } else if (arch === 'windranger_antlerbow') {
    // Sylphie: Emerald Stag Antlers + Back Quiver + Recurve Elven Bow
    const antlerGeo = new THREE.CylinderGeometry(0.025, 0.05, 0.52, 6);
    const leftAntler = new THREE.Mesh(antlerGeo, accentMat);
    leftAntler.position.set(-0.2, 0.32, 0);
    leftAntler.rotation.z = 0.42;
    headMesh.add(leftAntler);
    const rightAntler = new THREE.Mesh(antlerGeo, accentMat);
    rightAntler.position.set(0.2, 0.32, 0);
    rightAntler.rotation.z = -0.42;
    headMesh.add(rightAntler);

    const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.65, 8), clothMat);
    quiver.position.set(0.18, 1.15, -0.32);
    quiver.rotation.z = -0.25;
    bodyGroup.add(quiver);

    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.05, 8, 18, Math.PI), accentMat);
    bow.position.set(0, 0, 0.46);
    bow.rotation.y = Math.PI / 2;
    offhandArm.add(bow);
  } else if (arch === 'phoenix_seraph') {
    // Aurelia: Four Radiant Phoenix Wings + Flame Crown + Nirvana Scepter
    const wingBladeGeo = new THREE.BoxGeometry(0.85, 0.22, 0.05);
    for (let w = 0; w < 4; w++) {
      const side = w % 2 === 0 ? -1 : 1;
      const row = Math.floor(w / 2);
      const wing = new THREE.Mesh(wingBladeGeo, accentMat);
      wing.position.set(side * 0.52, 1.25 - row * 0.26, -0.32);
      wing.rotation.z = side * (0.35 - row * 0.22);
      wing.rotation.y = side * -0.25;
      bodyGroup.add(wing);
    }
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.38, 5), accentMat);
    crown.position.set(0, 0.3, 0.05);
    headMesh.add(crown);

    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 1.65, 8), armorMat);
    staff.position.set(0, 0.2, 0.32);
    weaponArm.add(staff);
    const phoenixGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), accentMat);
    phoenixGem.position.set(0, 1.05, 0.32);
    weaponArm.add(phoenixGem);
  } else if (arch === 'lion_berserker') {
    // Kraghor: Lion Mane Spiked Crest + Colossal Double-Bit Greataxe
    const mane = new THREE.Mesh(new THREE.DodecahedronGeometry(0.36, 0), clothMat);
    mane.position.set(0, 0.06, -0.08);
    headMesh.add(mane);

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.55, 8), clothMat);
    shaft.position.set(0, 0.38, 0.35);
    shaft.rotation.x = Math.PI / 3;
    weaponArm.add(shaft);

    const axeBlade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.72, 0.62), accentMat);
    axeBlade.position.set(0, 0.75, 0.68);
    weaponArm.add(axeBlade);
  } else if (arch === 'necro_scythequeen') {
    // Morrigan: Dark Horned Crown + Crescent Soul-Reaper Scythe + Spectral Orbs
    const hornGeo = new THREE.ConeGeometry(0.08, 0.44, 6);
    const lHorn = new THREE.Mesh(hornGeo, accentMat);
    lHorn.position.set(-0.18, 0.3, 0);
    lHorn.rotation.z = 0.28;
    headMesh.add(lHorn);
    const rHorn = new THREE.Mesh(hornGeo, accentMat);
    rHorn.position.set(0.18, 0.3, 0);
    rHorn.rotation.z = -0.28;
    headMesh.add(rHorn);

    const scythePole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.75, 8), clothMat);
    scythePole.position.set(0, 0.3, 0.3);
    scythePole.rotation.x = 0.25;
    weaponArm.add(scythePole);

    const scytheBlade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.85), accentMat);
    scytheBlade.position.set(0, 1.1, 0.65);
    weaponArm.add(scytheBlade);
  } else if (arch === 'valkyrie_sixwings') {
    // Celestia: Six Angelic Blade-Wings + Twin Celestial Spears
    const wingGeo = new THREE.BoxGeometry(0.95, 0.16, 0.05);
    for (let w = 0; w < 6; w++) {
      const side = w % 2 === 0 ? -1 : 1;
      const tier = Math.floor(w / 2);
      const wing = new THREE.Mesh(wingGeo, accentMat);
      wing.position.set(side * 0.56, 1.38 - tier * 0.24, -0.32);
      wing.rotation.z = side * (0.45 - tier * 0.25);
      bodyGroup.add(wing);
    }
    const spearGeo = new THREE.ConeGeometry(0.12, 1.45, 6);
    const rSpear = new THREE.Mesh(spearGeo, accentMat);
    rSpear.position.set(0, 0.42, 0.45);
    rSpear.rotation.x = Math.PI / 2.5;
    weaponArm.add(rSpear);
    const lSpear = new THREE.Mesh(spearGeo, armorMat);
    lSpear.position.set(0, 0.35, 0.42);
    lSpear.rotation.x = Math.PI / 2.5;
    offhandArm.add(lSpear);
  } else if (arch === 'undead_dreadking') {
    // Malakor: Jagged Dread Crown + Cursed Runeblade + Coffin Greatshield
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.26, 7), accentMat);
    crown.position.set(0, 0.28, 0);
    headMesh.add(crown);

    const greatsword = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.4, 0.28), accentMat);
    greatsword.position.set(0, 0.5, 0.38);
    greatsword.rotation.x = Math.PI / 4;
    weaponArm.add(greatsword);

    const coffinShield = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.25, 0.65), clothMat);
    coffinShield.position.set(-0.14, -0.05, 0.38);
    offhandArm.add(coffinShield);
  } else if (arch === 'fae_butterfly') {
    // Elowen: Iridescent Butterfly Wings + Starlight Wand
    const upperWingGeo = new THREE.CircleGeometry(0.52, 6);
    const lWing = new THREE.Mesh(upperWingGeo, accentMat);
    lWing.position.set(-0.42, 1.18, -0.32);
    lWing.rotation.y = 0.35;
    bodyGroup.add(lWing);
    const rWing = new THREE.Mesh(upperWingGeo, accentMat);
    rWing.position.set(0.42, 1.18, -0.32);
    rWing.rotation.y = -0.35;
    bodyGroup.add(rWing);

    const wand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8), armorMat);
    wand.position.set(0, 0.25, 0.35);
    wand.rotation.x = Math.PI / 4;
    weaponArm.add(wand);
  } else if (arch === 'pyro_dragonlord') {
    // Ignis: Dragon Horns + Floating Magma Chakram Ring + Dragonfire Staff
    const chakram = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.06, 8, 20), accentMat);
    chakram.position.set(0, 1.15, -0.38);
    bodyGroup.add(chakram);

    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 1.65, 8), armorMat);
    staff.position.set(0, 0.25, 0.35);
    weaponArm.add(staff);
    const dragonHead = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), accentMat);
    dragonHead.position.set(0, 1.08, 0.35);
    weaponArm.add(dragonHead);
  } else if (arch === 'shadow_onikata') {
    // Kael: Oni Demon Mask Horns + Dual Crimson Katana Warglaives
    const maskVisor = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.22, 0.28), clothMat);
    maskVisor.position.set(0, -0.02, 0.14);
    headMesh.add(maskVisor);

    const katanaGeo = new THREE.BoxGeometry(0.06, 1.25, 0.14);
    const rKatana = new THREE.Mesh(katanaGeo, accentMat);
    rKatana.position.set(0, 0.42, 0.42);
    rKatana.rotation.x = Math.PI / 3;
    weaponArm.add(rKatana);

    const lKatana = new THREE.Mesh(katanaGeo, accentMat);
    lKatana.position.set(0, 0.42, 0.42);
    lKatana.rotation.x = Math.PI / 3;
    offhandArm.add(lKatana);
  } else if (arch === 'treant_colossus') {
    // Thorne: Living Crystal Branches + Mossy Stone Mauler Hammer & Root Shield
    const branchGeo = new THREE.ConeGeometry(0.14, 0.65, 5);
    const lBranch = new THREE.Mesh(branchGeo, accentMat);
    lBranch.position.set(-0.24, 0.35, 0);
    lBranch.rotation.z = 0.35;
    headMesh.add(lBranch);
    const rBranch = new THREE.Mesh(branchGeo, accentMat);
    rBranch.position.set(0.24, 0.35, 0);
    rBranch.rotation.z = -0.35;
    headMesh.add(rBranch);

    const hammerHead = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.72), armorMat);
    hammerHead.position.set(0, 0.55, 0.52);
    weaponArm.add(hammerHead);

    const rootShield = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.48, 0.16, 8), clothMat);
    rootShield.rotation.z = Math.PI / 2;
    rootShield.position.set(-0.15, 0, 0.42);
    offhandArm.add(rootShield);
  } else if (arch === 'void_archfiend') {
    // Nyx: Curved Abyssal Horns + Void Trident + Floating Abyssal Halo
    const voidRing = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.055, 8, 16), accentMat);
    voidRing.position.set(0, 1.22, -0.35);
    bodyGroup.add(voidRing);

    const tridentShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.75, 8), clothMat);
    tridentShaft.position.set(0, 0.3, 0.36);
    tridentShaft.rotation.x = 0.3;
    weaponArm.add(tridentShaft);

    const prong = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.55, 4), accentMat);
    prong.position.set(0, 1.1, 0.6);
    weaponArm.add(prong);
  } else if (arch === 'frost_empress') {
    // Freya: Crystalline Ice Crown + Frost Crystal Greatspear
    const iceCrown = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), accentMat);
    iceCrown.position.set(0, 0.32, 0.05);
    iceCrown.scale.set(1.2, 1.5, 0.6);
    headMesh.add(iceCrown);

    const frostSpear = new THREE.Mesh(new THREE.ConeGeometry(0.14, 1.65, 6), accentMat);
    frostSpear.position.set(0, 0.48, 0.48);
    frostSpear.rotation.x = Math.PI / 2.6;
    weaponArm.add(frostSpear);
  } else {
    // Ornn (thunder_forgelord): Dwarven Horned Helm + Braided Beard + Thunder Forge Hammer
    const beard = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.48, 6), accentMat);
    beard.position.set(0, -0.22, 0.18);
    beard.rotation.x = Math.PI;
    headMesh.add(beard);

    const forgeHammer = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.42, 0.78), accentMat);
    forgeHammer.position.set(0, 0.48, 0.48);
    weaponArm.add(forgeHammer);

    const anvilBuckler = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.85, 0.68), armorMat);
    anvilBuckler.position.set(-0.12, 0, 0.38);
    offhandArm.add(anvilBuckler);
  }

  // Active Shield Dome
  const shieldDomeMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.0,
    wireframe: true,
    depthWrite: false,
  });
  const shieldDome = new THREE.Mesh(sharedShieldDomeGeo, shieldDomeMat);
  shieldDome.position.y = 1.0;
  root.add(shieldDome);

  // 4. Overhead Floating Character Nameplate Sprite (Name + Level + Title)
  const nameplateSprite = createCharacterNameplateSprite(
    template,
    level,
    stars,
    isEnemy,
    isBoss
  );
  nameplateSprite.position.set(0, 2.58, 0);
  root.add(nameplateSprite);

  return {
    root,
    bodyGroup,
    weaponArm,
    offhandArm,
    headMesh,
    telegraphRing,
    shieldDome,
    hitFlashMaterials,
    baseColors,
  };
}

export function buildSanctuaryEnvironment(
  scene: THREE.Scene,
  maxAnisotropy: number
): { animatedCrystals: THREE.InstancedMesh; crystalBaseMatrices: THREE.Matrix4[] } {
  const { colorMap, bumpMap } = createArenaFloorTextures(maxAnisotropy);
  colorMap.repeat.set(3, 2);
  bumpMap.repeat.set(3, 2);

  // 1. Tactical Arena Platform (y = 0)
  const arenaGeo = new THREE.BoxGeometry(19.5, 0.8, 12.8);
  const arenaMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: colorMap,
    bumpMap: bumpMap,
    bumpScale: 0.04,
    roughness: 0.55,
    metalness: 0.2,
  });
  const arenaMesh = new THREE.Mesh(arenaGeo, arenaMat);
  arenaMesh.position.set(0, -0.4, 0);
  arenaMesh.receiveShadow = true;
  scene.add(arenaMesh);

  // Flat Golden Border Trim Rails around Arena Platform (flush at y = 0.03)
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.25,
    metalness: 0.85,
  });
  const longRailGeo = new THREE.BoxGeometry(19.2, 0.06, 0.22);
  const northRail = new THREE.Mesh(longRailGeo, trimMat);
  northRail.position.set(0, 0.03, -6.2);
  scene.add(northRail);

  const southRail = new THREE.Mesh(longRailGeo, trimMat);
  southRail.position.set(0, 0.03, 6.2);
  scene.add(southRail);

  const shortRailGeo = new THREE.BoxGeometry(0.22, 0.06, 12.6);
  const westRail = new THREE.Mesh(shortRailGeo, trimMat);
  westRail.position.set(-9.5, 0.03, 0);
  scene.add(westRail);

  const eastRail = new THREE.Mesh(shortRailGeo, trimMat);
  eastRail.position.set(9.5, 0.03, 0);
  scene.add(eastRail);

  // 2. Extended Outdoor Sanctuary Terrain
  const terrainGeo = new THREE.CylinderGeometry(42, 28, 6, 24);
  const terrainMat = new THREE.MeshStandardMaterial({
    color: 0x17253b,
    roughness: 0.88,
    metalness: 0.08,
  });
  const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
  terrainMesh.position.set(0, -3.55, 0);
  terrainMesh.receiveShadow = true;
  scene.add(terrainMesh);

  // 3. Tall Silhouette Landmark in Spawn Vista: Grand Celestial Sanctuary Archway
  const archGroup = new THREE.Group();
  archGroup.position.set(0, 0, -9.2);

  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.72,
    metalness: 0.18,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.22,
    metalness: 0.88,
  });
  const portalGlowMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.85,
    roughness: 0.15,
    metalness: 0.5,
  });

  const pillarGeo = new THREE.CylinderGeometry(0.65, 0.82, 6.2, 12);
  const leftArchPillar = new THREE.Mesh(pillarGeo, stoneMat);
  leftArchPillar.position.set(-3.4, 3.1, 0);
  leftArchPillar.castShadow = true;
  archGroup.add(leftArchPillar);

  const rightArchPillar = new THREE.Mesh(pillarGeo, stoneMat);
  rightArchPillar.position.set(3.4, 3.1, 0);
  rightArchPillar.castShadow = true;
  archGroup.add(rightArchPillar);

  const lintelGeo = new THREE.BoxGeometry(8.6, 1.1, 1.5);
  const lintel = new THREE.Mesh(lintelGeo, stoneMat);
  lintel.position.set(0, 6.3, 0);
  lintel.castShadow = true;
  archGroup.add(lintel);

  const spireGeo = new THREE.OctahedronGeometry(1.15, 0);
  const centralSpire = new THREE.Mesh(spireGeo, goldMat);
  centralSpire.position.set(0, 7.8, 0);
  centralSpire.scale.set(0.8, 1.6, 0.8);
  archGroup.add(centralSpire);

  const runeRingGeo = new THREE.TorusGeometry(2.1, 0.12, 10, 32);
  const runeRing = new THREE.Mesh(runeRingGeo, portalGlowMat);
  runeRing.position.set(0, 3.6, 0);
  archGroup.add(runeRing);

  scene.add(archGroup);

  // 4. Six Composite Sanctuary Columns with Golden Braziers
  const columnPositions = [
    [-9.2, -5.8],
    [-4.6, -6.4],
    [4.6, -6.4],
    [9.2, -5.8],
    [-9.6, 4.8],
    [9.6, 4.8],
  ];

  const colBaseGeo = new THREE.BoxGeometry(1.3, 0.5, 1.3);
  const colShaftGeo = new THREE.CylinderGeometry(0.42, 0.5, 3.6, 10);
  const brazierGeo = new THREE.OctahedronGeometry(0.45, 0);

  columnPositions.forEach(([x, z]) => {
    const colGroup = new THREE.Group();
    colGroup.position.set(x, 0, z);

    const base = new THREE.Mesh(colBaseGeo, stoneMat);
    base.position.y = 0.25;
    colGroup.add(base);

    const shaft = new THREE.Mesh(colShaftGeo, stoneMat);
    shaft.position.y = 2.25;
    shaft.castShadow = true;
    colGroup.add(shaft);

    const cap = new THREE.Mesh(colBaseGeo, goldMat);
    cap.scale.set(0.9, 0.6, 0.9);
    cap.position.y = 4.15;
    colGroup.add(cap);

    const flame = new THREE.Mesh(brazierGeo, portalGlowMat);
    flame.position.y = 4.75;
    colGroup.add(flame);

    scene.add(colGroup);
  });

  // 5. InstancedMesh Cypress/Pine Trees around the outdoor perimeter
  const treeCount = 28;
  const foliageGeo = new THREE.ConeGeometry(1.15, 3.8, 7);
  const foliageMat = new THREE.MeshStandardMaterial({
    color: 0x1e3f35,
    roughness: 0.82,
    metalness: 0.05,
  });
  const instancedTrees = new THREE.InstancedMesh(foliageGeo, foliageMat, treeCount);
  const dummy = new THREE.Object3D();
  const colorVar = new THREE.Color();

  for (let i = 0; i < treeCount; i++) {
    const angle = (i / treeCount) * Math.PI * 2;
    const radius = 14.5 + (i % 3) * 3.2;
    const tx = Math.cos(angle) * radius * 1.15;
    const tz = Math.sin(angle) * radius * 0.85 - 1.5;
    const s = 0.85 + ((i * 17) % 30) / 100;

    dummy.position.set(tx, 1.9 * s - 0.4, tz);
    dummy.scale.set(s, s * (0.9 + (i % 4) * 0.12), s);
    dummy.rotation.y = i * 1.1;
    dummy.updateMatrix();
    instancedTrees.setMatrixAt(i, dummy.matrix);

    colorVar.setHSL(0.44 + (i % 5) * 0.015, 0.42, 0.18 + (i % 4) * 0.03);
    instancedTrees.setColorAt(i, colorVar);
  }
  instancedTrees.instanceMatrix.needsUpdate = true;
  if (instancedTrees.instanceColor) instancedTrees.instanceColor.needsUpdate = true;
  instancedTrees.computeBoundingSphere();
  scene.add(instancedTrees);

  // 6. InstancedMesh Floating Aether Crystals
  const crystalCount = 24;
  const crystalGeo = new THREE.OctahedronGeometry(0.42, 0);
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.55,
    roughness: 0.15,
    metalness: 0.85,
  });
  const animatedCrystals = new THREE.InstancedMesh(crystalGeo, crystalMat, crystalCount);
  animatedCrystals.frustumCulled = false;
  const crystalBaseMatrices: THREE.Matrix4[] = [];

  for (let i = 0; i < crystalCount; i++) {
    const angle = (i / crystalCount) * Math.PI * 2;
    const radius = 11.2 + (i % 2) * 2.4;
    dummy.position.set(
      Math.cos(angle) * radius * 1.15,
      1.6 + (i % 4) * 0.65,
      Math.sin(angle) * radius * 0.8 - 1.0
    );
    dummy.scale.set(0.7, 1.45, 0.7);
    dummy.rotation.set(0.2, i * 0.5, 0.1);
    dummy.updateMatrix();
    animatedCrystals.setMatrixAt(i, dummy.matrix);
    crystalBaseMatrices.push(dummy.matrix.clone());
  }
  animatedCrystals.instanceMatrix.needsUpdate = true;
  scene.add(animatedCrystals);

  return { animatedCrystals, crystalBaseMatrices };
}
