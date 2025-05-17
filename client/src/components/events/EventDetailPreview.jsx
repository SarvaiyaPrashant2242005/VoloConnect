import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Typography, 
  Button,
  Chip,
  Avatar
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import styles from './EventDetail.module.css';

/**
 * EventDetailPreview Component
 * Shows a preview of the enhanced event details page
 */
const EventDetailPreview = () => {
  const sampleEvent = {
    id: 1,
    title: "Community Park Cleanup",
    description: "Join us for a day of community service as we work together to clean up Central Park. We'll be removing litter, planting flowers, and maintaining the walking trails. All cleaning supplies will be provided. Please wear comfortable clothes and bring water.",
    location: "Central Park, Main Entrance",
    start_date: new Date('2023-08-15T09:00:00'),
    end_date: new Date('2023-08-15T14:00:00'),
    status: "active",
    current_volunteers: 18,
    max_volunteers: 30,
    organizer_name: "Jane Smith",
    organizer_email: "jane.smith@example.com",
    image_url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3"
  };

  // Format dates
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // Calculate volunteer progress percentage
  const volunteerProgress = Math.min((sampleEvent.current_volunteers / sampleEvent.max_volunteers) * 100, 100);

  return (
    <div className={styles.eventDetailContainer} style={{ maxWidth: '100%', margin: '0 auto' }}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div 
          className={styles.heroBackground} 
          style={{ 
            backgroundImage: `url(${sampleEvent.image_url})`
          }}
        ></div>
        
        <div className={styles.heroContent}>
          <Button 
            variant="contained" 
            component={Link} 
            to="#"
            className={styles.backButton}
            startIcon={<ArrowBackIcon />}
          >
            Back to Dashboard
          </Button>
          
          <Typography variant="h2" component="h1" className={styles.eventTitle}>
            {sampleEvent.title}
          </Typography>
          
          <Chip 
            label={sampleEvent.status} 
            className={styles.statusChip} 
            color="success"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.contentGrid}>
          {/* Left Column - Event Details */}
          <div>
            {/* About Section */}
            <div className={styles.sectionCard} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', marginBottom: '2rem' }}>
              <Typography variant="h5" className={styles.sectionTitle}>
                About this Event
              </Typography>
              <Typography variant="body1" paragraph className={styles.description}>
                {sampleEvent.description}
              </Typography>

              <div className={styles.detailsList}>
                <div className={styles.detailItem}>
                  <div className={styles.detailIcon}>
                    <LocationOnIcon />
                  </div>
                  <div className={styles.detailContent}>
                    <Typography variant="subtitle2" className={styles.detailLabel}>
                      Location
                    </Typography>
                    <Typography variant="body1" className={styles.detailValue}>
                      {sampleEvent.location}
                    </Typography>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailIcon}>
                    <CalendarTodayIcon />
                  </div>
                  <div className={styles.detailContent}>
                    <Typography variant="subtitle2" className={styles.detailLabel}>
                      Date
                    </Typography>
                    <Typography variant="body1" className={styles.detailValue}>
                      {formatDate(sampleEvent.start_date)}
                    </Typography>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailIcon}>
                    <AccessTimeIcon />
                  </div>
                  <div className={styles.detailContent}>
                    <Typography variant="subtitle2" className={styles.detailLabel}>
                      Time
                    </Typography>
                    <Typography variant="body1" className={styles.detailValue}>
                      {formatTime(sampleEvent.start_date)} - {formatTime(sampleEvent.end_date)}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Queries Section Preview */}
            <div className={styles.sectionCard} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', marginBottom: '2rem' }}>
              <Typography variant="h5" className={styles.sectionTitle}>
                <QuestionAnswerIcon className={styles.sectionIcon} /> Questions & Answers
              </Typography>
              
              <div className={styles.queryItem} style={{ backgroundColor: '#f8f9fa', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', marginBottom: '1rem' }}>
                  <Avatar className={styles.queryAvatar} style={{ backgroundColor: '#3f51b5', marginRight: '1rem' }}>J</Avatar>
                  <div>
                    <Typography variant="subtitle1" className={styles.queryMessage}>
                      Are there any age restrictions for volunteers?
                    </Typography>
                    <Typography variant="caption" className={styles.queryTime}>
                      August 10, 2023, 2:30 PM
                    </Typography>
                  </div>
                </div>
                
                <div className={styles.responseContainer}>
                  <div className={styles.responseBox}>
                    <Typography variant="body2" className={styles.responseText}>
                      Great question! Volunteers of all ages are welcome, but children under 16 should be accompanied by an adult. We'll have tasks appropriate for all age groups.
                    </Typography>
                    <Typography variant="caption" className={styles.responseAuthor}>
                      Response from Jane Smith
                    </Typography>
                  </div>
                </div>
              </div>
              
              <div className={styles.queryForm} style={{ marginTop: '2rem' }}>
                <Typography variant="body2" style={{ marginBottom: '1rem', color: '#666' }}>
                  Have a question? You can easily ask the event organizer using our improved query system.
                </Typography>
              </div>
            </div>
          </div>

          {/* Right Column - Volunteer Info & Actions */}
          <div>
            {/* Volunteer Stats Card */}
            <div className={styles.statsCard} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', marginBottom: '2rem' }}>
              <Typography variant="h6" className={styles.sectionTitle}>
                <PeopleIcon className={styles.sectionIcon} /> Volunteer Spots
              </Typography>
              
              <Typography variant="h3" className={styles.volunteerCount} style={{ color: '#3f51b5', fontSize: '3rem', fontWeight: '700' }}>
                {sampleEvent.current_volunteers}/{sampleEvent.max_volunteers}
              </Typography>
              
              <Typography variant="body2" className={styles.volunteerLabel} style={{ color: '#666' }}>
                volunteer spots filled
              </Typography>
              
              <div className={styles.progressContainer} style={{ backgroundColor: '#eef0ff', borderRadius: '1rem', height: '10px', marginTop: '1rem' }}>
                <div 
                  className={styles.progressBar} 
                  style={{ 
                    width: `${volunteerProgress}%`,
                    height: '100%',
                    background: 'linear-gradient(to right, #3f51b5, #7986cb)',
                    borderRadius: '1rem'
                  }}
                ></div>
              </div>
            </div>

            {/* Organizer Card */}
            <div className={styles.statsCard} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', marginBottom: '2rem' }}>
              <Typography variant="h6" className={styles.sectionTitle}>
                <PersonIcon className={styles.sectionIcon} /> Organizer
              </Typography>
              
              <div className={styles.organizerHeader} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Avatar className={styles.organizerAvatar} style={{ backgroundColor: '#3f51b5', width: '64px', height: '64px', fontSize: '1.8rem' }}>
                  {sampleEvent.organizer_name.charAt(0)}
                </Avatar>
                
                <div>
                  <Typography variant="body1" className={styles.organizerName} style={{ fontWeight: '600' }}>
                    {sampleEvent.organizer_name}
                  </Typography>
                  
                  <Typography variant="body2" className={styles.organizerEmail} style={{ color: '#888' }}>
                    {sampleEvent.organizer_email}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: '1.5rem' }}>
              <Button 
                variant="contained"
                color="primary"
                className={`${styles.actionButton} ${styles.primaryButton}`}
                style={{ 
                  padding: '1rem 0', 
                  borderRadius: '2rem', 
                  width: '100%', 
                  marginBottom: '1rem',
                  background: 'linear-gradient(45deg, #3f51b5, #7986cb)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: '600'
                }}
              >
                Volunteer Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPreview; 