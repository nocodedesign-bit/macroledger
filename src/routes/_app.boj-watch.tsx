import { createFileRoute } from "@tanstack/react-router";
import { BankWatchPage } from "@/components/bank-watch-page";
export const Route = createFileRoute("/_app/boj-watch")({
  head: () => ({ meta: [
    { title: "BOJ Watch — Macro Ledger" },
    { name: "description", content: "Manual daily BOJ rate probabilities and JXY correlations." },
    { property: "og:title", content: "BOJ Watch — Macro Ledger" },
    { property: "og:description", content: "Manual daily BOJ rate probabilities and JXY correlations." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <BankWatchPage bank="BOJ" ledgerKey="ledger:bojwatch" indexName="JXY" indexKey="jxy" pairLedger="ledger:dxy-jxy" yieldName="JP02Y" />,
});
