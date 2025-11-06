import { differenceInCalendarDays, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useScheduleStore } from '../hooks/useScheduleStore';

const StatisticsPanel = () => {
  const { t } = useTranslation();
  const { employees, cells, rangeStart, rangeEnd, shiftTypes } = useScheduleStore((state) => ({
    employees: state.employees,
    cells: state.cells,
    rangeStart: state.rangeStart,
    rangeEnd: state.rangeEnd,
    shiftTypes: state.shiftTypes
  }));

  const start = parseISO(rangeStart);
  const days = differenceInCalendarDays(parseISO(rangeEnd), start) + 1;
  const weeks = Math.ceil(days / 7);

  const statistics = employees.map((employee) => {
    const perWeek = Array.from({ length: weeks }, () =>
      shiftTypes.reduce<Record<string, number>>((acc, shift) => {
        acc[shift] = 0;
        return acc;
      }, {})
    );
    cells
      .filter((cell) => cell.employeeId === employee.id)
      .forEach((cell) => {
        const date = parseISO(cell.date);
        const diff = differenceInCalendarDays(date, start);
        if (diff < 0 || diff >= days) return;
        const weekIndex = Math.floor(diff / 7);
        if (cell.shiftType && perWeek[weekIndex][cell.shiftType] !== undefined) {
          perWeek[weekIndex][cell.shiftType] += 1;
        }
      });
    return { employee, perWeek };
  });

  return (
    <div className="bg-white/80 rounded-lg p-4 shadow overflow-x-auto">
      <h3 className="text-lg font-semibold mb-3">{t('statistics')}</h3>
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border px-3 py-2 text-left">{t('employee')}</th>
            {Array.from({ length: weeks }, (_, index) => (
              <th key={index} className="border px-3 py-2 text-center">
                KW {index + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {statistics.map(({ employee, perWeek }) => (
            <tr key={employee.id}>
              <td className="border px-3 py-2 font-semibold">{employee.name}</td>
              {perWeek.map((week, index) => (
                <td key={index} className="border px-3 py-2">
                  <ul className="space-y-1">
                    {shiftTypes.map((shift) => (
                      <li key={shift}>
                        <span className="font-medium">{shift}:</span> {week[shift]}
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatisticsPanel;
