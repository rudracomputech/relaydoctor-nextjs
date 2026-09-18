import { NextResponse } from 'next/server';
import { mobileOpenApiSpec } from '@/lib/mobile-openapi-spec';

export async function GET() {
  return NextResponse.json(mobileOpenApiSpec, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=60, s-maxage=300',
    },
  });
}
