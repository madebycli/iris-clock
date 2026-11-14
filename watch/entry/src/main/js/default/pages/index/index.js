import router from '@system.router';
import vibrator from '@system.vibrator';
import * as bridge from '../../common/bridge.js';
import * as protocol from '../../common/protocol.js';
import * as settings from '../../common/settings.js';
import { words } from '../../i18n/strings.js';

/*
 * idle -> (tap) listening: the phone records through the watch's Bluetooth microphone
 * listening -> (tap or phone says so) thinking -> answer page
 */
export default {
    data: { phase: 'idle', status: '', hint: '', busy: false, s: settings.DEFAULTS, w: words('de') },

    onInit: function () {
        var self = this;
        self.assembler = new protocol.Assembler();
        settings.load(function (s) {
            self.s = s;
            self.w = words(s.lang);
            self.show('idle');
            bridge.phoneReady(function (ok) {
                if (!ok) { self.status = self.w.noPhone; return; }
                bridge.send(protocol.hello(s.lang));
            });
        });
        bridge.receive(function (m) { self.onMessage(m); });
    },

    onDestroy: function () { bridge.stopReceiving(); },

    show: function (phase) {
        this.phase = phase;
        this.busy = phase !== 'idle';
        this.status = phase === 'listening' ? this.w.listening : (phase === 'thinking' ? this.w.thinking : '');
        this.hint = phase === 'listening' ? this.w.tapStop : (phase === 'idle' ? this.w.tap : '');
    },

    tap: function () {
        var self = this;
        if (self.phase === 'idle') {
            self.show('listening');
            bridge.send(protocol.listen(), function (ok) { if (!ok) { self.show('idle'); self.status = self.w.offline; } });
        } else if (self.phase === 'listening') {
            self.show('thinking');
            bridge.send(protocol.stop());
        }
    },

    onMessage: function (m) {
        if (m.t === 'state') {
            this.show(m.s === 'listening' ? 'listening' : (m.s === 'thinking' ? 'thinking' : 'idle'));
        } else if (m.t === 'answer') {
            var whole = this.assembler.add(m);
            if (whole !== null) {
                if (this.s.vibrate) { vibrator.vibrate({ mode: 'short' }); }
                this.show('idle');
                router.replace({ uri: 'pages/answer/answer', params: { text: whole.text, card: whole.card, ask: whole.ask, id: whole.id } });
            }
        } else if (m.t === 'error') {
            this.show('idle');
            this.status = m.s || this.w.offline;
        }
    },

    swipe: function (e) { if (e.direction === 'left') { this.openSettings(); } },
    openSettings: function () { router.replace({ uri: 'pages/settings/settings' }); }
};
