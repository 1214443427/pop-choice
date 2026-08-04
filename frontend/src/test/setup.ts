import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Clean up the DOM after each test
afterEach(() => {
  cleanup();
});
