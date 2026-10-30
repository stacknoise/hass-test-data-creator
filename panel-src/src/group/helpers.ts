import type { FilterField } from '../common/filter-state';
import type { ListRule } from '../common/list-filter';
import type { GroupInfo } from '../common/types';

/** The tab under which the filter of the group list is kept in the session. */
export const GROUP_FILTER_TAB = 'groups';

/** The groups are only searched by text, so the filter has no further fields. */
export const GROUP_FIELDS: FilterField[] = [];

/** Return how the group filter reads a group: the query is searched in its name, number and members. */
export function groupRule(memberNames: (item: GroupInfo) => string): ListRule<GroupInfo> {
  return {
    texts: (item) => [item.name, String(item.number), memberNames(item)],
    values: () => false,
  };
}
