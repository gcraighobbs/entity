import { NextRequest, NextResponse } from 'next/server';

// Fail-closed guard for the API. The only route is GET /api/species; nothing
// may write. Admin and cron paths are refused outright, whatever the method.
const READ_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (/^\/(admin|api\/admin|api\/cron)(\/|$)/.test(pathname)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  if (!READ_METHODS.includes(request.method)) {
    return new NextResponse('Method Not Allowed', {
      status: 405,
      headers: { Allow: READ_METHODS.join(', ') },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
