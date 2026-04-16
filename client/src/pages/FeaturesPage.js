import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { 
  FaLock, FaUserShield, FaFileUpload, FaSearch, 
  FaFilePdf, FaDownload, FaStar, FaBell, 
  FaChartLine, FaTrophy 
} from 'react-icons/fa';
import './FeaturesPage.css';

const FeaturesPage = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const features = [
    {
      icon: <FaLock />,
      title: 'Secure Authentication',
      description: 'JWT-based authentication with bcrypt password hashing ensures your data is always protected.'
    },
    {
      icon: <FaUserShield />,
      title: 'Admin Moderation',
      description: 'Every note is reviewed by admins before publication, ensuring quality and relevance.'
    },
    {
      icon: <FaFileUpload />,
      title: 'PDF Upload System',
      description: 'Easy-to-use upload interface with drag-and-drop support for seamless note sharing.'
    },
    {
      icon: <FaSearch />,
      title: 'Real-Time Search',
      description: 'Powerful search engine with filters to find exactly what you need in seconds.'
    },
    {
      icon: <FaFilePdf />,
      title: 'Embedded PDF Viewer',
      description: 'Preview notes directly in your browser without downloading, saving time and bandwidth.'
    },
    {
      icon: <FaDownload />,
      title: 'Download Tracking',
      description: 'Track download counts to identify the most popular and useful study materials.'
    },
    {
      icon: <FaStar />,
      title: '5-Star Rating System',
      description: 'Rate and review notes to help others find the best content and improve quality.'
    },
    {
      icon: <FaBell />,
      title: 'Admin Notifications',
      description: 'Real-time notifications keep admins informed about new uploads and user activities.'
    },
    {
      icon: <FaChartLine />,
      title: 'Smart Ranking Engine',
      description: 'Advanced algorithm ranks notes based on ratings, downloads, and recency.'
    },
    {
      icon: <FaTrophy />,
      title: 'Contribution Score',
      description: 'Earn points for uploading quality notes and building your academic reputation.'
    }
  ];

  return (
    <div className="features-page">
      <Navbar />
      
      <div className="features-container">
        <div className="features-header" data-aos="fade-down">
          <h1>Powerful Features</h1>
          <p>Everything you need for collaborative learning</p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card" 
              data-aos="zoom-in" 
              data-aos-delay={index * 100}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
