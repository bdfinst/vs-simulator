import { test, expect } from '@playwright/test';

test.describe('Basic Simulation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the application successfully', async ({ page }) => {
    // Verify main heading
    await expect(page.locator('h1')).toContainText('Value Stream Simulator');

    // Verify simulation canvas is visible
    await expect(page.locator('text=Backlog').first()).toBeVisible();
  });

  test('should display all stages in correct order', async ({ page }) => {
    // Verify all stages are present
    const stages = ['Backlog', 'Refining Work', 'Development', 'Code Review', 'Testing', 'Deployment'];

    for (const stage of stages) {
      await expect(page.locator(`text=${stage}`).first()).toBeVisible();
    }
  });

  test('should start and pause simulation', async ({ page }) => {
    // Find and click pause button (simulation starts running by default)
    const pauseButton = page.locator('button').filter({ hasText: 'Pause' });
    await expect(pauseButton).toBeVisible();
    await pauseButton.click();

    // Wait a moment
    await page.waitForTimeout(500);

    // Verify resume button appears (simulation is paused)
    const resumeButton = page.locator('button').filter({ hasText: 'Resume' });
    await expect(resumeButton).toBeVisible();

    // Click resume
    await resumeButton.click();

    // Verify pause button appears again
    await expect(pauseButton).toBeVisible();
  });

  test('should display WIP metrics', async ({ page }) => {
    // Verify WIP counter is visible
    await expect(page.locator('text=Work In Progress (WIP)')).toBeVisible();

    // Wait for simulation to generate items (it's running by default)
    await page.waitForTimeout(3000);

    // Get WIP value - find the metric card and get the value
    const metricCard = page.locator('text=Work In Progress (WIP)').locator('..').locator('.text-2xl');
    const wipValue = parseInt(await metricCard.textContent());
    expect(wipValue).toBeGreaterThanOrEqual(0);
  });

  test('should display throughput metrics', async ({ page }) => {
    // Verify throughput label is visible
    await expect(page.locator('text=Avg. Cycle Time')).toBeVisible();
  });

  test('should reset simulation', async ({ page }) => {
    // Wait for some activity
    await page.waitForTimeout(2000);

    // Find and click reset button
    const resetButton = page.locator('button').filter({ hasText: 'Reset' });
    await expect(resetButton).toBeVisible();
    await resetButton.click();

    // Wait for reset
    await page.waitForTimeout(500);

    // Verify simulation is running again (pause button visible)
    await expect(page.locator('button').filter({ hasText: 'Pause' })).toBeVisible();
  });

  test('should adjust simulation speed', async ({ page }) => {
    // Find speed slider
    const speedSlider = page.locator('input[type="range"]').first();
    await expect(speedSlider).toBeVisible();

    // Get initial value
    const initialValue = await speedSlider.inputValue();

    // Adjust speed
    await speedSlider.fill('15');

    // Verify value changed
    const newValue = await speedSlider.inputValue();
    expect(newValue).not.toBe(initialValue);
  });

  test('should show items moving through stages', async ({ page }) => {
    // Wait for items to appear (simulation runs by default)
    await page.waitForTimeout(3000);

    // Verify items are visible (blue dots)
    const allItems = page.locator('.rounded-full.w-3.h-3');
    const itemCount = await allItems.count();
    expect(itemCount).toBeGreaterThan(0);
  });

  test('should display legend', async ({ page }) => {
    // Verify legend items are visible
    await expect(page.locator('text=Feature').first()).toBeVisible();
    await expect(page.locator('text=Defect').first()).toBeVisible();
    await expect(page.locator('text=Batch').first()).toBeVisible();
  });

  test('should handle continuous item spawning when playing', async ({ page }) => {
    // Simulation is running by default
    await page.waitForTimeout(5000);

    // Verify WIP increased (items were spawned)
    const metricCard = page.locator('text=Work In Progress (WIP)').locator('..').locator('.text-2xl');
    const wipValue = parseInt(await metricCard.textContent());
    expect(wipValue).toBeGreaterThan(0);
  });
});
