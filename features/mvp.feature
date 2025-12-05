Feature: Value Stream Simulation Logic

    Background:
        Given the Value Stream Simulator is initialized
        And the scale is set to 2 ticks per 1 hour
        And the stages are "Backlog", "Analysis", "Development", "Testing", "Deployment", "Production"

    Scenario: Optimized Continuous Delivery Pipeline (Default State)
        Given no dysfunctions or "Problems" are active
        And the simulation is running
        When a work item enters the "Development", "Testing", or "Deployment" stage
        Then the input queue should pick up the item immediately without human delay
        And the processing time should be approximately 1 hour (2 ticks)
        And the item should transition to the next stage immediately upon completion (0 wait time)

    Scenario: Impact of Manual Testing
        Given the "Manual Testing" problem is active
        When a work item enters the "Testing" stage
        Then the processing speed is reduced to 0.5 ticks per update (slow)
        And the process time metric for "Testing" should increase significantly
        And the throughput of the system should decrease

    Scenario: Impact of Manual Deployment Gates
        Given the "Manual Deploy Gate" problem is active
        When a work item completes processing in the "Deployment" stage
        Then the item should enter a "blocked" state
        And the probability of moving to "Production" in any given tick is very low (approx 2%)
        And the wait time metric for "Deployment" should increase significantly

    Scenario: Rework due to Quality Issues
        Given the "Quality Issues" problem is active
        When a work item completes the "Testing" stage
        Then there is a 35% probability the item is flagged as a "Defect"
        And the item should return to the "Development" queue (Rework Loop)
        And the item color should change to Red

    Scenario: Rework due to Unclear Requirements
        Given the "Unclear Requirements" problem is active
        When a work item is processing in the "Development" stage
        Then there is a 3% probability per tick the item is flagged as "Unclear"
        And the item should return to the "Analysis" queue immediately
        And the item color should change to Orange

    Scenario: Delays due to Siloed Teams
        Given the "Siloed Teams" problem is active
        When a work item completes processing in any stage
        Then there is a 15% probability the item will be blocked from moving to the next stage
        And the wait time metric for that stage should increase due to handoff friction

    Scenario: Delays due to Large Batch Sizes
        Given the "Large Batch Sizes" problem is active
        When a work item completes processing in a stage
        And there are fewer than 5 items waiting in the output buffer
        Then the item should remain in the "Wait" state (Batching)
        And the item color should change to Purple
        And the item should only move when the batch size reaches 5

    Scenario: Impact of Context Switching
        Given the "Context Switching" problem is active
        When the Work In Progress (WIP) in a single stage increases
        Then the processing speed for all items in that stage should decrease proportionally to the load
        And the Cycle Time for items should increase
