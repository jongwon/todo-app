'use client'

import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TaskWithProject, CreateTaskData, UpdateTaskData, TaskStatus } from '@/types'

interface TaskModalProps {
  task?: TaskWithProject | null
  projectId: string
  defaultStatus?: TaskStatus
  defaultDueDate?: Date | null
  onClose: () => void
  onSave: (task: TaskWithProject) => void
  onDelete?: (taskId: string) => void
}

export default function TaskModal({ task, projectId, defaultStatus = 'TODO', defaultDueDate, onClose, onSave, onDelete }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [status, setStatus] = useState(task?.status || defaultStatus)
  const [priority, setPriority] = useState(task?.priority || 'MEDIUM')
  const [dueDate, setDueDate] = useState(() => {
    if (task?.dueDate) {
      return new Date(task.dueDate).toISOString().split('T')[0]
    }
    if (defaultDueDate) {
      return defaultDueDate.toISOString().split('T')[0]
    }
    return ''
  })
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) return

    setLoading(true)
    try {
      const url = task ? `/api/tasks/${task.id}` : '/api/tasks'
      const method = task ? 'PUT' : 'POST'
      
      const body: any = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined
      }

      if (!task) {
        body.projectId = projectId
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const updatedTask = await response.json()
        onSave(updatedTask)
      }
    } catch (error) {
      console.error('할일 저장 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!task || !onDelete) return
    if (!confirm('정말 이 할일을 삭제하시겠습니까?')) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onDelete(task.id)
        onClose()
      }
    } catch (error) {
      console.error('할일 삭제 오류:', error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {task ? '할일 수정' : '새 할일'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목 *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="할일 제목을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="할일 설명을 입력하세요"
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상태
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="TODO">할 일</option>
                <option value="IN_PROGRESS">진행 중</option>
                <option value="DONE">완료</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                우선순위
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="LOW">낮음</option>
                <option value="MEDIUM">보통</option>
                <option value="HIGH">높음</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              마감일
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

        </div>

        <div className="flex justify-between mt-6">
          <div>
            {task && onDelete && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleting ? '삭제 중...' : '삭제'}
              </Button>
            )}
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button onClick={handleSave} disabled={loading || !title.trim()}>
              {loading ? '저장 중...' : (task ? '수정' : '생성')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}