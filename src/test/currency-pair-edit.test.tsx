import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CurrencyPairPage } from "@/components/currency-pair-page";

const mocks = vi.hoisted(() => ({ upsert: vi.fn(), remove: vi.fn(), entries: [] as object[] }));
vi.mock("@/hooks/use-account", () => ({ useAccount: () => ({ user: { id: "owner" } }) }));
vi.mock("@/hooks/use-ledger", () => ({
  todayISO: () => "2026-11-07",
  useLedger: () => ({ entries: mocks.entries, upsert: mocks.upsert, remove: mocks.remove, error: null }),
}));
vi.mock("recharts", () => ({ ResponsiveContainer: () => null, CartesianGrid: () => null, Legend: () => null, Line: () => null, LineChart: () => null, Tooltip: () => null, XAxis: () => null, YAxis: () => null }));
vi.mock("@/components/entry-date-controls", () => ({ EntryDateControls: () => null }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("Currency history editing", () => {
  it.each(["exy", "bxy", "jxy"] as const)("updates the original %s record without creating another date", async (pairKey) => {
    mocks.entries = [{ date: "2026-11-06", dxy: 103.25, [pairKey]: 108.4, note: "preserved" }];
    mocks.upsert.mockResolvedValue(undefined);
    render(<CurrencyPairPage pairKey={pairKey} indexName={pairKey.toUpperCase()} indexLabel="Currency index" />);
    fireEvent.click(screen.getByRole("button", { name: "Edit close for 2026-11-06" }));
    expect(screen.getByLabelText("Date")).toBeDisabled();
    expect(screen.getByLabelText("DXY daily close")).toHaveValue(103.25);
    expect(screen.getByLabelText(`${pairKey.toUpperCase()} daily close`)).toHaveValue(108.4);
    fireEvent.change(screen.getByLabelText("DXY daily close"), { target: { value: "104.5" } });
    fireEvent.change(screen.getByLabelText(`${pairKey.toUpperCase()} daily close`), { target: { value: "109.7" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(mocks.upsert).toHaveBeenCalledWith({ date: "2026-11-06", dxy: 104.5, [pairKey]: 109.7, note: "preserved" }));
    expect(mocks.remove).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("does not save cancelled edits", () => {
    mocks.entries = [{ date: "2026-11-06", dxy: 103.25, exy: 108.4 }];
    render(<CurrencyPairPage pairKey="exy" indexName="EXY" indexLabel="Euro Index" />);
    fireEvent.click(screen.getByRole("button", { name: "Edit close for 2026-11-06" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
});