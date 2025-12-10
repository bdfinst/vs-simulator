import {
  Briefcase,
  Clock3,
  Info,
  Menu,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Settings,
  User,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

// --- Dark Theme Components ---

const SliderControl = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix = '',
  tooltip,
  className = 'mb-4',
}) => (
  <div className={className}>
    <div className="flex items-center justify-between mb-1">
      <label className="flex items-center gap-1 text-xs font-medium text-slate-300 whitespace-nowrap">
        {label}
        {tooltip && (
          <div className="relative group cursor-help">
            <Info size={12} className="text-slate-500" />
            <div className="absolute z-50 hidden w-48 p-2 mb-2 text-xs text-white -translate-x-1/2 rounded bottom-full left-1/2 bg-slate-700 group-hover:block">
              {tooltip}
            </div>
          </div>
        )}
      </label>
      <span className="text-xs font-mono text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">
        {value}
        {suffix}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
    />
  </div>
)

const RangeSliderControl = ({
  label,
  minVal,
  maxVal,
  onChange,
  minLimit,
  maxLimit,
  step,
  suffix = '',
  tooltip,
  className = 'mb-4',
}) => {
  const handleMinChange = e => {
    const val = Number(e.target.value)
    const newMin = Math.min(val, maxVal)
    onChange(newMin, maxVal)
  }

  const handleMaxChange = e => {
    const val = Number(e.target.value)
    const newMax = Math.max(val, minVal)
    onChange(minVal, newMax)
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        <label className="flex items-center gap-1 text-xs font-medium text-slate-300">
          {label}
          {tooltip && (
            <div className="relative group cursor-help">
              <Info size={12} className="text-slate-500" />
              <div className="absolute z-50 hidden w-48 p-2 mb-2 text-xs text-white -translate-x-1/2 rounded bottom-full left-1/2 bg-slate-700 group-hover:block">
                {tooltip}
              </div>
            </div>
          )}
        </label>
        <span className="text-xs font-mono text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">
          {minVal}
          {suffix}-{maxVal}
          {suffix}
        </span>
      </div>

      <div className="relative pt-1 pb-1">
        <div className="space-y-1">
          <input
            type="range"
            min={minLimit}
            max={maxLimit}
            step={step}
            value={minVal}
            onChange={handleMinChange}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 block"
          />
          <input
            type="range"
            min={minLimit}
            max={maxLimit}
            step={step}
            value={maxVal}
            onChange={handleMaxChange}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 block"
          />
        </div>
      </div>
    </div>
  )
}

// --- Animation Components ---

const TimelineSegment = ({ type, width, lane, isGap }) => {
  const colors = {
    work: 'bg-blue-500',
    wait: 'bg-rose-400',
    review: 'bg-amber-400',
    rework: 'bg-orange-600',
    merge: 'bg-purple-600',
    pair: 'bg-emerald-500',
    ci: 'bg-purple-500',
    gap: 'bg-transparent',
  }

  const labels = {
    work: 'Coding',
    wait: 'Blocked',
    review: 'Review',
    rework: 'Fixing',
    merge: 'Merge',
    pair: 'Pairing',
    ci: 'CI',
    gap: '',
  }

  if (width < 0.2) return null

  const laneClasses = {
    dev: 'h-1/3 self-start rounded-t-sm mb-[1px]',
    rework: 'h-1/3 self-center rounded-sm my-[1px]',
    review: 'h-1/3 self-end rounded-b-sm mt-[1px]',
    reviewer: 'h-1/3 self-end rounded-b-sm mt-[1px]',
    both: 'h-full rounded-sm',
  }

  return (
    <div
      className={`${colors[type]} ${
        laneClasses[lane] || 'h-full'
      } transition-all duration-300 relative group border-r border-slate-900/10 last:border-0`}
      style={{ width: `${width}%` }}
    >
      {!isGap && (
        <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 text-[10px] bg-slate-800 text-white px-2 py-1 rounded pointer-events-none whitespace-nowrap z-20 shadow-lg z-50">
          {labels[type]} ({lane === 'both' ? 'Joint' : lane})
        </div>
      )}

      {type === 'rework' && width > 3 && (
        <div className="absolute inset-0 flex items-center justify-center text-white/50">
          <RefreshCw size={10} />
        </div>
      )}
      {type === 'review' && width > 3 && (
        <div className="absolute inset-0 flex items-center justify-center text-white/50">
          <UserCheck size={10} />
        </div>
      )}
    </div>
  )
}

