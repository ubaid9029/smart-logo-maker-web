import { NextResponse, NextRequest } from 'next/server';
import { authenticateRequest, securityResponse, logApiUsage } from '@/lib/apiSecurity';
import { withApiLogger, apiLoggedResponse } from '@/lib/apiLogger';

export const GET = withApiLogger('/api/industries', async function GET(request: NextRequest) {
  // Security Check (Strict Mode)
  const auth = await authenticateRequest(request);
  if (!auth.isValid) {
    return securityResponse(auth.error, auth.status);
  }
  const appSource = auth.type || 'unknown';
  const requestType = auth.keyId ? 'api-key' : 'session';

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
    await logApiUsage({ userId: auth.userId, keyId: auth.keyId, endpoint: '/api/industries', method: 'GET', statusCode: 200, ip: auth.ip });

    return apiLoggedResponse(
      NextResponse.json(data, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }),
      {
        userId: auth.userId,
        apiKeyId: auth.keyId,
        appSource,
        requestType,
        eventName: 'industries_fetch',
        isSuccess: true,
      }
    );
  } catch (error) {
    console.error('Industries API Error (DNS or Fetch Fail):', error);
    await logApiUsage({ userId: auth.userId, keyId: auth.keyId, endpoint: '/api/industries', method: 'GET', statusCode: 500, ip: auth.ip });
    // Return empty array as fallback so UI doesn't break
    return apiLoggedResponse(
      NextResponse.json([], { status: 200 }),
      {
        userId: auth.userId,
        apiKeyId: auth.keyId,
        appSource,
        requestType,
        eventName: 'industries_fetch',
        isSuccess: false,
        errorCode: 'INDUSTRIES_UPSTREAM_ERROR',
      }
    );
  }
});
