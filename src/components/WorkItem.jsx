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
export const WorkItem = ({ item, stages, hasExceptionFlow }) => {
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
    return item.state === 'returning' ? 'left 0.5s linear, top 0.5s linear' : 'left 0.1s linear, top 0.1s linear'
  }

  // Calculate Y position based on whether stage is in exception flow
  const getYPosition = () => {
    const currentStage = stages[item.stageIndex]

    if (!hasExceptionFlow) {
      // No exception flow - use middle of single-row container
      // Container is 320px tall (h-80), stages centered
      return `calc(50% + ${item.yOffset * 3}px)`
    }

    // With exception flow, container is 550px tall
    // Exception flow row: ~50px from top (label) + ~130px (stage center) = ~120px
    // Normal flow row: ~550px - 160px (from bottom) = ~390px

    if (currentStage?.isExceptionFlow) {
      // Exception flow stage - position in top section
      // Exception flow label (30px) + stage label (20px) + half stage height (64px) = ~114px
      return `calc(120px + ${item.yOffset * 3}px)`
    } else {
      // Normal flow stage - position in bottom section
      // Total height (550px) - bottom margin - half stage (64px) - metrics (80px) = ~390px
      return `calc(390px + ${item.yOffset * 3}px)`
    }
  }

  return (
    <div
      className={`absolute w-3 h-3 rounded-full shadow-sm border border-white/20 z-20 flex items-center justify-center ${getItemColor()}`}
      style={{
        left: `${item.x}%`,
        top: getYPosition(),
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
