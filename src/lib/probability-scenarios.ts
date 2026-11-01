export const probabilityKinds = ["cut", "hold", "hike"] as const;
export type ProbabilityKind = (typeof probabilityKinds)[number];

export function dominantScenario(entry: Record<ProbabilityKind, number> | undefined): ProbabilityKind | null {
  if (!entry) return null;
  return probabilityKinds.reduce((highest, kind) => entry[kind] > entry[highest] ? kind : highest);
}