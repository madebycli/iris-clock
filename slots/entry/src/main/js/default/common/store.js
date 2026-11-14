/* The statistics, kept with @system.storage between games. */
import storage from '@system.storage';
import { empty } from './stats.js';

export function load(done) {
    storage.get({
        key: 'slots',
        success: function (value) {
            var s = null;
            try { if (value) { s = JSON.parse(value); } } catch (e) { s = null; }
            done(s && s.reels ? s : empty());
        },
        fail: function () { done(empty()); }
    });
}

export function save(s) { storage.set({ key: 'slots', value: JSON.stringify(s) }); }
