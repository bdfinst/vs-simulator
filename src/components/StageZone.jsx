import React from 'react'

/**
 * StageZone - Represents a single zone within a stage (Queue, Wait, or Work)
 */
export const StageZone = ({ type, count, showLabel = true }) => {
  const getZoneConfig = () => {
    switch (type) {
      case 'queue':
        return {
          label: 'Queue',
          showCount: false,
          labelClass: 'text-[8px] text-slate-500 uppercase rotate-180 writing-vertical-rl mb-2 opacity-50',
        }
      case 'wait':
        return {
          label: 'WAIT',
          showCount: count > 0,
          labelClass: 'text-[8px] text-amber-500 font-bold mb-1',
        }
      case 'work':
        return {
          label: 'WORK',
          showCount: false,
          labelClass: 'text-[8px] text-blue-400 font-bold mb-1',
        }
      default:
        return { label: '', showCount: false, labelClass: '' }
    }
  }

  const config = getZoneConfig()
  const isLastZone = type === 'work'

  return (
    <div
      className={`w-1/3 flex flex-col justify-end items-center pb-1 ${
        !isLastZone ? 'border-r border-slate-700/50 bg-black/20' : ''
      }`}
    >
      {showLabel && config.showCount && (
        <span className={config.labelClass}>
          {config.label}
        </span>
      )}
      {showLabel && type === 'queue' && (
        <span className={config.labelClass}>
          {config.label}
        </span>
      )}
    </div>
  )
}
