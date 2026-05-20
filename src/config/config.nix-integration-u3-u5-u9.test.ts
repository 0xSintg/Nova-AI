import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_GATEWAY_PORT,
  resolveConfigPathCandidate,
  resolveGatewayPort,
  resolveIsNixMode,
  resolveStateDir,
} from "./config.js";
import { withTempHome } from "./test-helpers.js";

vi.unmock("../version.js");

function envWith(overrides: Record<string, string | undefined>): NodeJS.ProcessEnv {
  // Hermetic env: don't inherit process.env because other tests may mutate it.
  return { ...overrides };
}

describe("Nix integration (U3, U5, U9)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("U3: isNixMode env var detection", () => {
    it("isNixMode is false when NOVA_AI_NIX_MODE is not set", () => {
      expect(resolveIsNixMode(envWith({ NOVA_AI_NIX_MODE: undefined }))).toBe(false);
    });

    it("isNixMode is false when NOVA_AI_NIX_MODE is empty", () => {
      expect(resolveIsNixMode(envWith({ NOVA_AI_NIX_MODE: "" }))).toBe(false);
    });

    it("isNixMode is false when NOVA_AI_NIX_MODE is not '1'", () => {
      expect(resolveIsNixMode(envWith({ NOVA_AI_NIX_MODE: "true" }))).toBe(false);
    });

    it("isNixMode is true when NOVA_AI_NIX_MODE=1", () => {
      expect(resolveIsNixMode(envWith({ NOVA_AI_NIX_MODE: "1" }))).toBe(true);
    });
  });

  describe("U5: CONFIG_PATH and STATE_DIR env var overrides", () => {
    it("STATE_DIR defaults to ~/.nova-ai when env not set", () => {
      expect(resolveStateDir(envWith({ NOVA_AI_STATE_DIR: undefined }))).toMatch(/\.nova-ai$/);
    });

    it("STATE_DIR respects NOVA_AI_STATE_DIR override", () => {
      expect(resolveStateDir(envWith({ NOVA_AI_STATE_DIR: "/custom/state/dir" }))).toBe(
        path.resolve("/custom/state/dir"),
      );
    });

    it("STATE_DIR respects NOVA_AI_HOME when state override is unset", () => {
      const customHome = path.join(path.sep, "custom", "home");
      expect(
        resolveStateDir(envWith({ NOVA_AI_HOME: customHome, NOVA_AI_STATE_DIR: undefined })),
      ).toBe(path.join(path.resolve(customHome), ".nova-ai"));
    });

    it("CONFIG_PATH defaults to NOVA_AI_HOME/.nova-ai/nova-ai.json", () => {
      const customHome = path.join(path.sep, "custom", "home");
      expect(
        resolveConfigPathCandidate(
          envWith({
            NOVA_AI_HOME: customHome,
            NOVA_AI_CONFIG_PATH: undefined,
            NOVA_AI_STATE_DIR: undefined,
          }),
        ),
      ).toBe(path.join(path.resolve(customHome), ".nova-ai", "nova-ai.json"));
    });

    it("CONFIG_PATH defaults to ~/.nova-ai/nova-ai.json when env not set", () => {
      expect(
        resolveConfigPathCandidate(
          envWith({ NOVA_AI_CONFIG_PATH: undefined, NOVA_AI_STATE_DIR: undefined }),
        ),
      ).toMatch(/\.nova-ai[\\/]nova-ai\.json$/);
    });

    it("CONFIG_PATH respects NOVA_AI_CONFIG_PATH override", () => {
      expect(
        resolveConfigPathCandidate(
          envWith({ NOVA_AI_CONFIG_PATH: "/nix/store/abc/nova-ai.json" }),
        ),
      ).toBe(path.resolve("/nix/store/abc/nova-ai.json"));
    });

    it("CONFIG_PATH expands ~ in NOVA_AI_CONFIG_PATH override", async () => {
      await withTempHome(async (home) => {
        expect(
          resolveConfigPathCandidate(
            envWith({ NOVA_AI_HOME: home, NOVA_AI_CONFIG_PATH: "~/.nova-ai/custom.json" }),
            () => home,
          ),
        ).toBe(path.join(home, ".nova-ai", "custom.json"));
      });
    });

    it("CONFIG_PATH uses STATE_DIR when only state dir is overridden", () => {
      expect(
        resolveConfigPathCandidate(
          envWith({ NOVA_AI_STATE_DIR: "/custom/state", NOVA_AI_TEST_FAST: "1" }),
          () => path.join(path.sep, "tmp", "nova-ai-config-home"),
        ),
      ).toBe(path.join(path.resolve("/custom/state"), "nova-ai.json"));
    });
  });

  describe("U6: gateway port resolution", () => {
    it("uses default when env and config are unset", () => {
      expect(resolveGatewayPort({}, envWith({ NOVA_AI_GATEWAY_PORT: undefined }))).toBe(
        DEFAULT_GATEWAY_PORT,
      );
    });

    it("prefers NOVA_AI_GATEWAY_PORT over config", () => {
      expect(
        resolveGatewayPort(
          { gateway: { port: 19002 } },
          envWith({ NOVA_AI_GATEWAY_PORT: "19001" }),
        ),
      ).toBe(19001);
    });

    it("falls back to config when env is invalid", () => {
      expect(
        resolveGatewayPort(
          { gateway: { port: 19003 } },
          envWith({ NOVA_AI_GATEWAY_PORT: "nope" }),
        ),
      ).toBe(19003);
    });
  });
});
