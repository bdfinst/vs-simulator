# Value Stream Simulator Project Overview

## Project Goal

To build an animated software value stream simulation that visualizes the impact of common problems on product delivery. The simulation will start with an optimized, fully cross-functional product team baseline. Users can then activate various "problems" to observe their effects on work flow, batching, process time, and wait time at different stages.

## Key Features & Refinements

* **Visualization of Rework and Wait Queues:** Clearly show work returning for rework and items waiting at each stage.
* **100% Test Automation Baseline:** The optimized value stream assumes full test automation with zero human testing.
* **Metrics:** Display process time and wait time (in hours) for each step, with continuous integration assumptions for development and an optimized CD pipeline cycle time of 1 hour (0 wait time for automated steps).
* **New Problem - Unclear Requirements:** Simulate the impact of requirements discovered during development.

## Development Approach

* **Acceptance Test-Driven Development (ATDD):** Development will be guided by acceptance criteria defined in `features/mvp.feature`.
* **Functional Programming Style:** Coding will adhere to a functional paradigm.

## Initial Acceptance Scenarios (from features/mvp.feature)

The simulation will initially support the following scenarios to validate core logic:

* **Optimized Continuous Delivery Pipeline:** Demonstrates immediate flow and 1-hour processing times for automated stages.
* **Impact of Manual Testing:** Shows reduced processing speed and increased process time in the "Testing" stage.
* **Impact of Manual Deployment Gates:** Visualizes work items blocked before "Production" with significant wait times.
* **Rework due to Quality Issues:** Simulates items returning to "Development" with a 35% probability after "Testing."
* **Rework due to Unclear Requirements:** Models items returning to "Analysis" with a 3% per tick probability during "Development."
* **Delays due to Siloed Teams:** Introduces a 15% probability of work item blocking between stages due to handoff friction.
* **Delays due to Large Batch Sizes:** Illustrates work items waiting in a stage until a batch size of 5 is reached.
* **Impact of Context Switching:** Shows decreased processing speed proportionally to increased WIP in a stage.
