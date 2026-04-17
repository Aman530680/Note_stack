import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { login as loginAPI } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginAPI(formData);
      login(res.data.token, res.data.user);
      toast.success('Welcome back!');
      setTimeout(() => navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard'), 800);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="auth-layout">
        {/* Left panel */}
        <div className="auth-brand">
          <div className="brand-logo">NS</div>
          <h1 className="brand-name">NoteStack</h1>
          <p className="brand-tagline">The smartest way to share and discover academic notes.</p>
          <div className="brand-stats">
            <div className="bstat"><span>500+</span><p>Notes</p></div>
            <div className="bstat"><span>1K+</span><p>Students</p></div>
            <div className="bstat"><span>5K+</span><p>Downloads</p></div>
          </div>
        </div>

        {/* Right panel */}
        <motion.div className="auth-card"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}>

          <div className="auth-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label>Email</label>
              <input type="email" name="email" placeholder="you@example.com"
                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                required autoComplete="email" />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" name="password" placeholder="••••••••"
                value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                required autoComplete="current-password" />
            </div>

            <motion.button type="submit" className="auth-btn" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              {loading ? <span className="btn-spinner" /> : 'Sign In'}
            </motion.button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/signup">Create one</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
