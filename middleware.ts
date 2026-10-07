import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle root health-check endpoint
  if (pathname === '/') {
    const accept = request.headers.get('accept') || '';
    const isJsonRequested = accept.includes('application/json') || request.nextUrl.searchParams.has('health');
    const userAgent = request.headers.get('user-agent') || '';
    const isDartOrCurl = userAgent.includes('Dart') || userAgent.includes('curl') || userAgent.includes('Postman');

    if (isJsonRequested || isDartOrCurl) {
      return NextResponse.json({
        status: 'ok',
        success: true,
        message: 'RelayDoctor Backend API Running 🚀',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Handle CORS preflight for all /api routes
  if (pathname.startsWith('/api')) {
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 });
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With, Accept, x-doctor-id'
      );
      response.headers.set('Access-Control-Max-Age', '86400');
      return response;
    }

    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Accept, x-doctor-id'
    );
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/api/:path*'],
};
