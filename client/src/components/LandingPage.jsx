import { Link } from 'react-router-dom';
import styles from '../styles/LandingPage.module.css';
import PropTypes from 'prop-types';

const LandingPage = () => {
  return (
    <div className={styles.landingPage}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>VoloConnect</div>
        <div className={styles.navLinks}>
          <Link to="/login" className={styles.navButton}>Login</Link>
          <Link to="/register" className={`${styles.navButton} ${styles.primaryButton}`}>Sign Up</Link>
        </div>
      </nav>

      <main className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Connect. Volunteer. Impact.</h1>
          <p className={styles.heroSubtitle}>
            Join our community of volunteers and organizations making a difference in the world.
          </p>
          <div className={styles.ctaButtons}>
            <Link to="/register" className={`${styles.ctaButton} ${styles.primaryButton}`}>
              Get Started
            </Link>
            <Link to="/about" className={styles.ctaButton}>
              Learn More
            </Link>
          </div>
        </div>
      </main>

      <section className={styles.features}>
        <h2>Why Choose VoloConnect?</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🌍</div>
            <h3>Global Impact</h3>
            <p>Connect with organizations worldwide and make a difference in your community.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🤝</div>
            <h3>Easy Matching</h3>
            <p>Find the perfect volunteer opportunities that match your skills and interests.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3>Track Progress</h3>
            <p>Monitor your volunteer hours and impact with our easy-to-use dashboard.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>👥</div>
            <h3>Community</h3>
            <p>Join a network of like-minded individuals passionate about making a difference.</p>
          </div>
        </div>
      </section>

      <section className={styles.stats}>
        <div className={styles.statCard}>
          <h3>10K+</h3>
          <p>Volunteers</p>
        </div>
        <div className={styles.statCard}>
          <h3>500+</h3>
          <p>Organizations</p>
        </div>
        <div className={styles.statCard}>
          <h3>50K+</h3>
          <p>Hours Donated</p>
        </div>
        <div className={styles.statCard}>
          <h3>100+</h3>
          <p>Cities</p>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h4>VoloConnect</h4>
            <p>Making volunteering accessible and impactful.</p>
          </div>
          <div className={styles.footerSection}>
            <h4>Quick Links</h4>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
          <div className={styles.footerSection}>
            <h4>Connect With Us</h4>
            <div className={styles.socialLinks}>
              <a href="#" target="_blank" rel="noopener noreferrer">Twitter</a>
              <a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="#" target="_blank" rel="noopener noreferrer">Instagram</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; 2024 VoloConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

LandingPage.propTypes = {
  // Add any necessary prop types here
};

export default LandingPage; 