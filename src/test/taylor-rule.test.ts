import { describe, expect, it } from "vitest";
import { taylorRate } from "@/lib/taylor-rule";

describe("taylorRate", () => {
  it("equals neutral + target when inflation is on target and unemployment at NAIRU", () => {
    expect(taylorRate({ inflation: 2, unemployment: 4.2 })).toBeCloseTo(4);
  });
  it("rises 1.5 points per point of inflation and falls 1 point per point of unemployment", () => {
    expect(taylorRate({ inflation: 3, unemployment: 4.2 })).toBeCloseTo(5.5);
    expect(taylorRate({ inflation: 2, unemployment: 5.2 })).toBeCloseTo(3);
  });
});
