# Workflow Scenarios

The Value Stream Simulator now supports multiple predefined workflow scenarios that demonstrate different software delivery approaches and their impact on flow metrics.

## Available Scenarios

### 1. Standard Agile Flow (Default)
**Description**: Typical agile workflow with continuous deployment

**Characteristics**:
- 7 stages: Backlog → Refining Work → Development → Code Review → Testing → Deployment → Production
- Automated testing and deployment
- 24-hour deployment schedule
- Balanced wait times and process times
- 5 developers, 2 reviewers, automated testing

**Use Case**: Modern agile teams practicing continuous integration and daily deployments

---

### 2. CAB Approval Flow
**Description**: Traditional workflow with Change Advisory Board approval every 2 days

**Characteristics**:
- 8 stages: Backlog → Refining Work → Development → Code Review → Testing → **CAB Approval** → Deployment → Production
- CAB meetings occur every 48 hours (2 days)
- Work queues up at CAB stage until next meeting
- CAB stage uses `batch` step type with 48-hour cadence
- Single CAB approver (1 actor)

**Impact on Metrics**:
- Increased cycle time due to CAB wait
- Larger batches released together
- Reduced deployment frequency
- Higher WIP at CAB stage

**Use Case**: Organizations with change control processes, regulated industries, traditional IT operations

---

### 3. Waterfall Model
**Description**: Traditional waterfall with long phases and quarterly releases

**Characteristics**:
- 8 stages: Backlog → Requirements → Design → Development → QA Testing → UAT → Release → Production
- Very long process times (80-320 hours per phase)
- Long wait times between phases
- Quarterly releases (2,160 hours / 90 days)
- Release stage uses `batch` step type with 2160-hour cadence
- Large team (8 developers, 4 QA, 2 UAT)

**Impact on Metrics**:
- Very high cycle times (months)
- Very low deployment frequency (once per quarter)
- Massive batches
- High WIP throughout pipeline

**Use Case**: Traditional enterprise software development, legacy organizations, large-scale projects with infrequent releases

---

### 4. Dual Code Review
**Description**: Workflow with both peer review and mandatory tech lead review

**Characteristics**:
- 8 stages: Backlog → Refining Work → Development → **Peer Review** → **Tech Lead Review** → Testing → Deployment → Production
- Two sequential code review stages
- Peer Review: 3 reviewers available, 0.5-2 hours review time, 4-8 hours wait time
- Tech Lead Review: 1 tech lead (bottleneck), 1-3 hours review time, 8-16 hours wait time
- Single tech lead creates a bottleneck
- Longer wait times at Tech Lead Review due to limited capacity

**Impact on Metrics**:
- Increased cycle time (two review gates instead of one)
- Tech Lead Review becomes a bottleneck (1 actor)
- Higher WIP at Tech Lead Review stage
- Longer wait times due to sequential approvals
- Quality gates ensure thorough review but slow flow

**Use Case**: Organizations requiring multiple levels of approval, regulated environments, critical systems requiring senior oversight, legacy codebases with complex dependencies

---

### 5. External QA Team
**Description**: Separate QA team with scheduled triage meetings - 20% of defects require test fixes

**Characteristics**:
- 9 stages with **2 exception flow stages** displayed above main flow
- Normal Flow: Backlog → Requirements → Development → **QA Handoff** → **External QA** → Deployment → Production
- Exception Flow (Red): **Triage Meeting** → **Test Fix**
- Separate external QA team (not embedded with dev)
- QA Handoff stage with long wait times (16-24 hours) representing team handoffs
- External QA: 3 testers, 4-8 hour testing time, 16-32 hour wait time
- **70% pass rate (30% defect discovery rate)** at External QA
- **Triage Meeting**: Scheduled batch meeting every 48 hours (2 days)
  - Joint Dev + QA team (2 people)
  - Analyzes all queued defects together
  - 80% complete rate (20% determined to be test issues)
- **Test Fix**: 2 QA engineers fix incorrect tests (2-4 hours)
- Long wait times throughout (reflecting communication overhead)

**Impact on Metrics**:
- Very high cycle times (80-150+ hours)
- Significant rework loops (30% defect rate)
- Long wait times at handoff points
- Triage meeting batching adds 0-48 hour wait
- Communication delays between teams
- Triage creates additional processing step
- Multiple passes through QA common
- Some defects require test changes instead of code changes

**Rework Flows**:

When External QA finds a defect (30% chance):
1. Item marked as defect/bug
2. **Visually moves up** to exception flow (top row)
3. Queues at Triage Meeting stage (exception flow)
4. Waits for next scheduled meeting (up to 48 hours)
5. During meeting, triage determines:
   - **80% chance**: Code defect → **Moves back down** to normal flow, returns to Development
   - **20% chance**: Test issue → **Stays in exception flow**, goes to Test Fix stage
6. After Test Fix, **moves back down** to normal flow and returns to External QA for verification
7. May require multiple cycles with vertical movement each time

**Use Case**: Organizations with separate QA departments, offshore testing teams, contractor-based QA, siloed organizations, traditional enterprise IT with handoff-heavy processes

---

### 6. Elite DevOps
**Description**: High-performing team with automated pipeline and multiple deployments per day

**Characteristics**:
- 6 stages: Backlog → Development → Code Review → Testing → Deployment → Production
- Very short process times (minutes to hours)
- Minimal wait times
- Fully automated review, testing, and deployment
- Deployments every 15 minutes (0.25 hours)

**Impact on Metrics**:
- Very low cycle times (hours, not days)
- Very high deployment frequency (96 deploys/day)
- Small batch sizes
- Low WIP

**Use Case**: Elite performers, SaaS companies, mature DevOps practices, feature flag-driven development

---

## Technical Implementation

### Scenario Structure

