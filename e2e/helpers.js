/**
 * Helper utilities for Playwright E2E tests
 */

/**
 * Find and click the play button to start simulation
 * @param {import('@playwright/test').Page} page
 */
export async function startSimulation(page) {
  const playButton = page.locator('button').filter({ has: page.locator('svg.lucide-play') });
  await playButton.click();
}

/**
 * Find and click the pause button to pause simulation
 * @param {import('@playwright/test').Page} page
 */
export async function pauseSimulation(page) {
  const pauseButton = page.locator('button').filter({ has: page.locator('svg.lucide-pause') });
  await pauseButton.click();
}

/**
 * Find and click the reset button to reset simulation
 * @param {import('@playwright/test').Page} page
 */
export async function resetSimulation(page) {
  const resetButton = page.locator('button').filter({ has: page.locator('svg.lucide-refresh-cw') });
  await resetButton.click();
}

/**
 * Add a specified number of work items manually
 * @param {import('@playwright/test').Page} page
 * @param {number} count - Number of items to add
 */
export async function addWorkItems(page, count = 1) {
  const addButton = page.locator('button').filter({ has: page.locator('svg.lucide-plus') });
  for (let i = 0; i < count; i++) {
    await addButton.click();
  }
}

/**
 * Toggle a specific constraint by name
 * @param {import('@playwright/test').Page} page
 * @param {string} constraintName - Name of constraint (e.g., 'Siloed Teams')
 */
export async function toggleConstraint(page, constraintName) {
  const button = page.locator('button').filter({ hasText: constraintName });
  await button.click();
}

/**
 * Open the settings menu
 * @param {import('@playwright/test').Page} page
 */
export async function openSettings(page) {
  const settingsButton = page.locator('button').filter({ has: page.locator('svg.lucide-settings') });
  await settingsButton.click();
}

/**
 * Close the settings menu
 * @param {import('@playwright/test').Page} page
 */
export async function closeSettings(page) {
  const closeButton = page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();
  await closeButton.click();
}

/**
 * Get the current WIP value
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<number>}
 */
export async function getWIP(page) {
  const wipText = await page.locator('text=/WIP: \\d+/').textContent();
  return parseInt(wipText.match(/\d+/)[0]);
}

/**
 * Get the current throughput value
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<number>}
 */
export async function getThroughput(page) {
  const throughputText = await page.locator('text=/Throughput: \\d+/').textContent();
  return parseInt(throughputText.match(/\d+/)[0]);
}

/**
 * Get the current cycle time value (returns string as it may be "N/A")
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<string>}
 */
export async function getCycleTime(page) {
  const cycleTimeText = await page.locator('text=/Cycle Time:.*$/').textContent();
  return cycleTimeText.replace('Cycle Time:', '').trim();
}

/**
 * Set the simulation speed
 * @param {import('@playwright/test').Page} page
 * @param {number} speed - Speed value (1-3)
 */
export async function setSpeed(page, speed) {
  const speedSlider = page.locator('input[type="range"]').first();
  await speedSlider.fill(speed.toString());
}

/**
 * Count items of a specific color
 * @param {import('@playwright/test').Page} page
 * @param {string} color - Color class (e.g., 'blue-500', 'red-500')
 * @returns {Promise<number>}
 */
export async function countItemsByColor(page, color) {
  const items = page.locator(`.bg-${color}.rounded-full`);
  return await items.count();
}

/**
 * Wait for items to reach a specific stage
 * @param {import('@playwright/test').Page} page
 * @param {string} stageName - Name of the stage
 * @param {number} timeout - Timeout in milliseconds
 */
export async function waitForItemsInStage(page, stageName, timeout = 10000) {
  await page.waitForTimeout(timeout);
  // This is a simple wait; more sophisticated checks could verify items in specific stage areas
}

/**
 * Check if a constraint is active
 * @param {import('@playwright/test').Page} page
 * @param {string} constraintName - Name of constraint
 * @returns {Promise<boolean>}
 */
export async function isConstraintActive(page, constraintName) {
  const button = page.locator('button').filter({ hasText: constraintName });
  const className = await button.getAttribute('class');
  return className.includes('bg-red-600');
}

/**
 * Verify all stages are visible
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').expect} expect
 */
export async function verifyAllStagesVisible(page, expect) {
  const stages = ['Intake', 'Backlog', 'Refining Work', 'Development', 'Code Review', 'Testing', 'Deploy', 'Production'];
  for (const stage of stages) {
    await expect(page.locator(`text=${stage}`).first()).toBeVisible();
  }
}

/**
 * Enable all constraints (for stress testing)
 * @param {import('@playwright/test').Page} page
 */
export async function enableAllConstraints(page) {
  const constraints = [
    'Siloed Teams',
    'Large Batches',
    'Unclear Requirements',
    'Coding Errors',
    'Manual Testing',
    'Manual Deployment',
    'Infrequent Deploys',
    'Too Many Features',
    'Unstable Production'
  ];

  for (const constraint of constraints) {
    await toggleConstraint(page, constraint);
  }
}

/**
 * Disable all constraints
 * @param {import('@playwright/test').Page} page
 */
export async function disableAllConstraints(page) {
  const constraints = [
    'Siloed Teams',
    'Large Batches',
    'Unclear Requirements',
    'Coding Errors',
    'Manual Testing',
    'Manual Deployment',
    'Infrequent Deploys',
    'Too Many Features',
    'Unstable Production'
  ];

  for (const constraint of constraints) {
    const isActive = await isConstraintActive(page, constraint);
    if (isActive) {
      await toggleConstraint(page, constraint);
    }
  }
}
