/* What the user can set on the watch. Kept with @system.storage; the phone gets a copy with every "hello". */
import storage from '@system.storage';

export var DEFAULTS = { lang: 'de', vibrate: true, big: false, keep: 20 };

export function load(done) {
    storage.get({
        key: 'settings',
        success: function (value) {
            var s = DEFAULTS;
            try { if (value) { s = merge(JSON.parse(value)); } } catch (e) { s = DEFAULTS; }
            done(s);
        },
        fail: function () { done(DEFAULTS); }
    });
}

export function save(s) { storage.set({ key: 'settings', value: JSON.stringify(s) }); }

function merge(v) {
    return {
        lang: v.lang === 'en' ? 'en' : 'de',
        vibrate: v.vibrate !== false,
        big: v.big === true,
        keep: (v.keep === 10 || v.keep === 20 || v.keep === 60) ? v.keep : 20
    };
}
