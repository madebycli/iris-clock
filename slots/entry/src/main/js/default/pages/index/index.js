import router from '@system.router';
import vibrator from '@system.vibrator';
import * as machine from '../../common/machine.js';
import * as stats from '../../common/stats.js';
import * as store from '../../common/store.js';
import * as words from '../../common/words.js';

var IMG = '/common/img/';
function src(symbol) { return IMG + symbol + '.png'; }
function view(reel, stop) {
    var w = machine.window3(reel, stop);
    return [src(w[0]), src(w[1]), src(w[2])];
}

/*
 * Pull the lever (button, swipe down or the crown): every reel ticks through its strip, slowing down, and stops
 * one after the other on the stop that machine.spin() chose. Then the payline flashes and the statistics grow.
 */
export default {
    data: {
        credits: stats.START_CREDITS, r0: [], r1: [], r2: [], message: 'Zieh den Hebel!', tier: '', flash: false,
        spinning: false, button: 'DREHEN'
    },

    onInit: function () {
        var self = this;
        self.pos = [0, 7, 14];
        self.r0 = view(0, 0); self.r1 = view(1, 7); self.r2 = view(2, 14);
        self.timers = [];
        store.load(function (s) {
            self.s = s;
            self.credits = s.credits;
            if (s.credits <= 0) { self.button = 'NACHSCHLAG'; }
        });
    },

    onDestroy: function () { this.clear(); },

    clear: function () {
        for (var i = 0; i < this.timers.length; i++) { clearTimeout(this.timers[i]); clearInterval(this.timers[i]); }
        this.timers = [];
    },

    pull: function () {
        var self = this;
        if (self.spinning || !self.s) { return; }
        if (self.s.credits <= 0) {
            self.s = stats.refill(self.s);
            store.save(self.s);
            self.credits = self.s.credits;
            self.button = 'DREHEN';
            self.message = 'Nachschlag: +100';
            self.tier = '';
            return;
        }
        var result = machine.spin(Math.random);
        self.spinning = true;
        self.button = '…';
        self.flash = false;
        self.tier = '';
        self.message = '';
        self.credits = self.s.credits - 1;
        vibrator.vibrate({ mode: 'short' });
        var stopped = 0;
        for (var r = 0; r < 3; r++) {
            self.roll(r, result.stops[r], function () {
                stopped += 1;
                if (stopped === 3) { self.done(result); }
            });
        }
    },

    /* Ticks reel r through its strip and lands on target. Later reels spin longer; the last steps slow down. */
    roll: function (r, target, landed) {
        var self = this;
        var n = machine.STRIPS[r].length;
        var distance = (target - self.pos[r] + n) % n;
        var steps = n * (1 + r) + 10 + distance;
        var done = 0;
        function tick() {
            self.pos[r] = (self.pos[r] + 1) % n;
            var v = view(r, self.pos[r]);
            if (r === 0) { self.r0 = v; } else if (r === 1) { self.r1 = v; } else { self.r2 = v; }
            done += 1;
            if (done >= steps) { landed(); return; }
            var left = steps - done;
            var wait = left > 6 ? 45 : 45 + (7 - left) * 35;
            self.timers.push(setTimeout(tick, wait));
        }
        self.timers.push(setTimeout(tick, 45));
    },

    done: function (result) {
        var self = this;
        self.s = stats.record(self.s, result, 1);
        store.save(self.s);
        self.credits = self.s.credits;
        self.spinning = false;
        self.button = self.s.credits > 0 ? 'DREHEN' : 'NACHSCHLAG';
        var kind = result.win === 0 ? 'lose' : (result.rule === 'jackpot' ? 'jackpot' : (result.win >= 30 ? 'big' : (result.win >= 5 ? 'win' : 'small')));
        self.tier = kind === 'lose' || kind === 'small' ? '' : kind;
        self.message = words.line(kind) + (result.win > 0 ? '  +' + result.win : '');
        if (result.win > 0) { self.celebrate(kind); }
    },

    /* The payline and the line of text blink; a jackpot blinks longer and buzzes. */
    celebrate: function (kind) {
        var self = this;
        var blinks = kind === 'jackpot' ? 16 : (kind === 'big' ? 10 : 6);
        var count = 0;
        if (kind === 'jackpot' || kind === 'big') { vibrator.vibrate({ mode: 'long' }); }
        var id = setInterval(function () {
            self.flash = !self.flash;
            count += 1;
            if (count >= blinks) { clearInterval(id); self.flash = true; }
        }, 140);
        self.timers.push(id);
    },

    /* The crown pulls the lever too (a turn of a few degrees is enough). */
    crown: function (e) {
        if (e && Math.abs(e.rotateValue || 0) > 0.5) { this.pull(); }
    },

    swipe: function (e) {
        if (e.direction === 'down') { this.pull(); }
        else if (e.direction === 'left') { router.replace({ uri: 'pages/stats/stats' }); }
        else if (e.direction === 'right') { router.replace({ uri: 'pages/help/help' }); }
        else if (e.direction === 'up') { router.replace({ uri: 'pages/history/history' }); }
    }
};
