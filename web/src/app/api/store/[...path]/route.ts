import { NextRequest, NextResponse } from 'next/server';

// Disable caching for all store API routes
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://127.0.0.1:9000';
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || 'pk_427cce2a75049dde35ff19cb44f3fc18cc1109893df8c6870064cf64bbff283e';

function buildHeaders(request: NextRequest): HeadersInit {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_API_KEY,
    };

    // Forward cookies for authentication
    const cookie = request.headers.get('cookie');
    if (cookie) {
        headers['cookie'] = cookie;
    }

    // Forward authorization header if present
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${MEDUSA_BACKEND_URL}/store/${path.join('/')}${searchParams ? `?${searchParams}` : ''}`;

    const auth = request.headers.get('authorization');
    console.log('[API Proxy] GET:', url);
    console.log('[API Proxy] Auth header received:', auth ? 'Yes (Bearer...)' : 'No');

    const response = await fetch(url, {
        method: 'GET',
        headers: buildHeaders(request),
        credentials: 'include',
    });

    if (!response.ok) {
        const text = await response.text();
        console.error(`[API Proxy] GET Error ${response.status} from ${url}:`, text.substring(0, 500));

        try {
            const data = JSON.parse(text);
            return NextResponse.json(data, { status: response.status });
        } catch {
            return NextResponse.json(
                { message: `API returned ${response.status}`, type: 'error', detail: text.substring(0, 200) },
                { status: response.status }
            );
        }
    }

    const contentType = response.headers.get('content-type');

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { status: response.status });
    forwardCookies(response, nextResponse);

    // Disable caching for dynamic content
    nextResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

    return nextResponse;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${MEDUSA_BACKEND_URL}/store/${path.join('/')}${searchParams ? `?${searchParams}` : ''}`;

    console.log('[API Proxy] POST:', url);

    let body;
    try {
        body = await request.json();
    } catch {
        body = {};
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(request),
        body: JSON.stringify(body),
        credentials: 'include',
    });

    if (!response.ok) {
        const text = await response.text();
        console.error(`[API Proxy] POST Error ${response.status} from ${url}:`, text.substring(0, 500));

        try {
            const data = JSON.parse(text);
            return NextResponse.json(data, { status: response.status });
        } catch {
            return NextResponse.json(
                { message: `API returned ${response.status}`, type: 'error', detail: text.substring(0, 200) },
                { status: response.status }
            );
        }
    }

    const contentType = response.headers.get('content-type');

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { status: response.status });
    forwardCookies(response, nextResponse);

    // Disable caching for dynamic content
    nextResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

    return nextResponse;
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const url = `${MEDUSA_BACKEND_URL}/store/${path.join('/')}`;

    console.log('[API Proxy] DELETE:', url);

    const response = await fetch(url, {
        method: 'DELETE',
        headers: buildHeaders(request),
        credentials: 'include',
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        return NextResponse.json(
            { message: `API returned ${response.status}`, type: 'error' },
            { status: response.status }
        );
    }

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { status: response.status });
    forwardCookies(response, nextResponse);

    // Disable caching for dynamic content
    nextResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

    return nextResponse;
}
