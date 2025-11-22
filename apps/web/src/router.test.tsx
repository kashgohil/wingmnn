import { describe, expect, it } from "vitest";
import { getRouter } from "./router";

/**
 * Router Integration Tests
 *
 * Tests to verify AuthProvider is properly integrated into the router
 * Requirements: 4.1, 7.4, 7.5
 */

describe("Router with AuthProvider Integration", () => {
  it("should have Wrap component configured", () => {
    const router = getRouter();

    // Verify the router has the Wrap component configured
    // This Wrap component contains both TanStack Query Provider and AuthProvider
    expect(router.options.Wrap).toBeDefined();
    expect(typeof router.options.Wrap).toBe("function");
  });

  it("should have correct router configuration", () => {
    const router = getRouter();

    // Verify router has the expected configuration
    expect(router.options.defaultPreload).toBe("intent");
    expect(router.options.scrollRestoration).toBe(true);
    expect(router.options.scrollRestorationBehavior).toBe("instant");
  });

  it("should have context configured", () => {
    const router = getRouter();

    // Verify router has context (from TanStack Query)
    expect(router.options.context).toBeDefined();
  });
});
