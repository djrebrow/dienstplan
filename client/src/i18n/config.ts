import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  de: {
    translation: {
      title: 'Dienstplan (4 Wochen)',
      addEmployee: 'Mitarbeiter hinzufügen',
      remove: 'Entfernen',
      save: 'Speichern',
      exportExcel: 'Export nach Excel',
      exportPdf: 'Export nach PDF',
      importExcel: 'Import aus Excel',
      undo: 'Rückgängig',
      redo: 'Wiederholen',
      filters: 'Filter',
      employee: 'Mitarbeiter',
      shift: 'Schicht',
      legend: 'Legende',
      notes: 'Hinweise',
      statistics: 'Statistik',
      adminArea: 'Adminbereich',
      publicView: 'Öffentliche Ansicht',
      calendarSettings: 'Kalenderbasis',
      startDate: 'Startdatum',
      weeks: 'Wochen',
      includeExisting: 'Bestehende Einträge übernehmen',
      apply: 'Übernehmen',
      employees: 'Mitarbeiterliste',
      weekLabel: 'Woche {{index}}',
      adminPasswordPrompt: 'Bitte Admin-Passwort eingeben:',
      adminPasswordInvalid: 'Das Passwort ist ungültig.'
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'de',
  fallbackLng: 'de',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
