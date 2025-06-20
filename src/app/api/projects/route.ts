import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { CreateProjectData } from '@/types'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      include: {
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('프로젝트 조회 오류:', error)
    return NextResponse.json(
      { error: '프로젝트를 조회할 수 없습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const body: CreateProjectData = await request.json()
    
    const project = await prisma.project.create({
      data: {
        title: body.title,
        description: body.description,
        color: body.color || '#3B82F6',
        userId: session.user.id
      },
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('프로젝트 생성 오류:', error)
    return NextResponse.json(
      { error: '프로젝트를 생성할 수 없습니다.' },
      { status: 500 }
    )
  }
}