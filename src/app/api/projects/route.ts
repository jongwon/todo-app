import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateProjectData } from '@/types'

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: {
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
    const body: CreateProjectData = await request.json()
    
    const project = await prisma.project.create({
      data: {
        title: body.title,
        description: body.description,
        color: body.color || '#3B82F6'
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