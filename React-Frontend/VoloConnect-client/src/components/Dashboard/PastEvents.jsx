// PastEvents.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const PastEvents = ({ participatedEvents }) => {
  const navigate = useNavigate();

  return (
    <section className="past-events-section">
      <div className="container">
        <div className="section-header">
          <h2>Your <span className="text-primary">Activities</span></h2>
          <p>Track your volunteer journey</p>
        </div>

        <div className="row g-4 mt-3">
          {participatedEvents.map(event => (
            <div className="col-md-6" key={event.id}>
              <div className="activity-card">
                <div className="activity-image">
                  <img src={event.image} alt={event.title} />
                  <div className={`activity-status ${event.status}`}>{event.status}</div>
                </div>
                <div className="activity-details">
                  <h3>{event.title}</h3>
                  <div className="activity-info">
                    <p><i className="bi bi-geo-alt"></i> {event.location}</p>
                    <p><i className="bi bi-calendar3"></i> {event.date}</p>
                    <p><i className="bi bi-clock"></i> {event.hours} hours</p>
                  </div>
                  <div className="activity-actions">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => navigate(`/certificate/${event.id}`)}
                    >
                      <i className="bi bi-award me-1"></i> Certificate
                    </button>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(`/feedback/${event.id}`)}
                    >
                      <i className="bi bi-chat-left-text me-1"></i> Feedback
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-4">
          <Link to="/activities" className="btn btn-outline-primary">View All Activities</Link>
        </div>
      </div>
    </section>
  );
};

export default PastEvents;
