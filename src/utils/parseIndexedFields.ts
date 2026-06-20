import { parsePrimitiveValue } from "./parsePrimitiveValue";

export function parseArrayOfObject(arrayString: string): any[] {
  try {
    const parsed = JSON.parse(arrayString);

    if (Array.isArray(parsed)) {
      return parsed.map((item) => {
        if (typeof item === "object" && item !== null) {
          const parsedObj: Record<string, any> = {};
          for (const key in item) {
            parsedObj[key] = parsePrimitiveValue(item[key]);
          }
          return parsedObj;
        }
        return item;
      });
    }

    return [];
  } catch (error) {
    console.error("Invalid JSON string for array:", error);
    return [];
  }
}

export function parseArrayOfString(arrayString: string): any[] {
  try {
    const parsed = JSON.parse(arrayString);

    if (Array.isArray(parsed)) {
      return parsed.map(parsePrimitiveValue);
    }

    return [];
  } catch (error) {
    console.error("Invalid JSON string for array:", error);
    return [];
  }
}
