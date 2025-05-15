import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import styles from './CreateEventForm.module.css';

const CreateEventForm = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    required_skills: [],
    max_volunteers: '',
    status: 'active'
  });

  // Predefined skills options
  const skillOptions = [
    'Teaching',
    'First Aid',
    'Construction',
    'Cooking',
    'Project Management',
    'Marketing',
    'Design',
    'Technical',
    'Communication',
    'Leadership'
  ];

  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const validate = () => {
    const newErrors = {};
    
    if (!eventData.title) {
      newErrors.title = 'Title is required';
    }
    if (!eventData.description) {
      newErrors.description = 'Description is required';
    }
    if (!eventData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    if (!eventData.end_date) {
      newErrors.end_date = 'End date is required';
    }
    if (!eventData.location) {
      newErrors.location = 'Location is required';
    }
    if (!eventData.max_volunteers) {
      newErrors.max_volunteers = 'Maximum volunteers is required';
    }
    if (new Date(eventData.end_date) <= new Date(eventData.start_date)) {
      newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        setLoading(true);

        const formattedData = {
          title: eventData.title.trim(),
          description: eventData.description.trim(),
          start_date: new Date(eventData.start_date).toISOString(),
          end_date: new Date(eventData.end_date).toISOString(),
          location: eventData.location.trim(),
          required_skills: JSON.stringify(eventData.required_skills),
          max_volunteers: parseInt(eventData.max_volunteers),
          status: eventData.status
        };

        const response = await api.post('/api/events', formattedData);

        if (response.data.success) {
          alert('Event created successfully!');
          navigate('/dashboard/events');
        }
      } catch (error) {
        console.error('Error creating event:', error);
        alert(error.response?.data?.message || 'Failed to create event. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSkillToggle = (skill) => {
    setEventData(prev => ({
      ...prev,
      required_skills: prev.required_skills.includes(skill)
        ? prev.required_skills.filter(s => s !== skill)
        : [...prev.required_skills, skill]
    }));
  };

  const handleCancel = () => {
    navigate('/dashboard/events');
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h1 className={styles.formTitle}>Create New Event</h1>
        <p className={styles.formSubtitle}>Fill in the details below to create a new volunteer event</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.formSection}>
        {/* Title */}
        <div className={styles.formGroup}>
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={eventData.title}
            onChange={handleChange}
            className={errors.title ? styles.inputError : ''}
            placeholder="Enter event title"
            maxLength="255"
          />
          {errors.title && <span className={styles.errorText}>{errors.title}</span>}
        </div>

        {/* Description */}
        <div className={styles.formGroup}>
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={eventData.description}
            onChange={handleChange}
            className={errors.description ? styles.inputError : ''}
            placeholder="Describe the event"
            rows="4"
          />
          {errors.description && <span className={styles.errorText}>{errors.description}</span>}
        </div>

        {/* Start Date */}
        <div className={styles.formGroup}>
          <label htmlFor="start_date">Start Date and Time *</label>
          <input
            type="datetime-local"
            id="start_date"
            name="start_date"
            value={eventData.start_date}
            onChange={handleChange}
            className={errors.start_date ? styles.inputError : ''}
            min={new Date().toISOString().slice(0, 16)}
          />
          {errors.start_date && <span className={styles.errorText}>{errors.start_date}</span>}
        </div>

        {/* End Date */}
        <div className={styles.formGroup}>
          <label htmlFor="end_date">End Date and Time *</label>
          <input
            type="datetime-local"
            id="end_date"
            name="end_date"
            value={eventData.end_date}
            onChange={handleChange}
            className={errors.end_date ? styles.inputError : ''}
            min={eventData.start_date || new Date().toISOString().slice(0, 16)}
          />
          {errors.end_date && <span className={styles.errorText}>{errors.end_date}</span>}
        </div>

        {/* Location */}
        <div className={styles.formGroup}>
          <label htmlFor="location">Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={eventData.location}
            onChange={handleChange}
            className={errors.location ? styles.inputError : ''}
            placeholder="Enter event location"
            maxLength="255"
          />
          {errors.location && <span className={styles.errorText}>{errors.location}</span>}
        </div>

        {/* Maximum Volunteers */}
        <div className={styles.formGroup}>
          <label htmlFor="max_volunteers">Maximum Volunteers *</label>
          <input
            type="number"
            id="max_volunteers"
            name="max_volunteers"
            value={eventData.max_volunteers}
            onChange={handleChange}
            className={errors.max_volunteers ? styles.inputError : ''}
            min="1"
            max="1000"
          />
          {errors.max_volunteers && <span className={styles.errorText}>{errors.max_volunteers}</span>}
        </div>

        {/* Required Skills */}
        <div className={styles.formGroup}>
          <label>Required Skills</label>
          <div className={styles.skillsGrid}>
            {skillOptions.map(skill => (
              <div key={skill} className={styles.skillItem}>
                <input
                  type="checkbox"
                  id={`skill-${skill}`}
                  checked={eventData.required_skills.includes(skill)}
                  onChange={() => handleSkillToggle(skill)}
                />
                <label htmlFor={`skill-${skill}`}>{skill}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className={styles.formGroup}>
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={eventData.status}
            onChange={handleChange}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>

      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loader}></div>
        </div>
      )}
    </div>
  );
};

export default CreateEventForm; 