'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, MoreHorizontal, Star, Calendar, User, FolderPlus, Menu, X, LogOut, FolderOpen, Grid3X3, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TaskWithProject, TaskStatus, ProjectWithTasks } from '@/types'
import TaskModal from '@/components/TaskModal'
import ProjectModal from '@/components/ProjectModal'
import CalendarView from '@/components/CalendarView'

const COLUMNS = [
  { 
    id: 'TODO', 
    title: '할 일', 
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    icon: '📋',
    tasks: [] 
  },
  { 
    id: 'IN_PROGRESS', 
    title: '진행 중', 
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50', 
    icon: '⚡',
    tasks: [] 
  },
  { 
    id: 'DONE', 
    title: '완료', 
    color: 'from-emerald-500 to-green-500',
    bgColor: 'bg-emerald-50',
    icon: '✨',
    tasks: [] 
  }
]

export default function KanbanDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectWithTasks[]>([])
  const [selectedProject, setSelectedProject] = useState<ProjectWithTasks | null>(null)
  const [tasks, setTasks] = useState<TaskWithProject[]>([])
  const [draggedTask, setDraggedTask] = useState<TaskWithProject | null>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskWithProject | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('TODO')
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TaskStatus>('TODO')
  const [currentView, setCurrentView] = useState<'kanban' | 'calendar'>('kanban')

  // 인증 확인
  useEffect(() => {
    if (status === 'loading') return // 아직 로딩 중
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  // 프로젝트 목록 가져오기
  useEffect(() => {
    fetchProjects()
  }, [])

  // 선택된 프로젝트의 할일들 가져오기
  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject.id)
    }
  }, [selectedProject])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
        if (data.length > 0 && !selectedProject) {
          setSelectedProject(data[0])
        }
      }
    } catch (error) {
      console.error('프로젝트 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTasks = async (projectId: string) => {
    try {
      const response = await fetch(`/api/tasks?projectId=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('할일 조회 오류:', error)
    }
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status)
  }

  const handleDragStart = (task: TaskWithProject) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
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
        setTasks(prev => prev.map(task => 
          task.id === draggedTask.id ? updatedTask : task
        ))
      }
    } catch (error) {
      console.error('할일 상태 변경 오류:', error)
    } finally {
      setDraggedTask(null)
    }
  }

  const handleTaskCreated = (newTask: TaskWithProject) => {
    setTasks(prev => [newTask, ...prev])
    setShowTaskModal(false)
  }

  const handleTaskUpdated = (updatedTask: TaskWithProject) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ))
    setShowTaskModal(false)
  }

  const handleTaskDeleted = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  const handleProjectCreated = (newProject: ProjectWithTasks) => {
    setProjects(prev => [newProject, ...prev])
    setSelectedProject(newProject)
    setShowProjectModal(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500'
      case 'MEDIUM': return 'bg-yellow-500'
      case 'LOW': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  // 인증 로딩 중이거나 인증되지 않은 경우
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // 리다이렉션 처리 중
  }

  return (
    <div className="flex h-screen relative">
      {/* 모바일 오버레이 */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:static inset-y-0 left-0 z-50 w-80 lg:w-80
        glass-morphism shadow-2xl flex flex-col animate-slideIn
        transition-transform duration-300 ease-in-out
      `}>
        <div className="p-6 lg:p-8 border-b border-white/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center animate-float">
                <span className="text-white text-lg lg:text-xl font-bold">K</span>
              </div>
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                칸반 보드
              </h1>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <p className="text-gray-600 text-xs lg:text-sm">프로젝트를 스마트하게 관리하세요</p>
        </div>
        
        <div className="flex-1 p-6 space-y-8 custom-scrollbar overflow-y-auto">
          {/* 프로젝트 섹션 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">프로젝트</h3>
              <button
                onClick={() => setShowProjectModal(true)}
                className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`group flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-[1.02] animate-slideIn ${
                    selectedProject?.id === project.id
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-md'
                      : 'hover:bg-white/50 hover:shadow-lg'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm ring-2 ring-white"
                    style={{ backgroundColor: project.color }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-900 truncate block">
                      {project.title}
                    </span>
                    {project.description && (
                      <span className="text-xs text-gray-500 truncate block">
                        {project.description}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {project._count?.tasks || 0}
                    </span>
                  </div>
                </div>
              ))}
              {projects.length === 0 && !loading && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <FolderOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mb-2">프로젝트가 없습니다</p>
                  <p className="text-xs text-gray-400">새 프로젝트를 만들어보세요</p>
                </div>
              )}
            </div>
          </div>

          {/* 필터 섹션 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">필터</h3>
            <div className="space-y-2">
              {[
                { icon: Star, label: '즐겨찾기', color: 'text-yellow-500' },
                { icon: Calendar, label: '오늘 마감', color: 'text-red-500' },
                { icon: User, label: '내 할일', color: 'text-blue-500' }
              ].map((filter, index) => (
                <div 
                  key={filter.label}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/50 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] animate-slideIn"
                  style={{ animationDelay: `${(index + 3) * 50}ms` }}
                >
                  <filter.icon className={`w-4 h-4 ${filter.color}`} />
                  <span className="text-sm text-gray-700 font-medium">{filter.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 사용자 정보 및 로그아웃 */}
        <div className="p-6 border-t border-white/20">
          <div className="flex items-center justify-between mb-4 p-3 bg-white/30 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || '사용자'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedTask(null)
              setDefaultStatus('TODO')
              setShowTaskModal(true)
            }}
            disabled={!selectedProject}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>새 할일 만들기</span>
          </button>
        </div>
      </div>

      {/* 메인 칸반 보드 */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* 상단 헤더 */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 lg:px-8 py-4 lg:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 lg:space-x-4 min-w-0 flex-1">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              
              {selectedProject && (
                <div 
                  className="w-3 h-3 lg:w-4 lg:h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: selectedProject.color }}
                />
              )}
              <h1 className="text-lg lg:text-2xl font-semibold text-gray-900 truncate">
                {selectedProject ? selectedProject.title : '프로젝트를 선택하세요'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-3">
              {/* 뷰 전환 버튼 */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setCurrentView('kanban')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    currentView === 'kanban'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="칸반 보드"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentView('calendar')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    currentView === 'calendar'
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="캘린더 뷰"
                >
                  <CalendarDays className="w-4 h-4" />
                </button>
              </div>

              <div className="relative hidden sm:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  placeholder="할일 검색..."
                  className="pl-10 pr-4 py-2 w-48 lg:w-64 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-sm"
                />
              </div>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="w-4 h-4 sm:hidden" />
                <Filter className="w-4 h-4 hidden sm:block" />
              </button>
              <button 
                onClick={() => {
                  setSelectedTask(null)
                  setDefaultStatus('TODO')
                  setShowTaskModal(true)
                }}
                disabled={!selectedProject}
                className="lg:hidden bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 모바일 탭 네비게이션 - 칸반 뷰에서만 표시 */}
        {currentView === 'kanban' && (
          <div className="lg:hidden border-b border-gray-200 bg-white/80 backdrop-blur-sm">
            <div className="flex overflow-x-auto scrollbar-hide">
              {COLUMNS.map((column) => (
                <button
                  key={column.id}
                  onClick={() => setActiveTab(column.id as TaskStatus)}
                  className={`flex-shrink-0 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 ${
                    activeTab === column.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{column.icon}</span>
                    <span>{column.title}</span>
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {getTasksByStatus(column.id).length}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 overflow-hidden">
          {currentView === 'calendar' ? (
            <div className="h-full p-4 lg:p-8">
              <CalendarView
                tasks={tasks}
                selectedProject={selectedProject}
                onTaskUpdate={handleTaskUpdated}
                onTaskDelete={handleTaskDeleted}
                onTaskCreate={handleTaskCreated}
              />
            </div>
          ) : (
            <>
              {/* 모바일 칸반 뷰 */}
              <div className="lg:hidden flex-1 overflow-y-auto">
                {COLUMNS.filter(column => column.id === activeTab).map((column, columnIndex) => (
            <div key={column.id} className="h-full flex flex-col">
              {/* 모바일 컬럼 헤더 */}
              <div className={`bg-gradient-to-r ${column.color} p-4 m-4 rounded-xl`}>
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{column.icon}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{column.title}</h3>
                      <span className="text-sm opacity-90">{getTasksByStatus(column.id).length}개</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!selectedProject) return
                      setSelectedTask(null)
                      setDefaultStatus(column.id as TaskStatus)
                      setShowTaskModal(true)
                    }}
                    disabled={!selectedProject}
                    className="p-3 hover:bg-white/20 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-110"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* 모바일 태스크 카드들 */}
              <div className="flex-1 px-4 pb-4 space-y-4 overflow-y-auto custom-scrollbar">
                {getTasksByStatus(column.id).map((task, taskIndex) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setSelectedTask(task)
                      setShowTaskModal(true)
                    }}
                    className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 animate-slideIn active:scale-95 touch-manipulation min-h-[120px] cursor-pointer"
                    style={{ animationDelay: `${taskIndex * 50}ms` }}
                  >
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 text-lg leading-relaxed">
                        {task.title}
                      </h4>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="space-y-3 mt-auto">
                      {/* 우선순위와 마감일 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${getPriorityColor(task.priority)} shadow-sm`}></div>
                          <span className={`text-xs font-medium px-3 py-1.5 rounded-lg ${
                            task.priority === 'HIGH' ? 'text-red-700 bg-red-100' :
                            task.priority === 'MEDIUM' ? 'text-yellow-700 bg-yellow-100' :
                            'text-green-700 bg-green-100'
                          }`}>
                            {task.priority === 'HIGH' ? '높음' : 
                             task.priority === 'MEDIUM' ? '보통' : '낮음'}
                          </span>
                        </div>
                        {task.dueDate && (
                          <span className={`text-xs font-medium px-3 py-1.5 rounded-lg ${
                            new Date(task.dueDate) < new Date() && task.status !== 'DONE'
                              ? 'text-red-600 bg-red-50 border border-red-200' 
                              : 'text-gray-600 bg-gray-50 border border-gray-200'
                          }`}>
                            📅 {new Date(task.dueDate).toLocaleDateString('ko-KR', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        )}
                      </div>

                      {/* 상태 변경 액션 */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100/80">
                        <div className="flex space-x-1">
                          {COLUMNS.filter(col => col.id !== task.status).map((statusColumn, index) => (
                            <button
                              key={statusColumn.id}
                              onClick={async (e) => {
                                e.stopPropagation()
                                try {
                                  const response = await fetch(`/api/tasks/${task.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: statusColumn.id })
                                  })
                                  if (response.ok) {
                                    const updatedTask = await response.json()
                                    setTasks(prev => prev.map(t => 
                                      t.id === task.id ? updatedTask : t
                                    ))
                                  }
                                } catch (error) {
                                  console.error('할일 상태 변경 오류:', error)
                                }
                              }}
                              className={`group relative overflow-hidden px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 touch-manipulation transform active:scale-95 hover:scale-105 ${
                                statusColumn.id === 'TODO' 
                                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:shadow-blue-200/50' 
                                  : statusColumn.id === 'IN_PROGRESS'
                                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 hover:shadow-amber-200/50'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:shadow-emerald-200/50'
                              } hover:shadow-lg border border-white/60`}
                            >
                              <div className="flex items-center space-x-1.5 relative z-10">
                                <span className="text-sm transform group-hover:scale-110 transition-transform duration-200">
                                  {statusColumn.icon}
                                </span>
                                <span className="whitespace-nowrap">{statusColumn.title}</span>
                              </div>
                              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-r ${statusColumn.color}`} />
                            </button>
                          ))}
                        </div>
                        
                        {/* 스와이프 힌트 */}
                        <div className="flex items-center space-x-1 text-gray-400">
                          <div className="w-1 h-1 bg-gray-300 rounded-full animate-pulse" />
                          <div className="w-1 h-1 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                          <div className="w-1 h-1 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {getTasksByStatus(column.id).length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-5xl mb-4">{column.icon}</div>
                    <p className="text-base font-medium">할일이 없습니다</p>
                    <p className="text-sm mt-1">+ 버튼을 눌러 새 할일을 만들어보세요</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

              {/* PC 칸반 컬럼들 */}
              <div className="hidden lg:flex flex-1 p-8 overflow-x-auto custom-scrollbar">
                <div className="flex space-x-6 h-full min-w-max">
                  {COLUMNS.map((column, columnIndex) => (
                    <div
                      key={column.id}
                      className={`w-80 ${column.bgColor} rounded-2xl shadow-lg border border-white/20 flex flex-col animate-slideIn backdrop-blur-sm`}
                      style={{ animationDelay: `${columnIndex * 100}ms` }}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, column.id)}
                    >
                      {/* 컬럼 헤더 */}
                      <div className={`bg-gradient-to-r ${column.color} p-6 rounded-t-2xl`}>
                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{column.icon}</span>
                            <div>
                              <h3 className="font-semibold text-lg">{column.title}</h3>
                              <span className="text-sm opacity-90">{getTasksByStatus(column.id).length}개</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (!selectedProject) return
                              setSelectedTask(null)
                              setDefaultStatus(column.id as TaskStatus)
                              setShowTaskModal(true)
                            }}
                            disabled={!selectedProject}
                            className="p-2 hover:bg-white/20 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-110"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* 태스크 카드들 */}
                      <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                        {getTasksByStatus(column.id).map((task, taskIndex) => (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={() => handleDragStart(task)}
                            onClick={() => {
                              setSelectedTask(task)
                              setShowTaskModal(true)
                            }}
                            className={`bg-white rounded-xl p-5 cursor-move hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100 animate-slideIn ${
                              draggedTask?.id === task.id ? 'opacity-50 rotate-2 scale-105 shadow-2xl' : ''
                            }`}
                            style={{ animationDelay: `${(columnIndex * 100) + (taskIndex * 50)}ms` }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-relaxed">
                                {task.title}
                              </h4>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedTask(task)
                                  setShowTaskModal(true)
                                }}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                            
                            {task.description && (
                              <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                                {task.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)} shadow-sm`}></div>
                                {task.dueDate && (
                                  <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                                    new Date(task.dueDate) < new Date() && task.status !== 'DONE'
                                      ? 'text-red-600 bg-red-50' 
                                      : 'text-gray-600 bg-gray-50'
                                  }`}>
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {getTasksByStatus(column.id).length === 0 && (
                          <div className="text-center py-8 text-gray-400">
                            <div className="text-4xl mb-2">{column.icon}</div>
                            <p className="text-sm">할일이 없습니다</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 태스크 모달 */}
      {showTaskModal && selectedProject && (
        <TaskModal
          task={selectedTask}
          projectId={selectedProject.id}
          defaultStatus={defaultStatus}
          onClose={() => setShowTaskModal(false)}
          onSave={selectedTask ? handleTaskUpdated : handleTaskCreated}
          onDelete={selectedTask ? handleTaskDeleted : undefined}
        />
      )}

      {/* 프로젝트 모달 */}
      {showProjectModal && (
        <ProjectModal
          onClose={() => setShowProjectModal(false)}
          onSave={handleProjectCreated}
        />
      )}
    </div>
  )
}