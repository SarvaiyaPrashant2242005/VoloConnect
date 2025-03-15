import React from 'react';
import Navbar from '../Navbar';
import './Certificates.css'; // Optional: You can add a CSS file for styling

const Certificates = () => {
  return (
    <div>
      <Navbar />
      <div className="coming-soon">
        <h1>Coming Soon</h1>
        <p>We are working hard to bring you this feature. Stay tuned!</p>
      </div>
    </div>
  );
};

export default Certificates;
