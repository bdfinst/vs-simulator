# Value Stream Simulator Project

## Initial Request

I want to build a software value stream animated simulation that shows the impact of common problems on the overall system of product delivery.
I want the user to be able to select one or more common problems and have the animated value stream respond with a visualization of the flow of work and the batching of work in progress ant various stages of the value stream.
We should start with an optimized value stream where we have a fully cross-functional product team that contains all of the capabilities required to define, build, deliver, and operate. Then by turning on common problems, we can see the impact to the value stream with visual representations of the workflow.

# AI Coding Agent Prompt: Build a React Functional Value Stream Mapping Simulator

## Objective

Build an interactive **Value Stream Mapping Simulator** in **React** using **functional programming**, React hooks, and pure functional components.  
All logic must be deterministic, modular, and side-effect free except where explicitly necessary (animation loops, timers, state updates).

---

## Technical Requirements

### Framework

- **React** (functional components only)  
- **React Hooks**: `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`  
- **No class components**  
- Prefer composable utilities and pure functions  
- State should be stored at the simulator level and passed down via props  

Use tailwind for styling

---

## Simulator Behavior

### Work Items

A work item is a **dot** that moves left-to-right through user-configured steps.

#### Dot Visual Rules

- **Green** → actively processing  
- **Yellow** → waiting due to WIP limit or queue  
- **Red** → rejected (fails PCA check)

#### Movement Rules

- Moves sequentially through steps  
- Waits if step is full (yellow)  
- Turns green when processing begins  
- After processing:
  - Roll RNG vs PCA (0–100%)  
  - If fail → turn red and follow rejection logic  
  - If succeed → move to next step

---

## Value Stream Step Model

Each step must include:

```ts
{
  id: string,
  title: string,
  waitTime: number,
  processTime: number,
  pca: number,
  wipLimit: number
}
```

### Functional Constraints

- No mutable global state  
- Step evaluation must be done via pure functions  
- Rendering logic must be decoupled from simulation logic  

---

## User Configuration Requirements

User must be able to dynamically:

- Add steps (before, between, or after existing steps)
- Remove steps
- Rename steps
- Modify:
  - waitTime  
  - processTime  
  - pca  
  - wipLimit  
- Reorder steps
- All updates must immediately re-render the pipeline

Required components:

- `<StepEditor />`
- `<PipelineEditor />`
- `<SimulatorCanvas />`
- `<WorkItem />`
- `<PipelineStep />`

---

## Animation Requirements

### Simulation Loop

Implement an animation/update loop using:

- `requestAnimationFrame` OR
- `setInterval` with controlled cleanup

Requirements:

- Loop must be isolated in a `useEffect` with cleanup  
- Logic extracted into pure functions such as:
  - `advanceWorkItems`
  - `evaluateStep`
  - `rollPca`

### Visual Layout

- Steps displayed horizontally in a pipeline  
- Dots animate smoothly between steps  
- Waiting dots cluster before a step  
- Red dots visibly flagged or removed according to rules

---

## Testing Scenarios to Support

Provide presets or easy reconfiguration for:

1. **Acceptance testing + delivery**  
   - WIP limit = 100  

2. **Work refinement**  
   - WIP limit = 100  

3. **Backlog with code review**  
   - WIP limit = 5  

Presets should load into state as JSON.

---

## Functional Utilities (Required)

Create helper utilities such as:

- `createWorkItem()`  
- `processStep(step, items)`  
- `canEnterStep(step, items)`  
- `applyWipLimit(step, items)`  
- `rollPca(probability)`  
- `updateWorkItemState(item, state)`  
- `advanceItemToNextStep(item)`  

All utilities must be **pure functions**.

---

## Overall Goal

Produce clean, maintainable, reactive functional code that:

- animates work items through a value stream  
- visualizes queues, bottlenecks, and flow efficiency  
- demonstrates how WIP limits, wait time, process time, and PCA affect throughput  
- allows the user to fully configure value-stream steps  
- updates instantly when the configuration changes  

Your output should be fully implementable in a standard React project.

## Refinement 1: Visualization Details

When rework occurs, we need to visualize the work returning and waiting to be worked. Also, we need to visualize the wait queue for each step.
