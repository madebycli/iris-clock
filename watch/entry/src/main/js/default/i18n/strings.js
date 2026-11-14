/* Every word the watch shows. German and English; add a language by adding a block. */
export var STRINGS = {
    de: {
        tap: 'Tippen und sprechen', listening: 'Ich höre zu …', thinking: 'Einen Moment …',
        noPhone: 'Iris auf dem Handy fehlt', offline: 'Handy nicht erreichbar', tapStop: 'Tippen zum Beenden',
        settings: 'Einstellungen', language: 'Sprache', vibrate: 'Vibrieren', big: 'Große Schrift', keep: 'Antwort zeigen',
        seconds: 's', yes: 'Ja', no: 'Nein', back: 'Zurück', on: 'an', off: 'aus'
    },
    en: {
        tap: 'Tap and speak', listening: 'Listening …', thinking: 'One moment …',
        noPhone: 'Iris is missing on the phone', offline: 'Phone not reachable', tapStop: 'Tap to stop',
        settings: 'Settings', language: 'Language', vibrate: 'Vibrate', big: 'Large text', keep: 'Show answer',
        seconds: 's', yes: 'Yes', no: 'No', back: 'Back', on: 'on', off: 'off'
    }
};

export function words(lang) { return STRINGS[lang] || STRINGS.de; }
