export function parsePrimitiveValue(value: unknown): string | number | boolean {
  if (typeof value !== "string") return value as string | number | boolean;

  if (value === "true") return true;
  if (value === "false") return false;
  if (!isNaN(Number(value)) && value.trim() !== "") return Number(value);
  return value;
}
