'use client'

import { useState } from 'react'
import { Calendar, Clock, Edit, Trash2 } from 'lucide-react'
import { TaskWithProject } from '@/types'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader } from './ui/card'
import TaskForm from './forms/TaskForm'

interface TaskCardProps {
  task: TaskWithProject
  onDragStart: () => void
  onUpdate: (task: TaskWithProject) => void
  onDelete: (taskId: string) => void
  isDragging?: boolean
}

const priorityColors = {
  LOW: 'bg-gray-500',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-red-500',
}

const priorityLabels = {
  LOW: '낮음',
  MEDIUM: '보통',
  HIGH: '높음',
}

export default function TaskCard({ task, onDragStart, onUpdate, onDelete, isDragging }: TaskCardProps) {
  const [showEditForm, setShowEditForm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('정말 이 할일을 삭제하시겠습니까?')) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onDelete(task.id)
      }
    } catch (error) {
      console.error('할일 삭제 오류:', error)
    } finally {
      setDeleting(false)
    }
  }

  const handleUpdate = (updatedTask: TaskWithProject) => {
    onUpdate(updatedTask)
    setShowEditForm(false)
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    })
  }

  const isOverdue = (dueDate: string | Date) => {
    return new Date(dueDate) < new Date() && task.status !== 'DONE'
  }

  if (showEditForm) {
    return (
      <Card>
        <CardHeader>
          <div className="text-sm font-medium">할일 수정</div>
        </CardHeader>
        <CardContent>
          <TaskForm
            projectId={task.projectId}
            initialData={task}
            onSubmit={handleUpdate}
            onCancel={() => setShowEditForm(false)}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`cursor-move hover:shadow-md transition-all duration-200 ${
        isDragging ? 'opacity-50 rotate-2 scale-105' : ''
      }`}
      draggable
      onDragStart={onDragStart}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-sm">{task.title}</h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowEditForm(true)}
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`} />
            <span className="text-xs text-muted-foreground">
              {priorityLabels[task.priority]}
            </span>
          </div>

          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs ${
              isOverdue(task.dueDate) ? 'text-red-500' : 'text-muted-foreground'
            }`}>
              {isOverdue(task.dueDate) ? (
                <Clock className="w-3 h-3" />
              ) : (
                <Calendar className="w-3 h-3" />
              )}
              {formatDate(task.dueDate)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}