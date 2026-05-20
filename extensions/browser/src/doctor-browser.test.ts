import { describe, expect, it, vi } from "vitest";
import {
  maybeArchiveLegacyNovaBrowserProfileResidue,
  noteChromeMcpBrowserReadiness,
} from "./doctor-browser.js";

function requireFirstNoteText(noteFn: ReturnType<typeof vi.fn>): string {
  const [call] = noteFn.mock.calls;
  if (!call) {
    throw new Error("expected browser doctor note");
  }
  const [message] = call;
  return String(message);
}

describe("browser doctor readiness", () => {
  it("does nothing when Chrome MCP is not configured", async () => {
    const noteFn = vi.fn();
    await noteChromeMcpBrowserReadiness(
      {
        browser: {
          profiles: {
            nova-ai: { color: "#FF4500" },
          },
        },
      },
      {
        noteFn,
        platform: "linux",
        env: { DISPLAY: ":99" },
        getUid: () => 1000,
        resolveManagedExecutable: () => ({ kind: "chrome", path: "/usr/bin/google-chrome" }),
      },
    );
    expect(noteFn).not.toHaveBeenCalled();
  });

  it("warns when managed browser profiles have no local executable", async () => {
    const noteFn = vi.fn();
    await noteChromeMcpBrowserReadiness(
      {
        browser: {
          profiles: {
            nova-ai: { color: "#FF4500" },
          },
        },
      },
      {
        noteFn,
        platform: "linux",
        env: { DISPLAY: ":99" },
        getUid: () => 1000,
        resolveManagedExecutable: () => null,
      },
    );

    expect(noteFn).toHaveBeenCalledWith(
      [
        "- Nova AI-managed browser profile(s) are configured: nova-ai.",
        "- No Chromium-based browser executable was found on this host for Nova AI-managed launch.",
        "- Install Chrome, Chromium, Brave, Edge, or set browser.executablePath explicitly.",
      ].join("\n"),
      "Browser",
    );
  });

  it("warns when managed browser launch needs display and no-sandbox adjustments", async () => {
    const noteFn = vi.fn();
    await noteChromeMcpBrowserReadiness(
      {
        browser: {
          headless: false,
          noSandbox: false,
          profiles: {
            nova-ai: { color: "#FF4500" },
          },
        },
      },
      {
        noteFn,
        platform: "linux",
        env: {},
        getUid: () => 0,
        resolveManagedExecutable: () => ({ kind: "chromium", path: "/usr/bin/chromium" }),
      },
    );

    expect(noteFn).toHaveBeenCalledWith(
      [
        "- Nova AI-managed browser profile(s) are configured: nova-ai.",
        "- No DISPLAY or WAYLAND_DISPLAY is set, and browser.headless is false. Managed browser launch needs a desktop session, Xvfb, or browser.headless: true.",
        "- The Gateway is running as root and browser.noSandbox is false. Chromium commonly requires browser.noSandbox: true in container/root runtimes.",
      ].join("\n"),
      "Browser",
    );
  });

  it("warns about legacy nova managed browser profile residue", async () => {
    const noteFn = vi.fn();
    const configDir = "/tmp/nova-ai-home";

    await noteChromeMcpBrowserReadiness(
      {
        browser: {
          profiles: {
            nova-ai: { color: "#FF4500" },
          },
        },
      },
      {
        noteFn,
        platform: "linux",
        env: { DISPLAY: ":99" },
        getUid: () => 1000,
        configDir,
        pathExists: (targetPath) => targetPath.endsWith("/browser/nova/user-data"),
        resolveManagedExecutable: () => ({ kind: "chrome", path: "/usr/bin/google-chrome" }),
      },
    );

    expect(noteFn).toHaveBeenCalledTimes(1);
    const note = requireFirstNoteText(noteFn);
    expect(note).toContain("Legacy managed browser profile residue");
    expect(note).toContain("/tmp/nova-ai-home/browser/nova");
    expect(note).toContain("/tmp/nova-ai-home/browser/nova-ai/user-data");
    expect(note).toContain("nova-ai doctor --fix");
  });

  it("does not warn when nova is still configured as a browser profile", async () => {
    const noteFn = vi.fn();

    await noteChromeMcpBrowserReadiness(
      {
        browser: {
          profiles: {
            nova: { color: "#FF4500" },
            nova-ai: { color: "#00AA00" },
          },
        },
      },
      {
        noteFn,
        platform: "linux",
        env: { DISPLAY: ":99" },
        getUid: () => 1000,
        configDir: "/tmp/nova-ai-home",
        pathExists: () => true,
        resolveManagedExecutable: () => ({ kind: "chrome", path: "/usr/bin/google-chrome" }),
      },
    );

    expect(noteFn).not.toHaveBeenCalled();
  });

  it("warns when Chrome MCP is configured but Chrome is missing", async () => {
    const noteFn = vi.fn();
    await noteChromeMcpBrowserReadiness(
      {
        browser: {
          defaultProfile: "user",
        },
      },
      {
        noteFn,
        platform: "darwin",
        resolveChromeExecutable: () => null,
      },
    );

    expect(noteFn).toHaveBeenCalledTimes(1);
    const note = requireFirstNoteText(noteFn);
    expect(note).toContain("Google Chrome was not found");
    expect(note).toContain("brave://inspect/#remote-debugging");
  });

  it("warns when detected Chrome is too old for Chrome MCP", async () => {
    const noteFn = vi.fn();
    await noteChromeMcpBrowserReadiness(
      {
        browser: {
          profiles: {
            chromeLive: {
              driver: "existing-session",
              color: "#00AA00",
            },
          },
        },
      },
      {
        noteFn,
        platform: "linux",
        resolveChromeExecutable: () => ({ path: "/usr/bin/google-chrome" }),
        readVersion: () => "Google Chrome 143.0.7499.4",
      },
    );

    expect(noteFn).toHaveBeenCalledTimes(1);
    const note = requireFirstNoteText(noteFn);
    expect(note).toContain("too old");
    expect(note).toContain("Chrome 144+");
  });

  it("reports the detected Chrome version for existing-session profiles", async () => {
    const noteFn = vi.fn();
    await noteChromeMcpBrowserReadiness(
      {
        browser: {
          profiles: {
            chromeLive: {
              driver: "existing-session",
              color: "#00AA00",
            },
          },
        },
      },
      {
        noteFn,
        platform: "win32",
        resolveChromeExecutable: () => ({
          path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        }),
        readVersion: () => "Google Chrome 144.0.7534.0",
      },
    );

    expect(noteFn).toHaveBeenCalledTimes(1);
    expect(requireFirstNoteText(noteFn)).toContain("Detected Chrome Google Chrome 144.0.7534.0");
  });

  it("skips Chrome auto-detection when profiles use explicit userDataDir", async () => {
    const noteFn = vi.fn();
    await noteChromeMcpBrowserReadiness(
      {
        browser: {
          profiles: {
            braveLive: {
              driver: "existing-session",
              userDataDir: "/Users/test/Library/Application Support/BraveSoftware/Brave-Browser",
              color: "#FB542B",
            },
          },
        },
      },
      {
        noteFn,
        resolveChromeExecutable: () => {
          throw new Error("should not look up Chrome");
        },
      },
    );

    expect(noteFn).toHaveBeenCalledTimes(1);
    const note = requireFirstNoteText(noteFn);
    expect(note).toContain("explicit Chromium user data directory");
    expect(note).toContain("brave://inspect/#remote-debugging");
  });
});

