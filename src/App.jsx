import {
  AlertTriangle,
  ArrowLeft,
  ClipboardList,
  FileQuestion,
  Layers,
  Pause,
  Play,
  RefreshCw,
  ShieldAlert,
  Users,
  Zap,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

// --- Constants & Configuration ---

const STAGES = [
  { id: 'backlog', label: 'Backlog', type: 'queue' },
  { id: 'analysis', label: 'Analysis', type: 'process' },
  { id: 'dev', label: 'Development', type: 'process' },
  { id: 'test', label: 'Testing', type: 'process' },
  { id: 'deploy', label: 'Deployment', type: 'process' },
  { id: 'done', label: 'Production', type: 'sink' },
]

const ITEM_COLORS = {
  normal: 'bg-blue-500',
  bug: 'bg-red-500',
  blocked: 'bg-amber-500',
  batch: 'bg-purple-500',
  rework: 'bg-orange-500',
}

const FPS = 30
const HOURS_PER_TICK = 0.5 // Scale: 2 ticks = 1 hour of simulated time

// --- Components ---

const SimulationCanvas = ({ items, stageStats, stageMetrics, problems }) => {
  return (
    <div className="relative w-full h-80 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-inner flex items-center px-2 select-none">
      {/* Connector Lines */}
      <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-800 -translate-y-1/2 z-0" />

      {/* Stages */}
      <div className="relative z-10 w-full flex justify-between px-2">
        {STAGES.map((stage, index) => {
          const isSink = stage.type === 'sink'
          const queueCount = stageStats[stage.id]?.queued || 0
          const processCount = stageStats[stage.id]?.processing || 0
          const waitCount = stageStats[stage.id]?.waiting || 0
          const totalCount = queueCount + processCount + waitCount

          // Metrics Calculation
          const metrics = stageMetrics[stage.id] || {
            avgProcess: 0,
            avgWait: 0,
          }

          return (
            <div
              key={stage.id}
              className="flex flex-col items-center group relative w-32"
            >
              {/* Stage Label */}
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {stage.label}
              </span>

              {/* Stage Container */}
              <div
                className={`
                  w-full h-32 rounded-lg border-2 flex flex-row overflow-hidden transition-colors duration-500 relative
                  ${
                    isSink
                      ? 'border-green-500/50 bg-green-900/10'
                      : 'border-slate-600 bg-slate-800/90'
                  }
                  ${
                    !isSink && totalCount > 6 && problems.highWip
                      ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                      : ''
                  }
                `}
              >
                {!isSink && (
                  <>
                    {/* Zone 1: Input Queue */}
                    <div className="w-1/3 border-r border-slate-700/50 bg-black/20 flex flex-col justify-end items-center pb-1">
                      <span className="text-[8px] text-slate-500 uppercase rotate-180 writing-vertical-rl mb-2 opacity-50">
                        Queue
                      </span>
                    </div>

                    {/* Zone 2: Processing */}
                    <div className="w-1/3 flex flex-col justify-end items-center pb-1">
                      {processCount > 0 && (
                        <div className="absolute top-2 right-1/3 translate-x-1/2">
                          <Zap
                            size={10}
                            className="text-blue-400 animate-pulse"
                          />
                        </div>
                      )}
                    </div>

                    {/* Zone 3: Output/Wait */}
                    <div className="w-1/3 border-l border-slate-700/50 bg-black/20 flex flex-col justify-end items-center pb-1">
                      {waitCount > 0 && (
                        <span className="text-[8px] text-amber-500 font-bold mb-1">
                          WAIT
                        </span>
                      )}
                    </div>
                  </>
                )}

                {isSink && (
                  <div className="w-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-green-400">
                      {totalCount}
                    </span>
                  </div>
                )}
              </div>

              {/* Stage Time Metrics (Under the box) */}
              {!isSink && (
                <div className="mt-2 flex flex-col items-center w-full space-y-1">
                  <div className="flex justify-between w-full px-1 text-[10px] bg-slate-800/50 rounded py-0.5">
                    <span className="text-slate-400">Process</span>
                    <span className="font-mono text-blue-300">
                      {(metrics.avgProcess * HOURS_PER_TICK).toFixed(1)}h
                    </span>
                  </div>
                  <div className="flex justify-between w-full px-1 text-[10px] bg-slate-800/50 rounded py-0.5">
                    <span className="text-slate-400">Wait</span>
                    <span
                      className={`font-mono ${
                        metrics.avgWait * HOURS_PER_TICK > 1
                          ? 'text-red-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {(metrics.avgWait * HOURS_PER_TICK).toFixed(1)}h
                    </span>
                  </div>
                </div>
              )}

              {/* Bottleneck Indicator */}
              {!isSink && queueCount > 5 && (
                <div className="absolute -top-8 animate-bounce text-red-500 flex flex-col items-center z-30">
                  <AlertTriangle size={16} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Moving Items Overlay */}
      {items.map(item => (
        <div
          key={item.id}
          className={`absolute w-3 h-3 rounded-full shadow-sm border border-white/20 z-20 flex items-center justify-center
            ${
              item.isBug
                ? ITEM_COLORS.bug
                : item.isUnclear
                ? ITEM_COLORS.rework
                : item.inBatch
                ? ITEM_COLORS.batch
                : item.state === 'waiting' && !item.isBug && !item.isUnclear
                ? ITEM_COLORS.blocked
                : ITEM_COLORS.normal
            }
          `}
          style={{
            left: `${item.x}%`,
            top: `${50 + item.yOffset}%`,
            transform: 'translate(-50%, -50%)',
            transition:
              item.state === 'returning'
                ? 'left 0.5s linear'
                : 'left 0.1s linear',
          }}
        >
          {item.isBug && <div className="w-1 h-1 bg-white rounded-full" />}
          {item.isUnclear && (
            <span className="text-[6px] font-bold text-black">?</span>
          )}
          {item.state === 'returning' && (
            <ArrowLeft size={8} className="text-white absolute -top-3" />
          )}
        </div>
      ))}
    </div>
  )
}

const ProblemToggle = ({
  id,
  label,
  active,
  onClick,
  icon: Icon,
  description,
}) => (
  <button
    onClick={() => onClick(id)}
    className={`
      flex items-start p-3 rounded-lg border text-left transition-all duration-200 h-full
      ${
        active
          ? 'bg-red-900/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
          : 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-750'
      }
    `}
  >
    <div
      className={`p-2 rounded-md mr-3 shrink-0 ${
        active ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'
      }`}
    >
      <Icon size={18} />
    </div>
    <div>
      <h3
        className={`font-semibold text-sm ${
          active ? 'text-red-400' : 'text-slate-200'
        }`}
      >
        {label}
      </h3>
      <p className="text-xs text-slate-400 mt-1 leading-tight">{description}</p>
    </div>
  </button>
)

const MetricCard = ({ label, value, unit, subtext, trend }) => (
  <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg flex flex-col justify-between">
    <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">
      {label}
    </div>
    <div className="flex items-baseline">
      <span className="text-2xl font-bold text-white">{value}</span>
      <span className="text-slate-500 ml-1 text-sm">{unit}</span>
    </div>
    <div
      className={`text-xs mt-2 ${
        trend === 'bad' ? 'text-red-400' : 'text-green-400'
      }`}
    >
      {subtext}
    </div>
  </div>
)

// --- Main App Component ---

export default function ValueStreamSim() {
  const [isRunning, setIsRunning] = useState(true)
  const [items, setItems] = useState([])
  const [metrics, setMetrics] = useState({
    throughput: 0,
    wip: 0,
    cycleTime: 0,
  })
  const [stageMetrics, setStageMetrics] = useState({}) // Stores avg times per stage

  const [problems, setProblems] = useState({
    silos: false,
    largeBatches: false,
    qualityIssues: false,
    manualDeploy: false,
    contextSwitching: false,
    manualTesting: false,
    unclearRequirements: false,
  })

  const stateRef = useRef({
    items: [],
    lastSpawn: 0,
    completedItems: [],
    startTime: Date.now(),
    history: STAGES.reduce(
      (acc, stage) => ({
        ...acc,
        [stage.id]: { totalProcess: 0, totalWait: 0, count: 0 },
      }),
      {}
    ),
  })

  const toggleProblem = id => {
    setProblems(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const resetSimulation = () => {
    stateRef.current = {
      items: [],
      lastSpawn: 0,
      completedItems: [],
      startTime: Date.now(),
      history: STAGES.reduce(
        (acc, stage) => ({
          ...acc,
          [stage.id]: { totalProcess: 0, totalWait: 0, count: 0 },
        }),
        {}
      ),
    }
    setItems([])
    setMetrics({ throughput: 0, wip: 0, cycleTime: 0 })
    setStageMetrics({})
  }

  useEffect(() => {
    let animationFrameId
    let lastTick = Date.now()

    const tick = () => {
      const now = Date.now()
      const delta = now - lastTick

      if (delta > 1000 / FPS) {
        updateSimulation(now)
        lastTick = now
      }

      if (isRunning) {
        animationFrameId = requestAnimationFrame(tick)
      }
    }

    if (isRunning) {
      animationFrameId = requestAnimationFrame(tick)
    }

    return () => cancelAnimationFrame(animationFrameId)
  }, [isRunning, problems])

  const updateSimulation = now => {
    const s = stateRef.current

    // --- 1. Spawning ---
    const activeCount = s.items.filter(
      i => i.stageIndex < STAGES.length - 1
    ).length
    let spawnRate = 1800
    if (activeCount > 30) spawnRate = 3000

    if (now - s.lastSpawn > spawnRate) {
      const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        stageIndex: 0,
        progress: 0,
        x: 0,
        yOffset: (Math.random() - 0.5) * 35,
        isBug: false,
        isUnclear: false,
        inBatch: false,
        createdAt: now,
        state: 'queued',
        targetX: 0,
        currStageProcessTicks: 0,
        currStageWaitTicks: 0,
      }
      s.items.push(newItem)
      s.lastSpawn = now
    }

    // --- 2. Calculate Positions & Logic ---
    const stageCount = STAGES.length
    const stageWidth = 100 / stageCount

    const OFFSET_QUEUE = 0.15
    const OFFSET_PROCESS = 0.5
    const OFFSET_WAIT = 0.85

    const stageLoad = {}
    s.items.forEach(i => {
      if (i.state !== 'returning') {
        stageLoad[i.stageIndex] = (stageLoad[i.stageIndex] || 0) + 1
      }
    })

    s.items.forEach(item => {
      if (item.stageIndex >= stageCount) return
      const isSink = STAGES[item.stageIndex].type === 'sink'
      const currentStageId = STAGES[item.stageIndex].id
      const stageBaseX = item.stageIndex * stageWidth
      const isAutomatedStage = ['dev', 'test', 'deploy'].includes(
        currentStageId
      )

      // --- Metric Accumulation ---
      if (!isSink) {
        if (item.state === 'processing') item.currStageProcessTicks++
        if (item.state === 'queued' || item.state === 'waiting')
          item.currStageWaitTicks++
      }

      // --- State Machine ---

      if (item.state === 'queued') {
        item.targetX = stageBaseX + stageWidth * OFFSET_QUEUE

        let readyToProcess = false
        // Automated/CI stages pick up immediately (no random human delay)
        if (isAutomatedStage) {
          readyToProcess = true
        } else {
          if (Math.random() > 0.1) readyToProcess = true
        }

        if (readyToProcess) item.state = 'processing'
      } else if (item.state === 'processing') {
        item.targetX = stageBaseX + stageWidth * OFFSET_PROCESS

        // --- Speed Logic ---
        let speed = 2 // Default (Analaysis, Backlog processing)

        // 1. Optimized Defaults (CI/CD Pipeline)
        // Target: 1 hour (2 ticks) for Dev, Test, Deploy
        if (isAutomatedStage) speed = 50

        // 2. Penalties
        if (problems.manualTesting && currentStageId === 'test') speed = 0.5
        if (problems.manualDeploy && currentStageId === 'deploy') speed = 0.2

        if (problems.contextSwitching) {
          const load = stageLoad[item.stageIndex] || 1
          if (load > 3) speed = speed / (load * 0.4)
        }

        // 3. New Problem: Unclear Requirements
        if (problems.unclearRequirements && currentStageId === 'dev') {
          if (Math.random() < 0.03) {
            item.isUnclear = true
            item.state = 'returning'
            item.returnTargetIndex = 1 // Analysis
            return
          }
        }

        if (!isSink) {
          item.progress += speed
          if (item.progress >= 100) {
            item.progress = 100

            // --- Instant Handoff Logic (Zero Wait Time) ---
            let blocked = false

            // Blocked by Silos?
            if (problems.silos && Math.random() < 0.15) blocked = true

            // Blocked by Batching? (Simplified: If batching is ON, force wait to accumulate)
            if (problems.largeBatches && !item.isBug && !item.isUnclear)
              blocked = true

            // Blocked by Manual Gate?
            if (problems.manualDeploy && currentStageId === 'deploy')
              blocked = true

            // If automated and NOT blocked, skip the 'waiting' state entirely
            if (isAutomatedStage && !blocked) {
              item.state = 'transferring'
              item.progress = 0
            } else {
              item.state = 'waiting'
            }
          }
        } else {
          item.progress = 100
        }
      } else if (item.state === 'waiting') {
        item.targetX = stageBaseX + stageWidth * OFFSET_WAIT
        let canMove = true

        if (problems.silos && Math.random() < 0.15) canMove = false

        if (problems.largeBatches && !item.isBug && !item.isUnclear) {
          const batchSize = 5
          const peers = s.items.filter(
            i =>
              i.stageIndex === item.stageIndex &&
              i.state === 'waiting' &&
              !i.isBug &&
              !i.isUnclear
          )
          if (peers.length < batchSize) {
            canMove = false
            item.inBatch = true
          } else {
            peers.forEach(p => {
              p.inBatch = false
            })
          }
        } else {
          item.inBatch = false
        }

        if (problems.manualDeploy && currentStageId === 'deploy') {
          if (Math.random() > 0.02) canMove = false
        }

        if (canMove && !isSink) {
          item.state = 'transferring'
          item.progress = 0
        }
      } else if (item.state === 'transferring') {
        const nextIdx = item.stageIndex + 1
        const nextBaseX = nextIdx * stageWidth
        item.targetX = nextBaseX + stageWidth * OFFSET_QUEUE

        const moveSpeed = 1.5
        if (item.x < item.targetX) {
          item.x += moveSpeed
        } else {
          // --- Handover Logic: Record Metrics ---
          const prevStageId = STAGES[item.stageIndex].id
          const hist = s.history[prevStageId]
          if (hist) {
            hist.totalProcess += item.currStageProcessTicks
            hist.totalWait += item.currStageWaitTicks
            hist.count++
          }
          item.currStageProcessTicks = 0
          item.currStageWaitTicks = 0

          // Arrive at next stage
          item.stageIndex = nextIdx

          // Defect Logic (Test -> Dev)
          if (problems.qualityIssues && STAGES[item.stageIndex].id === 'test') {
            if (Math.random() < 0.35) {
              item.isBug = true
              item.state = 'returning'
              item.returnTargetIndex = 2 // Dev
              return
            }
          }

          // Bug found in Prod/Deploy?
          if (item.isBug && STAGES[item.stageIndex].id === 'deploy') {
            item.state = 'returning'
            item.returnTargetIndex = 2 // Dev
            return
          }

          // Normal Arrival
          if (STAGES[item.stageIndex].id === 'done') {
            s.completedItems.push(now)
            if (s.completedItems.length > 50) s.completedItems.shift()
            item.state = 'processing'
          } else {
            item.state = 'queued'
          }
        }
      } else if (item.state === 'returning') {
        const targetBaseX = item.returnTargetIndex * stageWidth
        item.targetX = targetBaseX + stageWidth * OFFSET_QUEUE

        const returnSpeed = 3
        if (item.x > item.targetX) {
          item.x -= returnSpeed
        } else {
          // Arrived back
          item.stageIndex = item.returnTargetIndex
          item.state = 'queued'
          item.currStageProcessTicks = 0
          item.currStageWaitTicks = 0
        }
      }

      if (item.state !== 'transferring' && item.state !== 'returning') {
        item.x += (item.targetX - item.x) * 0.1
      }
    })

    // Cleanup
    if (s.items.length > 80) {
      const doneItems = s.items.filter(i => i.stageIndex === STAGES.length - 1)
      if (doneItems.length > 20) {
        const oldest = doneItems.sort((a, b) => a.createdAt - b.createdAt)[0]
        s.items = s.items.filter(i => i !== oldest)
      }
    }

    // Metrics
    const activeItems = s.items.filter(i => i.stageIndex < STAGES.length - 1)
    const doneCount = s.items.filter(
      i => i.stageIndex === STAGES.length - 1
    ).length
    const recentCompletions = s.completedItems.filter(
      t => now - t < 5000
    ).length
    const throughputPerSec = recentCompletions / 5
    const estCycleTime =
      throughputPerSec > 0 ? activeItems.length / throughputPerSec : 0

    // Compile Display Metrics
    const currentStageMetrics = {}
    Object.keys(s.history).forEach(key => {
      const h = s.history[key]
      currentStageMetrics[key] = {
        avgProcess: h.count > 0 ? h.totalProcess / h.count : 0,
        avgWait: h.count > 0 ? h.totalWait / h.count : 0,
      }
    })

    setItems([...s.items])
    setStageMetrics(currentStageMetrics)
    setMetrics({
      wip: activeItems.length,
      throughput: doneCount,
      cycleTime: estCycleTime.toFixed(1),
    })
  }

  const getStageStats = () => {
    const stats = {}
    items.forEach(i => {
      const stageId = STAGES[i.stageIndex]?.id
      if (!stageId) return
      if (!stats[stageId])
        stats[stageId] = { queued: 0, processing: 0, waiting: 0 }

      if (i.state === 'queued') stats[stageId].queued++
      else if (i.state === 'processing') stats[stageId].processing++
      else if (i.state === 'waiting') stats[stageId].waiting++
    })
    return stats
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Value Stream Simulator
            </h1>
            <p className="text-slate-400 mt-1">
              Visualize workflow, queues, and rework loops.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={resetSimulation}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md font-medium transition-colors"
            >
              <RefreshCw size={18} />
              Reset
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Work In Progress (WIP)"
            value={metrics.wip}
            unit="Items"
            subtext={metrics.wip > 20 ? 'System Overloaded' : 'Optimal Flow'}
            trend={metrics.wip > 20 ? 'bad' : 'good'}
          />
          <MetricCard
            label="Total Throughput"
            value={metrics.throughput}
            unit="Items Delivered"
            subtext="Lifetime total"
            trend="good"
          />
          <MetricCard
            label="Est. Cycle Time"
            value={metrics.cycleTime}
            unit="sec"
            subtext="Avg time to complete"
            trend={metrics.cycleTime > 10 ? 'bad' : 'good'}
          />
        </div>

        {/* Main Simulation View */}
        <div className="bg-slate-900/50 p-2 rounded-xl overflow-x-auto">
          <div className="min-w-[800px]">
            <SimulationCanvas
              items={items}
              stageStats={getStageStats()}
              stageMetrics={stageMetrics}
              problems={problems}
            />
          </div>
        </div>

        {/* Controls Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Layers size={20} />
            <h2 className="text-xl font-semibold">System Constraints</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ProblemToggle
              id="silos"
              label="Siloed Teams"
              active={problems.silos}
              onClick={toggleProblem}
              icon={Users}
              description="Delays handoffs. Increases Wait Time (WT) between stages."
            />
            <ProblemToggle
              id="largeBatches"
              label="Large Batch Sizes"
              active={problems.largeBatches}
              onClick={toggleProblem}
              icon={Layers}
              description="Forces items to wait for peers before moving. Increases Wait Time."
            />
            <ProblemToggle
              id="unclearRequirements"
              label="Unclear Requirements"
              active={problems.unclearRequirements}
              onClick={toggleProblem}
              icon={FileQuestion}
              description="Ambiguity discovered in Development sends work back to Analysis."
            />
            <ProblemToggle
              id="qualityIssues"
              label="Quality Issues (Rework)"
              active={problems.qualityIssues}
              onClick={toggleProblem}
              icon={ShieldAlert}
              description="Defects found in Testing send work back to Development."
            />
            <ProblemToggle
              id="manualTesting"
              label="Manual Testing"
              active={problems.manualTesting}
              onClick={toggleProblem}
              icon={ClipboardList}
              description="Replaces automated tests with slow human verification. Increases Process Time."
            />
            <ProblemToggle
              id="manualDeploy"
              label="Manual Deploy Gate"
              active={problems.manualDeploy}
              onClick={toggleProblem}
              icon={AlertTriangle}
              description="Simulates a 'Change Review Board' window. Massive Wait Time increase."
            />
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-6 text-sm text-slate-400 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${ITEM_COLORS.normal}`}></div>
            <span>Feature</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${ITEM_COLORS.bug}`}></div>
            <span>Defect</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${ITEM_COLORS.rework} flex items-center justify-center`}
            >
              <span className="text-[6px] text-black font-bold">?</span>
            </div>
            <span>Unclear Req</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${ITEM_COLORS.blocked}`}
            ></div>
            <span>Waiting / Blocked</span>
          </div>
          <div className="flex items-center gap-2 border-l border-slate-600 pl-4">
            <div className="w-16 h-8 border border-slate-600 rounded bg-slate-800 flex overflow-hidden">
              <div className="w-1/3 bg-black/30 flex items-center justify-center text-[8px]">
                Q
              </div>
              <div className="w-1/3 flex items-center justify-center text-[8px]">
                Work
              </div>
              <div className="w-1/3 bg-black/30 flex items-center justify-center text-[8px]">
                Wait
              </div>
            </div>
            <span>Structure</span>
          </div>
        </div>
      </div>
    </div>
  )
}