Each scenario in `src/scenarios.js` defines:

```javascript
{
  id: 'scenarioId',
  name: 'Display Name',
  description: 'Brief description',
  stages: [...],  // Array of stage configurations
  deploymentSchedule: 24  // Hours between deployments
}
```

### Stage Types

1. **queue** - Entry/backlog stages (no processing)
2. **process** - Active work stages
3. **sink** - Completion/production (items disappear)

### Step Types

1. **manual** - Human workers, limited actors
2. **automated** - Automated tools, unlimited actors (Infinity)
3. **batch** - Scheduled releases/gates with `cadence` property

### Batch/Scheduled Stages

For stages like CAB approval or scheduled releases:

```javascript
{
  id: 'cab',
  label: 'CAB Approval',
  stepType: 'batch',  // Important: use 'batch', not 'manual'
  cadence: 48,        // Hours between batch releases
  actors: 1,
  processTime: { min: 0.5, max: 1 },
  waitTime: { min: 0, max: 0 }
}
```

**How it works**:
- Items queue at the batch stage
- A countdown tracks time until next release
- When countdown reaches 0:
  - All queued items are released simultaneously
  - Countdown resets to `cadence` value
- Countdown is displayed on the stage in the UI

### Adding New Scenarios

To add a new scenario:

1. Open `src/scenarios.js`
2. Add new scenario to `SCENARIOS` object
3. Define all stages with appropriate step types
4. Set `cadence` for any batch/scheduled stages
5. Scenario will automatically appear in UI dropdown

Example:

```javascript
myScenario: {
  id: 'myScenario',
  name: 'My Custom Flow',
  description: 'Description of workflow',
  stages: [
    { id: 'backlog', label: 'Backlog', type: 'queue', ... },
    // ... more stages
    {
      id: 'approval',
      label: 'Weekly Approval',
      type: 'process',
      stepType: 'batch',  // Scheduled gate
      cadence: 168,       // Weekly (7 * 24 hours)
      actors: 1,
      processTime: { min: 1, max: 2 },
      waitTime: { min: 0, max: 0 }
    },
    { id: 'done', label: 'Production', type: 'sink', ... }
  ],
  deploymentSchedule: 168  // Weekly
}
```

## UI Components

### Scenario Selector

Located at the top of the interface:
- Dropdown to select scenario
- Description shown next to dropdown
- Changing scenario resets the simulation

### Stage Countdown Display

For batch-type stages:
- Countdown timer shown on stage
- Format: "Next release: Xh"
- Updates in real-time
- Visual indicator of batching behavior

### Exception Flow Visual Layout

When scenarios include exception flow stages (marked with `isExceptionFlow: true`):
- **Container height**: Automatically increases from 320px to 550px
- **Two-tier layout**:
  - Exception flow stages displayed in top row (red color scheme)
  - Normal flow stages displayed in bottom row
- **Work item movement**:
  - Items in normal flow stages positioned at 75% height (bottom row)
  - Items in exception flow stages positioned at 25% height (top row)
  - Items **smoothly animate vertically** when transitioning between flows
  - Creates clear visual indication of rework loops and exception handling
- **Flow visualization**:
  - Items move up when entering exception flow (e.g., defects going to triage)
  - Items move down when returning to normal flow (e.g., after triage or test fixes)
  - Vertical transitions use same animation timing as horizontal movement

## Simulation Behavior

### Scenario Change

When user selects a new scenario:
1. Scenario stages loaded from configuration
2. Deployment schedule updated
3. Simulation fully reset
4. All items cleared
5. Metrics reset to 0
6. Batch countdowns initialized

### Batch Processing

For stages with `stepType: 'batch'`:
1. Items enter stage and queue
2. Countdown decrements each tick
3. When countdown reaches 0:
   - All queued items process simultaneously
   - Countdown resets to `cadence`
4. Creates realistic batching behavior
5. Shows impact of scheduled releases on flow

## Metrics Impact by Scenario

| Scenario | Cycle Time | Deploy Freq | WIP | Batch Size | Key Bottleneck | Defect Rate |
|----------|------------|-------------|-----|------------|----------------|-------------|
| Standard Agile | ~30-50h | ~1/day | Low-Med | Small | Balanced | Low |
| CAB Approval | ~50-80h | ~0.5/day | Medium | Medium | CAB Gate | Low |
| Waterfall | ~1000h+ | ~0.01/day | Very High | Massive | Release Schedule | Low |
| Dual Review | ~40-70h | ~1/day | Medium | Small | Tech Lead Review | Low |
| External QA | ~70-120h+ | ~0.5/day | High | Small | QA Handoff + Rework | High (30%) |
| Elite DevOps | ~2-5h | ~96/day | Very Low | Tiny | None | Very Low |

## Educational Value

Each scenario demonstrates:

1. **Standard Agile**: Baseline for comparison
2. **CAB Approval**: Impact of approval gates and batching
3. **Waterfall**: Consequences of long cycles and infrequent releases
4. **Dual Review**: Effect of sequential approvals and limited reviewers (Theory of Constraints)
5. **External QA**: Cost of team handoffs, silos, and rework loops
6. **Elite DevOps**: Benefits of automation and continuous delivery

Users can observe:
- How scheduled gates increase WIP
- How batching affects cycle time
- Impact of automation vs. manual processes
- Relationship between deployment frequency and flow
- Effect of bottleneck resources (single tech lead)
- Impact of sequential approval stages on cycle time
- Cost of rework loops and defect discovery
- Handoff delays between separate teams
- Triage overhead in multi-team environments

## Future Enhancements

Potential additions:
- Kanban with WIP limits per stage
- Trunk-based development scenario
- Feature branch workflow
- GitFlow with release branches
- Microservices with independent pipelines
- Custom scenario builder UI
