import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh' 
    }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" style={{ 
        textDecoration: 'none', 
        color: '#007bff', 
        marginTop: '1rem' 
      }}>
        Go Back Home
      </Link>
    </div>
  )
}

export default NotFound 