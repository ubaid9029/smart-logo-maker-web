import { NextResponse, NextRequest } from 'next/server';
import { authenticateRequest, securityResponse } from '@/lib/apiSecurity';

export async function GET(request: NextRequest) {
  // Security Check (Strict Mode)
  const auth = await authenticateRequest(request);
  if (!auth.isValid) {
    return securityResponse(auth.error, auth.status);
  }

  try {
    const response = await fetch('https://www.logoai.com/api/logo/industries', {
      headers: {
        Accept: 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API failed with status ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Industries API Error (DNS or Fetch Fail):', error);
    // Return empty array as fallback so UI doesn't break
    return NextResponse.json([], { status: 200 });
  }
}
