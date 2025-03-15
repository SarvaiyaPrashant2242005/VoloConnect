import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ContactUs.css';
import Navbar from '../Navbar';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission (e.g., send data to an API or service)
    console.log('Form Submitted:', formData);
  };

  return (
    <div className="contact-us-section py-5">
      <div className="container">
        <Navbar />
        <h2 className="text-center text-light mb-4">Contact Us</h2>
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="contact-form-card">
              <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                  <label htmlFor="name" className="text-light">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="email" className="text-light">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="message" className="text-light">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    className="form-control"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Write your message"
                    required
                  />
                </div>
                <div className="text-center">
                  <button type="submit" className="btn btn-primary">Submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
