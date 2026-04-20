import { NextResponse } from 'next/server';

const ALLOWED_DOMAIN = 'https://www.smart-logomaker.com';
const ALLOWED_APP_ID = 'com.devsinntechnologies.smartlogomaker';

// In-memory rate limiting (per-instance)
const rateCache = new Map();

/**
 * Validates the API request for origin, app identity, and rate limits.
 * @param {any} request 
 * @param {string|null|undefined} userId 
 */
export function validateApiRequest(request, userId = undefined) {
  const isLocalhost = process.env.NODE_ENV === 'development';
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const appId = request.headers.get('x-app-id');
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

  // 1. Identification Check (Cross-platform)
  const isWeb = origin === ALLOWED_DOMAIN || (isLocalhost && (origin?.includes('localhost') || !origin));
  const isApp = appId === ALLOWED_APP_ID;
  const isAuthorizedPlatform = isWeb || isApp;

  // 2. Bot/Automation Check
  const isAutomationTool = /PostmanRuntime|insomnia|curl|python-requests|axios|fetch-vcr/i.test(userAgent);
  
  if (!isAuthorizedPlatform || (isAutomationTool && !isApp)) {
    return { 
      isValid: false, 
      status: 403, 
      error: 'Unauthorized: Access restricted to official platforms.' 
    };
  }

  // 3. User & IP Rate Limiting
  const limitKey = userId ? `user:${userId}` : `ip:${ip}`;
  
  // Safe URL check for both standard and Next.js request objects
  const url = new URL(request.url);
  const isGenerationApi = url.pathname.includes('/generate');
  
  // Limits: 5 for logo generation, 20 for library operations
  const limit = isGenerationApi ? 5 : 20; 
  const now = Date.now();
  const resetAt = now + (60 * 1000); // 1-minute window

  const entry = rateCache.get(limitKey);
  if (entry && now < entry.resetAt) {
    if (entry.count >= limit) {
      return { 
        isValid: false, 
        status: 429, 
        error: `Too many requests. Please wait a moment before trying again.` 
      };
    }
    entry.count += 1;
  } else {
    rateCache.set(limitKey, { count: 1, resetAt });
  }

  // Cleanup old cache entries occasionally
  if (rateCache.size > 2000) {
    const expiredKeys = [];
    for (const [key, value] of rateCache.entries()) {
      if (now > value.resetAt) expiredKeys.push(key);
    }
    expiredKeys.forEach(k => rateCache.delete(k));
  }

  return { isValid: true, ip, userId };
}

export function securityResponse(error, status) {
  return NextResponse.json(
    { error }, 
    { 
      status, 
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    }
  );
}
