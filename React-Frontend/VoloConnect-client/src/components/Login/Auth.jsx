import React, { useState } from "react";
import "./Auth.css";
import { 
  FaGoogle, 
  FaGithub, 
  FaLinkedin, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaUniversity, 
  FaGraduationCap, 
  FaLock, 
  FaArrowRight, 
  FaArrowLeft, 
  FaSignInAlt, 
  FaUserPlus,
  FaCode,
  FaCheckCircle
} from "react-icons/fa";

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
    // Add animation classes for smooth transition
    const mainElement = document.querySelector('.main');
    mainElement.classList.add('form-transition');
    
    // Set timeout to toggle the form after animation starts
    setTimeout(() => {
      setIsSignup(!isSignup);
      setShowSkills(false);
      
      // Remove animation class after transition completes
      setTimeout(() => {
        mainElement.classList.remove('form-transition');
      }, 300);
    }, 150);
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
  };

  // Skill categories with icons
  const skillCategories = [
    {
      name: "Frontend",
      skills: ["JavaScript", "React", "HTML", "CSS", "Angular", "Vue.js", "TypeScript"]
    },
    {
      name: "Backend",
      skills: ["Node.js", "Python", "Java", "C#", "Ruby", "PHP"]
    },
    {
      name: "Mobile",
      skills: ["Swift", "React Native", "Flutter", "Kotlin"]
    }
  ];

  return (
    <div className="mainContainer">
      <h2 className="project-title">
        <FaCode className="title-icon" /> VOLO-CONNECT
      </h2>
      <div className="main">
        <div className="auth-toggle-link">
          {isSignup ? (
            <p>
              Already have an account? <a href="#" onClick={toggleMode}><FaSignInAlt /> Login</a>
            </p>
          ) : (
            <p>
              Don't have an account? <a href="#" onClick={toggleMode}><FaUserPlus /> Sign up</a>
            </p>
          )}
        </div>

        {isSignup ? (
          <div className="signup">
            {!showSkills ? (
              <form onSubmit={handleSubmit}>
                <h3 className="form-title"><FaUserPlus className="form-icon" /> Sign up</h3>
                <div className="input-group">
                  <FaUser className="input-icon" />
                  <input type="text" name="username" placeholder="Full Name" required onChange={handleChange} />
                </div>
                <div className="input-group">
                  <FaEnvelope className="input-icon" />
                  <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
                </div>
                <div className="input-group">
                  <FaPhone className="input-icon" />
                  <input type="number" name="phoneNumber" placeholder="Phone Number" required onChange={handleChange} />
                </div>
                <div className="input-group">
                  <FaUniversity className="input-icon" />
                  <input type="text" name="university" placeholder="University" required onChange={handleChange} />
                </div>
                <div className="input-group">
                  <FaGraduationCap className="input-icon" />
                  <input type="text" name="department" placeholder="Department" required onChange={handleChange} />
                </div>
                <div className="input-group">
                  <FaLock className="input-icon" />
                  <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
                </div>
                <button type="submit" className="next-btn">
                  Next <FaArrowRight />
                </button>
              </form>
            ) : (
              <div className="skills-selection">
                <h3><FaCode className="form-icon" /> Select Your Skills</h3>
                
                {skillCategories.map((category) => (
                  <div key={category.name} className="skill-category">
                    <h4>{category.name}</h4>
                    <div className="skills-grid">
                      {category.skills.map((skill) => (
                        <label key={skill} className="skill-checkbox">
                          <input
                            type="checkbox"
                            value={skill}
                            checked={selectedSkills.includes(skill)}
                            onChange={handleSkillChange}
                          />
                          <span className="checkbox-label">
                            {selectedSkills.includes(skill) ? <FaCheckCircle className="checked-icon" /> : null}
                            {skill}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="form-buttons">
                  <button type="button" onClick={() => setShowSkills(false)} className="back-btn">
                    <FaArrowLeft /> Back
                  </button>
                  <button type="submit" onClick={handleSubmit} className="submit-btn">
                    Submit <FaUserPlus />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="login">
            <form onSubmit={handleSubmit}>
              <h3 className="form-title"><FaSignInAlt className="form-icon" /> Login</h3>
              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
              </div>
              <div className="input-group">
                <FaLock className="input-icon" />
                <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
              </div>
              <div className="forgot-password">
                <a href="#">Forgot password?</a>
              </div>
              <button type="submit" className="login-btn">
                Login <FaSignInAlt />
              </button>
            </form>
            <div className="social-login">
              <p className="social-divider">Or login with</p>
              <div className="social-icons">
                <button onClick={() => handleSocialLogin("Google")} className="icon-btn google">
                  <FaGoogle />
                </button>
                <button onClick={() => handleSocialLogin("GitHub")} className="icon-btn github">
                  <FaGithub />
                </button>
                <button onClick={() => handleSocialLogin("LinkedIn")} className="icon-btn linkedin">
                  <FaLinkedin />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoloConnect;