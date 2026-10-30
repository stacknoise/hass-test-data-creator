/** What a key press asks of the filter bar. */
export type ShortcutAction = 'search' | 'reset';

/** Where a key press happened, as far as the shortcuts care. */
export interface KeyContext {
  key: string;
  modified: boolean;
  /** The focus is in a text field, a selection or an editable element. */
  typing: boolean;
  /** The focus is in the search field of the bar. */
  inSearch: boolean;
  /** A dialog is open, which owns the keys. */
  dialogOpen: boolean;
}

/** Return what a key press asks for: `/` focuses the search, `Esc` resets the filter. */
export function shortcutOf(context: KeyContext): ShortcutAction | undefined {
  if (context.modified || context.dialogOpen) return undefined;
  if (context.key === '/' && !context.typing) return 'search';
  if (context.key === 'Escape' && (context.inSearch || !context.typing)) return 'reset';
  return undefined;
}

/** Tell whether an element takes typed text, so that a letter key belongs to it. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
    target.getAttribute('role') === 'combobox'
  );
}
