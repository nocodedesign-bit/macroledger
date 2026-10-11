import { describe, expect, it } from "vitest";
import { ledgerFields, ledgerKeys } from "@/lib/ledger-catalog";
describe("Ledger import catalog", () => {
  it("includes all seven private ledgers", () => expect(ledgerKeys).toHaveLength(7));
  it("uses the correct currency fields", () => {
    expect(ledgerFields["ledger:dxy-bxy"]).toEqual(["dxy", "bxy"]);
    expect(ledgerFields["ledger:dxy-jxy"]).toEqual(["dxy", "jxy"]);
  });
  it("uses probability fields for both new banks", () => {
    expect(ledgerFields["ledger:bojwatch"]).toEqual(["cut", "hold", "hike"]);
    expect(ledgerFields["ledger:boewatch"]).toEqual(["cut", "hold", "hike"]);
  });
});