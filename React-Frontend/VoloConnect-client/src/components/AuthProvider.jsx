
import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/sonner";

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
    // Check if user is already logged in from localStorage
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

  const login = (email, password) => {
    // In a real application, this would be an API call
    return new Promise((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        // Mock validation (in a real app, this would be server-side)
        if (email && password) {
          // Mock user data - in a real app, this would come from the backend
          const userData = {
            id: 'user-' + Math.random().toString(36).substring(2, 9),
            name: email.split('@')[0],
            email,
          };
          
          // Store user data in localStorage
          localStorage.setItem('volo-user', JSON.stringify(userData));
          setUser(userData);
          
          toast.success('Successfully logged in');
          resolve(userData);
        } else {
          reject(new Error('Invalid credentials'));
          toast.error('Invalid credentials');
        }
      }, 800);
    });
  };

  const signup = (name, email, password) => {
    // In a real application, this would be an API call
    return new Promise((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        if (name && email && password) {
          // Mock user data - in a real app, this would come from the backend after registration
          const userData = {
            id: 'user-' + Math.random().toString(36).substring(2, 9),
            name,
            email,
          };
          
          // Store user data in localStorage
          localStorage.setItem('volo-user', JSON.stringify(userData));
          setUser(userData);
          
          toast.success('Account created successfully');
          resolve(userData);
        } else {
          reject(new Error('Please fill all fields'));
          toast.error('Please fill all fields');
        }
      }, 800);
    });
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
