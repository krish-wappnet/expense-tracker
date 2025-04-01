import { vi } from 'vitest';

// Mock ResizeObserver with proper TypeScript signature
global.ResizeObserver = class ResizeObserver {
  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(_target: Element) {
    // Mock implementation (no-op)
  }

  unobserve(_target: Element) {
    // Mock implementation (no-op)
  }

  disconnect() {
    // Mock implementation (no-op)
  }
} as unknown as typeof ResizeObserver;

// Define the mock push function outside the mock for export
const mockPush = vi.fn();

// Suppress Vue Router warnings and mock useRouter
vi.mock('vue-router', async (importOriginal) => {
  const original = await importOriginal<typeof import('vue-router')>();
  return {
    ...original,
    useRouter: () => ({
      push: mockPush, // Use the exported mock
      currentRoute: { value: { path: '/' } }, // Optional: mock current route
    }),
    useRoute: () => ({ path: '/' }), // Optional: mock route
  };
});

export { mockPush }; // Export for test access