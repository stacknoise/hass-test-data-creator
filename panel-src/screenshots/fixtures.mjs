// The demo data behind the screenshots: what the backend would answer, in English or German.
// The texts that the user types in (device, area, schedule and scenario names) are translated here;
// the texts of the panel itself come from the panel.

const NOW = '2026-10-28T17:30:00';

const LINK = { shape: 'random_walk', min: 40, max: 255, period_s: 1800, decimals: 0 };
const BATTERY = { shape: 'random_walk', min: 20, max: 100, period_s: 86400, decimals: 0 };

/** A template entity: the fields the backend lists. */
const def = (key, platform, name, extra = {}) => ({
  key,
  platform,
  name,
  device_class: null,
  unit: null,
  signal: null,
  event_types: null,
  ...extra,
});

const link = () => def('linkquality', 'sensor', 'Link quality', { unit: 'lqi', signal: LINK });
const battery = () =>
  def('battery', 'sensor', 'Battery', { device_class: 'battery', unit: '%', signal: BATTERY });

const TEMPLATES = [
  {
    id: 'plug_metering',
    name: 'Plug with metering',
    model: 'Plug (metering)',
    entities: [
      def('state', 'switch', 'Switch'),
      def('power', 'sensor', 'Power', {
        device_class: 'power',
        unit: 'W',
        signal: { shape: 'random_walk', min: 0, max: 2300, period_s: 600, noise: 0.02, decimals: 1 },
      }),
      def('energy', 'sensor', 'Energy', {
        device_class: 'energy',
        unit: 'kWh',
        signal: { shape: 'counter', min: 0, rate_per_hour: 0.35, decimals: 3 },
      }),
      def('voltage', 'sensor', 'Voltage', {
        device_class: 'voltage',
        unit: 'V',
        signal: { shape: 'sine', min: 228, max: 234, period_s: 7200, noise: 0.05, decimals: 1 },
      }),
      def('current', 'sensor', 'Current', {
        device_class: 'current',
        unit: 'A',
        signal: { shape: 'random_walk', min: 0, max: 10, period_s: 600, decimals: 2 },
      }),
      link(),
    ],
  },
  {
    id: 'light',
    name: 'Dimmable light',
    model: 'Light (dimmable)',
    entities: [def('light', 'light', 'Light'), link()],
  },
  {
    id: 'climate_sensor',
    name: 'Climate sensor',
    model: 'Climate sensor',
    entities: [
      def('temperature', 'sensor', 'Temperature', {
        device_class: 'temperature',
        unit: '°C',
        signal: { shape: 'sine', min: 18, max: 26, period_s: 86400, noise: 0.02, decimals: 1 },
      }),
      def('humidity', 'sensor', 'Humidity', {
        device_class: 'humidity',
        unit: '%',
        signal: { shape: 'random_walk', min: 35, max: 70, period_s: 3600, decimals: 1 },
      }),
      battery(),
      link(),
    ],
  },
  {
    id: 'motion_sensor',
    name: 'Motion sensor',
    model: 'Motion sensor',
    entities: [
      def('motion', 'binary_sensor', 'Motion', { device_class: 'motion' }),
      def('illuminance', 'sensor', 'Illuminance', {
        device_class: 'illuminance',
        unit: 'lx',
        signal: { shape: 'sine', min: 0, max: 800, period_s: 86400, decimals: 0 },
      }),
      battery(),
      link(),
    ],
  },
  {
    id: 'contact_sensor',
    name: 'Contact sensor',
    model: 'Contact sensor',
    entities: [def('contact', 'binary_sensor', 'Contact', { device_class: 'door' }), battery(), link()],
  },
  {
    id: 'cover',
    name: 'Blind',
    model: 'Blind',
    entities: [def('cover', 'cover', 'Blind', { device_class: 'blind' }), battery(), link()],
  },
  {
    id: 'thermostat',
    name: 'Thermostat',
    model: 'Radiator thermostat',
    entities: [
      def('thermostat', 'climate', 'Thermostat', {
        signal: { shape: 'sine', min: 18, max: 23, period_s: 86400, noise: 0.02, decimals: 1 },
      }),
      battery(),
      link(),
    ],
  },
  {
    id: 'wall_button',
    name: 'Wall button',
    model: 'Wall button',
    entities: [
      def('action', 'event', 'Action', { device_class: 'button', event_types: ['single', 'double', 'hold'] }),
      battery(),
      link(),
    ],
  },
  {
    id: 'washer',
    name: 'Washing machine',
    model: 'Washing machine',
    entities: [
      def('program', 'sensor', 'Program', {
        signal: {
          shape: 'state_machine',
          phase: 0,
          states: [
            { value: 'idle', duration_s: 7200 },
            { value: 'wash', duration_s: 2400 },
            { value: 'rinse', duration_s: 900 },
            { value: 'spin', duration_s: 600 },
          ],
        },
      }),
      def('door', 'sensor', 'Door', {
        signal: { shape: 'enum', interval_s: 900, values: ['closed', 'open'], weights: [9, 1] },
      }),
      link(),
    ],
  },
];

