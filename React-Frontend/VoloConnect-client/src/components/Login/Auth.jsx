import React, { useState } from "react";
import "./Auth.css";

const VoloConnect = () => {
  const [isSignup, setIsSignup] = useState(true);
  const [showSkills, setShowSkills] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    university: "",
    department: "",
    password: "",
  });
  const [selectedSkills, setSelectedSkills] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillChange = (e) => {
    const skill = e.target.value;
    setSelectedSkills((prevSkills) =>
      prevSkills.includes(skill)
        ? prevSkills.filter((s) => s !== skill)
        : [...prevSkills, skill]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignup && showSkills) {
      console.log("Signup Data", { ...formData, skills: selectedSkills });
    } else if (isSignup) {
      setShowSkills(true);
    } else {
      console.log("Login Data", formData);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setShowSkills(false);
  };

  return (
    <div className="mainContainer">
      <h2 className="project-title">VOLO-CONNECT</h2>
      <div className="main">
        <div className="auth-toggle-link">
          {isSignup ? (
            <p>Already have an account? <a href="#" onClick={toggleMode}>Login</a></p>
          ) : (
            <p>Don't have an account? <a href="#" onClick={toggleMode}>Sign up</a></p>
          )}
        </div>

        {isSignup ? (
          <div className="signup">
            {!showSkills ? (
              <form onSubmit={handleSubmit}>
                <h3 className="form-title">Sign up</h3>
                <input type="text" name="username" placeholder="Full Name" required onChange={handleChange} />
                <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
                <input type="number" name="phoneNumber" placeholder="Phone Number" required onChange={handleChange} />
                <input type="text" name="university" placeholder="University" required onChange={handleChange} />
                <input type="text" name="department" placeholder="Department" required onChange={handleChange} />
                <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
                <button type="submit">Next</button>
              </form>
            ) : (
              <div className="skills-selection">
                <h3>Select Your Skills</h3>
                {["JavaScript", "React", "Node.js", "Python", "Java", "HTML", "CSS", "Angular", "Vue.js", "TypeScript", "C#", "Ruby", "PHP", "Swift"].map((skill) => (
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
                <button type="button" onClick={() => setShowSkills(false)}>Back</button>
                <button type="submit" onClick={handleSubmit}>Submit</button>
              </div>
            )}
          </div>
        ) : (
          <div className="login">
            <form onSubmit={handleSubmit}>
              <h3 className="form-title">Login</h3>
              <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
              <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
              <button type="submit">Login</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoloConnect;