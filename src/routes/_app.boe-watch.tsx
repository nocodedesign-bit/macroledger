import { createFileRoute } from "@tanstack/react-router";
import { BankWatchPage } from "@/components/bank-watch-page";
export const Route = createFileRoute("/_app/boe-watch")({
  head: () => ({ meta: [
    { title: "BOE Watch — Macro Ledger" },
    { name: "description", content: "Manual daily BOE rate probabilities and BXY correlations." },
    { property: "og:title", content: "BOE Watch — Macro Ledger" },
    { property: "og:description", content: "Manual daily BOE rate probabilities and BXY correlations." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <BankWatchPage bank="BOE" ledgerKey="ledger:boewatch" indexName="BXY" indexKey="bxy" pairLedger="ledger:dxy-bxy" yieldName="UK02Y" />,
});
