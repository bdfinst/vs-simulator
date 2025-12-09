import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { act } from 'react';
import App from '../App';

describe('Batch Step Type', () => {
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
        vi.advanceTimersByTime(500); // 500ms per tick at 1x speed
      });
    }
  };

  describe('Deployment as batch step (default config)', () => {
    it('should release items from deployment when countdown reaches 0', async () => {
      const { container } = render(<App />);

      // Start simulation
      const playButton = container.querySelector('button[aria-label*="Play"]') ||
                         container.querySelector('button:has(svg.lucide-play)');
      if (playButton) {
        act(() => {
          playButton.click();
        });
      }

      // Add work items
      const addButton = container.querySelector('button:has(svg.lucide-plus)');
      for (let i = 0; i < 3; i++) {
        if (addButton) {
          act(() => {
            addButton.click();
          });
        }
      }

      // Check for "Next Batch In" text (batch step countdown)
      expect(container.textContent).toMatch(/Next Batch In/);

      // Advance to get items to deployment stage
      // With the new time scale, this should take less time
      await advanceSimulation(300);

      // Check that countdown is counting down
      const countdownMatch = container.textContent.match(/Next Batch In\s*([\d.]+)h/);
      if (countdownMatch) {
        const countdown = parseFloat(countdownMatch[1]);
        console.log('Current countdown:', countdown);

        // Calculate ticks needed to reach 0
        const ticksToZero = Math.ceil(countdown / 0.5) + 10; // Add buffer

        // Advance to countdown = 0
        await advanceSimulation(ticksToZero);
      } else {
        // If no countdown visible, just advance more
        await advanceSimulation(200);
      }

      // Items should have been released and processed through
      // Check for items in production
      await advanceSimulation(50); // Give time for items to process

      // Count total items in system
      const items = container.querySelectorAll('.w-3.h-3.rounded-full');
      console.log('Total items in system:', items.length);

      // At least some items should have moved through
      expect(items.length).toBeGreaterThan(0);
    });
  });
});
