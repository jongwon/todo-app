import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateTaskData } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    const whereClause = projectId ? { projectId } : {}

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        project: true
      },
      orderBy: {
        createdAt: 'desc'
      }
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
    const body: CreateTaskData = await request.json()
    
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        projectId: body.projectId,
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