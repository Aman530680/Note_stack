import React, { useState, useRef, useEffect } from 'react';
import { assistantChat } from '../services/api';
import './AIAssistantChat.css';

const INTRO =
  'Hi! I am the NOTESTACK assistant. Ask how the site works, or describe what you want to study — I use the public note library (and admins also see upcoming uploads).';

const AIAssistantChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: INTRO }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, loading]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const historyForApi = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }));

    setInput('');
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const { data } = await assistantChat(text, historyForApi);
      if (!data.success) {
        throw new Error(data.message || 'Request failed');
      }
      setMessages((m) => [...m, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Could not reach the assistant. Check your connection and try again.';
      setMessages((m) => [...m, { role: 'assistant', content: msg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-assistant-root">
      {open && (
        <div className="ai-assistant-panel" role="dialog" aria-label="NOTESTACK AI assistant">
          <div className="ai-assistant-header">
            <span className="ai-assistant-title">NOTESTACK AI</span>
            <button
              type="button"
              className="ai-assistant-close"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
            >
              ×
            </button>
          </div>
          <div className="ai-assistant-messages">
            {messages.map((m, i) => (
              <div key={`${i}-${m.role}`} className={`ai-assistant-bubble ai-assistant-bubble--${m.role}`}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="ai-assistant-bubble ai-assistant-bubble--assistant ai-assistant-typing">
                Thinking…
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div className="ai-assistant-input-row">
            <input
              type="text"
              className="ai-assistant-input"
              placeholder="Ask about the platform or your subjects…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              disabled={loading}
              aria-label="Message to assistant"
            />
            <button
              type="button"
              className="ai-assistant-send"
              onClick={send}
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        className="ai-assistant-fab"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
      >
        {open ? '×' : '✦'}
      </button>
    </div>
  );
};

export default AIAssistantChat;
