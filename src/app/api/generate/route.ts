import { NextResponse, NextRequest } from 'next/server';

const SUPPORTED_COLOR_IDS = new Set(['1', '2', '3', '4', '5', '6']);
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

  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText);
  } catch {
    return {
      message: rawText.slice(0, 400),
    };
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
  try {
    const body = await request.json();

    const name = typeof body.name === 'string' ? body.name : '';
    const slogan = typeof body.slogan === 'string' ? body.slogan : '';
    const industryId = body.industryId;
    const fontId = body.fontId;
    const colorId = body.colorId;

    if (!name.trim()) {
      return jsonNoStore({ error: 'Business name is required.' }, { status: 400 });
    }

    if (industryId === undefined || industryId === null) {
      return jsonNoStore({ error: 'Industry selection is required.' }, { status: 400 });
    }

    if (!fontId) {
      return jsonNoStore({ error: 'Font selection is required.' }, { status: 400 });
    }

    if (!colorId) {
      return jsonNoStore({ error: 'Color selection is required.' }, { status: 400 });
    }

    if (!SUPPORTED_COLOR_IDS.has(String(colorId))) {
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
      const remoteMessage = typeof data?.message === 'string'
        ? data.message
        : `LogoAI responded with ${response.status}`;

      return jsonNoStore(
        { error: 'API call failed', details: remoteMessage },
        { status: response.status >= 400 && response.status < 600 ? response.status : 502 }
      );
    }

    return jsonNoStore(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const normalizedMessage = /fetch failed|network|connect|timeout/i.test(message)
      ? 'Unable to reach the logo generation service right now. Please try again in a moment.'
      : message;

    console.error('Fetch Error:', message);
    return jsonNoStore({ error: 'API call failed', details: normalizedMessage }, { status: 500 });
  }
}

