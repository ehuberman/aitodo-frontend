import React, { useState, useEffect } from 'react';

function MyGoals({ onAddGoals }) {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expandedGoal, setExpandedGoal] = useState(null);
    const [goalTasks, setGoalTasks] = useState({});

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

    const fetchGoalTasks = async (goalId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/goals/${goalId}/tasks`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (response.ok) {
                setGoalTasks(prev => ({ ...prev, [goalId]: data.tasks || [] }));
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const toggleGoal = (goalId) => {
        if (expandedGoal === goalId) {
            setExpandedGoal(null);
        } else {
            setExpandedGoal(goalId);
            if (!goalTasks[goalId]) {
                fetchGoalTasks(goalId);
            }
        }
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
                            <div className="task-content" onClick={() => toggleGoal(goal.id)} style={{cursor: 'pointer'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    <span style={{fontSize: '14px', color: '#666'}}>
                                        {expandedGoal === goal.id ? '▼' : '▶'}
                                    </span>
                                    <h4>{goal.title}</h4>
                                </div>
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
                            {expandedGoal === goal.id && (
                                <div style={{width: '100%', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e5e5'}}>
                                    <h5 style={{margin: '0 0 12px 0', color: '#666', fontSize: '14px'}}>Tasks for this goal:</h5>
                                    {goalTasks[goal.id] && goalTasks[goal.id].length > 0 ? (
                                        <div style={{display: 'grid', gap: '8px'}}>
                                            {goalTasks[goal.id].map(task => (
                                                <div key={task.id} style={{background: '#f8f9fa', padding: '12px', borderRadius: '8px', fontSize: '14px'}}>
                                                    <div style={{fontWeight: '500', marginBottom: '4px'}}>{task.title}</div>
                                                    <div style={{color: '#666', fontSize: '13px'}}>{task.description}</div>
                                                    <span className={`priority ${task.priority}`} style={{marginTop: '8px'}}>{task.priority}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{color: '#999', fontSize: '13px', margin: 0}}>No tasks for this goal yet.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyGoals;