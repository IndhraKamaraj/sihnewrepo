/**
 * Time and Schedule Utilities for Dynamic ETA Engine
 * SIH Problem Statement 26028
 */

/**
 * Parses "HH:MM" time string into absolute minutes from day 1 00:00.
 * Respects dayCount for multi-day journeys (e.g., day 2 00:35 -> 1440 + 35 = 1475 min).
 */
export function parseScheduleTimeToMinutes(timeStr: string, dayCount = 1): number {
  if (!timeStr || timeStr === 'SOURCE' || timeStr === 'DEST') {
    return (Math.max(1, dayCount) - 1) * 1440;
  }

  const clean = timeStr.trim().replace(/\s*\([^)]*\)/g, ''); // strip "(Est)" etc.
  const parts = clean.split(':');
  if (parts.length < 2) {
    return (Math.max(1, dayCount) - 1) * 1440;
  }

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (isNaN(hours) || isNaN(minutes)) {
    return (Math.max(1, dayCount) - 1) * 1440;
  }

  const baseMinutes = hours * 60 + minutes;
  return (Math.max(1, dayCount) - 1) * 1440 + baseMinutes;
}

/**
 * Converts absolute minutes from day 1 00:00 back to "HH:MM" format.
 * If day rolls over compared to originDay, appends a subtle day marker e.g. "(+1d)".
 */
export function formatMinutesToTimeString(
  totalMinutes: number,
  includeDayMarker = false,
  originDay = 1
): string {
  if (isNaN(totalMinutes) || totalMinutes < 0) {
    return '--:--';
  }

  const dayIndex = Math.floor(totalMinutes / 1440) + 1;
  const remMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(remMinutes / 60);
  const minutes = remMinutes % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');

  const dayDiff = dayIndex - originDay;
  if (includeDayMarker && dayDiff > 0) {
    return `${hh}:${mm} (+${dayDiff}d)`;
  }

  return `${hh}:${mm}`;
}

/**
 * Formats a delay minute number into a human-readable display string.
 * e.g., 0 -> "On Time", 8 -> "+8 min", -4 -> "-4 min (Early)"
 */
export function formatDelayString(delayMinutes: number): string {
  if (delayMinutes === 0) {
    return 'On Time';
  }
  if (delayMinutes > 0) {
    return `+${delayMinutes} min`;
  }
  return `${delayMinutes} min early`;
}

/**
 * Formats difference between dynamic and baseline prediction.
 */
export function formatETADifference(diffMinutes: number): {
  label: string;
  trend: 'RECOVERY' | 'ADDITIONAL_DELAY' | 'ON_TRACK';
  formattedString: string;
} {
  if (diffMinutes <= -2) {
    return {
      label: `${Math.abs(diffMinutes)} min recovery expected`,
      trend: 'RECOVERY',
      formattedString: `${diffMinutes} min`
    };
  }
  if (diffMinutes >= 2) {
    return {
      label: `+${diffMinutes} min additional delay`,
      trend: 'ADDITIONAL_DELAY',
      formattedString: `+${diffMinutes} min`
    };
  }
  return {
    label: 'Consistent with baseline',
    trend: 'ON_TRACK',
    formattedString: '0 min'
  };
}
