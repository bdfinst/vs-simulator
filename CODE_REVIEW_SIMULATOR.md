# Code Review Methodology Simulator

## Overview

The Code Review Methodology Simulator is a Monte Carlo-based simulation that compares two software development approaches:

1. **Async Code Review** - Traditional approach with coding, handoff waits, reviews, and rework cycles
2. **Pair Programming** - Continuous collaboration with two developers working together

## Purpose

This simulator helps visualize and quantify the impact of **wait times** on flow efficiency. It demonstrates how handoff delays in async code reviews can dramatically reduce throughput compared to pair programming, even when pair programming uses more person-hours per feature.

## Key Findings

The simulator reveals:

- **Wait time is the killer** - Even small wait times (2-8 hours) accumulate rapidly through multiple handoff cycles
- **Rework amplifies delays** - Each rejection creates another full cycle of wait → rework → wait → review
- **Context switching has a cost** - Developers incur a 15% penalty when switching between tasks
- **Pairing eliminates handoffs** - No waiting, no context switching, continuous flow

## Simulation Configuration

### Team Parameters

- **Team Size**: 4-16 developers (default: 8)
  - Standard distribution: 25% Junior, 50% Mid, 25% Senior
  - Experience affects coding speed and defect rates

### Task Parameters

- **Task Count**: 10-50 tasks in a 10-day sprint (default: 20)
- **Task Size**: Configurable range (default: 2-5 days of effort)

### Async Code Review Parameters

- **Wait Time**: Time between handoffs (default: 2-8 hours)
  - Critical parameter - adjust this slider to see dramatic impact
  - Represents: PR sits waiting for review, waiting for rework pickup
- **Review Time**: Time spent in code review (default: 1-3 hours)
- **Rejection Rate**: % of reviews that require rework (default: 30%)
- **Context Switch Penalty**: 15% efficiency loss when switching tasks

### Pair Programming Parameters

- **Pair Efficiency**: 0.9 (pairs slightly slower per person due to communication)
- **No wait times** - continuous flow
- **No context switching** - dedicated focus
- **Halved parallelism** - 2 people per stream instead of 1

## Monte Carlo Simulation Engine

The simulation (`src/simulationEngine.js`) implements:

### Developer Modeling

```javascript
JUNIOR:  { speedMultiplier: 0.7, defectRate: 0.3 }
MID:     { speedMultiplier: 1.0, defectRate: 0.2 }
SENIOR:  { speedMultiplier: 1.3, defectRate: 0.1 }
```

### Async Flow States

1. **Coding** - Developer implements feature
2. **Waiting for Review** - Handoff delay
3. **In Review** - Reviewer examines code
4. **Waiting for Rework** - Another handoff delay (if rejected)
5. **Rework** - Fix issues (30% of original effort)
6. **Repeat** until accepted
7. **Merged** - Complete

### Paired Flow States

1. **Pairing** - Both developers work together continuously
2. **Merged** - Complete (no intermediate states)

### Time Simulation

- Sprint: 10 days (80 hours)
- Time advances in 30-minute increments
- Tracks developer availability and task states
- Enforces actor capacity constraints (max concurrent tasks per developer)

## Metrics

### Throughput
Number of features completed in the 10-day sprint.

**Typical Results:**
- Async (high wait): 8-12 features
- Paired: 15-18 features

### Lead Time
Average wall-clock time from start to completion (in days).

**Typical Results:**
- Async (high wait): 5-8 days per feature
- Paired: 2-3 days per feature

### Effort (Cost)
Average person-hours spent per feature.

**Typical Results:**
- Async: 20-30 person-hours
- Paired: 40-50 person-hours (higher but more predictable)

**Key Insight:** Even though pairing uses more person-hours per feature, it often delivers MORE features in the same sprint due to eliminated wait time.

### Total Effort
Total person-hours consumed by the team in the sprint.

## Visualizations

### 1. Metrics Dashboard

