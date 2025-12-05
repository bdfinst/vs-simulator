Feature: Infrequent Deployment Constraint
  As a user of the value stream simulator
  I want to see the impact of infrequent deployments
  So that I can understand how batch releases affect cycle time and wait time

  Background:
    Given the simulation is running
    And the deployment schedule is set to 24 hours
    And the hours per tick is 0.5

  Scenario: Items flow through deployment stage without constraint
    Given the "Infrequent Deploys" constraint is disabled
    When a work item completes processing in the deployment stage
    Then the item should immediately transfer to the production stage
    And the deployment stage wait time should be 0 hours

  Scenario: Items accumulate when deployment window is closed
    Given the "Infrequent Deploys" constraint is enabled
    And the deployment countdown is 12 hours
    When work items complete processing in the deployment stage
    Then all items should remain in the waiting state
    And items should have a purple/batch color indicator
    And the deployment stage should display "Next Release In: 12h"
    And the deployment stage wait time should increase

  Scenario: Batch release when deployment window opens
    Given the "Infrequent Deploys" constraint is enabled
    And 5 work items are waiting in the deployment stage
    And the deployment countdown reaches 0 hours
    When the simulation tick occurs
    Then all 5 waiting items should move to processing state
    And all 5 items should begin processing simultaneously
    And the items should transfer to production after processing completes
    And the deployment countdown should reset to 24 hours

  Scenario: New items wait for next deployment window
    Given the "Infrequent Deploys" constraint is enabled
    And the deployment countdown just reset to 24 hours
    When new work items arrive at the deployment stage
    Then the items should enter waiting state
    And the items should wait for the full 24 hour cycle
    And the items should not process until countdown reaches 0 again

  Scenario: Deployment window timing
    Given the "Infrequent Deploys" constraint is enabled
    And the deployment schedule is 24 hours
    And the hours per tick is 0.5
    Then the countdown should start at 48 ticks
    And the countdown should decrement by 1 tick per simulation tick
    When the countdown reaches 0 or below
    Then items should be released
    And the countdown should reset to 48 ticks

  Scenario: Visual indicators during infrequent deploys
    Given the "Infrequent Deploys" constraint is enabled
    And work items are waiting in deployment
    Then the deployment stage should show a countdown timer
    And waiting items should display in the middle zone (wait position)
    And waiting items should show purple/batch coloring
    When countdown reaches 0
    Then items should move to the right zone (processing position)
    And items should change to normal blue coloring

  Scenario: Disabling infrequent deploys releases items immediately
    Given the "Infrequent Deploys" constraint is enabled
    And 5 work items are waiting in the deployment stage
    And the deployment countdown is 12 hours
    When the user disables the "Infrequent Deploys" constraint
    Then all waiting items should be released immediately
    And the deployment countdown should stop
    And the countdown timer should not be displayed

  Scenario: Items are released exactly when countdown reaches zero
    Given the "Infrequent Deploys" constraint is enabled
    And 3 work items are waiting in the deployment stage
    And the deployment countdown is at 2 ticks (1 hour)
    When the simulation advances by 2 ticks
    Then the countdown should reach exactly 0
    And all 3 waiting items should transition to processing state
    And the items should no longer be blocked by the countdown

  Scenario: Multiple batches release on subsequent countdown cycles
    Given the "Infrequent Deploys" constraint is enabled
    And 2 work items are waiting in the deployment stage
    When the countdown reaches 0 and items are released
    And the countdown resets to 24 hours
    And 3 new work items arrive at the deployment stage
    Then the new items should wait for the full countdown cycle
    When the countdown reaches 0 again
    Then all 3 new items should be released in the second batch
    And the countdown should reset to 24 hours again

  Scenario: Countdown at zero does not block new arrivals
    Given the "Infrequent Deploys" constraint is enabled
    And the deployment countdown is exactly 0
    When a new work item arrives at the deployment stage
    Then the item should immediately begin processing
    And should not enter waiting state
