# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Value Stream Simulator** - an interactive React application that visualizes software delivery workflows, queues, bottlenecks, and rework loops in real-time. It demonstrates principles from Theory of Constraints, Lean, and DevOps.

The simulator models work items (features and defects) flowing through six stages:
- **Intake** (entry queue)
- **Backlog** (queue)
- **Change Definition** (analysis/planning)
- **Development** (implementation)
- **Testing** (QA)
- **Deployment** (release)
- **Production** (completed work sink)

Users can activate system constraints (Siloed Teams, Large Batches, Quality Issues, Manual Testing, etc.) to observe their impact on metrics like WIP, throughput, and cycle time.

## Commands

### Development
```bash
npm run dev        # Start dev server (Vite)
npm run build      # Build for production
npm run preview    # Preview production build
```

### Testing
```bash
npm test           # Run tests (Vitest)
npm test:ui        # Run tests with UI
npm test:coverage  # Generate coverage report
```

Tests use Vitest + Testing Library with fake timers to simulate the animation frame loop.

## Architecture

### Core Simulation Engine

**State Management**: The simulation uses a hybrid approach:
- React state (`items`, `metrics`, `problems`, `stages`) for rendering
- `stateRef` (useRef) for simulation internals to avoid re-render overhead during high-frequency updates

**Simulation Loop** (src/App.jsx:659-687):
- Runs at 30 FPS via `requestAnimationFrame`
- Time scale: 0.5 simulated hours per tick (HOURS_PER_TICK constant)
- Core update logic is in `updateSimulation()` function
- All item movement, state transitions, and metrics calculated per tick

### Work Item Lifecycle

Items progress through states: `queued` → `waiting` → `processing` → `transferring` → (next stage)

**State Machine** (src/App.jsx:366-605):
- `queued`: Item enters stage's input queue
- `waiting`: Wait time before processing (e.g., handoff delays, batch formation)
- `processing`: Active work with progress bar (0-100%)
- `transferring`: Moving to next stage (animated X position change)
- `returning`: Rework loops (bugs returning from Testing/Production, unclear requirements)

**Positioning System**:
- Each stage occupies `100 / stageCount` percent of canvas width
- Three zones within each stage: Queue (15%), Wait (50%), Process (85%)
- Items have `x` (horizontal position), `yOffset` (vertical jitter), and `targetX` (destination)

### Constraint Implementation

**Problem Toggles**: Nine constraints that modify simulation behavior:
- **silos**: Random 15% chance to block waiting→processing transition (src/App.jsx:495)
- **largeBatches**: Requires 5 items in `waiting` state before batch proceeds (src/App.jsx:497-514)
- **unclearRequirements**: 3% chance per tick in Development to send item back to Change Definition (src/App.jsx:445-452)
- **qualityIssues**: 35% chance when entering Testing to mark as defect and return to Development (src/App.jsx:556-563)
- **manualTesting**: Reduces actors to 1, slows processing by 10x (src/App.jsx:249-254, 434-435)
- **manualDeploy**: 98% chance to block Deployment processing (src/App.jsx:517-519)
- **infrequentDeploy**: Uses deployment countdown (e.g., 24h cycles), items wait until countdown=0 (src/App.jsx:407-481)
- **tooManyFeatures**: Halves feature spawn rate (doubles intake) (src/App.jsx:291-293)
- **unstableProduction**: Halves defect spawn rate (doubles defect generation) (src/App.jsx:325-327)

**Deployment Countdown**: For `infrequentDeploy`, tracked in ticks (e.g., 24h / 0.5h = 48 ticks). Decrements each tick, resets when reaching 0 (src/App.jsx:671-680).

### Metrics Calculation

**Real-time Metrics** (src/App.jsx:615-641):
- **WIP**: Count of items not yet in Production stage
- **Throughput**: Total items that reached Production
- **Cycle Time**: Estimated via Little's Law (WIP / throughput rate)

**Stage Metrics** (src/App.jsx:626-633):
- Tracked in `stateRef.current.history` object
- Per-stage average process time and wait time (in ticks)
- Updated when items transfer to next stage (src/App.jsx:544-551)

### Visual Components

**SimulationCanvas** (src/App.jsx:46-176):
- Renders stages as boxes with Queue/Wait/Work zones
- Work items as colored dots with animations
- Deployment countdown overlay for infrequent deploy constraint

**Stages Configuration** (src/App.jsx:23-31):
- Each stage has: id, label, type (queue/process/sink), processTime range, waitTime range, actors (parallelism)
- `actors: Infinity` means unlimited parallelism (automated stages)
- Stage configs are editable via SettingsMenu component

### Item Types & Colors

- **Normal features**: Blue (`bg-blue-500`)
- **Defects**: Red (`bg-red-500`) - generated separately, rejected at Testing/Production
- **Unclear requirements**: Orange (`bg-orange-500`) - marked with "?" symbol
- **Waiting/Blocked**: Amber (`bg-amber-500`)
- **Batch items**: Purple (`bg-purple-500`) - when in large batch constraint

## Key Implementation Details

### Actor Capacity Management
Stages have limited "actors" (concurrent workers). Before transitioning from `waiting` to `processing`, the system checks if `processingItems.length < stage.actors` (src/App.jsx:484-492). This creates realistic bottlenecks.

### Rework Loops
- Defects discovered in Testing return to Development (stageIndex=2)
- Unclear requirements in Development return to Change Definition (stageIndex=1)
- Defects reaching Production return to Intake (stageIndex=0)

### Dynamic Stage Configuration
`dynamicStages` useMemo hook (src/App.jsx:245-256) modifies stages based on active constraints. Example: Manual Testing constraint changes Test stage actors from Infinity to 1.

### Settings Persistence
SettingsMenu component allows adjusting process times, wait times, actors, and deployment schedule. Updates propagate via `onUpdateStage` callback to parent state (src/App.jsx:258-260).

## Testing Patterns

Tests use fake timers and helper functions:
- `advanceSimulation(ticks)`: Advances time by N ticks at 30 FPS rate
- `toggleConstraint(container, label)`: Activates/deactivates constraints
- Verify items move through stages, constraints modify behavior, metrics update correctly

Example: src/test/infrequent-deploy.test.jsx validates that deployment countdown blocks items until release window.
