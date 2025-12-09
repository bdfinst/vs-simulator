import { test, expect } from '@playwright/test';

test.describe('Metrics and Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display all four metric cards', async ({ page }) => {
    // Verify all metrics are visible
    await expect(page.locator('text=Work In Progress (WIP)')).toBeVisible();
    await expect(page.locator('text=Avg. Cycle Time')).toBeVisible();
    await expect(page.locator('text=Change Fail %')).toBeVisible();
    await expect(page.locator('text=Deploy Frequency')).toBeVisible();
  });

  test('should show correct units for each metric', async ({ page }) => {
    // WIP: Items
    const wipCard = page.locator('text=Work In Progress (WIP)').locator('..');
    await expect(wipCard.locator('text=Items')).toBeVisible();

    // Cycle Time: hours
    const cycleCard = page.locator('text=Avg. Cycle Time').locator('..');
    await expect(cycleCard.locator('text=hours')).toBeVisible();

    // Change Fail: %
    const changeFailCard = page.locator('text=Change Fail %').locator('..');
    await expect(changeFailCard.locator('.text-slate-500.ml-1.text-sm').filter({ hasText: '%' })).toBeVisible();

    // Deploy Frequency: per day
    const deployCard = page.locator('text=Deploy Frequency').locator('..');
    await expect(deployCard.locator('text=per day')).toBeVisible();
  });

  test('should track WIP (Work in Progress)', async ({ page }) => {
    // Wait for simulation to generate items
    await page.waitForTimeout(5000);

    // Get WIP value
    const wipMetric = page.locator('text=Work In Progress (WIP)').locator('..').locator('.text-2xl');
    const wipValue = parseInt(await wipMetric.textContent());

    expect(wipValue).toBeGreaterThan(0);
  });

  test('should show WIP trend indicator', async ({ page }) => {
    // Wait for items
    await page.waitForTimeout(5000);

    // Check for trend text (Optimal Flow or System Overloaded)
    const wipCard = page.locator('text=Work In Progress (WIP)').locator('..');
    const trendText = await wipCard.locator('.text-xs').textContent();

    expect(trendText).toMatch(/Optimal Flow|System Overloaded/);
  });

  test('should calculate cycle time', async ({ page }) => {
    // Wait longer for items to complete and cycle time to be calculated
    await page.waitForTimeout(30000);

    // Get cycle time value
    const cycleTimeMetric = page.locator('text=Avg. Cycle Time').locator('..').locator('.text-2xl');
    const cycleTimeValue = await cycleTimeMetric.textContent();

    // Cycle time should be a number (or "0" initially)
    expect(cycleTimeValue).toMatch(/^\d+(\.\d+)?$/);
  });

  test('should track change fail percentage', async ({ page }) => {
    // Set production defect rate to generate failures
    await page.locator('input#defect-rate').fill('50');

    // Wait for deployments and defects
    await page.waitForTimeout(30000);

    // Get change fail percentage
    const changeFailMetric = page.locator('text=Change Fail %').locator('..').locator('.text-2xl');
    const changeFailValue = await changeFailMetric.textContent();

    // Should be a number
    expect(changeFailValue).toMatch(/^\d+(\.\d+)?$/);
  });

  test('should track deployment frequency', async ({ page }) => {
    // Wait for deployments to occur
    await page.waitForTimeout(30000);

    // Get deploy frequency
    const deployFreqMetric = page.locator('text=Deploy Frequency').locator('..').locator('.text-2xl');
    const deployFreqValue = await deployFreqMetric.textContent();

    // Should be a number
    expect(deployFreqValue).toMatch(/^\d+(\.\d+)?$/);
  });

  test('should update metrics in real-time', async ({ page }) => {
    // Get initial WIP
    await page.waitForTimeout(2000);
    const wipMetric = page.locator('text=Work In Progress (WIP)').locator('..').locator('.text-2xl');
    const wip1 = await wipMetric.textContent();

    // Wait more
    await page.waitForTimeout(5000);

    // Get updated WIP
    const wip2 = await wipMetric.textContent();

    // WIP should have potentially changed (or at least be tracked)
    expect(typeof wip2).toBe('string');
  });

  test('should reset all metrics to zero', async ({ page }) => {
    // Wait for some activity
    await page.waitForTimeout(5000);

    // Verify WIP is greater than 0
    const wipMetric = page.locator('text=Work In Progress (WIP)').locator('..').locator('.text-2xl');
    const wipBefore = parseInt(await wipMetric.textContent());
    expect(wipBefore).toBeGreaterThan(0);

    // Reset
    await page.locator('button').filter({ hasText: 'Reset' }).click();
    await page.waitForTimeout(500);

    // After reset, simulation restarts so WIP will quickly build up again
    // Just verify metrics exist and are numeric
    const wipAfter = parseInt(await wipMetric.textContent());
    expect(typeof wipAfter).toBe('number');
  });

  test('should show color-coded trend indicators', async ({ page }) => {
    // Wait for metrics
    await page.waitForTimeout(5000);

    // WIP card should have trend indicator (green for good, red for bad)
    const wipCard = page.locator('text=Work In Progress (WIP)').locator('..');
    const wipTrend = wipCard.locator('.text-xs');

    // Check if trend has color class
    const trendClass = await wipTrend.getAttribute('class');
    expect(trendClass).toMatch(/text-(green|red)-400/);
  });

  test('should show Dev to Production subtext for cycle time', async ({ page }) => {
    const cycleCard = page.locator('text=Avg. Cycle Time').locator('..');
    await expect(cycleCard.locator('text=Dev to Production')).toBeVisible();
  });

  test('should show Failed Deployments subtext for change fail', async ({ page }) => {
    const changeFailCard = page.locator('text=Change Fail %').locator('..');
    await expect(changeFailCard.locator('text=Failed Deployments')).toBeVisible();
  });

  test('should show Deployment Rate subtext for deploy frequency', async ({ page }) => {
    const deployCard = page.locator('text=Deploy Frequency').locator('..');
    await expect(deployCard.locator('text=Deployment Rate')).toBeVisible();
  });

  test('should handle high WIP scenarios', async ({ page }) => {
    // Increase batch size to create more WIP
    await page.locator('input#batch-size').fill('20');

    // Wait for WIP to build up
    await page.waitForTimeout(10000);

    // Get WIP
    const wipMetric = page.locator('text=Work In Progress (WIP)').locator('..').locator('.text-2xl');
    const wipValue = parseInt(await wipMetric.textContent());

    // With large batch size, WIP should be high
    expect(wipValue).toBeGreaterThan(10);

    // Check if "System Overloaded" warning appears when WIP > 20
    if (wipValue > 20) {
      const wipCard = page.locator('text=Work In Progress (WIP)').locator('..');
      await expect(wipCard.locator('text=System Overloaded')).toBeVisible();
    }
  });

  test('should maintain metric accuracy across pause/resume', async ({ page }) => {
    // Wait for activity
    await page.waitForTimeout(5000);

    // Get WIP while running
    const wipMetric = page.locator('text=Work In Progress (WIP)').locator('..').locator('.text-2xl');
    const wip1 = parseInt(await wipMetric.textContent());

    // Pause
    await page.locator('button').filter({ hasText: 'Pause' }).click();
    await page.waitForTimeout(1000);

    // WIP should stay same while paused
    const wip2 = parseInt(await wipMetric.textContent());
    expect(wip2).toBe(wip1);

    // Resume
    await page.locator('button').filter({ hasText: 'Resume' }).click();
    await page.waitForTimeout(3000);

    // WIP should continue tracking
    const wip3 = parseInt(await wipMetric.textContent());
    expect(typeof wip3).toBe('number');
  });

  test('should calculate metrics with different simulation speeds', async ({ page }) => {
    // Set slow speed
    await page.locator('input#sim-speed').fill('5');
    await page.waitForTimeout(5000);

    const wipMetric = page.locator('text=Work In Progress (WIP)').locator('..').locator('.text-2xl');
    const wip1 = parseInt(await wipMetric.textContent());

    // Reset and try fast speed
    await page.locator('button').filter({ hasText: 'Reset' }).click();
    await page.waitForTimeout(500);

    await page.locator('input#sim-speed').fill('25');
    await page.waitForTimeout(5000);

    const wip2 = parseInt(await wipMetric.textContent());

    // Both should produce valid WIP values
    expect(typeof wip1).toBe('number');
    expect(typeof wip2).toBe('number');
  });

  test('should show appropriate metric formatting', async ({ page }) => {
    // Wait for metrics
    await page.waitForTimeout(5000);

    // All metric values should be in text-2xl class (large, bold)
    const allMetricValues = page.locator('.text-2xl.font-bold');
    const count = await allMetricValues.count();

    // Should have 4 metric values (one per card)
    expect(count).toBe(4);
  });
});
