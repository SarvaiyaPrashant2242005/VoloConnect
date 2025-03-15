import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './CreateEvent.css';
import Navbar from "../Navbar";


const CreateEvent = () => {
  const navigate = useNavigate();
  
  // State for form fields
  const [formData, setFormData] = useState({
    eventName: '',
    eventDescription: '',
    startTime: '',
    endTime: '',
    location: '',
    category: '',
    requiredVolunteers: '',
    minRequiredVolunteers: '',
    roleNeeded: '',
    poster: null
  });
  
  // Available roles for dropdown
  const availableRoles = [
    'General Volunteer',
    'Team Leader',
    'Coordinator',
    'Instructor',
    'Food Server',
    'Driver',
    'Tech Support',
    'Administrative Support',
    'Event Setup/Cleanup',
    'Other'
  ];
  
  // Available categories
  const categories = [
    'Environment',
    'Education',
    'Community',
    'Health',
    'Animals',
    'Arts & Culture',
    'Disaster Relief',
    'Youth Development',
    'Senior Support',
    'Technology'
  ];
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle file input change
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      poster: e.target.files[0]
    });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Here you would typically send the data to your API
    // For now, we'll just log it and navigate back to home
    console.log('Event data to submit:', formData);
    
    // Mock API call
    setTimeout(() => {
      // Navigate back to homepage after "successful" submission
      alert('Event created successfully!');
      navigate('/');
    }, 1000);
  };
  
  return (

    <div className="create-event-page">
          <Navbar />
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1>Create New <span className="text-primary">Event</span></h1>
          <p>Share a volunteer opportunity with your community</p>
        </div>
      </div>
      
      {/* Create Event Form */}
      <div className="container my-5">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                {/* Event Name */}
                <div className="col-md-12">
                  <label htmlFor="eventName" className="form-label">Event Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="eventName"
                    name="eventName"
                    placeholder="Name"
                    value={formData.eventName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                {/* Event Description */}
                <div className="col-md-12">
                  <label htmlFor="eventDescription" className="form-label">Event Description</label>
                  <textarea
                    className="form-control"
                    id="eventDescription"
                    name="eventDescription"
                    rows="4"
                    placeholder="Provide details about the volunteer event, its purpose, and what volunteers will be doing."
                    value={formData.eventDescription}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
                
                {/* Event Time */}
                <div className="col-md-6">
                  <label htmlFor="startTime" className="form-label">Event Starting Time</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="endTime" className="form-label">Event Ending Time</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                {/* Location */}
                <div className="col-md-6">
                  <label htmlFor="location" className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-control"
                    id="location"
                    name="location"
                    placeholder="Venue"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                {/* Category */}
                <div className="col-md-6">
                  <label htmlFor="category" className="form-label">Category</label>
                  <select
                    className="form-select"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category.toLowerCase()}>{category}</option>
                    ))}
                  </select>
                </div>
                
                {/* Volunteers Required */}
                <div className="col-md-6">
                  <label htmlFor="requiredVolunteers" className="form-label">Required Volunteers (Maximum)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="requiredVolunteers"
                    name="requiredVolunteers"
                    placeholder="Numbers"
                    min="1"
                    value={formData.requiredVolunteers}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="minRequiredVolunteers" className="form-label">Minimum Required Volunteers</label>
                  <input
                    type="number"
                    className="form-control"
                    id="minRequiredVolunteers"
                    name="minRequiredVolunteers"
                    placeholder="Numbers"
                    min="1"
                    value={formData.minRequiredVolunteers}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                {/* Role Needed */}
                <div className="col-md-12">
                  <label htmlFor="roleNeeded" className="form-label">Role Needed</label>
                  <select
                    className="form-select"
                    id="roleNeeded"
                    name="roleNeeded"
                    value={formData.roleNeeded}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a role</option>
                    {availableRoles.map((role, index) => (
                      <option key={index} value={role.toLowerCase().replace(' ', '-')}>{role}</option>
                    ))}
                  </select>
                </div>
                
                {/* Poster Upload */}
                <div className="col-md-12">
                  <label htmlFor="poster" className="form-label">Poster (Optional)</label>
                  <input
                    type="file"
                    className="form-control"
                    id="poster"
                    name="poster"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <div className="form-text">Upload an image to promote your event. Maximum size: 5MB.</div>
                </div>
                
                {/* Additional Fields */}
                <div className="col-md-12">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="requiresTraining"
                    />
                    <label className="form-check-label" htmlFor="requiresTraining">
                      This event requires prior training or orientation
                    </label>
                  </div>
                </div>
                
                <div className="col-md-12">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="providesCertificate"
                    />
                    <label className="form-check-label" htmlFor="providesCertificate">
                      This event provides a volunteer certificate
                    </label>
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="col-12 mt-4">
                  <button type="submit" className="btn btn-primary btn-lg w-100">
                    Create and Upload Event
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* Tips Section */}
        <div className="card mt-4">
          <div className="card-header bg-dark">
            <h5 className="mb-0">Tips for Creating a Successful Volunteer Event</h5>
          </div>
          <div className="card-body">
            <ul className="mb-0">
              <li>Be specific about what volunteers will be doing</li>
              <li>Include any special skills or requirements needed</li>
              <li>Mention if refreshments or equipment will be provided</li>
              <li>Add clear directions to the location</li>
              <li>Set realistic volunteer requirements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;