import { createFileRoute } from "@tanstack/react-router";
import { DxyExyLedger } from "@/components/dxy-exy-ledger";

export const Route = createFileRoute("/dxy-vs-exy")({
  head: () => ({
    meta: [
      { title: "DXY vs EXY — Macro Ledger" },
      { name: "description", content: "Manual daily close ledger comparing the US Dollar Index with the Euro Index." },
      { property: "og:title", content: "DXY vs EXY — Macro Ledger" },
      { property: "og:description", content: "Manual daily close ledger comparing the US Dollar Index with the Euro Index." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DxyExyPage,
});

function DxyExyPage() {
  return <DxyExyLedger />;
}
