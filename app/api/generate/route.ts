import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Redux se aane wale dynamic values ko extract karna
    const { 
      name = "BRAND", 
      slogan = "", 
      industryId = 23, 
      fontId = "1", 
      colorId = "1" 
    } = body;

    const response = await fetch('https://www.logoai.com/api/getAllInfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Kuch APIs browser-like User-Agent mangti hain block hone se bachne ke liye
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: JSON.stringify({
        "name": name,
        "slogan": slogan,
        "industry": industryId,
        "font": fontId,
        "color": colorId,
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
        "select": "55540,55014,54795,54792,54558,54559,54553,54484,54467,50422,52262,54460,54456,54164,53861,53470,53355,53299,53295,53122,52507,51956,48014,48016,48017,47541,47542,47543,47431,47432,47373,47362,47353,47142,47143,47132,47133,47095,47098,47007,47009,47010,47017,46988,46975,46976,46977,46856,46857,46858,46859,46803,46766,46767,46768,46769,46770,46771,46772,46773,46774,46777,46778,46780,46781,46782,46783,46784,46785,46786,46787,46788,46789,46790,46710,46711,46712,46713,46714,46703,46704,46705,46706,29489,27402,23820,21043,18189,12555,46998,46995",
        "selecthash": "17a53c0794d9bcd3ddd8c382fccabb58",
        "selectlog": "54559,48016,47543,46772,46712,46998",
        "vDesignerTpls": null,
        "wechatMiniAppId": ""
      }),
    });

    if (!response.ok) {
        throw new Error(`LogoAI responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Fetch Error:", error.message);
    return NextResponse.json({ error: "API call failed", details: error.message }, { status: 500 });
  }
}