import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="auth-container">
      {isLoggedIn ? (
        <div>
          <h2>Welcome!</h2>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : isLogin ? (
        <LoginForm onLogin={handleLogin} toggleForm={toggleForm} />
      ) : (
        <RegisterForm toggleForm={toggleForm} />
      )}
    </div>
  );
};

export default Auth;
