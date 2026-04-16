import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { 
  FaRocket, FaEye, FaLightbulb, FaRoad,
  FaLock, FaUserShield, FaFileUpload, FaSearch, 
  FaFilePdf, FaDownload, FaStar, FaBell, 
  FaChartLine, FaTrophy, FaEnvelope, FaUser, FaCode
} from 'react-icons/fa';
import './LandingPage.css';

const LandingPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const handleExplore = () => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    { icon: <FaLock />, title: 'Secure Authentication', description: 'JWT-based authentication with bcrypt password hashing ensures your data is always protected.' },
    { icon: <FaUserShield />, title: 'Admin Moderation', description: 'Every note is reviewed by admins before publication, ensuring quality and relevance.' },
    { icon: <FaFileUpload />, title: 'PDF Upload System', description: 'Easy-to-use upload interface with drag-and-drop support for seamless note sharing.' },
    { icon: <FaSearch />, title: 'Real-Time Search', description: 'Powerful search engine with filters to find exactly what you need in seconds.' },
    { icon: <FaFilePdf />, title: 'Embedded PDF Viewer', description: 'Preview notes directly in your browser without downloading, saving time and bandwidth.' },
    { icon: <FaDownload />, title: 'Download Tracking', description: 'Track download counts to identify the most popular and useful study materials.' },
    { icon: <FaStar />, title: '5-Star Rating System', description: 'Rate and review notes to help others find the best content and improve quality.' },
    { icon: <FaBell />, title: 'Admin Notifications', description: 'Real-time notifications keep admins informed about new uploads and user activities.' },
    { icon: <FaChartLine />, title: 'Smart Ranking Engine', description: 'Advanced algorithm ranks notes based on ratings, downloads, and recency.' },
    { icon: <FaTrophy />, title: 'Contribution Score', description: 'Earn points for uploading quality notes and building your academic reputation.' }
  ];

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-navbar">
        <div className="navbar-container">
          <div className="navbar-logo">NOTESTACK</div>
          <ul className="navbar-menu">
            <li><a onClick={() => scrollToSection('home')}>Home</a></li>
            <li><a onClick={() => scrollToSection('about')}>About</a></li>
            <li><a onClick={() => scrollToSection('features')}>Features</a></li>
            <li><a onClick={() => scrollToSection('contact')}>Contact</a></li>
            {user ? (
              <li><a href={user.role === 'admin' ? '/admin' : '/dashboard'} className="nav-btn">Dashboard</a></li>
            ) : (
              <>
                <li><a href="/login" className="nav-btn">Login</a></li>
                <li><a href="/signup" className="nav-btn signup">Signup</a></li>
              </>
            )}
          </ul>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section id="home" className="hero-section">
        <video className="background-video" autoPlay loop muted>
          <source src="https://cdn.pixabay.com/vimeo/330043164/abstract-21205.mp4?width=1280&hash=c6f1f8e5e8e5e8e5e8e5e8e5e8e5e8e5e8e5e8e5" type="video/mp4" />
        </video>
        
        <div className="overlay"></div>
        
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-text"
          >
            <h1 className="hero-title" data-aos="fade-down">
              NOTESTACK
            </h1>
            
            <motion.p
              className="hero-tagline"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Your Gateway to Collaborative Learning
            </motion.p>
            
            <motion.p
              className="hero-subtitle"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              Share, Discover, and Excel Together
            </motion.p>
            
            <motion.button
              className="explore-btn"
              onClick={handleExplore}
              data-aos="zoom-in"
              data-aos-delay="600"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Notes
            </motion.button>
          </motion.div>
          
          <div className="floating-elements">
            <div className="float-element element-1"></div>
            <div className="float-element element-2"></div>
            <div className="float-element element-3"></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="section-container">
          <div className="section-header" data-aos="fade-down">
            <h2>About NOTESTACK</h2>
            <p>Empowering Students Through Collaborative Learning</p>
          </div>
          
          <div className="about-grid">
            <div className="about-card" data-aos="fade-right">
              <div className="card-icon"><FaRocket /></div>
              <h3>Our Mission</h3>
              <p>To create a seamless platform where students can share, discover, and access high-quality educational notes, fostering a collaborative learning environment that empowers academic excellence.</p>
            </div>
            
            <div className="about-card" data-aos="fade-left">
              <div className="card-icon"><FaEye /></div>
              <h3>Our Vision</h3>
              <p>To become the leading student-driven knowledge-sharing platform, breaking down barriers to quality education and creating a global community of learners who support each other's academic journey.</p>
            </div>
            
            <div className="about-card" data-aos="fade-up">
              <div className="card-icon"><FaLightbulb /></div>
              <h3>Why NOTESTACK?</h3>
              <p>NOTESTACK combines security, quality, and accessibility. With admin moderation, rating systems, and smart ranking algorithms, we ensure that only the best content reaches students.</p>
            </div>
            
            <div className="about-card" data-aos="fade-up">
              <div className="card-icon"><FaRoad /></div>
              <h3>Future Roadmap</h3>
              <p>We're constantly evolving with features like AI-powered recommendations, real-time collaboration tools, video tutorials integration, and mobile apps to make learning accessible anytime, anywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header" data-aos="fade-down">
            <h2>Powerful Features</h2>
            <p>Everything you need for collaborative learning</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card" 
                data-aos="zoom-in" 
                data-aos-delay={index * 50}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="section-container">
          <div className="section-header" data-aos="fade-down">
            <h2>Get In Touch</h2>
            <p>Have questions? We'd love to hear from you</p>
          </div>
          
          <div className="contact-content" data-aos="zoom-in">
            <div className="contact-card">
              <div className="profile-section">
                <div className="profile-icon"><FaUser /></div>
                <h3>Aman Karn</h3>
                <p className="role">Full-Stack Developer</p>
                <p className="project-name">Creator of NOTESTACK</p>
              </div>
              
              <div className="contact-details">
                <div className="detail-item">
                  <FaEnvelope className="detail-icon" />
                  <div>
                    <h4>Email</h4>
                    <a href="mailto:amankarn.2024cse@sece.ac.in">amankarn.2024cse@sece.ac.in</a>
                  </div>
                </div>
                
                <div className="detail-item">
                  <FaCode className="detail-icon" />
                  <div>
                    <h4>Project</h4>
                    <p>NOTESTACK - Student Note Sharing Platform</p>
                  </div>
                </div>
              </div>
              
              <div className="tech-stack">
                <h4>Built With</h4>
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
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>Made with ❤️ by Aman Karn | NOTESTACK © 2024</p>
      </footer>
    </div>
  );
};

export default LandingPage;
