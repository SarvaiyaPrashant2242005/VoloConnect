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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const validateForm = () => {
    if (!formData.first_name) {
      setError('First name is required');
      return false;
    }
    if (!formData.last_name) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.organization) {
      setError('Organization is required');
      return false;
    }
    if (!formData.phone) {
      setError('Phone number is required');
      return false;
    }
    if (formData.skills.length === 0) {
      setError('Please select at least one skill');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/voloconnect/auth/register', {
        ...formData,
        skills: formData.skills,
      });
      
      const { user } = response.data;
      
      // Call onLogin with user data
      onLogin(user);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>Create Account</h2>
      {error && <div className={styles.error}>{error}</div>}
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
              required
              className={styles.input}
              placeholder="Enter your first name"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="last_name">Last Name</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Enter your last name"
            />
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
            required
            className={styles.input}
            placeholder="Enter your email"
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Enter your password"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Confirm your password"
            />
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
            required
            className={styles.input}
            placeholder="Enter your organization"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className={styles.input}
            placeholder="Enter your phone number"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Skills</label>
          <div className={styles.skillsContainer}>
            {SKILLS_OPTIONS.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => handleSkillToggle(skill)}
                className={`${styles.skillChip} ${
                  formData.skills.includes(skill) ? styles.selected : ''
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className={styles.button}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
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