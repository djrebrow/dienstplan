import { addDays, format } from 'date-fns';

const toKey = (date: Date) => format(date, 'yyyy-MM-dd');

// Computus algorithm to determine Easter Sunday
const calculateEasterSunday = (year: number): Date => {
  const f = Math.floor;
  const G = year % 19;
  const C = f(year / 100);
  const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30;
  const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11));
  const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7;
  const L = I - J;
  const month = 3 + f((L + 40) / 44);
  const day = L + 28 - 31 * f(month / 4);
  return new Date(year, month - 1, day);
};

export const getLowerSaxonyHolidayMap = (year: number): Map<string, string> => {
  const easterSunday = calculateEasterSunday(year);
  const holidays = new Map<string, string>();
  const add = (date: Date, label: string) => holidays.set(toKey(date), label);

  add(new Date(year, 0, 1), 'Neujahr');
  add(addDays(easterSunday, -2), 'Karfreitag');
  add(addDays(easterSunday, 1), 'Ostermontag');
  add(new Date(year, 4, 1), 'Tag der Arbeit');
  add(addDays(easterSunday, 39), 'Christi Himmelfahrt');
  add(addDays(easterSunday, 50), 'Pfingstmontag');
  add(new Date(year, 9, 3), 'Tag der Deutschen Einheit');
  add(new Date(year, 9, 31), 'Reformationstag');
  add(new Date(year, 11, 25), '1. Weihnachtstag');
  add(new Date(year, 11, 26), '2. Weihnachtstag');

  return holidays;
};
