import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const isLoginPage = pathname === '/students/login';
    const isLoginApi = pathname === '/api/auth/login';
    const sessionId = request.cookies.get('session_id');

    // API 요청에 대한 세션 체크 (로그인 API 제외)
    if (pathname.startsWith('/api/') && !isLoginApi && !isLoginPage) {
        if (!sessionId) {
            return new NextResponse(
                JSON.stringify({ error: '세션이 만료되었습니다' }),
                { 
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
    }

    // 기존 리다이렉트 로직
    if (!isLoginPage && !sessionId && pathname.startsWith('/students')) {
        return NextResponse.redirect(new URL('/students/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/students/:path*',
        '/api/:path*',
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}; 