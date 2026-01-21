// @ts-expect-error Cannot find module 'next/server'
import { type NextRequest, NextResponse } from 'next/server';

export function updateSession(request: NextRequest) {
  return NextResponse.next({ request });
}
