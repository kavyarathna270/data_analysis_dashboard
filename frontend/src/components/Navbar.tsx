import { useAuth } from '../context/AuthContext'

export const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg" />
        <span className="font-bold text-gray-800 text-lg">InsightFlow</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          {user?.name}
        </span>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}