const AnimatedTimeline = ({
  segments,
  progress,
  totalDuration,
  label,
  showLanes,
  streamCount,
}) => {
  const activeSegments = segments
    .filter(s => s.start < progress)
    .map(s => {
      const visibleDuration = Math.min(progress, s.end) - s.start
      const percentWidth = (visibleDuration / totalDuration) * 100
      return { ...s, percentWidth }
    })

  const isComplete = progress >= totalDuration

  return (
    <div className="mb-8">
      <div className="flex items-end justify-between mb-2 text-sm font-medium text-slate-300">
        <div className="flex items-center gap-2">
          <span>{label}</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-slate-700 rounded text-slate-400 border border-slate-600">
            x{streamCount} Streams
          </span>
        </div>
        {isComplete ? (
          <span className="text-xs px-2 py-1 bg-emerald-900/50 text-emerald-400 rounded-full border border-emerald-700">
            SPRINT END
          </span>
        ) : (
          <span className="font-mono text-xs text-slate-500">
            Running Sprint...
          </span>
        )}
      </div>

      {/* Swimlane Container */}
      <div className="relative w-full overflow-hidden border rounded-lg h-28 bg-slate-800 border-slate-700">
        {/* Lane Backgrounds / Labels */}
        {showLanes && (
          <div className="absolute inset-0 flex flex-col pointer-events-none">
            <div className="flex items-center w-full px-2 border-b h-1/3 border-slate-700 bg-slate-900/40">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <User size={10} /> Dev (Value)
              </span>
            </div>
            <div className="flex items-center w-full px-2 border-b h-1/3 border-slate-700 bg-orange-900/20">
              <span className="text-[9px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1">
                <RefreshCw size={10} /> Rework
              </span>
            </div>
            <div className="flex items-center w-full px-2 h-1/3 bg-slate-900/30">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <UserCheck size={10} /> Review
              </span>
            </div>
          </div>
        )}

        {/* Segments Container */}
        <div className="absolute inset-0 flex">
          {activeSegments.map((seg, idx) => (
            <TimelineSegment
              key={idx}
              type={seg.type}
              width={seg.percentWidth}
              lane={seg.lane}
              isGap={seg.type === 'gap'}
            />
          ))}

          {activeSegments.length > 0 &&
            activeSegments[activeSegments.length - 1].type === 'ci' &&
            !isComplete && (
              <div
                className="absolute top-0 bottom-0 z-20 w-1 bg-white animate-ping"
                style={{ left: `${(progress / totalDuration) * 100}%` }}
              ></div>
            )}
        </div>
      </div>
    </div>
  )
}

const MetricStat = ({ label, value, subValue, colorClass, icon: Icon }) => (
  <div className="p-3 border rounded-lg bg-slate-900 border-slate-700">
    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1 font-medium">
      {Icon && <Icon size={12} />}
      {label}
    </div>
    <div className={`text-lg font-bold ${colorClass}`}>{value}</div>
    {subValue && <div className="text-[10px] text-slate-500">{subValue}</div>}
  </div>
)

// --- Main Component ---

