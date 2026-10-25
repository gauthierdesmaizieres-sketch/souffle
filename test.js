// node test.js — vérifie que chaque combinaison tient sa durée sans pauses absurdes.
const assert = require('assert');
const content = require('./content.json');
const { compose, pauseFactor, estSpeech } = require('./compose.js');

for (const moment of ['matin', 'soir'])
  for (const minutes of [3, 10, 20]) {
    let min = Infinity, max = 0;
    for (let n = 0; n < 300; n++) {
      const { steps, target } = compose(content, moment, minutes);
      // Facteur prévu au départ (elapsed = durée du 1er texte).
      const f = pauseFactor(steps, 0, estSpeech(steps[0].text), target);
      min = Math.min(min, f); max = Math.max(max, f);
    }
    console.log(`${moment} ${minutes} min : facteur pauses ${min.toFixed(2)}–${max.toFixed(2)}`);
    assert(min > 0.5 && max < 3.5, `${moment} ${minutes} min hors limites`);
  }

// Les variantes récentes sont évitées quand une alternative existe.
const a = compose(content, 'matin', 10);
const b = compose(content, 'matin', 10, a.used);
assert(!b.used.some((id) => a.used.includes(id) && id.startsWith('arr-')), 'arrivée répétée');
console.log('OK');
