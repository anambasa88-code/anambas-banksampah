// src/middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "kuncirahasia123");

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // ============================================
  // 1. PROTECT API ROUTES
  // ============================================
  if (pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { message: 'Akses ditolak. Silakan login terlebih dahulu.' }, 
        { status: 401 }
      );
    }

    try {
      const { payload } = await jwtVerify(token, SECRET);
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('user-data', JSON.stringify(payload));
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    } catch (error) {
      return NextResponse.json(
        { message: 'Sesi habis atau token tidak valid. Silakan login ulang.' }, 
        { status: 401 }
      );
    }
  }

  // ============================================
  // 2. PROTECT FRONTEND DASHBOARD ROUTES
  // ============================================
  if (pathname.startsWith('/dashboard/')) {
    const token = request.cookies.get('bs_token')?.value;

    // Belum login - redirect ke login
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, SECRET);
      const userRole = payload.peran;

      // Extract role dari pathname: /dashboard/{role}/...
      const pathRole = pathname.split('/')[2]; // nasabah/petugas/admin

      const roleMap = {
        'nasabah': 'NASABAH',
        'petugas': 'PETUGAS',
        'admin': 'ADMIN'
      };

      const requiredRole = roleMap[pathRole];

      // Role mismatch - redirect ke dashboard mereka
      if (requiredRole && userRole !== requiredRole) {
        const userDashboard = `/dashboard/${userRole.toLowerCase()}/dashboard`;
        return NextResponse.redirect(new URL(userDashboard, request.url));
      }

      return NextResponse.next();
    } catch (error) {
      // Token invalid - redirect ke login
      const loginUrl = new URL('/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/users/:path*',
    '/api/management/:path*',
    '/api/petugas/:path*',
    '/api/transaksi/:path*',
    '/dashboard/:path*',
  
  ],
};