/** Professional API Security Layer - Updated 2026 */
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from './supabaseServer';

const ALLOWED_DOMAINS = [
  'https://www.smart-logomaker.com',
  'https://smart-logomaker.com',
  'http://localhost:3000'
];
const ALLOWED_APP_ID = 'com.devsinntechnologies.smartlogomaker';

// In-memory rate limiting for internal app traffic
const rateCache = new Map();

/**
 * Professional API Key Validation (SHA-256)
 */
export async function validateApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') return null;

  const supabase = await createClient();
  const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, user_id, is_active')
    .eq('key_hash', hashedKey)
    .single();

  if (error || !data || !data.is_active) {
    return null;
  }

  // Update last used timestamp (fire and forget)
  supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', data.id).then();

  return {
    keyId: data.id,
    userId: data.user_id
  };
}

/**
 * Global Usage Logger
 */
export async function logApiUsage({ userId, keyId, endpoint, method, statusCode, ip }) {
  try {
    const supabase = await createClient();
    await supabase.from('api_usage').insert({
      user_id: userId,
      api_key_id: keyId,
      endpoint,
      method,
      status_code: statusCode,
      ip_address: ip
    });
  } catch (err) {
    console.error('Usage Logging Error:', err);
  }
}

/**
 * @param {Request} request
 * @param {any} [sessionUser]
 */
export async function authenticateRequest(request, sessionUser = undefined) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const apiKey = request.headers.get('x-api-key');

  // 1. External API Key Authentication
  if (apiKey) {
    const authRecord = await validateApiKey(apiKey);
    if (!authRecord) {
      return { isValid: false, status: 401, error: 'Invalid or inactive API key.' };
    }

    // External Key Rate Limiting (10 requests per minute)
    const limitKey = `key:${authRecord.keyId}`;
    const now = Date.now();
    const entry = rateCache.get(limitKey);
    const EXTERNAL_LIMIT = 10;

    if (entry && now < entry.resetAt) {
      if (entry.count >= EXTERNAL_LIMIT) {
        return { isValid: false, status: 429, error: 'API Rate limit exceeded (10 calls/min). Please slow down.' };
      }
      entry.count += 1;
    } else {
      rateCache.set(limitKey, { count: 1, resetAt: now + (60 * 1000) });
    }

    return { 
      isValid: true, 
      type: 'external', 
      userId: authRecord.userId, 
      keyId: authRecord.keyId,
      ip 
    };
  }

  // 2. Internal App Authentication (Security layer for web/mobile)
  const isLocalhost = process.env.NODE_ENV === 'development';
  const origin = request.headers.get('origin') || '';
  const referer = request.headers.get('referer') || '';
  const appId = request.headers.get('x-app-id');
  
  // Smart domain matching for smart-logomaker.com (Check Origin OR Referer)
  const isOurDomain = origin.includes('smart-logomaker.com') || referer.includes('smart-logomaker.com');
  const isWeb = isOurDomain || (isLocalhost && (!origin || origin.includes('localhost') || referer.includes('localhost')));
  const isAuthorized = isWeb || appId === ALLOWED_APP_ID;

  if (!isAuthorized) {
    console.error(`Unauthorized API Attempt | Origin: ${origin} | Referer: ${referer} | IP: ${ip}`);
    return { isValid: false, status: 403, error: 'Unauthorized origin or application identity.' };
  }

  // Internal Rate Limiting
  const limitKey = sessionUser ? `user:${sessionUser.id}` : `ip:${ip}`;
  const now = Date.now();
  const resetAt = now + (60 * 1000);
  const entry = rateCache.get(limitKey);

  if (entry && now < entry.resetAt) {
    if (entry.count >= 30) {
      return { isValid: false, status: 429, error: 'Rate limit exceeded. Please try again in a minute.' };
    }
    entry.count += 1;
  } else {
    rateCache.set(limitKey, { count: 1, resetAt });
  }

  return { isValid: true, type: 'internal', userId: sessionUser?.id, ip };
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
