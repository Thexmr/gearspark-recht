/**
 * Baut die Rechtsseiten fuer das Netz aus denselben Texten, die in der App
 * stehen.
 *
 * Der Play Store verlangt eine oeffentlich erreichbare Datenschutzerklaerung
 * als Adresse — ohne sie laesst sich nichts veroeffentlichen. Die Texte
 * zweimal zu pflegen waere aber der sichere Weg in den Widerspruch: Irgendwann
 * steht in der App etwas anderes als im Netz, und im Zweifel gilt beides
 * gegen uns.
 *
 * Deshalb dieser Weg: Quelle ist `frontend/src/recht.js`, alles andere wird
 * daraus erzeugt. Aendert sich ein Text, laeuft dieses Skript und beide Seiten
 * stimmen wieder ueberein.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { WARNUNG_EPILEPSIE, DATENSCHUTZ, AGB, IMPRESSUM, RECHT_FASSUNG } from "../../frontend/src/recht.js";

const hier = dirname(fileURLToPath(import.meta.url));
const ziel = join(hier, "..", "docs");
mkdirSync(ziel, { recursive: true });

/** Macht aus den Absaetzen mit **Fett** lesbares HTML. */
const absaetze = (text) =>
  text
    .split("\n\n")
    .map((a) =>
      `<p>${a
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>")}</p>`,
    )
    .join("\n");

const STIL = `
:root{--grund:#0b0e18;--karte:#141827;--text:#eceaf4;--matt:#9a9ab4;--lila:#9858ff;--rand:rgba(255,255,255,.09)}
*{box-sizing:border-box}
body{margin:0;padding:0;background:var(--grund);color:var(--text);
  font:16px/1.7 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
header{padding:38px 20px 30px;text-align:center;border-bottom:1px solid var(--rand)}
header h1{margin:0 0 6px;font-size:26px;letter-spacing:.01em}
header p{margin:0;color:var(--matt);font-size:14px}
nav{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;padding:18px 20px 0}
nav a{padding:8px 14px;border:1px solid var(--rand);border-radius:9px;
  color:var(--text);text-decoration:none;font-size:13px;font-weight:600}
nav a:hover{border-color:var(--lila)}
nav a[aria-current]{background:var(--lila);border-color:var(--lila);color:#fff}
main{max-width:760px;margin:0 auto;padding:26px 20px 70px}
article{background:var(--karte);border:1px solid var(--rand);border-radius:14px;padding:26px 24px}
article h2{margin:0 0 4px;font-size:20px}
.stand{margin:0 0 20px;color:var(--matt);font-size:13px}
p{margin:0 0 14px}
strong{color:#fff}
.warnung{border-color:rgba(255,180,60,.35);background:rgba(255,170,40,.07)}
.warnung h2{color:#ffd37a}
footer{max-width:760px;margin:0 auto;padding:0 20px 50px;color:var(--matt);font-size:12px;line-height:1.7}
footer a{color:var(--lila)}
@media (prefers-color-scheme:light){
  :root{--grund:#f6f6fa;--karte:#fff;--text:#16161d;--matt:#5c5c72;--rand:rgba(0,0,0,.10)}
  strong{color:#000}
}
`;

const seite = (titel, inhalt, aktiv) => `<!doctype html>
<html lang="de"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${titel} — Gearspark</title>
<meta name="description" content="${titel} der App GEARSPARK.">
<style>${STIL}</style>
</head><body>
<header><h1>Gearspark</h1><p>Videoeffekte für Aufnahmen von Kampfkreiseln</p></header>
<nav>
  <a href="./" ${aktiv === "start" ? 'aria-current="page"' : ""}>Übersicht</a>
  <a href="./datenschutz.html" ${aktiv === "datenschutz" ? 'aria-current="page"' : ""}>Datenschutz</a>
  <a href="./nutzungsbedingungen.html" ${aktiv === "agb" ? 'aria-current="page"' : ""}>Nutzungsbedingungen</a>
  <a href="./warnhinweis.html" ${aktiv === "warnung" ? 'aria-current="page"' : ""}>Warnhinweis</a>
  ${impressum ? `<a href="./impressum.html" ${aktiv === "impressum" ? 'aria-current="page"' : ""}>Impressum</a>` : ""}
</nav>
<main>${inhalt}</main>
<footer>
  <p>Gearspark · Fassung der Rechtstexte ${RECHT_FASSUNG}${impressum ? ` · <a href="./impressum.html">Impressum</a>` : ""}</p>
  <p>Gearspark ist ein eigenständiges Werkzeug und steht mit keinem Hersteller
     von Spielzeugkreiseln in Verbindung.</p>
</footer>
</body></html>`;

