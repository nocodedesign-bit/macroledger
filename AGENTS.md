<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep FedWatch chart rendering in its dedicated chart module; join optional market closes by exact ledger date to prevent fabricated or mismatched overlays.
- Use the shared Shadcn calendar picker for FedWatch date fields and store meeting dates as optional ISO dates on ledger records so older records remain readable.
- Keep account state in one root provider; public ledger pages expose no private rows while signed out and all cloud access is owner-scoped through RLS.
- Store ledger payloads in a shared user/key/date table to preserve existing manual record shapes; browser ledgers are explicit imports that never overwrite online records.
- Keep ledger page presentation in a scoped app theme and shared summary-card component so all three ledgers stay visually consistent without changing the homepage.
- Use shared configurable BOJ/BOE probability pages and currency comparison pages with separate ledger keys; this avoids divergent forms while preserving existing Fed/ECB record shapes.
- Keep supported browser-import keys and required fields in the shared ledger catalog; this prevents currency records from being validated as probabilities.
- Use route-derived dual dropdown navigation for bank watches and currency pairs; this keeps direct links and mobile menu labels synchronized.
- The public homepage is the Google auth entry and uses the root account provider to redirect signed-in users to Fed Watch; managed OAuth returns to the public origin to avoid session timing redirects and duplicate auth listeners.
- Let the root account provider own sign-out: it clears the cache and replaces the history entry with the login page, and the app layout sends signed-out visitors there too, so no page needs its own sign-out redirect and the back button cannot restore a ledger view.
- AI shift explainer uses createServerFn (owner-scoped reads via requireSupabaseAuth) with gateway helpers in a .server.ts module; keeps the API key and prompts server-side.
