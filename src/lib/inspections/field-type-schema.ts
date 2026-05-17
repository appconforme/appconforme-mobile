/**
 * Helpers para extrair, com narrowing defensivo, o `schemaJson` (forma livre)
 * do `customFieldType` snapshotado em cada `InspectionItem`.
 *
 * Backend não valida a forma do `schemaJson` por base input — a convenção é
 * estabelecida aqui no mobile (espelho do web admin). Se a forma vier
 * inesperada (legada, digitada errada no FieldType), o helper devolve
 * fallback vazio em vez de derrubar o renderer.
 *
 * Convenções por `baseInput`:
 * - `number`: `{ min?, max?, step?, unit? }`
 * - `text`: `{ regex?, placeholder?, multiline?, maxLength? }`
 * - `single_choice` / `multiple_choice`: `{ options?: Array<{ value, label }> }`
 *   → quando presente, sobrescreve o `optionsJson` built-in do item
 * - `date`: `{ min?, max? }` (ISO YYYY-MM-DD)
 * - `yes_no`: `{ labels?: { yes?, no? } }`
 * - `conform_not_conform`: `{ labels?: { conform?, not_conform? } }`
 */

import type { InspectionItem } from '@/lib/inspections/types';

// --- Tipos exportados (forma normalizada após narrowing) ---

export interface NumberSchema {
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface TextSchema {
  regex?: string;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
}

export interface ChoiceSchemaOption {
  value: string;
  label: string;
}

export interface ChoiceSchema {
  options?: ChoiceSchemaOption[];
}

export interface DateSchema {
  min?: string;
  max?: string;
}

export interface YesNoSchema {
  labels?: { yes?: string; no?: string };
}

export interface ConformSchema {
  labels?: { conform?: string; not_conform?: string };
}

// --- Utilitários ---

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asFiniteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function asNonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

/**
 * Extrai e narrow-converte o `schemaJson` do customFieldType usando um
 * validator/normalizer. Devolve fallback `{}` se ausente ou inválido.
 */
export function parseSchema<T>(
  item: InspectionItem,
  normalize: (raw: Record<string, unknown>) => T,
  fallback: () => T,
): T {
  const raw = item.customFieldType?.schemaJson;
  if (!isRecord(raw)) return fallback();
  return normalize(raw);
}

// --- Helpers individuais por base input ---

export function getNumberSchema(item: InspectionItem): NumberSchema {
  return parseSchema<NumberSchema>(
    item,
    (raw) => ({
      min: asFiniteNumber(raw.min),
      max: asFiniteNumber(raw.max),
      step: asFiniteNumber(raw.step),
      unit: asNonEmptyString(raw.unit),
    }),
    () => ({}),
  );
}

export function getTextSchema(item: InspectionItem): TextSchema {
  return parseSchema<TextSchema>(
    item,
    (raw) => ({
      regex: asNonEmptyString(raw.regex),
      placeholder: asNonEmptyString(raw.placeholder),
      multiline: asBoolean(raw.multiline),
      maxLength: asFiniteNumber(raw.maxLength),
    }),
    () => ({}),
  );
}

export function getChoiceSchema(item: InspectionItem): ChoiceSchema {
  return parseSchema<ChoiceSchema>(
    item,
    (raw) => {
      const rawOptions = raw.options;
      if (!Array.isArray(rawOptions)) return {};
      const options: ChoiceSchemaOption[] = [];
      for (const opt of rawOptions) {
        if (!isRecord(opt)) continue;
        const value = asNonEmptyString(opt.value);
        const label = asNonEmptyString(opt.label);
        if (!value || !label) continue;
        options.push({ value, label });
      }
      return options.length > 0 ? { options } : {};
    },
    () => ({}),
  );
}

export function getDateSchema(item: InspectionItem): DateSchema {
  return parseSchema<DateSchema>(
    item,
    (raw) => ({
      min: asNonEmptyString(raw.min),
      max: asNonEmptyString(raw.max),
    }),
    () => ({}),
  );
}

export function getYesNoSchema(item: InspectionItem): YesNoSchema {
  return parseSchema<YesNoSchema>(
    item,
    (raw) => {
      const labels = isRecord(raw.labels)
        ? {
            yes: asNonEmptyString(raw.labels.yes),
            no: asNonEmptyString(raw.labels.no),
          }
        : undefined;
      return labels ? { labels } : {};
    },
    () => ({}),
  );
}

export function getConformSchema(item: InspectionItem): ConformSchema {
  return parseSchema<ConformSchema>(
    item,
    (raw) => {
      const labels = isRecord(raw.labels)
        ? {
            conform: asNonEmptyString(raw.labels.conform),
            not_conform: asNonEmptyString(raw.labels.not_conform),
          }
        : undefined;
      return labels ? { labels } : {};
    },
    () => ({}),
  );
}
