# macroledger

Please create a new, fully functional feature in the application consisting of a dedicated tab called "DXY vs EXY", placed right next to the existing "FedWatch Tracker" tab. The feature must use a **Manual Daily Close Ledger** (no mock data) to track and compare the US Dollar Index (DXY) against the Euro Index (EXY).

 

Please implement the following exact specifications:

 

1. **Tabs Navigation:**

   - Add a top navigation bar with clean tabs to seamlessly switch between:

     - Tab 1: "FedWatch Tracker" (the existing interest rate probability ledger content).

     - Tab 2: "DXY vs EXY" (the new comparison tab).

 

2. **Manual Ledger Data Entry ("+ Log today"):**

   - In the header of the "DXY vs EXY" tab, include a prominent button labeled `+ Log today` matching the exact button styling of the existing FedWatch tracker.

   - Clicking the button should open a clean modal or form allowing the user to input:

     - Date (defaults to current date)

     - DXY Daily Close (number input)

     - EXY Daily Close (number input)

   - Save these entries persistently (using Supabase or local state consistent with the app's architecture).

 

3. **Summary Metrics & Cards:**

   - Display summary cards for both DXY and EXY showing:

     - The latest logged closing price.

     - The 1D percentage change calculated automatically by comparing the latest entry with the previous day's entry.

 

4. **Comparison Chart & History Table:**

   - **Chart:** Integrate a clean line chart or overlay using the manual daily close data points to visually display the movement of both DXY and EXY over time, highlighting their inverse correlation.

   - **History Table:** Provide a structured table or ledger list showing all past logged dates, DXY closes, EXY closes, and delete/manage options if needed.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://macroledger.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/178681d4-cb37-4991-a1b7-184bbf4913be).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
