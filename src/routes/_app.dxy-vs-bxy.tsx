import { createFileRoute } from "@tanstack/react-router";
import { CurrencyPairPage } from "@/components/currency-pair-page";
export const Route = createFileRoute("/_app/dxy-vs-bxy")({
  head: () => ({ meta: [
    { title: "DXY vs BXY — Macro Ledger" },
    { name: "description", content: "Manual daily closes comparing the US Dollar Index with the British Pound Index." },
    { property: "og:title", content: "DXY vs BXY — Macro Ledger" },
    { property: "og:description", content: "Manual daily closes comparing the US Dollar Index with the British Pound Index." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <CurrencyPairPage pairKey="bxy" indexName="BXY" indexLabel="British Pound Index" />,
});
