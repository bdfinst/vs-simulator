Feature: Excessive Intake

  As a user
  I want to simulate the impact of excessive intake of work
  So that I can see how it affects the value stream

  Scenario: Default generation rates
    Given the simulation is running
    When the "Too Many Features" constraint is inactive
    And the "Unstable Production" constraint is inactive
    Then the feature generator should produce items at a normal rate
    And the defect generator should produce items at 20% of the feature generation rate

  Scenario: Too Many Features constraint is active
    Given the simulation is running
    When the "Too Many Features" constraint is active
    Then the feature generator should produce items at 2x the normal rate

  Scenario: Unstable Production constraint is active
    Given the simulation is running
    When the "Unstable Production" constraint is active
    Then the defect generator should produce items at 2x the normal rate
