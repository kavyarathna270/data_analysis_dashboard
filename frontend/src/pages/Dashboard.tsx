import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { useAuth } from '../context/AuthContext'
import { useProjects, useDashboardStats } from '../hooks/useDashboard'
import { Navbar } from '../components/Navbar'
import { KpiCard } from '../components/KpiCard'
import { EventsLineChart } from '../components/EventsLineChart'
import { TopPagesChart } from '../components/TopPagesChart'
import { RecentEventsTable } from '../components/RecentEventsTable'
import { useNavigate } from 'react-router-dom'

const CREATE_PROJECT = gql`
  mutation CreateProject($name: String!, $description: String) {
    createProject(name: $name, description: $description) {
      id name apiKey
    }
  }
`

export const Dashboard = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { projects, loading: projectsLoading } = useProjects()
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [days, setDays] = useState(7)
  const [showCreate, setShowCreate] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '' })
  const [createProject] = useMutation(CREATE_PROJECT, {
    refetchQueries: ['MyProjects'],
  })

  const { stats, loading: statsLoading } = useDashboardStats(
    selectedProjectId,
    days
  )

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
  }, [isAuthenticated])

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id)
    }
  }, [projects])

  const handleCreateProject = async () => {
    await createProject({ variables: newProject })
    setShowCreate(false)
    setNewProject({ name: '', description: '' })
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">
              Real-time analytics for your projects
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            + New Project
          </button>
        </div>

        {/* ── Create project modal ── */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h3 className="font-bold text-gray-800 text-lg mb-4">
                New Project
              </h3>
              <div className="flex flex-col gap-3">
                <input
                  placeholder="Project name"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <input
                  placeholder="Description (optional)"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleCreateProject}
                    className="flex-1 bg-indigo-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-indigo-700"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="flex-1 border border-gray-200 text-gray-500 rounded-xl py-3 text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Project selector + day filter ── */}
        {projects.length > 0 && (
          <div className="flex items-center gap-4 mb-8">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  days === d
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {d}d
              </button>
            ))}

            {selectedProject && (
              <div className="ml-auto flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-xl">
                <span className="text-xs text-gray-400">API Key:</span>
                <span className="font-mono text-xs text-gray-600">
                  {selectedProject.apiKey.slice(0, 16)}...
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Empty state ── */}
        {!projectsLoading && projects.length === 0 && (
          <div className="text-center py-24 text-gray-300">
            <p className="text-xl mb-2">No projects yet</p>
            <p className="text-sm">Click "+ New Project" to get started</p>
          </div>
        )}

        {/* ── KPI cards ── */}
        {stats && (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <KpiCard
                title="Total Events"
                value={stats.totalEvents.toLocaleString()}
                subtitle={`Last ${days} days`}
                color="blue"
              />
              <KpiCard
                title="Unique Sessions"
                value={stats.uniqueSessions.toLocaleString()}
                subtitle={`Last ${days} days`}
                color="green"
              />
              <KpiCard
                title="Top Page"
                value={stats.topPages[0]?.page ?? '—'}
                subtitle={`${stats.topPages[0]?.count ?? 0} views`}
                color="purple"
              />
              <KpiCard
                title="Avg Events/Day"
                value={Math.round(stats.totalEvents / days).toLocaleString()}
                subtitle="Daily average"
                color="orange"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <EventsLineChart data={stats.eventsByDay} />
              <TopPagesChart data={stats.topPages} />
            </div>

            <RecentEventsTable projectId={selectedProjectId} />
          </>
        )}

        {statsLoading && (
          <div className="text-center py-24 text-gray-300">
            Loading analytics...
          </div>
        )}
      </div>
    </div>
  )
}