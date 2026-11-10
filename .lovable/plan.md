# Three languages and a light theme

## What will change
- Add Arabic, English, and French language choices matching the uploaded EN / FR / AR control, with Arabic right-to-left layout.
- Add a light/dark theme button; preserve the existing dark gold palette as the default and provide a contrasting light palette.
- Place both controls on the sign-in page and inside the signed-in app, and remember choices in the browser.
- Translate the app's visible navigation, forms, labels, and common messages while keeping private ledger values and AI-generated content unchanged.

## Technical approach
- Add a small shared preferences/localization module and apply language direction and theme after hydration to avoid server-render mismatches.
- Extend semantic CSS tokens for the light palette, including the app-scoped and sign-in palettes.
- Verify language and theme switching, persistence, Arabic direction, desktop/mobile layout, and existing tests.
