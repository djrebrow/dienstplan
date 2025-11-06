import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { useScheduleStore } from '../hooks/useScheduleStore';
import { buildWeekdayGroups } from '../utils/dateRanges';

const StatisticsPanel = () => {
  const { t } = useTranslation();
  const { employees, cells, rangeStart, rangeEnd, shiftTypes } = useScheduleStore((state) => ({
    employees: state.employees,
    cells: state.cells,
    rangeStart: state.rangeStart,
    rangeEnd: state.rangeEnd,
    shiftTypes: state.shiftTypes
  }));

  const weekGroups = useMemo(
    () => buildWeekdayGroups(rangeStart, rangeEnd),
    [rangeStart, rangeEnd]
  );

  const weekIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    weekGroups.forEach((week) => {
      week.days.forEach((day) => {
        map.set(day.key, week.index);
      });
    });
    return map;
  }, [weekGroups]);

  const statistics = employees.map((employee) => {
    const perWeek = Array.from({ length: weekGroups.length }, () =>
      shiftTypes.reduce<Record<string, number>>((acc, shift) => {
        acc[shift] = 0;
        return acc;
      }, {})
    );
    cells
      .filter((cell) => cell.employeeId === employee.id)
      .forEach((cell) => {
        const weekIndex = weekIndexMap.get(cell.date);
        if (weekIndex === undefined) return;
        const weekBucket = perWeek[weekIndex];
        if (!weekBucket) return;
        if (cell.shiftType && weekBucket[cell.shiftType] !== undefined) {
          weekBucket[cell.shiftType] += 1;
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
            {weekGroups.map((_, index) => (
              <th key={index} className="border px-3 py-2 text-center">
                {t('weekLabel', { index: index + 1 })}
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
