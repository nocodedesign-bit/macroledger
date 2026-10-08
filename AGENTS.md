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
