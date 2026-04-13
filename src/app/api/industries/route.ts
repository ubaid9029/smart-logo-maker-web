import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://www.logoai.com/api/logo/industries', {
      headers: {
        Accept: 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0',
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
    console.error('Industries API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch industries' }, { status: 500 });
  }
}
