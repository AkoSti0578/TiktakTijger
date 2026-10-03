/* Tiktak Tijger - opslag van spelers en voortgang.
 * In de Windows-app wordt alles in een bestand in %APPDATA%\Tiktak Tijger bewaard,
 * in een gewone browser valt het terug op localStorage.
 */
(function (root) {
  'use strict';
  const KEY = 'tiktak-tijger-data';
  const COLORS = ['#ff6b6b', '#4cc9f0', '#06d6a0', '#9b5de5', '#ffd166', '#f15bb5', '#ff9f1c', '#4361ee'];

  let data = null;
  let saveTimer = null;

  function empty() {
    return { version: 1, lastProfileId: null, profiles: [] };
  }

  async function load() {
    let d = null;
    try {
      if (root.tiktak && root.tiktak.load) d = await root.tiktak.load();
      else d = JSON.parse(localStorage.getItem(KEY) || 'null');
    } catch (e) { d = null; }
    data = d && Array.isArray(d.profiles) ? d : empty();
    return data;
  }

  function saveNow() {
    clearTimeout(saveTimer);
    try {
      if (root.tiktak && root.tiktak.save) root.tiktak.save(data);
      else localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) { console.warn('Opslaan mislukt', e); }
  }

  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 150);
  }

  function createProfile(name) {
    const p = {
      id: 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1000),
      name: name.trim().slice(0, 20),
      color: COLORS[data.profiles.length % COLORS.length],
      created: new Date().toISOString(),
      levels: {},
      bestCpm: 0,
      balloonHigh: 0,
      totalChars: 0,
      settings: { sound: true, voice: true }
    };
    data.profiles.push(p);
    data.lastProfileId = p.id;
    saveNow();
    return p;
  }

  function removeProfile(id) {
    data.profiles = data.profiles.filter((p) => p.id !== id);
    if (data.lastProfileId === id) data.lastProfileId = data.profiles[0] ? data.profiles[0].id : null;
    saveNow();
  }

  function getProfile(id) { return data.profiles.find((p) => p.id === id) || null; }

  function setCurrent(id) { data.lastProfileId = id; save(); }

  root.TTStore = {
    load, save, saveNow, createProfile, removeProfile, getProfile, setCurrent,
    get data() { return data; }
  };
  window.addEventListener('beforeunload', () => { if (data) saveNow(); });
})(window);
