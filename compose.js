// Assemble une séance à partir des blocs de content.json. Partagé navigateur + node (test.js).
const PLANS = {
  3: ['arrivee', 'respiration', 'cloture'],
  10: ['arrivee', 'respiration', 'corps', 'theme', 'cloture'],
  20: ['arrivee', 'respiration', 'corps', 'theme', 'silence', 'cloture'],
};

// Voix posée de méditation ≈ 2 mots/s ; corrigé en direct par le lecteur.
const estSpeech = (text) => (text ? text.split(/\s+/).length / 2 + 0.5 : 0);

function pick(variants, moment, minutes, recent, rand) {
  const ok = variants.filter((v) => (v.moment === 'tous' || v.moment === moment) && (!v.durees || v.durees.includes(minutes)));
  const fresh = ok.filter((v) => !recent.includes(v.id));
  const pool = fresh.length ? fresh : ok;
  return pool[Math.floor(rand() * pool.length)];
}

function compose(content, moment, minutes, recent = [], rand = Math.random) {
  const steps = [];
  const used = [];
  for (const blockName of PLANS[minutes]) {
    const b = pick(content.blocks[blockName], moment, minutes, recent, rand);
    used.push(b.id);
    const label = b.nom || { arrivee: 'Arrivée', silence: 'Silence', cloture: 'Retour' }[blockName];
    const add = (lines, prefix) => lines.forEach(([text, pause], i) =>
      steps.push({ id: `${prefix}-${i}`, text, pause, fixed: false, label }));
    add(b.lines, b.id);
    if (b.breath) {
      for (let c = 0; c < b.cycles[minutes]; c++)
        for (const [cue, sec] of b.breath)
          steps.push({ id: `cue-${cue}`, text: content.cues[cue], pause: sec, fixed: true, label });
      add(b.after, `${b.id}-after`);
    }
  }
  return { steps, used, target: minutes * 60 };
}

// Facteur à appliquer aux pauses étirables restantes pour finir pile à l'heure.
function pauseFactor(steps, from, elapsed, target, speechOf = (s) => estSpeech(s.text)) {
  let speech = 0, fixed = 0, scalable = 0;
  for (let i = from; i < steps.length; i++) {
    if (i > from) speech += speechOf(steps[i]);
    if (steps[i].fixed) fixed += steps[i].pause; else scalable += steps[i].pause;
  }
  if (!scalable) return 1;
  return Math.min(4, Math.max(0.3, (target - elapsed - speech - fixed) / scalable));
}

if (typeof module !== 'undefined') module.exports = { PLANS, compose, pauseFactor, estSpeech };
