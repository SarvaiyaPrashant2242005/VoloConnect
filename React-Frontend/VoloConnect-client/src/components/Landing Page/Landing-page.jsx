import React from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Landingpage = () => {
  const navigate = useNavigate();

  const handleAuthNavigation = () => {
    navigate('/auth'); // Redirects to Auth.jsx
  };

  return (
    <div className="bg-dark min-vh-100 d-flex flex-column">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold text-primary">Volo Connect</span>
          <div>
            <button className="btn btn-primary" onClick={handleAuthNavigation}>Login</button>
            <button className="btn btn-primary" onClick={handleAuthNavigation}>Sign Up</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow-1">
        {/* Hero Section */}
        <header className="text-center py-5 bg-dark">
          <div className="container">
            <h2 className="display-5 fw-bold text-white">
              Simplify Volunteer <span className="text-primary">Management</span>
            </h2>
            <p className="lead text-light">
              Empower students to connect with impactful volunteering opportunities.
            </p>
            <button className="btn btn-primary btn-lg mt-3">Get Started</button>
          </div>
        </header>

        {/* Features Section */}
        <section className="container py-5 bg-dark">
          <div className="row g-4">
            {[
              { title: "Find Volunteer Events", description: "Browse and sign up for university-approved volunteer events." },
              { title: "Track Your Impact", description: "Log hours and showcase your contributions effortlessly." },
              { title: "Earn Recognition", description: "Get certificates and awards for your volunteering efforts." },
            ].map((feature, index) => (
              <div key={index} className="col-md-4">
                <div className="card shadow-sm bg-secondary text-white">
                  <div className="card-body">
                    <h5 className="card-title">{feature.title}</h5>
                    <p className="card-text text-light">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-primary text-white py-5">
          <div className="container">
            <h2 className="fw-bold">Join Volo Connect Today!</h2>
            <p className="lead">Make a difference in your university community.</p>
            <button className="btn btn-light btn-lg mt-3">Sign Up Now</button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="text-center py-3 bg-dark text-white">
        <p className="mb-0">&copy; 2025 Volo Connect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landingpage;