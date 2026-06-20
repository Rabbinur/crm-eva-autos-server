import { DateTime } from "luxon";

export const convertToISOTime = (
  timeStr: string | null | undefined,
  timezone: string = "America/New_York",
  fallbackMinutes: number = 30
): string => {
  const now = DateTime.now().setZone(timezone);

  const getFallbackISO = () =>
    now.plus({ minutes: fallbackMinutes }).toUTC().toISO() as string;

  if (typeof timeStr !== "string" || timeStr.trim() === "") {
    return getFallbackISO();
  }

  const parsed = DateTime.fromFormat(timeStr.trim().toUpperCase(), "hh:mma", {
    zone: timezone,
  });

  if (!parsed.isValid) {
    return getFallbackISO();
  }

  const combined = DateTime.fromObject(
    {
      year: now.year,
      month: now.month,
      day: now.day,
      hour: parsed.hour,
      minute: parsed.minute,
      second: 0,
      millisecond: 0,
    },
    { zone: timezone }
  );

  return combined.toUTC().toISO() as string;
};
