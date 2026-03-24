import { NextResponse, NextRequest } from 'next/server';

const SUPPORTED_COLOR_IDS = new Set(['1', '2', '3', '4', '5', '6']);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const name = typeof body.name === "string" ? body.name : "";
    const slogan = typeof body.slogan === "string" ? body.slogan : "";
    const industryId = body.industryId;
    const fontId = body.fontId;
    const colorId = body.colorId;

    if (!name.trim()) {
      return NextResponse.json({ error: "Business name is required." }, { status: 400 });
    }

    if (!slogan.trim()) {
      return NextResponse.json({ error: "Slogan is required." }, { status: 400 });
    }

    if (industryId === undefined || industryId === null) {
      return NextResponse.json({ error: "Industry selection is required." }, { status: 400 });
    }

    if (!fontId) {
      return NextResponse.json({ error: "Font selection is required." }, { status: 400 });
    }

    if (!colorId) {
      return NextResponse.json({ error: "Color selection is required." }, { status: 400 });
    }

    if (!SUPPORTED_COLOR_IDS.has(String(colorId))) {
      return NextResponse.json({ error: "Selected color palette is not supported." }, { status: 400 });
    }

    const response = await fetch('https://www.logoai.com/api/getAllInfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://www.logoai.com',
        'Referer': 'https://www.logoai.com',
        'User-Agent': 'Mozilla/5.0',
      },
      body: JSON.stringify({
        "name": name,
        "slogan": slogan,
        "industry": Number(industryId),
        "font": String(fontId),
        "color": String(colorId),
        "icon_lists": [],
        "vDesigners": [1],
        "gtoken": "",
        "data": [],
        "dataPage": 0,
        "flippedTplIds": [],
        "icon_page": 1,
        "industryIconIds": [],
        "matchedIconHash": "d41d8cd98f00b204e9800998ecf8427e",
        "matchedIconIds": [0],
        "miniopenid": "",
        "p": 2,
        "precomNum": 0,
        "predouNum": 91,
        "select": "55540,55014,54795,54792,54558,54559",
        "selecthash": "17a53c0794d9bcd3ddd8c382fccabb58",
        "selectlog": "54559,48016,47543",
        "vDesignerTpls": null,
        "wechatMiniAppId": ""
      }),
    });

    if (!response.ok) {
        let remoteMessage = `LogoAI responded with ${response.status}`;
        try {
          const errorPayload = await response.json();
          if (typeof errorPayload?.message === 'string') {
            remoteMessage = errorPayload.message;
          }
        } catch {
          // Ignore response parsing issues and keep status-based message.
        }

        throw new Error(remoteMessage);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Fetch Error:", message);
    return NextResponse.json({ error: "API call failed", details: message }, { status: 500 });
  }
}
