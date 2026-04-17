import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { 
  FaUpload, FaSearch, FaDownload, FaStar, 
  FaTrophy, FaFileAlt, FaCheckCircle, FaEdit, FaTrash, FaList
} from 'react-icons/fa';
import {
  uploadNote,
  getNotes,
  searchNotes,
  incrementDownload,
  submitRating,
  checkUserRating,
  getTrendingNotes,
  getMyNotes,
  updateNote,
  deleteOwnNote
} from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    subject: '',
    description: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState([]);
  const [myNotes, setMyNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hasRated, setHasRated] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMyNotes();
    fetchAllNotes();
  }, []);

  const fetchAllNotes = async () => {
    try {
      const res = await getNotes();
      setNotes(res.data.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const fetchMyNotes = async () => {
    try {
      const res = await getMyNotes();
      setMyNotes(res.data.data);
    } catch (error) {
      console.error('Error fetching my notes:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      toast.success('PDF file selected!');
    } else {
      toast.error('Please select a PDF file!');
      setFile(null);
    }
  };

  const handleUploadChange = (e) => {
    setUploadData({ ...uploadData, [e.target.name]: e.target.value });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a PDF file!');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', uploadData.title);
    formData.append('subject', uploadData.subject);
    formData.append('description', uploadData.description);

    try {
      await uploadNote(formData);
      toast.success('Note uploaded successfully! Waiting for admin approval.');
      setFile(null);
      setUploadData({ title: '', subject: '', description: '' });
      document.getElementById('file-input').value = '';
      fetchMyNotes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed!');
    } finally {
      setUploading(false);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote({
      id: note._id,
      title: note.title,
      subject: note.subject,
      description: note.description
    });
  };

  const handleUpdateNote = async (e) => {
    e.preventDefault();
    try {
      await updateNote(editingNote.id, {
        title: editingNote.title,
        subject: editingNote.subject,
        description: editingNote.description
      });
      toast.success('Note updated! Pending admin approval.');
      setEditingNote(null);
      fetchMyNotes();
    } catch (error) {
      toast.error('Update failed!');
    }
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteOwnNote(id);
        toast.success('Note deleted successfully!');
        fetchMyNotes();
      } catch (error) {
        toast.error('Delete failed!');
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchAllNotes();
      return;
    }
    try {
      const res = await searchNotes(searchQuery, '');
      setNotes(res.data.data);
      
      if (res.data.count === 0) {
        toast.info('No notes found!');
      } else {
        toast.success(`Found ${res.data.count} notes!`);
      }
    } catch (error) {
      toast.error('Search failed!');
    }
  };

  const handleNoteClick = async (note) => {
    setSelectedNote(note);
    setRating(0);
    setComment('');
    
    try {
      const res = await checkUserRating(note._id);
      setHasRated(res.data.hasRated);
      if (res.data.hasRated) {
        setRating(res.data.data.rating);
        setComment(res.data.data.comment || '');
      }
    } catch (error) {
      console.error('Error checking rating:', error);
    }
  };

  const handleDownload = async () => {
    if (!selectedNote) return;
    
    try {
      await incrementDownload(selectedNote._id);
      window.open(`https://notestack-api.onrender.com${selectedNote.fileUrl}`, '_blank');
      toast.success('Download started!');
    } catch (error) {
      toast.error('Download failed!');
    }
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating!');
      return;
    }

    try {
      await submitRating({
        noteId: selectedNote._id,
        rating,
        comment
      });
      toast.success('Rating submitted successfully!');
      setHasRated(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rating submission failed!');
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <h1>Welcome, {user?.name}!</h1>
          <div className="header-info">
            <div className="user-info-card">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Contact:</strong> {user?.contact}</p>
            </div>
            <div className="user-stats">
              <div className="stat-card">
                <FaTrophy />
                <div>
                  <h3>{user?.contributionScore || 0}</h3>
                  <p>Contribution Score</p>
                </div>
              </div>
              <div className="stat-card coins">
                <span className="coin-icon">🪙</span>
                <div>
                  <h3>{user?.coins || 0}</h3>
                  <p>Coins Earned</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar - Top Left */}
        <div className="search-bar-top">
          <form onSubmit={handleSearch} className="quick-search-form">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search all notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="quick-search-input"
            />
            <button type="submit" className="quick-search-btn">Search</button>
          </form>
        </div>

        {/* Split View: My Notes (Left) | Upload (Right) */}
        <div className="split-container">
          {/* Left Side - My Uploaded Notes */}
          <motion.section 
            className="left-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2><FaList /> My Uploaded Notes</h2>
            <div className="my-notes-list">
              {myNotes.length === 0 ? (
                <p className="no-data">You haven't uploaded any notes yet.</p>
              ) : (
                myNotes.map((note) => (
                  <div key={note._id} className="my-note-item">
                    <div className="note-info">
                      <h4>{note.title}</h4>
                      <p><strong>Subject:</strong> {note.subject}</p>
                      <p className="note-desc">{note.description}</p>
                      <span className={`status-badge ${note.status.toLowerCase()}`}>
                        {note.status}
                      </span>
                    </div>
                    <div className="note-actions">
                      <button onClick={() => handleEditNote(note)} className="edit-btn">
                        <FaEdit /> Edit
                      </button>
                      <button onClick={() => handleDeleteNote(note._id)} className="delete-btn">
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.section>

          {/* Right Side - Upload New Note */}
          <motion.section 
            className="right-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2><FaUpload /> Upload New Note</h2>
            <form onSubmit={handleUpload} className="upload-form-compact">
              <input
                type="text"
                name="title"
                placeholder="Note Title"
                value={uploadData.title}
                onChange={handleUploadChange}
                required
                className="form-input"
              />
              
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={uploadData.subject}
                onChange={handleUploadChange}
                required
                className="form-input"
              />
              
              <textarea
                name="description"
                placeholder="Description"
                value={uploadData.description}
                onChange={handleUploadChange}
                required
                className="form-textarea"
                rows="4"
              />
              
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  id="file-input"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <label htmlFor="file-input" className="file-label">
                  <FaFileAlt /> {file ? file.name : 'Choose PDF File'}
                </label>
              </div>
              
              <button
                type="submit"
                className="upload-btn"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Note'}
              </button>
            </form>
          </motion.section>
        </div>

        {/* All Approved Notes / Search Results */}
        {notes.length > 0 && (
          <motion.section 
            className="search-results-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2>📚 All Approved Notes ({notes.length})</h2>
            <div className="notes-grid">
              {notes.map((note) => (
                <div
                  key={note._id}
                  className="note-card"
                  onClick={() => handleNoteClick(note)}
                >
                  <h3>{note.title}</h3>
                  <p className="note-subject">{note.subject}</p>
                  <p className="note-desc">{note.description}</p>
                  <div className="note-stats">
                    <span><FaStar /> {note.avgRating.toFixed(1)}</span>
                    <span><FaDownload /> {note.downloads}</span>
                  </div>
                  <p className="note-author">By: {note.uploadedBy?.name}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Edit Modal */}
        {editingNote && (
          <div className="modal-overlay" onClick={() => setEditingNote(null)}>
            <motion.div 
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <h2>Edit Note</h2>
              <form onSubmit={handleUpdateNote}>
                <input
                  type="text"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({...editingNote, title: e.target.value})}
                  placeholder="Title"
                  required
                  className="form-input"
                />
                <input
                  type="text"
                  value={editingNote.subject}
                  onChange={(e) => setEditingNote({...editingNote, subject: e.target.value})}
                  placeholder="Subject"
                  required
                  className="form-input"
                />
                <textarea
                  value={editingNote.description}
                  onChange={(e) => setEditingNote({...editingNote, description: e.target.value})}
                  placeholder="Description"
                  required
                  className="form-textarea"
                  rows="4"
                />
                <div className="modal-buttons">
                  <button type="submit" className="save-btn">Save Changes</button>
                  <button type="button" onClick={() => setEditingNote(null)} className="cancel-btn">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* PDF Viewer Modal */}
        {selectedNote && (
          <motion.div 
            className="viewer-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="viewer-overlay" onClick={() => setSelectedNote(null)}></div>
            <div className="viewer-content">
              <div className="viewer-header">
                <h2>{selectedNote.title}</h2>
                <button onClick={() => setSelectedNote(null)} className="close-btn">✕</button>
              </div>
              
              <div className="pdf-viewer">
                <iframe
                  src={`https://notestack-api.onrender.com${selectedNote.fileUrl}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
                  title="PDF Viewer"
                  width="100%"
                  height="600px"
                />
                <div className="preview-notice">
                  🔒 Preview: First 3 pages only. Download to view full document.
                </div>
              </div>
              
              <div className="viewer-actions">
                <button onClick={handleDownload} className="download-btn">
                  <FaDownload /> Download Full PDF
                </button>
              </div>

              <div className="rating-section">
                <h3>Rate this Note</h3>
                {hasRated ? (
                  <div className="already-rated">
                    <FaCheckCircle /> You have already rated this note
                  </div>
                ) : (
                  <>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={star <= rating ? 'star active' : 'star'}
                          onClick={() => setRating(star)}
                        />
                      ))}
                    </div>
                    <textarea
                      placeholder="Optional feedback..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="comment-box"
                      rows="3"
                    />
                    <button onClick={handleRatingSubmit} className="submit-rating-btn">
                      Submit Rating
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
