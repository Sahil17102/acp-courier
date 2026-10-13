# ACP Courier Speed

ACP Courier Speed includes two separate experiences in one repository:

- The public landing page is served from the project root.
- The `user-panel` application contains sign-in, OTP verification, new-user onboarding, KYC and the customer shipping dashboard.

## Run locally

```powershell
cd "C:\searchcraft\acp courier\acp-courier"
npm --prefix user-panel install
npm run dev
```

- Landing page: http://localhost:4173
- Sign in: http://localhost:5176/login
- User panel: http://localhost:5176/home
- Local demo: select **OTP**, enter any email, then use `123456`.

Live carrier booking, email OTP, payments and cloud storage require the corresponding production API credentials from `.env.example`.
