import type { TextKey } from '../common/i18n';
import type {
  ImportBatch,
  ImportPlan,
  TransferCategory,
  TransferFile,
  TransferPage,
} from '../common/types';

/** The categories of a transfer file in the order the tab lists them; they match the backend. */
export const TRANSFER_CATEGORIES: TransferCategory[] = [
  'devices',
  'templates',
  'schedules',
  'scenarios',
  'groups',
];

/** The text that names a category. */
export const CATEGORY_LABELS: Record<TransferCategory, TextKey> = {
  devices: 'trfDevices',
  templates: 'trfTemplates',
  schedules: 'trfSchedules',
  scenarios: 'trfScenarios',
  groups: 'trfGroups',
};

/** Return the categories the tab offers: groups only while MQTT is connected. */
export function offeredCategories(mqtt: boolean): TransferCategory[] {
  return TRANSFER_CATEGORIES.filter((category) => category !== 'groups' || mqtt);
}

/** Return the file name of an export made at `now`, for example `tdc-export-20261030-0714.json`. */
export function exportFileName(now: Date): string {
  const part = (value: number): string => String(value).padStart(2, '0');
  const day = `${now.getFullYear()}${part(now.getMonth() + 1)}${part(now.getDate())}`;
  return `tdc-export-${day}-${part(now.getHours())}${part(now.getMinutes())}.json`;
}

/** Return the transfer file made of the pages of the chosen categories; nothing else is added. */
export function buildTransferFile(
  pages: Partial<Record<TransferCategory, TransferPage[]>>,
  exportedAt: string,
): TransferFile {
  const file: TransferFile = {
    format_version: 0,
    integration_version: '',
    exported_at: exportedAt,
  };
  for (const category of TRANSFER_CATEGORIES) {
    const list = pages[category];
    if (!list) continue;
    file.format_version = list[0]?.format_version ?? file.format_version;
    file.integration_version = list[0]?.integration_version ?? file.integration_version;
    file[category] = list.flatMap((page) => page.items);
  }
  return file;
}

/** The order in which categories are created: what others name comes first. */
export const IMPORT_ORDER: TransferCategory[] = [
  'templates',
  'devices',
  'scenarios',
  'schedules',
  'groups',
];

/** The order in which a replace removes: what names others goes first. */
export const PURGE_ORDER: TransferCategory[] = [...IMPORT_ORDER].reverse();

/** The most bytes of entries that one message carries; far below the limit of the connection. */
export const MAX_BATCH_BYTES = 1024 * 1024;

/** The file format this panel reads. */
export const SUPPORTED_FORMAT = 1;

/** The field that names an entry in a category. */
export function keyField(category: TransferCategory): 'id' | 'name' {
  return category === 'templates' ? 'id' : 'name';
}

/** The result of reading a file: the transfer file, or the text that says why not. */
export type ParsedFile =
  { file: TransferFile } | { error: TextKey; values?: Record<string, string | number> };

/** Return the entries of a category in `file`; none if the file has no such list. */
export function entriesOf(file: TransferFile, category: TransferCategory): object[] {
  return file[category] ?? [];
}

/** Return the categories the file holds, in import order. */
export function fileCategories(file: TransferFile): TransferCategory[] {
  return IMPORT_ORDER.filter((category) => Array.isArray(file[category]));
}

/** Return a name that two entries of a category share, or undefined. */
export function duplicateName(file: TransferFile): { category: string; name: string } | undefined {
  for (const category of fileCategories(file)) {
    const seen = new Set<string>();
    for (const entry of entriesOf(file, category)) {
      const name = String((entry as Record<string, unknown>)[keyField(category)] ?? '');
      if (seen.has(name)) return { category, name };
      seen.add(name);
    }
  }
  return undefined;
}

/** Read the text of a file chosen for import and check it before anything is sent. */
export function parseTransferFile(text: string, maxBytes: number): ParsedFile {
  if (text.length > maxBytes) return { error: 'trfTooBig', values: { max: maxBytes } };
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { error: 'trfBadFile' };
  }
  if (typeof data !== 'object' || data === null) return { error: 'trfBadFile' };
  const file = data as TransferFile;
  if (typeof file.format_version !== 'number') return { error: 'trfBadFile' };
  if (file.format_version > SUPPORTED_FORMAT) return { error: 'trfNewer' };
  if (fileCategories(file).length === 0) return { error: 'trfBadFile' };
  const duplicate = duplicateName(file);
  if (duplicate) return { error: 'trfDuplicate', values: { ...duplicate } };
  return { file };
}

/** Return the names that references may point to: those of the chosen categories of the file. */
export function knownNames(file: TransferFile, chosen: TransferCategory[]): ImportBatch['known'] {
  const names = (category: 'devices' | 'templates' | 'scenarios'): string[] =>
    chosen.includes(category)
      ? entriesOf(file, category).map((entry) =>
          String((entry as Record<string, unknown>)[keyField(category)]),
        )
      : [];
  return {
    devices: names('devices'),
    templates: names('templates'),
    scenarios: names('scenarios'),
  };
}

/** Split entries into batches of at most `maxItems` entries and about `maxBytes` bytes of JSON. */
export function splitBatches(items: object[], maxItems: number, maxBytes: number): object[][] {
  const batches: object[][] = [];
  let current: object[] = [];
  let size = 0;
  for (const item of items) {
    const bytes = JSON.stringify(item).length;
    if (current.length > 0 && (current.length >= maxItems || size + bytes > maxBytes)) {
      batches.push(current);
      current = [];
      size = 0;
    }
    current.push(item);
    size += bytes;
  }
  if (current.length > 0) batches.push(current);
  return batches;
}

/** Add up the plans or results of the batches of one category. */
export function sumPlans(plans: ImportPlan[]): ImportPlan {
  const total: ImportPlan = {
    ...plans[0],
    create: 0,
    update: 0,
    skip: 0,
    conflict: 0,
    delete: 0,
    problems: [],
  };
  for (const plan of plans) {
    total.create += plan.create;
    total.update += plan.update;
    total.skip += plan.skip;
    total.conflict += plan.conflict;
    total.delete += plan.delete;
    total.problems.push(...plan.problems);
  }
  return total;
}

/** Whether an import changes or removes something that exists, so that the user must confirm. */
export function needsConfirmation(plans: ImportPlan[]): boolean {
  return plans.some((plan) => plan.update > 0 || plan.delete > 0);
}
