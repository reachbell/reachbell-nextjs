export function getAuthHeaders(opts: { apiKey: string; orgId?: string }): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key':    opts.apiKey,
  };
  if (opts.orgId) headers['x-org-id'] = opts.orgId;
  return headers;
}
