import type { ScenarioStep, TemplateInfo } from '../common/types';
import { defaultWork, resolveWork, workOf, type WorkForm } from '../schedule/helpers';

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
export function stepFormOf(
  step: ScenarioStep,
  actions: Record<string, string[]>,
  templates: TemplateInfo[],
): StepForm {
  return {
    afterS: step.after_s,
    work: workOf(step, actions, templates),
    params: Object.keys(step.params).length ? JSON.stringify(step.params) : '',
  };
}
