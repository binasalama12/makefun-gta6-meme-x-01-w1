// Entrypoint for the gta6-meme-x-01 entry "Paid in 13 Minutes" (Node 22,
// standard library only).
//
// The entry itself is the X post named by POST.json in the repository root:
// a Vice City pay-receipt meme carrying make.fun's ghost, posted publicly
// with the account's play code. The grader reads that post from X directly,
// so nothing here is judged on content. This program's single job is the
// hand-off: place a byte-exact copy of POST.json where the gate looks for
// it, in the output directory.
//
// Where things live is configurable so the same file runs in the grader's
// container and in a plain checkout:
//   MAKEFUN_BOT_DIR    the repository checkout (default /bot)
//   MAKEFUN_OUTPUT_DIR where the copy belongs  (default /output)
//
// Local run, as in the README:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// An unset or empty variable both mean "use the container default".
function dirFromEnv(name: string, fallback: string): string {
  const value = process.env[name];
  return value === undefined || value.trim() === '' ? fallback : value;
}

function handOffPostRecord(botDir: string, outputDir: string): void {
  mkdirSync(outputDir, { recursive: true });
  const record = readFileSync(join(botDir, 'POST.json'));
  const target = join(outputDir, 'POST.json');
  writeFileSync(target, record);
  // Read the copy back and compare bytes: a short or torn write must fail
  // the run here, not hand the gate a POST.json that is not the real one.
  if (!readFileSync(target).equals(record)) {
    throw new Error(`the copy at ${target} does not match the original POST.json`);
  }
}

const botDir = dirFromEnv('MAKEFUN_BOT_DIR', '/bot');
const outputDir = dirFromEnv('MAKEFUN_OUTPUT_DIR', '/output');

try {
  handOffPostRecord(botDir, outputDir);
} catch (err) {
  console.error(`could not hand off POST.json from ${botDir}: ${(err as Error).message}`);
  process.exit(1);
}
