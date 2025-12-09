# Black Box Testing Approach

## Philosophy

These E2E tests follow **black box testing** principles:
- Tests focus on **WHAT** the application does, not **HOW** it's implemented
- Tests use **semantic locators** (roles, labels, accessible names)
- Tests verify **observable behavior** from a user's perspective
- Tests are **loosely coupled** to implementation details

## Key Principles

### 1. Use Semantic Locators

❌ **Avoid**: Implementation-dependent selectors
```javascript
// BAD: Tightly coupled to CSS classes
page.locator('.bg-slate-800.border.border-slate-700')
page.locator('#batch-size')
page.locator('.text-2xl.font-bold.text-white')
```

✅ **Use**: Semantic, accessible locators
```javascript
// GOOD: User-facing, implementation-independent
page.getByRole('button', { name: /pause/i })
page.getByLabel('Batch Size')
page.getByText('Work In Progress')
```

### 2. Test Observable Behavior

❌ **Avoid**: Testing internal state or structure
```javascript
// BAD: Checking internal DOM structure
expect(button).toHaveClass('bg-red-600')
expect(item.stageIndex).toBe(3)
```

✅ **Use**: Verify user-observable outcomes
```javascript
// GOOD: Verify what users see/experience
await expect(page.getByRole('button', { name: /resume/i })).toBeVisible()
await expect(page.getByText('Work In Progress')).toContainText(/\d+/)
```

### 3. Focus on User Actions

❌ **Avoid**: Simulating implementation details
```javascript
// BAD: Testing via internal mechanisms
await page.evaluate(() => window.store.dispatch({ type: 'PAUSE' }))
```

✅ **Use**: Simulate actual user interactions
```javascript
// GOOD: Do what users do
await page.getByRole('button', { name: /pause/i }).click()
await page.getByLabel('Simulation Speed').fill('20')
```

### 4. Verify User-Facing Labels

❌ **Avoid**: Hard-coding implementation text
```javascript
// BAD: Assumes exact wording/casing
await expect(page.locator('text=WIP:')).toBeVisible()
```

✅ **Use**: Flexible, meaningful text matching
```javascript
// GOOD: Matches user-facing concepts
await expect(page.getByText('Work In Progress', { exact: false })).toBeVisible()
await expect(page.getByText(/work.*progress/i)).toBeVisible()
```

## Refactored Test Structure

### Before: Tightly Coupled
```javascript
test('should display WIP metrics', async ({ page }) => {
  const wipCard = page.locator('.text-2xl.font-bold').first();
  const wipValue = parseInt(await wipCard.textContent());
  expect(wipValue).toBeGreaterThan(0);
});
```

### After: Loosely Coupled
```javascript
test('should display work in progress metric', async ({ page }) => {
  // Find by user-facing label
  await expect(page.getByText('Work In Progress', { exact: false })).toBeVisible();

  // Verify numeric value is shown
  const wipArea = page.getByText('Work In Progress').locator('..');
  await expect(wipArea).toContainText(/\d+/);
});
```

## Benefits of Black Box Testing

### 1. **Resilience to Refactoring**
- Tests survive CSS class changes
- Tests survive layout restructuring
- Tests survive component refactoring

### 2. **Focus on User Value**
- Tests verify features users care about
- Tests check actual user workflows
- Tests validate user-facing labels and messages

### 3. **Maintainability**
- Less brittle tests
- Fewer false failures
- Easier to understand test intent

### 4. **Documentation Value**
- Tests serve as behavior documentation
- Tests show how users interact with app
- Tests clarify expected outcomes

## Playwright Locator Priority

Use Playwright's recommended locator priority:

1. **Role-based** (highest priority)
   ```javascript
   page.getByRole('button', { name: 'Pause' })
   page.getByRole('heading', { name: /simulator/i })
   ```

2. **Label-based** (for form controls)
   ```javascript
   page.getByLabel('Batch Size')
   page.getByLabel('Production Defects')
   ```

3. **Text-based** (for content)
   ```javascript
   page.getByText('Work In Progress')
   page.getByText(/cycle time/i)
   ```

4. **Test ID** (when semantic locators insufficient)
   ```javascript
   page.getByTestId('simulation-canvas')
   ```

5. **CSS/XPath** (last resort only)
   ```javascript
   // Only when no semantic alternative exists
   page.locator('[data-special-attribute]')
   ```

## Test Organization

### Test Suites by Feature Area

Each test file focuses on **user-facing features**:

- **basic-simulation.spec.js**: Core user workflows (pause, resume, reset)
- **controls.spec.js**: Interactive controls users manipulate
- **settings.spec.js**: Configuration workflows
- **metrics.spec.js**: Information displayed to users

### Test Names Describe Behavior

Test names use **should + observable behavior**:

```javascript
✅ test('should pause and resume simulation')
✅ test('should adjust batch size')
✅ test('should display work in progress metric')

❌ test('should update isRunning state')
❌ test('should call setBatchSize()')
❌ test('should render MetricCard component')
```

## Implementation-Independence Examples

### Example 1: Control Buttons

❌ **Coupled to Implementation**:
```javascript
const pauseButton = page.locator('.bg-amber-600.hover\\:bg-amber-700');
await pauseButton.click();
```

✅ **Implementation-Independent**:
```javascript
await page.getByRole('button', { name: /pause/i }).click();
```

### Example 2: Metrics

❌ **Coupled to Implementation**:
```javascript
const wipValue = await page.locator('.text-2xl.font-bold.text-white').first().textContent();
```

✅ **Implementation-Independent**:
```javascript
const wipArea = page.getByText('Work In Progress').locator('..');
const wipValue = (await wipArea.textContent()).match(/(\d+)/)?.[1];
```

### Example 3: Form Controls

❌ **Coupled to Implementation**:
```javascript
await page.locator('input#batch-size').fill('10');
```

✅ **Implementation-Independent**:
```javascript
await page.getByLabel('Batch Size').fill('10');
```

## When to Add Test IDs

Consider adding `data-testid` attributes when:

1. **No semantic locator exists**
   - Complex widgets without clear ARIA roles
   - Canvas elements or visualizations
   - Custom components

2. **Multiple identical elements**
   - When `nth()` or `.first()` would be fragile
   - Dynamic lists with changing order

3. **Performance-critical selectors**
   - Very complex DOM queries
   - Frequently-used selectors

Example:
```jsx
// In application code (only when necessary)
<div data-testid="simulation-canvas">
  {/* Canvas content */}
</div>
```

```javascript
// In tests (when semantic locators insufficient)
const canvas = page.getByTestId('simulation-canvas');
```

## Testing User Workflows

Tests should follow actual user journeys:

```javascript
test('user workflow: adjust settings and observe impact', async ({ page }) => {
  // User sees initial state
  await expect(page.getByText('Work In Progress')).toBeVisible();

  // User opens settings
  await page.getByText('Development').first().click();

  // User changes configuration
  await page.locator('select').first().selectOption('Automated');

  // User closes settings
  await page.getByRole('button', { name: /close/i }).click();

  // User observes changed behavior
  await page.waitForTimeout(3000);
  await expect(page.getByText('Work In Progress').locator('..')).toContainText(/\d+/);
});
```

## Summary

**Black box testing** makes tests:
- ✅ More resilient to code changes
- ✅ Focused on user value
- ✅ Easier to maintain
- ✅ Better documentation
- ✅ Independent of implementation

**Key takeaway**: Test what users **see and do**, not how the code **works internally**.
