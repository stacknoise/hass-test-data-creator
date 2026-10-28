/** The language of a text. */
export type Language = 'de' | 'en';

const en = {
  title: 'Test data',
  badge: 'Test environment',
  tabDevices: 'Devices',
  tabCreate: 'Create',
  tabRemove: 'Remove',
  loading: 'Loading …',
  noDevices: 'No test devices yet. Open "Create" to generate some.',
  colName: 'Name',
  colTemplate: 'Template',
  colArea: 'Area',
  colOutput: 'Output',
  colValues: 'Values',
  colActions: 'Actions',
  loadMore: 'Load more',
  devicesOf: '{shown} of {total} devices',
  remove: 'Remove',
  template: 'Template',
  count: 'Count',
  namePattern: 'Name pattern',
  namePatternHint: 'Placeholders: {n}, {nn}, {template}',
  areas: 'Areas',
  areasHint: 'Comma separated; missing areas are created',
  areaMode: 'Distribution',
  modeEven: 'In turn',
  modeRandom: 'Random',
  seed: 'Seed',
  seedHint: 'Empty uses the seed of the integration',
  customEntities: 'Entities (JSON)',
  customTemplate: 'Custom device',
  preview: 'Preview of the first sensor (24 hours)',
  estimate: '{entities} entities, about {rate} state changes per second',
  rateWarning: 'This is a high load. Raise the tick interval or create fewer entities.',
  create: 'Create devices',
  creating: 'Creating …',
  created: '{count} devices created',
  target: 'What to remove',
  targetAll: 'Everything the integration created',
  targetDevice: 'One device',
  targetRun: 'One creation run',
  targetId: 'Id',
  showPlan: 'Show what will be removed',
  planDevices: '{count} devices',
  planOrphans: '{count} devices found only in the registry',
  planAreas: 'Areas created by the integration that become empty: {names}',
  planNothing: 'Nothing to remove.',
  confirmRemove: 'Remove now',
  removed: '{count} devices removed',
  error: 'Error',
} as const;

/** The key of a text. */
export type TextKey = keyof typeof en;

const de: Record<TextKey, string> = {
  title: 'Testdaten',
  badge: 'Testumgebung',
  tabDevices: 'Geräte',
  tabCreate: 'Erstellen',
  tabRemove: 'Entfernen',
  loading: 'Lade …',
  noDevices: 'Noch keine Testgeräte. Öffne „Erstellen“, um welche zu erzeugen.',
  colName: 'Name',
  colTemplate: 'Vorlage',
  colArea: 'Bereich',
  colOutput: 'Ausgang',
  colValues: 'Werte',
  colActions: 'Aktionen',
  loadMore: 'Mehr laden',
  devicesOf: '{shown} von {total} Geräten',
  remove: 'Entfernen',
  template: 'Vorlage',
  count: 'Anzahl',
  namePattern: 'Namensmuster',
  namePatternHint: 'Platzhalter: {n}, {nn}, {template}',
  areas: 'Bereiche',
  areasHint: 'Kommagetrennt; fehlende Bereiche werden angelegt',
  areaMode: 'Verteilung',
  modeEven: 'Der Reihe nach',
  modeRandom: 'Zufällig',
  seed: 'Seed',
  seedHint: 'Leer nutzt den Seed der Integration',
  customEntities: 'Entitäten (JSON)',
  customTemplate: 'Eigenes Gerät',
  preview: 'Vorschau des ersten Sensors (24 Stunden)',
  estimate: '{entities} Entitäten, etwa {rate} Zustandsänderungen pro Sekunde',
  rateWarning: 'Das ist eine hohe Last. Erhöhe das Tick-Intervall oder erzeuge weniger Entitäten.',
  create: 'Geräte erstellen',
  creating: 'Erstelle …',
  created: '{count} Geräte erstellt',
  target: 'Was entfernt werden soll',
  targetAll: 'Alles, was die Integration erzeugt hat',
  targetDevice: 'Ein Gerät',
  targetRun: 'Ein Erstellungslauf',
  targetId: 'Id',
  showPlan: 'Anzeigen, was entfernt wird',
  planDevices: '{count} Geräte',
  planOrphans: '{count} Geräte, die nur in der Registry stehen',
  planAreas: 'Von der Integration angelegte Bereiche, die leer werden: {names}',
  planNothing: 'Es gibt nichts zu entfernen.',
  confirmRemove: 'Jetzt entfernen',
  removed: '{count} Geräte entfernt',
  error: 'Fehler',
};

const texts: Record<Language, Record<TextKey, string>> = { en, de };

/** Return the language for a Home Assistant language code; German for "de" variants. */
export function languageOf(code: string | undefined): Language {
  return code?.toLowerCase().startsWith('de') ? 'de' : 'en';
}

/** Return the text `key` in `language` with `{name}` fields filled from `values`. */
export function t(
  language: Language,
  key: TextKey,
  values: Record<string, string | number> = {},
): string {
  return texts[language][key].replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}

/** Return the keys of a language; used by the test that both languages are complete. */
export function keysOf(language: Language): string[] {
  return Object.keys(texts[language]);
}
