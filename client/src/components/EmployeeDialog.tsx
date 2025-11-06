import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useScheduleStore } from '../hooks/useScheduleStore';

interface EmployeeDialogProps {
  open: boolean;
  onClose: () => void;
}

const EmployeeDialog = ({ open, onClose }: EmployeeDialogProps) => {
  const { t } = useTranslation();
  const { employees, addEmployee, removeEmployee, reorderEmployees } = useScheduleStore(
    (state) => ({
      employees: state.employees,
      addEmployee: state.addEmployee,
      removeEmployee: state.removeEmployee,
      reorderEmployees: state.reorderEmployees
    })
  );

  const [name, setName] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `emp-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    addEmployee({ id, name: name.trim() });
    setName('');
  };

  const move = (index: number, direction: -1 | 1) => {
    const updated = [...employees];
    const target = index + direction;
    if (target < 0 || target >= employees.length) return;
    [updated[index], updated[target]] = [updated[target], updated[index]];
    reorderEmployees(updated);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('employees')}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          >
            {t('addEmployee')}
          </button>
        </form>
        <div className="max-h-64 overflow-y-auto divide-y">
          {employees.map((employee, index) => (
            <div key={employee.id} className="flex items-center justify-between py-2 gap-2">
              <div>
                <p className="font-medium">{employee.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-2 py-1 border rounded"
                  onClick={() => move(index, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="px-2 py-1 border rounded"
                  onClick={() => move(index, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="px-2 py-1 border rounded text-red-600"
                  onClick={() => removeEmployee(employee.id)}
                >
                  {t('remove')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDialog;
