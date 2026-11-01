import { describe, expect, it } from "vitest";
import { dominantScenario } from "@/lib/probability-scenarios";

describe("dominant probability scenario", () => {
  it("highlights the highest probability, not always hold", () => {
    expect(dominantScenario({ cut: 0, hold: 82.1, hike: 17.9 })).toBe("hold");
    expect(dominantScenario({ cut: 70, hold: 20, hike: 10 })).toBe("cut");
    expect(dominantScenario({ cut: 10, hold: 20, hike: 70 })).toBe("hike");
  });
  it("does not invent a dominant scenario without an entry", () => {
    expect(dominantScenario(undefined)).toBeNull();
  });
});