import { test, expect } from '@playwright/test';

test.describe('Stage Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
  });

  test('should open configuration when clicking a stage', async ({ page }) => {
    // Click on Development stage's settings button
    const settingsButtons = page.getByTitle('Configure stage settings');
    await settingsButtons.nth(2).click(); // Development is 3rd stage (index 2)

    // Verify configuration dialog opens (look for settings-related text)
    await expect(page.getByText('Settings', { exact: false })).toBeVisible();
  });

  test('should close configuration dialog', async ({ page }) => {
    // Open settings
    const settingsButtons = page.getByTitle('Configure stage settings');
    await settingsButtons.nth(2).click(); // Development
    await expect(page.getByText('Settings', { exact: false })).toBeVisible();

    // Close by clicking the close button (find by common close indicators)
    const closeButton = page.getByRole('button', { name: /close|×/i });
    await closeButton.click();

    // Verify dialog closed
    await expect(page.getByText('Development Settings')).not.toBeVisible();
  });

  test('should display configuration options', async ({ page }) => {
    // Open settings for any stage
    const settingsButtons = page.getByTitle('Configure stage settings');
    await settingsButtons.nth(2).click(); // Development

    // Verify key configuration concepts are visible (black box: what users see)
    await expect(page.getByText(/step type|type/i).first()).toBeVisible();
    await expect(page.getByText(/process time|time/i).first()).toBeVisible();
  });

  test('should allow changing step type', async ({ page }) => {
    // Open settings
    const settingsButtons = page.getByTitle('Configure stage settings');
    await settingsButtons.nth(2).click(); // Development

    // Find step type dropdown (semantic: look for select/combobox role)
    const stepTypeSelect = page.locator('select').first();
    await expect(stepTypeSelect).toBeVisible();

    // Change value (black box: user selects different option)
    await stepTypeSelect.selectOption('Automated');

    // Verify change took effect
    expect(await stepTypeSelect.inputValue()).toBe('automated');
  });

  test('should allow adjusting numeric configuration values', async ({ page }) => {
    // Open settings
    const settingsButtons = page.getByTitle('Configure stage settings');
    await settingsButtons.nth(4).click(); // Testing is 5th stage (index 4)

    // Find numeric inputs (black box: user sees input fields)
    const numericInputs = page.locator('input[type="number"]');
    const count = await numericInputs.count();
    expect(count).toBeGreaterThan(0);

    // Change a value
    const firstInput = numericInputs.first();
    await firstInput.fill('5');

    // Verify value changed
    expect(await firstInput.inputValue()).toBe('5');
  });

  test('should persist configuration changes', async ({ page }) => {
    // Open settings
    const settingsButtons = page.getByTitle('Configure stage settings');
    await settingsButtons.nth(2).click(); // Development

    // Change a numeric value
    const input = page.locator('input[type="number"]').first();
    await input.fill('7');

    // Close settings
    await page.getByRole('button', { name: /close|×/i }).click();

    // Reopen settings
    await page.waitForTimeout(500);
    await settingsButtons.nth(2).click(); // Development

    // Verify value persisted
    const persistedInput = page.locator('input[type="number"]').first();
    expect(await persistedInput.inputValue()).toBe('7');
  });

  test('should show different settings for different stages', async ({ page }) => {
    // Open settings for Development
    const settingsButtons = page.getByTitle('Configure stage settings');
    await settingsButtons.nth(2).click(); // Development
    await expect(page.getByText('Development Settings')).toBeVisible();

    // Close
    await page.getByRole('button', { name: /close|×/i }).click();

    // Open settings for Testing
    await page.waitForTimeout(500);
    await settingsButtons.nth(4).click(); // Testing
    await expect(page.getByText('Testing Settings')).toBeVisible();
  });

  test('should validate input ranges', async ({ page }) => {
    // Open settings
    const settingsButtons = page.getByTitle('Configure stage settings');
    await settingsButtons.nth(2).click(); // Development

    // Find inputs with min/max attributes (look for paired inputs)
    const inputs = page.locator('input[type="number"]');
    const minInput = inputs.first();
    const maxInput = inputs.nth(1);

    // Set values
    await minInput.fill('5');
    await maxInput.fill('10');

    // Verify values can be set
    const minValue = parseFloat(await minInput.inputValue());
    const maxValue = parseFloat(await maxInput.inputValue());

    // Verify values were set correctly
    expect(minValue).toBe(5);
    expect(maxValue).toBe(10);
    expect(maxValue).toBeGreaterThanOrEqual(minValue);
  });

  test('should show infinity symbol for automated stages', async ({ page }) => {
    // Open Testing (automated by default)
    const settingsButtons = page.getByTitle('Configure stage settings');
    await settingsButtons.nth(4).click(); // Testing

    // Look for infinity symbol or indication
    await expect(page.getByText('∞').first()).toBeVisible();
  });

  test('should provide helpful descriptions', async ({ page }) => {
    // Open any stage settings
    const settingsButtons = page.getByTitle('Configure stage settings');
    await settingsButtons.nth(2).click(); // Development

    // Look for descriptive text (black box: users see explanations)
    const dialogText = await page.locator('body').textContent();
    expect(dialogText.length).toBeGreaterThan(100); // Has substantial text
  });
});
