import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import styles from './Dashboard.module.css';

const CreateEventForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  const [errors, setErrors] = useState({});

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

  const validate = () => {
    const newErrors = {};
    if (!eventData.title) newErrors.title = 'Title is required';
    if (!eventData.description) newErrors.description = 'Description is required';
    if (!eventData.start_date) newErrors.start_date = 'Start date is required';
    if (!eventData.end_date) newErrors.end_date = 'End date is required';
    if (!eventData.location) newErrors.location = 'Location is required';
    if (!eventData.max_volunteers) newErrors.max_volunteers = 'Number of volunteers is required';
    if (eventData.max_volunteers <= 0) newErrors.max_volunteers = 'Number of volunteers must be greater than 0';
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
        setError(null);

        // Format the data
        const formattedData = {
          ...eventData,
          max_volunteers: parseInt(eventData.max_volunteers),
          required_skills: JSON.stringify(eventData.required_skills)
        };

        // Create the event
        const result = await eventService.createEvent(formattedData);
        
        // Show success message
        alert('Event created successfully!');
        
        // Reset form
        setEventData({
          title: '',
          description: '',
          start_date: '',
          end_date: '',
          location: '',
          required_skills: [],
          max_volunteers: '',
          status: 'active'
        });
        
        // Navigate to events page
        navigate('/dashboard/events');
      } catch (error) {
        console.error('Error creating event:', error);
        setError(typeof error === 'string' ? error : 'Failed to create event. Please try again.');
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

  return (
    <form onSubmit={handleSubmit} className={styles.createEventForm}>
      <h2 className={styles.formTitle}>Create New Event</h2>
      
      {error && (
        <div className={styles.errorAlert}>
          {error}
        </div>
      )}

      <div className={styles.formSection}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Event Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={eventData.title}
            onChange={handleChange}
            className={errors.title ? styles.inputError : ''}
            placeholder="Enter event title"
            maxLength="255"
            disabled={loading}
          />
          {errors.title && <span className={styles.errorText}>{errors.title}</span>}
        </div>

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
            disabled={loading}
          />
          {errors.description && <span className={styles.errorText}>{errors.description}</span>}
        </div>

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
            disabled={loading}
          />
          {errors.start_date && <span className={styles.errorText}>{errors.start_date}</span>}
        </div>

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
            disabled={loading}
          />
          {errors.end_date && <span className={styles.errorText}>{errors.end_date}</span>}
        </div>

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
            disabled={loading}
          />
          {errors.location && <span className={styles.errorText}>{errors.location}</span>}
        </div>

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
            disabled={loading}
          />
          {errors.max_volunteers && <span className={styles.errorText}>{errors.max_volunteers}</span>}
        </div>

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
                  disabled={loading}
                />
                <label htmlFor={`skill-${skill}`}>{skill}</label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.formActions}>
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? 'Creating Event...' : 'Create Event'}
        </button>
      </div>
    </form>
  );
};

export default CreateEventForm; 