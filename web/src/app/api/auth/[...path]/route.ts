import { NextRequest, NextResponse } from 'next/server';

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || 'pk_427cce2a75049dde35ff19cb44f3fc18cc1109893df8c6870064cf64bbff283e';

function buildHeaders(request: NextRequest): HeadersInit {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_API_KEY,
    };

    const cookie = request.headers.get('cookie');
    if (cookie) {
        headers['cookie'] = cookie;
    }

    const authorization = request.headers.get('authorization');
    if (authorization) {
        headers['authorization'] = authorization;
    }

    return headers;
}

function forwardCookies(medusaResponse: Response, nextResponse: NextResponse): void {
    const setCookie = medusaResponse.headers.get('set-cookie');
    if (setCookie) {
        nextResponse.headers.set('set-cookie', setCookie);
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const url = `${MEDUSA_BACKEND_URL}/auth/${path.join('/')}`;

    let body;
    try {
        body = await request.json();
    } catch {
        body = {};
    }

    console.log('[API Proxy] Auth POST:', url);
    console.log('[API Proxy] Auth Body:', JSON.stringify(body));

    const response = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(request),
        body: JSON.stringify(body),
        credentials: 'include',
    });

    const data = await response.json();
    console.log('[API Proxy] Auth Response:', response.status, JSON.stringify(data));

    const nextResponse = NextResponse.json(data, { status: response.status });
    forwardCookies(response, nextResponse);
    return nextResponse;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const url = `${MEDUSA_BACKEND_URL}/auth/${path.join('/')}`;

    console.log('[API Proxy] Auth GET:', url);

    const response = await fetch(url, {
        method: 'GET',
        headers: buildHeaders(request),
        credentials: 'include',
    });

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { status: response.status });
    forwardCookies(response, nextResponse);
    return nextResponse;
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const url = `${MEDUSA_BACKEND_URL}/auth/${path.join('/')}`;

    console.log('[API Proxy] Auth DELETE:', url);

    const response = await fetch(url, {
        method: 'DELETE',
        headers: buildHeaders(request),
        credentials: 'include',
    });

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { status: response.status });
    forwardCookies(response, nextResponse);
    return nextResponse;
}
