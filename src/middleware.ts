import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/predictions', '/leaderboard', '/profile', '/admin']
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  // Auth routes (redirect to dashboard if already logged in)
  const authPaths = ['/login', '/register', '/reset-password']
  const isAuthPath = authPaths.some((p) => pathname.startsWith(p))

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (user && isAuthPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // -------------------------------------------------------
  // Ban check — runs for all logged-in users except on /banned itself
  // -------------------------------------------------------
  if (user && pathname !== '/banned') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_banned, ban_expires_at')
      .eq('id', user.id)
      .single()

    if (profile?.is_banned) {
      const now = new Date()
      const expiresAt = profile.ban_expires_at ? new Date(profile.ban_expires_at) : null

      if (expiresAt && expiresAt <= now) {
        // Timed ban has expired — auto-unban using service role key if available,
        // otherwise fall back to anon client (RLS must allow self-update or use trigger)
        await supabase
          .from('profiles')
          .update({
            is_banned: false,
            ban_reason: null,
            ban_message: null,
            ban_expires_at: null,
            banned_by: null,
            banned_at: null,
          })
          .eq('id', user.id)
        // Allow through — ban has expired
      } else {
        // Still banned — redirect to /banned page
        const url = request.nextUrl.clone()
        url.pathname = '/banned'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
