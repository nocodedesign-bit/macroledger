import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, LineChart, NotebookPen, Rocket, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "@/components/account-menu";
import { RegisterDialog } from "@/components/register-dialog";
import { useAccount } from "@/hooks/use-account";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Macro Ledger — FedWatch Tracker & Macro Tools" },
      { name: "description", content: "Manual daily ledgers for FedWatch rate probabilities, DXY vs EXY correlations, and macro tools." },
      { property: "og:title", content: "Macro Ledger — FedWatch Tracker & Macro Tools" },
      { property: "og:description", content: "Manual daily ledgers for FedWatch rate probabilities, DXY vs EXY correlations, and macro tools." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const features = [
  {
    icon: BarChart3,
    title: "FedWatch Probability Tracking",
    desc: "Log daily CUT · HOLD · HIKE odds for the next FOMC meeting and watch the trend chart evolve.",
  },
  {
    icon: LineChart,
    title: "Macro Correlations",
    desc: "Overlay DXY and US02Y on your probabilities and measure the inverse DXY vs EXY relationship.",
  },
  {
    icon: NotebookPen,
    title: "Daily Manual Ledger",
    desc: "Every record is entered by hand and saved privately to your account — no mock data, ever.",
  },
];

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <span className="font-mono text-sm font-semibold tracking-widest">
            <span className="text-primary">MACRO</span> <span className="text-foreground">LEDGER</span>
          </span>
          <div className="flex items-center gap-2">
            <Button asChild className="font-semibold shadow-lg shadow-primary/20 transition-transform hover:scale-[1.03]">
              <Link to="/fedwatch">Enter the App</Link>
            </Button>
            <AccountMenu />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-20 text-center sm:pt-28">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">FedWatch Tracker · DXY vs EXY</p>
            <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">
              Welcome to the Macro Analysis Platform
              <span className="mt-2 block text-primary">FedWatch Tracker</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Log the daily odds for the next Federal Reserve decision — cut, hold or hike — and track the inverse
              relationship between the US Dollar Index (DXY) and the Euro Index (EXY), all kept in manual daily ledgers
              stored privately in your account.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="h-14 px-8 text-lg font-semibold shadow-xl shadow-primary/25 transition-transform hover:scale-105">
                <Link to="/fedwatch">Enter the App <Rocket /></Link>
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">CUT · HOLD · HIKE — updated by hand, every trading day.</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="grid gap-4 md:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 Macro Ledger. All rights reserved.
      </footer>
    </div>
  );
}
