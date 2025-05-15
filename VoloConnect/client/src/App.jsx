import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import Dashboard from './components/dashboard/dashboard'
import LoginForm from './components/auth/LoginForm'
import RegisterForm from './components/auth/RegisterForm'
import './App.css'

// Protected route wrapper
const ProtectedRoute = ({ element, isAuthenticated }) => {
  return isAuthenticated ? element : <Navigate to="/login" />
}

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Ensure skills is always an array
        return {
          ...parsedUser,
          skills: Array.isArray(parsedUser.skills) 
            ? parsedUser.skills 
            : JSON.parse(parsedUser.skills || '[]')
        };
      } catch (e) {
        console.error('Error parsing stored user:', e);
        return null;
      }
    }
    return null;
  })
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
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
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Router future={{ 
        v7_startTransition: true,
        v7_relativeSplatPath: true 
      }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginForm onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <RegisterForm onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} element={
                <Dashboard user={user} onLogout={handleLogout} />
              } />
            }
          />
          {/* Simple 404 route */}
          <Route
            path="*"
            element={
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100vh',
                textAlign: 'center',
                padding: '20px'
              }}>
                <h1 style={{ marginBottom: '1rem' }}>404 - Page Not Found</h1>
                <p style={{ marginBottom: '2rem' }}>The page you are looking for does not exist.</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  style={{ 
                    border: 'none',
                    backgroundColor: '#007bff',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  Go Back Home
                </button>
              </div>
            }
          />
        </Routes>
      </Router>
    </div>
  )
}

export default App