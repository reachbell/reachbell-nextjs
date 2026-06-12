/**
 * @reachbell/nextjs — Next.js bindings for the ReachBell SDK.
 *
 * Re-exports the App Router-friendly client provider from @reachbell/react
 * and adds two Next-specific helpers:
 *
 *   <ReachBellScript />
 *     Next/Script wrapper that loads the SDK IIFE bundle from a CDN
 *     instead of the npm package. Useful for pages that want zero
 *     React-tree integration — just include the component once near
 *     the top of your layout.
 *
 *   getAuthHeaders({ apiKey, orgId? })
 *     Server-side helper for App Router route handlers / server actions
 *     that need to call the ReachBell API with a project's API key.
 *     Pure function; no SDK initialisation involved.
 */

import Script from 'next/script';

// Re-export the React provider + hooks. Keeps consumers on a single
// import surface — `import { ReachBellProvider, useReachBell } from '@reachbell/nextjs'`
// instead of mixing `@reachbell/react` and `@reachbell/nextjs`.
export { ReachBellProvider, useReachBell, useNotificationPermission } from '@reachbell/react';
export type { ReachBellConfig, SubscribeResult, ApiResult, ReachBellProviderProps } from '@reachbell/react';

interface ReachBellScriptProps {
  /** Project API key — required. */
  apiKey:     string;
  /** Override the API origin. Defaults to https://api.reachbell.com. */
  apiUrl?:    string;
  /** Source URL for the SDK bundle. Defaults to https://app.reachbell.com/reachbell.js. */
  src?:       string;
  /** Whether the prompt should auto-show on first user gesture. */
  autoPrompt?: boolean;
  /** Service-worker path served from your site root. Defaults to /reachbell-sw.js. */
  swPath?:    string;
  /** Surface SDK debug logs in the browser console. */
  debug?:     boolean;
}

/**
 * Drop-in <script> tag that loads the SDK IIFE from a CDN and inits it
 * with your config. Place inside your root layout (App Router) or
 * _app (Pages Router) once. Pages that don't need the SDK get tree-
 * shaken correctly because next/script handles deferred loading.
 *
 * Equivalent to writing the two-line vanilla snippet by hand:
 *
 *   <script src="…/reachbell.js" defer />
 *   <script>ReachBell.init({...})</script>
 *
 * but with proper hydration semantics for both Pages + App Router.
 */
export function ReachBellScript({
  apiKey,
  apiUrl     = 'https://api.reachbell.com',
  src        = 'https://app.reachbell.com/reachbell.js',
  autoPrompt = false,
  swPath     = '/reachbell-sw.js',
  debug      = false,
}: ReachBellScriptProps) {
  // JSON.stringify the config so it's safe to inline regardless of
  // weird chars in the project name. next/script handles deferred
  // execution + hydration correctly across both routers.
  const config = JSON.stringify({ apiKey, apiUrl, swPath, autoPrompt, debug });

  return (
    <>
      <Script src={src} strategy="afterInteractive" id="reachbell-sdk" />
      <Script
        id="reachbell-init"
        strategy="afterInteractive"
        // dangerouslySetInnerHTML is the documented Next API for inline
        // scripts; the payload is a stringified config, no user content.
        dangerouslySetInnerHTML={{
          __html: `(function(){if(!window.ReachBell)return;window.ReachBell.init(${config});})();`,
        }}
      />
    </>
  );
}

/**
 * Build the headers for a server-side fetch to the ReachBell API from a
 * Next.js route handler / server action. Pure function — no SDK init.
 *
 *   import { getAuthHeaders } from '@reachbell/nextjs';
 *
 *   export async function POST(req: Request) {
 *     const res = await fetch('https://api.reachbell.com/transactional/send', {
 *       method: 'POST',
 *       headers: getAuthHeaders({ apiKey: process.env.REACHBELL_API_KEY! }),
 *       body: JSON.stringify({ externalId: 'user_42', title: '…', body: '…' }),
 *     });
 *     return Response.json(await res.json());
 *   }
 */
export function getAuthHeaders(opts: { apiKey: string; orgId?: string }): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key':    opts.apiKey,
  };
  if (opts.orgId) headers['x-org-id'] = opts.orgId;
  return headers;
}
