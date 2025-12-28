import { NextResponse } from 'next/server';
import { ApiError, requestCloudRunJson } from '../../../../lib/apiClient';
import { createErrorId } from '../../../../lib/errorId';

export async function POST(request: Request) {
  const url = new URL(request.url);
  const crm = url.searchParams.get('crm') || 'hubspot';
  const maxBytes = 64 * 1024;
  const contentLength = request.headers.get('content-length');
  if (contentLength && Number(contentLength) > maxBytes) {
    const errorId = createErrorId({
      type: 'request',
      endpoint: '/api/leaks/analyze',
      status: 413,
      code: 'PAYLOAD_TOO_LARGE',
    });
    return NextResponse.json({ error: 'Payload Too Large', errorId }, { status: 413 });
  }

  const body = await request.text();
  const bodySize = new TextEncoder().encode(body).length;
  if (bodySize > maxBytes) {
    const errorId = createErrorId({
      type: 'request',
      endpoint: '/api/leaks/analyze',
      status: 413,
      code: 'PAYLOAD_TOO_LARGE',
    });
    return NextResponse.json({ error: 'Payload Too Large', errorId }, { status: 413 });
  }

  try {
    const data = await requestCloudRunJson(`/api/leaks/analyze?crm=${encodeURIComponent(crm)}`, {
      method: 'POST',
      body: body || undefined,
    });
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const endpoint = '/api/leaks/analyze';
    const errorId =
      error instanceof ApiError
        ? error.errorId
        : createErrorId({ type: 'route', endpoint, status: 500, code: 'UPSTREAM' });

    if (process.env.NODE_ENV !== 'production') {
      console.error('Analyze route error:', error);
    }

    return NextResponse.json(
      { error: 'Internal Server Error', errorId },
      { status: 500 }
    );
  }
}
