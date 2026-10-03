/* Tiktak Tijger - lessen, werelden en tekstgenerator
 * De lessen volgen de klassieke blinde-typmethode: eerst de thuisrij,
 * dan de bovenste rij, de onderste rij, hoofdletters, leestekens en cijfers.
 * Woorden zijn eenvoudig en passen bij kinderen vanaf groep 3.
 */
(function (root) {
  'use strict';

  const WORLDS = [
    { id: 1, name: 'Thuisrij Jungle', emoji: '🌴', color: '#2dc653', dark: '#1a7f37' },
    { id: 2, name: 'Bovenrij Bergen', emoji: '⛰️', color: '#4cc9f0', dark: '#1d6fa3' },
    { id: 3, name: 'Onderrij Oceaan', emoji: '🌊', color: '#4361ee', dark: '#23338f' },
    { id: 4, name: 'Hoofdletter Heuvels', emoji: '🎈', color: '#f15bb5', dark: '#a0306f' },
    { id: 5, name: 'Verhalen Vulkaan', emoji: '🌋', color: '#ff6b35', dark: '#b13c0f' }
  ];

  // type: keys = nieuwe toetsen oefenen, words = woordjes, shift, punct, digits, sentences, story
  const LEVELS = [
    { id: 1, world: 1, type: 'keys', newKeys: ['f', 'j'], title: 'F en J', length: 34, target: 18,
      intro: 'Voel eens op de F en de J. Daar zitten kleine bultjes! Daar wonen je wijsvingers.' },
    { id: 2, world: 1, type: 'keys', newKeys: ['d', 'k'], title: 'D en K', length: 38, target: 20,
      intro: 'Je middelvingers liggen naast je wijsvingers, op de D en de K.' },
    { id: 3, world: 1, type: 'keys', newKeys: ['s', 'l'], title: 'S en L', length: 40, target: 20,
      intro: 'Nu doen je ringvingers mee. Die liggen op de S en de L.' },
    { id: 4, world: 1, type: 'keys', newKeys: ['a'], title: 'De A', length: 42, target: 22,
      intro: 'Je linker pink is klein maar stoer. Hij typt de A!' },
    { id: 5, world: 1, type: 'keys', newKeys: ['g', 'h'], title: 'G en H', length: 44, target: 22,
      intro: 'Je wijsvingers zijn sterk. Ze stappen even opzij naar de G en de H.' },
    { id: 6, world: 1, type: 'words', newKeys: [], title: 'Jungle woordjes', length: 50, target: 24,
      intro: 'Met de thuisrij kun je al echte woorden typen! Kijk maar: jas, kaas en sla.' },

    { id: 7, world: 2, type: 'keys', newKeys: ['e', 'i'], title: 'E en I', length: 48, target: 24,
      intro: 'We klimmen de berg op! Je middelvinger stapt omhoog naar de E en de I.' },
    { id: 8, world: 2, type: 'keys', newKeys: ['r', 'u'], title: 'R en U', length: 50, target: 26,
      intro: 'Je wijsvingers klimmen omhoog naar de R en de U.' },
    { id: 9, world: 2, type: 'keys', newKeys: ['o', 't'], title: 'O en T', length: 52, target: 26,
      intro: 'De O typ je met je rechter ringvinger. De T met je linker wijsvinger.' },
    { id: 10, world: 2, type: 'keys', newKeys: ['w', 'p'], title: 'W en P', length: 54, target: 28,
      intro: 'De W is voor je linker ringvinger, de P voor je rechter pink.' },
    { id: 11, world: 2, type: 'words', newKeys: [], title: 'Berg woordjes', length: 60, target: 30,
      intro: 'Wat ben jij goed bezig! Nu typen we woorden met de bovenste rij.' },

    { id: 12, world: 3, type: 'keys', newKeys: ['n', 'm'], title: 'N en M', length: 56, target: 30,
      intro: 'Duik mee de oceaan in! Je rechter wijsvinger zakt naar de N en de M.' },
    { id: 13, world: 3, type: 'keys', newKeys: ['v', 'b'], title: 'V en B', length: 58, target: 30,
      intro: 'Je linker wijsvinger zakt naar beneden voor de V en de B.' },
    { id: 14, world: 3, type: 'keys', newKeys: ['c', 'z'], title: 'C en Z', length: 58, target: 32,
      intro: 'De Z is voor je linker pink, de C voor je linker middelvinger.' },
    { id: 15, world: 3, type: 'keys', newKeys: ['x', 'y', 'q'], title: 'X, Y en Q', length: 58, target: 32,
      intro: 'Dit zijn zeldzame letters! De X, de Y en de Q. Taxi, pony en quiz!' },
    { id: 16, world: 3, type: 'words', newKeys: [], title: 'Alle letters', length: 70, target: 34,
      intro: 'Je kent nu ALLE letters! Laten we laten zien wat je kunt.' },

    { id: 17, world: 4, type: 'shift', newKeys: ['shift'], title: 'Hoofdletters', length: 60, target: 30,
      intro: 'Een hoofdletter maak je met Shift. Houd Shift ingedrukt met je pink van de andere hand.' },
    { id: 18, world: 4, type: 'punct', newKeys: ['.', ',', '?', '!'], title: 'Punt, komma, ?, !', length: 70, target: 34,
      intro: 'Een zin eindigt met een punt. De punt typ je met je rechter ringvinger.' },
    { id: 19, world: 4, type: 'digits', newKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'], title: 'Cijfers', length: 60, target: 30,
      intro: 'Cijfers staan helemaal bovenaan. Strek je vingers maar flink uit!' },

    { id: 20, world: 5, type: 'sentences', newKeys: [], title: 'Zinnen', length: 90, target: 40,
      intro: 'Nu typen we hele zinnen. Vergeet de hoofdletter en de punt niet!' },
    { id: 21, world: 5, type: 'sentences', newKeys: [], title: 'Snelle zinnen', length: 110, target: 50,
      intro: 'Laat je tijger rennen! Hoe sneller en netter je typt, hoe harder hij gaat.' },
    { id: 22, world: 5, type: 'story', newKeys: [], title: 'Eindbaas verhaal', length: 140, target: 60,
      intro: 'Dit is het eindbaas level! Typ het hele verhaal. Jij kunt dit!' }
  ];

  // Volgorde waarin letters geleerd worden (cumulatief per level)
  (function computeKnownKeys() {
    let known = [];
    for (const lv of LEVELS) {
      if (lv.type === 'keys') known = known.concat(lv.newKeys);
      lv.keys = known.slice();
    }
  })();

  // Eenvoudige Nederlandse woorden, zonder accenten.
  const WORDS = (
    'ja al als las das dak dal gas gal had hal haal jas kaas kas lak sla slag glas haak haas kaal laag gaf af dag lag ' +
    'klad hak half kalf ga sjaal hals slak glad jaag laf haha aha gala kajak ' +
    'ik is die dij deel heel lief kijk hij ijs eik geel keel leeg heks lijf lied elf gek gele fee fles idee ijsje kies ' +
    'lees dief elk hek jij alles slee dijk hiel deeg egel gelijk dikke kade sik lik dek lek les eis haai saai ' +
    'juf jurk kar kerk rek reus greep gras krul duur hier huid durf sluis uil ruig fris druk slurf kers rups dier ' +
    'geur deur raar ruik huis duik druif grijs rijk uur kus regel ruil suiker uk lucifer ' +
    'rood tot taart tas tijger tak oor oog ook rots kat hoed gooi goed taal tafel tol hok kok lol otter tijd trots ' +
    'stoel kist sterk tikken tiktak dorst drie stoer slot hut rat ster staart fruit ruit hagel kikker lekker oude ' +
    'pop poes peer wit wolk water weg wiel wip pet wesp worm wortel pret sport spel twee wolf werk pauw ' +
    'potlood piraat tuig iglo pootje ' +
    'maan man muis mes neus nest noot mama kind nat nu mooi maar melk mier tante oma dans mand hand hond kom ren ' +
    'lente tent trein molen meneer naam nee niet tien negen een rennen snel opa pinda pan pen paard appel winter ' +
    'wind spin spelen poten prinses wereld spring ' +
    'boom bal bed boek boot bij beer vis vos vogel vier vijf bloem brood broek bus band bank vlinder ver vuur vrij ' +
    'vriend bos bord bril boer boter vlag verf banaan beker vijver bever ' +
    'zon zee zes zeven zand zak zus zingen zwart zwemmen zebra ezel circus cadeau citroen clown zoet zomer zwaan ' +
    'zitten puzzel pizza cactus ' +
    'taxi quiz pony baby hobby extra mix yoghurt xylofoon jacht'
  ).split(/\s+/).filter(Boolean);

  const NAMES = ['Anna', 'Bram', 'Daan', 'Emma', 'Fleur', 'Lotte', 'Noah', 'Sem', 'Tim', 'Zoe', 'Mila', 'Luuk',
    'Sara', 'Finn', 'Julia', 'Ties', 'Nina', 'Jesse'];
  const CAPWORDS = ['Tiktak', 'Tijger', 'Amsterdam', 'Utrecht', 'Holland', 'Maandag', 'Zaterdag', 'Zomer', 'Ik',
    'Jij', 'Wij', 'De', 'Het', 'Een', 'Mama', 'Papa', 'Oma', 'Opa', 'Juf', 'Meester'];

  const PUNCT_SENTENCES = [
    'Ik zie een kat.', 'Jij ook?', 'Wat leuk!', 'Ik heb een appel, een peer en een banaan.', 'Kom je spelen?',
    'Hoera!', 'De zon is warm.', 'Is dat een tijger?', 'Ja, dat is Tiktak!', 'Ren, tijger, ren!', 'Waar is mijn pet?',
    'Ik lees een boek.', 'Help!', 'Ik ben blij.', 'Wil jij een ijsje?', 'Het regent, dus ik pak mijn jas.'
  ];

  const DIGIT_SENTENCES = [
    'Ik ben 7 jaar.', 'Er zijn 7 dagen in een week.', 'Ik heb 10 vingers.', 'Een tijger heeft 4 poten.',
    'Ik tel 1 2 3 4 5.', 'Er zitten 12 eieren in de doos.', 'Mijn huis heeft nummer 25.', 'Ik zie 3 vogels.',
    'Om 8 uur gaat de bel.', 'Er zijn 30 kinderen in de klas.', 'Tel mee met 6 7 8 9 10!'
  ];

  const SENTENCES = [
    'De tijger rent door de jungle.', 'Ik typ met tien vingers.', 'Tiktak is een stoere tijger.',
    'Mijn juf heeft een rode fiets.', 'De vogel zingt in de boom.', 'Wij gaan naar het strand.',
    'De kat slaapt op de bank.', 'Papa bakt een grote taart.', 'Het is koud, dus ik draag een muts.',
    'Wil jij met mij spelen?', 'De aap eet een banaan.', 'Ik vind zwemmen heel leuk!', 'Oma leest een boek voor.',
    'De hond rent naar de bal.', 'In de zomer eten we een ijsje.', 'Mijn vriend woont naast de school.',
    'De maan schijnt in de nacht.', 'Een zebra heeft zwarte strepen.', 'Ik poets mijn tanden.',
    'De trein rijdt heel snel.', 'Kijk, daar vliegt een vlinder!', 'Wat eten we vanavond?'
  ];

  const STORIES = [
    'Tiktak Tijger woont in de jungle. Elke dag rent hij naar de rivier. Daar drinkt hij water. Dan roept hij heel hard. Ik ben de snelste tijger van de hele wereld!',
    'Op een dag vindt Tiktak een toetsenbord in het gras. Hij tikt op de toetsen. Tik, tak, tik! Hoe meer hij typt, hoe harder hij kan rennen. Wat een avontuur!',
    'De aap wil een wedstrijd doen. Klaar? Af! De aap klimt in een boom, maar Tiktak rent als de wind. Wie wint er? Tiktak natuurlijk, want hij heeft goed geoefend.',
    'Het is avond in de jungle. De sterren schijnen en de uil roept oehoe. Tiktak is moe van het rennen. Hij ligt op een groot blad en droomt van nieuwe letters.'
  ];

  // Seedbare random generator, zodat tests voorspelbaar zijn.
  function makeRng(seed) {
    let s = (seed >>> 0) || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5; s >>>= 0;
      return (s >>> 0) / 4294967296;
    };
  }

  function pick(arr, rng) { return arr[Math.floor(rng() * arr.length)]; }

  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function wordsFor(keys) {
    const set = new Set(keys);
    return WORDS.filter((w) => [...w].every((c) => set.has(c)));
  }

  function drillGroup(newKeys, known, rng) {
    const len = 2 + Math.floor(rng() * 3);
    let g = '';
    // Begin vaak met een herhaling van dezelfde letter: fff jjj
    if (rng() < 0.35) {
      const c = pick(newKeys, rng);
      return c.repeat(3);
    }
    for (let i = 0; i < len; i++) {
      g += rng() < 0.65 ? pick(newKeys, rng) : pick(known, rng);
    }
    return g;
  }

  // Voeg stukjes toe tot de gewenste lengte bereikt is.
  function fill(producer, length) {
    const parts = [];
    let total = 0;
    let guard = 0;
    while (total < length && guard++ < 500) {
      const p = producer(parts);
      if (!p) continue;
      parts.push(p);
      total += p.length + 1;
    }
    return parts.join(' ');
  }

  function noRepeat(producer) {
    return function (parts) {
      for (let i = 0; i < 5; i++) {
        const p = producer();
        if (p !== parts[parts.length - 1]) return p;
      }
      return producer();
    };
  }

  function generateText(level, opts) {
    opts = opts || {};
    const rng = makeRng(opts.seed || Date.now());
    const childName = (opts.name || '').trim();
    const len = level.length;

    switch (level.type) {
      case 'keys': {
        const known = level.keys;
        const all = wordsFor(known);
        const fresh = all.filter((w) => level.newKeys.some((k) => w.includes(k)));
        const pool = fresh.length >= 3 ? fresh : all;
        let wordTurn = 0;
        return fill(noRepeat(() => {
          wordTurn++;
          // Eerst wat drillen, daarna steeds vaker echte woorden.
          const useWord = pool.length > 0 && wordTurn > 3 && rng() < 0.55;
          return useWord ? pick(pool, rng) : drillGroup(level.newKeys, known, rng);
        }), len);
      }
      case 'words': {
        const prevKeys = LEVELS.filter((l) => l.id < level.id && l.type === 'keys').pop().keys;
        const pool = wordsFor(prevKeys);
        return fill(noRepeat(() => pick(pool, rng)), len);
      }
      case 'shift': {
        const names = childName && /^[A-Za-z]+$/.test(childName) ? NAMES.concat([childName, childName]) : NAMES;
        const lower = wordsFor('abcdefghijklmnopqrstuvwxyz'.split(''));
        return fill(noRepeat(() => {
          const r = rng();
          if (r < 0.4) return pick(names, rng);
          if (r < 0.7) return pick(CAPWORDS, rng);
          const w = pick(lower, rng);
          return w[0].toUpperCase() + w.slice(1);
        }), len);
      }
      case 'punct': {
        const pool = shuffle(PUNCT_SENTENCES, rng);
        let i = 0;
        return fill(() => pool[i++ % pool.length], len);
      }
      case 'digits': {
        const pool = shuffle(DIGIT_SENTENCES, rng);
        let i = 0;
        return fill(noRepeat(() => {
          if (rng() < 0.45) {
            // Cijferdrill zoals 12 34 5 67
            const n = 1 + Math.floor(rng() * 3);
            let s = '';
            for (let i = 0; i < n; i++) s += String(Math.floor(rng() * 10));
            return s;
          }
          return pool[i++ % pool.length];
        }), len);
      }
      case 'sentences': {
        const pool = shuffle(SENTENCES, rng);
        let i = 0;
        return fill(() => pool[i++ % pool.length], len);
      }
      case 'story':
        return pick(STORIES, rng);
      default:
        return 'fff jjj fj jf';
    }
  }

  function levelById(id) { return LEVELS.find((l) => l.id === id); }

  // Sterren: 1 = gehaald, 2 = netjes, 3 = netjes en snel
  function starsFor(level, accuracy, cpm) {
    if (accuracy < 70) return 0;
    if (accuracy >= 93 && cpm >= level.target) return 3;
    if (accuracy >= 85) return 2;
    return 1;
  }

  // De tijger wordt stoerder naarmate het kind sneller typt (beste tekens per minuut).
  const RANKS = [
    { min: 0, name: 'Tijgerwelpje', gear: [] },
    { min: 20, name: 'Speelse Tijger', gear: ['bandana'] },
    { min: 35, name: 'Snelle Tijger', gear: ['bandana', 'sweatband'] },
    { min: 55, name: 'Stoere Tijger', gear: ['bandana', 'sunglasses'] },
    { min: 80, name: 'Raket Tijger', gear: ['bandana', 'sunglasses', 'cape'] },
    { min: 110, name: 'Bliksem Tijger', gear: ['bandana', 'sunglasses', 'cape', 'crown'] }
  ];

  function rankFor(cpm) {
    let idx = 0;
    RANKS.forEach((r, i) => { if (cpm >= r.min) idx = i; });
    return Object.assign({ index: idx }, RANKS[idx]);
  }

  const api = { WORLDS, LEVELS, WORDS, RANKS, generateText, levelById, starsFor, rankFor, wordsFor, makeRng };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TTLevels = api;
})(typeof window !== 'undefined' ? window : globalThis);
