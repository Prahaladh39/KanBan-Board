import "@testing-library/jest-dom";
// src/setupTests.js
// vitest.setup.js
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
