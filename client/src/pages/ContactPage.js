import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FaEnvelope, FaUser, FaCode, FaGithub, FaLinkedin } from 'react-icons/fa';
import './ContactPage.css';

const ContactPage = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div className="contact-page">
      <Navbar />
      
      <div className="contact-container">
        <div className="contact-header" data-aos="fade-down">
          <h1>Get In Touch</h1>
          <p>Have questions? We'd love to hear from you</p>
        </div>
        
        <div className="contact-content">
          <div className="contact-card" data-aos="zoom-in">
            <div className="profile-section">
              <div className="profile-icon">
                <FaUser />
              </div>
              <h2>Aman Karn</h2>
              <p className="role">Full-Stack Developer</p>
              <p className="project-name">Creator of NOTESTACK</p>
            </div>
            
            <div className="contact-details">
              <div className="detail-item">
                <FaEnvelope className="detail-icon" />
                <div>
                  <h3>Email</h3>
                  <a href="mailto:amankarn.2024cse@sece.ac.in">
                    amankarn.2024cse@sece.ac.in
                  </a>
                </div>
              </div>
              
              <div className="detail-item">
                <FaCode className="detail-icon" />
                <div>
                  <h3>Project</h3>
                  <p>NOTESTACK - Student Note Sharing Platform</p>
                </div>
              </div>
            </div>
            
            <div className="social-links">
              <a href="#" className="social-btn" aria-label="GitHub">
                <FaGithub />
              </a>
              <a href="#" className="social-btn" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
            </div>
            
            <div className="tech-stack">
              <h3>Built With</h3>
              <div className="tech-badges">
                <span className="tech-badge">MongoDB</span>
                <span className="tech-badge">Express.js</span>
                <span className="tech-badge">React.js</span>
                <span className="tech-badge">Node.js</span>
                <span className="tech-badge">Socket.io</span>
                <span className="tech-badge">JWT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
