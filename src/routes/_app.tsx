import { Outlet, Link, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { AccountMenu } from "@/components/account-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user, ready } = useAccount();
  useEffect(() => { if (ready && !user) void navigate({ to: "/", replace: true }); }, [ready, user, navigate]);
  const banks = [["/fedwatch", "Fed Watch"], ["/ecb-watch", "ECB Watch"], ["/boj-watch", "BOJ Watch"], ["/boe-watch", "BOE Watch"]] as const;
  const pairs = [["/dxy-vs-exy", "DXY vs EXY"], ["/dxy-vs-bxy", "DXY vs BXY"], ["/dxy-vs-jxy", "DXY vs JXY"]] as const;
  const activeBank = banks.find(([to]) => to === pathname);
  const activePair = pairs.find(([to]) => to === pathname);
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
          <nav aria-label="Market ledgers" className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-3 sm:px-6">
            <Select value={activeBank?.[0] ?? ""} onValueChange={(value) => { const bank = banks.find(([to]) => to === value); if (bank) void navigate({ to: bank[0] }); }}>
              <SelectTrigger aria-label="Central bank watches" className={`h-11 min-w-0 bg-card font-medium [&>span]:truncate [&_svg]:shrink-0 ${activeBank ? "border-primary/50 text-primary" : "text-muted-foreground"}`}><SelectValue placeholder="Central Banks" /></SelectTrigger>
              <SelectContent className="ledger-app"><>{banks.map(([to, label]) => <SelectItem key={to} value={to} className="py-3 data-[state=checked]:text-primary">{label}</SelectItem>)}</></SelectContent>
            </Select>
            <Select value={activePair?.[0] ?? ""} onValueChange={(value) => { const pair = pairs.find(([to]) => to === value); if (pair) void navigate({ to: pair[0] }); }}>
              <SelectTrigger aria-label="Currency pairs" className={`h-11 min-w-0 bg-card font-medium [&>span]:truncate [&_svg]:shrink-0 ${activePair ? "border-primary/50 text-primary" : "text-muted-foreground"}`}><SelectValue placeholder="Currency Pairs" /></SelectTrigger>
              <SelectContent className="ledger-app"><>{pairs.map(([to, label]) => <SelectItem key={to} value={to} className="py-3 data-[state=checked]:text-primary">{label}</SelectItem>)}</></SelectContent>
            </Select>
          </nav>
        </div>
      </header>
      <div key={pathname}><Outlet /></div>
    </div>
  );
}
