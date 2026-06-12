/* Deterministic-coverage check: every lesson on the path must generate valid,
 * typable drill content for any settings combination (RELEASE.md good-enough
 * bar). The generator is random, so each lesson × options combo is sampled
 * many times; one failed sample fails the check.
 *
 * "Typable" = the char sits on the verified QWERTZ layout (charInfo) or is one
 * of the dead-key compositions the deadkeys stage teaches (ó ť ň ď) — the
 * engine matches produced characters, so both arrive as plain insertText.
 *
 * Run: npm run check:content   (also part of the release gate)
 */
import { LESSONS } from "../src/data/curriculum";
import { buildSteps, type GeneratorOptions } from "../src/data/generator";
import { charInfo } from "../src/data/layout";

const DEAD_COMPOSED = new Set(["ó", "ť", "ň", "ď"]);
const ITERATIONS = 40; // per lesson × combo
const MAX_LINE = 60; // LINE_TARGET is 30; groups can overshoot, but not wildly

const COMBOS: GeneratorOptions[] = [];
for (const maxGroupLen of [1, 4, 8])
  for (const linesPerPhase of [2, 6])
    for (const alternateHands of [true, false])
      COMBOS.push({ maxGroupLen, linesPerPhase, alternateHands });

function typable(c: string): boolean {
  return c === " " || c === "\n" || DEAD_COMPOSED.has(c) || charInfo(c) !== undefined;
}

let failures = 0;
function fail(msg: string) {
  failures++;
  console.error(`FAIL ${msg}`);
}

// -- lesson definitions themselves --------------------------------------------
for (const lesson of LESSONS) {
  for (const k of lesson.cumulativeKeys) {
    if (!typable(k)) fail(`${lesson.id} "${lesson.title}": key '${k}' is not producible on the layout`);
  }
}

// -- generated content ---------------------------------------------------------
for (const lesson of LESSONS) {
  const capsAllowed = !!lesson.caps || lesson.stageId === "punct";
  const learned = new Set(lesson.cumulativeKeys);
  // weak keys influence mix weighting — sample with and without
  const weakSamples: (readonly string[])[] = [[], lesson.cumulativeKeys.slice(0, 3)];

  for (const combo of COMBOS) {
    for (const weakKeys of weakSamples) {
      for (let it = 0; it < ITERATIONS; it++) {
        const steps = buildSteps(lesson, { ...combo, weakKeys });
        if (steps.length === 0) {
          fail(`${lesson.id}: produced no steps (${JSON.stringify(combo)})`);
          continue;
        }
        for (const step of steps) {
          if (!step.text.trim()) {
            fail(`${lesson.id} [${step.kind}]: empty text`);
            continue;
          }
          for (const line of step.text.split("\n")) {
            if (!line.trim()) fail(`${lesson.id} [${step.kind}]: blank line`);
            if (line.length > MAX_LINE)
              fail(`${lesson.id} [${step.kind}]: line ${line.length} chars > ${MAX_LINE}: "${line}"`);
            if (line !== line.trim())
              fail(`${lesson.id} [${step.kind}]: leading/trailing space: "${line}"`);
          }
          for (const c of step.text) {
            if (!typable(c)) {
              fail(`${lesson.id} [${step.kind}]: untypable char '${c}' (U+${c.codePointAt(0)!.toString(16)})`);
              continue;
            }
            if (c === " " || c === "\n") continue;
            const lower = c.toLowerCase();
            if (!learned.has(lower))
              fail(`${lesson.id} [${step.kind}]: char '${c}' outside learned set`);
            if (c !== lower && !capsAllowed)
              fail(`${lesson.id} [${step.kind}]: unexpected capital '${c}' in a non-caps lesson`);
          }
          // every new key must actually occur in its introduction step
          if (step.kind === "new") {
            for (const k of lesson.newKeys) {
              if (!step.text.includes(k))
                fail(`${lesson.id} [new]: new key '${k}' never appears`);
            }
          }
        }
      }
    }
  }
}

const samples = LESSONS.length * COMBOS.length * 2 * ITERATIONS;
if (failures) {
  console.error(`\n${failures} failures across ${samples} sampled drills.`);
  process.exit(1);
}
console.log(`OK — ${LESSONS.length} lessons × ${COMBOS.length} option combos × 2 weak-key sets × ${ITERATIONS} samples (${samples} drills) all valid and typable.`);
