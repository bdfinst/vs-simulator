import React from 'react'
import { AlertTriangle, Users, Zap, Settings, Hand, Bot, Clock } from 'lucide-react'
import { StageZone } from './StageZone.jsx'

const HOURS_PER_TICK = 1 // Must match App.jsx constant

/**
 * Stage - Represents a single stage in the value stream
 * Handles both process stages (with zones) and sink stages (production)
 */
export const Stage = ({
  stage,
  stageStats,
  metrics,
  deploymentCountdown,
  batchCountdown,
  onSettingsClick,
}) => {
  const isSink = stage.type === 'sink'
  const queueCount = stageStats?.queued || 0
  const processCount = stageStats?.processing || 0
  const waitCount = stageStats?.waiting || 0
  const totalCount = queueCount + processCount + waitCount

  const stageMetrics = metrics || { avgProcess: 0, avgWait: 0 }

  // Get step type icon and color
  const getStepTypeIcon = () => {
    if (isSink) return null

    switch (stage.stepType) {
      case 'manual':
        return <Hand size={10} className="text-blue-400" title="Manual step" />
      case 'automated':
        return <Bot size={10} className="text-green-400" title="Automated step" />
      case 'batch':
        return <Clock size={10} className="text-purple-400" title="Batch step" />
      default:
        return <Hand size={10} className="text-blue-400" title="Manual step" />
    }
  }

  // Get background color based on step type and exception flow
  const getStepTypeBackground = () => {
    if (isSink) return 'border-green-500/50 bg-green-900/10'

    // Exception flow stages get red color scheme
    if (stage.isExceptionFlow) {
      return 'border-red-500/50 bg-red-900/20'
    }

    switch (stage.stepType) {
      case 'manual':
        return 'border-blue-500/30 bg-blue-900/10'
      case 'automated':
        return 'border-green-500/30 bg-green-900/10'
      case 'batch':
        return 'border-purple-500/30 bg-purple-900/10'
      default:
        return 'border-slate-600 bg-slate-800/90'
    }
  }

  return (
    <div className="flex flex-col items-center group relative w-32">
      {/* Stage Label with Step Type Icon and Settings Button */}
      <div className="flex items-center gap-1 mb-2">
        {!isSink && (
          <span className="flex items-center">
            {getStepTypeIcon()}
          </span>
        )}
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {stage.label}
        </span>
        {!isSink && onSettingsClick && (
          <button
            onClick={() => onSettingsClick(stage.id)}
            className="p-0.5 hover:bg-slate-700 rounded transition-colors"
            title="Configure stage settings"
          >
            <Settings size={12} className="text-slate-400 hover:text-slate-200" />
          </button>
        )}
      </div>

      {/* Stage Container */}
      <div
        className={`
          w-full h-32 rounded-lg border-2 flex flex-row overflow-hidden transition-colors duration-500 relative
          ${getStepTypeBackground()}
        `}
      >
        {/* Batch Step Countdown Overlay */}
        {stage.stepType === 'batch' && batchCountdown !== undefined && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <span className="text-xs text-slate-400">Next Batch In</span>
            <span className="text-2xl font-bold text-purple-400">
              {Math.round(batchCountdown * HOURS_PER_TICK)}h
            </span>
          </div>
        )}

        {/* Process Stage: Three Zones (Queue, Wait, Work) */}
        {!isSink && (
          <>
            <StageZone type="queue" count={queueCount} />
            <StageZone type="wait" count={waitCount} />
            <StageZone type="work" count={processCount} />

            {/* Processing Indicator */}
            {processCount > 0 && (
              <div className="absolute top-2 left-2/3 translate-x-1/2 z-10">
                <Zap size={10} className="text-blue-400 animate-pulse" />
              </div>
            )}

            {/* Actor Count Badge */}
            <div className="absolute top-1 right-1 flex items-center gap-1 text-xs text-slate-500 z-10">
              <Users size={12} />
              <span>
                {processCount}/{stage.actors === Infinity ? '∞' : stage.actors}
              </span>
            </div>
          </>
        )}

        {/* Sink Stage: Production - no counter needed */}
      </div>

      {/* Stage Metrics (Process & Wait Times) */}
      {!isSink && (
        <div className="mt-2 flex flex-col items-center w-full space-y-1">
          <div className="flex justify-between w-full px-1 text-[10px] bg-slate-800/50 rounded py-0.5">
            <span className="text-slate-400">Process</span>
            <span className="font-mono text-blue-300">
              {(stageMetrics.avgProcess * HOURS_PER_TICK).toFixed(1)}h
            </span>
          </div>
          <div className="flex justify-between w-full px-1 text-[10px] bg-slate-800/50 rounded py-0.5">
            <span className="text-slate-400">Wait</span>
            <span
              className={`font-mono ${
                stageMetrics.avgWait * HOURS_PER_TICK > 1 ? 'text-red-400' : 'text-slate-500'
              }`}
            >
              {(stageMetrics.avgWait * HOURS_PER_TICK).toFixed(1)}h
            </span>
          </div>
          <div className="flex justify-between w-full px-1 text-[10px] bg-slate-800/50 rounded py-0.5">
            <span className="text-slate-400">%C/A</span>
            <span
              className={`font-mono ${
                (stage.percentComplete || 100) < 100 ? 'text-yellow-400' : 'text-green-400'
              }`}
            >
              {stage.percentComplete || 100}%
            </span>
          </div>
        </div>
      )}

      {/* Queue Overflow Warning */}
      {!isSink && queueCount > 5 && (
        <div className="absolute -top-8 animate-bounce text-red-500 flex flex-col items-center z-30">
          <AlertTriangle size={16} />
        </div>
      )}
    </div>
  )
}
