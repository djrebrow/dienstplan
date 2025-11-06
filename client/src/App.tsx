import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addDays, differenceInCalendarDays, parseISO, format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import FiltersBar from './components/FiltersBar';
import ScheduleTable from './components/ScheduleTable';
import LegendPanel from './components/LegendPanel';
import StatisticsPanel from './components/StatisticsPanel';
import EmployeeDialog from './components/EmployeeDialog';
import CalendarDialog from './components/CalendarDialog';
import { useScheduleStore } from './hooks/useScheduleStore';
import type { ScheduleCell } from './types';

const App = () => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [showCalendarDialog, setShowCalendarDialog] = useState(false);

  const {
    load,
    save,
    undo,
    redo,
    setNotes,
    notes,
    legend,
    rangeStart,
    rangeEnd,
    employees,
    cells,
    shiftTypes,
    isAdmin,
    setAdmin
  } = useScheduleStore((state) => ({
    load: state.load,
    save: state.save,
    undo: state.undo,
    redo: state.redo,
    setNotes: state.setNotes,
    notes: state.notes,
    legend: state.legend,
    rangeStart: state.rangeStart,
    rangeEnd: state.rangeEnd,
    employees: state.employees,
    cells: state.cells,
    shiftTypes: state.shiftTypes,
    isAdmin: state.isAdmin,
    setAdmin: state.setAdmin
  }));

  useEffect(() => {
    load();
  }, [load]);

  const matrix = useMemo(() => {
    const start = parseISO(rangeStart);
    const days = differenceInCalendarDays(parseISO(rangeEnd), start) + 1;
    const header = ['Mitarbeiter'];
    const columns: string[] = [];
    for (let i = 0; i < days; i += 1) {
      const current = addDays(start, i);
      const key = format(current, 'yyyy-MM-dd');
      columns.push(key);
      header.push(format(current, 'dd.MM.yyyy'));
    }
    const rows = employees.map((employee) => {
      const row = [employee.name];
      for (const key of columns) {
        const match = cells.find(
          (cell) => cell.employeeId === employee.id && cell.date === key
        );
        row.push(match?.shiftType ?? '');
      }
      return row;
    });
    return { header, rows, columns };
  }, [rangeStart, rangeEnd, employees, cells]);

  const handleExportExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheetData = [matrix.header, ...matrix.rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dienstplan');
    XLSX.writeFile(workbook, 'dienstplan.xlsx');
  };

  const handleExportPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a3' });
    autoTable(doc, {
      head: [matrix.header],
      body: matrix.rows,
      styles: {
        fontSize: 8,
        halign: 'center',
        fillColor: [0, 95, 115],
        textColor: [255, 255, 255]
      },
      alternateRowStyles: { fillColor: [148, 210, 189], textColor: [0, 0, 0] },
      headStyles: {
        fillColor: [0, 95, 115],
        textColor: [255, 255, 255]
      }
    });
    doc.save('dienstplan.pdf');
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
    if (data.length <= 1) return;
    const [header, ...rows] = data;
    const dateColumns = header.slice(1).map((label) => {
      const [day, month, year] = (label as string).split('.');
      return `${year}-${month}-${day}`;
    });
    const importedCells: ScheduleCell[] = [];
    rows.forEach((row) => {
      const [name, ...values] = row;
      const employee = employees.find((item) => item.name === name);
      if (!employee) return;
      values.forEach((value, index) => {
        if (!value) return;
        importedCells.push({
          employeeId: employee.id,
          date: dateColumns[index],
          shiftType: value
        });
      });
    });
    importedCells.forEach((cell) => {
      useScheduleStore.getState().updateCell(cell);
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const totalLegendText = useMemo(() => Object.values(legend).join(' | '), [legend]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 text-slate-900 print:a3">
      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">{t('title')}</h1>
            <p className="text-sm text-slate-600">{totalLegendText}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAdmin(!isAdmin)}
              className="px-4 py-2 rounded border border-primary text-primary hover:bg-primary hover:text-white"
            >
              {isAdmin ? t('publicView') : t('adminArea')}
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={undo}
                  className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300"
                >
                  {t('undo')}
                </button>
                <button
                  onClick={redo}
                  className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300"
                >
                  {t('redo')}
                </button>
                <button
                  onClick={save}
                  className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90"
                >
                  {t('save')}
                </button>
                <button
                  onClick={handleImportClick}
                  className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300"
                >
                  {t('importExcel')}
                </button>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  ref={fileInputRef}
                  onChange={handleImportExcel}
                  className="hidden"
                />
                <button
                  onClick={() => setShowEmployeeDialog(true)}
                  className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300"
                >
                  {t('employees')}
                </button>
                <button
                  onClick={() => setShowCalendarDialog(true)}
                  className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300"
                >
                  {t('calendarSettings')}
                </button>
              </>
            )}
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 rounded bg-accent text-slate-800 hover:bg-accent/80"
            >
              {t('exportExcel')}
            </button>
            <button
              onClick={handleExportPdf}
              className="px-4 py-2 rounded bg-accent text-slate-800 hover:bg-accent/80"
            >
              {t('exportPdf')}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <FiltersBar />
        <section className="bg-white/90 rounded-lg shadow p-4">
          <ScheduleTable />
        </section>
        <section className="grid gap-4 lg:grid-cols-2">
          <LegendPanel />
          <div className="bg-white/80 rounded-lg p-4 shadow">
            <h3 className="text-lg font-semibold mb-3">{t('notes')}</h3>
            <textarea
              disabled={!isAdmin}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="w-full h-32 border rounded px-3 py-2"
            />
          </div>
        </section>
        <StatisticsPanel />
      </main>

      {isAdmin && (
        <>
          <EmployeeDialog open={showEmployeeDialog} onClose={() => setShowEmployeeDialog(false)} />
          <CalendarDialog open={showCalendarDialog} onClose={() => setShowCalendarDialog(false)} />
        </>
      )}
    </div>
  );
};

export default App;
