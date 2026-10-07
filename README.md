# 🐯 Tiktak Tijger

**Leer typen met een stoere tijger!** Tiktak Tijger is een vrolijke typcursus voor kinderen vanaf groep 3.
Het getik van de toetsen laat de tijger rennen: hoe beter en sneller je kind typt, hoe harder Tiktak gaat
en hoe stoerder hij wordt (bandana, zonnebril, cape en zelfs een kroon!).

## Wat zit erin?

- **Naam invullen bij de start** – de app onthoudt de naam en de voortgang. Meerdere kinderen kunnen op dezelfde laptop
  een eigen speler hebben.
- **Avonturenkaart met 22 levels in 5 werelden**
  1. 🌴 *Thuisrij Jungle* – F J, D K, S L, A, G H en de eerste woordjes
  2. ⛰️ *Bovenrij Bergen* – E I, R U, O T, W P
  3. 🌊 *Onderrij Oceaan* – N M, V B, C Z, X Y Q en alle letters
  4. 🎈 *Hoofdletter Heuvels* – Shift, punt, komma, ? en !, cijfers
  5. 🌋 *Verhalen Vulkaan* – zinnen, snelle zinnen en het eindbaas-verhaal
- **Tiktak begeleidt het kind**: legt elke les uit in een tekstballon en geeft tips en complimentjes.
- **Letters precies zoals op de toetsen**: in de letterlessen en het ballonnenspel staan alle letters als hoofdletters,
  net als op een QWERTY-toetsenbord (dus een L in plaats van een l die op een streepje lijkt). Het kind typt gewoon
  zonder Shift.
- **Toetsenbord en handjes op het scherm** met een kleur per vinger, zodat het kind ziet welke vinger welke toets typt.
- **1 tot 3 sterren per level** (netjes typen + snelheid). Een level gehaald? Dan gaat het volgende open.
- **Tijger-snelheidsmeter**: de tijger rent sneller naarmate het kind sneller typt.
- **Mini-spel Ballonnen knallen** 🎈 met de letters die het kind al kent.
- **Overzicht voor ouders/leerkrachten** in Instellingen (sterren, snelheid en nauwkeurigheid per les).
- Werkt volledig offline; geen account, geen internet, geen reclame.

## Speeltimer voor ouders ⏱️

Via **🔒 Ouders** (startscherm) of **Instellingen → Voor ouders en leerkrachten** stel je een speeltimer in.

- De eerste keer maak je eenmalig een **pincode** (4–6 cijfers). Zonder pincode kan de timer niet worden ingesteld,
  verlengd of gestopt. Na 5 foute pogingen is de invoer 1 minuut geblokkeerd.
- Kies een speeltijd (15, 30, 45, 60 minuten of zelf invullen) en start de timer. Het kind ziet bovenin hoeveel tijd er
  nog over is. Bij 5 minuten komt een melding, de laatste minuut verschijnt een grote aftelling.
- **Is de tijd om, dan wordt de laptop geforceerd afgesloten** (`shutdown /s /f`). Niet-opgeslagen werk in andere
  programma's gaat dan verloren.
- Sluit het kind Tiktak Tijger terwijl de timer loopt, dan verdwijnt de app naar het systeemvak en loopt de timer door.
- Daarna blijft de app op slot tot een ouder met de pincode een nieuwe timer start of de app ontgrendelt.
- Pincode vergeten? Verwijder het bestand `%APPDATA%\Tiktak Tijger\ouder-timer.json` (de voortgang van de kinderen
  blijft bewaard) en maak een nieuwe pincode.

Voortgang wordt bewaard in `%APPDATA%\Tiktak Tijger\tiktak-tijger-data.json`.

Sneltoetsen: **F11** = volledig scherm, **Esc** = pauze.

## MSI downloaden

Elke push bouwt automatisch een Windows-installer via GitHub Actions
(workflow *Bouw Windows MSI*). Open de laatste run onder het tabblad **Actions** en download het artifact
**TiktakTijger-MSI**. Maak je een tag zoals `v1.0.0`, dan komt de MSI ook bij een **Release** te staan.

De MSI installeert de app voor alle gebruikers op de laptop (beheerdersrechten nodig) en maakt een snelkoppeling
op het bureaublad en in het Startmenu. Omdat de installer niet digitaal ondertekend is, kan Windows SmartScreen een
waarschuwing tonen: kies dan *Meer info* → *Toch uitvoeren*.

Stil installeren op meerdere laptops (bijv. op school):

```
msiexec /i TiktakTijger-1.0.0-Setup.msi /qn
```

## Zelf bouwen / ontwikkelen

```bash
npm install
npm start        # app starten
npm test         # controleert dat elke les alleen geleerde letters gebruikt
npm run dist     # MSI bouwen (op Windows)
```

Gemaakt met Electron. Lettertypen: Fredoka en Andika (SIL Open Font License, zie `src/fonts`).

---

Ontwikkeld door **Arnold Kolkman**. © 2026 Arnold Kolkman. Alle rechten voorbehouden.
