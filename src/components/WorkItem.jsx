import React from 'react'
import { ArrowLeft } from 'lucide-react'

const ITEM_COLORS = {
  normal: 'bg-blue-500',
  bug: 'bg-red-500',
  productionDefect: 'bg-rose-600',
  blocked: 'bg-amber-500',
  batch: 'bg-purple-500',
  rework: 'bg-purple-600',
  unclearRework: 'bg-orange-500',
}

/**
 * WorkItem - Represents a single work item (feature/defect) flowing through the system
 */
export const WorkItem = ({ item, stages }) => {
  // Determine item color based on state and type
  const getItemColor = () => {
    if (item.isProductionDefect) return ITEM_COLORS.productionDefect
    if (item.isBug) return ITEM_COLORS.bug
    if (item.isRework) return ITEM_COLORS.rework
    if (item.isUnclear) return ITEM_COLORS.unclearRework

    const currentStage = stages[item.stageIndex]
    if (item.inBatch || (currentStage?.id === 'deploy' && item.state === 'waiting')) {
      return ITEM_COLORS.batch
    }

    if (item.state === 'waiting' && !item.isBug && !item.isUnclear && !item.isRework) {
      return ITEM_COLORS.blocked
    }

    return ITEM_COLORS.normal
  }

  const getTransition = () => {
    return item.state === 'returning' ? 'left 0.5s linear' : 'left 0.1s linear'
  }

  return (
    <div
      className={`absolute w-3 h-3 rounded-full shadow-sm border border-white/20 z-20 flex items-center justify-center ${getItemColor()}`}
      style={{
        left: `${item.x}%`,
        top: `calc(${50 + item.yOffset}% - 6px)`,
        transform: 'translate(-50%, -50%)',
        transition: getTransition(),
      }}
    >
      {/* Production defect indicator - exclamation mark */}
      {item.isProductionDefect && <span className="text-[6px] font-bold text-white">!</span>}

      {/* Bug indicator - white dot */}
      {item.isBug && !item.isProductionDefect && <div className="w-1 h-1 bg-white rounded-full" />}

      {/* Rework indicator - R */}
      {item.isRework && <span className="text-[6px] font-bold text-white">R</span>}

      {/* Unclear requirement indicator - question mark */}
      {item.isUnclear && <span className="text-[6px] font-bold text-black">?</span>}

      {/* Returning/rework indicator - left arrow */}
      {item.state === 'returning' && (
        <ArrowLeft size={8} className="text-white absolute -top-3" />
      )}
    </div>
  )
}
