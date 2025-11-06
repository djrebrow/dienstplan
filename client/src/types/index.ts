export interface Employee {
  id: string;
  name: string;
  role?: string;
}

export interface ScheduleCell {
  employeeId: string;
  date: string;
  shiftType: string;
}

export interface ScheduleWeek {
  weekStart: string;
  days: ScheduleCell[];
}

export interface SchedulePayload {
  rangeStart: string;
  rangeEnd: string;
  employees: Employee[];
  cells: ScheduleCell[];
  shiftTypes: string[];
  legend: Record<string, string>;
  notes: string;
}

export interface CalendarSettings {
  startDate: string;
  weeks: number;
  includeExisting: boolean;
}

export interface ScheduleFilters {
  employeeName: string;
  shiftType: string;
  highContrast: boolean;
}
