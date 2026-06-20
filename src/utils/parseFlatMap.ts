import { parsePrimitiveValue } from "./parsePrimitiveValue";

export function parseFlatMap(
  objectString: string
): Record<string, boolean | number> {
  const parsed = JSON.parse(objectString);
  const map: Record<string, boolean | number> = {};

  for (const key in parsed) {
    map[key] = parsePrimitiveValue(parsed[key]) as boolean | number;
  }

  return map;
}
