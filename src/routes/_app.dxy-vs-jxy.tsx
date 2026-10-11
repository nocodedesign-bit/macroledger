import { createFileRoute } from "@tanstack/react-router";
import { CurrencyPairPage } from "@/components/currency-pair-page";
export const Route = createFileRoute("/_app/dxy-vs-jxy")({
  head: () => ({ meta: [
    { title: "DXY vs JXY — Macro Ledger" },
    { name: "description", content: "Manual daily closes comparing the US Dollar Index with the Japanese Yen Index." },
    { property: "og:title", content: "DXY vs JXY — Macro Ledger" },
    { property: "og:description", content: "Manual daily closes comparing the US Dollar Index with the Japanese Yen Index." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <CurrencyPairPage pairKey="jxy" indexName="JXY" indexLabel="Japanese Yen Index" />,
});
