import React, { useState } from 'react';

function AddGoals({ onGoalAdded }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8000/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setTitle('');
        setDescription('');
        setSuccess('Goal added successfully!');
        if (onGoalAdded) onGoalAdded(data);
      } else {
        setError(data.detail || 'Failed to add goal');
      }
    } catch (error) {
      setError('Connection error. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Goal Title</label>
          <input 
            type="text" 
            placeholder="Enter your goal title" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description (Optional)</label>
          <textarea 
            placeholder="Describe your goal in more detail" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading || !title.trim()}>
            {loading ? 'Adding Goal...' : 'Add Goal'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddGoals;