Four-metric comparison cards for each methodology:
- Throughput (features completed)
- Lead Time (days per feature)
- Effort (person-hours per feature)
- Total Effort (team hours)

### 2. Time Breakdown Chart

Stacked bar chart comparing:
- **Work** (blue) - Actual coding/reviewing effort
- **Wait** (red) - Idle time in handoffs

Shows visually how async reviews accumulate massive wait time.

### 3. Animated Swimlane Visualization

**Async Swimlane** (3 lanes):
- **Development Lane** (top) - Coding and rework blocks
- **Waiting Lane** (middle) - RED blocks showing handoff delays
- **Review Lane** (bottom) - Review activity

Shows the "ping-pong" effect as work bounces between lanes.

**Paired Swimlane** (single continuous block):
- One solid green block spanning the full timeline
- Represents continuous, uninterrupted flow

**Animation:**
- Click "Play" to animate progress from 0-100%
- Visual comparison makes the flow difference obvious
- Pause/Reset controls for exploration

## Usage

### Running the Simulator

1. Click hamburger menu → "Pairing vs Async Code Review"
2. Adjust sliders to configure the simulation
3. Click "Run Simulation" to execute Monte Carlo analysis
4. Click "Play" to animate the timeline visualization

### Experiment Suggestions

**Experiment 1: Impact of Wait Time**
- Set wait time to 0-2 hours → See minimal difference
- Set wait time to 8-24 hours → See dramatic throughput drop
- Demonstrates: Wait time compounds through cycles

**Experiment 2: Impact of Rejection Rate**
- Set rejection rate to 0% → Async performs better
- Set rejection rate to 50% → Async throughput collapses
- Demonstrates: Rework creates exponential delay

**Experiment 3: Team Size Scaling**
- Small team (4 devs) → Pairing severely limited by halved parallelism
- Large team (16 devs) → Pairing benefits from many parallel streams
- Demonstrates: Pairing scales differently

**Experiment 4: Task Size Variability**
- Small tasks (1-2 days) → Wait time dominates
- Large tasks (5-10 days) → Wait time less significant percentage
- Demonstrates: Small batch size amplifies wait time impact

## Technical Implementation

### Files

- `src/simulationEngine.js` - Monte Carlo simulation logic
- `src/components/CodeReviewSimulator.jsx` - UI and visualization
- `src/components/SimulationMenu.jsx` - Navigation
- `src/App.jsx` - Routing and integration

### Dependencies

- **React** - UI framework
- **Tailwind CSS** - Styling
- **Recharts** - Bar chart visualization
- **Lucide React** - Icons

### Architecture

```
User adjusts sliders
    ↓
Click "Run Simulation"
    ↓
Generate team + tasks
    ↓
Run simulateAsync() and simulatePaired()
    ↓
Monte Carlo simulation executes
    ↓
Calculate metrics
    ↓
Update UI with results
    ↓
Animate timeline visualization
```

## Educational Value

This simulator demonstrates:

1. **Little's Law** in practice (Lead Time = WIP / Throughput)
2. **Theory of Constraints** - Handoffs create bottlenecks
3. **Lean principles** - Eliminate waste (wait time)
4. **DevOps philosophy** - Reduce batch size, increase flow
5. **Queueing theory** - Wait time compounds non-linearly

## Future Enhancements

Possible additions:
- WIP limits and pull systems
- Partial pairing (pair on complex features only)
- Asynchronous + mob programming comparison
- Real-time team dashboard view
- Historical trend tracking
- Cost-benefit analysis calculator
- Monte Carlo confidence intervals

## References

- Gene Kim - *The Phoenix Project* (Theory of Constraints)
- Donald Reinertsen - *The Principles of Product Development Flow* (Queueing theory)
- Mary and Tom Poppendieck - *Implementing Lean Software Development* (Waste elimination)
- Alistair Cockburn & Laurie Williams - Original pair programming research
