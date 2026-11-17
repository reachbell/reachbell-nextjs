/**
 * @reachbell/nextjs — Next.js bindings for the ReachBell SDK.
 *
 * Re-exports the App Router-friendly client provider from @reachbell/react
 * and adds a Next-specific helper:
 *
 *   <ReachBellScript />
 *     Next/Script wrapper that loads the SDK IIFE bundle from a CDN
 *     instead of the npm package. Useful for pages that want zero
 *     React-tree integration — just include the component once near
 *     the top of your layout.
 *
 * Server-side helpers live in `@reachbell/nextjs/server`.
 */

import Script from 'next/script';
import type { ReachBellConfig } from '@reachbell/react';

// Re-export the React provider + hooks. Keeps consumers on a single
// import surface — `import { ReachBellProvider, useReachBell } from '@reachbell/nextjs'`
// instead of mixing `@reachbell/react` and `@reachbell/nextjs`.
export { ReachBellProvider, useReachBell, useNotificationPermission } from '@reachbell/react';
export type { ReachBellConfig, SubscribeResult, ApiResult, ReachBellProviderProps } from '@reachbell/react';
export { getAuthHeaders } from './server';

interface ReachBellScriptProps {
  /** Project API key — required. */
  apiKey:     string;
  /** Only for staging or self-hosted APIs. The SDK uses https://api.reachbell.com when omitted. */
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

type ReachBellGlobal = { init(config: ReachBellConfig): void };

let scriptInitialised = false;

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
  apiUrl,
  src        = 'https://app.reachbell.com/reachbell.js',
  autoPrompt = false,
  swPath     = '/reachbell-sw.js',
  debug      = false,
}: ReachBellScriptProps) {
  const handleReady = () => {
    if (scriptInitialised) return;
    const rb = (window as unknown as { ReachBell?: ReachBellGlobal }).ReachBell;
    if (!rb || typeof rb.init !== 'function') return;
    scriptInitialised = true;
    rb.init({ apiKey, swPath, autoPrompt, debug, ...(apiUrl ? { apiUrl } : {}) });
  };

  return <Script src={src} strategy="afterInteractive" id="reachbell-sdk" onReady={handleReady} />;
}
