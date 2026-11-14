// node tests/slots.test.mjs — the slot machine's numbers, without a watch.
import assert from 'node:assert/strict';
import * as m from '../slots/entry/src/main/js/default/common/machine.js';
import * as st from '../slots/entry/src/main/js/default/common/stats.js';

// every reel has 22 stops, and the strip holds exactly the counts
for (let r = 0; r < 3; r++) {
  assert.equal(m.STRIPS[r].length, 22);
  for (const s of m.SYMBOLS) assert.equal(m.STRIPS[r].filter((x) => x === s).length, m.REEL_COUNTS[r][s], `reel ${r + 1} ${s}`);
}
// the paytable is checked from the top
assert.equal(m.evaluate('seven', 'seven', 'seven').id, 'jackpot');
assert.equal(m.evaluate('bar3', 'bar', 'bar').id, 'anybar');
assert.equal(m.evaluate('cherry', 'cherry', 'lemon').id, 'cherry2');
assert.equal(m.evaluate('cherry', 'lemon', 'cherry').id, 'cherry1');
assert.equal(m.evaluate('lemon', 'cherry', 'cherry'), null);
// a spin is what the strips show at its stops
const fixed = [0.0, 0.5, 0.99];
let k = 0;
const s = m.spin(() => fixed[k++]);
assert.deepEqual(s.line, [m.STRIPS[0][0], m.STRIPS[1][11], m.STRIPS[2][21]]);
assert.deepEqual(m.window3(0, 0)[1], m.STRIPS[0][0]);
// long-run numbers: a realistic machine keeps a few percent
const t = m.theory();
assert.equal(t.combinations, 22 * 22 * 22);
assert.ok(t.rtp > 0.88 && t.rtp < 0.97, `return to player ${t.rtp}`);
console.log(`theory: RTP ${(t.rtp * 100).toFixed(2)} %, hit rate ${(t.hitRate * 100).toFixed(1)} %, 777 once in ${t.combinations} spins`);
// a million simulated spins land near the theory
// mulberry32: a small generator whose consecutive values do not correlate (a plain LCG couples the three reels)
let seed = 42;
const rnd = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
let bet = 0, won = 0;
for (let i = 0; i < 1_000_000; i++) { const x = m.spin(rnd); bet += 1; won += x.win; }
assert.ok(Math.abs(won / bet - t.rtp) < 0.02, `simulated ${won / bet} vs ${t.rtp}`);
console.log(`simulated: RTP ${((won / bet) * 100).toFixed(2)} % over 1,000,000 spins`);
// statistics count what happened
let stats = st.empty();
stats = st.record(stats, { stops: [0, 0, 0], line: ['seven', 'seven', 'seven'], rule: 'jackpot', win: 300 }, 1);
stats = st.record(stats, { stops: [1, 1, 1], line: ['lemon', 'bell', 'bar'], rule: '', win: 0 }, 1);
assert.equal(stats.spins, 2);
assert.equal(stats.credits, 100 - 2 + 300);
assert.equal(stats.rules.jackpot, 1);
assert.equal(stats.reels[0].seven, 1);
assert.equal(stats.biggest, 300);
assert.equal(stats.lossStreak, 1);
assert.equal(stats.history.length, 2);
for (let i = 0; i < 40; i++) stats = st.record(stats, { stops: [1, 1, 1], line: ['lemon', 'bell', 'bar'], rule: '', win: 0 }, 1);
assert.equal(stats.history.length, st.HISTORY);
assert.equal(stats.longestLoss, 41);
console.log('slots: all checks passed');
