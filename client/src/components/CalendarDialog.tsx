import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { useScheduleStore } from '../hooks/useScheduleStore';

interface CalendarDialogProps {
  open: boolean;
  onClose: () => void;
}

const CalendarDialog = ({ open, onClose }: CalendarDialogProps) => {
  const { t } = useTranslation();
  const { rangeStart, applyCalendarSettings } = useScheduleStore((state) => ({
    rangeStart: state.rangeStart,
    applyCalendarSettings: state.applyCalendarSettings
  }));

  const [startDate, setStartDate] = useState(rangeStart);
  const [weeks, setWeeks] = useState(4);
  const [includeExisting, setIncludeExisting] = useState(true);

  useEffect(() => {
    if (open) {
      setStartDate(rangeStart);
      const { rangeEnd: currentEnd } = useScheduleStore.getState();
      const diffDays =
        differenceInCalendarDays(parseISO(currentEnd), parseISO(rangeStart)) + 1;
      setWeeks(Math.max(1, Math.ceil(diffDays / 7)));
    }
  }, [open, rangeStart]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    applyCalendarSettings({ startDate, weeks, includeExisting });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('calendarSettings')}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold" htmlFor="start-date">
              {t('startDate')}
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold" htmlFor="weeks">
              {t('weeks')}
            </label>
            <input
              id="weeks"
              type="number"
              min={1}
              max={8}
              value={weeks}
              onChange={(event) => setWeeks(Number(event.target.value))}
              className="border rounded px-3 py-2"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeExisting}
              onChange={(event) => setIncludeExisting(event.target.checked)}
            />
            {t('includeExisting')}
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90"
            >
              {t('apply')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalendarDialog;
