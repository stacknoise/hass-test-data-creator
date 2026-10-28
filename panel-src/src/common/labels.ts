import { languageOf, type Language, type TextKey } from './i18n';

/** The kinds of value that the backend names with an id: the id is translated, never shown raw. */
export type LabelKind = 'shape' | 'action' | 'fault' | 'platform' | 'template' | 'entity' | 'state';

const en: Record<LabelKind, Record<string, string>> = {
  shape: {
    constant: 'Constant',
    sine: 'Sine',
    saw: 'Sawtooth',
    square: 'Square',
    triangle: 'Triangle',
    noise: 'Noise',
    random_walk: 'Random walk',
    household_load: 'Household load',
    pv_day: 'Photovoltaic day',
    steps: 'Steps',
    discharge: 'Discharge',
    counter: 'Counter',
    enum: 'Enumeration',
    state_machine: 'State sequence',
  },
  action: {
    turn_on: 'Turn on',
    turn_off: 'Turn off',
    toggle: 'Toggle',
    set_on: 'Set to on',
    set_off: 'Set to off',
    pulse: 'Pulse',
    press: 'Press',
    set_brightness: 'Set brightness',
    open: 'Open',
    close: 'Close',
    set_position: 'Set position',
    set_temperature: 'Set temperature',
  },
  fault: {
    unavailable: 'Unavailable',
    dropout: 'Dropout',
    frozen: 'Frozen',
    spike: 'Spike',
    battery_low: 'Battery low',
    linkquality_drop: 'Link quality drop',
    late: 'Late messages',
    duplicate: 'Duplicate messages',
  },
  platform: {
    sensor: 'Sensor',
    binary_sensor: 'Binary sensor',
    switch: 'Switch',
    light: 'Light',
    cover: 'Blind',
    climate: 'Thermostat',
    event: 'Event',
  },
  template: {
    climate_sensor: 'Climate sensor',
    contact_sensor: 'Contact sensor',
    cover: 'Blind',
    light: 'Dimmable light',
    motion_sensor: 'Motion sensor',
    plug_metering: 'Plug with metering',
    thermostat: 'Thermostat',
    wall_button: 'Wall button',
    washer: 'Washing machine',
  },
  entity: {
    action: 'Action',
    battery: 'Battery',
    contact: 'Contact',
    cover: 'Blind',
    current: 'Current',
    door: 'Door',
    energy: 'Energy',
    humidity: 'Humidity',
    illuminance: 'Illuminance',
    light: 'Light',
    linkquality: 'Link quality',
    motion: 'Motion',
    power: 'Power',
    pressure: 'Pressure',
    program: 'Program',
    state: 'Switch',
    temperature: 'Temperature',
    thermostat: 'Thermostat',
    voltage: 'Voltage',
  },
  state: {
    on: 'on',
    off: 'off',
    open: 'open',
    closed: 'closed',
    opening: 'opening',
    closing: 'closing',
    heat: 'heating',
    unavailable: 'unavailable',
    unknown: 'unknown',
  },
};

