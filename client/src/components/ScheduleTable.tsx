import { useEffect, useMemo, useRef } from 'react';
import { ReactTabulator } from '@tabulator-tables/react';
import { addDays, differenceInCalendarDays, parseISO, format } from 'date-fns';
import { useScheduleStore, getFormattedDateLabel } from '../hooks/useScheduleStore';
import { getLowerSaxonyHolidayMap } from '../utils/holidays';
import 'tabulator-tables/dist/css/tabulator.min.css';
import '../styles/tabulator.css';

const ScheduleTable = () => {
  const tableRef = useRef<ReactTabulator | null>(null);
  const {
    employees,
    cells,
    rangeStart,
    rangeEnd,
    shiftTypes,
    filters,
    isAdmin,
    updateCell
  } = useScheduleStore((state) => ({
    employees: state.employees,
    cells: state.cells,
    rangeStart: state.rangeStart,
    rangeEnd: state.rangeEnd,
    shiftTypes: state.shiftTypes,
    filters: state.filters,
    isAdmin: state.isAdmin,
    updateCell: state.updateCell
  }));

  const start = useMemo(() => parseISO(rangeStart), [rangeStart]);
  const dayCount = useMemo(
    () => differenceInCalendarDays(parseISO(rangeEnd), parseISO(rangeStart)) + 1,
    [rangeStart, rangeEnd]
  );

  const holidays = useMemo(() => {
    const map = new Map<string, string>();
    for (let i = 0; i < dayCount; i += 1) {
      const current = addDays(start, i);
      const yearMap = getLowerSaxonyHolidayMap(current.getFullYear());
      const key = format(current, 'yyyy-MM-dd');
      if (yearMap.has(key)) {
        map.set(key, yearMap.get(key)!);
      }
    }
    return map;
  }, [start, dayCount]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesName = employee.name
        .toLowerCase()
        .includes(filters.employeeName.toLowerCase());
      if (!matchesName) return false;
      if (!filters.shiftType) return true;
      return cells.some(
        (cell) =>
          cell.employeeId === employee.id &&
          cell.shiftType === filters.shiftType &&
          cell.date >= rangeStart &&
          cell.date <= rangeEnd
      );
    });
  }, [employees, cells, filters.employeeName, filters.shiftType, rangeStart, rangeEnd]);

  const tableData = useMemo(() => {
    const rows = filteredEmployees.map((employee) => {
      const row: Record<string, string> = {
        id: employee.id,
        employee: employee.name
      };
      for (let i = 0; i < dayCount; i += 1) {
        const current = addDays(start, i);
        const key = format(current, 'yyyy-MM-dd');
        const match = cells.find(
          (cell) => cell.employeeId === employee.id && cell.date === key
        );
        row[key] = match?.shiftType ?? '';
      }
      return row;
    });
    return rows;
  }, [filteredEmployees, cells, dayCount, start]);

  const shiftOptions = useMemo(
    () =>
      shiftTypes.reduce<Record<string, string>>((acc, type) => {
        acc[type] = type;
        return acc;
      }, {}),
    [shiftTypes]
  );

  const dayColumns = useMemo(() => {
    const columns = [];
    for (let i = 0; i < dayCount; i += 1) {
      const current = addDays(start, i);
      const key = format(current, 'yyyy-MM-dd');
      const holiday = holidays.get(key);
      columns.push({
        title: `${getFormattedDateLabel(current)}${holiday ? `\n${holiday}` : ''}`,
        field: key,
        width: 150,
        hozAlign: 'center',
        headerWordWrap: true,
        editable: isAdmin && !holiday,
        editor: isAdmin && !holiday ? 'list' : undefined,
        editorParams: isAdmin && !holiday ? { values: shiftOptions, listOnEmpty: true } : undefined,
        cssClass: holiday ? 'holiday-cell' : 'working-day-cell',
        cellDblClick: (e: Event, cell: any) => {
          if (isAdmin && !holiday && !cell.getValue()) {
            cell.edit(true);
          }
        }
      });
    }
    return columns;
  }, [dayCount, start, holidays, shiftOptions, isAdmin]);

  const columns = useMemo(
    () => [
      {
        title: 'Mitarbeiter',
        field: 'employee',
        frozen: true,
        headerSort: true,
        width: 200
      },
      ...dayColumns
    ],
    [dayColumns]
  );

  const options = useMemo(
    () => ({
      layout: 'fitDataFill',
      clipboard: true,
      movableColumns: true,
      height: '600px',
      selectable: 1,
      rowContextMenu: [
        {
          label: 'Frei setzen',
          action: (_e, row) => {
            if (!isAdmin) return;
            const rowData = row.getData();
            for (let i = 0; i < dayCount; i += 1) {
              const current = addDays(start, i);
              const key = format(current, 'yyyy-MM-dd');
              if (!holidays.has(key)) {
                updateCell({ employeeId: rowData.id, date: key, shiftType: 'Frei' });
              }
            }
          }
        },
        {
          label: 'Zeile leeren',
          action: (_e, row) => {
            if (!isAdmin) return;
            const rowData = row.getData();
            for (let i = 0; i < dayCount; i += 1) {
              const current = addDays(start, i);
              const key = format(current, 'yyyy-MM-dd');
              updateCell({ employeeId: rowData.id, date: key, shiftType: '' });
            }
          }
        }
      ],
      dataTree: false
    }),
    [isAdmin, dayCount, start, holidays, updateCell]
  );

  useEffect(() => {
    const table = tableRef.current?.table;
    if (!table) return;
    table.setData(tableData);
  }, [tableData]);

  useEffect(() => {
    const table = tableRef.current?.table;
    if (!table) return;
    table.setColumns(columns as any);
  }, [columns]);

  useEffect(() => {
    const table = tableRef.current?.table;
    if (!table) return;
    table.setOptions({
      rowFormatter: (row: any) => {
        const element = row.getElement();
        element.classList.toggle('high-contrast-row', filters.highContrast);
      }
    });
  }, [filters.highContrast]);

  const handleCellEdited = (_: any, cellComponent: any) => {
    const field = cellComponent.getField?.();
    if (!field || field === 'employee') return;
    const value = cellComponent.getValue();
    const row = cellComponent.getRow();
    const employeeId = row.getData().id;
    updateCell({ employeeId, date: field, shiftType: value ?? '' });
  };

  return (
    <div className="schedule-table">
      <ReactTabulator
        key={`${rangeStart}-${rangeEnd}-${isAdmin ? 'admin' : 'public'}`}
        ref={tableRef}
        data={tableData}
        columns={columns as any}
        options={options}
        events={{
          cellEdited: handleCellEdited
        }}
      />
    </div>
  );
};

export default ScheduleTable;
