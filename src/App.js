import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import AddGoals from './pages/add-goals';
import MyGoals from './pages/my-goals';
import ChatWindow from './components/chat-window';

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // TODO: Verify token with backend
      setUser({ token });
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchGoals();
      fetchTasks();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      const response = await fetch('http://localhost:8000/goals');
      const data = await response.json();
      setGoals(data.goals || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:8000/tasks');
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const generateDailyTasks = async () => {
    setLoading(true);
    
    try {
      // Delete all existing tasks if there are any
      if (tasks.length > 0) {
        const deleteRes = await fetch('http://localhost:8000/tasks/all', {
          method: 'DELETE'
        });
        
        if (!deleteRes.ok) {
          setResponse('Error: Could not clear existing tasks');
          setLoading(false);
          return;
        }
      }
      
      const goalsWithIds = goals.map(g => `Goal ID ${g.id}: ${g.title} - ${g.description}`).join('\n');
      
      const fullPrompt = `Based on these goals:\n${goalsWithIds}\n\nGenerate 5 specific, actionable tasks. For each task, determine which goal it relates to.\nReturn ONLY a JSON array with this exact format:\n[{"task": "task description", "goal_id": 1, "priority": "high/medium/low"}]\n\nNo other text, just the JSON array.`;
      console.log(fullPrompt);
      // Get AI response
      const aiRes = await fetch('http://localhost:8000/ai/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: fullPrompt, model: "haiku" }),
      });
      
      const aiData = await aiRes.json();
      
      // Parse JSON response
      const createdTasks = [];
      
      try {
        // Extract JSON from response
        const jsonMatch = aiData.response.match(/\[.*\]/s);
        if (!jsonMatch) {
          throw new Error('No JSON array found');
        }
        
        const tasksData = JSON.parse(jsonMatch[0]);
        
        // Save each task to database
        for (const taskData of tasksData) {
          const taskRes = await fetch('http://localhost:8000/tasks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              title: taskData.task,
              description: 'AI-generated daily task',
              priority: taskData.priority || 'medium',
              goal_id: taskData.goal_id
            }),
          });
          
          if (taskRes.ok) {
            const savedTask = await taskRes.json();
            createdTasks.push(savedTask);
          }
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        setResponse('Error: Could not parse AI response');
        setLoading(false);
        return;
      }
      
      setResponse(`Generated and saved ${createdTasks.length} tasks for today!`);
      fetchTasks(); // Refresh tasks list
      
    } catch (error) {
      setResponse('Error: Could not generate tasks');
    }
    
    setLoading(false);
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleRegister = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const handleGoalAdded = (newGoal) => {
    fetchGoals(); // Refresh goals list
    setCurrentPage('home'); // Go back to home
  };

  const getGoalName = (goalId) => {
    if (!goalId) return null;
    const goal = goals.find(g => g.id === goalId);
    return goal ? goal.title : 'Unknown Goal';
  };

  const deleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/tasks/${taskId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setTasks(tasks.filter(task => task.id !== taskId));
            } else {
                setError('Failed to delete task');
            }
        } catch (error) {
            setError('Connection error');
        }
    };

  if (!user) {
    return showLogin ? (
      <Login 
        onLogin={handleLogin} 
        switchToRegister={() => setShowLogin(false)} 
      />
    ) : (
      <Register 
        onRegister={handleRegister} 
        switchToLogin={() => setShowLogin(true)} 
      />
    );
  }

  if (currentPage === 'add-goals') {
    return (
      <div className="App">
        <header className="App-header">
          <div className="header-top">
            <button onClick={() => setCurrentPage('home')} className="back-btn">
              ← Back
            </button>
            <h1>Add Goals</h1>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
          <AddGoals onGoalAdded={handleGoalAdded} />
        </header>
      </div>
    );
  }

  if (currentPage === 'my-goals') {
    return (
      <div className="App">
        <header className="App-header">
          <div className="header-top">
            <button onClick={() => setCurrentPage('home')} className="back-btn">
              ← Back
            </button>
            <h1>My Goals</h1>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
          <MyGoals onAddGoals={() => setCurrentPage('add-goals')} />
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-top">
          <h1>AI Todo Assistant</h1>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
        
        <div className="navigation">
          <button onClick={() => setCurrentPage('add-goals')} className="nav-btn">
            Add Goals
          </button>
          <button onClick={() => setCurrentPage('my-goals')} className="nav-btn">
            My Goals
          </button>
        </div>
        
        <div className="todo-form">
          <button onClick={generateDailyTasks} disabled={loading}>
            {loading ? 'Generating Tasks...' : 'Generate Daily Tasks'}
          </button>
        </div>
        
        {response && (
          <div className="response">
            <h3>Status:</h3>
            <p>{response}</p>
          </div>
        )}
        
        <div className="tasks-section">
          <h2>Your Tasks</h2>
          {tasks.length === 0 ? (
            <p>No tasks yet. Generate some daily tasks!</p>
          ) : (
            <div className="tasks-list">
              {tasks.map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-content">
                    <h4>{task.title}</h4>
                    {task.goal_id && (
                      <span className="goal-badge">🎯 {getGoalName(task.goal_id)}</span>
                    )}
                    <p>{task.description}</p>
                    <span className={`priority ${task.priority}`}>{task.priority}</span>
                  </div>
                  <div className="task-actions">
                    <button onClick={() => setSelectedTask(task)} className="chat-btn">
                      💬 Chat
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="delete-btn"> 
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {selectedTask && (
          <ChatWindow 
            task={selectedTask} 
            onClose={() => setSelectedTask(null)} 
          />
        )}
      </header>
    </div>
  );
}

export default App;