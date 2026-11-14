import router from '@system.router';
import * as bridge from '../../common/bridge.js';
import * as protocol from '../../common/protocol.js';
import * as settings from '../../common/settings.js';
import { words } from '../../i18n/strings.js';

/* The answer, an optional card (alarm, reminder, timer, list) and, for a question, Yes/No. Goes back after a while. */
export default {
    data: { text: '', card: null, ask: false, id: -1, cardKind: '', cardTitle: '', cardWhen: '', big: false, w: words('de') },

    onInit: function () {
        var self = this;
        if (self.card) {
            self.cardKind = self.card.kind || '';
            self.cardTitle = self.card.title || '';
            self.cardWhen = self.card.when || '';
        }
        settings.load(function (s) {
            self.big = s.big;
            self.w = words(s.lang);
            if (!self.ask) { self.timer = setTimeout(function () { self.home(); }, s.keep * 1000); }
        });
    },

    onDestroy: function () { if (this.timer) { clearTimeout(this.timer); } },

    yes: function () { bridge.send(protocol.confirm(this.id, true)); this.home(); },
    no: function () { bridge.send(protocol.confirm(this.id, false)); this.home(); },
    /* a follow-up question: listen again right away */
    again: function () { bridge.send(protocol.listen()); router.replace({ uri: 'pages/index/index', params: { phase: 'listening' } }); },
    swipe: function (e) { if (e.direction === 'right') { this.home(); } },
    home: function () { router.replace({ uri: 'pages/index/index' }); }
};
