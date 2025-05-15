import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../config/api';
import styles from '../../styles/auth/AuthForms.module.css';

const SKILLS_OPTIONS = [
  'Teaching',
  'Mentoring',
  'Event Planning',
  'Fundraising',
  'Social Media',
  'Content Creation',
  'Translation',
  'Technical Support',
  'Healthcare',
  'Environmental',
  'Animal Care',
  'Community Outreach',
  'Administrative',
  'Graphic Design',
  'Web Development',
  'Data Analysis',
  'Legal',
  'Counseling',
  'Music',
  'Sports',
];

const RegisterForm = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
    phone: '',
    skills: [],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
    phone: '',
    skills: '',
  });
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // At least 8 chars, including one uppercase, one lowercase, one number and one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? ])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? ]{8,}$/;
    return passwordRegex.test(password);
  };

  const validatePhone = (phone) => {
    // Basic phone validation (at least 10 digits)
    const phoneRegex = /^\+?[\d\s\(\)-]{10,}$/;
    return phoneRegex.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let errorMessage = '';

    switch (name) {
      case 'first_name':
        if (!value.trim()) {
          errorMessage = 'First name is required';
        } else if (value.trim().length < 2) {
          errorMessage = 'First name must be at least 2 characters';
        }
        break;
      case 'last_name':
        if (!value.trim()) {
          errorMessage = 'Last name is required';
        } else if (value.trim().length < 2) {
          errorMessage = 'Last name must be at least 2 characters';
        }
        break;
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
        } else if (value.length < 8) {
          errorMessage = 'Password must be at least 8 characters long';
        } else if (!validatePassword(value)) {
          errorMessage = 'Password must include uppercase, lowercase, number and special character';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          errorMessage = 'Please confirm your password';
        } else if (value !== formData.password) {
          errorMessage = 'Passwords do not match';
        }
        break;
      case 'organization':
        if (!value.trim()) {
          errorMessage = 'Organization is required';
        } else if (value.trim().length < 2) {
          errorMessage = 'Organization name must be at least 2 characters';
        }
        break;
      case 'phone':
        if (!value.trim()) {
          errorMessage = 'Phone number is required';
        } else if (!validatePhone(value)) {
          errorMessage = 'Please enter a valid phone number (min. 10 digits)';
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

  const handleSkillToggle = (skill) => {
    const updatedSkills = formData.skills.includes(skill)
      ? formData.skills.filter(s => s !== skill)
      : [...formData.skills, skill];
    
    setFormData(prev => ({
      ...prev,
      skills: updatedSkills
    }));

    // Validate skills
    if (updatedSkills.length === 0) {
      setErrors(prev => ({
        ...prev,
        skills: 'Please select at least one skill'
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        skills: ''
      }));
    }
  };

  const validateForm = () => {
    // Validate all fields
    let isValid = true;
    let newErrors = { ...errors };
    
    // Validate each field
    Object.keys(formData).forEach(field => {
      if (field === 'skills') {
        if (formData.skills.length === 0) {
          newErrors.skills = 'Please select at least one skill';
          isValid = false;
        }
      } else {
        const fieldValid = validateField(field, formData[field]);
        if (!fieldValid) isValid = false;
      }
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
      const response = await api.post('/api/auth/register', {
        ...formData,
        skills: formData.skills,
      });
      
      const { user } = response.data;
      
      // Call onLogin with user data
      onLogin(user);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      // Handle specific error codes
      if (err.response?.status === 409) {
        setErrors(prev => ({
          ...prev,
          email: 'This email is already registered'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          form: err.response?.data?.message || 'Registration failed. Please try again.'
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>Create Account</h2>
      {errors.form && <div className={styles.error}>{errors.form}</div>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="first_name">First Name</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className={`${styles.input} ${errors.first_name ? styles.inputError : ''}`}
              placeholder="Enter your first name"
            />
            {errors.first_name && <div className={styles.fieldError}>{errors.first_name}</div>}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="last_name">Last Name</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className={`${styles.input} ${errors.last_name ? styles.inputError : ''}`}
              placeholder="Enter your last name"
            />
            {errors.last_name && <div className={styles.fieldError}>{errors.last_name}</div>}
          </div>
        </div>

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

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.passwordInputContainer}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className={styles.passwordToggle}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.password && <div className={styles.fieldError}>{errors.password}</div>}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className={styles.passwordInputContainer}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className={styles.passwordToggle}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.confirmPassword && <div className={styles.fieldError}>{errors.confirmPassword}</div>}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="organization">Organization</label>
          <input
            type="text"
            id="organization"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            className={`${styles.input} ${errors.organization ? styles.inputError : ''}`}
            placeholder="Enter your organization"
          />
          {errors.organization && <div className={styles.fieldError}>{errors.organization}</div>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
            placeholder="Enter your phone number"
          />
          {errors.phone && <div className={styles.fieldError}>{errors.phone}</div>}
          <div className={styles.fieldHelp}>Format: +1 (555) 123-4567 or 5551234567</div>
        </div>

        <div className={styles.formGroup}>
          <label>Skills</label>
          <div className={`${styles.skillsContainer} ${errors.skills ? styles.inputError : ''}`}>
            {SKILLS_OPTIONS.map((skill) => (
              <span
                key={skill}
                onClick={() => handleSkillToggle(skill)}
                className={`${styles.skillChip} ${
                  formData.skills.includes(skill) ? styles.skillChipSelected : ''
                }`}
              >
                {skill}
              </span>
            ))}
          </div>
          {errors.skills && <div className={styles.fieldError}>{errors.skills}</div>}
        </div>

        <button
          type="submit"
          className={styles.button}
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
        <div className={styles.formFooter}>
          <p>
            Already have an account?{' '}
            <Link to="/login" className={styles.link}>
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;