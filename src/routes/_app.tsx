import { Outlet, Link, createFileRoute } from "@tanstack/react-router";
import { AccountMenu } from "@/components/account-menu";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 px-4 sm:gap-x-6">
          <Link to="/" className="py-4 font-mono text-sm font-semibold tracking-widest">
            <span className="text-primary">MACRO</span> <span className="text-foreground">LEDGER</span>
          </Link>
          <nav className="-mx-4 order-last flex w-full gap-1 overflow-x-auto px-4 sm:order-none sm:mx-0 sm:w-auto sm:px-0">
            {([["/fedwatch", "Fed Watch"], ["/ecb-watch", "Ecb watch"], ["/dxy-vs-exy", "DXY vs EXY"]] as const).map(([to, label]) => (
              <Link key={to} to={to} activeOptions={{ exact: true }}
                className="whitespace-nowrap border-b-2 border-transparent px-4 py-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "!border-primary !text-foreground" }}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto"><AccountMenu /></div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
