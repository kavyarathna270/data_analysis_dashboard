import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import type { DashboardStats, Project } from '../types'

const MY_PROJECTS = gql`
  query MyProjects {
    myProjects {
      id name description apiKey createdAt
    }
  }
`

const DASHBOARD_STATS = gql`
  query DashboardStats($projectId: ID!, $days: Int) {
    dashboardStats(projectId: $projectId, days: $days) {
      totalEvents
      uniqueSessions
      topPages   { page count }
      eventsByDay { date count }
    }
  }
`

export const useProjects = () => {
  const { data, loading, error } = useQuery<{ myProjects: Project[] }>(
    MY_PROJECTS
  )
  return { projects: data?.myProjects || [], loading, error }
}

export const useDashboardStats = (projectId: string, days = 7) => {
  const { data, loading, error, refetch } = useQuery<{
    dashboardStats: DashboardStats
  }>(DASHBOARD_STATS, {
    variables: { projectId, days },
    skip: !projectId,
    pollInterval: 30000,
  })
  return { stats: data?.dashboardStats, loading, error, refetch }
}