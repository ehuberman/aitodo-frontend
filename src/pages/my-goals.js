import React, { useState, useEffect } from 'react';

function MyGoals({ onAddGoals }) {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        setLoading(true);
        setError('');
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/goals',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            const data = await response.json();
            
            if (response.ok) {
                setGoals(data.goals || []);
            } else {
                setError('Failed to fetch goals');
            }
        } catch (error) {
            setError('Connection error');
        }
        
        setLoading(false);
    };

    const deleteGoal = async (goalId) => {
        if (!window.confirm('Are you sure you want to delete this goal?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/goals/${goalId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setGoals(goals.filter(goal => goal.id !== goalId));
            } else {
                setError('Failed to delete goal');
            }
        } catch (error) {
            setError('Connection error');
        }
    };

    if (loading) return (
        <div className="form-container">
            <p style={{textAlign: 'center', color: '#666'}}>Loading goals...</p>
        </div>
    );
    
    if (error) return (
        <div className="form-container">
            <div className="error-message">{error}</div>
        </div>
    );

    return (
        <div className="tasks-section">
            <div style={{marginBottom: '24px'}}>
                <button onClick={onAddGoals} className="nav-btn">
                    + Add Goal
                </button>
            </div>
            
            {goals.length === 0 ? (
                <div style={{textAlign: 'center', padding: '60px 20px', color: '#999'}}>
                    <p>No goals yet. Add some goals to get started!</p>
                </div>
            ) : (
                <div className="tasks-list">
                    {goals.map(goal => (
                        <div key={goal.id} className="task-item">
                            <div className="task-content">
                                <h4>{goal.title}</h4>
                                <p>{goal.description || 'No description provided'}</p>
                                <div style={{fontSize: '12px', color: '#999', marginTop: '8px'}}>
                                    Created: {new Date(goal.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="task-actions">
                                <button 
                                    onClick={() => deleteGoal(goal.id)} 
                                    className="delete-btn"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyGoals;