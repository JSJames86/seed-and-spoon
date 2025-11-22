import { NextResponse } from 'next/server';

export function middleware(request) {
  const hostname = request.headers.get('host') || '';

  // Check if the request is from the SpoonAssist subdomain
  if (hostname === 'spoonassist.seedandspoon.org') {
    const url = request.nextUrl.clone();

    // If not already on /spoonassist path, rewrite to it
    if (!url.pathname.startsWith('/spoonassist')) {
      url.pathname = `/spoonassist${url.pathname === '/' ? '' : url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
