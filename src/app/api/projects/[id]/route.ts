import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UpdateProjectData } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { tasks: true }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: '프로젝트를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('프로젝트 조회 오류:', error)
    return NextResponse.json(
      { error: '프로젝트를 조회할 수 없습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: UpdateProjectData = await request.json()
    
    const project = await prisma.project.update({
      where: { id: params.id },
      data: body,
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('프로젝트 수정 오류:', error)
    return NextResponse.json(
      { error: '프로젝트를 수정할 수 없습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.project.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: '프로젝트가 삭제되었습니다.' })
  } catch (error) {
    console.error('프로젝트 삭제 오류:', error)
    return NextResponse.json(
      { error: '프로젝트를 삭제할 수 없습니다.' },
      { status: 500 }
    )
  }
}