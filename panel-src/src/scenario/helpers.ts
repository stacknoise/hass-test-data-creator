import type { FilterField } from '../common/filter-state';
import type { ListRule } from '../common/list-filter';
import { resolveTargetId } from '../common/targets';
import type { DeviceName, ScenarioInfo, ScenarioStep } from '../common/types';
import { KIND_DEVICE, KIND_TEMPLATE } from '../common/constants';
import {
  defaultWork,
  describeTarget,
  resolveWork,
  workOf,
  type WorkForm,
} from '../schedule/helpers';

/** The inputs of one step in the scenario form. */
export interface StepForm {
  afterS: number;
  work: WorkForm;
  params: string;
}

/** Return the form of a new step with the first action. */
export function defaultStep(actions: Record<string, string[]>): StepForm {
  return { afterS: 0, work: defaultWork(actions), params: '' };
}

/** Parse the parameter text of a step; an empty text is "no parameters", invalid text is undefined. */
export function parseParams(text: string): Record<string, unknown> | undefined {
  if (text.trim() === '') return {};
  try {
    const value: unknown = JSON.parse(text);
    return typeof value === 'object' && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

/** Return the steps that the forms describe, or undefined if the parameters of a step are invalid. */
export function buildSteps(forms: StepForm[]): ScenarioStep[] | undefined {
  const steps: ScenarioStep[] = [];
  for (const form of forms) {
    const params = parseParams(form.params);
    if (params === undefined) return undefined;
    steps.push({
      after_s: Math.max(0, form.afterS || 0),
      ...resolveWork(form.work),
      params,
    });
  }
  return steps;
}

/** Return the form of an existing step; parameters become the JSON text that the form edits. */
export function stepFormOf(step: ScenarioStep): StepForm {
  return {
    afterS: step.after_s,
    work: workOf(step),
    params: Object.keys(step.params).length ? JSON.stringify(step.params) : '',
  };
}

/** The tab under which the filter of the scenario list is kept in the session. */
export const SCENARIO_FILTER_TAB = 'scenarios';

/** The fields of the scenario filter by key and kind; the panel adds labels and options. */
export const SCENARIO_FIELDS: FilterField[] = [
  { key: 'devices', kind: 'multi', label: '' },
  { key: 'templates', kind: 'multi', label: '' },
];

/** Return the ids that the steps of a scenario name as `kind`, each once. */
function stepTargets(item: ScenarioInfo, kind: string, resolve: (id: string) => string): string[] {
  const ids = item.steps.flatMap((step) => {
    const target = describeTarget(step.target);
    return target.kind === kind ? target.ids.map(resolve) : [];
  });
  return [...new Set(ids)];
}

/** Return the ids of the devices that the steps of a scenario name, each once. */
export function stepDevices(item: ScenarioInfo, devices: DeviceName[]): string[] {
  return stepTargets(item, KIND_DEVICE, (id) => resolveTargetId(KIND_DEVICE, id, devices));
}

/** Return the ids of the templates that the steps of a scenario name, each once. */
export function stepTemplates(item: ScenarioInfo): string[] {
  return stepTargets(item, KIND_TEMPLATE, (id) => id);
}

/** Return how the scenario filter reads a scenario; `texts` gives what the query is searched in. */
export function scenarioRule(
  devices: DeviceName[],
  texts: (item: ScenarioInfo) => string[],
): ListRule<ScenarioInfo> {
  return {
    texts,
    values: (item, key) => (key === 'devices' ? stepDevices(item, devices) : stepTemplates(item)),
  };
}
