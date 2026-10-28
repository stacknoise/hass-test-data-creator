/** Names of the values that several parts of the panel write out; they match the backend. */

/** What a schedule, scenario step or removal aims at. */
export const KIND_DEVICE = 'device';
export const KIND_ALL = 'all';
export const KIND_TEMPLATE = 'template';
export const KIND_RUN = 'run';

/** The types of a schedule trigger. */
export const TRIGGER_TIMES = 'times';
export const TRIGGER_INTERVAL = 'interval';
export const TRIGGER_ONCE = 'once';
export const TRIGGER_RANDOM_WINDOW = 'random_window';
export const TRIGGER_POISSON = 'poisson';

/** The shapes of a signal that need their own handling, and the names of its fields. */
export const SHAPE_ENUM = 'enum';
export const SHAPE_STATE_MACHINE = 'state_machine';
export const FIELD_NOISE = 'noise';
export const FIELD_PHASE = 'phase';
export const FIELD_INTERVAL_S = 'interval_s';
export const FIELD_SHAPE = 'shape';

/** The platform of the entities that have a curve. */
export const PLATFORM_SENSOR = 'sensor';

/** The tabs of the panel that are named more than once. */
export const TAB_DEVICES = 'devices';
export const TAB_GROUPS = 'groups';

/** The event of a form that hands over what it describes, and the separator of a list in a text. */
export const EVENT_SUBMIT = 'tdc-submit';
export const LIST_SEPARATOR = ', ';
