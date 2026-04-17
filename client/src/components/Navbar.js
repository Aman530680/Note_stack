import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          NOTESTACK
        </Link>
        
        <ul className="navbar-menu">
          {user ? (
            <>
              <li>
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'}>
                  Dashboard
                </Link>
              </li>
              {user.role === 'admin' && (
                <li><Link to="/analytics">📊 Analytics</Link></li>
              )}
              <li className="user-info">
                <FaUserCircle /> {user.name}
              </li>
              <li>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/" className="nav-btn">Home</Link></li>
              <li><Link to="/login" className="nav-btn">Login</Link></li>
              <li><Link to="/signup" className="nav-btn signup">Signup</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
