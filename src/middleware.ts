import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Session client (anon key + user cookies) — used for auth only
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
  // Ban check — uses service role key to bypass RLS
  // Runs for all logged-in users on any path except /banned
  // -------------------------------------------------------
  if (user && pathname !== '/banned') {
    // Service role client bypasses RLS so we always get the real ban status
    const adminSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('is_banned, ban_expires_at')
      .eq('id', user.id)
      .single()

    if (profile?.is_banned) {
      const now = new Date()
      const expiresAt = profile.ban_expires_at ? new Date(profile.ban_expires_at) : null

      if (expiresAt && expiresAt <= now) {
        // Timed ban has expired — auto-unban via service role
        await adminSupabase
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
