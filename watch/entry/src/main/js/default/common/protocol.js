/*
 * The messages between the watch and the Iris app on the phone. Wear Engine carries at most 1 KB per message,
 * so long answers arrive in parts and are put together here. Every message is one JSON object with a type "t".
 * The full list is in docs/PROTOCOL.md; keep both in step.
 */
export var VERSION = 1;

/* watch -> phone */
export function hello(lang) { return { t: 'hello', v: VERSION, lang: lang }; }
export function listen() { return { t: 'listen' }; }
export function stop() { return { t: 'stop' }; }
export function say(text) { return { t: 'text', s: text }; }
export function confirm(id, yes) { return { t: 'confirm', id: id, yes: yes }; }

/* Collects the parts of one answer: {t:'answer', id, part, of, s, card?} */
export function Assembler() {
    this.id = -1;
    this.parts = [];
    this.got = 0;
}

/* Returns the whole answer once every part has arrived, otherwise null. */
Assembler.prototype.add = function (m) {
    if (m.id !== this.id) {
        this.id = m.id;
        this.parts = [];
        this.got = 0;
    }
    if (this.parts[m.part] === undefined) {
        this.parts[m.part] = m.s;
        this.got += 1;
    }
    if (this.got < m.of) {
        return null;
    }
    var text = this.parts.join('');
    return { id: m.id, text: text, card: m.card || null, ask: m.ask === true };
};
