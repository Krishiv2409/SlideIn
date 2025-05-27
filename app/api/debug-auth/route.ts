import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const jwt = cookieStore.get('jwt')

  if (!jwt) {
    return NextResponse.json({ error: 'No JWT found' }, { status: 401 })
  }

  return NextResponse.json({ jwt: jwt.value })
}

export async function DELETE(request: Request) {
  const response = NextResponse.json({ message: 'Logged out successfully' })
  response.cookies.delete('jwt')
  return response
} 