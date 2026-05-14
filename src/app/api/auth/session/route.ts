import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabaseServer";
import { withApiLogger, apiLoggedResponse } from "@/lib/apiLogger";

export const GET = withApiLogger('/api/auth/session', async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return apiLoggedResponse(
        NextResponse.json({ user: null, error: error.message }, { status: 200 }),
        {
          userId: null,
          appSource: 'internal',
          requestType: 'session',
          eventName: 'auth_session_read',
          isSuccess: false,
          errorCode: 'AUTH_SESSION_READ_FAILED',
        }
      );
    }

    return apiLoggedResponse(
      NextResponse.json({ user: user || null }, { status: 200 }),
      {
        userId: user?.id || null,
        appSource: 'internal',
        requestType: 'session',
        eventName: 'auth_session_read',
        isSuccess: true,
      }
    );
  } catch (error) {
    return apiLoggedResponse(
      NextResponse.json(
        { user: null, error: error instanceof Error ? error.message : "Unable to resolve auth session" },
        { status: 200 }
      ),
      {
        userId: null,
        appSource: 'internal',
        requestType: 'session',
        eventName: 'auth_session_read',
        isSuccess: false,
        errorCode: 'AUTH_SESSION_UNHANDLED_ERROR',
      }
    );
  }
});