describe("legacy nova browser profile cleanup", () => {
  it("archives stale nova residue with the safe trash mover", async () => {
    const movePathToTrash = vi.fn(async () => "/tmp/nova-ai-home/browser/.trash/nova");

    const result = await maybeArchiveLegacyNovaBrowserProfileResidue(
      {
        browser: {
          profiles: {
            nova-ai: { color: "#FF4500" },
          },
        },
      },
      {
        configDir: "/tmp/nova-ai-home",
        pathExists: (targetPath) => targetPath.endsWith("/browser/nova/user-data"),
        movePathToTrash,
      },
    );

    expect(movePathToTrash).toHaveBeenCalledWith("/tmp/nova-ai-home/browser/nova");
    expect(result.warnings).toStrictEqual([]);
    expect(result.changes.join("\n")).toContain(
      "Archived legacy nova managed browser profile residue.",
    );
    expect(result.changes.join("\n")).toContain("/tmp/nova-ai-home/browser/nova-ai/user-data");
  });

  it("does not archive a configured nova browser profile", async () => {
    const movePathToTrash = vi.fn(async () => "/tmp/unused");

    const result = await maybeArchiveLegacyNovaBrowserProfileResidue(
      {
        browser: {
          defaultProfile: "nova",
          profiles: {
            nova: { color: "#FF4500" },
          },
        },
      },
      {
        configDir: "/tmp/nova-ai-home",
        pathExists: () => true,
        movePathToTrash,
      },
    );

    expect(movePathToTrash).not.toHaveBeenCalled();
    expect(result).toStrictEqual({ changes: [], warnings: [] });
  });
});
