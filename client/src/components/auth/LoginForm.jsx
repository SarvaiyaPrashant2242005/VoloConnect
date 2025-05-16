import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../config/api';
import styles from '../../styles/auth/AuthForms.module.css';

const LoginForm = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    form: ''
  });
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear form error when any field changes
    if (errors.form) {
      setErrors(prev => ({
        ...prev,
        form: ''
      }));
    }
    
    // Real-time validation
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let errorMessage = '';

    switch (name) {
      case 'email':
        if (!value.trim()) {
          errorMessage = 'Email is required';
        } else if (!validateEmail(value)) {
          errorMessage = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (!value) {
          errorMessage = 'Password is required';
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));

    return !errorMessage;
  };

  const validateForm = () => {
    // Validate all fields
    let isValid = true;
    let newErrors = { ...errors };
    
    // Validate each field
    Object.keys(formData).forEach(field => {
      const fieldValid = validateField(field, formData[field]);
      if (!fieldValid) isValid = false;
    });
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', formData);
      
      // Call the onLogin callback with the user data
      onLogin(response.data.user);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error codes
      if (error.response?.status === 401) {
        setErrors(prev => ({
          ...prev,
          form: 'Invalid email or password'
        }));
      } else if (error.response?.status === 404) {
        setErrors(prev => ({
          ...prev,
          email: 'Account not found'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          form: error.response?.data?.message || 'Login failed. Please try again.'
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>Welcome Back</h2>
      {errors.form && <div className={styles.error}>{errors.form}</div>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            placeholder="Enter your email"
          />
          {errors.email && <div className={styles.fieldError}>{errors.email}</div>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            placeholder="Enter your password"
          />
          {errors.password && <div className={styles.fieldError}>{errors.password}</div>}
        </div>
        <button
          type="submit"
          className={styles.button}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div className={styles.formFooter}>
          <p>
            Don't have an account?{' '}
            <Link to="/register" className={styles.link}>
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;