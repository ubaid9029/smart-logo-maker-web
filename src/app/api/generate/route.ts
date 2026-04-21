import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { authenticateRequest, securityResponse, logApiUsage } from '@/lib/apiSecurity';

const SUPPORTED_COLOR_IDS = new Set(['1', '2', '3', '4', '5', '6']);
const DEFAULT_INDUSTRY_ID = 23;
const DEFAULT_FONT_ID = '1';
const DEFAULT_COLOR_ID = '1';
const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

const buildGenerationPayload = ({ name, slogan, industryId, fontId, colorId }: { name: string; slogan: string; industryId: number | string; fontId: string | number; colorId: string | number }) => ({
  name,
  slogan,
  industry: Number(industryId),
  font: String(fontId),
  color: String(colorId),
  icon_lists: [],
  vDesigners: [1],
  gtoken: '',
  data: [],
  dataPage: 0,
  flippedTplIds: [],
  icon_page: 1,
  industryIconIds: [],
  matchedIconHash: 'd41d8cd98f00b204e9800998ecf8427e',
  matchedIconIds: [0],
  miniopenid: '',
  p: 2,
  precomNum: 0,
  predouNum: 91,
  select: '55540,55014,54795,54792,54558,54559',
  selecthash: '17a53c0794d9bcd3ddd8c382fccabb58',
  selectlog: '54559,48016,47543',
  vDesignerTpls: null,
  wechatMiniAppId: '',
});

const parseRemotePayload = async (response: Response) => {
  const rawText = await response.text();
  if (!rawText) return null;
  try {
    return JSON.parse(rawText);
  } catch {
    return { message: rawText.slice(0, 400) };
  }
};

const jsonNoStore = (body: unknown, init?: ResponseInit) => NextResponse.json(body, {
  ...init,
  headers: {
    ...NO_STORE_HEADERS,
    ...(init?.headers || {}),
  },
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Unified Security & Authentication Check
  const auth = await authenticateRequest(request, user);
  if (!auth.isValid) {
    return securityResponse(auth.error, auth.status);
  }

  const { ip, userId, keyId } = auth;
  const endpoint = '/api/generate';
  const method = 'POST';

  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name : '';
    const slogan = typeof body.slogan === 'string' ? body.slogan : '';
    const industryId = body.industryId ?? DEFAULT_INDUSTRY_ID;
    const fontId = body.fontId || DEFAULT_FONT_ID;
    const colorId = body.colorId || DEFAULT_COLOR_ID;

    if (!name.trim()) {
      await logApiUsage({ userId, keyId, endpoint, method, statusCode: 400, ip });
      return jsonNoStore({ error: 'Business name is required.' }, { status: 400 });
    }

    if (!SUPPORTED_COLOR_IDS.has(String(colorId))) {
      await logApiUsage({ userId, keyId, endpoint, method, statusCode: 400, ip });
      return jsonNoStore({ error: 'Selected color palette is not supported.' }, { status: 400 });
    }

    const response = await fetch('https://www.logoai.com/api/getAllInfo', {
      method: 'POST',
      cache: 'no-store',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        Origin: 'https://www.logoai.com',
        Referer: 'https://www.logoai.com',
        'User-Agent': 'Mozilla/5.0',
      },
      body: JSON.stringify(buildGenerationPayload({ name, slogan, industryId, fontId, colorId })),
      signal: AbortSignal.timeout(20000),
    });

    const data = await parseRemotePayload(response);

    if (!response.ok) {
      const statusCode = response.status >= 400 && response.status < 600 ? response.status : 502;
      const remoteMessage = typeof data?.message === 'string' ? data.message : `LogoAI Error ${response.status}`;

      await logApiUsage({ userId, keyId, endpoint, method, statusCode, ip });
      return jsonNoStore({ error: 'API call failed', details: remoteMessage }, { status: statusCode });
    }

    // Save to logo_history table for API-generated logos
    if (userId) {
      try {
        const { createClient: createSupabase } = await import('@supabase/supabase-js');
        const adminSupabase = createSupabase(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        await adminSupabase.from('logo_history').insert({
          user_id: userId,
          business_name: name,
          slogan: slogan || '',
          industry_id: Number(industryId),
          api_key_id: keyId || null,
          logo_data: data, // Full LogoAI API response
        });

        console.log(`Logo history saved for user: ${userId}`);
      } catch (err) {
        console.error('Failed to save to logo_history:', err);
      }
    }

    await logApiUsage({ userId, keyId, endpoint, method, statusCode: 200, ip });
    return jsonNoStore(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await logApiUsage({ userId, keyId, endpoint, method, statusCode: 500, ip });
    return jsonNoStore({ error: 'API call failed', details: message }, { status: 500 });
  }
}