/** The words that the user would type, per language. */
const WORDS = {
  en: {
    areas: ['Living room', 'Kitchen', 'Office', 'Hall', 'Bedroom', 'Utility room', 'Garden', 'Garage'],
    devices: [
      'Living room plug',
      'Kitchen plug',
      'Office plug',
      'Hall light',
      'Bedroom climate sensor',
      'Living room climate sensor',
      'Hall motion sensor',
      'Front door contact',
      'Living room blind',
      'Bedroom thermostat',
      'Washing machine',
      'Garden plug',
      'Garage plug',
    ],
    schedules: ['Evening light', 'Coffee plug in the morning', 'Sensor dropouts', 'Leaving home', 'Plugs off at night'],
    scenarios: ['Leaving home', 'Good evening'],
    groups: ['Outdoor plugs'],
    labels: { run: 'Demo devices' },
  },
  de: {
    areas: ['Wohnzimmer', 'Küche', 'Büro', 'Flur', 'Schlafzimmer', 'Hauswirtschaftsraum', 'Garten', 'Garage'],
    devices: [
      'Steckdose Wohnzimmer',
      'Steckdose Küche',
      'Steckdose Büro',
      'Flurlicht',
      'Klimasensor Schlafzimmer',
      'Klimasensor Wohnzimmer',
      'Bewegungsmelder Flur',
      'Haustürkontakt',
      'Rollo Wohnzimmer',
      'Thermostat Schlafzimmer',
      'Waschmaschine',
      'Steckdose Garten',
      'Steckdose Garage',
    ],
    schedules: ['Abendlicht', 'Kaffeesteckdose am Morgen', 'Sensorausfälle', 'Haus verlassen', 'Steckdosen aus in der Nacht'],
    scenarios: ['Haus verlassen', 'Guten Abend'],
    groups: ['Außensteckdosen'],
    labels: { run: 'Demogeräte' },
  },
};

/** An entity state of a device. */
const ent = (device, base, state, extra = {}) => ({
  key: base.key,
  name: base.name,
  signal: base.signal,
  platform: base.platform,
  entity_id: `${base.platform}.${device}_${base.key}`,
  state,
  unit: base.unit,
  state_class: base.signal && base.platform === 'sensor' && base.signal.shape !== 'enum' && base.signal.shape !== 'state_machine' ? (base.key === 'energy' ? 'total_increasing' : 'measurement') : null,
  fault: null,
  ...extra,
});

const template = (id) => TEMPLATES.find((t) => t.id === id);
const entityOf = (id, key) => template(id).entities.find((e) => e.key === key);

