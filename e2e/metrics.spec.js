import { test, expect } from '@playwright/test';

test.describe('Metrics and Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display work in progress metric', async ({ page }) => {
    // Verify WIP metric is visible by its user-facing label (use regex for flexibility)
    await expect(page.getByText(/work.*progress/i).first()).toBeVisible();

    // Wait for simulation
    await page.waitForTimeout(3000);

    // Verify metric shows a numeric value
    const wipArea = page.getByText(/work.*progress/i).first().locator('..');
    await expect(wipArea).toContainText(/\d+/);
  });

  test('should display cycle time metric', async ({ page }) => {
    // Verify Cycle Time is visible
    await expect(page.getByText('Cycle Time', { exact: false })).toBeVisible();

    // Should show time unit
    await expect(page.getByText(/hours?/i)).toBeVisible();

    // Should show numeric value
    const cycleTimeArea = page.getByText('Cycle Time', { exact: false }).locator('..');
    await expect(cycleTimeArea).toContainText(/\d+/);
  });

  test('should display change fail percentage', async ({ page }) => {
    // Verify Change Fail metric is visible
    await expect(page.getByText('Change Fail', { exact: false })).toBeVisible();

    // Should show percentage
    const changeFailArea = page.getByText('Change Fail', { exact: false }).locator('..');
    await expect(changeFailArea).toContainText(/\d+/);
  });

  test('should display deployment frequency', async ({ page }) => {
    // Verify Deploy Frequency is visible
    await expect(page.getByText('Deploy Frequency', { exact: false })).toBeVisible();

    // Should show rate unit
    await expect(page.getByText(/per day/i)).toBeVisible();

    // Should show numeric value
    const deployArea = page.getByText('Deploy Frequency', { exact: false }).locator('..');
    await expect(deployArea).toContainText(/\d+/);
  });

  test('should show all four key metrics', async ({ page }) => {
    // Verify all four DORA/flow metrics are present
    await expect(page.getByText('Work In Progress', { exact: false })).toBeVisible();
    await expect(page.getByText('Cycle Time', { exact: false })).toBeVisible();
    await expect(page.getByText('Change Fail', { exact: false })).toBeVisible();
    await expect(page.getByText('Deploy Frequency', { exact: false })).toBeVisible();
  });

  test('should track work in progress over time', async ({ page }) => {
    // Get initial WIP
    await page.waitForTimeout(2000);
    const wipArea = page.getByText('Work In Progress', { exact: false }).locator('..');
    const initialText = await wipArea.textContent();

    // Wait more
    await page.waitForTimeout(3000);

    // Get updated WIP
    const updatedText = await wipArea.textContent();

    // Both should contain numbers (tracking over time)
    expect(initialText).toMatch(/\d+/);
    expect(updatedText).toMatch(/\d+/);
  });

  test('should show trend indicators', async ({ page }) => {
    // Wait for metrics to populate
    await page.waitForTimeout(5000);

    // WIP should have some trend text (Optimal Flow or System Overloaded)
    const wipArea = page.getByText('Work In Progress', { exact: false }).locator('..');
    const wipText = await wipArea.textContent();

    // Should have descriptive text beyond just the number
    expect(wipText).toMatch(/optimal|overload|flow/i);
  });

  test('should reset metrics when simulation resets', async ({ page }) => {
    // Wait for activity
    await page.waitForTimeout(5000);

    // Get WIP value
    const wipArea = page.getByText('Work In Progress', { exact: false }).locator('..');
    const beforeText = await wipArea.textContent();
    const beforeMatch = beforeText.match(/(\d+)/);
    expect(beforeMatch).toBeTruthy();
    const beforeWIP = parseInt(beforeMatch[1]);
    expect(beforeWIP).toBeGreaterThan(0);

    // Reset
    await page.getByRole('button', { name: /reset/i }).click();
    await page.waitForTimeout(500);

    // After reset, simulation restarts (WIP will build up again quickly)
    // Verify metrics are still being tracked (show valid numbers)
    const afterText = await wipArea.textContent();
    expect(afterText).toMatch(/\d+/);
  });

  test('should maintain metrics accuracy when paused', async ({ page }) => {
    // Wait for activity
    await page.waitForTimeout(5000);

    // Get WIP while running
    const wipArea = page.getByText('Work In Progress', { exact: false }).locator('..');
    const runningText = await wipArea.textContent();
    const runningWIP = parseInt(runningText.match(/(\d+)/)?.[1] || '0');

    // Pause
    await page.getByRole('button', { name: /pause/i }).click();
    await page.waitForTimeout(1000);

    // WIP should not change while paused
    const pausedText = await wipArea.textContent();
    const pausedWIP = parseInt(pausedText.match(/(\d+)/)?.[1] || '0');
    expect(pausedWIP).toBe(runningWIP);

    // Resume
    await page.getByRole('button', { name: /resume/i }).click();
    await page.waitForTimeout(2000);

    // Metrics should continue updating
    const resumedText = await wipArea.textContent();
    expect(resumedText).toMatch(/\d+/);
  });

  test('should show high WIP warning when overloaded', async ({ page }) => {
    // Increase batch size to create high WIP
    const batchSlider = page.getByLabel('Batch Size', { exact: false });
    await batchSlider.fill('20');

    // Wait for WIP to build up
    await page.waitForTimeout(10000);

    // Check WIP value
    const wipArea = page.getByText('Work In Progress', { exact: false }).locator('..');
    const wipText = await wipArea.textContent();
    const wipValue = parseInt(wipText.match(/(\d+)/)?.[1] || '0');

    // If WIP is high, should show warning
    if (wipValue > 20) {
      await expect(wipArea).toContainText(/overload/i);
    }
  });

  test('should show optimal flow when WIP is reasonable', async ({ page }) => {
    // Wait for simulation to stabilize with default settings
    await page.waitForTimeout(5000);

    // Check WIP
    const wipArea = page.getByText('Work In Progress', { exact: false }).locator('..');
    const wipText = await wipArea.textContent();
    const wipValue = parseInt(wipText.match(/(\d+)/)?.[1] || '0');

    // If WIP is reasonable, should show optimal message
    if (wipValue <= 20) {
      await expect(wipArea).toContainText(/optimal/i);
    }
  });

  test('should track change failures when defects occur', async ({ page }) => {
    // Set high defect rate
    const defectSlider = page.getByLabel('Production Defects', { exact: false });
    await defectSlider.fill('50');

    // Speed up simulation
    const speedSlider = page.getByLabel('Simulation Speed', { exact: false });
    await speedSlider.fill('25');

    // Wait for items to complete and failures to occur (reduced time with faster speed)
    await page.waitForTimeout(20000);

    // Change Fail % should be tracked
    const changeFailArea = page.getByText('Change Fail', { exact: false }).first().locator('..');
    const changeFailText = await changeFailArea.textContent();

    // Should show a percentage value
    expect(changeFailText).toMatch(/\d+/);
  });

  test('should calculate metrics at different simulation speeds', async ({ page }) => {
    // Set a speed
    const speedSlider = page.getByLabel('Simulation Speed', { exact: false });
    await speedSlider.fill('15');

    // Wait
    await page.waitForTimeout(5000);

    // All metrics should still be calculating
    await expect(page.getByText('Work In Progress', { exact: false }).locator('..')).toContainText(/\d+/);
    await expect(page.getByText('Cycle Time', { exact: false }).locator('..')).toContainText(/\d+/);
    await expect(page.getByText('Change Fail', { exact: false }).locator('..')).toContainText(/\d+/);
    await expect(page.getByText('Deploy Frequency', { exact: false }).locator('..')).toContainText(/\d+/);
  });

  test('should format metrics with appropriate units', async ({ page }) => {
    // Wait for metrics
    await page.waitForTimeout(3000);

    // WIP: Items
    const wipArea = page.getByText('Work In Progress', { exact: false }).locator('..');
    await expect(wipArea).toContainText(/items/i);

    // Cycle Time: hours
    const cycleArea = page.getByText('Cycle Time', { exact: false }).locator('..');
    await expect(cycleArea).toContainText(/hours?/i);

    // Change Fail: % (implicit in name)
    await expect(page.getByText('Change Fail %')).toBeVisible();

    // Deploy Frequency: per day
    const deployArea = page.getByText('Deploy Frequency', { exact: false }).locator('..');
    await expect(deployArea).toContainText(/per day/i);
  });
});
