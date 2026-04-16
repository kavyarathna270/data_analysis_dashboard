import { ApolloProvider } from '@apollo/client/react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { apolloClient } from './apollo/client'
import { AuthProvider } from './context/AuthContext'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  )
}

export default App