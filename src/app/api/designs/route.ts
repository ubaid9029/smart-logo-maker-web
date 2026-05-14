/** Smart Designs API - Professional Unified Auth */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { authenticateRequest, securityResponse } from '@/lib/apiSecurity';
import { withApiLogger, apiLoggedResponse } from '@/lib/apiLogger';

const DESIGNS_TABLE = 'designs';

export const GET = withApiLogger('/api/designs', async function GET(request: NextRequest) {
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
        eventName: 'designs_fetch',
        isSuccess: false,
        errorCode: 'UNAUTHORIZED_DESIGNS_FETCH',
      }
    );
  }

  const { data, error } = await supabase
    .from(DESIGNS_TABLE)
    .select('id, user_id, image_path, design_json, created_at, updated_at')
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
        eventName: 'designs_fetch',
        isSuccess: false,
        errorCode: 'DESIGNS_FETCH_FAILED',
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
      eventName: 'designs_fetch',
      isSuccess: true,
    }
  );
});

export const POST = withApiLogger('/api/designs', async function POST(request: NextRequest) {
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
        eventName: 'design_save',
        isSuccess: false,
        errorCode: 'UNAUTHORIZED_DESIGN_SAVE',
      }
    );
  }

  const body = await request.json();
  const { designJson, imagePath, id } = body;

  if (id) {
    // Update
    const { data, error } = await supabase
      .from(DESIGNS_TABLE)
      .update({
        design_json: designJson,
        image_path: imagePath,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('id', id)
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
          eventName: 'design_update',
          isSuccess: false,
          errorCode: 'DESIGN_UPDATE_FAILED',
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
        eventName: 'design_update',
        isSuccess: true,
      }
    );
  } else {
    // Insert
    const { data, error } = await supabase
      .from(DESIGNS_TABLE)
      .insert({
        user_id: user.id,
        design_json: designJson,
        image_path: imagePath,
      })
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
          eventName: 'design_save',
          isSuccess: false,
          errorCode: 'DESIGN_SAVE_FAILED',
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
        eventName: 'design_save',
        isSuccess: true,
      }
    );
  }
});

export const DELETE = withApiLogger('/api/designs', async function DELETE(request: NextRequest) {
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
        eventName: 'design_delete',
        isSuccess: false,
        errorCode: 'UNAUTHORIZED_DESIGN_DELETE',
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return apiLoggedResponse(
      NextResponse.json({ error: 'ID is required' }, { status: 400 }),
      {
        userId: user.id,
        apiKeyId: auth.keyId,
        appSource,
        requestType,
        eventName: 'design_delete',
        isSuccess: false,
        errorCode: 'DESIGN_ID_REQUIRED',
      }
    );
  }

  const { error } = await supabase
    .from(DESIGNS_TABLE)
    .delete()
    .eq('user_id', user.id)
    .eq('id', id);

  if (error) {
    return apiLoggedResponse(
      NextResponse.json({ error: error.message }, { status: 500 }),
      {
        userId: user.id,
        apiKeyId: auth.keyId,
        appSource,
        requestType,
        eventName: 'design_delete',
        isSuccess: false,
        errorCode: 'DESIGN_DELETE_FAILED',
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
      eventName: 'design_delete',
      isSuccess: true,
    }
  );
});
