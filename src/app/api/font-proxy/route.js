import { NextResponse } from 'next/server';
import { EDITOR_FONT_CATALOG } from '../../../lib/editorFonts';
import { authenticateRequest, securityResponse } from '../../../lib/apiSecurity';

const ALLOWED_HOSTS = new Set([
  'logoai.com',
  'www.logoai.com',
  'fonts.gstatic.com',
]);

const GOOGLE_FONTS_CSS_ENDPOINT = 'https://fonts.googleapis.com/css2';
const FONT_CSS_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

const resolveFontContentType = (headers, url) => {
  const headerType = headers.get('content-type');
  if (headerType) {
    return headerType;
  }

  const pathname = new URL(url).pathname.toLowerCase();
  if (pathname.endsWith('.otf')) return 'font/otf';
  if (pathname.endsWith('.ttf')) return 'font/ttf';
  if (pathname.endsWith('.woff2')) return 'font/woff2';
  if (pathname.endsWith('.woff')) return 'font/woff';
  return 'application/octet-stream';
};

const extractGoogleFontAssetUrl = (cssText) => {
  if (typeof cssText !== 'string' || !cssText.trim()) {
    return null;
  }

  const woff2Match = cssText.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/i);
  if (woff2Match?.[1]) {
    return woff2Match[1];
  }

  const fallbackMatch = cssText.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/i);
  return fallbackMatch?.[1] || null;
};

const fetchCuratedGoogleFont = async (family, weightParam) => {
  const fontOption = EDITOR_FONT_CATALOG.find((item) => item.family === family);
  if (!fontOption) {
    return NextResponse.json({ error: 'Font family is not allowed.' }, { status: 400 });
  }

  const safeWeight = [400, 500, 600, 700].includes(Number(weightParam)) ? Number(weightParam) : 400;
  const cssUrl = `${GOOGLE_FONTS_CSS_ENDPOINT}?family=${encodeURIComponent(fontOption.queryFamily)}:wght@${safeWeight}&display=swap`;
  const cssResponse = await fetch(cssUrl, {
    cache: 'force-cache',
    next: { revalidate: 86400 },
    headers: {
      'user-agent': FONT_CSS_USER_AGENT,
    },
  });

  if (!cssResponse.ok) {
    return NextResponse.json({ error: 'Unable to resolve font family.' }, { status: cssResponse.status });
  }

  const cssText = await cssResponse.text();
  const assetUrl = extractGoogleFontAssetUrl(cssText);
  if (!assetUrl) {
    return NextResponse.json({ error: 'Unable to locate font asset.' }, { status: 502 });
  }

  const fontResponse = await fetch(assetUrl, {
    cache: 'force-cache',
    next: { revalidate: 86400 },
  });

  if (!fontResponse.ok) {
    return NextResponse.json({ error: 'Unable to fetch font asset.' }, { status: fontResponse.status });
  }

  const fontBuffer = await fontResponse.arrayBuffer();

  return new NextResponse(fontBuffer, {
    headers: {
      'content-type': resolveFontContentType(fontResponse.headers, assetUrl),
      'cache-control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
};

export async function GET(request) {
  // Security Check
  const auth = await authenticateRequest(request);
  if (!auth.isValid) {
    return securityResponse(auth.error, auth.status);
  }

  const fontFamily = request.nextUrl.searchParams.get('family');
  if (fontFamily) {
    try {
      return await fetchCuratedGoogleFont(fontFamily, request.nextUrl.searchParams.get('weight'));
    } catch {
      return NextResponse.json({ error: 'Font proxy request failed.' }, { status: 502 });
    }
  }

  const sourceUrl = request.nextUrl.searchParams.get('src');
  if (!sourceUrl) {
    return NextResponse.json({ error: 'Missing src parameter.' }, { status: 400 });
  }

  let upstreamUrl;
  try {
    upstreamUrl = new URL(sourceUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid src parameter.' }, { status: 400 });
  }

  if (!['http:', 'https:'].includes(upstreamUrl.protocol) || !ALLOWED_HOSTS.has(upstreamUrl.hostname)) {
    return NextResponse.json({ error: 'Font host is not allowed.' }, { status: 400 });
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      cache: 'force-cache',
      next: { revalidate: 86400 },
    });

    if (!upstreamResponse.ok) {
      return NextResponse.json({ error: 'Unable to fetch font asset.' }, { status: upstreamResponse.status });
    }

    const fontBuffer = await upstreamResponse.arrayBuffer();

    return new NextResponse(fontBuffer, {
      headers: {
        'content-type': resolveFontContentType(upstreamResponse.headers, upstreamUrl.toString()),
        'cache-control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Font proxy request failed.' }, { status: 502 });
  }
}
