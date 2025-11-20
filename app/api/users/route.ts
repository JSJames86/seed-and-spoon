import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Example API route showing how to use Prisma
// You can access this at http://localhost:3000/api/users

export async function GET() {
  try {
    // Query all users from Django's auth_user table
    const users = await prisma.auth_user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        is_active: true,
        date_joined: true,
      },
      where: {
        is_active: true,
      },
      take: 10, // Limit to 10 users
    })

    return NextResponse.json({ users, count: users.length })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// Example: Create a new user (if needed)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, email, password } = body

    // Note: In production, use Django's API for user creation with proper password hashing
    // This is just an example of Prisma's capabilities
    
    const user = await prisma.auth_user.create({
      data: {
        username,
        email,
        password, // WARNING: Never store plain passwords! Use Django's API instead
        is_active: true,
        is_staff: false,
        is_superuser: false,
        date_joined: new Date(),
      },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
