export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description?: string
  apiKey: string
  createdAt: string
}

export interface PageStat {
  page: string
  count: number
}

export interface DayStat {
  date: string
  count: number
}

export interface EventTypeStat {
  eventType: string
  count: number
}

export interface DashboardStats {
  totalEvents: number
  uniqueSessions: number
  topPages: PageStat[]
  eventsByDay: DayStat[]
}export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description?: string
  apiKey: string
  createdAt: string
}

export interface PageStat {
  page: string
  count: number
}

export interface DayStat {
  date: string
  count: number
}

export interface EventTypeStat {
  eventType: string
  count: number
}

export interface DashboardStats {
  totalEvents: number
  uniqueSessions: number
  topPages: PageStat[]
  eventsByDay: DayStat[]
}