import React from 'react';

export const SettingsMenu = ({ stages, onUpdateStage, onClose }) => {
  const handleInputChange = (stageId, field, value) => {
    const stage = stages.find(s => s.id === stageId);
    if (stage) {
      const newStage = { ...stage };

      if (field.includes('.')) {
        const [key, subkey] = field.split('.');
        const parsedValue = parseFloat(value) || 0;
        newStage[key] = { ...newStage[key], [subkey]: parsedValue };

        // Validation for min/max
        if (key === 'processTime') {
          if (subkey === 'min' && newStage.processTime.min > newStage.processTime.max) {
            newStage.processTime.max = newStage.processTime.min;
          } else if (subkey === 'max' && newStage.processTime.max < newStage.processTime.min) {
            newStage.processTime.min = newStage.processTime.max;
          }
        } else if (key === 'waitTime' && newStage.waitTime) {
          if (subkey === 'min' && newStage.waitTime.min > newStage.waitTime.max) {
            newStage.waitTime.max = newStage.waitTime.min;
          } else if (subkey === 'max' && newStage.waitTime.max < newStage.waitTime.min) {
            newStage.waitTime.min = newStage.waitTime.max;
          }
        }
      } else {
        // Handle direct properties like 'actors'
        newStage[field] = value === 'Infinity' ? Infinity : parseInt(value, 10) || 0;
      }

      onUpdateStage(stageId, newStage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-6 w-full max-w-4xl text-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Simulation Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
        </div>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {stages.filter(s => s.type === 'process').map(stage => (
            <div key={stage.id} className="bg-slate-900/50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg text-blue-300 mb-3">{stage.label}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Actors */}
                <div>
                  <label htmlFor={`${stage.id}-actors`} className="block text-sm font-medium text-slate-400 mb-1">Concurrent Actors</label>
                  <input
                    type="number"
                    id={`${stage.id}-actors`}
                    value={stage.actors === Infinity ? '' : stage.actors}
                    placeholder={stage.actors === Infinity ? 'Infinity' : ''}
                    onChange={(e) => handleInputChange(stage.id, 'actors', e.target.value || 'Infinity')}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-white"
                    step="1"
                    min="1"
                  />
                </div>
                
                {/* Process Time */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-400">Process Time (h)</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min" value={stage.processTime.min} onChange={(e) => handleInputChange(stage.id, 'processTime.min', e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded px-2 py-1" step="0.1"/>
                    <input type="number" placeholder="Max" value={stage.processTime.max} onChange={(e) => handleInputChange(stage.id, 'processTime.max', e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded px-2 py-1" step="0.1"/>
                  </div>
                </div>

                {/* Wait Time */}
                {stage.waitTime && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400">Wait Time (h)</label>
                    <div className="flex gap-2">
                      <input type="number" placeholder="Min" value={stage.waitTime.min} onChange={(e) => handleInputChange(stage.id, 'waitTime.min', e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded px-2 py-1" step="0.1"/>
                      <input type="number" placeholder="Max" value={stage.waitTime.max} onChange={(e) => handleInputChange(stage.id, 'waitTime.max', e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded px-2 py-1" step="0.1"/>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
