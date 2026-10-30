import { sortedByLabel } from './labels';
import { KEY_QUERY, type FilterField, type FilterValues } from './filter-state';
import type { SelectItem } from './multi-select';

/** How one kind of list item is tested: its searchable texts and its values per filter field. */
export interface ListRule<T> {
  /** The texts that the query is searched in. */
  texts(item: T): string[];
  /** The values of an item per field key: the chosen ones of a multi or choice field, or a flag. */
  values(item: T, key: string): string[] | boolean;
}

/** Return true if `text` contains the trimmed `query`, ignoring case; an empty query matches. */
function contains(text: string, query: string): boolean {
  return text.toLocaleLowerCase().includes(query);
}

/** Return the values that a field restricts to; an empty list restricts nothing. */
function chosenOf(value: FilterValues[string] | undefined): string[] {
  if (Array.isArray(value)) return value;
  return typeof value === 'string' && value ? [value] : [];
}

/**
 * Return the items that pass the filter: the query is a case-insensitive part of one of the texts,
 * several values of one field mean OR, different fields mean AND, a switch needs the flag.
 */
export function filterItems<T>(
  items: T[],
  fields: FilterField[],
  values: FilterValues,
  rule: ListRule<T>,
): T[] {
  const query = String(values[KEY_QUERY] ?? '')
    .trim()
    .toLocaleLowerCase();
  return items.filter((item) => {
    if (query && !rule.texts(item).some((text) => contains(text, query))) return false;
    return fields.every((field) => {
      const own = rule.values(item, field.key);
      if (field.kind === 'switch') return values[field.key] !== true || own === true;
      const chosen = chosenOf(values[field.key]);
      if (chosen.length === 0) return true;
      return Array.isArray(own) && own.some((v) => chosen.includes(v));
    });
  });
}

/** Return the options of a field from the values that the items have, each once, by label. */
export function optionsOf<T>(
  items: T[],
  valuesOf: (item: T) => string[],
  labelOf: (value: string) => string,
  lang: string | undefined,
): SelectItem[] {
  const options = [...new Set(items.flatMap(valuesOf))].map((value) => ({
    value,
    label: labelOf(value),
  }));
  return sortedByLabel(lang, options, (option) => option.label);
}
