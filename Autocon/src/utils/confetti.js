import confetti from 'canvas-confetti';

/**
 * fireConfetti — Triggers a celebration confetti burst.
 * Used after successful contract deployments.
 */
export function fireConfetti() {
  // First burst — center
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899'],
    ticks: 200,
    gravity: 1.2,
    scalar: 1.1
  });

  // Second burst — left side (delayed)
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ['#06b6d4', '#8b5cf6', '#22d3ee']
    });
  }, 200);

  // Third burst — right side (delayed)
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#a78bfa']
    });
  }, 400);
}
