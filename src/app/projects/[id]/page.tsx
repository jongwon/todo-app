'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProjectWithTasks, TaskWithProject } from '@/types'
import KanbanBoard from '@/components/KanbanBoard'
import TaskForm from '@/components/forms/TaskForm'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<ProjectWithTasks | null>(null)
  const [tasks, setTasks] = useState<TaskWithProject[]>([])
  const [loading, setLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)

  useEffect(() => {
    if (projectId) {
      fetchProject()
      fetchTasks()
    }
  }, [projectId])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      } else if (response.status === 404) {
        router.push('/projects')
      }
    } catch (error) {
      console.error('프로젝트 조회 오류:', error)
    }
  }

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/tasks?projectId=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('할일 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskCreated = (newTask: TaskWithProject) => {
    setTasks(prev => [newTask, ...prev])
    setShowTaskForm(false)
  }

  const handleTaskUpdated = (updatedTask: TaskWithProject) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ))
  }

  const handleTaskDeleted = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">프로젝트를 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              프로젝트 목록
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: project.color }}
              />
              <h1 className="text-3xl font-bold">{project.title}</h1>
            </div>
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setShowTaskForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            새 할일
          </Button>
        </div>
      </div>

      {showTaskForm && (
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>새 할일 만들기</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskForm 
                projectId={projectId}
                onSubmit={handleTaskCreated}
                onCancel={() => setShowTaskForm(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}

      <KanbanBoard 
        tasks={tasks}
        onTaskUpdate={handleTaskUpdated}
        onTaskDelete={handleTaskDeleted}
      />
    </div>
  )
}