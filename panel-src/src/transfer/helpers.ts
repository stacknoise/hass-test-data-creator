import type { TextKey } from '../common/i18n';
import type { TransferCategory, TransferFile, TransferPage } from '../common/types';

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