/** Build everything the fake backend answers. */
export function fixtures(lang) {
  const w = WORDS[lang];
  const [living, kitchen, office, hall, bedroom, utility, garden, garage] = w.areas;
  const names = w.devices;
  const id = (n) => `dev${String(n + 1).padStart(2, '0')}`;
  const plug = (n, on, power, energy, voltage, current) => [
    ent(`p${n}`, entityOf('plug_metering', 'state'), on ? 'on' : 'off'),
    ent(`p${n}`, entityOf('plug_metering', 'power'), String(power)),
    ent(`p${n}`, entityOf('plug_metering', 'energy'), String(energy)),
    ent(`p${n}`, entityOf('plug_metering', 'voltage'), String(voltage)),
    ent(`p${n}`, entityOf('plug_metering', 'current'), String(current)),
    ent(`p${n}`, entityOf('plug_metering', 'linkquality'), '187'),
  ];
  const climate = (n, t, h, b) => [
    ent(`c${n}`, entityOf('climate_sensor', 'temperature'), t),
    ent(`c${n}`, entityOf('climate_sensor', 'humidity'), h),
    ent(`c${n}`, entityOf('climate_sensor', 'battery'), b),
    ent(`c${n}`, entityOf('climate_sensor', 'linkquality'), '203'),
  ];
  const rows = [
    ['plug_metering', living, 'native', plug(1, true, 84.3, 12.482, 231.6, 0.36), 'run1'],
    ['plug_metering', kitchen, 'native', plug(2, true, 1180.5, 41.907, 230.9, 5.11), 'run1'],
    ['plug_metering', office, 'native', plug(3, false, 0, 7.233, 232.4, 0), 'run1'],
    ['light', hall, 'native', [ent('l1', entityOf('light', 'light'), 'on'), ent('l1', entityOf('light', 'linkquality'), '171')], 'run2'],
    ['climate_sensor', bedroom, 'native', climate(1, '21.4', '48.2', '92'), 'run2'],
    ['climate_sensor', living, 'native', climate(2, '22.8', '44.1', '88'), 'run2'],
    [
      'motion_sensor',
      hall,
      'native',
      [
        ent('m1', entityOf('motion_sensor', 'motion'), 'off'),
        ent('m1', entityOf('motion_sensor', 'illuminance'), '312'),
        ent('m1', entityOf('motion_sensor', 'battery'), '76'),
        ent('m1', entityOf('motion_sensor', 'linkquality'), '149'),
      ],
      'run2',
    ],
    [
      'contact_sensor',
      hall,
      'native',
      [
        ent('k1', entityOf('contact_sensor', 'contact'), 'off'),
        ent('k1', entityOf('contact_sensor', 'battery'), '95'),
        ent('k1', entityOf('contact_sensor', 'linkquality'), '221'),
      ],
      'run2',
    ],
    ['cover', living, 'native', [ent('b1', entityOf('cover', 'cover'), 'open'), ent('b1', entityOf('cover', 'battery'), '64'), ent('b1', entityOf('cover', 'linkquality'), '133')], 'run2'],
    ['thermostat', bedroom, 'native', [ent('t1', entityOf('thermostat', 'thermostat'), '21.5'), ent('t1', entityOf('thermostat', 'battery'), '81'), ent('t1', entityOf('thermostat', 'linkquality'), '160')], 'run2'],
    [
      'washer',
      utility,
      'native',
      [ent('w1', entityOf('washer', 'program'), 'idle'), ent('w1', entityOf('washer', 'door'), 'closed'), ent('w1', entityOf('washer', 'linkquality'), '118')],
      'run2',
    ],
    ['plug_metering', garden, 'z2m', plug(4, true, 36.8, 3.114, 232.0, 0.16), 'run3'],
    ['plug_metering', garage, 'z2m', plug(5, false, 0, 0.912, 231.1, 0), 'run3'],
  ];
  const devices = rows.map(([tpl, area, output, entities, run], n) => ({
    id: id(n),
    name: names[n],
    template: tpl,
    model: template(tpl).model,
    area,
    output,
    run_id: run,
    created_at: 1793200000 + n,
    entities,
    used_by: { schedules: [], scenarios: [], groups: [] },
  }));
  const byName = (index) => devices[index];

  const schedules = [
    {
      id: 'sch1',
      name: w.schedules[0],
      target: { device: names[3] },
      entity: '',
      action: 'turn_on',
      scenario: null,
      trigger: { type: 'times', times: ['18:00'] },
      enabled: true,
    },
    {
      id: 'sch2',
      name: w.schedules[1],
      target: { device: names[1] },
      entity: 'state',
      action: 'turn_on',
      scenario: null,
      trigger: { type: 'times', times: ['06:45'], weekdays: [0, 1, 2, 3, 4] },
      enabled: true,
    },
    {
      id: 'sch3',
      name: w.schedules[2],
      target: { device: [names[4], names[5]] },
      entity: '',
      action: 'fault_dropout',
      scenario: null,
      trigger: { type: 'poisson', per_day: 3 },
      params: { duration_s: 120 },
      enabled: true,
    },
    {
      id: 'sch4',
      name: w.schedules[3],
      target: {},
      entity: '',
      action: '',
      scenario: 'scn1',
      trigger: { type: 'times', times: ['08:15'], weekdays: [0, 1, 2, 3, 4] },
      enabled: true,
    },
    {
      id: 'sch5',
      name: w.schedules[4],
      target: { template: 'plug_metering' },
      entity: 'state',
      action: 'turn_off',
      scenario: null,
      trigger: { type: 'times', times: ['23:30'] },
      enabled: false,
    },
  ].map((s) => ({ params: {}, seed: 'tdc-0042', created_at: 1793200100, ...s }));

  const step = (after_s, target, action, entity = '') => ({ after_s, target, entity, action, params: {} });
  const scenarios = [
    {
      id: 'scn1',
      name: w.scenarios[0],
      steps: [
        step(0, { device: names[3] }, 'turn_off'),
        step(5, { device: [names[0], names[1]] }, 'turn_off', 'state'),
        step(10, { device: names[8] }, 'close'),
      ],
      created_at: 1793200200,
    },
    {
      id: 'scn2',
      name: w.scenarios[1],
      steps: [step(0, { device: names[3] }, 'turn_on'), step(30, { device: names[8] }, 'close')],
      created_at: 1793200300,
    },
  ];
  const groups = [
    { id: 'grp1', name: w.groups[0], number: 1, members: [id(11), id(12)], created_at: 1793200400 },
  ];

  // who uses which device
  const use = (index, kind, item) => byName(index).used_by[kind].push({ id: item.id, name: item.name });
  use(3, 'schedules', schedules[0]);
  use(1, 'schedules', schedules[1]);
  use(4, 'schedules', schedules[2]);
  use(5, 'schedules', schedules[2]);
  use(3, 'scenarios', scenarios[0]);
  use(0, 'scenarios', scenarios[0]);
  use(1, 'scenarios', scenarios[0]);
  use(8, 'scenarios', scenarios[0]);
  use(11, 'groups', groups[0]);
  use(12, 'groups', groups[0]);

  const runs = [
    ['2026-10-28 18:00', 0],
    ['2026-10-28 23:30', 4],
    ['2026-10-29 06:45', 1],
    ['2026-10-29 08:15', 3],
  ].map(([when, n]) => ({ when, schedule_id: schedules[n].id, name: schedules[n].name }));

  const info = {
    version: '0.4.0',
    api_version: 1,
    features: ['areas', 'csv_replay', 'faults', 'mqtt_discovery', 'native_output', 'removal', 'scenarios', 'schedules', 'statistics_backfill', 'templates', 'time_lapse', 'z2m_bridge', 'z2m_groups'],
    limits: { max_devices: 2000, max_batch: 500, max_entities_per_device: 40 },
    outputs: ['native', 'mqtt', 'z2m'],
    mqtt: true,
    shapes: ['constant', 'sine', 'saw', 'square', 'triangle', 'noise', 'random_walk', 'household_load', 'pv_day', 'steps', 'discharge', 'counter', 'csv', 'enum', 'state_machine'],
    platforms: ['binary_sensor', 'climate', 'cover', 'event', 'light', 'sensor', 'switch'],
    actions: {
      switch: ['turn_on', 'turn_off', 'toggle', 'fault_unavailable', 'fault_late', 'fault_duplicate'],
      binary_sensor: ['set_on', 'set_off', 'pulse', 'fault_unavailable', 'fault_late', 'fault_duplicate'],
      event: ['press', 'fault_unavailable', 'fault_late', 'fault_duplicate'],
      light: ['turn_on', 'turn_off', 'toggle', 'set_brightness', 'fault_unavailable', 'fault_late', 'fault_duplicate'],
      cover: ['open', 'close', 'set_position', 'fault_unavailable', 'fault_late', 'fault_duplicate'],
      climate: ['set_temperature', 'turn_on', 'turn_off', 'fault_unavailable', 'fault_late', 'fault_duplicate'],
      sensor: ['fault_unavailable', 'fault_dropout', 'fault_frozen', 'fault_spike', 'fault_battery_low', 'fault_linkquality_drop', 'fault_late', 'fault_duplicate'],
    },
    tick_seconds: 10,
    time_lapse: 1,
    csv_files: ['load.csv'],
    device_count: devices.length,
  };

  const removalPlan = {
    target: 'all',
    devices: devices.map((d) => ({ id: d.id, name: d.name })),
    orphans: [],
    runs: ['run1', 'run2', 'run3'],
    areas: w.areas,
    schedules: schedules.map((s) => s.name),
    scenarios: scenarios.map((s) => s.name),
    groups: groups.map((g) => g.name),
    topics: ['tdc/#', 'tdc_z2m/#'],
    statistics: [],
    in_use: [],
  };

  const areas = Object.fromEntries(w.areas.map((name, n) => [`area${n}`, { name }]));
  return {
    now: NOW,
    areas,
    info,
    templates: TEMPLATES.map((t) => ({ ...t, bundled: true })),
    devices,
    schedules,
    scenarios,
    groups,
    runs,
    removalPlan,
    historyResult: { series: 41, rows: 1968, skipped: 0 },
  };
}