/**
 * Die Impressumsangaben, falls hinterlegt.
 *
 * In Deutschland braucht ein geschaeftsmaessiges Angebot ein Impressum mit
 * ladungsfaehiger Anschrift — bei einer kostenpflichtigen App ist das der
 * Fall. Die Angaben stehen in `impressum.json` neben diesem Ordner und liegen
 * bewusst **nicht** in der Versionsverwaltung: Es sind Privatanschrift und
 * Kontaktdaten einer Person.
 *
 * Fehlt die Datei, wird keine Impressumsseite erzeugt und der Menuepunkt
 * entfaellt. Ein Impressum mit Platzhaltern waere schlechter als keines — es
 * saehe fertig aus und waere doch falsch.
 */
// Das Impressum kommt aus denselben Texten wie alles andere.
//
// Frueher stand es in einer eigenen `impressum.json`, die bewusst nicht
// mitversioniert wurde — es sind Privatanschrift und Kontaktdaten. Der
// Gedanke war richtig und traegt trotzdem nicht: Sobald das Impressum auch
// in der App steht, und dort muss es stehen, liegt die Anschrift ohnehin in
// jedem ausgelieferten Paket. Zwei Quellen haetten nur den einen Effekt
// gehabt, den dieses Skript verhindern soll — dass im Netz etwas anderes
// steht als in der App.
const impressum = IMPRESSUM;

const dateien = {
  "index.html": seite(
    "Übersicht",
    `<article>
      <h2>Rechtliche Hinweise zu Gearspark</h2>
      <p class="stand">Fassung ${RECHT_FASSUNG}</p>
      <p>Gearspark versieht deine eigenen Videoaufnahmen mit Effekten. Analyse und
      Rendering laufen vollständig auf deinem Gerät — es gibt keinen Server, auf den
      Aufnahmen hochgeladen werden.</p>
      <p>Auf diesen Seiten findest du die <a href="./datenschutz.html">Datenschutzerklärung</a>,
      die <a href="./nutzungsbedingungen.html">Nutzungsbedingungen</a> und den
      <a href="./warnhinweis.html">Warnhinweis zu Blitzen und flackernden Effekten</a>.
      Dieselben Texte stehen in der App unter Einstellungen.</p>
    </article>`,
    "start",
  ),
  "datenschutz.html": seite(
    DATENSCHUTZ.titel,
    `<article><h2>${DATENSCHUTZ.titel}</h2>
      <p class="stand">Stand ${DATENSCHUTZ.stand}</p>
      ${absaetze(DATENSCHUTZ.text)}</article>`,
    "datenschutz",
  ),
  "nutzungsbedingungen.html": seite(
    AGB.titel,
    `<article><h2>${AGB.titel}</h2>
      <p class="stand">Stand ${AGB.stand}</p>
      ${absaetze(AGB.text)}</article>`,
    "agb",
  ),
  "warnhinweis.html": seite(
    WARNUNG_EPILEPSIE.titel,
    `<article class="warnung"><h2>${WARNUNG_EPILEPSIE.titel}</h2>
      ${absaetze(WARNUNG_EPILEPSIE.text)}</article>`,
    "warnung",
  ),
};

dateien["impressum.html"] = seite(
  IMPRESSUM.titel,
  `<article><h2>${IMPRESSUM.titel}</h2>
    <p class="stand">Angaben gemäß § 5 DDG</p>
    ${absaetze(IMPRESSUM.text)}</article>`,
  "impressum",
);

for (const [name, inhalt] of Object.entries(dateien)) {
  writeFileSync(join(ziel, name), inhalt);
  console.log("geschrieben:", name);
}
