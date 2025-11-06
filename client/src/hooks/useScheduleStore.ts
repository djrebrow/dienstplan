import { create } from 'zustand';
import axios from 'axios';
import { format, addDays, startOfWeek } from 'date-fns';
import deLocale from 'date-fns/locale/de';
import type {
  SchedulePayload,
  Employee,
  ScheduleCell,
  ScheduleFilters,
  CalendarSettings
} from '../types';

interface ScheduleState extends SchedulePayload {
  loading: boolean;
  isAdmin: boolean;
  filters: ScheduleFilters;
  undoStack: SchedulePayload[];
  redoStack: SchedulePayload[];
  load: () => Promise<void>;
  setAdmin: (value: boolean) => void;
  setFilters: (filters: Partial<ScheduleFilters>) => void;
  updateCell: (cell: ScheduleCell) => void;
  setLegend: (legend: Record<string, string>) => void;
  setNotes: (notes: string) => void;
  addEmployee: (employee: Employee) => void;
  removeEmployee: (id: string) => void;
  reorderEmployees: (employees: Employee[]) => void;
  save: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  applyCalendarSettings: (settings: CalendarSettings) => void;
}

const defaultState: SchedulePayload = {
  rangeStart: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  rangeEnd: format(addDays(new Date(), 27), 'yyyy-MM-dd'),
  employees: [],
  cells: [],
  shiftTypes: ['Früh', 'Spät', 'Nacht', 'Frei'],
  legend: {
    Früh: 'Frühschicht (06:00 - 14:00)',
    Spät: 'Spätschicht (14:00 - 22:00)',
    Nacht: 'Nachtschicht (22:00 - 06:00)',
    Frei: 'Freier Tag'
  },
  notes: ''
};

const clampHistory = (stack: SchedulePayload[]) => stack.slice(-50);

const clonePayload = (payload: SchedulePayload): SchedulePayload => ({
  rangeStart: payload.rangeStart,
  rangeEnd: payload.rangeEnd,
  employees: payload.employees.map((e) => ({ ...e })),
  cells: payload.cells.map((c) => ({ ...c })),
  shiftTypes: [...payload.shiftTypes],
  legend: { ...payload.legend },
  notes: payload.notes
});

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  ...defaultState,
  loading: false,
  isAdmin: true,
  filters: {
    employeeName: '',
    shiftType: '',
    highContrast: false
  },
  undoStack: [],
  redoStack: [],
  async load() {
    set({ loading: true });
    try {
      const { data } = await axios.get<SchedulePayload>('/api/schedule');
      set({ ...data, loading: false, undoStack: [], redoStack: [] });
    } catch (error) {
      console.error('Fehler beim Laden des Dienstplans', error);
      set({ loading: false });
    }
  },
  setAdmin(value) {
    set({ isAdmin: value });
  },
  setFilters(filters) {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
    const { filters: nextFilters } = get();
    if (typeof document !== 'undefined') {
      if (nextFilters.highContrast) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
    }
  },
  updateCell(cell) {
    set((state) => {
      const payload = clonePayload(state);
      const index = payload.cells.findIndex(
        (c) => c.employeeId === cell.employeeId && c.date === cell.date
      );
      if (index >= 0) {
        if (cell.shiftType) {
          payload.cells[index] = cell;
        } else {
          payload.cells.splice(index, 1);
        }
      } else if (cell.shiftType) {
        payload.cells.push(cell);
      }
      return {
        ...payload,
        undoStack: clampHistory([...state.undoStack, clonePayload(state)]),
        redoStack: []
      };
    });
  },
  setLegend(legend) {
    set((state) => ({
      legend,
      undoStack: clampHistory([...state.undoStack, clonePayload(state)]),
      redoStack: []
    }));
  },
  setNotes(notes) {
    set((state) => ({
      notes,
      undoStack: clampHistory([...state.undoStack, clonePayload(state)]),
      redoStack: []
    }));
  },
  addEmployee(employee) {
    set((state) => ({
      employees: [...state.employees, employee],
      undoStack: clampHistory([...state.undoStack, clonePayload(state)]),
      redoStack: []
    }));
  },
  removeEmployee(id) {
    set((state) => ({
      employees: state.employees.filter((e) => e.id !== id),
      cells: state.cells.filter((c) => c.employeeId !== id),
      undoStack: clampHistory([...state.undoStack, clonePayload(state)]),
      redoStack: []
    }));
  },
  reorderEmployees(employees) {
    set((state) => ({
      employees,
      undoStack: clampHistory([...state.undoStack, clonePayload(state)]),
      redoStack: []
    }));
  },
  async save() {
    const payload = clonePayload(get());
    try {
      await axios.put('/api/schedule', payload);
    } catch (error) {
      console.error('Fehler beim Speichern', error);
    }
  },
  undo() {
    set((state) => {
      const previous = state.undoStack[state.undoStack.length - 1];
      if (!previous) return state;
      const remaining = state.undoStack.slice(0, -1);
      return {
        ...clonePayload(previous),
        loading: state.loading,
        isAdmin: state.isAdmin,
        filters: state.filters,
        undoStack: remaining,
        redoStack: clampHistory([...state.redoStack, clonePayload(state)])
      };
    });
  },
  redo() {
    set((state) => {
      const next = state.redoStack[state.redoStack.length - 1];
      if (!next) return state;
      const remaining = state.redoStack.slice(0, -1);
      return {
        ...clonePayload(next),
        loading: state.loading,
        isAdmin: state.isAdmin,
        filters: state.filters,
        undoStack: clampHistory([...state.undoStack, clonePayload(state)]),
        redoStack: remaining
      };
    });
  },
  applyCalendarSettings({ startDate, weeks, includeExisting }) {
    set((state) => {
      const start = startOfWeek(new Date(startDate), { weekStartsOn: 1 });
      const rangeStart = format(start, 'yyyy-MM-dd');
      const rangeEnd = format(addDays(start, weeks * 7 - 1), 'yyyy-MM-dd');
      const preserved = includeExisting
        ? state.cells.filter((cell) => {
            const cellDate = new Date(cell.date);
            return cellDate >= start && cellDate <= addDays(start, weeks * 7 - 1);
          })
        : [];
      return {
        rangeStart,
        rangeEnd,
        cells: preserved,
        undoStack: clampHistory([...state.undoStack, clonePayload(state)]),
        redoStack: []
      };
    });
  }
}));

export const getFormattedDateLabel = (date: Date) =>
  format(date, 'EEE dd.MM', { locale: deLocale });
