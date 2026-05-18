import { NextRequest, NextResponse } from 'next/server'

const AUTH_PATHS = ['/login', '/register']
const PUBLIC_PREFIXES = ['/_next', '/favicon.ico', '/public']
const PUBLIC_EXACT = ['/']

/**
 * UI-level route guard.
 *
 * `has_session` is an httpOnly cookie set exclusively by the NestJS backend on
 * successful login/register/refresh, and cleared on logout or explicit revoke.
 * Because it is httpOnly, browser-side JavaScript cannot forge it — a meaningful
 * security boundary above the previous JS-writable `auth_session` approach.
 *
 * This middleware still does NOT cryptographically verify the JWT; real
 * authorisation is enforced by the NestJS JWT guard on every API request.
 * Any user whose tokens have expired will see 401 responses from the backend
 * and will be redirected to /login by the client.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  const isAuthPath = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
  const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))

  if (isPublic) return NextResponse.next()

  const hasSession = request.cookies.has('has_session')

  const isExactPublic = PUBLIC_EXACT.includes(pathname)
  if (isExactPublic) {
    if (hasSession) {
      const dashboardUrl = request.nextUrl.clone()
      dashboardUrl.pathname = '/dashboard'
      return NextResponse.redirect(dashboardUrl)
    }
    return NextResponse.next()
  }

  if (!hasSession && !isAuthPath) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  if (hasSession && isAuthPath) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}