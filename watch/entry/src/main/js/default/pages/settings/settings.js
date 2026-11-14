import router from '@system.router';
import * as settings from '../../common/settings.js';
import * as bridge from '../../common/bridge.js';
import * as protocol from '../../common/protocol.js';
import { words } from '../../i18n/strings.js';

/* Every tap changes one setting and saves it; the phone hears the language at once. */
export default {
    data: { s: settings.DEFAULTS, w: words('de') },
    onInit: function () {
        var self = this;
        settings.load(function (s) { self.s = s; self.w = words(s.lang); });
    },
    store: function () { settings.save(this.s); this.w = words(this.s.lang); },
    toggleLang: function () { this.s.lang = this.s.lang === 'de' ? 'en' : 'de'; this.store(); bridge.send(protocol.hello(this.s.lang)); },
    toggleVibrate: function () { this.s.vibrate = !this.s.vibrate; this.store(); },
    toggleBig: function () { this.s.big = !this.s.big; this.store(); },
    cycleKeep: function () { this.s.keep = this.s.keep === 10 ? 20 : (this.s.keep === 20 ? 60 : 10); this.store(); },
    swipe: function (e) { if (e.direction === 'right') { this.back(); } },
    back: function () { router.replace({ uri: 'pages/index/index' }); }
};
