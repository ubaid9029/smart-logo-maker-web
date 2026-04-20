'use server';

import { createClient } from '@/lib/supabaseServer';
import crypto from 'crypto';

/**
 * Generates a professional API key and stores its hash in Supabase.
 */
export async function createApiKey(name = 'Default Key') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // 1. Generate the raw key (Shown only once)
  const randomBytes = crypto.randomBytes(24).toString('hex');
  const rawKey = `sk_live_${randomBytes}`;

  // 2. Create a secure hash (Stored in DB)
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

  // 3. Create a preview (e.g., sk_live_...abcd)
  const keyPreview = `${rawKey.slice(0, 12)}...${rawKey.slice(-4)}`;

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      user_id: user.id,
      name,
      key_hash: keyHash,
      key_preview: keyPreview,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    console.error('Key Creation Error:', error);
    throw new Error('Failed to create API key');
  }

  return {
    ...data,
    rawKey // Return raw key only this one time
  };
}

/**
 * Fetches user's API keys (Previews only)
 */
export async function getApiKeys() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch Keys Error:', error);
    return [];
  }

  return data;
}

/**
 * Revokes/Deletes an API key
 */
export async function deleteApiKey(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error('Failed to revoke key');
  }

  return { success: true };
}

/**
 * Fetches API usage statistics for the dashboard
 */
export async function getUsageStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // Fetch usage from last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase
    .from('api_usage')
    .select('created_at, endpoint, status_code')
    .eq('user_id', user.id)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch Stats Error:', error);
    return [];
  }

  return data;
}

/**
 * [ADMIN ONLY] Fetches global API usage statistics for all users
 */
export async function getGlobalUsageStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Security: Check if user is the designated admin
  // IMPORTANT: You can change this to any email you want to authorize as admin
  const ADMIN_EMAIL = 'ubaid9029@gmail.com'; 
  
  if (user?.email !== ADMIN_EMAIL) {
    return { error: 'Unauthorized', data: [] };
  }

  // Fetch total usage stats
  const { data, error } = await supabase
    .from('api_usage')
    .select('created_at, endpoint, status_code, user_id')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    console.error('Admin Stats Error:', error);
    return { error: 'DB Error', data: [] };
  }

  return { data };
}
