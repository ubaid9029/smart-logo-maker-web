import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { validateApiRequest, securityResponse } from '@/lib/apiSecurity';

const LIBRARY_TABLE = 'favorite_logos';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Security Check (Passing User ID for per-user limit)
  const security = validateApiRequest(request, user?.id);
  if (!security.isValid) {
    return securityResponse(security.error, security.status);
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from(LIBRARY_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Security Check
  const security = validateApiRequest(request, user?.id);
  if (!security.isValid) {
    return securityResponse(security.error, security.status);
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { rowData, favoriteKey } = body;

  const { data, error } = await supabase
    .from(LIBRARY_TABLE)
    .upsert({ ...rowData, user_id: user.id, favorite_key: favoriteKey }, { onConflict: 'user_id,favorite_key' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Security Check
  const security = validateApiRequest(request, user?.id);
  if (!security.isValid) {
    return securityResponse(security.error, security.status);
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const favoriteKey = searchParams.get('favoriteKey');

  if (!favoriteKey) {
    return NextResponse.json({ error: 'Favorite Key is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from(LIBRARY_TABLE)
    .delete()
    .eq('user_id', user.id)
    .eq('favorite_key', favoriteKey);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
