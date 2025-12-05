# Value Stream Simulator Project

## Initial Request

I want to build a software value stream animated simulation that shows the impact of common problems on the overall system of product delivery.
I want the user to be able to select one or more common problems and have the animated value stream respond with a visualization of the flow of work and the batching of work in progress ant various stages of the value stream.
We should start with an optimized value stream where we have a fully cross-functional product team that contains all of the capabilities required to define, build, deliver, and operate. Then by turning on common problems, we can see the impact to the value stream with visual representations of the workflow.

Suggest solutions

## Refinement 1: Visualization Details

When rework occurs, we need to visualize the work returning and waiting to be worked. Also, we need to visualize the wait queue for each step.

## Refinement 2: Test Automation Baseline

The optimized value stream should assume 100% test automation with no human testing.

## Refinement 3: Metrics & New Problems

Add fields for process time and wait time under each step. The times should be in hours and the development values should assume a team uses continuous integration. The optimized testing should reflect an optimized CD pipeline cycle time.
We also need to add a problem where there are unclear requirements discovered during development.

## Refinement 4: Optimization Tuning

The wait time for automated steps should be 0. An optimized CD pipeline should have a process time of 1 hour.
