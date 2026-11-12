// Centralized 8-Bus Web Audio Synthesizer & Mixer for Eternal Realms 3D

export type AudioBusCategory =
  | 'music'
  | 'ambient'
  | 'voice'
  | 'basicAttack'
  | 'skill'
  | 'ultimate'
  | 'impact'
  | 'ui';

export interface AudioBusVolumes {
  master: number;
  music: number;
  ambient: number;
  voice: number;
  basicAttack: number;
  skill: number;
  ultimate: number;
  impact: number;
  ui: number;
}

const DEFAULT_VOLUMES: AudioBusVolumes = {
  master: 0.85,
  music: 0.55,
  ambient: 0.6,
  voice: 0.8,
  basicAttack: 0.7,
  skill: 0.8,
  ultimate: 0.95,
  impact: 0.8,
  ui: 0.75,
};

const MAX_CONCURRENT_VOICES = 14;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private busGains: Partial<Record<AudioBusCategory, GainNode>> = {};
  public isMuted: boolean = false;
  public volumes: AudioBusVolumes = { ...DEFAULT_VOLUMES };
  private activeVoiceCount: number = 0;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private currentBiome: string | null = null;

  constructor() {
    try {
      const savedMute = localStorage.getItem('eternal_realms_muted');
      if (savedMute !== null) {
        this.isMuted = JSON.parse(savedMute);
      }
      const savedVolumes = localStorage.getItem('eternal_realms_audio_volumes');
      if (savedVolumes) {
        this.volumes = { ...DEFAULT_VOLUMES, ...JSON.parse(savedVolumes) };
      }
    } catch {
      // Ignore storage errors in sandboxed/headless environments
    }
  }

  private init(): boolean {
    if (typeof window === 'undefined') return false;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.volumes.master;
      this.masterGain.connect(this.ctx.destination);

      const categories: AudioBusCategory[] = [
        'music',
        'ambient',
        'voice',
        'basicAttack',
        'skill',
        'ultimate',
        'impact',
        'ui',
      ];
      for (const cat of categories) {
        const gain = this.ctx.createGain();
        gain.gain.value = this.volumes[cat];
        gain.connect(this.masterGain);
        this.busGains[cat] = gain;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return true;
  }

  private getBusDestination(category: AudioBusCategory): AudioNode | null {
    if (!this.init() || !this.ctx) return null;
    return this.busGains[category] || this.masterGain || this.ctx.destination;
  }

  private canSpawnVoice(): boolean {
    if (this.isMuted) return false;
    if (this.activeVoiceCount >= MAX_CONCURRENT_VOICES) return false;
    return this.init();
  }

  private trackVoice(durationSec: number): void {
    this.activeVoiceCount++;
    setTimeout(() => {
      this.activeVoiceCount = Math.max(0, this.activeVoiceCount - 1);
    }, Math.ceil(durationSec * 1000) + 20);
  }

  public setBusVolume(bus: keyof AudioBusVolumes, value: number): void {
    const clamped = Math.max(0, Math.min(1, value));
    this.volumes[bus] = clamped;
    try {
      localStorage.setItem('eternal_realms_audio_volumes', JSON.stringify(this.volumes));
    } catch {
      // Ignore
    }
    if (!this.ctx) return;
    if (bus === 'master' && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this.isMuted ? 0 : clamped,
        this.ctx.currentTime,
        0.02
      );
    } else if (bus !== 'master' && this.busGains[bus]) {
      this.busGains[bus]!.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.02);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('eternal_realms_muted', JSON.stringify(this.isMuted));
    } catch {
      // Ignore
    }
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this.isMuted ? 0 : this.volumes.master,
        this.ctx.currentTime,
        0.02
      );
    }
    return this.isMuted;
  }

  public playUiClick(): void {
    if (!this.canSpawnVoice() || !this.ctx) return;
    const dest = this.getBusDestination('ui');
    if (!dest) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.045);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.055);
    this.trackVoice(0.06);
  }

  public playBasicAttack(weaponStyle: 'melee' | 'ranged' | 'magic' = 'melee'): void {
    if (!this.canSpawnVoice() || !this.ctx) return;
    const dest = this.getBusDestination('basicAttack');
    if (!dest) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (weaponStyle === 'ranged') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.09);
    } else if (weaponStyle === 'magic') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.11);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.085);
    }

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.11);
    this.trackVoice(0.11);
  }

  public playSkillCast(element: 'holy' | 'fire' | 'nature' | 'shadow' | 'arcane' = 'arcane'): void {
    if (!this.canSpawnVoice() || !this.ctx) return;
    const dest = this.getBusDestination('skill');
    if (!dest) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq =
      element === 'holy'
        ? 523.25
        : element === 'fire'
        ? 293.66
        : element === 'nature'
        ? 440
        : element === 'shadow'
        ? 196
        : 392;

    osc.type = element === 'shadow' || element === 'fire' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.65, now + 0.22);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.24);
    this.trackVoice(0.24);
  }

  public playHit(isCrit: boolean = false): void {
    if (!this.canSpawnVoice() || !this.ctx) return;
    const dest = this.getBusDestination('impact');
    if (!dest) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = isCrit ? 'sawtooth' : 'triangle';

    osc.frequency.setValueAtTime(isCrit ? 190 : 130, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + (isCrit ? 0.19 : 0.11));

    gain.gain.setValueAtTime(isCrit ? 0.24 : 0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + (isCrit ? 0.19 : 0.11));

    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + (isCrit ? 0.19 : 0.11));
    this.trackVoice(isCrit ? 0.19 : 0.11);
  }

  public playTelegraphWindup(): void {
    if (!this.canSpawnVoice() || !this.ctx) return;
    const dest = this.getBusDestination('skill');
    if (!dest) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.28);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.11, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.3);
    this.trackVoice(0.3);
  }

  public playUltimateCast(): void {
    if (!this.canSpawnVoice() || !this.ctx) return;
    const dest = this.getBusDestination('ultimate');
    const voiceDest = this.getBusDestination('voice') || dest;
    if (!dest) return;
    const now = this.ctx.currentTime;

    const freqs = [261.63, 329.63, 392.0, 523.25];
    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx % 2 === 0 ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(f * 0.85, now);
      osc.frequency.exponentialRampToValueAtTime(f * 1.45, now + 0.45);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(idx === 3 && voiceDest ? voiceDest : dest);
      osc.start(now);
      osc.stop(now + 0.5);
    });
    this.trackVoice(0.5);
  }

  public playLevelUp(): void {
    if (!this.canSpawnVoice() || !this.ctx) return;
    const dest = this.getBusDestination('ui');
    if (!dest) return;
    const now = this.ctx.currentTime;

    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const startTime = now + i * 0.07;
      osc.frequency.setValueAtTime(f, startTime);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
    this.trackVoice(0.5);
  }

  public playGachaSummon(isAscended: boolean): void {
    if (!this.canSpawnVoice() || !this.ctx) return;
    const dest = this.getBusDestination('music');
    if (!dest) return;
    const now = this.ctx.currentTime;

    const notes = isAscended
      ? [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5]
      : [261.63, 329.63, 392.0, 523.25];

    notes.forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isAscended ? 'sawtooth' : 'sine';
      const startTime = now + i * 0.06;
      osc.frequency.setValueAtTime(f, startTime);

      gain.gain.setValueAtTime(isAscended ? 0.1 : 0.08, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
    this.trackVoice(0.6);
  }

  public playVictoryFanfare(): void {
    if (!this.canSpawnVoice() || !this.ctx) return;
    const dest = this.getBusDestination('music');
    if (!dest) return;
    const now = this.ctx.currentTime;

    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const start = now + idx * 0.09;
      osc.frequency.setValueAtTime(f, start);

      gain.gain.setValueAtTime(0.14, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.55);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(start);
      osc.stop(start + 0.55);
    });
    this.trackVoice(0.8);
  }

  public playDefeatSting(): void {
    if (!this.canSpawnVoice() || !this.ctx) return;
    const dest = this.getBusDestination('music');
    if (!dest) return;
    const now = this.ctx.currentTime;

    const notes = [293.66, 277.18, 261.63, 220.0];
    notes.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      const start = now + idx * 0.14;
      osc.frequency.setValueAtTime(f, start);

      gain.gain.setValueAtTime(0.09, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(start);
      osc.stop(start + 0.45);
    });
    this.trackVoice(0.8);
  }

  public setArenaAmbient(biome: 'enchanted_forest' | 'celestial_temple' | 'shadow_realm' | null): void {
    if (this.currentBiome === biome) return;
    this.currentBiome = biome;
    if (this.ambientOsc) {
      try {
        this.ambientOsc.stop();
        this.ambientOsc.disconnect();
      } catch {
        // Ignore
      }
      this.ambientOsc = null;
    }
    if (!biome || this.isMuted) return;
    if (!this.ctx || this.ctx.state !== 'running') return;
    const dest = this.getBusDestination('ambient');
    if (!dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const freq =
      biome === 'enchanted_forest' ? 110 : biome === 'celestial_temple' ? 146.83 : 73.42;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.018, this.ctx.currentTime);
    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    this.ambientOsc = osc;
    this.ambientGain = gain;
  }
}

export const soundEngine = new SoundEngine();
