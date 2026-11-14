/* Everything the game says. German; the funny lines are picked at random. */
export var NAMES = { seven: '7', bar3: 'BAR³', bar: 'BAR', bell: 'Glocke', cherry: 'Kirsche', lemon: 'Zitrone' };
export var SHORT = { seven: '7', bar3: '≡', bar: 'B', bell: 'G', cherry: 'K', lemon: 'Z' };

var LINES = {
    lose: ['Fast!', 'Die Walzen lachen.', 'Das Haus gewinnt.', 'Nächstes Mal!', 'Knapp daneben.', 'Zitronen-Pech.', 'Nochmal ziehen!'],
    small: ['Immerhin!', 'Ein Kirschlein!', 'Kleiner Fisch.', 'Besser als nichts.'],
    win: ['Ka-ching!', 'Läuft bei dir!', 'Treffer!', 'Glückspilz!'],
    big: ['Geldregen!', 'Volltreffer!', 'Die Bank weint!'],
    jackpot: ['7 7 7 – JACKPOT!']
};

export function line(kind) {
    var pool = LINES[kind] || LINES.lose;
    return pool[Math.floor(Math.random() * pool.length)];
}
