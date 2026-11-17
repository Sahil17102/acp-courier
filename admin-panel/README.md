# ACP Courier Speed Admin Panel

Standalone Vite/React admin dashboard for ACP Courier Speed.

## Local development

```bash
npm ci
npm run dev
```

Demo login defaults:

- Email: `admin@acpcourier.in`
- Password: any non-empty value (the standalone demo defaults to `admin123`)

## Data and API mode

The panel currently ships with `VITE_STATIC_DATA_ENABLED=true`. In this mode:

- no courier/provider API credentials are used;
- no requests are sent to the reference Logicorp project;
- supported management data is stored in browser local storage;
- backend-only screens render safe empty/demo states.

When the ACP backend is ready, set `VITE_STATIC_DATA_ENABLED=false` and provide `VITE_API_URL`.
Courier integration remains independently disabled until `VITE_COURIER_API_ENABLED=true` is configured.
