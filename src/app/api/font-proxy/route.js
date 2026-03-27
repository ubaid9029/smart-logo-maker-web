import { NextResponse } from 'next/server';

const ALLOWED_HOSTS = new Set([
  'logoai.com',
  'www.logoai.com',
]);

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

export async function GET(request) {
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
