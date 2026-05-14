const SENSITIVE_HEADERS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'proxy-authorization',
]);

const MAX_BODY_LENGTH = 4000;

const createLogClient = async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || (!serviceKey && !anonKey)) {
    return null;
  }

  const { createClient } = await import('@supabase/supabase-js');
  return createClient(url, serviceKey || anonKey);
};

const maskHeaderValue = (key, value) => {
  if (SENSITIVE_HEADERS.has(key)) {
    return '[REDACTED]';
  }

  if (typeof value !== 'string') {
    return value;
  }

  return value.length > 500 ? `${value.slice(0, 500)}...[truncated]` : value;
};

const headersToObject = (headers) => {
  const result = {};

  headers.forEach((value, key) => {
    result[key] = maskHeaderValue(key.toLowerCase(), value);
  });

  return result;
};

const truncateValue = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  return value.length > MAX_BODY_LENGTH
    ? `${value.slice(0, MAX_BODY_LENGTH)}...[truncated]`
    : value;
};

const parseJsonSafely = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return truncateValue(value);
  }
};

const readRequestBody = async (request) => {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return null;
  }

  try {
    const clone = request.clone();
    const contentType = clone.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      return await clone.json();
    }

    if (
      contentType.includes('text/') ||
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      const text = await clone.text();
      return truncateValue(text);
    }

    return `[body omitted: ${contentType || 'unknown content-type'}]`;
  } catch (error) {
    return `[unreadable request body: ${error instanceof Error ? error.message : 'unknown error'}]`;
  }
};

const readResponseBody = async (response) => {
  try {
    const clone = response.clone();
    const contentType = clone.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const text = await clone.text();
      return parseJsonSafely(text);
    }

    if (contentType.includes('text/')) {
      return truncateValue(await clone.text());
    }

    return `[body omitted: ${contentType || 'unknown content-type'}]`;
  } catch (error) {
    return `[unreadable response body: ${error instanceof Error ? error.message : 'unknown error'}]`;
  }
};

const getClientIp = (request) => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return request.headers.get('x-real-ip') || '127.0.0.1';
};

const getDeviceDetails = (request) => {
  const userAgent = request.headers.get('user-agent') || '';
  const ua = userAgent.toLowerCase();

  let deviceType = 'desktop';
  if (/mobile|iphone|android(?!.*tablet)/.test(ua)) {
    deviceType = 'mobile';
  } else if (/tablet|ipad/.test(ua)) {
    deviceType = 'tablet';
  } else if (!userAgent) {
    deviceType = 'unknown';
  }

  return {
    type: deviceType,
    userAgent,
  };
};

const getResponseMessage = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return null;
  }

  if (typeof body.message === 'string') return body.message;
  if (typeof body.error === 'string') return body.error;
  if (typeof body.details === 'string') return body.details;
  return null;
};

const normalizeJsonValue = (value) => {
  if (value === undefined) {
    return null;
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeJsonValue(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeJsonValue(item)])
    );
  }

  return value;
};

const inferSuccess = (status, body, explicitValue) => {
  if (typeof explicitValue === 'boolean') {
    return explicitValue;
  }

  if (typeof status === 'number') {
    return status >= 200 && status < 400;
  }

  if (body && typeof body === 'object' && !Array.isArray(body) && typeof body.success === 'boolean') {
    return body.success;
  }

  return null;
};

const persistApiLog = async (entry) => {
  try {
    const supabase = await createLogClient();
    if (!supabase) {
      return;
    }

    const { error } = await supabase.from('api_request_logs').insert(entry);
    if (error) {
      console.error('api_request_logs insert failed:', error.message);
    }
  } catch (error) {
    console.error('api_request_logs insert failed:', error);
  }
};

export const apiLoggedResponse = (response, logMeta = {}) => ({
  response,
  logMeta,
});

export function withApiLogger(endpoint, handler) {
  return async function loggedRouteHandler(request, context) {
    const startedAt = Date.now();
    const url = new URL(request.url);
    const requestBody = await readRequestBody(request);

    const baseLog = {
      timestamp: new Date().toISOString(),
      endpoint,
      method: request.method,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams.entries()),
      ip: getClientIp(request),
      origin: request.headers.get('origin') || null,
      referer: request.headers.get('referer') || null,
      headers: headersToObject(request.headers),
      device: getDeviceDetails(request),
      requestBody,
    };

    try {
      const result = await handler(request, context);
      const response = result instanceof Response ? result : result?.response;
      const logMeta = result instanceof Response ? {} : result?.logMeta || {};

      if (!(response instanceof Response)) {
        throw new Error('Route handler did not return a valid Response object.');
      }

      const responseBody = await readResponseBody(response);
      const responseMessage = getResponseMessage(responseBody);
      const durationMs = Date.now() - startedAt;
      const logEntry = {
        endpoint,
        method: request.method,
        path: url.pathname,
        query_params: normalizeJsonValue(Object.fromEntries(url.searchParams.entries())),
        user_id: logMeta.userId || null,
        api_key_id: logMeta.apiKeyId || null,
        ip_address: baseLog.ip,
        origin: baseLog.origin,
        referer: baseLog.referer,
        device_type: baseLog.device.type,
        user_agent: baseLog.device.userAgent || null,
        request_headers: normalizeJsonValue(baseLog.headers),
        request_body: normalizeJsonValue(requestBody),
        response_status: response.status,
        response_headers: normalizeJsonValue(headersToObject(response.headers)),
        response_message: logMeta.responseMessage || responseMessage,
        response_body: normalizeJsonValue(responseBody),
        duration_ms: durationMs,
        app_source: logMeta.appSource || null,
        request_type: logMeta.requestType || null,
        event_name: logMeta.eventName || null,
        is_success: inferSuccess(response.status, responseBody, logMeta.isSuccess),
        business_name: logMeta.businessName || null,
        industry_id: logMeta.industryId ?? null,
        logo_count: Number(logMeta.logoCount) || 0,
        error_code: logMeta.errorCode || null,
      };

      console.info(
        '[api-log]',
        JSON.stringify({
          ...baseLog,
          durationMs,
          responseStatus: response.status,
          responseHeaders: headersToObject(response.headers),
          responseMessage: responseMessage,
          responseBody,
        })
      );

      await persistApiLog(logEntry);

      return response;
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      const failureEntry = {
        endpoint,
        method: request.method,
        path: url.pathname,
        query_params: normalizeJsonValue(Object.fromEntries(url.searchParams.entries())),
        user_id: null,
        api_key_id: null,
        ip_address: baseLog.ip,
        origin: baseLog.origin,
        referer: baseLog.referer,
        device_type: baseLog.device.type,
        user_agent: baseLog.device.userAgent || null,
        request_headers: normalizeJsonValue(baseLog.headers),
        request_body: normalizeJsonValue(requestBody),
        response_status: 500,
        response_headers: null,
        response_message: error instanceof Error ? error.message : 'Unhandled route error',
        response_body: null,
        duration_ms: durationMs,
        app_source: null,
        request_type: null,
        event_name: null,
        is_success: false,
        business_name: null,
        industry_id: null,
        logo_count: 0,
        error_code: null,
      };

      console.error(
        '[api-log]',
        JSON.stringify({
          ...baseLog,
          durationMs,
          responseStatus: 500,
          responseMessage: error instanceof Error ? error.message : 'Unhandled route error',
          responseBody: null,
        })
      );

      await persistApiLog(failureEntry);

      throw error;
    }
  };
}
