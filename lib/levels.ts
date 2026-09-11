export function getLevelCharacters(alphabet: string, level: number): string {
  if (level < 1 || level > alphabet.length) {
    throw new RangeError(`Level must be between 1 and ${alphabet.length}`);
  }
  return alphabet.slice(0, level);
}

export function clampLevel(level: number, maxLevel: number): number {
  return Math.min(Math.max(level, 1), maxLevel);
}
