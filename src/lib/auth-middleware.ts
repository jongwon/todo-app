import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions)
    return session?.user?.id || null
  } catch (error) {
    console.error('인증 확인 오류:', error)
    return null
  }
}

export function createAuthenticatedResponse(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  })
}