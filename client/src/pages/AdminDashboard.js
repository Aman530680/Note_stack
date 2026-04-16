import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { 
  FaBell, FaCheckCircle, FaTimesCircle, FaTrash, 
  FaFileAlt, FaUsers, FaChartBar 
} from 'react-icons/fa';
import {
  getAllNotes,
  approveNote,
  deleteNote,
  getNotifications,
  markAllAsSeen,
  getAllComments,
  approveComment
} from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [notes, setNotes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [comments, setComments] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [notesRes, notifRes, commentsRes] = await Promise.all([
        getAllNotes(),
        getNotifications(),
        getAllComments()
      ]);

      const notesData = notesRes.data.data;
      setNotes(notesData);
      setNotifications(notifRes.data.data);
      setUnseenCount(notifRes.data.unseenCount);
      setComments(commentsRes.data.data);

      // Calculate stats
      setStats({
        total: notesData.length,
        pending: notesData.filter(n => n.status === 'Pending').length,
        approved: notesData.filter(n => n.status === 'Approved').length,
        rejected: notesData.filter(n => n.status === 'Rejected').length
      });
    } catch (error) {
      toast.error('Failed to fetch data!');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveNote(id, 'Approved');
      toast.success('Note approved successfully!');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve note!');
    }
  };

  const handleReject = async (id) => {
    try {
      await approveNote(id, 'Rejected');
      toast.success('Note rejected!');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject note!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(id);
        toast.success('Note deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete note!');
      }
    }
  };

  const handleMarkAllSeen = async () => {
    try {
      await markAllAsSeen();
      setUnseenCount(0);
      toast.success('All notifications marked as seen!');
    } catch (error) {
      toast.error('Failed to mark notifications!');
    }
  };

  const handleApproveComment = async (id) => {
    try {
      await approveComment(id);
      toast.success('Comment approved! User earned 1 coin.');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve comment!');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage notes and monitor platform activity</p>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <motion.div 
            className="stat-box"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <FaFileAlt className="stat-icon" />
            <div>
              <h3>{stats.total}</h3>
              <p>Total Notes</p>
            </div>
          </motion.div>

          <motion.div 
            className="stat-box pending"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FaChartBar className="stat-icon" />
            <div>
              <h3>{stats.pending}</h3>
              <p>Pending Approval</p>
            </div>
          </motion.div>

          <motion.div 
            className="stat-box approved"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <FaCheckCircle className="stat-icon" />
            <div>
              <h3>{stats.approved}</h3>
              <p>Approved</p>
            </div>
          </motion.div>

          <motion.div 
            className="stat-box rejected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <FaTimesCircle className="stat-icon" />
            <div>
              <h3>{stats.rejected}</h3>
              <p>Rejected</p>
            </div>
          </motion.div>
        </div>

        {/* Notifications Section */}
        <motion.section 
          className="notifications-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="section-header">
            <h2>
              <FaBell /> Notifications 
              {unseenCount > 0 && <span className="badge">{unseenCount}</span>}
            </h2>
            {unseenCount > 0 && (
              <button onClick={handleMarkAllSeen} className="mark-seen-btn">
                Mark All as Seen
              </button>
            )}
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <p className="no-data">No notifications</p>
            ) : (
              notifications.slice(0, 5).map((notif) => (
                <div 
                  key={notif._id} 
                  className={`notification-item ${!notif.seen ? 'unseen' : ''}`}
                >
                  <div className="notif-content">
                    <p>{notif.message}</p>
                    <span className="notif-time">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.section>

        {/* Comments Approval Section */}
        <motion.section 
          className="comments-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          <h2>💬 Comments Pending Approval</h2>
          {comments.filter(c => !c.commentApproved).length === 0 ? (
            <p className="no-data">No comments pending approval</p>
          ) : (
            <div className="comments-grid">
              {comments.filter(c => !c.commentApproved).map((comment) => (
                <div key={comment._id} className="comment-card">
                  <div className="comment-header">
                    <strong>{comment.userId?.name}</strong>
                    <span className="comment-rating">{'⭐'.repeat(comment.rating)}</span>
                  </div>
                  <p className="comment-note">On: {comment.noteId?.title}</p>
                  <p className="comment-text">"{comment.comment}"</p>
                  <button 
                    onClick={() => handleApproveComment(comment._id)}
                    className="approve-comment-btn"
                  >
                    ✓ Approve & Award 1 Coin
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Notes Management Section */}
        <motion.section 
          className="notes-management-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2><FaFileAlt /> All Notes</h2>

          <div className="notes-table-wrapper">
            <table className="notes-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Uploaded By</th>
                  <th>Status</th>
                  <th>Downloads</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">No notes available</td>
                  </tr>
                ) : (
                  notes.map((note) => (
                    <tr key={note._id}>
                      <td>{note.title}</td>
                      <td>{note.subject}</td>
                      <td>
                        {note.uploadedBy?.name}
                        <br />
                        <small>{note.uploadedBy?.email}</small>
                      </td>
                      <td>
                        <span className={`status-badge ${note.status.toLowerCase()}`}>
                          {note.status}
                        </span>
                      </td>
                      <td>{note.downloads}</td>
                      <td>{note.avgRating.toFixed(1)} ⭐</td>
                      <td>
                        <div className="action-buttons">
                          {note.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(note._id)}
                                className="action-btn approve"
                                title="Approve"
                              >
                                <FaCheckCircle />
                              </button>
                              <button
                                onClick={() => handleReject(note._id)}
                                className="action-btn reject"
                                title="Reject"
                              >
                                <FaTimesCircle />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(note._id)}
                            className="action-btn delete"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                          <a
                            href={`http://localhost:5001${note.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-btn view"
                            title="View PDF"
                          >
                            📄
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default AdminDashboard;
