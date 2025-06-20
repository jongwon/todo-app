import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { UpdateTaskData } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const task = await prisma.task.findFirst({
      where: { 
        id: params.id,
        userId: session.user.id
      },
      include: {
        project: true
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: '할일을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('할일 조회 오류:', error)
    return NextResponse.json(
      { error: '할일을 조회할 수 없습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const body: UpdateTaskData = await request.json()
    
    // 태스크가 해당 사용자의 것인지 먼저 확인
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: '할일을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    const updateData: any = { ...body }
    if (body.dueDate) {
      updateData.dueDate = new Date(body.dueDate)
    }
    
    const task = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        project: true
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('할일 수정 오류:', error)
    return NextResponse.json(
      { error: '할일을 수정할 수 없습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    // 태스크가 해당 사용자의 것인지 먼저 확인
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: '할일을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    await prisma.task.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: '할일이 삭제되었습니다.' })
  } catch (error) {
    console.error('할일 삭제 오류:', error)
    return NextResponse.json(
      { error: '할일을 삭제할 수 없습니다.' },
      { status: 500 }
    )
  }
}