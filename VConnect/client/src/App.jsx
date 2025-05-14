import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import LoginForm from './components/auth/LoginForm'
import RegisterForm from './components/auth/RegisterForm'
import './App.css'

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = sessionStorage.getItem('userId')
    const userData = sessionStorage.getItem('userData')
    
    if (userId && userData) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    }
    
    setLoading(false)
  }, [])

  const handleLogin = (userData) => {
    sessionStorage.setItem('userId', userData.id)
    sessionStorage.setItem('userData', JSON.stringify(userData))
    setIsAuthenticated(true)
    setUser(userData)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('userId')
    sessionStorage.removeItem('userData')
    setIsAuthenticated(false)
    setUser(null)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <LoginForm onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <RegisterForm onLogin={handleLogin} />
            )
          }
        />
      </Routes>
    </Router>
  )
}

export default App
