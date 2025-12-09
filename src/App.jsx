import {
  AlertTriangle,
  ClipboardList,
  Clock,
  FileQuestion,
  Layers,
  Pause,
  Play,
  Plus,
  RefreshCw,
  ShieldAlert,
  Users,
  ZapOff,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SettingsMenu } from './components/SettingsMenu.jsx'
import { Stage } from './components/Stage.jsx'
import { WorkItem } from './components/WorkItem.jsx'

// --- Constants & Configuration ---

const STAGES_CONFIG = [
  { id: 'backlog', label: 'Backlog', type: 'queue', processTime: { min: 0, max: 0 }, waitTime: { min: 0, max: 0 } },
  { id: 'analysis', label: 'Refining Work', type: 'process', stepType: 'manual', processTime: { min: 2, max: 4 }, waitTime: { min: 8, max: 8 }, actors: 2, percentComplete: 100 },
  { id: 'dev', label: 'Development', type: 'process', stepType: 'manual', processTime: { min: 1, max: 8 }, waitTime: { min: 8, max: 8 }, actors: 5, percentComplete: 100 },
  { id: 'review', label: 'Code Review', type: 'process', stepType: 'manual', processTime: { min: 0.5, max: 2 }, waitTime: { min: 4, max: 8 }, actors: 2, percentComplete: 100 },
  { id: 'test', label: 'Testing', type: 'process', stepType: 'automated', processTime: { min: 0.5, max: 1 }, waitTime: { min: 0, max: 0 }, actors: Infinity, percentComplete: 100 },
  { id: 'deploy', label: 'Deployment', type: 'process', stepType: 'batch', processTime: { min: 0.8, max: 1.2 }, waitTime: { min: 0, max: 0 }, actors: Infinity, cadence: 24, percentComplete: 100 },
  { id: 'done', label: 'Production', type: 'sink', processTime: { min: 0, max: 0 }, waitTime: { min: 0, max: 0 } },
]

const FPS = 30 // Animation frames per second (real time)
const HOURS_PER_TICK = 1 // Each tick = 1 simulated hour
// Time scale: Process times and wait times in stage configs are in simulated hours
// At 1x simulation speed: 1 tick per second = 1 simulated hour per second (1 hour/tick * 1 tick/sec)
// Simulation speed multiplier affects how fast ticks are processed

// --- Components ---

