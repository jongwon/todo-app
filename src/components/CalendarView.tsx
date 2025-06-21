'use client'

import { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import { format, isSameDay, isPast, isToday, isTomorrow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Plus, Clock, AlertTriangle } from 'lucide-react'
import { TaskWithProject, TaskStatus } from '@/types'
import TaskModal from '@/components/TaskModal'
import 'react-calendar/dist/Calendar.css'

interface CalendarViewProps {
  tasks: TaskWithProject[]
  selectedProject: any
  onTaskUpdate: (task: TaskWithProject) => void
  onTaskDelete: (taskId: string) => void
  onTaskCreate: (task: TaskWithProject) => void
}

type CalendarValue = Date | null | [Date | null, Date | null]

export default function CalendarView({ 
  tasks, 
  selectedProject, 
  onTaskUpdate, 
  onTaskDelete, 
  onTaskCreate 
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskWithProject | null>(null)
  const [defaultDueDate, setDefaultDueDate] = useState<Date | null>(null)

  // 특정 날짜의 할일들 가져오기
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    )
  }

  // 날짜별 할일 개수 표시를 위한 함수
  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayTasks = getTasksForDate(date)
      if (dayTasks.length === 0) return null

      const overdueTasks = dayTasks.filter(task => 
        isPast(new Date(task.dueDate!)) && task.status !== 'DONE'
      )
      const todayTasks = dayTasks.filter(task => isToday(new Date(task.dueDate!)))
      const tomorrowTasks = dayTasks.filter(task => isTomorrow(new Date(task.dueDate!)))

      return (
        <div className="flex flex-col items-center justify-center mt-1 space-y-1">
          {overdueTasks.length > 0 && (
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
          {todayTasks.length > 0 && (
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
          )}
          {tomorrowTasks.length > 0 && (
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
          )}
          {dayTasks.length > 0 && (
            <span className="text-xs font-medium text-gray-600 bg-white rounded-full px-1">
              {dayTasks.length}
            </span>
          )}
        </div>
      )
    }
    return null
  }

  // 날짜 클릭 시 해당 날짜로 할일 생성
  const handleDateClick = (value: CalendarValue) => {
    if (!value || Array.isArray(value)) return
    
    setSelectedDate(value)
    setDefaultDueDate(value)
    setSelectedTask(null)
    setShowTaskModal(true)
  }

  const handleTaskCreated = (newTask: TaskWithProject) => {
    onTaskCreate(newTask)
    setShowTaskModal(false)
  }

  const handleTaskUpdated = (updatedTask: TaskWithProject) => {
    onTaskUpdate(updatedTask)
    setShowTaskModal(false)
  }

  const handleTaskDeleted = (taskId: string) => {
    onTaskDelete(taskId)
    setShowTaskModal(false)
  }

  const selectedDateTasks = getTasksForDate(selectedDate)

  return (
    <div className="flex flex-col lg:flex-row h-full space-y-6 lg:space-y-0 lg:space-x-6">
      {/* 캘린더 영역 */}
      <div className="flex-1">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              📅 {format(selectedDate, 'yyyy년 M월', { locale: ko })}
            </h2>
            <p className="text-sm text-gray-600">
              날짜를 클릭하면 해당 날짜에 할일을 추가할 수 있어요
            </p>
          </div>
          
          <div className="calendar-container">
            <Calendar
              onChange={handleDateClick}
              value={selectedDate}
              locale="ko-KR"
              tileContent={getTileContent}
              className="w-full border-none"
              tileClassName={({ date, view }) => {
                if (view === 'month') {
                  const dayTasks = getTasksForDate(date)
                  const hasOverdue = dayTasks.some(task => 
                    isPast(new Date(task.dueDate!)) && task.status !== 'DONE'
                  )
                  const isSelectedDate = isSameDay(date, selectedDate)
                  
                  let classes = 'hover:bg-blue-50 transition-colors relative'
                  
                  if (hasOverdue) {
                    classes += ' bg-red-50 border-red-200'
                  } else if (isToday(date)) {
                    classes += ' bg-blue-100 border-blue-300 font-bold'
                  } else if (dayTasks.length > 0) {
                    classes += ' bg-green-50 border-green-200'
                  }
                  
                  if (isSelectedDate) {
                    classes += ' ring-2 ring-blue-500 bg-blue-100'
                  }
                  
                  return classes
                }
                return null
              }}
            />
          </div>
        </div>
      </div>

      {/* 선택된 날짜의 할일 목록 */}
      <div className="w-full lg:w-96">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {format(selectedDate, 'M월 d일 (EEE)', { locale: ko })}
            </h3>
            <button
              onClick={() => handleDateClick(selectedDate)}
              disabled={!selectedProject}
              className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">📝</div>
                <p className="text-sm">이 날짜에는 할일이 없습니다</p>
                <p className="text-xs mt-1">+ 버튼을 눌러 할일을 추가해보세요</p>
              </div>
            ) : (
              selectedDateTasks.map((task, index) => {
                const isOverdue = isPast(new Date(task.dueDate!)) && task.status !== 'DONE'
                const isDueToday = isToday(new Date(task.dueDate!))
                
                return (
                  <div
                    key={task.id}
                    onClick={() => {
                      setSelectedTask(task)
                      setShowTaskModal(true)
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md animate-slideIn ${
                      isOverdue 
                        ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                        : isDueToday
                        ? 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                        : task.status === 'DONE'
                        ? 'bg-green-50 border-green-200 hover:bg-green-100'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 line-clamp-2 text-sm">
                        {task.title}
                      </h4>
                      {isOverdue && (
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 ml-2" />
                      )}
                      {isDueToday && (
                        <Clock className="w-4 h-4 text-orange-500 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    
                    {task.description && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                          task.status === 'DONE'
                            ? 'bg-green-100 text-green-700'
                            : task.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {task.status === 'DONE' ? '완료' : 
                           task.status === 'IN_PROGRESS' ? '진행중' : '할일'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                          task.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                          task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority === 'HIGH' ? '높음' : 
                           task.priority === 'MEDIUM' ? '보통' : '낮음'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {task.project.title}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* 태스크 모달 */}
      {showTaskModal && selectedProject && (
        <TaskModal
          task={selectedTask}
          projectId={selectedProject.id}
          defaultStatus="TODO"
          defaultDueDate={defaultDueDate}
          onClose={() => setShowTaskModal(false)}
          onSave={selectedTask ? handleTaskUpdated : handleTaskCreated}
          onDelete={selectedTask ? handleTaskDeleted : undefined}
        />
      )}
    </div>
  )
}