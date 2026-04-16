import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FaRocket, FaEye, FaLightbulb, FaRoad } from 'react-icons/fa';
import './AboutPage.css';

const AboutPage = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div className="about-page">
      <Navbar />
      
      <div className="about-container">
        <div className="about-header" data-aos="fade-down">
          <h1>About NOTESTACK</h1>
          <p>Empowering Students Through Collaborative Learning</p>
        </div>
        
        <div className="about-content">
          <div className="about-card" data-aos="fade-right">
            <div className="card-icon">
              <FaRocket />
            </div>
            <h2>Our Mission</h2>
            <p>
              To create a seamless platform where students can share, discover, and access 
              high-quality educational notes, fostering a collaborative learning environment 
              that empowers academic excellence.
            </p>
          </div>
          
          <div className="about-card" data-aos="fade-left">
            <div className="card-icon">
              <FaEye />
            </div>
            <h2>Our Vision</h2>
            <p>
              To become the leading student-driven knowledge-sharing platform, breaking down 
              barriers to quality education and creating a global community of learners who 
              support each other's academic journey.
            </p>
          </div>
          
          <div className="about-card" data-aos="fade-up">
            <div className="card-icon">
              <FaLightbulb />
            </div>
            <h2>Why NOTESTACK?</h2>
            <p>
              NOTESTACK combines security, quality, and accessibility. With admin moderation, 
              rating systems, and smart ranking algorithms, we ensure that only the best 
              content reaches students, making learning efficient and effective.
            </p>
          </div>
          
          <div className="about-card" data-aos="fade-up">
            <div className="card-icon">
              <FaRoad />
            </div>
            <h2>Future Roadmap</h2>
            <p>
              We're constantly evolving with features like AI-powered recommendations, 
              real-time collaboration tools, video tutorials integration, and mobile apps 
              to make learning accessible anytime, anywhere.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
