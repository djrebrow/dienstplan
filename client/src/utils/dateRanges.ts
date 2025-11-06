import { addDays, format, isWeekend, parseISO, startOfWeek } from 'date-fns';

export interface WeekdayInfo {
  date: Date;
  key: string;
  display: string;
}

export interface WeekGroup {
  index: number;
  start: Date;
  days: WeekdayInfo[];
}

const WEEK_OPTIONS = { weekStartsOn: 1 as const };

export const buildWeekdayGroups = (rangeStart: string, rangeEnd: string): WeekGroup[] => {
  const startDate = parseISO(rangeStart);
  const endDate = parseISO(rangeEnd);
  const weeks = new Map<string, WeekGroup>();
  let current = startDate;
  while (current <= endDate) {
    if (!isWeekend(current)) {
      const weekStart = startOfWeek(current, WEEK_OPTIONS);
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      if (!weeks.has(weekKey)) {
        const index = weeks.size;
        weeks.set(weekKey, {
          index,
          start: weekStart,
          days: []
        });
      }
      const week = weeks.get(weekKey)!;
      week.days.push({
        date: current,
        key: format(current, 'yyyy-MM-dd'),
        display: format(current, 'dd.MM.yyyy')
      });
    }
    current = addDays(current, 1);
  }
  const sorted = Array.from(weeks.values()).sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );
  return sorted.map((week, index) => ({
    ...week,
    index
  }));
};

export const flattenWeekdays = (weeks: WeekGroup[]): WeekdayInfo[] =>
  weeks.flatMap((week) => week.days);

