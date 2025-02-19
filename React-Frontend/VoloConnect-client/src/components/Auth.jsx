import React, { useState } from "react";
import "./style.css"; // Make sure to create a corresponding CSS file

const VoloConnect = () => {
  const [isSignup, setIsSignup] = useState(true);
  const [showSkills, setShowSkills] = useState(false); // State to control skills section visibility
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    department: "",
    password: "",
    confirmPassword: "",
  });
  const [selectedSkills, setSelectedSkills] = useState([]); // State to store selected skills

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillChange = (e) => {
    const skill = e.target.value;
    setSelectedSkills((prevSkills) =>
      prevSkills.includes(skill)
        ? prevSkills.filter((s) => s !== skill) // Remove skill if already selected
        : [...prevSkills, skill] // Add skill if not selected
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignup) {
      console.log("Signup Data", { ...formData, skills: selectedSkills });
      // Add API integration here
    } else {
      console.log("Login Data", formData);
      // Add API integration here
    }
  };

  return (
    <>
      <h2 className="project-title">VOLO-CONNECT</h2>

      <div className="main">
        <input
          type="checkbox"
          id="chk"
          checked={!isSignup}
          onChange={() => setIsSignup(!isSignup)}
        />

        {/* Signup Form */}
        <div className="signup">
          {!showSkills ? ( // Show form fields if skills section is not visible
            <form onSubmit={handleSubmit}>
              <label htmlFor="chk">Sign up</label>
              <input
                type="text"
                name="username"
                placeholder="Full Name"
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
                type="text"
                name="University"
                placeholder="University"
                required
                onChange={handleChange}
              />
              <input
                type="text"
                name="department"
                placeholder="Department"
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
              <button type="submit" onClick={() => setShowSkills(true)}>
                Next
              </button>
            </form>
          ) : (
            // Show skills section if skills section is visible
            <div className="skills-selection">
            <h3>Select Your Skills</h3>
            {[
              "JavaScript", "React", "Node.js", "Python", "Java", "HTML", "CSS", 
              "Angular", "Vue.js", "TypeScript", "C#", "Ruby", "PHP", "Swift"
            ].map((skill) => (
              <label key={skill}>
                <input
                  type="checkbox"
                  value={skill}
                  checked={selectedSkills.includes(skill)}
                  onChange={handleSkillChange}
                />
                {skill}
              </label>
            ))}
            <button type="button" onClick={() => setShowSkills(false)}>
              Back
            </button>
            <button type="button" onClick={handleSubmit}>
              Submit
            </button>
          </div>
            
          )}
        </div>

        {/* Duplicate Signup Button */}
        {!showSkills && ( // Show duplicate button only if skills section is not visible
          <button type="submit" onClick={() => setShowSkills(true)}>
            Sign up
          </button>
        )}

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