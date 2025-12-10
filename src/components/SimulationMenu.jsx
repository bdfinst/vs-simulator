import { Menu, X, Check, Activity, Users } from 'lucide-react'

export const SimulationMenu = ({ isOpen, onClose, currentSimulation, onSimulationChange }) => {
  const simulations = [
    {
      id: 'value-stream',
      name: 'Value Stream Simulator',
      description: 'Visualize workflow, queues, bottlenecks, and rework loops in software delivery',
      icon: Activity,
      available: true,
    },
    {
      id: 'pairing-vs-review',
      name: 'Pairing vs Async Code Review',
      description: 'Compare the impact of pair programming versus asynchronous code review on flow',
      icon: Users,
      available: true,
    },
  ]

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-out menu */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-slate-900 border-r border-slate-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Menu size={24} className="text-blue-400" />
            <h2 className="text-xl font-bold text-white">Simulations</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Simulation List */}
        <div className="overflow-y-auto h-[calc(100vh-88px)]">
          <div className="p-4 space-y-3">
            {simulations.map(simulation => {
              const isActive = currentSimulation === simulation.id
              const Icon = simulation.icon

              return (
                <button
                  key={simulation.id}
                  onClick={() => {
                    if (simulation.available) {
                      onSimulationChange(simulation.id)
                      onClose()
                    }
                  }}
                  disabled={!simulation.available}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                    !simulation.available
                      ? 'bg-slate-800/50 border-slate-700/50 opacity-60 cursor-not-allowed'
                      : isActive
                      ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/20'
                      : 'bg-slate-800 border-slate-700 hover:bg-slate-750 hover:border-slate-600 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${
                      isActive ? 'text-blue-200' : simulation.available ? 'text-blue-400' : 'text-slate-500'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`font-semibold ${
                          isActive ? 'text-white' : simulation.available ? 'text-slate-200' : 'text-slate-400'
                        }`}>
                          {simulation.name}
                        </h3>
                        {isActive && (
                          <Check size={16} className="text-blue-200 flex-shrink-0" />
                        )}
                        {!simulation.available && (
                          <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-400 rounded-full">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${
                        isActive ? 'text-blue-100' : simulation.available ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {simulation.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Footer info */}
          <div className="p-4 mt-4 border-t border-slate-800">
            <p className="text-xs text-slate-500 text-center">
              More simulations coming soon
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export const MenuToggleButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md font-medium transition-colors"
      aria-label="Open simulation menu"
    >
      <Menu size={18} />
      <span className="hidden sm:inline">Simulations</span>
    </button>
  )
}