const SimulationCanvas = ({ items, stageStats, stageMetrics, stages, problems, deploymentCountdown, batchCountdowns, onStageSettingsClick }) => {
  return (
    <div className="relative w-full h-80 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-inner flex items-center px-2 select-none">
      {/* Connector Lines */}
      <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-800 -translate-y-1/2 z-0" />

      {/* Intake Arrow */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex items-center">
        <div className="flex flex-col items-center">
          <span className="text-[8px] text-slate-500 uppercase mb-1">Intake</span>
          <div className="flex items-center">
            <div className="w-8 h-0.5 bg-blue-400"></div>
            <div className="w-0 h-0 border-l-[6px] border-l-blue-400 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent"></div>
          </div>
        </div>
      </div>

      {/* Stages */}
      <div className="relative z-10 w-full flex justify-between px-2">
        {stages.map((stage) => (
          <Stage
            key={stage.id}
            stage={stage}
            stageStats={stageStats[stage.id]}
            metrics={stageMetrics[stage.id]}
            problems={problems}
            deploymentCountdown={deploymentCountdown}
            batchCountdown={batchCountdowns?.[stage.id]}
            onSettingsClick={onStageSettingsClick}
          />
        ))}
      </div>

      {/* Work Items */}
      {items.map(item => (
        <WorkItem key={item.id} item={item} stages={stages} />
      ))}
    </div>
  )
}

const ProblemToggle = ({ id, label, active, onClick, icon: Icon, description }) => (
  <button
    onClick={() => onClick(id)}
    className={`
      flex items-start p-3 rounded-lg border text-left transition-all duration-200 h-full
      ${ active ? 'bg-red-900/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-750' }
    `}
  >
    <div className={`p-2 rounded-md mr-3 shrink-0 ${ active ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400' }`}>
      <Icon size={18} />
    </div>
    <div>
      <h3 className={`font-semibold text-sm ${ active ? 'text-red-400' : 'text-slate-200' }`}>
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
    <div className={`text-xs mt-2 ${ trend === 'bad' ? 'text-red-400' : 'text-green-400' }`}>
      {subtext}
    </div>
  </div>
)

export default function ValueStreamSim() {
  const [isRunning, setIsRunning] = useState(true);
  const [items, setItems] = useState([]);
  const [metrics, setMetrics] = useState({ throughput: 0, wip: 0, cycleTime: 0 });
  const [stageMetrics, setStageMetrics] = useState({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [stages, setStages] = useState(STAGES_CONFIG);
  const [problems, setProblems] = useState({
    silos: false,
    largeBatches: false,
    codingErrors: false,
    manualDeploy: false,
    contextSwitching: false,
    manualTesting: false,
    unclearRequirements: false,
    infrequentDeploy: false,
    tooManyFeatures: false,
    unstableProduction: false,
  });

  const [deploymentSchedule, setDeploymentSchedule] = useState(24); // Default: 24 simulated hours
  const [deploymentCountdown, setDeploymentCountdown] = useState(24 / HOURS_PER_TICK); // Initialize to full schedule in ticks
  const [batchSize, setBatchSize] = useState(5); // Number of items created per batch
  const [productionDefectRate, setProductionDefectRate] = useState(0); // Percentage of deployed items that become production defects (default: 0)
  const [simulationSpeed, setSimulationSpeed] = useState(10.0); // Speed multiplier (10.0 = default)

  const stateRef = useRef({
    items: [],
    lastSpawn: 0,
    completedItems: [],
    startTime: Date.now(),
    history: stages.reduce((acc, stage) => ({ ...acc, [stage.id]: { totalProcess: 0, totalWait: 0, count: 0 } }), {}),
    deploymentReleased: false,
    // Initialize batch countdowns for all batch-type stages
    batchCountdowns: stages.reduce((acc, stage) => {
      if (stage.stepType === 'batch' && stage.cadence) {
        acc[stage.id] = stage.cadence / HOURS_PER_TICK;
      }
      return acc;
    }, {}),
  });

  const dynamicStages = useMemo(() => {
    const newStages = JSON.parse(JSON.stringify(stages));
    const testStage = newStages.find(s => s.id === 'test');
    if (testStage) {
      if (problems.manualTesting) {
        testStage.actors = 1;
      } else {
        testStage.actors = Infinity;
      }
    }
    return newStages;
  }, [stages, problems.manualTesting]);

  const handleUpdateStage = (stageId, updatedStage) => {
    setStages(currentStages => currentStages.map(s => (s.id === stageId ? updatedStage : s)));
  };

  const toggleProblem = (id) => {
    setProblems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const resetSimulation = () => {
    stateRef.current = {
      items: [],
      lastSpawn: 0,
      completedItems: [],
      startTime: Date.now(),
      history: stages.reduce((acc, stage) => ({ ...acc, [stage.id]: { totalProcess: 0, totalWait: 0, count: 0 } }), {}),
    };
    setDeploymentCountdown(deploymentSchedule / HOURS_PER_TICK);
    setItems([]);
    setMetrics({ throughput: 0, wip: 0, cycleTime: 0 });
    setStageMetrics({});
  };

  const updateSimulation = (now, currentStages, currentProblems, currentDeploymentCountdown = 0, currentBatchSize = 5) => {
    const s = stateRef.current;

    // Spawning logic - create batches of items at regular intervals
    // Base spawn rate: create a batch every 10 seconds (at 1x speed)
    const baseSpawnInterval = 10 * 1000; // 10 seconds
    let spawnInterval = baseSpawnInterval;

    // Apply "Too Many Features" constraint (2x feature rate = half spawn interval)
    if (currentProblems.tooManyFeatures) {
      spawnInterval = spawnInterval / 2;
    }

    if (now - s.lastSpawn > spawnInterval) {
      // Create a batch of feature items
      for (let i = 0; i < currentBatchSize; i++) {
        s.items.push({
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
          targetProcessTicks: 0,
          currentIntakeTicks: 0,
          targetIntakeTicks: null,
          currentWaitTicks: 0,
        });
      }
      s.lastSpawn = now;
    }

    // Production defects are now handled when items reach production (in the item completion logic below)

    const stageCount = currentStages.length;
    const stageWidth = 100 / stageCount;
    const OFFSET_QUEUE = 0.15;
    const OFFSET_WAIT = 0.5;      // Wait comes first (middle position)
    const OFFSET_PROCESS = 0.85;  // Process comes after wait

    // Update batch countdowns BEFORE processing items
    // This ensures items see the countdown value before it changes
    currentStages.forEach(stage => {
      if (stage.stepType === 'batch' && stage.cadence) {
        // Initialize countdown if not exists (check for undefined/null, not falsy, since 0 is valid)
        if (s.batchCountdowns[stage.id] === undefined || s.batchCountdowns[stage.id] === null) {
          s.batchCountdowns[stage.id] = stage.cadence / HOURS_PER_TICK;
          console.log('[INIT at top] Initializing', stage.id, 'countdown to', s.batchCountdowns[stage.id]);
        }

        // Decrement countdown
        if (s.batchCountdowns[stage.id] > 0) {
          s.batchCountdowns[stage.id]--;
          if (stage.id === 'deploy' && s.batchCountdowns[stage.id] <= 2) {
            console.log('[COUNTDOWN] deploy countdown:', s.batchCountdowns[stage.id]);
          }
        } else if (s.batchCountdowns[stage.id] <= 0) {
          // Check if there are any queued items at this stage
          const queuedItemsAtStage = s.items.filter(
            i => i.stageIndex === currentStages.findIndex(st => st.id === stage.id) && i.state === 'queued'
          );

          if (stage.id === 'deploy') {
            console.log('[AT ZERO] deploy countdown:', s.batchCountdowns[stage.id], 'queued items:', queuedItemsAtStage.length);
          }

          // Only reset countdown if there are no queued items (batch has been released)
          // or if countdown has been at 0 for a while (negative value means it's been waiting)
          if (queuedItemsAtStage.length === 0 || s.batchCountdowns[stage.id] < -2) {
            if (stage.id === 'deploy') {
              console.log('[RESET] Resetting countdown to', stage.cadence / HOURS_PER_TICK);
            }
            s.batchCountdowns[stage.id] = stage.cadence / HOURS_PER_TICK;
          } else {
            // Keep countdown at 0 to allow queued items to be released
            if (stage.id === 'deploy') {
              console.log('[HOLD AT ZERO] Keeping countdown at', s.batchCountdowns[stage.id], 'will decrement to', s.batchCountdowns[stage.id] - 1);
            }
            s.batchCountdowns[stage.id]--;
          }
        }
      }
    });

    const stageLoad = {};
    s.items.forEach(i => {
      if (i.state !== 'returning') {
        stageLoad[i.stageIndex] = (stageLoad[i.stageIndex] || 0) + 1;
      }
    });

    s.items.forEach(item => {
      if (item.stageIndex >= stageCount) return
      const currentStage = currentStages[item.stageIndex];
      const isSink = currentStage.type === 'sink';
      const currentStageId = currentStage.id;
      const stageBaseX = item.stageIndex * stageWidth;

      if (!isSink) {
        if (item.state === 'processing') item.currStageProcessTicks++;
        if (item.state === 'queued' || item.state === 'waiting')
          item.currStageWaitTicks++;
      }

      if (item.state === 'queued') {
        item.targetX = stageBaseX + stageWidth * OFFSET_QUEUE;
        const stageConfig = currentStages[item.stageIndex];
        item.currentIntakeTicks = item.currentIntakeTicks || 0;
        item.currentIntakeTicks++;

        if (stageConfig.type === 'queue') {
            const nextStageIndex = item.stageIndex + 1;
            let canTransfer = true;
            if (nextStageIndex < currentStages.length) {
                const nextStage = currentStages[nextStageIndex];
                if (nextStage.actors > 0 && nextStage.actors !== Infinity) {
                    const processingInNextStage = s.items.filter(
                        i => i.stageIndex === nextStageIndex && i.state === 'processing'
                    );
                    if (processingInNextStage.length >= nextStage.actors) {
                        canTransfer = false;
                    }
                }
            }
            if (canTransfer) {
                item.state = 'transferring';
            }
        }
        else {
            // Items spend "intake wait time" in queued state before being noticed
            // This represents the time before work is picked up from the queue
            let intakeWaitComplete = false;

            // For batch steps, items wait until cadence countdown reaches 0
            if (stageConfig.stepType === 'batch' && !currentProblems.infrequentDeploy) {
                // Initialize batch countdown if not exists (check for undefined/null, not falsy, since 0 is valid)
                if (s.batchCountdowns[currentStageId] === undefined || s.batchCountdowns[currentStageId] === null) {
                    s.batchCountdowns[currentStageId] = (stageConfig.cadence || 24) / HOURS_PER_TICK;
                    console.log('[INIT in item loop] Initializing countdown to', s.batchCountdowns[currentStageId]);
                }

                if (s.batchCountdowns[currentStageId] <= 0) {
                    intakeWaitComplete = true;
                }
            } else if (currentProblems.infrequentDeploy && currentStageId === 'deploy') {
                // Legacy infrequent deploy constraint (kept for backward compatibility)
                if (currentDeploymentCountdown <= 0) {
                    intakeWaitComplete = true;
                }
            } else if (stageConfig.stepType === 'automated' || (stageConfig.waitTime && stageConfig.waitTime.min === 0 && stageConfig.waitTime.max === 0)) {
                // Automated steps or steps with 0 wait time proceed immediately
                intakeWaitComplete = true;
            } else if (stageConfig.waitTime) {
                // Initialize target intake wait time if not set
                if (!item.targetIntakeTicks) {
                    let minWaitHours = stageConfig.waitTime.min;
                    let maxWaitHours = stageConfig.waitTime.max;

                    if (currentProblems.manualTesting && currentStageId === 'test') {
                        minWaitHours = Math.max(minWaitHours, 8);
                        maxWaitHours = Math.max(maxWaitHours, 8);
                        if (maxWaitHours < minWaitHours) maxWaitHours = minWaitHours;
                    }

                    const waitTimeHours = minWaitHours + Math.random() * (maxWaitHours - minWaitHours);
                    // Convert simulated hours to ticks (e.g., 8 hours / 0.5 hours per tick = 16 ticks)
                    item.targetIntakeTicks = Math.max(1, waitTimeHours / HOURS_PER_TICK);
                }

                // Check if intake wait time has elapsed
                if (item.currentIntakeTicks >= item.targetIntakeTicks) {
                    intakeWaitComplete = true;
                }
            } else {
                // No wait time configured, proceed immediately
                intakeWaitComplete = true;
            }

            // After intake wait completes, check for resource availability
            if (intakeWaitComplete) {
                // Check if stage has actor capacity
                let hasCapacity = true;
                if (stageConfig.actors > 0 && stageConfig.actors !== Infinity) {
                    const processingItems = s.items.filter(
                        i => i.stageIndex === item.stageIndex && i.state === 'processing'
                    );
                    hasCapacity = processingItems.length < stageConfig.actors;
                }

                if (hasCapacity) {
                    // Can proceed directly to processing
                    item.state = 'processing';
                    if (stageConfig.processTime) {
                        const { min, max } = stageConfig.processTime;
                        const processTimeHours = min + Math.random() * (max - min);
                        // Convert simulated hours to ticks (e.g., 4 hours / 0.5 hours per tick = 8 ticks)
                        item.targetProcessTicks = Math.max(1, processTimeHours / HOURS_PER_TICK);
                    } else {
                        item.targetProcessTicks = 2;
                    }
                    item.progress = 0;
                } else {
                    // No capacity, move to waiting state (resource queue)
                    item.state = 'waiting';
                    item.currentWaitTicks = 0;
                }
            }
        }
      } else if (item.state === 'processing') {
        item.targetX = stageBaseX + stageWidth * OFFSET_PROCESS;

        let progressIncrement =
          item.targetProcessTicks > 0 ? 100 / item.targetProcessTicks : 100;

        let speedMultiplier = 1.0;
        if (currentProblems.manualTesting && currentStageId === 'test')
          speedMultiplier /= 10;
        if (currentProblems.manualDeploy && currentStageId === 'deploy')
          speedMultiplier /= 20;
        if (currentProblems.contextSwitching) {
          const load = stageLoad[item.stageIndex] || 1;
          if (load > 3) speedMultiplier /= (load * 0.4);
        }

        item.progress += progressIncrement * speedMultiplier;

        if (currentProblems.unclearRequirements && currentStageId === 'dev') {
          if (Math.random() < 0.03) {
            item.isUnclear = true;
            item.state = 'returning';
            item.returnTargetIndex = 1; // Refining Work (analysis)
            return;
          }
        }

        if (!isSink) {
          if (item.progress >= 100) {
            item.progress = 100;

            // After processing completes, move to transferring state
            item.state = 'transferring';
            item.progress = 0;
          }
        } else {
          item.progress = 100;
        }
      } else if (item.state === 'waiting') {
        // Waiting state is now only for resource queuing (capacity constraints)
        item.targetX = stageBaseX + stageWidth * OFFSET_WAIT;
        item.currentWaitTicks++;

        let canStartProcessing = false;

        // Check if stage has actor capacity
        if (!isSink) {
            const stageConfig = currentStages[item.stageIndex];
            if (stageConfig.actors > 0 && stageConfig.actors !== Infinity) {
                const processingItems = s.items.filter(
                    i => i.stageIndex === item.stageIndex && i.state === 'processing'
                );
                canStartProcessing = processingItems.length < stageConfig.actors;
            } else {
                // Infinite capacity means can always start
                canStartProcessing = true;
            }
        }

        // Apply additional constraints
        if (canStartProcessing) {
            if (currentProblems.silos && Math.random() < 0.15) canStartProcessing = false;

            if (currentProblems.largeBatches && !item.isBug && !item.isUnclear) {
                const batchSize = 5;
                const peers = s.items.filter(
                    i =>
                        i.stageIndex === item.stageIndex &&
                        i.state === 'waiting' &&
                        !i.isBug &&
                        !i.isUnclear
                );
                if (peers.length < batchSize) {
                    canStartProcessing = false;
                    item.inBatch = true;
                } else {
                    peers.forEach(p => (p.inBatch = false));
                }
            } else {
                item.inBatch = false;
            }

            // Manual deploy gate - only applies when infrequent deploy is NOT active
            if (currentProblems.manualDeploy && !currentProblems.infrequentDeploy && currentStageId === 'deploy') {
                if (Math.random() > 0.02) canStartProcessing = false;
            }
        }

        // Move to processing state when capacity becomes available
        if (canStartProcessing && !isSink) {
          item.state = 'processing';
          const stageConfig = currentStages[item.stageIndex];
          if (stageConfig.processTime) {
              const { min, max } = stageConfig.processTime;
              const processTimeHours = min + Math.random() * (max - min);
              // Convert simulated hours to ticks
              item.targetProcessTicks = Math.max(1, processTimeHours / HOURS_PER_TICK);
          } else {
              item.targetProcessTicks = 2;
          }
          item.progress = 0;
        }
      } else if (item.state === 'transferring') {
        const nextIdx = item.stageIndex + 1;
        const nextBaseX = nextIdx * stageWidth;
        item.targetX = nextBaseX + stageWidth * OFFSET_QUEUE;

        const moveSpeed = 1.5;
        if (item.x < item.targetX) {
          item.x += moveSpeed;
        } else {
          const prevStageId = currentStages[item.stageIndex].id;
          const hist = s.history[prevStageId];
          if (hist) {
            hist.totalProcess += item.currStageProcessTicks;
            hist.totalWait += item.currStageWaitTicks;
            hist.count++;
          }
          item.currStageProcessTicks = 0;
          item.currStageWaitTicks = 0;
          // Check for rework based on %C/A of the stage just completed
          const completedStage = currentStages[item.stageIndex];
          const percentComplete = completedStage.percentComplete || 100;

          // Determine if this item needs rework based on %C/A
          const needsRework = Math.random() * 100 > percentComplete;

          if (needsRework && !item.isBug) {
            // Convert to bug/rework item and send back to previous stage
            item.isBug = true;
            item.state = 'returning';
            // Return to the stage before the one just completed (or backlog if at first stage)
            item.returnTargetIndex = Math.max(0, item.stageIndex - 1);
            return;
          }

          item.stageIndex = nextIdx;

          const nextStage = currentStages[item.stageIndex];

          if (nextStage.id === 'done') {
            s.completedItems.push(now);
            if (s.completedItems.length > 50) s.completedItems.shift();

            // Bugs that reach production get sent back to Backlog
            if (item.isBug) {
              item.state = 'returning';
              item.returnTargetIndex = 0; // Return to Backlog
              return;
            }

            // Check for production defects based on percentage
            // Only apply to non-bug items that are reaching production
            if (productionDefectRate > 0 && !item.isBug) {
              const defectChance = Math.random() * 100;
              if (defectChance < productionDefectRate) {
                // This item becomes a production defect
                item.isBug = true;
                item.isProductionDefect = true; // Mark as coming from production
                item.state = 'returning';
                item.returnTargetIndex = 0; // Return to Backlog
                return;
              }
            }

            item.state = 'processing';
          } else {
            item.state = 'queued';
            // Reset intake tracking for new stage
            item.currentIntakeTicks = 0;
            item.targetIntakeTicks = null;
          }
        }
      } else if (item.state === 'returning') {
        const targetBaseX = item.returnTargetIndex * stageWidth;
        item.targetX = targetBaseX + stageWidth * OFFSET_QUEUE;

        const returnSpeed = 3;
        if (item.x > item.targetX) {
          item.x -= returnSpeed;
        } else {
          item.stageIndex = item.returnTargetIndex;
          item.state = 'queued';
          item.currStageProcessTicks = 0;
          item.currStageWaitTicks = 0;

          // Reset intake tracking for new stage
          item.currentIntakeTicks = 0;
          item.targetIntakeTicks = null;

          // Clear rework flags when item arrives back for rework
          // isUnclear items get fixed in Refining Work
          if (item.isUnclear && item.returnTargetIndex === 1) {
            item.isUnclear = false;
          }
          // Production defects become rework items when they start processing again
          if (item.isProductionDefect) {
            item.isProductionDefect = false; // No longer a production defect
            item.isRework = true; // Now it's being reworked
            item.isBug = false; // Not a bug anymore
          }
          // Other bugs that complete rework become regular items again
          else if (item.isBug) {
            item.isBug = false;
          }
        }
      }

      if (item.state !== 'transferring' && item.state !== 'returning') {
        item.x += (item.targetX - item.x) * 0.1;
      }
    });

    if (s.items.length > 80) {
      const doneItems = s.items.filter(i => i.stageIndex === currentStages.length - 1);
      if (doneItems.length > 20) {
        const oldest = doneItems.sort((a, b) => a.createdAt - b.createdAt)[0];
        s.items = s.items.filter(i => i !== oldest);
      }
    }

    const activeItems = s.items.filter(i => i.stageIndex < currentStages.length - 1);
    const doneCount = s.items.filter(
      i => i.stageIndex === currentStages.length - 1
    ).length;
    const recentCompletions = s.completedItems.filter(
      t => now - t < 5000
    ).length;
    const throughputPerSec = recentCompletions / 5;
    // Cycle time using Little's Law: WIP / Throughput (in seconds)
    // Convert to hours by dividing by 3600 (seconds per hour)
    const estCycleTimeSeconds = throughputPerSec > 0 ? activeItems.length / throughputPerSec : 0;
    const estCycleTimeHours = estCycleTimeSeconds / 3600;

    const currentStageMetrics = {};
    Object.keys(s.history).forEach(key => {
      const h = s.history[key];
      currentStageMetrics[key] = {
        avgProcess: h.count > 0 ? h.totalProcess / h.count : 0,
        avgWait: h.count > 0 ? h.totalWait / h.count : 0,
      };
    });

    setItems([...s.items]);
    setStageMetrics(currentStageMetrics);
    setMetrics({
      wip: activeItems.length,
      throughput: doneCount,
      cycleTime: estCycleTimeHours.toFixed(1),
    });
  };
  
  const getStageStats = () => {
    const stats = {};
    items.forEach(i => {
      const stageId = dynamicStages[i.stageIndex]?.id; 
      if (!stageId) return;
      if (!stats[stageId])
        stats[stageId] = { queued: 0, processing: 0, waiting: 0 };

      if (i.state === 'queued') stats[stageId].queued++;
      else if (i.state === 'processing') stats[stageId].processing++;
      else if (i.state === 'waiting') stats[stageId].waiting++;
    });
    return stats;
  };

  useEffect(() => {
    let animationFrameId;
    let lastTick = Date.now();
    let currentCountdown = deploymentCountdown;

    const tick = () => {
      const now = Date.now();
      // At 1x speed: want 1 tick per second = 1 simulated hour per second
      // (1 tick/sec × 1 hour/tick = 1 hour/sec)
      // Base interval for 1x: 1000ms per tick
      // Adjust by simulation speed: faster speed = shorter interval
      const frameInterval = 1000 / simulationSpeed;
      if (now - lastTick > frameInterval) {
        // Update simulation with current countdown value and batch size
        updateSimulation(now, dynamicStages, problems, currentCountdown, batchSize);

        // Then update countdown for next tick
        if (problems.infrequentDeploy) {
          // If countdown is already at 0 or below, reset for NEXT tick
          if (currentCountdown <= 0) {
            currentCountdown = deploymentSchedule / HOURS_PER_TICK;
          } else {
            // Decrement countdown
            currentCountdown = currentCountdown - 1;
          }
          setDeploymentCountdown(currentCountdown);
        }
        lastTick = now;
      }
      if (isRunning) animationFrameId = requestAnimationFrame(tick);
    };
    if (isRunning) animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isRunning, problems, dynamicStages, deploymentSchedule, deploymentCountdown, simulationSpeed, batchSize]);

  // Initialize countdown when infrequent deploy is activated
  useEffect(() => {
    if (problems.infrequentDeploy && deploymentCountdown === 0) {
      setDeploymentCountdown(deploymentSchedule / HOURS_PER_TICK);
    }
  }, [problems.infrequentDeploy, deploymentSchedule]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-8">
      {isSettingsOpen && (
        <SettingsMenu
          stages={stages}
          onUpdateStage={handleUpdateStage}
          onClose={() => {
            setIsSettingsOpen(false);
            setSelectedStageId(null);
          }}
          deploymentSchedule={deploymentSchedule}
          setDeploymentSchedule={setDeploymentSchedule}
          productionDefectRate={productionDefectRate}
          setProductionDefectRate={setProductionDefectRate}
          selectedStageId={selectedStageId}
        />
      )}
      <div className="max-w-6xl mx-auto space-y-6">
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
            <button onClick={() => setIsRunning(!isRunning)} className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}`}>
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            <button onClick={resetSimulation} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md font-medium transition-colors">
              <RefreshCw size={18} />
              Reset
            </button>
          </div>
        </div>

        {/* Control Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Batch Size Slider */}
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="batch-size" className="text-sm font-medium text-slate-300">
                Batch Size
              </label>
              <span className="text-sm font-mono text-blue-300">{batchSize} items</span>
            </div>
            <input
              id="batch-size"
              type="range"
              min="1"
              max="20"
              step="1"
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>1</span>
              <span>10</span>
              <span>20</span>
            </div>
          </div>

          {/* Production Defect Rate Slider */}
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="defect-rate" className="text-sm font-medium text-slate-300">
                Production Defects
              </label>
              <span className="text-sm font-mono text-red-300">{productionDefectRate}%</span>
            </div>
            <input
              id="defect-rate"
              type="range"
              min="0"
              max="100"
              step="1"
              value={productionDefectRate}
              onChange={(e) => setProductionDefectRate(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Simulation Speed Slider */}
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="sim-speed" className="text-sm font-medium text-slate-300">
                Simulation Speed
              </label>
              <span className="text-sm font-mono text-purple-300">{simulationSpeed.toFixed(1)}x</span>
            </div>
            <input
              id="sim-speed"
              type="range"
              min="1.0"
              max="30.0"
              step="1.0"
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>1.0x (1h/sec)</span>
              <span>15.0x</span>
              <span>30.0x</span>
            </div>
          </div>
        </div>

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
            unit="hours"
            subtext="Avg time to complete"
            trend={metrics.cycleTime > 100 ? 'bad' : 'good'}
          />
        </div>

        <div className="bg-slate-900/50 p-2 rounded-xl overflow-x-auto">
          <div className="min-w-[800px]">
            <SimulationCanvas
              items={items}
              stageStats={getStageStats()}
              stageMetrics={stageMetrics}
              stages={dynamicStages}
              problems={problems}
              deploymentCountdown={deploymentCountdown}
              batchCountdowns={stateRef.current.batchCountdowns}
              onStageSettingsClick={(stageId) => {
                setSelectedStageId(stageId);
                setIsSettingsOpen(true);
              }}
            />
          </div>
        </div>
        
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
              description="Ambiguity discovered in Development sends work back to Refining Work."
            />
            <ProblemToggle
              id="codingErrors"
              label="Coding Errors"
              active={problems.codingErrors}
              onClick={toggleProblem}
              icon={ShieldAlert}
              description="Coding errors discovered in Testing send work back to Development."
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
            <ProblemToggle
              id="infrequentDeploy"
              label="Infrequent Deploys"
              active={problems.infrequentDeploy}
              onClick={toggleProblem}
              icon={Clock}
              description={`Schedules deployments every ${deploymentSchedule} hours. Work waits for the next cycle.`}
            />
            <ProblemToggle
              id="tooManyFeatures"
              label="Too Many Features"
              active={problems.tooManyFeatures}
              onClick={toggleProblem}
              icon={Plus}
              description="Doubles feature generation rate. Increases WIP and system load."
            />
            <ProblemToggle
              id="unstableProduction"
              label="Unstable Production"
              active={problems.unstableProduction}
              onClick={toggleProblem}
              icon={ZapOff}
              description="Doubles defect generation rate. Increases rework and quality issues."
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-slate-400 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Feature</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Defect</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500 flex items-center justify-center">
              <span className="text-[6px] text-black font-bold">?</span>
            </div>
            <span>Unclear Req</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>Waiting / Blocked</span>
          </div>
          <div className="flex items-center gap-2 border-l border-slate-600 pl-4">
            <div className="w-16 h-8 border border-slate-600 rounded bg-slate-800 flex overflow-hidden">
              <div className="w-1/3 bg-black/30 flex items-center justify-center text-[8px]">
                Q
              </div>
              <div className="w-1/3 bg-black/30 flex items-center justify-center text-[8px]">
                Wait
              </div>
              <div className="w-1/3 flex items-center justify-center text-[8px]">
                Work
              </div>
            </div>
            <span>Structure</span>
          </div>
        </div>
      </div>
    </div>
  )
}
