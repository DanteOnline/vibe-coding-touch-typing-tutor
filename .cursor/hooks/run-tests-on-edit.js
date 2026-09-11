#!/usr/bin/env node

const { execSync } = require("node:child_process");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "..");
const SOURCE_PATTERN = /\.(ts|tsx)$/;
const IGNORE_PATTERN = /(\.(test|spec)\.(ts|tsx)$|^vitest\.|^next-env\.d\.ts$)/;

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function shouldRunTests(filePath) {
  if (!filePath) {
    return false;
  }

  const normalized = filePath.replace(/\\/g, "/");

  if (!SOURCE_PATTERN.test(normalized)) {
    return false;
  }

  if (IGNORE_PATTERN.test(normalized)) {
    return false;
  }

  return (
    normalized.includes("/lib/") ||
    normalized.includes("/components/") ||
    normalized.includes("/app/") ||
    normalized.includes("/config/") ||
    normalized.endsWith("/middleware.ts")
  );
}

async function main() {
  let payload = {};

  try {
    const input = await readStdin();
    if (input.trim()) {
      payload = JSON.parse(input);
    }
  } catch {
    payload = {};
  }

  const filePath =
    payload.file_path ||
    payload.filePath ||
    payload.path ||
    payload.file ||
    "";

  if (!shouldRunTests(filePath)) {
    process.stdout.write(JSON.stringify({}));
    process.exit(0);
  }

  try {
    execSync("npm run test", {
      cwd: ROOT,
      stdio: "pipe",
      encoding: "utf8",
    });

    process.stdout.write(
      JSON.stringify({
        additional_context: `Tests passed after editing ${filePath}.`,
      }),
    );
    process.exit(0);
  } catch (error) {
    const output =
      (error.stdout || "") + (error.stderr || "") || "Tests failed.";

    process.stdout.write(
      JSON.stringify({
        additional_context: `Tests failed after editing ${filePath}:\n${output}`,
      }),
    );
    process.exit(0);
  }
}

main();
