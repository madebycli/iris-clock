/*
 * The machine: three reels of 22 stops, like a classic one-armed bandit. Each reel carries its own number of
 * every symbol, so a 7 is rarer on reel 3 than on reel 1 is common for real machines too. One spin picks a stop
 * per reel at random; the payline is the middle row. Everything here is plain logic, tested in tests/slots.test.mjs.
 */
export var SYMBOLS = ['seven', 'bar3', 'bar', 'bell', 'cherry', 'lemon'];

/* how many of each symbol a reel carries (22 stops each) */
export var REEL_COUNTS = [
    { seven: 1, bar3: 2, bar: 3, bell: 4, cherry: 5, lemon: 7 },
    { seven: 1, bar3: 2, bar: 3, bell: 4, cherry: 4, lemon: 8 },
    { seven: 1, bar3: 1, bar: 3, bell: 5, cherry: 4, lemon: 8 }
];

/* Pays for one credit. Checked from the top: the first rule that matches pays. */
export var PAYTABLE = [
    { id: 'jackpot', label: '7 7 7', pays: 300, test: function (a, b, c) { return a === 'seven' && b === 'seven' && c === 'seven'; } },
    { id: 'bar3', label: 'BAR³ ×3', pays: 80, test: function (a, b, c) { return a === 'bar3' && b === 'bar3' && c === 'bar3'; } },
    { id: 'bar', label: 'BAR ×3', pays: 30, test: function (a, b, c) { return a === 'bar' && b === 'bar' && c === 'bar'; } },
    { id: 'anybar', label: 'BAR gemischt', pays: 10, test: function (a, b, c) { return isBar(a) && isBar(b) && isBar(c); } },
    { id: 'bell', label: 'Glocke ×3', pays: 18, test: function (a, b, c) { return a === 'bell' && b === 'bell' && c === 'bell'; } },
    { id: 'cherry3', label: 'Kirsche ×3', pays: 14, test: function (a, b, c) { return a === 'cherry' && b === 'cherry' && c === 'cherry'; } },
    { id: 'lemon', label: 'Zitrone ×3', pays: 5, test: function (a, b, c) { return a === 'lemon' && b === 'lemon' && c === 'lemon'; } },
    { id: 'cherry2', label: 'Kirsche Kirsche', pays: 3, test: function (a, b) { return a === 'cherry' && b === 'cherry'; } },
    { id: 'cherry1', label: 'Kirsche links', pays: 1, test: function (a) { return a === 'cherry'; } }
];

function isBar(s) { return s === 'bar' || s === 'bar3'; }

/* A reel's strip: the symbols spread out so that equal ones do not stand together more than they must. */
export function strip(counts) {
    var left = {};
    var total = 0;
    var i;
    for (i = 0; i < SYMBOLS.length; i++) { left[SYMBOLS[i]] = counts[SYMBOLS[i]]; total += counts[SYMBOLS[i]]; }
    var out = [];
    var last = '';
    while (out.length < total) {
        var best = '';
        for (i = 0; i < SYMBOLS.length; i++) {
            var s = SYMBOLS[i];
            if (left[s] > 0 && s !== last && (best === '' || left[s] > left[best])) { best = s; }
        }
        if (best === '') { best = last; }
        out.push(best);
        left[best] -= 1;
        last = best;
    }
    return out;
}

export var STRIPS = [strip(REEL_COUNTS[0]), strip(REEL_COUNTS[1]), strip(REEL_COUNTS[2])];

/* The rule that pays for three symbols on the payline, or null. */
export function evaluate(a, b, c) {
    for (var i = 0; i < PAYTABLE.length; i++) {
        if (PAYTABLE[i].test(a, b, c)) { return PAYTABLE[i]; }
    }
    return null;
}

/* One spin: the stop of every reel and what it pays. random() returns [0, 1). */
export function spin(random) {
    var stops = [];
    for (var r = 0; r < 3; r++) { stops.push(Math.floor(random() * STRIPS[r].length)); }
    var line = [STRIPS[0][stops[0]], STRIPS[1][stops[1]], STRIPS[2][stops[2]]];
    var rule = evaluate(line[0], line[1], line[2]);
    return { stops: stops, line: line, rule: rule === null ? '' : rule.id, win: rule === null ? 0 : rule.pays };
}

/* What a reel shows around a stop: above, payline, below. */
export function window3(reel, stop) {
    var s = STRIPS[reel];
    var n = s.length;
    return [s[(stop + n - 1) % n], s[stop], s[(stop + 1) % n]];
}

/* The exact long-run numbers of this machine, by going through every combination. */
export function theory() {
    var total = 0;
    var paid = 0;
    var hits = 0;
    var perRule = {};
    for (var i = 0; i < PAYTABLE.length; i++) { perRule[PAYTABLE[i].id] = 0; }
    for (var a = 0; a < SYMBOLS.length; a++) {
        for (var b = 0; b < SYMBOLS.length; b++) {
            for (var c = 0; c < SYMBOLS.length; c++) {
                var x = SYMBOLS[a], y = SYMBOLS[b], z = SYMBOLS[c];
                var ways = REEL_COUNTS[0][x] * REEL_COUNTS[1][y] * REEL_COUNTS[2][z];
                var rule = evaluate(x, y, z);
                total += ways;
                if (rule !== null) { paid += ways * rule.pays; hits += ways; perRule[rule.id] += ways; }
            }
        }
    }
    return { combinations: total, rtp: paid / total, hitRate: hits / total, perRule: perRule };
}
