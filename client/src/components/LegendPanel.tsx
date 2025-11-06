import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useScheduleStore } from '../hooks/useScheduleStore';

const LegendPanel = () => {
  const { t } = useTranslation();
  const { legend, isAdmin, setLegend } = useScheduleStore((state) => ({
    legend: state.legend,
    isAdmin: state.isAdmin,
    setLegend: state.setLegend
  }));

  const handleChange = (shift: string) => (event: ChangeEvent<HTMLInputElement>) => {
    setLegend({ ...legend, [shift]: event.target.value });
  };

  return (
    <div className="bg-white/80 rounded-lg p-4 shadow">
      <h3 className="text-lg font-semibold mb-3">{t('legend')}</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {Object.entries(legend).map(([shift, description]) => (
          <div key={shift} className="flex flex-col">
            <span className="text-sm font-semibold text-primary">{shift}</span>
            {isAdmin ? (
              <input
                className="border rounded px-2 py-1"
                value={description}
                onChange={handleChange(shift)}
              />
            ) : (
              <p className="text-sm text-slate-700">{description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LegendPanel;
