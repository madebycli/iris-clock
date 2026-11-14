/* What has happened at this machine, kept on the watch. Pure functions, tested in tests/slots.test.mjs. */
import { SYMBOLS, PAYTABLE } from './machine.js';

export var START_CREDITS = 100;
export var HISTORY = 20;

export function empty() {
    var rules = {};
    for (var i = 0; i < PAYTABLE.length; i++) { rules[PAYTABLE[i].id] = 0; }
    var reels = [];
    for (var r = 0; r < 3; r++) {
        var c = {};
        for (var j = 0; j < SYMBOLS.length; j++) { c[SYMBOLS[j]] = 0; }
        reels.push(c);
    }
    return { credits: START_CREDITS, refills: 0, spins: 0, bet: 0, won: 0, wins: 0, biggest: 0, lossStreak: 0, longestLoss: 0, rules: rules, reels: reels, history: [] };
}

/* A new statistics object with one more spin. */
export function record(s, result, bet) {
    var n = JSON.parse(JSON.stringify(s));
    n.spins += 1;
    n.bet += bet;
    n.credits += result.win - bet;
    n.won += result.win;
    if (result.win > 0) {
        n.wins += 1;
        n.lossStreak = 0;
        if (result.rule) { n.rules[result.rule] += 1; }
        if (result.win > n.biggest) { n.biggest = result.win; }
    } else {
        n.lossStreak += 1;
        if (n.lossStreak > n.longestLoss) { n.longestLoss = n.lossStreak; }
    }
    for (var r = 0; r < 3; r++) { n.reels[r][result.line[r]] += 1; }
    n.history.unshift({ line: result.line, win: result.win });
    if (n.history.length > HISTORY) { n.history.length = HISTORY; }
    return n;
}

/* Credits run out: a refill, counted so the statistics stay honest. */
export function refill(s) {
    var n = JSON.parse(JSON.stringify(s));
    n.credits += START_CREDITS;
    n.refills += 1;
    return n;
}

export function percent(part, whole) {
    return whole > 0 ? Math.round((part * 1000) / whole) / 10 : 0;
}
