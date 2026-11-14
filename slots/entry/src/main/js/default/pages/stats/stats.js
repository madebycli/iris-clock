import router from '@system.router';
import * as machine from '../../common/machine.js';
import * as stats from '../../common/stats.js';
import * as store from '../../common/store.js';
import { NAMES } from '../../common/words.js';

/*
 * What happened, next to what the machine promises in the long run: the return measured against the
 * machine's real 93.7 %, every winning line, and for every reel how often each symbol landed on the payline
 * compared with its share of the 22 stops.
 */
export default {
    data: { rows: [], resetLabel: 'Statistik löschen' },

    onInit: function () {
        var self = this;
        self.armed = false;
        store.load(function (s) { self.rows = self.build(s); });
    },

    build: function (s) {
        var t = machine.theory();
        var p = stats.percent;
        var rows = [
            { k: 'Gespielt', v: s.spins + '×' },
            { k: 'Guthaben', v: s.credits + '' },
            { k: 'Nachschläge', v: s.refills + '' },
            { k: 'Eingesetzt', v: s.bet + '' },
            { k: 'Gewonnen', v: s.won + '' },
            { k: 'Quote', v: p(s.won, s.bet) + ' %' },
            { k: 'Quote Automat', v: Math.round(t.rtp * 1000) / 10 + ' %' },
            { k: 'Treffer', v: s.wins + ' (' + p(s.wins, s.spins) + ' %)' },
            { k: 'Treffer Automat', v: Math.round(t.hitRate * 1000) / 10 + ' %' },
            { k: 'Größter Gewinn', v: s.biggest + '' },
            { k: 'Pechsträhne', v: s.lossStreak + ' (max ' + s.longestLoss + ')' }
        ];
        for (var i = 0; i < machine.PAYTABLE.length; i++) {
            var rule = machine.PAYTABLE[i];
            rows.push({ k: rule.label + ' (' + rule.pays + ')', v: s.rules[rule.id] + '×' });
        }
        rows.push({ k: '7 7 7 erwartet', v: '1 in ' + t.combinations });
        for (var r = 0; r < 3; r++) {
            var counts = machine.REEL_COUNTS[r];
            for (var j = 0; j < machine.SYMBOLS.length; j++) {
                var sym = machine.SYMBOLS[j];
                var seen = s.reels[r][sym];
                rows.push({ k: 'Walze ' + (r + 1) + ' ' + NAMES[sym], v: p(seen, s.spins) + '/' + p(counts[sym], 22) + ' %' });
            }
        }
        return rows;
    },

    /* Two taps: the first asks, the second deletes. */
    reset: function () {
        if (!this.armed) { this.armed = true; this.resetLabel = 'Nochmal tippen = löschen'; return; }
        var s = stats.empty();
        store.save(s);
        this.armed = false;
        this.resetLabel = 'Gelöscht';
        this.rows = this.build(s);
    },

    swipe: function (e) { if (e.direction === 'right') { router.replace({ uri: 'pages/index/index' }); } }
};
