// Controleert dat elke les alleen tekens gebruikt die het kind al geleerd heeft.
const L = require('../src/js/levels.js');

const letters = 'abcdefghijklmnopqrstuvwxyz';
let failed = 0;
for (const lv of L.LEVELS) {
  let allowed;
  if (lv.type === 'keys' || lv.type === 'words') allowed = lv.keys.join('') + ' ';
  else if (lv.type === 'shift') allowed = letters + letters.toUpperCase() + ' ';
  else if (lv.type === 'punct') allowed = letters + letters.toUpperCase() + ' .,?!';
  else allowed = letters + letters.toUpperCase() + ' .,?!0123456789';
  const set = new Set(allowed);
  for (let seed = 1; seed <= 200; seed++) {
    const text = L.generateText(lv, { seed, name: 'Sanne' });
    const bad = [...text].filter((c) => !set.has(c));
    if (bad.length || text.length < 10 || /\s$|^\s|\s\s/.test(text)) {
      console.error(`Level ${lv.id} (seed ${seed}) ongeldig: ${JSON.stringify(text)} -> ${bad.join('')}`);
      failed++;
      break;
    }
  }
  console.log(`Level ${String(lv.id).padStart(2)} ${lv.title.padEnd(18)} ${L.generateText(lv, { seed: 7, name: 'Sanne' })}`);
}
if (failed) { console.error(`${failed} levels met fouten`); process.exit(1); }
console.log('Alle levels OK');