const de: Record<LabelKind, Record<string, string>> = {
  shape: {
    constant: 'Konstant',
    sine: 'Sinus',
    saw: 'Sägezahn',
    square: 'Rechteck',
    triangle: 'Dreieck',
    noise: 'Rauschen',
    random_walk: 'Zufallsweg',
    household_load: 'Haushaltslast',
    pv_day: 'Photovoltaik-Tag',
    steps: 'Treppe',
    discharge: 'Entladung',
    counter: 'Zähler',
    enum: 'Aufzählung',
    state_machine: 'Zustandsfolge',
  },
  action: {
    turn_on: 'Einschalten',
    turn_off: 'Ausschalten',
    toggle: 'Umschalten',
    set_on: 'Auf „an“ setzen',
    set_off: 'Auf „aus“ setzen',
    pulse: 'Impuls',
    press: 'Drücken',
    set_brightness: 'Helligkeit setzen',
    open: 'Öffnen',
    close: 'Schließen',
    set_position: 'Position setzen',
    set_temperature: 'Temperatur setzen',
  },
  fault: {
    unavailable: 'Nicht verfügbar',
    dropout: 'Aussetzer',
    frozen: 'Eingefroren',
    spike: 'Ausreißer',
    battery_low: 'Batterie schwach',
    linkquality_drop: 'Verbindungsqualität sinkt',
    late: 'Verspätete Nachrichten',
    duplicate: 'Doppelte Nachrichten',
  },
  platform: {
    sensor: 'Sensor',
    binary_sensor: 'Binärsensor',
    switch: 'Schalter',
    light: 'Leuchte',
    cover: 'Rollo',
    climate: 'Thermostat',
    event: 'Ereignis',
  },
  template: {
    climate_sensor: 'Klimasensor',
    contact_sensor: 'Kontaktsensor',
    cover: 'Rollo',
    light: 'Dimmbare Leuchte',
    motion_sensor: 'Bewegungsmelder',
    plug_metering: 'Steckdose mit Messung',
    thermostat: 'Thermostat',
    wall_button: 'Wandtaster',
    washer: 'Waschmaschine',
  },
  entity: {
    action: 'Aktion',
    battery: 'Batterie',
    contact: 'Kontakt',
    cover: 'Rollo',
    current: 'Strom',
    door: 'Tür',
    energy: 'Energie',
    humidity: 'Luftfeuchtigkeit',
    illuminance: 'Beleuchtungsstärke',
    light: 'Leuchte',
    linkquality: 'Verbindungsqualität',
    motion: 'Bewegung',
    power: 'Leistung',
    pressure: 'Druck',
    program: 'Programm',
    state: 'Schalter',
    temperature: 'Temperatur',
    thermostat: 'Thermostat',
    voltage: 'Spannung',
  },
  state: {
    on: 'an',
    off: 'aus',
    open: 'offen',
    closed: 'geschlossen',
    opening: 'öffnet',
    closing: 'schließt',
    heat: 'Heizen',
    unavailable: 'nicht verfügbar',
    unknown: 'unbekannt',
  },
};

const tables: Record<Language, Record<LabelKind, Record<string, string>>> = { en, de };

/** The text of every output of the backend. */
export const OUTPUT_LABELS: Record<string, TextKey> = {
  native: 'outputNative',
  mqtt: 'outputMqtt',
  z2m: 'outputZ2m',
};

/** The prefix of the actions that start a fault, as in the backend. */
const FAULT_PREFIX = 'fault_';

/** Return the text of an id in the language of Home Assistant; an unknown id is shown as it is. */
export function labelOf(code: string | undefined, kind: LabelKind, id: string): string {
  return tables[languageOf(code)][kind][id] ?? id;
}

/** Return the text of an action name; `fault_<kind>` reads "Fault: <kind>". */
export function actionLabel(code: string | undefined, action: string): string {
  if (!action.startsWith(FAULT_PREFIX)) return labelOf(code, 'action', action);
  const prefix = languageOf(code) === 'de' ? 'Störung' : 'Fault';
  return `${prefix}: ${labelOf(code, 'fault', action.slice(FAULT_PREFIX.length))}`;
}

/** Return the text of what an action does: the entity, if one is named, and the action. */
export function workLabel(code: string | undefined, entity: string, action: string): string {
  const prefix = entity ? `${labelOf(code, 'entity', entity)}: ` : '';
  return `${prefix}${actionLabel(code, action)}`;
}

/** Return the text of a template: the translated name of a bundled one, else the name it has. */
export function templateLabel(code: string | undefined, id: string, name: string): string {
  return tables[languageOf(code)].template[id] ?? name;
}

/** Return the name of an entity: the translated name if the stored name is the English default. */
export function entityName(code: string | undefined, key: string, storedName: string): string {
  const known = en.entity[key];
  return known !== undefined && known === storedName ? labelOf(code, 'entity', key) : storedName;
}

/** Return the state of an entity for display; the states of text sensors are shown as they are. */
export function stateLabel(code: string | undefined, state: string | null): string {
  return state === null ? '–' : labelOf(code, 'state', state);
}

/** Return `items` sorted by the text that `label` gives them, in the rules of the language. */
export function sortedByLabel<T>(
  code: string | undefined,
  items: readonly T[],
  label: (item: T) => string,
): T[] {
  const locale = languageOf(code);
  return [...items].sort((a, b) =>
    label(a).localeCompare(label(b), locale, { numeric: true, sensitivity: 'base' }),
  );
}

/** Return the ids of a kind that exist in one language, for the test that both are complete. */
export function labelIds(language: Language, kind: LabelKind): string[] {
  return Object.keys(tables[language][kind]);
}
