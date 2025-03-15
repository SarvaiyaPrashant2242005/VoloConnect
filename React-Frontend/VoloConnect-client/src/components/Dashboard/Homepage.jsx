import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Homepage.css';
import Navbar from "../Navbar";
import UpcomingEvents from "./UpcomingEvents";
import PastEvents from "./PastEvents";  // Import the PastEvents component

const Homepage = () => {
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [participatedEvents, setParticipatedEvents] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isNavbarScrolled, setIsNavbarScrolled] = useState(false);
  
  // Handle navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsNavbarScrolled(true);
      } else {
        setIsNavbarScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Mock data for events (replace with API calls to your MySQL database)
  useEffect(() => {
    const fetchEvents = () => {
      // Mock upcoming events
      const mockUpcomingEvents = [
        {
          id: 1,
          title: "Community Cleanup Drive",
          location: "City Park, Downtown",
          date: "March 20, 2025",
          time: "9:00 AM - 1:00 PM",
          category: "environment",
          image: "https://thumbs.dreamstime.com/z/helping-environment-hands-caring-sustainability-concept-mans-hands-palms-up-helping-environment-hands-caring-169620461.jpg?ct=jpeg",
          spots: 15,
          participants: 8
        },
        {
          id: 2,
          title: "Teach Basic Computer Skills",
          location: "Community Center",
          date: "March 22, 2025",
          time: "2:00 PM - 5:00 PM",
          category: "education",
          image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1GUPyXEeYHBRlvM8H0JUIqk3RggyZfBsgUH2rpZJQZeP40zrBB2Gi7GzGDjRIGEnk1Yc&usqp=CAU",
          spots: 10,
          participants: 3
        },
        {
          id: 3,
          title: "Food Bank Assistance",
          location: "Downtown Food Bank",
          date: "March 25, 2025",
          time: "10:00 AM - 2:00 PM",
          category: "community",
          image: "https://source.unsplash.com/random/300x200/?foodbank",
          spots: 20,
          participants: 12
        },
        {
          id: 4,
          title: "Tech Workshop for Seniors",
          location: "Public Library",
          date: "March 27, 2025",
          time: "1:00 PM - 4:00 PM",
          category: "education",
          image: "https://source.unsplash.com/random/300x200/?seniors",
          spots: 12,
          participants: 5
        }
      ];
      
      // Mock participated events
      const mockParticipatedEvents = [
        {
          id: 101,
          title: "University Mentorship Program",
          location: "Main Campus",
          date: "February 15, 2025",
          hours: 4.5,
          status: "completed",
          image: "https://source.unsplash.com/random/300x200/?mentoring"
        },
        {
          id: 102,
          title: "Homeless Shelter Support",
          location: "Hope Center",
          date: "February 28, 2025",
          hours: 3,
          status: "completed",
          image: "https://source.unsplash.com/random/300x200/?shelter"
        }
      ];
      
      setUpcomingEvents(mockUpcomingEvents);
      setParticipatedEvents(mockParticipatedEvents);
    };
    
    fetchEvents();
  }, []);
  
  // Filter events by category
  const filterEvents = (category) => {
    setActiveCategory(category);
  };
  
  // Calculate total volunteer hours
  const totalHours = participatedEvents.reduce((total, event) => total + event.hours, 0);
  
  return (
    <div className="homepage">
      {/* Navbar */}
      <Navbar/>

      {/* Hero Section with Summary Dashboard */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="welcome-message">
                <h1>Welcome Back, <span className="text-primary">John!</span></h1>
                <p>Ready to make an impact in your community?</p>
              </div>
              <div className="stats-dashboard row g-3 mt-4">
                <div className="col-md-4">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="bi bi-calendar-check"></i>
                    </div>
                    <div className="stat-details">
                      <h3>{participatedEvents.length}</h3>
                      <p>Events Completed</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="bi bi-clock-history"></i>
                    </div>
                    <div className="stat-details">
                      <h3>{totalHours}</h3>
                      <p>Volunteer Hours</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="bi bi-award"></i>
                    </div>
                    <div className="stat-details">
                      <h3>3</h3>
                      <p>Certificates</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-image-container">
                <img src="https://images.unsplash.com/photo-1543269866-487350d6fa5e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Volunteering" className="hero-image" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <UpcomingEvents/>

      {/* Past Events Section */}
      <PastEvents participatedEvents={participatedEvents}/>

      {/* Call to Action */}
      <div className="container-event text-center">
        <h2>Become an <span className="text-primary">Event Organizer</span></h2>
        <div className="mt-3">
          <Link to="/newEve" className="btn btn-primary btn-lg">
            Create Event
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-lg-4">
              <h3>Volo<span className="text-primary">Connect</span></h3>
              <p>Connecting volunteers with meaningful opportunities since 2023. Our platform helps you find, participate in, and organize volunteer events in your community.</p>

            </div>
            <div className="col-lg-2">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/events">Events</Link></li>
                <li><Link to="/about">Certificates</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/contact">Create Events</Link></li>
              </ul>
            </div>
            <div className="col-lg-2">
              <h4>Resources</h4>
              <ul className="footer-links">
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/testimonials">Testimonials</Link></li>
                <li><Link to="/partners">Partners</Link></li>
              </ul>
            </div>
            <div className="col-lg-4">
              <h4>Stay Updated</h4>
              <p>Subscribe to our newsletter for the latest volunteer opportunities.</p>
              <form className="newsletter-form">
                <div className="input-group">
                  <input type="email" className="form-control" placeholder="Your email address" required />
                  <button className="btn btn-primary" type="submit">Subscribe</button>
                </div>
              </form>
            </div>
          </div>
          <div className="copyright text-center mt-4">
            <p>&copy; 2025 VoloConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
