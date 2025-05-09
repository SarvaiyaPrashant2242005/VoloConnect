// src/context/AuthProvider.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { submitRegistration, loginUser } from '../api/signupapi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('volo-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user data', error);
        localStorage.removeItem('volo-user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const userData = await loginUser(email, password);
      if (userData && userData.user) {
        localStorage.setItem('volo-user', JSON.stringify(userData.user));
        setUser(userData.user);
        toast.success('Successfully logged in');
        return userData.user;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const signup = async (formData) => {
    try {
      const userData = await submitRegistration(formData);
      if (userData) {
        localStorage.setItem('volo-user', JSON.stringify(userData));
        setUser(userData);
        toast.success('Account created successfully');
        return userData;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message || 'Signup failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('volo-user');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
