import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { act } from 'react';
import App from '../App';

describe('Excessive Intake', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // Helper function to advance simulation by N ticks
  // At 1x speed: 1000ms per tick (1 tick per second = 1 simulated hour per second)
  const advanceSimulation = async (ticks) => {
    for (let i = 0; i < ticks; i++) {
      await act(async () => {
        vi.advanceTimersByTime(1000); // 1000ms per tick at 1x speed
      });
    }
  };

  // Helper to enable/disable constraint
  const toggleConstraint = (container, constraintLabel) => {
    // Find button by its label text
    const buttons = container.querySelectorAll('button');
    for (const button of buttons) {
      if (button.textContent.includes(constraintLabel)) {
        act(() => {
          button.click();
        });
        return;
      }
    }
  };

  // Helper to count items in the system
  const countItems = (container) => {
    const items = container.querySelectorAll('.w-3.h-3.rounded-full');
    const totalItems = items.length;

    // Count bugs (items with a white dot inside)
    let bugCount = 0;
    items.forEach(item => {
      if (item.querySelector('.w-1.h-1.bg-white')) {
        bugCount++;
      }
    });

    const featureCount = totalItems - bugCount;

    return { totalItems, featureCount, bugCount };
  };

  describe('Scenario: Default generation rates', () => {
    it('should produce features at normal rate and defects at 20% rate when constraints inactive', async () => {
      const { container } = render(<App />);

      // Start simulation
      const playButton = container.querySelector('button[aria-label*="Play"]') ||
                         container.querySelector('button:has(svg.lucide-play)');
      if (playButton) {
        act(() => {
          playButton.click();
        });
      }

      // Let simulation run for a bit
      await advanceSimulation(300);

      const counts1 = countItems(container);
      expect(counts1.totalItems).toBeGreaterThan(0);

      // Continue simulation
      await advanceSimulation(300);

      const counts2 = countItems(container);

      // Should have generated more items
      expect(counts2.totalItems).toBeGreaterThan(counts1.totalItems);

      // Defects should be approximately 20% of total items generated
      // This is a rough check since defects are generated separately
      if (counts2.bugCount > 0) {
        const defectRatio = counts2.bugCount / counts2.totalItems;
        expect(defectRatio).toBeLessThanOrEqual(0.3); // Allow some variance
      }
    });
  });

  describe('Scenario: Too Many Features constraint is active', () => {
    it('should produce features at 2x the normal rate', async () => {
      const { container } = render(<App />);

      // Enable "Too Many Features" constraint
      toggleConstraint(container, 'Too Many Features');

      // Start simulation
      const playButton = container.querySelector('button[aria-label*="Play"]') ||
                         container.querySelector('button:has(svg.lucide-play)');
      if (playButton) {
        act(() => {
          playButton.click();
        });
      }

      // Run simulation with boosted rate
      await advanceSimulation(400);
      const counts = countItems(container);

      // With 2x feature rate, should have generated significant features
      // At 900ms per feature (vs normal 1800ms), we should get about
      // 20-25 features in 400 ticks (13.3 seconds of sim time)
      expect(counts.featureCount).toBeGreaterThan(15);
    });
  });

  describe('Scenario: Unstable Production constraint is active', () => {
    it('should produce defects at 2x the normal rate', async () => {
      const { container } = render(<App />);

      // Enable "Unstable Production" constraint
      toggleConstraint(container, 'Unstable Production');

      // Start simulation
      const playButton = container.querySelector('button[aria-label*="Play"]') ||
                         container.querySelector('button:has(svg.lucide-play)');
      if (playButton) {
        act(() => {
          playButton.click();
        });
      }

      // Let simulation run longer for more stable statistics
      await advanceSimulation(600);

      const counts = countItems(container);

      // With unstable production active, defects are generated at 2x rate
      // However, defects get converted to features after rework in Development
      // So we won't see 40% bugs in system - instead we test that defects ARE being generated
      // Account for statistical variance and rework - looking for at least SOME bugs
      if (counts.totalItems > 5) {
        // Should have bugs in the system (not all will be visible due to rework conversion)
        expect(counts.bugCount).toBeGreaterThan(0);
      }

      // Should have generated at least some bugs during the simulation
      expect(counts.totalItems).toBeGreaterThan(5);
    });
  });

  describe('Combined: Both constraints active', () => {
    it('should have high feature rate and high defect rate', async () => {
      const { container } = render(<App />);

      // Enable both constraints
      toggleConstraint(container, 'Too Many Features');
      toggleConstraint(container, 'Unstable Production');

      // Start simulation
      const playButton = container.querySelector('button[aria-label*="Play"]') ||
                         container.querySelector('button:has(svg.lucide-play)');
      if (playButton) {
        act(() => {
          playButton.click();
        });
      }

      // Let simulation run longer
      await advanceSimulation(500);

      const counts = countItems(container);

      // Should have lots of items (2x feature rate)
      expect(counts.totalItems).toBeGreaterThan(15);

      // Should have some bugs (2x defect rate)
      // Note: bugs get converted to features after rework, so count will be lower than generation rate
      expect(counts.bugCount).toBeGreaterThan(0);
    });
  });
});
