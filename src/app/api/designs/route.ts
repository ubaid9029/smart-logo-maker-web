/** Smart Designs API - Professional Unified Auth */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { authenticateRequest, securityResponse } from '@/lib/apiSecurity';

const DESIGNS_TABLE = 'designs';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Security Check (Passing User ID for per-user limit)
  const auth = await authenticateRequest(request, user);
  if (!auth.isValid) {
    return securityResponse(auth.error, auth.status);
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from(DESIGNS_TABLE)
    .select('id, user_id, image_path, design_json, created_at, updated_at')
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
  const auth = await authenticateRequest(request, user);
  if (!auth.isValid) {
    return securityResponse(auth.error, auth.status);
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
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

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Security Check
  const auth = await authenticateRequest(request, user);
  if (!auth.isValid) {
    return securityResponse(auth.error, auth.status);
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from(DESIGNS_TABLE)
    .delete()
    .eq('user_id', user.id)
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
