import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const url = new URL(request.url);
  const crm = url.searchParams.get('crm') || 'hubspot';
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || '';

  if (!apiBaseUrl) {
    return NextResponse.json(
      { error: 'Missing NEXT_PUBLIC_API_BASE_URL' },
      { status: 500 }
    );
  }

  const upstreamUrl = `${apiBaseUrl.replace(/\/$/, '')}/api/leaks/analyze?crm=${encodeURIComponent(
    crm
  )}`;
  const body = await request.text();

  const upstreamResponse = await fetch(upstreamUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'x-api-key': apiKey } : {}),
    },
    body: body || undefined,
  });

  if (!upstreamResponse.ok) {
    const message = await upstreamResponse.text();
    return NextResponse.json(
      { error: message || 'Upstream request failed' },
      { status: upstreamResponse.status }
    );
  }

  const data = await upstreamResponse.json();
  return NextResponse.json(data, { status: 200 });
}
