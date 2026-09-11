import { trainerConfig } from "@/config/trainer";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChar(characters: string): string {
  return characters[randomInt(0, characters.length - 1)];
}

function generateToken(characters: string): string {
  const length = randomInt(
    trainerConfig.minTokenLength,
    trainerConfig.maxTokenLength,
  );
  return Array.from({ length }, () => randomChar(characters)).join("");
}

export function generateExercise(characters: string): string {
  if (!characters) {
    return "";
  }

  const tokens: string[] = [];
  let totalLength = 0;

  while (totalLength < trainerConfig.maxExerciseLength) {
    const token = generateToken(characters);
    const nextLength =
      tokens.length === 0 ? token.length : totalLength + 1 + token.length;

    if (nextLength > trainerConfig.maxExerciseLength) {
      break;
    }

    tokens.push(token);
    totalLength = nextLength;
  }

  if (tokens.length === 0) {
    return generateToken(characters).slice(0, trainerConfig.maxExerciseLength);
  }

  return tokens.join(" ");
}
