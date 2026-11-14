// node tests/protocol.test.mjs — checks the watch's message rules without a watch.
import assert from 'node:assert/strict';
import * as p from '../watch/entry/src/main/js/default/common/protocol.js';

const a = new p.Assembler();
assert.equal(a.add({ t: 'answer', id: 7, part: 1, of: 2, s: 'Welt' }), null, 'waits for the missing part');
assert.deepEqual(a.add({ t: 'answer', id: 7, part: 0, of: 2, s: 'Hallo ' }), { id: 7, text: 'Hallo Welt', card: null, ask: false });
// a part that arrives twice is counted once
const b = new p.Assembler();
assert.equal(b.add({ t: 'answer', id: 1, part: 0, of: 2, s: 'a' }), null);
assert.equal(b.add({ t: 'answer', id: 1, part: 0, of: 2, s: 'a' }), null);
assert.equal(b.add({ t: 'answer', id: 1, part: 1, of: 2, s: 'b', card: { kind: 'Wecker', title: '7:00' } }).card.title, '7:00');
// a new answer replaces an unfinished one
const c = new p.Assembler();
c.add({ t: 'answer', id: 1, part: 0, of: 3, s: 'x' });
assert.equal(c.add({ t: 'answer', id: 2, part: 0, of: 1, s: 'neu', ask: true }).ask, true);
// every message the watch sends fits into one Wear Engine message (1 KB)
for (const m of [p.hello('de'), p.listen(), p.stop(), p.confirm(3, true), p.say('x'.repeat(300))]) {
  assert.ok(Buffer.byteLength(JSON.stringify(m)) < 1024, JSON.stringify(m).slice(0, 40));
}
console.log('protocol: all checks passed');
