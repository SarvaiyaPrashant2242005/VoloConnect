import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Navbar.css';

const Navbar = () => {
  const [isNavbarScrolled, setIsNavbarScrolled] = useState(false);
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(true);
  const navbarCollapseRef = useRef(null);

  // Handle navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsNavbarScrolled(true);
      } else {
        setIsNavbarScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Toggle navbar collapse state
  const toggleNavbar = () => {
    setIsNavbarCollapsed(!isNavbarCollapsed);
  };

  return (
    <nav className={`navbar navbar-expand-lg navbar-dark fixed-top ${isNavbarScrolled ? "navbar-scrolled" : ""}`}>
      <div className="container">
        <NavLink className="navbar-brand" to="/">
          <span className="logo-text">Volo<span className="text-primary">Connect</span></span>
        </NavLink>
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={toggleNavbar}
          aria-controls="navbarNav" 
          aria-expanded={!isNavbarCollapsed} 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div 
          className={`navbar-collapse ${isNavbarCollapsed ? 'collapsed' : 'expanded'}`} 
          ref={navbarCollapseRef}
          id="navbarNav"
        >
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className={({isActive}) => isActive ? "nav-link active" : "nav-link"} to="/homepage" end>Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({isActive}) => isActive ? "nav-link active" : "nav-link"} to="/events">Events</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({isActive}) => isActive ? "nav-link active" : "nav-link"} to="/certificates">Certificates</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({isActive}) => isActive ? "nav-link active" : "nav-link"} to="/ContactUs">Contact Us</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({isActive}) => isActive ? "nav-link active" : "nav-link"} to="/newEve">Create Event</NavLink>
            </li>
          </ul>
          <div className="user-actions d-flex align-items-center">
            <div className="dropdown">
              <button 
                className="btn btn-link dropdown-toggle text-white" 
                type="button" 
                id="userDropdown" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <i className="bi bi-person-circle me-1"></i> John Doe
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li><NavLink className="dropdown-item" to="/profile"><i className="bi bi-person me-2"></i>Profile</NavLink></li>
                <li><hr className="dropdown-divider" /></li>
                <li><NavLink className="dropdown-item" to="/Auth"><i className="bi bi-box-arrow-right me-2"></i>Logout</NavLink></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;