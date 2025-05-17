import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import Dashboard from './components/dashboard/dashboard'
import LoginForm from './components/auth/LoginForm'
import RegisterForm from './components/auth/RegisterForm'
import CreateEvent from './components/dashboard/CreateEvent'
import Events from './components/Events'
import VolunteerSignup from './components/volunteer/VolunteerSignup'
import VolunteerHistory from './components/volunteer/VolunteerHistory'
import VolunteerManagement from './components/volunteer/VolunteerManagement'
import ExportVolunteers from './components/volunteer/ExportVolunteers'
import EventEdit from './components/events/EventEdit'
import { AuthProvider, AuthContext } from './context/AuthContext.jsx'
import './App.css'
import './styles/Print.css'
import EventDetail from './components/events/EventDetail'
import styles from './styles/auth/Auth.module.css'

// Protected route wrapper
const ProtectedRoute = ({ element }) => {
  const { isAuthenticated } = React.useContext(AuthContext)
  return isAuthenticated ? element : <Navigate to="/login" />
}

const AuthContainer = ({ children }) => {
  return (
    <div className={styles.authContainer}>
      <Link to="/" className={styles.siteLogo}>
        <div className={styles.siteName}>
          <span>Volo</span>
          <span>Connect</span>
        </div>
      </Link>
      {children}
    </div>
  );
};

const App = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </div>
  )
}

const AppRoutes = () => {
  const { isAuthenticated, user, login, logout, loading } = React.useContext(AuthContext)

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem',
        background: 'linear-gradient(135deg, #2196F3 0%, #4CAF50 100%)',
        color: 'white'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <Router future={{ 
      v7_startTransition: true,
      v7_relativeSplatPath: true 
    }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:eventId" element={<EventDetail />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthContainer>
                <LoginForm onLogin={login} />
              </AuthContainer>
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthContainer>
                <RegisterForm onLogin={login} />
              </AuthContainer>
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute element={
              <Dashboard user={user} onLogout={logout} />
            } />
          }
        />
        <Route
          path="/dashboard/create-event"
          element={
            <ProtectedRoute element={
              <CreateEvent user={user} />
            } />
          }
        />
        <Route
          path="/events/create"
          element={
            <ProtectedRoute element={
              <CreateEvent user={user} />
            } />
          }
        />
        {/* Volunteer Routes */}
        <Route
          path="/events/:eventId/volunteer"
          element={
            <ProtectedRoute element={
              <VolunteerSignup />
            } />
          }
        />
        <Route
          path="/events/:eventId/manage-volunteers"
          element={
            <ProtectedRoute element={
              <VolunteerManagement user={user} />
            } />
          }
        />
        <Route
          path="/volunteer-history"
          element={
            <ProtectedRoute element={
              <VolunteerHistory user={user} />
            } />
          }
        />
        <Route
          path="/volunteer-management"
          element={
            <ProtectedRoute element={
              <VolunteerManagement user={user} />
            } />
          }
        />
        <Route
          path="/export-volunteers"
          element={
            <ProtectedRoute element={
              <ExportVolunteers user={user} />
            } />
          }
        />
        <Route
          path="/events/:eventId/edit"
          element={
            <ProtectedRoute element={
              <EventEdit user={user} />
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
  )
}

export default App