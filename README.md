# GEARSPARK — Rechtstexte

Datenschutzerklärung, Nutzungsbedingungen und der Warnhinweis zu Blitzen und
flackernden Effekten für die App **GEARSPARK**.

Dieses Repository ist öffentlich, weil der Play Store eine erreichbare Adresse
für die Datenschutzerklärung verlangt. Der Quelltext der App liegt woanders und
bleibt privat.

## Warum ein Generator statt fertiger Seiten

Die Texte stehen in der App in `frontend/src/recht.js`. Sie hier ein zweites
Mal zu pflegen wäre der sichere Weg in den Widerspruch: Irgendwann stünde in
der App etwas anderes als im Netz, und im Zweifel gilt beides gegen uns.

Deshalb erzeugt `tools/seiten-bauen.mjs` die Seiten aus derselben Quelle:

```bash
node tools/seiten-bauen.mjs
```

## Impressum

Für ein geschäftsmäßiges Angebot in Deutschland ist ein Impressum mit
ladungsfähiger Anschrift Pflicht. Die Angaben stehen in `impressum.json`
(nicht im Repository — es sind persönliche Daten). Eine Vorlage liegt als
`impressum.json.vorlage` bei. Fehlt die Datei, entfällt die Seite; ein
Impressum mit Platzhaltern wäre schlechter als keines.
