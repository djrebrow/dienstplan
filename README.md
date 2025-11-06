# Dienstplan

Eine komplette Dienstplanlösung für vierwöchige Planungszeiträume mit serverseitiger Persistenz, Undo/Redo und Exportfunktionen.

## Struktur

- `client/` – React-Frontend mit Tabulator-Integration, Internationalisierung und responsivem Layout.
- `server/` – Express-Backend mit JSON-Dateispeicher zur Ablage der Planungsdaten.

## Entwicklung starten

```bash
# Abhängigkeiten installieren
npm install --prefix client
npm install --prefix server

# Backend im Entwicklungsmodus starten (Port 4000)
npm run dev --prefix server

# Frontend starten (Port 5173)
npm run dev --prefix client
```

Das Frontend proxied API-Aufrufe nach `http://localhost:4000`.

## Produktion

```bash
npm run build --prefix client
npm run build --prefix server
```

Die gebauten Artefakte liegen anschließend in `client/dist` sowie `server/dist`.

## Funktionsumfang

- Interaktive Tabelleneingabe mit Dropdowns, Kontextmenü, Tastaturkürzeln sowie Copy & Paste (Tabulator).
- Undo/Redo (50 Schritte) über eine Zustand-Store-Historie.
- REST-API zur serverseitigen Persistenz der kompletten Planungsdaten.
- Import/Export nach Excel (XLSX) sowie Export nach PDF (A3 quer, CMYK-freundliche Farben).
- Statistik je Mitarbeiter und Woche, Legende mit editierbaren Beschreibungstexten sowie frei editierbare Hinweise.
- Filter nach Mitarbeitername und Schichttyp sowie High-Contrast-Modus.
- Feiertagslogik für Niedersachsen mit automatisch gesperrten, gelb markierten Spalten.
- Druckoptimierte Ansicht mit Sticky-Header und responsivem Einspaltenlayout auf Mobilgeräten.
- Bearbeitbare Mitarbeiterliste inklusive Reihenfolge-Steuerung.
- Kalender-Dialog zur Neuberechnung des Planungszeitraums (inkl. optionaler Übernahme bestehender Einträge).
- Getrennter Adminbereich (Bearbeitung) und öffentlicher schreibgeschützter Modus.

## Tests

Derzeit sind keine automatisierten Tests hinterlegt. Eine manuelle Prüfung umfasst das Starten von Server und Client sowie die Interaktion mit dem UI.
