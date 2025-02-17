import React, { useState } from "react";
import "./style.css"; // Make sure to create a corresponding CSS file

const VoloConnect = () => {
  const [isSignup, setIsSignup] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(isSignup ? "Signup Data" : "Login Data", formData);
    // Add API integration here
  };

  return (
    <>    <h2 className="project-title">VOLO-CONNECT</h2>

    <div className="main">
      <input
        type="checkbox"
        id="chk"
        checked={!isSignup}
        onChange={() => setIsSignup(!isSignup)}
      />

      {/* Signup Form */}
      <div className="signup">
        <form onSubmit={handleSubmit}>
          <label htmlFor="chk">Sign up</label>
          <input
            type="text"
            name="username"
            placeholder="User name"
            required
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            onChange={handleChange}
          />
          <input
            type="number"
            name="phoneNumber"
            placeholder="Phone Number"
            required
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={handleChange}
          />
          <button type="submit">Sign up</button>
        </form>
      </div>

      {/* Login Form */}
      <div className="login">
        <form onSubmit={handleSubmit}>
          <label htmlFor="chk">Login</label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={handleChange}
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
    </>

  );
};

export default VoloConnect;
