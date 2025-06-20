'use client'

import { useState } from 'react'
import { TaskStatus, TaskWithProject } from '@/types'
import TaskCard from './TaskCard'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface KanbanBoardProps {
  tasks: TaskWithProject[]
  onTaskUpdate: (task: TaskWithProject) => void
  onTaskDelete: (taskId: string) => void
}

const COLUMNS: { status: TaskStatus; title: string; color: string }[] = [
  { status: 'TODO', title: 'Todo', color: 'bg-slate-100' },
  { status: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-100' },
  { status: 'DONE', title: 'Done', color: 'bg-green-100' },
]

export default function KanbanBoard({ tasks, onTaskUpdate, onTaskDelete }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<TaskWithProject | null>(null)

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status)
  }

  const handleDragStart = (task: TaskWithProject) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault()
    
    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null)
      return
    }

    try {
      const response = await fetch(`/api/tasks/${draggedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        const updatedTask = await response.json()
        onTaskUpdate(updatedTask)
      }
    } catch (error) {
      console.error('할일 상태 변경 오류:', error)
    } finally {
      setDraggedTask(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {COLUMNS.map((column) => (
        <div key={column.status}>
          <Card 
            className={`${column.color} min-h-[500px] transition-colors duration-200 ${
              draggedTask && draggedTask.status !== column.status 
                ? 'border-2 border-dashed border-primary bg-primary/5' 
                : ''
            }`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {column.title}
                <span className="text-sm font-normal text-muted-foreground">
                  {getTasksByStatus(column.status).length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {getTasksByStatus(column.status).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={() => handleDragStart(task)}
                  onUpdate={onTaskUpdate}
                  onDelete={onTaskDelete}
                  isDragging={draggedTask?.id === task.id}
                />
              ))}
              {getTasksByStatus(column.status).length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {column.status === 'TODO' && '새로운 할일을 추가하세요'}
                  {column.status === 'IN_PROGRESS' && '진행 중인 할일이 없습니다'}
                  {column.status === 'DONE' && '완료된 할일이 없습니다'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}