export const CodeReviewSimulator = ({ onOpenMenu }) => {
  // --- State Configuration ---
  const [minFeatureDays, setMinFeatureDays] = useState(2)
  const [maxFeatureDays, setMaxFeatureDays] = useState(5)
  const [asyncAcceptRate, setAsyncAcceptRate] = useState(50)
  const [complexFailRate, setComplexFailRate] = useState(30)
  const [minHandoffHours, setMinHandoffHours] = useState(2)
  const [maxHandoffHours, setMaxHandoffHours] = useState(6)
  const [minReviewDuration, setMinReviewDuration] = useState(0.5)
  const [maxReviewDuration, setMaxReviewDuration] = useState(2)
  const [pairEfficiency, setPairEfficiency] = useState(100)
  const [integrationCostFactor, setIntegrationCostFactor] = useState(15)
  const [teamSize, setTeamSize] = useState(8)
  const [sprintDays, setSprintDays] = useState(10)
  const [contextSwitchPenalty, setContextSwitchPenalty] = useState(20)

  // --- Animation State ---
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const requestRef = useRef()

  // --- Calculations ---
  const metrics = useMemo(() => {
    let seed = 123
    const random = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }
    const randRange = (min, max) => min + random() * (max - min)

    const teamMembers = []
    for (let i = 0; i < teamSize; i++) {
      const r = random()
      if (r < 0.2) teamMembers.push({ role: 'Junior', eff: 0.7 })
      else if (r < 0.8) teamMembers.push({ role: 'Mid', eff: 1.0 })
      else teamMembers.push({ role: 'Senior', eff: 1.3 })
    }

    const runSimulation = (efficiency, mode, isPair) => {
      let clock = 0
      const sprintTotalHours = sprintDays * 8
      const segments = []

      let featuresDone = 0
      let totalLeadTime = 0
      let totalPersonHours = 0
      let totalWork = 0
      let totalWait = 0
      let totalFix = 0
      let totalMerge = 0

      const simulationHorizon = sprintTotalHours * 3

      while (clock < simulationHorizon) {
        const startClock = clock
        const taskDays = randRange(minFeatureDays, maxFeatureDays)

        let eff = efficiency
        if (isPair) eff = efficiency * (pairEfficiency / 100)

        const rawTaskHours = taskDays * 8
        const actualWorkHours = rawTaskHours / eff

        if (isPair) {
          const taskChunks = Math.ceil(rawTaskHours / 4)
          const chunkTime = actualWorkHours / taskChunks

          for (let i = 0; i < taskChunks; i++) {
            if (clock < sprintTotalHours) {
              segments.push({
                type: 'pair',
                lane: 'both',
                start: clock,
                end: Math.min(clock + chunkTime, sprintTotalHours),
              })
              segments.push({
                type: 'ci',
                lane: 'both',
                start: Math.min(clock + chunkTime, sprintTotalHours),
                end: Math.min(clock + chunkTime + 0.25, sprintTotalHours),
              })
            }
            clock += chunkTime + 0.25
          }

          featuresDone++
          const leadTime = clock - startClock
          totalLeadTime += leadTime
          totalPersonHours += leadTime * 2
          totalWork += leadTime
        } else {
          const taskChunks = Math.ceil(rawTaskHours / 4)
          const chunkWorkTime = actualWorkHours / taskChunks

          for (let i = 0; i < taskChunks; i++) {
            if (clock < sprintTotalHours)
              segments.push({
                type: 'work',
                lane: 'dev',
                start: clock,
                end: Math.min(clock + chunkWorkTime, sprintTotalHours),
              })
            clock += chunkWorkTime
            totalWork += chunkWorkTime

            const waitTime = randRange(minHandoffHours, maxHandoffHours)
            if (clock < sprintTotalHours)
              segments.push({
                type: 'wait',
                lane: 'review',
                start: clock,
                end: Math.min(clock + waitTime, sprintTotalHours),
              })
            clock += waitTime
            totalWait += waitTime

            const reviewTime = randRange(minReviewDuration, maxReviewDuration)
            if (clock < sprintTotalHours)
              segments.push({
                type: 'review',
                lane: 'review',
                start: clock,
                end: Math.min(clock + reviewTime, sprintTotalHours),
              })
            clock += reviewTime
            totalFix += reviewTime

            let passes = random() < asyncAcceptRate / 100
            let retries = 0

            while (!passes && retries < 3) {
              retries++
              const isComplex = random() < complexFailRate / 100

              if (clock < sprintTotalHours)
                segments.push({
                  type: 'wait',
                  lane: 'rework',
                  start: clock,
                  end: Math.min(clock + waitTime, sprintTotalHours),
                })
              clock += waitTime
              totalWait += waitTime

              const reworkTime = 2 / eff
              if (clock < sprintTotalHours)
                segments.push({
                  type: 'rework',
                  lane: 'rework',
                  start: clock,
                  end: Math.min(clock + reworkTime, sprintTotalHours),
                })
              clock += reworkTime
              totalFix += reworkTime

              if (clock < sprintTotalHours)
                segments.push({
                  type: 'wait',
                  lane: 'review',
                  start: clock,
                  end: Math.min(clock + waitTime, sprintTotalHours),
                })
              clock += waitTime
              totalWait += waitTime

              if (clock < sprintTotalHours)
                segments.push({
                  type: 'review',
                  lane: 'review',
                  start: clock,
                  end: Math.min(clock + reviewTime, sprintTotalHours),
                })
              clock += reviewTime
              totalFix += reviewTime

              if (!isComplex) passes = true
              else passes = random() > 0.5
            }
          }

          const integPenalty =
            Math.pow(taskDays, 1.5) * (integrationCostFactor / 10)
          if (clock < sprintTotalHours)
            segments.push({
              type: 'merge',
              lane: 'dev',
              start: clock,
              end: Math.min(clock + integPenalty, sprintTotalHours),
            })
          clock += integPenalty
          totalMerge += integPenalty

          featuresDone++
          const leadTime = clock - startClock
          totalLeadTime += leadTime
          const taskPersonHours = totalWork + totalFix + totalMerge
          totalPersonHours += taskPersonHours
        }

        if (clock < sprintTotalHours)
          segments.push({
            type: 'gap',
            lane: 'dev',
            start: clock,
            end: Math.min(clock + 0.5, sprintTotalHours),
          })
        clock += 0.5
      }

      return {
        segments,
        avgLeadTime: totalLeadTime / featuresDone,
        avgPersonHours: totalPersonHours / featuresDone,
        totals: {
          work: totalWork / featuresDone,
          wait: totalWait / featuresDone,
          fix: totalFix / featuresDone,
          merge: totalMerge / featuresDone,
        },
      }
    }

    const asyncResults = teamMembers.map(member =>
      runSimulation(member.eff, 'async', false)
    )

    const pairResults = []
    for (let i = 0; i < teamMembers.length; i += 2) {
      const p1 = teamMembers[i]
      const p2 = teamMembers[i + 1] || p1
      const pairEff = (p1.eff + p2.eff) / 2
      pairResults.push(runSimulation(pairEff, 'pair', true))
    }

    const totalSprintHours = sprintDays * 8
    const asyncAvgPersonHours =
      asyncResults.reduce((acc, r) => acc + r.avgPersonHours, 0) /
      asyncResults.length

    const asyncEffectiveHours =
      teamSize * totalSprintHours * (1 - contextSwitchPenalty / 100)
    const asyncThroughput = asyncEffectiveHours / asyncAvgPersonHours

    const pairAvgPersonHours =
      pairResults.reduce((acc, r) => acc + r.avgPersonHours, 0) /
      pairResults.length
    const pairThroughput = (teamSize * totalSprintHours) / pairAvgPersonHours

    return {
      async: {
        throughput: asyncThroughput,
        avgLeadTime:
          asyncResults.reduce((acc, r) => acc + r.avgLeadTime, 0) /
          asyncResults.length,
        avgPersonHours: asyncAvgPersonHours,
        work:
          asyncResults.reduce((acc, r) => acc + r.totals.work, 0) /
          asyncResults.length,
        wait:
          asyncResults.reduce((acc, r) => acc + r.totals.wait, 0) /
          asyncResults.length,
        fix:
          asyncResults.reduce((acc, r) => acc + r.totals.fix, 0) /
          asyncResults.length,
        merge:
          asyncResults.reduce((acc, r) => acc + r.totals.merge, 0) /
          asyncResults.length,
        segments: asyncResults[0].segments,
        streamCount: teamSize,
      },
      pair: {
        throughput: pairThroughput,
        avgLeadTime:
          pairResults.reduce((acc, r) => acc + r.avgLeadTime, 0) /
          pairResults.length,
        avgPersonHours: pairAvgPersonHours,
        work:
          pairResults.reduce((acc, r) => acc + r.totals.work, 0) /
          pairResults.length,
        wait:
          pairResults.reduce((acc, r) => acc + r.totals.wait, 0) /
          pairResults.length,
        fix:
          pairResults.reduce((acc, r) => acc + r.totals.fix, 0) /
          pairResults.length,
        merge:
          pairResults.reduce((acc, r) => acc + r.totals.merge, 0) /
          pairResults.length,
        segments: pairResults[0].segments,
        streamCount: Math.ceil(teamSize / 2),
      },
      avgFeatureDays: (minFeatureDays + maxFeatureDays) / 2,
      teamStats: {
        juniors: teamMembers.filter(m => m.role === 'Junior').length,
        mids: teamMembers.filter(m => m.role === 'Mid').length,
        seniors: teamMembers.filter(m => m.role === 'Senior').length,
      },
    }
  }, [
    minFeatureDays,
    maxFeatureDays,
    asyncAcceptRate,
    complexFailRate,
    minHandoffHours,
    maxHandoffHours,
    minReviewDuration,
    maxReviewDuration,
    pairEfficiency,
    integrationCostFactor,
    teamSize,
    sprintDays,
    contextSwitchPenalty,
  ])

  const maxDuration = sprintDays * 8

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const resetAnimation = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  useEffect(() => {
    if (isPlaying) {
      const step = () => {
        setCurrentTime(prev => {
          const next = prev + maxDuration / 300
          if (next >= maxDuration) {
            setIsPlaying(false)
            return maxDuration
          }
          return next
        })
        requestRef.current = requestAnimationFrame(step)
      }
      requestRef.current = requestAnimationFrame(step)
    }
    return () => cancelAnimationFrame(requestRef.current)
  }, [isPlaying, maxDuration])

  useEffect(() => {
    resetAnimation()
  }, [
    minFeatureDays,
    maxFeatureDays,
    asyncAcceptRate,
    complexFailRate,
    minHandoffHours,
    maxHandoffHours,
  ])

  const toDays = hrs => (hrs / 8).toFixed(1)

  const chartData = [
    {
      name: 'Async',
      work: parseFloat(metrics.async.work.toFixed(1)),
      wait: parseFloat(metrics.async.wait.toFixed(1)),
      fix: parseFloat(metrics.async.fix.toFixed(1)),
      merge: parseFloat(metrics.async.merge.toFixed(1)),
    },
    {
      name: 'Paired',
      work: parseFloat(metrics.pair.work.toFixed(1)),
      wait: parseFloat(metrics.pair.wait.toFixed(1)),
      fix: parseFloat(metrics.pair.fix.toFixed(1)),
      merge: parseFloat(metrics.pair.merge.toFixed(1)),
    },
  ]

  return (
    <div className="min-h-screen p-4 mx-auto md:p-8 bg-slate-950 text-slate-200">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenMenu}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md font-medium transition-colors"
            >
              <Menu size={18} />
              <span className="hidden sm:inline">Simulations</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Code Review Methodology Simulator
              </h1>
              <p className="text-slate-400 mt-1">
                Comparing{' '}
                <span className="font-semibold text-blue-400">
                  Async Code Reviews
                </span>{' '}
                vs{' '}
                <span className="font-semibold text-emerald-400">
                  Paired Programming
                </span>{' '}
                for a team of {teamSize} over a {sprintDays}-day sprint.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Controls */}
          <div className="space-y-4 lg:col-span-1">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-700 text-slate-200">
                <Settings size={18} />
                <h2 className="text-sm font-semibold">Parameters</h2>
              </div>

              <div className="space-y-4">
                <section>
                  <h3 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                    Workload
                  </h3>

                  <RangeSliderControl
                    label="Task Size (Days)"
                    minVal={minFeatureDays}
                    maxVal={maxFeatureDays}
                    minLimit={0.5}
                    maxLimit={10}
                    step={0.5}
                    suffix="d"
                    tooltip="Typical task size range."
                    className="mb-3"
                    onChange={(newMin, newMax) => {
                      setMinFeatureDays(newMin)
                      setMaxFeatureDays(newMax)
                    }}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <SliderControl
                      label="Sprint Len"
                      value={sprintDays}
                      min={5}
                      max={20}
                      step={1}
                      suffix="d"
                      className="mb-0"
                      onChange={setSprintDays}
                    />
                    <SliderControl
                      label="Team Size"
                      value={teamSize}
                      min={2}
                      max={20}
                      step={2}
                      suffix="ppl"
                      className="mb-0"
                      onChange={setTeamSize}
                    />
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                    Process Reality
                  </h3>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <RangeSliderControl
                      label="Wait Time (Hours)"
                      minVal={minHandoffHours}
                      maxVal={maxHandoffHours}
                      minLimit={0.5}
                      maxLimit={24}
                      step={0.5}
                      suffix="h"
                      tooltip="Min/Max wait time for reviews."
                      className="mb-0"
                      onChange={(newMin, newMax) => {
                        setMinHandoffHours(newMin)
                        setMaxHandoffHours(newMax)
                      }}
                    />
                    <RangeSliderControl
                      label="Review Time (Hours)"
                      minVal={minReviewDuration}
                      maxVal={maxReviewDuration}
                      minLimit={0.25}
                      maxLimit={8}
                      step={0.25}
                      suffix="h"
                      tooltip="Min/Max time spent actually reviewing."
                      className="mb-0"
                      onChange={(newMin, newMax) => {
                        setMinReviewDuration(newMin)
                        setMaxReviewDuration(newMax)
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <SliderControl
                      label="Accept %"
                      value={asyncAcceptRate}
                      min={10}
                      max={90}
                      step={5}
                      suffix="%"
                      className="mb-0"
                      onChange={setAsyncAcceptRate}
                    />
                    <SliderControl
                      label="Cmplx Fail"
                      value={complexFailRate}
                      min={0}
                      max={100}
                      step={10}
                      suffix="%"
                      tooltip="% failures needing >1 rework."
                      className="mb-0"
                      onChange={setComplexFailRate}
                    />
                  </div>

                  <SliderControl
                    label="Switch Tax"
                    value={contextSwitchPenalty}
                    min={0}
                    max={50}
                    step={5}
                    suffix="%"
                    tooltip="Efficiency lost to context switching."
                    className="mb-0"
                    onChange={setContextSwitchPenalty}
                  />
                </section>
              </div>
            </div>

            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
              <h3 className="flex items-center gap-2 mb-2 text-sm font-semibold text-blue-300">
                <Info size={16} />
                Legend
              </h3>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div>
                  <span className="text-slate-300">Coding</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></div>
                  <span className="text-slate-300">Pair Code</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-rose-400 rounded-sm"></div>
                  <span className="text-slate-300">Wait</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-amber-400 rounded-sm"></div>
                  <span className="text-slate-300">Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-orange-600 rounded-sm flex items-center justify-center text-[8px] text-white/50">
                    <RefreshCw size={6} />
                  </div>
                  <span className="text-slate-300">Rework</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-purple-600 rounded-sm"></div>
                  <span className="text-slate-300">Merge</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6 lg:col-span-2">
            {/* Sprint Projection Card */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="p-2 text-blue-400 bg-blue-900/50 rounded-lg">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-200">
                      Sprint Projection ({sprintDays} Days)
                    </h2>
                    <p className="text-sm text-slate-400">
                      Team of {teamSize} devs. Avg Task:{' '}
                      {metrics.avgFeatureDays.toFixed(1)}d.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 text-xs border rounded bg-slate-800/50 border-slate-700">
                  <Zap size={12} className="text-amber-400" />
                  <span className="text-slate-400">Exp. Dist:</span>
                  <span className="font-mono text-slate-300">
                    {metrics.teamStats.juniors} Jr, {metrics.teamStats.mids} Mid,{' '}
                    {metrics.teamStats.seniors} Snr
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Async Results */}
                <div className="pl-4 space-y-4 border-l-4 border-blue-500">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-bold text-slate-200">Async Team</h3>
                    <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded-full">
                      {metrics.async.streamCount} Streams
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-tight text-blue-400">
                      {metrics.async.throughput.toFixed(1)}
                    </span>
                    <span className="text-sm font-medium text-slate-400">
                      Features Done
                    </span>
                  </div>
                  <div className="w-full h-2 overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${
                          (metrics.async.throughput /
                            (metrics.async.throughput +
                              metrics.pair.throughput)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <MetricStat
                      label="Avg Lead Time"
                      value={`${toDays(metrics.async.avgLeadTime)}d`}
                      colorClass="text-rose-400"
                      icon={Clock3}
                    />
                    <MetricStat
                      label="Avg Cost (Hrs)"
                      value={`${metrics.async.avgPersonHours.toFixed(1)}h`}
                      subValue="Per Feature"
                      colorClass="text-slate-300"
                      icon={Users}
                    />
                  </div>
                </div>

                {/* Pair Results */}
                <div className="pl-4 space-y-4 border-l-4 border-emerald-500">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-bold text-slate-200">Paired Team</h3>
                    <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded-full">
                      {metrics.pair.streamCount} Streams
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-tight text-emerald-400">
                      {metrics.pair.throughput.toFixed(1)}
                    </span>
                    <span className="text-sm font-medium text-slate-400">
                      Features Done
                    </span>
                  </div>
                  <div className="w-full h-2 overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: `${
                          (metrics.pair.throughput /
                            (metrics.async.throughput +
                              metrics.pair.throughput)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <MetricStat
                      label="Avg Lead Time"
                      value={`${toDays(metrics.pair.avgLeadTime)}d`}
                      colorClass="text-emerald-400"
                      icon={Clock3}
                    />
                    <MetricStat
                      label="Avg Cost (Hrs)"
                      value={`${metrics.pair.avgPersonHours.toFixed(1)}h`}
                      subValue="Per Feature"
                      colorClass="text-slate-300"
                      icon={Users}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Animation Card */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-slate-200">
                  Full Sprint Timeline (One Stream Simulation)
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={togglePlay}
                    className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    {isPlaying ? 'Pause' : 'Visualize Flow'}
                  </button>
                  <button
                    onClick={resetAnimation}
                    className="p-2 transition-colors rounded-lg text-slate-400 hover:bg-slate-700"
                    title="Reset"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>

              <div className="relative pt-2">
                {/* Time Indicator */}
                <div className="absolute top-0 left-0 z-30 w-full h-full pointer-events-none">
                  <div
                    className="absolute top-0 bottom-0 w-px transition-all duration-75 bg-slate-300"
                    style={{ left: `${(currentTime / maxDuration) * 100}%` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[10px] px-2 py-1 rounded font-mono whitespace-nowrap">
                      Day {toDays(currentTime)}
                    </div>
                  </div>
                </div>

                <AnimatedTimeline
                  label="Async Review (Back & Forth)"
                  segments={metrics.async.segments}
                  progress={currentTime}
                  totalDuration={maxDuration}
                  showLanes={true}
                  streamCount={metrics.async.streamCount}
                />

                <AnimatedTimeline
                  label="Paired Programming (Collaborative)"
                  segments={metrics.pair.segments}
                  progress={currentTime}
                  totalDuration={maxDuration}
                  showLanes={true}
                  streamCount={metrics.pair.streamCount}
                />
              </div>
            </div>

            {/* Main Chart */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 min-h-[300px]">
              <h3 className="mb-6 font-semibold text-slate-200">
                Avg Real-World Feature Time Breakdown (Hours)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                  <XAxis type="number" unit="h" stroke="#94a3b8" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    stroke="#94a3b8"
                  />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      backgroundColor: '#1e293b',
                      color: '#e2e8f0',
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#94a3b8' }} />
                  <Bar
                    dataKey="work"
                    name="Coding"
                    stackId="a"
                    fill="#3b82f6"
                    radius={[4, 0, 0, 4]}
                  />
                  <Bar
                    dataKey="wait"
                    name="Wait / Context Switch"
                    stackId="a"
                    fill="#fb7185"
                  />
                  <Bar
                    dataKey="fix"
                    name="Review/Fix"
                    stackId="a"
                    fill="#f59e0b"
                  />
                  <Bar
                    dataKey="merge"
                    name="Merge/Integ"
                    stackId="a"
                    fill="#9333ea"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
