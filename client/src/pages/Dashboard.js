import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactMarkdown from 'react-markdown';
import {
  FaUpload, FaSearch, FaDownload, FaStar,
  FaTrophy, FaFileAlt, FaCheckCircle, FaEdit, FaTrash, FaList,
  FaRobot, FaTags, FaYoutube, FaImage, FaMarkdown, FaFilePdf
} from 'react-icons/fa';
import {
  uploadNote, getNotes, searchNotes, incrementDownload,
  submitRating, checkUserRating, getMyNotes, updateNote, deleteOwnNote,
  summarizeNote, generateTags, recommendNotes, chatWithNote
} from '../services/api';
import './Dashboard.css';

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://notestack-api.onrender.com';

// Extract YouTube video ID from URL
const getYouTubeId = (url) => {
  const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : null;
};

const NoteTypeIcon = ({ type }) => {
  const icons = { pdf: <FaFilePdf />, image: <FaImage />, video: <FaYoutube />, markdown: <FaMarkdown /> };
  return icons[type] || <FaFileAlt />;
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [noteType, setNoteType] = useState('pdf');
  const [uploadData, setUploadData] = useState({ title: '', subject: '', description: '', videoUrl: '', markdownContent: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState([]);
  const [myNotes, setMyNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hasRated, setHasRated] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState('');
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatAnswer, setChatAnswer] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => { fetchMyNotes(); fetchAllNotes(); }, []);

  const fetchAllNotes = async () => {
    try { const res = await getNotes(); setNotes(res.data.data); } catch (e) {}
  };

  const fetchMyNotes = async () => {
    try { const res = await getMyNotes(); setMyNotes(res.data.data); } catch (e) {}
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const validTypes = noteType === 'pdf' ? ['application/pdf'] : ['image/jpeg', 'image/png', 'image/jpg'];
    if (validTypes.includes(f.type)) { setFile(f); toast.success('File selected!'); }
    else { toast.error(`Invalid file type for ${noteType}`); setFile(null); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if ((noteType === 'pdf' || noteType === 'image') && !file)
      return toast.error('Please select a file!');

    setUploading(true);
    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('subject', uploadData.subject);
    formData.append('description', uploadData.description);
    formData.append('type', noteType);
    if (file) formData.append('file', file);
    if (noteType === 'video') formData.append('videoUrl', uploadData.videoUrl);
    if (noteType === 'markdown') formData.append('markdownContent', uploadData.markdownContent);

    try {
      await uploadNote(formData);
      toast.success('Note uploaded! Waiting for admin approval.');
      setFile(null);
      setUploadData({ title: '', subject: '', description: '', videoUrl: '', markdownContent: '' });
      fetchMyNotes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed!');
    } finally { setUploading(false); }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return fetchAllNotes();
    try {
      const res = await searchNotes(searchQuery, '');
      setNotes(res.data.data);
      res.data.count === 0 ? toast.info('No notes found!') : toast.success(`Found ${res.data.count} notes!`);
    } catch { toast.error('Search failed!'); }
  };

  const handleNoteClick = async (note) => {
    setSelectedNote(note);
    setRating(0); setComment(''); setChatAnswer(''); setChatQuestion(''); setRecommendations([]);
    try {
      const [ratingRes, recRes] = await Promise.all([
        checkUserRating(note._id),
        recommendNotes(note._id)
      ]);
      setHasRated(ratingRes.data.hasRated);
      if (ratingRes.data.hasRated) { setRating(ratingRes.data.data.rating); setComment(ratingRes.data.data.comment || ''); }
      setRecommendations(recRes.data.data || []);
    } catch {}
  };

  const handleDownload = async () => {
    if (!selectedNote) return;
    try {
      await incrementDownload(selectedNote._id);
      const url = selectedNote.fileUrl.startsWith('http') ? selectedNote.fileUrl : `${API_BASE}${selectedNote.fileUrl}`;
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = `${selectedNote.title}.pdf`;
      link.click();
      toast.success('Download started!');
    } catch { toast.error('Download failed!'); }
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) return toast.error('Please select a rating!');
    try {
      await submitRating({ noteId: selectedNote._id, rating, comment });
      toast.success('Rating submitted!');
      setHasRated(true);
    } catch (error) { toast.error(error.response?.data?.message || 'Rating failed!'); }
  };

  const handleSummarize = async () => {
    setAiLoading('summary');
    try {
      const res = await summarizeNote(selectedNote._id);
      setSelectedNote({ ...selectedNote, summary: res.data.summary });
      toast.success('Summary generated!');
    } catch { toast.error('Failed to generate summary. Please try again.'); }
    finally { setAiLoading(''); }
  };

  const handleGenerateTags = async () => {
    setAiLoading('tags');
    try {
      const res = await generateTags(selectedNote._id);
      setSelectedNote({ ...selectedNote, tags: res.data.tags });
      toast.success('Tags generated!');
    } catch { toast.error('Failed to extract tags. Please try again.'); }
    finally { setAiLoading(''); }
  };

  const handleChat = async () => {
    if (!chatQuestion.trim()) return toast.error('Enter a question!');
    setAiLoading('chat');
    try {
      const res = await chatWithNote(selectedNote._id, chatQuestion);
      setChatAnswer(res.data.answer);
    } catch { toast.error('Failed to get answer. Please try again.'); }
    finally { setAiLoading(''); }
  };

  const getFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `https://notestack-api.onrender.com${url}`;
  };

  // Render note content based on type
  const renderNoteContent = (note) => {
    if (note.type === 'image') return (
      <img src={getFileUrl(note.fileUrl)} alt={note.title} className="note-image-viewer" />
    );
    if (note.type === 'video') {
      const videoId = getYouTubeId(note.videoUrl);
      return videoId ? (
        <iframe className="youtube-embed" src={`https://www.youtube.com/embed/${videoId}`}
          title={note.title} allowFullScreen />
      ) : <p style={{ color: '#fff' }}>Invalid YouTube URL</p>;
    }
    if (note.type === 'markdown') return (
      <div className="markdown-viewer">
        <ReactMarkdown>{note.markdownContent}</ReactMarkdown>
      </div>
    );
    return (
      <iframe src={getFileUrl(note.fileUrl)} title="PDF" width="100%" height="500px" style={{border:'none', borderRadius:'10px'}} />
    );
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="dashboard-container">
        {/* Top Bar */}
        <div className="top-bar">
          <h1>👋 {user?.name}</h1>
          <div className="tab-btns">
            <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}><FaFileAlt /> All Notes</button>
            <button className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}><FaUpload /> Upload Notes</button>
          </div>
          <form onSubmit={handleSearch} className="quick-search-form">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Search notes..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} className="quick-search-input" />
            <button type="submit" className="quick-search-btn">Search</button>
          </form>
          <div className="user-pills">
            <div className="stat-pill"><FaTrophy /><span>{user?.contributionScore || 0}</span> Score</div>
            <div className="stat-pill"><span className="coin-icon">🪙</span><span>{user?.coins || 0}</span> Coins</div>
          </div>
        </div>

        {/* Content */}
        <div className="tab-content">

          {/* ALL NOTES */}
          {activeTab === 'all' && (
            <div className="panel full-panel">
              <div className="panel-body">
                {notes.length === 0 ? <p className="no-data">No approved notes yet.</p> :
                  <div className="notes-grid">
                    {notes.map(note => (
                      <div key={note._id} className="note-card" onClick={() => handleNoteClick(note)}>
                        <div className="note-type-badge"><NoteTypeIcon type={note.type} /> {note.type}</div>
                        <h3>{note.title}</h3>
                        <p className="note-subject">{note.subject}</p>
                        <p className="note-desc">{note.description}</p>
                        <div className="note-stats">
                          <span><FaStar /> {note.avgRating?.toFixed(1)}</span>
                          <span><FaDownload /> {note.downloads}</span>
                        </div>
                        <p className="note-author">By: {note.uploadedBy?.name}</p>
                      </div>
                    ))}
                  </div>
                }
              </div>
            </div>
          )}

          {/* UPLOAD */}
          {activeTab === 'upload' && (
            <div className="upload-tab-grid">
              {/* Upload Form */}
              <div className="panel">
                <h2><FaUpload /> Upload Note</h2>
                <div className="type-selector">
                  {['pdf', 'image', 'video', 'markdown'].map(t => (
                    <button key={t} type="button" className={`type-btn ${noteType === t ? 'active' : ''}`}
                      onClick={() => { setNoteType(t); setFile(null); }}>
                      <NoteTypeIcon type={t} /> {t.toUpperCase()}
                    </button>
                  ))}
                </div>
                <form onSubmit={handleUpload} className="upload-form-compact">
                  <input type="text" placeholder="Note Title" value={uploadData.title}
                    onChange={e => setUploadData({ ...uploadData, title: e.target.value })} required className="form-input" />
                  <input type="text" placeholder="Subject" value={uploadData.subject}
                    onChange={e => setUploadData({ ...uploadData, subject: e.target.value })} required className="form-input" />
                  <textarea placeholder="Description" value={uploadData.description}
                    onChange={e => setUploadData({ ...uploadData, description: e.target.value })} required className="form-textarea" rows="3" />
                  {(noteType === 'pdf' || noteType === 'image') && (
                    <div className="file-upload-wrapper">
                      <input type="file" id="file-input" accept={noteType === 'pdf' ? '.pdf' : '.jpg,.jpeg,.png'}
                        onChange={handleFileChange} className="file-input" />
                      <label htmlFor="file-input" className="file-label">
                        <NoteTypeIcon type={noteType} /> {file ? file.name : `Choose ${noteType.toUpperCase()}`}
                      </label>
                    </div>
                  )}
                  {noteType === 'video' && (
                    <input type="url" placeholder="YouTube URL" value={uploadData.videoUrl}
                      onChange={e => setUploadData({ ...uploadData, videoUrl: e.target.value })} required className="form-input" />
                  )}
                  {noteType === 'markdown' && (
                    <textarea placeholder="Markdown content..." value={uploadData.markdownContent}
                      onChange={e => setUploadData({ ...uploadData, markdownContent: e.target.value })} required className="form-textarea" rows="6" />
                  )}
                  <button type="submit" className="upload-btn" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload Note'}
                  </button>
                </form>
              </div>

              {/* My Notes */}
              <div className="panel">
                <h2><FaList /> My Notes</h2>
                <div className="panel-body">
                  {myNotes.length === 0 ? <p className="no-data">No notes uploaded yet.</p> :
                    myNotes.map(note => (
                      <div key={note._id} className="my-note-item">
                        <div className="note-info">
                          <h4><NoteTypeIcon type={note.type} /> {note.title}</h4>
                          <p><strong>Subject:</strong> {note.subject}</p>
                          <span className={`status-badge ${note.status.toLowerCase()}`}>{note.status}</span>
                        </div>
                        <div className="note-actions">
                          <button onClick={() => setEditingNote({ id: note._id, title: note.title, subject: note.subject, description: note.description })} className="edit-btn"><FaEdit /> Edit</button>
                          <button onClick={async () => { if (window.confirm('Delete?')) { await deleteOwnNote(note._id); toast.success('Deleted!'); fetchMyNotes(); } }} className="delete-btn"><FaTrash /> Delete</button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingNote && (
        <div className="modal-overlay" onClick={() => setEditingNote(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Edit Note</h2>
            <form onSubmit={async (e) => { e.preventDefault(); await updateNote(editingNote.id, editingNote); toast.success('Updated!'); setEditingNote(null); fetchMyNotes(); }}>
              <input type="text" value={editingNote.title} onChange={e => setEditingNote({ ...editingNote, title: e.target.value })} placeholder="Title" required className="form-input" />
              <input type="text" value={editingNote.subject} onChange={e => setEditingNote({ ...editingNote, subject: e.target.value })} placeholder="Subject" required className="form-input" />
              <textarea value={editingNote.description} onChange={e => setEditingNote({ ...editingNote, description: e.target.value })} placeholder="Description" required className="form-textarea" rows="4" />
              <div className="modal-buttons">
                <button type="submit" className="save-btn">Save</button>
                <button type="button" onClick={() => setEditingNote(null)} className="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Note Viewer Modal */}
      {selectedNote && (
        <div className="viewer-modal">
          <div className="viewer-overlay" onClick={() => setSelectedNote(null)}></div>
          <div className="viewer-content">
            <div className="viewer-header">
              <h2><NoteTypeIcon type={selectedNote.type} /> {selectedNote.title}</h2>
              <button onClick={() => setSelectedNote(null)} className="close-btn">✕</button>
            </div>
            <div className="pdf-viewer">{renderNoteContent(selectedNote)}</div>
            {(selectedNote.type === 'pdf' || selectedNote.type === 'image') && (
              <div className="viewer-actions">
                <button onClick={handleDownload} className="download-btn"><FaDownload /> Download</button>
              </div>
            )}
            <div className="ai-section">
              <h3><FaRobot /> AI Features</h3>
              <div className="ai-feature">
                <button onClick={handleSummarize} className="ai-btn" disabled={aiLoading === 'summary'}>
                  {aiLoading === 'summary' ? '⏳ Generating...' : '📝 Generate Summary'}
                </button>
                {selectedNote.summary && <div className="ai-result"><p>{selectedNote.summary}</p></div>}
              </div>
              <div className="ai-feature">
                <button onClick={handleGenerateTags} className="ai-btn" disabled={aiLoading === 'tags'}>
                  {aiLoading === 'tags' ? '⏳ Extracting...' : <><FaTags /> Extract Tags</>}
                </button>
                {selectedNote.tags?.length > 0 && (
                  <div className="tags-row">{selectedNote.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
                )}
              </div>
              {(selectedNote.type === 'pdf' || selectedNote.type === 'markdown') && (
                <div className="ai-feature">
                  <h4>💬 Ask a Question</h4>
                  <div className="chat-input-row">
                    <input type="text" placeholder="Ask anything about this note..."
                      value={chatQuestion} onChange={e => setChatQuestion(e.target.value)} className="chat-input" />
                    <button onClick={handleChat} className="ai-btn" disabled={aiLoading === 'chat'}>
                      {aiLoading === 'chat' ? '⏳' : 'Ask'}
                    </button>
                  </div>
                  {chatAnswer && <div className="ai-result"><p>{chatAnswer}</p></div>}
                </div>
              )}
            </div>
            {recommendations.length > 0 && (
              <div className="recommendations-section">
                <h3>🔗 Recommended Notes</h3>
                <div className="rec-grid">
                  {recommendations.map(r => (
                    <div key={r._id} className="rec-card" onClick={() => handleNoteClick(r)}>
                      <h4>{r.title}</h4>
                      <p>{r.subject}</p>
                      <span><FaStar /> {r.avgRating?.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="rating-section">
              <h3>Rate this Note</h3>
              {hasRated ? (
                <div className="already-rated"><FaCheckCircle /> Already rated</div>
              ) : (
                <>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map(star => (
                      <FaStar key={star} className={star <= rating ? 'star active' : 'star'} onClick={() => setRating(star)} />
                    ))}
                  </div>
                  <textarea placeholder="Optional feedback..." value={comment} onChange={e => setComment(e.target.value)} className="comment-box" rows="3" />
                  <button onClick={handleRatingSubmit} className="submit-rating-btn">Submit Rating</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
