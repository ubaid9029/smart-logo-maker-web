import { NextResponse } from 'next/server';

/**
 * Redirects direct access to the /api base URL to the /api-docs page.
 * This ensures that users visiting the API root in their browser 
 * are greeted with documentation instead of a blank page or error.
 */
export async function GET() {
  return NextResponse.redirect(new URL('/api-docs', process.env.NEXT_PUBLIC_APP_URL || 'https://www.smart-logomaker.com'));
}
