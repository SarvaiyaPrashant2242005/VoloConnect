import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "./UpcomingEvents.css";

const UpcomingEvents = () => {
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("YOUR_API_ENDPOINT/upcoming-events"); // Replace with actual API endpoint
        const data = await response.json();
        setUpcomingEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    
    fetchEvents();
  }, []);

  const filterEvents = (category) => {
    setActiveCategory(category);
  };

  return (
    <section className="events-section">
      <div className="container">
        <div className="section-header d-flex justify-content-between align-items-center">
          <div>
            <h2>Upcoming <span className="text-primary">Events</span></h2>
            <p>Discover opportunities near you</p>
          </div>
          <div className="category-filters">
            <button className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => filterEvents('all')}>All</button>
            <button className={`filter-btn ${activeCategory === 'environment' ? 'active' : ''}`} onClick={() => filterEvents('environment')}>Environment</button>
            <button className={`filter-btn ${activeCategory === 'education' ? 'active' : ''}`} onClick={() => filterEvents('education')}>Education</button>
          </div>
        </div>

        <div className="row g-4 mt-3">
          {upcomingEvents.filter(event => activeCategory === 'all' || event.category === activeCategory).map(event => (
            <div className="col-lg-3 col-md-6" key={event.id}>
              <div className="event-card">
                <div className="event-image">
                  <img src={event.image} alt={event.title} />
                  <div className="event-category">{event.category}</div>
                </div>
                <div className="event-details">
                  <h3>{event.title}</h3>
                  <div className="event-info">
                    <p><i className="bi bi-geo-alt"></i> {event.location}</p>
                    <p><i className="bi bi-calendar3"></i> {event.date}</p>
                    <p><i className="bi bi-clock"></i> {event.time}</p>
                  </div>
                  <div className="spots-info">
                    <div className="progress">
                      <div className="progress-bar" role="progressbar" style={{ width: `${(event.participants / event.spots) * 100}%` }} aria-valuenow={event.participants} aria-valuemin="0" aria-valuemax={event.spots}></div>
                    </div>
                    <span>{event.spots - event.participants} spots left</span>
                  </div>
                  <button className="btn btn-primary w-100 mt-3" onClick={() => navigate(`/event/${event.id}`)}>View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-4">
          <Link to="/events" className="btn btn-outline-primary">View All Events</Link>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
