# E2E Tests for Value Stream Simulator

This directory contains end-to-end tests for the Value Stream Simulator application using Playwright.

## Test Structure

### Test Files

- **basic-simulation.spec.js** - Core simulation functionality tests
  - Application loading and initialization
  - Play/pause/reset controls
  - Adding work items
  - Speed control
  - Basic metrics display
  - Stage visibility

- **constraints.spec.js** - System constraint tests
  - All 9 constraint toggles
  - Constraint combinations
  - Constraint effects on flow
  - Deployment countdown (Infrequent Deploys)
  - Defect generation (Coding Errors)
  - Batch behavior (Large Batches)

- **settings.spec.js** - Configuration and settings tests
  - Opening/closing settings menu
  - Adjusting process times
  - Adjusting wait times
  - Configuring actors/parallelism
  - Deployment schedule configuration
  - Settings persistence

- **metrics.spec.js** - Metrics and analytics tests
  - WIP (Work in Progress) tracking
  - Throughput tracking
  - Cycle time calculation
  - Real-time metric updates
  - Stage-specific metrics
  - Metric reset functionality
  - Little's Law validation

- **rework-loops.spec.js** - Rework and defect handling tests
  - Defects returning from Testing to Development
  - Unclear requirements returning to Refining Work
  - Production defects (Unstable Production)
  - Visual differentiation (colors)
  - Multiple rework types
  - Stress testing with all constraints

### Helper Functions

**helpers.js** provides reusable utilities:
- `startSimulation()` - Start the simulation
- `pauseSimulation()` - Pause the simulation
- `resetSimulation()` - Reset the simulation
- `addWorkItems(count)` - Add work items
- `toggleConstraint(name)` - Toggle constraints
- `openSettings()` / `closeSettings()` - Settings menu
- `getWIP()` / `getThroughput()` / `getCycleTime()` - Get metrics
- `setSpeed(speed)` - Adjust simulation speed
- `countItemsByColor(color)` - Count colored items
- `enableAllConstraints()` / `disableAllConstraints()` - Bulk constraint management

## Running Tests

### Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers (if not already done)
npx playwright install chromium
```

### Run All Tests

```bash
npm run test:e2e
```

### Run Tests with UI Mode

```bash
npm run test:e2e:ui
```

This opens Playwright's interactive UI where you can:
- See tests as they run
- Inspect each step
- Debug failures
- Time travel through test execution

### Run Tests in Headed Mode

```bash
npm run test:e2e:headed
```

Watch tests run in a real browser window.

### Debug Tests

```bash
npm run test:e2e:debug
```

Opens Playwright Inspector for step-by-step debugging.

### Run Specific Test File

```bash
npx playwright test basic-simulation
npx playwright test constraints
npx playwright test settings
npx playwright test metrics
npx playwright test rework-loops
```

### Run Specific Test

```bash
npx playwright test -g "should load the application successfully"
```

## Test Configuration

Configuration is in `playwright.config.js`:

- **Browser**: Chromium (configurable for Firefox, WebKit)
- **Base URL**: http://localhost:5173
- **Timeout**: 30s per test
- **Retries**: 2 on CI, 0 locally
- **Web Server**: Automatically starts `npm run dev`
- **Reporters**: HTML report (generated after test run)

## Viewing Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## Writing New Tests

### Basic Test Template

```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Your test code here
  });
});
```

### Using Helpers

```javascript
import { test, expect } from '@playwright/test';
import { startSimulation, addWorkItems, getWIP } from './helpers';

test('should track WIP', async ({ page }) => {
  await page.goto('/');
  await addWorkItems(page, 5);
  await startSimulation(page);
  await page.waitForTimeout(1000);

  const wip = await getWIP(page);
  expect(wip).toBeGreaterThan(0);
});
```

## Best Practices

1. **Use helpers** - Reuse helper functions for common operations
2. **Wait appropriately** - Use `waitForTimeout()` for simulation time, `waitForSelector()` for DOM changes
3. **Check visibility** - Always verify elements are visible before interacting
4. **Test isolation** - Each test should be independent
5. **Descriptive names** - Use clear, descriptive test names
6. **Meaningful assertions** - Assert on actual behavior, not just presence

## Troubleshooting

### Tests timing out
- Increase timeout in test: `test.setTimeout(60000)`
- Check if dev server is starting correctly
- Verify no port conflicts (5173)

### Flaky tests
- Add appropriate waits for simulation time
- Use `waitForSelector()` instead of fixed timeouts where possible
- Check for race conditions

### Elements not found
- Verify selectors match current UI
- Check if elements are in shadow DOM
- Use Playwright Inspector to debug: `npm run test:e2e:debug`

## CI/CD Integration

Tests are configured for CI with:
- Automatic retries (2x)
- Single worker (no parallel execution)
- Screenshots on failure
- Trace on first retry

Example GitHub Actions:

```yaml
- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Coverage

Current test coverage includes:
- ✅ Basic simulation flow
- ✅ All 9 system constraints
- ✅ Settings and configuration
- ✅ Metrics (WIP, throughput, cycle time)
- ✅ Rework loops and defects
- ✅ Visual indicators (colors, stages)
- ✅ Play/pause/reset controls
- ✅ Speed adjustment
- ✅ Deployment countdown

## Future Enhancements

Potential additions:
- Visual regression testing
- Performance testing
- Accessibility testing
- Mobile/responsive testing
- Cross-browser testing (Firefox, Safari)
- API mocking for predictable scenarios
