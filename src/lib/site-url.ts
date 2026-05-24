/** Canonical site URL for Cashfree return/notify URLs */
export function getSiteUrl(request?: Request): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    '';

  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  if (request) {
    const origin = request.headers.get('origin');
    if (origin) return origin.replace(/\/$/, '');
  }

  return 'http://localhost:3000';
}
