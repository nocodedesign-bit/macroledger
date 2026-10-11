export const ledgerFields = {
  "ledger:fedwatch": ["cut", "hold", "hike"],
  "ledger:ecbwatch": ["cut", "hold", "hike"],
  "ledger:bojwatch": ["cut", "hold", "hike"],
  "ledger:boewatch": ["cut", "hold", "hike"],
  "ledger:dxy-exy": ["dxy", "exy"],
  "ledger:dxy-bxy": ["dxy", "bxy"],
  "ledger:dxy-jxy": ["dxy", "jxy"],
} as const;
export const ledgerKeys = Object.keys(ledgerFields) as (keyof typeof ledgerFields)[];