import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line
} from 'recharts';
import { getTopDownloads, getLeaderboard, getSubjectStats, getWeeklyUploads, getAnalyticsOverview } from '../services/api';
import './AnalyticsDashboard.css';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#a18cd1'];

const AnalyticsDashboard = () => {
  const [topDownloads, setTopDownloads] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [subjectStats, setSubjectStats] = useState([]);
  const [weeklyUploads, setWeeklyUploads] = useState([]);
  const [overview, setOverview] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [d, l, s, w, o] = await Promise.all([
        getTopDownloads(), getLeaderboard(), getSubjectStats(), getWeeklyUploads(), getAnalyticsOverview()
      ]);
      setTopDownloads(d.data.data || []);
      setLeaderboard(l.data.data || []);
      setSubjectStats((s.data.data || []).map(x => ({ name: x._id || 'Unknown', value: x.count })));
      setWeeklyUploads((w.data.data || []).map(x => ({ date: x.date.slice(5), count: x.count })));
      setOverview(o.data.data || {});
    } catch (e) {
      console.error('Analytics error:', e);
      toast.error('Analytics failed: ' + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="analytics-loading">
      <div className="loader"></div>
      <p>Loading Analytics...</p>
    </div>
  );

  return (
    <div className="analytics-page">
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="analytics-container">
        <div className="analytics-header">
          <h1>📊 Analytics Dashboard</h1>
          <p>Platform insights and performance metrics</p>
        </div>

        {/* Overview Cards */}
        <div className="overview-grid">
          <div className="overview-card">
            <h3>{overview.totalNotes || 0}</h3>
            <p>Total Notes</p>
          </div>
          <div className="overview-card">
            <h3>{overview.totalUsers || 0}</h3>
            <p>Total Students</p>
          </div>
          <div className="overview-card">
            <h3>{overview.totalDownloads || 0}</h3>
            <p>Total Downloads</p>
          </div>
        </div>

        <div className="charts-grid">
          {/* Bar Chart - Top Downloads */}
          <div className="chart-card wide">
            <h2>📥 Most Downloaded Notes</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topDownloads} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="title" tick={{ fill: '#ccc', fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fill: '#ccc' }} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #667eea', color: '#fff' }} />
                <Bar dataKey="downloads" fill="#667eea" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Subject Stats */}
          <div className="chart-card">
            <h2>📚 Subject-wise Usage</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={subjectStats} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {subjectStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #667eea', color: '#fff' }} />
                <Legend wrapperStyle={{ color: '#ccc' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart - Weekly Uploads */}
          <div className="chart-card">
            <h2>📈 Weekly Upload Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyUploads}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" tick={{ fill: '#ccc' }} />
                <YAxis tick={{ fill: '#ccc' }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #667eea', color: '#fff' }} />
                <Line type="monotone" dataKey="count" stroke="#667eea" strokeWidth={3} dot={{ fill: '#764ba2', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Leaderboard */}
          <div className="chart-card wide">
            <h2>🏆 Top Contributors Leaderboard</h2>
            <div className="leaderboard-table-wrapper">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Score</th>
                    <th>Coins</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((u, i) => (
                    <tr key={u._id} className={i < 3 ? `top-${i + 1}` : ''}>
                      <td>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className="score-badge">{u.contributionScore}</span></td>
                      <td>🪙 {u.coins}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
