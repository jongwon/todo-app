import { Project, Task, TaskStatus, Priority } from '@prisma/client'

export type { TaskStatus, Priority }

export interface ProjectWithTasks extends Project {
  tasks: Task[]
  _count?: {
    tasks: number
  }
}

export interface TaskWithProject extends Task {
  project: Project
}

export type CreateProjectData = {
  title: string
  description?: string
  color?: string
}

export type UpdateProjectData = {
  title?: string
  description?: string
  color?: string
  isActive?: boolean
}

export type CreateTaskData = {
  title: string
  description?: string
  projectId: string
  status?: TaskStatus
  priority?: Priority
  dueDate?: Date
}

export type UpdateTaskData = {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: Priority
  dueDate?: Date
}