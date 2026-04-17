import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { register } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import './SignupPage.css';

const SignupPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', contact: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const set = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match');
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await register({ name: formData.name, email: formData.email, contact: formData.contact, password: formData.password });
      login(res.data.token, res.data.user);
      toast.success('Account created!');
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-screen">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

      <div className="auth-layout signup-layout">
        {/* Brand */}
        <div className="auth-brand">
          <div className="brand-logo">NS</div>
          <h1 className="brand-name">NoteStack</h1>
          <p className="brand-tagline">Join thousands of students sharing quality academic notes.</p>
          <ul className="brand-features">
            <li>✦ Upload PDF, Images & Videos</li>
            <li>✦ AI-powered summaries</li>
            <li>✦ Earn contribution points</li>
            <li>✦ Admin-moderated quality</li>
          </ul>
        </div>

        {/* Form */}
        <motion.div className="auth-card"
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>

          <div className="auth-card-header">
            <h2>Create account</h2>
            <p>Start sharing notes today</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form signup-form-grid">
            <div className="field">
              <label>Full Name</label>
              <input type="text" placeholder="Aman Karn" value={formData.name} onChange={set('name')} required />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={formData.email} onChange={set('email')} required autoComplete="email" />
            </div>
            <div className="field">
              <label>Contact</label>
              <input type="tel" placeholder="9876543210" value={formData.contact} onChange={set('contact')} required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" placeholder="Min 6 characters" value={formData.password} onChange={set('password')} required autoComplete="new-password" />
            </div>
            <div className="field field-full">
              <label>Confirm Password</label>
              <input type="password" placeholder="Re-enter password" value={formData.confirmPassword} onChange={set('confirmPassword')} required autoComplete="new-password" />
            </div>

            <motion.button type="submit" className="auth-btn field-full" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              {loading ? <span className="btn-spinner" /> : 'Create Account'}
            </motion.button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
