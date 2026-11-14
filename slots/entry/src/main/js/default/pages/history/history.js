import router from '@system.router';
import * as store from '../../common/store.js';
import { SHORT } from '../../common/words.js';

/* The last 20 rounds: the payline as letters (7, ≡ = BAR³, B = BAR, G = Glocke, K = Kirsche, Z = Zitrone). */
export default {
    data: { items: [] },
    onInit: function () {
        var self = this;
        store.load(function (s) {
            var out = [];
            for (var i = 0; i < s.history.length; i++) {
                var h = s.history[i];
                out.push({ line: SHORT[h.line[0]] + '  ' + SHORT[h.line[1]] + '  ' + SHORT[h.line[2]], win: h.win > 0 ? '+' + h.win : '–', won: h.win > 0 });
            }
            self.items = out;
        });
    },
    swipe: function (e) { if (e.direction === 'down') { router.replace({ uri: 'pages/index/index' }); } }
};
