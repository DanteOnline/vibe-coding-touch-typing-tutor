import { readFileSync } from "fs";
import path from "path";

const ALPHABET_PATH = path.join(process.cwd(), "alphabet", "main.txt");

export function loadAlphabet(): string {
  const raw = readFileSync(ALPHABET_PATH, "utf-8").trim();
  if (!raw) {
    throw new Error("Alphabet file is empty");
  }
  return raw;
}

export function getMaxLevel(alphabet: string): number {
  return alphabet.length;
}
