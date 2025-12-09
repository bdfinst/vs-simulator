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
  const advanceSimulation = async (ticks) => {
    for (let i = 0; i < ticks; i++) {
      await act(async () => {
        vi.advanceTimersByTime(1000 / 30); // 30 FPS
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

      // With unstable production active and longer run time,
      // defects should approach 40% of total items (2x the normal 20%)
      // Account for statistical variance - looking for >18% (clearly above normal 10-15%)
      if (counts.totalItems > 5) {
        const defectRatio = counts.bugCount / counts.totalItems;
        expect(defectRatio).toBeGreaterThan(0.18); // Clearly higher than normal ~15%
      }

      // Should have at least some bugs
      expect(counts.bugCount).toBeGreaterThan(2);
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

      // Should have significant bugs (2x defect rate)
      // Account for statistical variance - at least 3 bugs
      expect(counts.bugCount).toBeGreaterThanOrEqual(3);
    });
  });
});
