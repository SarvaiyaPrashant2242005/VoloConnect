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
    date: '',
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
    if (!eventData.date) newErrors.date = 'Date is required';
    if (!eventData.location) newErrors.location = 'Location is required';
    if (!eventData.max_volunteers) newErrors.max_volunteers = 'Number of volunteers is required';
    if (eventData.max_volunteers <= 0) newErrors.max_volunteers = 'Number of volunteers must be greater than 0';
    
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
          required_skills: JSON.stringify(eventData.required_skills),
          date: new Date(eventData.date).toISOString()
        };

        // Create the event
        const result = await eventService.createEvent(formattedData);
        
        // Show success message
        alert('Event created successfully!');
        
        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Error creating event:', error);
        setError(error.message || 'Failed to create event. Please try again.');
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
    setEventData(prev => {
      const newSkills = prev.required_skills.includes(skill)
        ? prev.required_skills.filter(s => s !== skill)
        : [...prev.required_skills, skill];
      
      return {
        ...prev,
        required_skills: newSkills
      };
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.createEventForm}>
      <h2 className={styles.formTitle}>Create New Volunteer Event</h2>
      
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

        {/* ... other form fields remain the same ... */}

        <div className={styles.formActions}>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Creating Event...' : 'Create Event'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CreateEventForm; 