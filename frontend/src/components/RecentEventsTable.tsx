interface Event {
  _id: string
  eventType: string
  page: string
  sessionId: string
  timestamp: string
}

interface Props { projectId: string }

import { useEffect, useState } from 'react'
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export const RecentEventsTable = ({ projectId }: Props) => {
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    if (!projectId) return
    axios
      .get(`${BASE}/api/events/recent/${projectId}`)
      .then((r) => setEvents(r.data))
      .catch(console.error)
  }, [projectId])

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="text-sm font-semibold text-gray-500 mb-4">
        RECENT EVENTS
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b">
              <th className="pb-2">Type</th>
              <th className="pb-2">Page</th>
              <th className="pb-2">Session</th>
              <th className="pb-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-300">
                  No events yet — send some events via the API
                </td>
              </tr>
            )}
            {events.map((e) => (
              <tr key={e._id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-2">
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">
                    {e.eventType}
                  </span>
                </td>
                <td className="py-2 text-gray-600">{e.page}</td>
                <td className="py-2 text-gray-400 font-mono text-xs">
                  {e.sessionId.slice(0, 8)}...
                </td>
                <td className="py-2 text-gray-400">
                  {new Date(e.timestamp).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}