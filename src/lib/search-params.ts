export type RawSearchParams = Record<string, string | string[] | undefined>;

export function asString(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export function asArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function asBool(value: string | string[] | undefined): boolean {
  const v = asString(value);
  return v === "1" || v === "true" || v === "on";
}