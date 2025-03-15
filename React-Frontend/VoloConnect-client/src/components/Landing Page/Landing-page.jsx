import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './Landing-page.css';

const Landingpage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Bootstrap navbar functionality
    const initializeBootstrap = () => {
      // Make sure bootstrap is properly loaded
      if (typeof window.bootstrap !== 'undefined') {
        // Initialize all tooltips, popovers, and other Bootstrap components
        const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
        dropdownElementList.forEach(function (dropdownToggleEl) {
          new window.bootstrap.Dropdown(dropdownToggleEl);
        });
        
        // Make sure the navbar toggler works
        const navbarToggler = document.querySelector('.navbar-toggler');
        if (navbarToggler) {
          navbarToggler.addEventListener('click', function() {
            const target = document.querySelector(this.getAttribute('data-bs-target'));
            if (target) {
              target.classList.toggle('show');
            }
          });
        }
      }
    };

    // Navbar scroll effect
    const handleScroll = () => {
      const navbar = document.getElementById('navbar');
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.classList.add('navbar-scrolled');
        } else {
          navbar.classList.remove('navbar-scrolled');
        }
      }

      // Handle scroll top button visibility
      const scrollBtn = document.querySelector('.scroll-top-btn');
      if (scrollBtn) {
        if (window.scrollY > 300) {
          scrollBtn.classList.add('visible');
        } else {
          scrollBtn.classList.remove('visible');
        }
      }
    };

    // Add animation classes to elements with fade-in class
    const animateElements = () => {
      const elements = document.querySelectorAll('.fade-in');
      elements.forEach((element, index) => {
        setTimeout(() => {
          element.classList.add('visible');
        }, index * 150);
      });
    };

    window.addEventListener('scroll', handleScroll);
    animateElements();
    initializeBootstrap();

    // Initialize scroll button
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleAuthNavigation = (path) => {
    navigate('/auth', { state: { view: path } });
  };

  return (
    <div className="landing-page">
      {/* Animated particles background */}
      <div className="particles-container">
        <div className="particles"></div>
      </div>

      {/* Navbar */}
      <nav id="navbar" className="navbar navbar-expand-lg navbar-dark fixed-top">
        <div className="container">
          <a className="navbar-brand" href="#home">
            <span className="logo-text">Volo<span className="text-primary">Connect</span></span>
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <a className="nav-link" href="#features">Features</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#how-it-works">How It Works</a>
              </li>
            </ul>
            <div className="auth-buttons">
              <button onClick={() => handleAuthNavigation('login')}>
                Login
              </button>
              <button onClick={() => handleAuthNavigation('signup')} className="d-none d-lg-inline-block">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header id="home" className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 text-center text-lg-start">
              <div className="fade-in">
                <h1 className="hero-title">
                  Empowering <span className="text-primary">Volunteers</span>
                  <br />
                  Connecting <span className="text-primary">Communities</span>
                </h1>
                <p className="hero-subtitle">
                  A comprehensive platform for university students to discover,
                  manage, and track volunteer opportunities.
                </p>
                <div className="hero-buttons">
                  <button className="btn btn-primary btn-lg me-3 hover-float" onClick={() => handleAuthNavigation('signup')}>
                    Get Started
                  </button>
                  <a href="#features" className="btn btn-outline-light btn-lg hover-float">
                    Learn More
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-image-container fade-in slide-in-right">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRR92XyqUIIPx85xBwWMRaev38Ix_Ob9znShA&s" alt="Students volunteering" className="hero-image" />
              </div>
            </div>
          </div>
        </div>
        <div className="hero-wave">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#121212" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header text-center mb-5 fade-in">
            <h2 className="section-title">Why Choose <span className="text-primary">Volo Connect</span>?</h2>
            <p className="section-subtitle">Streamlined volunteer management for universities and students</p>
          </div>

          <div className="row g-4">
            {[
              {
                icon: "bi bi-calendar-event",
                title: "Easy Event Discovery",
                description: "Find and apply for university-approved volunteer events that match your interests and skills."
              },
              {
                icon: "bi bi-graph-up",
                title: "Track Your Impact",
                description: "Monitor your volunteering hours, achievements, and impact with an intuitive dashboard."
              },
              {
                icon: "bi bi-award",
                title: "Digital Certificates",
                description: "Receive verified digital certificates for your volunteering efforts to enhance your portfolio."
              },
              {
                icon: "bi bi-bell",
                title: "Smart Notifications",
                description: "Get timely reminders about upcoming events and application status updates."
              },
              {
                icon: "bi bi-people",
                title: "Community Building",
                description: "Connect with fellow volunteers and build a network of like-minded individuals."
              },
              {
                icon: "bi bi-stars",
                title: "Skill Development",
                description: "Match opportunities to your skills and interests, enhancing your personal growth."
              }
            ].map((feature, index) => (
              <div key={index} className="col-md-6 col-lg-4">
                <div className="feature-card fade-in">
                  <div className="feature-icon-container">
                    <i className={feature.icon}></i>
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="container">
          <div className="section-header text-center mb-5 fade-in">
            <h2 className="section-title">How It <span className="text-primary">Works</span></h2>
            <p className="section-subtitle">Simple steps to get started</p>
          </div>

          <div className="steps-container">
            {[
              { number: "01", title: "Create Account", description: "Sign up with your university email and complete your profile." },
              { number: "02", title: "Browse Events", description: "Explore volunteer opportunities that match your interests." },
              { number: "03", title: "Apply & Participate", description: "Submit applications and participate in approved events." },
              { number: "04", title: "Earn Recognition", description: "Get certificates and build your volunteering portfolio." }
            ].map((step, index) => (
              <div key={index} className="step-item fade-in">
                <div className="step-number">{step.number}</div>
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content text-center fade-in">
            <h2 className="cta-title">Ready to Transform Volunteer Management?</h2>
            <p className="cta-subtitle">Join thousands of students and faculty members already using Volo Connect</p>
            <button
              className="btn btn-primary btn-lg cta-button"
              onClick={() => handleAuthNavigation('signup')}
            >
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-bottom">
          <div className="copyright">
            <p>&copy; 2025 Volo Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      <button className="scroll-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <i className="bi bi-arrow-up"></i>
      </button>
    </div>
  );
};

export default Landingpage;