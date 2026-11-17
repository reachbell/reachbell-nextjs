# @reachbell/nextjs

Next.js bindings for the [ReachBell](https://reachbell.com) SDK.

Full documentation: https://docs.reachbell.com

Wraps `@reachbell/react` and adds two Next-specific helpers:
- `<ReachBellScript />` — drop-in `next/script` wrapper that loads the SDK from a CDN
- `getAuthHeaders()` — server-side helper for route handlers and Server Actions, imported from `@reachbell/nextjs/server`

The root entry (`@reachbell/nextjs`) is a client module (its bundle starts with `"use client"`), so it is safe to import from `app/layout.tsx`. The `@reachbell/nextjs/server` entry has no React or client code.

## Install

```bash
npm install @reachbell/nextjs @reachbell/react @reachbell/sdk
```

## Quickstart — App Router with the React provider

```tsx
// app/providers.tsx
"use client";
import { ReachBellProvider } from '@reachbell/nextjs';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReachBellProvider apiKey={process.env.NEXT_PUBLIC_REACHBELL_KEY!} autoPrompt>
      {children}
    </ReachBellProvider>
  );
}
```

```tsx
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

Then use the hook anywhere inside a client component:

```tsx
"use client";
import { useReachBell } from '@reachbell/nextjs';

export function SubscribeButton() {
  const { prompt, permission, isReady } = useReachBell();
  if (!isReady)              return <button disabled>Loading…</button>;
  if (permission === 'granted') return <span>Subscribed ✓</span>;
  return <button onClick={() => prompt()}>Enable notifications</button>;
}
```

## Quickstart — CDN script (no React integration)

For pages that don't need a React-tree integration, drop in the script component once:

```tsx
// app/layout.tsx
import { ReachBellScript } from '@reachbell/nextjs';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReachBellScript apiKey={process.env.NEXT_PUBLIC_REACHBELL_KEY!} autoPrompt />
        {children}
      </body>
    </html>
  );
}
```

This loads the SDK IIFE bundle from `https://app.reachbell.com/reachbell.js` after hydration and calls `window.ReachBell.init(config)` once the script has loaded (only once per page session, even across client-side navigations). No React Context, no hook to call — `window.ReachBell` is available globally once the script has loaded.

## Server-side API calls

Use `getAuthHeaders()` from any App Router route handler or Server Action. Import it from the `server` entry:

```tsx
// app/api/notify/route.ts
import { getAuthHeaders } from '@reachbell/nextjs/server';

export async function POST(req: Request) {
  const { userId, title, body } = await req.json();
  const res = await fetch('https://api.reachbell.com/transactional/send', {
    method: 'POST',
    headers: getAuthHeaders({ apiKey: process.env.REACHBELL_API_KEY! }),
    body: JSON.stringify({ externalId: userId, title, body }),
  });
  return Response.json(await res.json());
}
```

`REACHBELL_API_KEY` here must be your project's **secret** key (`rb_secret_…`). Keep it in a server-only environment variable (no `NEXT_PUBLIC_` prefix) and use it only in server code. Never pass the public key here, and never send the secret key to the browser.

## Service worker

Copy `reachbell-sw.js` from your ReachBell dashboard into `public/reachbell-sw.js`. Next.js serves `public/` from the site root, which is exactly where the service worker needs to live.

## API

| Export | Notes |
| --- | --- |
| `<ReachBellProvider>` | Re-exported from `@reachbell/react`. Use inside a client component. |
| `useReachBell()` | Re-exported hook. |
| `useNotificationPermission()` | Re-exported hook. |
| `<ReachBellScript>` | Client component that loads the SDK with `next/script` and inits it on load. No React provider required. |
| `getAuthHeaders({ apiKey, orgId? })` | From `@reachbell/nextjs/server`. Pure function. Builds the `x-api-key` + `x-org-id` + `Content-Type` headers. Server only, with the secret key. |

## License

MIT © DotSpheres Technologies Pvt Ltd
