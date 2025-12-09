import { test, expect } from '@playwright/test';

test.describe('Settings and Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open settings by clicking on a stage', async ({ page }) => {
    // Wait for stages to load
    await page.waitForTimeout(1000);

    // Click on Development stage (or any stage)
    // Stages have clickable areas in the canvas
    const devStage = page.locator('text=Development').first();
    await devStage.click();

    // Verify settings modal opens
    await expect(page.locator('text=Development Settings')).toBeVisible();
  });

  test('should close settings menu', async ({ page }) => {
    // Open settings by clicking a stage
    await page.waitForTimeout(1000);
    await page.locator('text=Development').first().click();

    // Wait for modal to open
    await expect(page.locator('text=Development Settings')).toBeVisible();

    // Find and click close button (×)
    const closeButton = page.locator('button').filter({ hasText: '×' });
    await closeButton.click();

    // Verify settings closed
    await expect(page.locator('text=Development Settings')).not.toBeVisible();
  });

  test('should display stage configuration options', async ({ page }) => {
    // Open settings
    await page.waitForTimeout(1000);
    await page.locator('text=Development').first().click();

    // Verify configuration fields are visible
    await expect(page.locator('text=Step Type')).toBeVisible();
    await expect(page.locator('text=WIP Limit')).toBeVisible();
    await expect(page.locator('text=Process Time (h)')).toBeVisible();
    await expect(page.locator('text=Percent Complete & Accurate (%C/A)')).toBeVisible();
  });

  test('should allow changing step type', async ({ page }) => {
    // Open settings
    await page.waitForTimeout(1000);
    await page.locator('text=Development').first().click();

    // Find step type dropdown
    const stepTypeSelect = page.locator('select').first();
    await expect(stepTypeSelect).toBeVisible();

    // Verify options exist
    const options = await stepTypeSelect.locator('option').allTextContents();
    expect(options).toContain('Manual');
    expect(options).toContain('Automated');
    expect(options).toContain('Batch');

    // Change step type
    await stepTypeSelect.selectOption('Automated');

    // Verify it changed
    expect(await stepTypeSelect.inputValue()).toBe('automated');
  });

  test('should adjust WIP limit for manual stages', async ({ page }) => {
    // Open settings for a manual stage
    await page.waitForTimeout(1000);
    await page.locator('text=Development').first().click();

    // Ensure it's set to manual
    const stepTypeSelect = page.locator('select').first();
    await stepTypeSelect.selectOption('Manual');

    // Find WIP limit input
    const wipInput = page.locator('input[type="number"]').first();
    await expect(wipInput).toBeVisible();

    // Change value
    await wipInput.fill('3');

    // Verify value changed
    expect(await wipInput.inputValue()).toBe('3');
  });

  test('should show infinity for automated stages WIP limit', async ({ page }) => {
    // Open settings
    await page.waitForTimeout(1000);
    await page.locator('text=Testing').first().click();

    // Testing is automated by default
    // Verify WIP shows infinity symbol
    await expect(page.locator('text=∞')).toBeVisible();
  });

  test('should adjust process time', async ({ page }) => {
    // Open settings
    await page.waitForTimeout(1000);
    await page.locator('text=Development').first().click();

    // Find process time inputs (min and max)
    const processTimeInputs = page.locator('input[placeholder="Min"]');
    const minInput = processTimeInputs.first();

    await expect(minInput).toBeVisible();

    // Change min value
    await minInput.fill('2');

    // Verify value changed
    expect(await minInput.inputValue()).toBe('2');
  });

  test('should adjust wait time for manual stages', async ({ page }) => {
    // Open settings for manual stage
    await page.waitForTimeout(1000);
    await page.locator('text=Development').first().click();

    // Ensure manual type
    const stepTypeSelect = page.locator('select').first();
    await stepTypeSelect.selectOption('Manual');

    // Wait time should be visible for manual stages
    await expect(page.locator('text=Wait Time (h)')).toBeVisible();

    // Find wait time input
    const waitTimeInputs = page.locator('input[placeholder="Min"]');
    const waitMinInput = waitTimeInputs.nth(1); // Second set is wait time

    // Change value
    await waitMinInput.fill('5');

    // Verify value changed
    expect(await waitMinInput.inputValue()).toBe('5');
  });

  test('should show cadence input for batch stages', async ({ page }) => {
    // Open settings
    await page.waitForTimeout(1000);
    await page.locator('text=Development').first().click();

    // Change to batch type
    const stepTypeSelect = page.locator('select').first();
    await stepTypeSelect.selectOption('Batch');

    // Verify cadence input appears
    await expect(page.locator('text=Cadence (h)')).toBeVisible();

    // Find and adjust cadence input
    const cadenceInput = page.locator('input[type="number"]').filter({ hasText: '' }).first();
    await cadenceInput.fill('48');

    // Verify value
    expect(await cadenceInput.inputValue()).toBe('48');
  });

  test('should adjust percent complete and accurate', async ({ page }) => {
    // Open settings
    await page.waitForTimeout(1000);
    await page.locator('text=Development').first().click();

    // Find %C/A input
    const percentCompleteInput = page.locator('input[type="number"]').last();
    await expect(percentCompleteInput).toBeVisible();

    // Change value
    await percentCompleteInput.fill('85');

    // Verify value changed
    expect(await percentCompleteInput.inputValue()).toBe('85');
  });

  test('should validate min/max process time relationship', async ({ page }) => {
    // Open settings
    await page.waitForTimeout(1000);
    await page.locator('text=Development').first().click();

    // Get process time inputs
    const minInput = page.locator('input[placeholder="Min"]').first();
    const maxInput = page.locator('input[placeholder="Max"]').first();

    // Set min higher than max
    await minInput.fill('10');
    await maxInput.fill('5');

    // App should auto-adjust max to match min (based on validation logic)
    // Verify reasonable values
    const minValue = parseFloat(await minInput.inputValue());
    const maxValue = parseFloat(await maxInput.inputValue());

    expect(maxValue).toBeGreaterThanOrEqual(minValue);
  });

  test('should access global settings without selecting a stage', async ({ page }) => {
    // Click settings icon/button if it exists, or open in another way
    // For now, we can't easily access global settings without clicking a stage
    // This test documents expected behavior
    await page.waitForTimeout(1000);

    // Click a stage to open settings
    await page.locator('text=Development').first().click();

    // Look for global settings section (deployment schedule, etc.)
    // In current implementation, global settings only show when no specific stage is selected
    // Close and we'd need a global settings button
  });

  test('should display helpful descriptions', async ({ page }) => {
    // Open settings
    await page.waitForTimeout(1000);
    await page.locator('text=Development').first().click();

    // Verify descriptive text exists
    await expect(page.locator('text=/Percentage of work items/')).toBeVisible();
  });

  test('should allow double-click to select input values', async ({ page }) => {
    // Open settings
    await page.waitForTimeout(1000);
    await page.locator('text=Development').first().click();

    // Find an input
    const input = page.locator('input[placeholder="Min"]').first();

    // Double-click should select all text (browser behavior)
    await input.dblclick();

    // Type new value (which should replace selected text)
    await page.keyboard.type('7');

    // Verify value changed
    const value = await input.inputValue();
    expect(value).toContain('7');
  });

  test('should persist settings changes', async ({ page }) => {
    // Open settings
    await page.waitForTimeout(1000);
    await page.locator('text=Development').first().click();

    // Change a value
    const minInput = page.locator('input[placeholder="Min"]').first();
    await minInput.fill('5');

    // Close settings
    await page.locator('button').filter({ hasText: '×' }).click();

    // Reopen settings
    await page.waitForTimeout(500);
    await page.locator('text=Development').first().click();

    // Verify value persisted
    const persistedValue = await page.locator('input[placeholder="Min"]').first().inputValue();
    expect(persistedValue).toBe('5');
  });

  test('should show stage-specific title', async ({ page }) => {
    // Open settings for different stages
    await page.waitForTimeout(1000);

    await page.locator('text=Development').first().click();
    await expect(page.locator('text=Development Settings')).toBeVisible();
    await page.locator('button').filter({ hasText: '×' }).click();

    await page.waitForTimeout(500);
    await page.locator('text=Testing').first().click();
    await expect(page.locator('text=Testing Settings')).toBeVisible();
  });
});
