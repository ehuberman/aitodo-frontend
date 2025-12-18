import React, { useState } from 'react';
import './ChatWindow.css';

function ChatWindow({ task, onClose }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [width, setWidth] = useState(400);

    const formatMessage = (content) => {
        return content
            .replace(/\n(\d+\.|•|-|\*)/g, '\n\n$1')
            .replace(/\n\n\n/g, '\n\n')
            .split('\n')
            .map((line, i) => (
                <div key={i} className={line.match(/^\d+\.|^•|^-|^\*/) ? 'list-item' : ''}>
                    {line}
                </div>
            ));
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input, timestamp: new Date() };
        setMessages([...messages, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/ai/task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    prompt: `Task: ${task.title}\nUser question: ${input}\nProvide a helpful response.`,
                    model: "sonnet"
                }),
            });

            const data = await response.json();
            const aiMessage = { role: 'assistant', content: data.response, timestamp: new Date() };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage = { role: 'assistant', content: 'Error: Could not get response', timestamp: new Date() };
            setMessages(prev => [...prev, errorMessage]);
        }

        setLoading(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleResize = (e) => {
        const startX = e.clientX;
        const startWidth = width;
        
        const handleMouseMove = (e) => {
            const newWidth = startWidth - (e.clientX - startX);
            setWidth(Math.max(300, Math.min(800, newWidth)));
        };
        
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div className="chat-sidebar" style={{ width: `${width}px` }}>
            <div className="resize-handle" onMouseDown={handleResize}></div>
            <div className="chat-header">
                <div>
                    <h3>Chat about Task</h3>
                    <p className="task-title">{task.title}</p>
                </div>
                <div className="chat-controls">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="minimize-btn">
                        {isMinimized ? '□' : '−'}
                    </button>
                    <button onClick={onClose} className="close-btn">✕</button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    <div className="chat-messages">
                        {messages.length === 0 ? (
                            <div className="empty-chat">
                                <p>Ask me anything about this task!</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={index} className={`message ${msg.role}`}>
                                    <div className="message-content">
                                        {formatMessage(msg.content)}
                                    </div>
                                    <div className="message-time">
                                        {msg.timestamp?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                            ))
                        )}
                        {loading && (
                            <div className="message assistant">
                                <div className="message-content">Thinking...</div>
                            </div>
                        )}
                    </div>

                    <div className="chat-input">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask about this task..."
                            rows="2"
                        />
                        <button onClick={sendMessage} disabled={loading || !input.trim()}>
                            Send
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default ChatWindow;