/** @vitest-environment jsdom */

import { describe, expect, it, beforeEach } from "vitest";
import reducer, { hydrateSession } from "./authSlice";
import { saveTokens } from "../../utils/tokenManager";

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  loading: false,
  resendLoading: false,
  termsAccepted: false,
  activeRole: null,
  error: null,
};

describe("authSlice", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("keeps the session alive when hydration hits a transient backend timeout", () => {
    saveTokens("access-token", "refresh-token");

    const nextState = reducer(
      {
        ...initialState,
        isAuthenticated: true,
        isLoading: false,
        user: null,
      },
      hydrateSession.rejected(
        new Error("Request timed out or was cancelled."),
        "hydrateSession",
        undefined,
        {
          message: "Session refresh timed out. Please try again.",
          keepSession: true,
        },
      ),
    );

    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.isLoading).toBe(false);
    expect(nextState.user).toBeNull();
    expect(nextState.error).toBeNull();
  });

  it("clears the session on a real invalid-token response", () => {
    saveTokens("access-token", "refresh-token");

    const nextState = reducer(
      {
        ...initialState,
        isAuthenticated: true,
        isLoading: false,
      },
      hydrateSession.rejected(
        new Error("Session expired."),
        "hydrateSession",
        undefined,
        "Session expired.",
      ),
    );

    expect(nextState.isAuthenticated).toBe(false);
    expect(nextState.user).toBeNull();
    expect(nextState.error).toBe("Session expired.");
  });
});
