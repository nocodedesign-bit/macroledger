import { createFileRoute } from "@tanstack/react-router";
import { CurrencyPairPage } from "@/components/currency-pair-page";
export const Route = createFileRoute("/_app/dxy-vs-exy")({
  head: () => ({ meta: [
    { title: "DXY vs EXY — Macro Ledger" },
    { name: "description", content: "Manual daily closes comparing the US Dollar Index with the Euro Index." },
    { property: "og:title", content: "DXY vs EXY — Macro Ledger" },
    { property: "og:description", content: "Manual daily closes comparing the US Dollar Index with the Euro Index." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <CurrencyPairPage pairKey="exy" indexName="EXY" indexLabel="Euro Index" />,
});
