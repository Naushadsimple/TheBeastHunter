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

    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || (process.env.NODE_ENV === 'development' ? 'http' : 'https');
    if (host) return `${proto}://${host}`.replace(/\/$/, '');
  }

  return process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://thebeasthunterchallenge.com';
}
