import { FAULT_PREFIX, VALUE_ACTIONS, faultParams, valueParams } from './helpers';
import type { BulkTarget, DeviceFilterRequest } from '../common/types';

/** The most ids one bulk request carries; it matches `MAX_BATCH` of the backend. */
export const MAX_SELECTED = 500;
/** A removal of more devices than this also needs a checkbox in the dialog. */
export const CONFIRM_ABOVE = 100;

/** The chosen devices: single ids, or every match of the filter. */
export interface Selection {
  ids: ReadonlySet<string>;
  all: boolean;
}

/** The selection of nothing. */
export const NO_SELECTION: Selection = { ids: new Set(), all: false };

/** How much of a page is selected. */
export type PageState = 'none' | 'some' | 'all';

/** Return the number of devices a selection covers when `matched` devices pass the filter. */
export function selectionCount(selection: Selection, matched: number): number {
  return selection.all ? matched : selection.ids.size;
}

/** Return how much of the page with these ids is selected. */
export function pageState(selection: Selection, pageIds: string[]): PageState {
  if (selection.all) return pageIds.length ? 'all' : 'none';
  const chosen = pageIds.filter((id) => selection.ids.has(id)).length;
  if (chosen === 0) return 'none';
  return chosen === pageIds.length ? 'all' : 'some';
}

/** Return the selection with one id added, or removed if it is in; a full selection takes no more. */
export function toggleOne(selection: Selection, id: string): Selection {
  const ids = new Set(selection.ids);
  if (!ids.delete(id) && ids.size < MAX_SELECTED) ids.add(id);
  return { ids, all: false };
}

/** Return the selection with the whole page added, or removed if the page is all in. */
export function togglePage(selection: Selection, pageIds: string[]): Selection {
  const ids = new Set(selection.ids);
  if (pageState(selection, pageIds) === 'all') {
    pageIds.forEach((id) => ids.delete(id));
  } else {
    for (const id of pageIds) if (ids.size < MAX_SELECTED) ids.add(id);
  }
  return { ids, all: false };
}

/** Whether to offer "select all matches": the page is chosen and more devices match than are chosen. */
export function canSelectAll(selection: Selection, pageIds: string[], matched: number): boolean {
  return !selection.all && pageState(selection, pageIds) === 'all' && matched > selection.ids.size;
}

/** Return the target of a bulk request: the chosen ids, or the filter without its sort order. */
export function bulkTarget(selection: Selection, filter: DeviceFilterRequest): BulkTarget {
  if (!selection.all) return { ids: [...selection.ids] };
  return { filter: { ...filter, sort: undefined, descending: undefined } };
}

/** Whether a removal of `count` devices needs the extra checkbox. */
export function needsConfirmBox(count: number): boolean {
  return count > CONFIRM_ABOVE;
}

/** Return the names of the actions that any platform offers, once each. */
export function actionChoices(actions: Record<string, string[]>): string[] {
  return [...new Set(Object.values(actions).flat())];
}

/** The input an action needs before it can run on many devices. */
export type ActionInput = 'none' | 'value' | 'seconds';

/** Return what input `action` needs: nothing, a number in a range, or the seconds of a fault. */
export function actionInput(action: string): ActionInput {
  if (action in VALUE_ACTIONS) return 'value';
  return action.startsWith(FAULT_PREFIX) ? 'seconds' : 'none';
}

/** Return the parameters of `action` for the input text, or undefined if the text does not fit. */
export function bulkParams(action: string, text: string): Record<string, number> | undefined {
  const input = actionInput(action);
  if (input === 'none') return {};
  return input === 'value' ? valueParams(action, text) : faultParams(text);
}
