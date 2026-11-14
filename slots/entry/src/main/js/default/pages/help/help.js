import router from '@system.router';
import * as machine from '../../common/machine.js';

/* How to play, what pays, and what the machine is made of. */
export default {
    data: { lines: [] },
    onInit: function () {
        var t = machine.theory();
        var lines = [
            { h: true, t: 'Spielen' },
            { t: 'Hebel: Knopf DREHEN, nach unten wischen oder die Krone drehen.' },
            { t: 'Jede Runde kostet 1 Credit. Es zählt die mittlere Reihe.' },
            { t: 'Start mit 100 Credits. Bei 0 gibt es einen Nachschlag.' },
            { t: 'Wischen: links Statistik, oben Verlauf, rechts hierher.' },
            { h: true, t: 'Gewinne (für 1 Credit)' }
        ];
        for (var i = 0; i < machine.PAYTABLE.length; i++) {
            lines.push({ t: machine.PAYTABLE[i].label + ': ' + machine.PAYTABLE[i].pays });
        }
        lines.push({ h: true, t: 'Der Automat' });
        lines.push({ t: '3 Walzen mit je 22 Feldern. Jede Walze hat ihre eigene Mischung: Walze 3 hat weniger BAR³ und mehr Glocken.' });
        lines.push({ t: 'Auszahlungsquote auf lange Sicht: ' + Math.round(t.rtp * 1000) / 10 + ' %. Das Haus gewinnt.' });
        lines.push({ t: 'Treffer in ' + Math.round(t.hitRate * 1000) / 10 + ' % der Runden, 7 7 7 einmal in ' + t.combinations + '.' });
        lines.push({ t: 'Nur zum Spaß: kein echtes Geld.' });
        this.lines = lines;
    },
    swipe: function (e) { if (e.direction === 'left') { router.replace({ uri: 'pages/index/index' }); } }
};
