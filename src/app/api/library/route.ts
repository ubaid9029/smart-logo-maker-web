import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { authenticateRequest, securityResponse } from '@/lib/apiSecurity';
import { withApiLogger, apiLoggedResponse } from '@/lib/apiLogger';

const LIBRARY_TABLE = 'favorite_logos';

export const GET = withApiLogger('/api/library', async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Security Check (Passing User ID for per-user limit)
  const auth = await authenticateRequest(request, user);
  if (!auth.isValid) {
    return securityResponse(auth.error, auth.status);
  }
  const appSource = auth.type || 'unknown';
  const requestType = auth.keyId ? 'api-key' : 'session';

  if (!user) {
    return apiLoggedResponse(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      {
        userId: auth.userId,
        apiKeyId: auth.keyId,
        appSource,
        requestType,
        eventName: 'favorite_logos_fetch',
        isSuccess: false,
        errorCode: 'UNAUTHORIZED_LIBRARY_ACCESS',
      }
    );
  }

  const { data, error } = await supabase
    .from(LIBRARY_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    return apiLoggedResponse(
      NextResponse.json({ error: error.message }, { status: 500 }),
      {
        userId: user.id,
        apiKeyId: auth.keyId,
        appSource,
        requestType,
        eventName: 'favorite_logos_fetch',
        isSuccess: false,
        errorCode: 'LIBRARY_FETCH_FAILED',
      }
    );
  }

  return apiLoggedResponse(
    NextResponse.json(data),
    {
      userId: user.id,
      apiKeyId: auth.keyId,
      appSource,
      requestType,
      eventName: 'favorite_logos_fetch',
      isSuccess: true,
    }
  );
});

export const POST = withApiLogger('/api/library', async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Security Check
  const auth = await authenticateRequest(request, user);
  if (!auth.isValid) {
    return securityResponse(auth.error, auth.status);
  }
  const appSource = auth.type || 'unknown';
  const requestType = auth.keyId ? 'api-key' : 'session';

  if (!user) {
    return apiLoggedResponse(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      {
        userId: auth.userId,
        apiKeyId: auth.keyId,
        appSource,
        requestType,
        eventName: 'favorite_logo_save',
        isSuccess: false,
        errorCode: 'UNAUTHORIZED_LIBRARY_SAVE',
      }
    );
  }

  const body = await request.json();
  const { rowData, favoriteKey } = body;

  const { data, error } = await supabase
    .from(LIBRARY_TABLE)
    .upsert({ ...rowData, user_id: user.id, favorite_key: favoriteKey }, { onConflict: 'user_id,favorite_key' })
    .select()
    .single();

  if (error) {
    return apiLoggedResponse(
      NextResponse.json({ error: error.message }, { status: 500 }),
      {
        userId: user.id,
        apiKeyId: auth.keyId,
        appSource,
        requestType,
        eventName: 'favorite_logo_save',
        isSuccess: false,
        errorCode: 'LIBRARY_SAVE_FAILED',
      }
    );
  }

  return apiLoggedResponse(
    NextResponse.json(data),
    {
      userId: user.id,
      apiKeyId: auth.keyId,
      appSource,
      requestType,
      eventName: 'favorite_logo_save',
      isSuccess: true,
    }
  );
});

export const DELETE = withApiLogger('/api/library', async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Security Check
  const auth = await authenticateRequest(request, user);
  if (!auth.isValid) {
    return securityResponse(auth.error, auth.status);
  }
  const appSource = auth.type || 'unknown';
  const requestType = auth.keyId ? 'api-key' : 'session';

  if (!user) {
    return apiLoggedResponse(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      {
        userId: auth.userId,
        apiKeyId: auth.keyId,
        appSource,
        requestType,
        eventName: 'favorite_logo_delete',
        isSuccess: false,
        errorCode: 'UNAUTHORIZED_LIBRARY_DELETE',
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const favoriteKey = searchParams.get('favoriteKey');

  if (!favoriteKey) {
    return apiLoggedResponse(
      NextResponse.json({ error: 'Favorite Key is required' }, { status: 400 }),
      {
        userId: user.id,
        apiKeyId: auth.keyId,
        appSource,
        requestType,
        eventName: 'favorite_logo_delete',
        isSuccess: false,
        errorCode: 'FAVORITE_KEY_REQUIRED',
      }
    );
  }

  const { error } = await supabase
    .from(LIBRARY_TABLE)
    .delete()
    .eq('user_id', user.id)
    .eq('favorite_key', favoriteKey);

  if (error) {
    return apiLoggedResponse(
      NextResponse.json({ error: error.message }, { status: 500 }),
      {
        userId: user.id,
        apiKeyId: auth.keyId,
        appSource,
        requestType,
        eventName: 'favorite_logo_delete',
        isSuccess: false,
        errorCode: 'LIBRARY_DELETE_FAILED',
      }
    );
  }

  return apiLoggedResponse(
    NextResponse.json({ success: true }),
    {
      userId: user.id,
      apiKeyId: auth.keyId,
      appSource,
      requestType,
      eventName: 'favorite_logo_delete',
      isSuccess: true,
    }
  );
});
