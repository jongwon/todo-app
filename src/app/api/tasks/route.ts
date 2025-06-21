import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { CreateTaskData } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const hasDueDate = searchParams.get('hasDueDate')

    let whereClause: any = { userId: session.user.id }

    // 프로젝트 필터
    if (projectId) {
      whereClause.projectId = projectId
    }

    // 날짜 범위 필터
    if (startDate && endDate) {
      whereClause.dueDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } else if (startDate) {
      whereClause.dueDate = {
        gte: new Date(startDate)
      }
    } else if (endDate) {
      whereClause.dueDate = {
        lte: new Date(endDate)
      }
    }

    // 마감일이 있는 할일만 조회
    if (hasDueDate === 'true') {
      whereClause.dueDate = {
        ...whereClause.dueDate,
        not: null
      }
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        project: true
      },
      orderBy: [
        {
          dueDate: 'asc'
        },
        {
          createdAt: 'desc'
        }
      ]
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('할일 조회 오류:', error)
    return NextResponse.json(
      { error: '할일을 조회할 수 없습니다.' },
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

    const body: CreateTaskData = await request.json()
    
    // 프로젝트가 해당 사용자의 것인지 확인
    const project = await prisma.project.findFirst({
      where: {
        id: body.projectId,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: '프로젝트를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        projectId: body.projectId,
        userId: session.user.id,
        status: body.status || 'TODO',
        priority: body.priority || 'MEDIUM',
        dueDate: body.dueDate ? new Date(body.dueDate) : null
      },
      include: {
        project: true
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('할일 생성 오류:', error)
    return NextResponse.json(
      { error: '할일을 생성할 수 없습니다.' },
      { status: 500 }
    )
  }
}