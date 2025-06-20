'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, FolderOpen, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProjectWithTasks } from '@/types'
import ProjectForm from '@/components/forms/ProjectForm'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithTasks[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('프로젝트 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectCreated = (newProject: ProjectWithTasks) => {
    setProjects(prev => [newProject, ...prev])
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">프로젝트 관리</h1>
          <p className="text-muted-foreground">프로젝트를 생성하고 관리하세요</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          새 프로젝트
        </Button>
      </div>

      {showForm && (
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>새 프로젝트 만들기</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectForm 
                onSubmit={handleProjectCreated}
                onCancel={() => setShowForm(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: project.color }}
                />
                <CardTitle className="text-lg">{project.title}</CardTitle>
              </div>
              {project.description && (
                <CardDescription>{project.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <FolderOpen className="w-4 h-4" />
                  {project._count?.tasks || 0}개 할일
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </div>
              <Link href={`/projects/${project.id}`}>
                <Button className="w-full" variant="outline">
                  프로젝트 열기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">프로젝트가 없습니다</h3>
          <p className="text-muted-foreground mb-4">
            첫 번째 프로젝트를 만들어 시작해보세요
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            새 프로젝트
          </Button>
        </div>
      )}
    </div>
  )
}