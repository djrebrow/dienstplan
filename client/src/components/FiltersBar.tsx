import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useScheduleStore } from '../hooks/useScheduleStore';

const FiltersBar = () => {
  const { t } = useTranslation();
  const { filters, shiftTypes, setFilters } = useScheduleStore((state) => ({
    filters: state.filters,
    shiftTypes: state.shiftTypes,
    setFilters: state.setFilters
  }));

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFilters({ employeeName: event.target.value });
  };

  const handleShiftChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFilters({ shiftType: event.target.value });
  };

  const handleContrastToggle = (event: ChangeEvent<HTMLInputElement>) => {
    setFilters({ highContrast: event.target.checked });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end bg-white/80 rounded-lg p-4 shadow">
      <div className="flex flex-col">
        <label className="text-sm font-semibold" htmlFor="filter-name">
          {t('employee')}
        </label>
        <input
          id="filter-name"
          type="text"
          placeholder="z.B. Müller"
          value={filters.employeeName}
          onChange={handleNameChange}
          className="border rounded px-2 py-1"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-semibold" htmlFor="filter-shift">
          {t('shift')}
        </label>
        <select
          id="filter-shift"
          value={filters.shiftType}
          onChange={handleShiftChange}
          className="border rounded px-2 py-1"
        >
          <option value="">Alle</option>
          {shiftTypes.map((shift) => (
            <option key={shift} value={shift}>
              {shift}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="toggle-contrast"
          type="checkbox"
          checked={filters.highContrast}
          onChange={handleContrastToggle}
        />
        <label htmlFor="toggle-contrast" className="font-semibold">
          High Contrast
        </label>
      </div>
      <div className="text-sm text-slate-600">
        <p>A3 quer optimiert – Druckansicht über Browser-Druckfunktion.</p>
      </div>
    </div>
  );
};

export default FiltersBar;
