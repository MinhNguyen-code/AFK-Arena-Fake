export class SeededRng {
  private state: number;

  constructor(seed: number = 1337) {
    this.state = seed >>> 0;
    if (this.state === 0) {
      this.state = 0x6d2b79f5;
    }
  }

  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  public chance(percent: number): boolean {
    if (percent <= 0) return false;
    if (percent >= 100) return true;
    return this.next() * 100 < percent;
  }

  public pick<T>(items: readonly T[]): T {
    const idx = Math.floor(this.next() * items.length);
    return items[Math.min(items.length - 1, Math.max(0, idx))];
  }
}
