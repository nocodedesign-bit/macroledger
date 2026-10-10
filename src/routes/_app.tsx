import { Outlet, Link, createFileRoute } from "@tanstack/react-router";
import { AccountMenu } from "@/components/account-menu";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="ledger-app min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 sm:px-6 sm:py-5">
          <Link to="/" aria-label="Macro Ledger home" className="min-w-0 whitespace-nowrap text-lg font-semibold sm:text-2xl">
            <span className="text-primary">MACRO</span><span className="font-medium text-foreground">LEDGER</span>
          </Link>
          <AccountMenu iconOnly />
        </div>
        <div className="border-t border-border/50">
          <nav aria-label="Market ledgers" className="mx-auto flex max-w-7xl items-stretch gap-6 overflow-x-auto px-4 sm:gap-8 sm:px-6">
            {([["/fedwatch", "Fed Watch"], ["/ecb-watch", "Ecb watch"], ["/dxy-vs-exy", "DXY vs EXY"]] as const).map(([to, label]) => (
              <Link key={to} to={to} activeOptions={{ exact: true }}
                className="shrink-0 whitespace-nowrap border-b-2 border-transparent py-4 text-sm font-medium text-muted-foreground transition-colors hover:text-primary sm:text-base"
                activeProps={{ className: "!border-primary !text-primary" }}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
