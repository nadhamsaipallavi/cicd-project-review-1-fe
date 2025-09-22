import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaPaperPlane, FaImage, FaFile, FaEllipsisV, FaSearch, FaTimes } from 'react-icons/fa';
import { BsCheck2All } from 'react-icons/bs';
import axios from '../../utils/api';
import { toast } from 'react-toastify';
import './Messenger.css'; // We'll create this CSS file

const Messenger = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const messagesEndRef = useRef(null);

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowConversationList(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        // Mock data loading
        setTimeout(() => {
          setConversations(mockConversations);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast.error('Failed to load conversations');
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      try {
        // Mock data loading
        setTimeout(() => {
          setMessages(mockMessages[activeConversation.id] || []);
          if (isMobileView) {
            setShowConversationList(false);
          }
        }, 300);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      }
    };

    fetchMessages();
    
    // Mark conversation as read
    const updatedConversations = conversations.map(conv => 
      conv.id === activeConversation.id 
        ? { ...conv, unreadCount: 0 } 
        : conv
    );
    
    setConversations(updatedConversations);
  }, [activeConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeConversation) return;
    
    setIsSending(true);
    
    try {
      // Mock sending a message
      const mockNewMessage = {
        id: `msg-${Date.now()}`,
        conversationId: activeConversation.id,
        sender: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          avatar: user.profilePic || 'https://via.placeholder.com/40',
        },
        content: newMessage,
        timestamp: new Date().toISOString(),
        read: true,
      };
      
      setMessages([...messages, mockNewMessage]);
      
      // Update conversation with last message
      const updatedConversations = conversations.map(conv => 
        conv.id === activeConversation.id 
          ? { 
              ...conv, 
              lastMessage: { 
                content: newMessage,
                timestamp: new Date().toISOString(),
              } 
            } 
          : conv
      );
      
      setConversations(updatedConversations);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = conversations.filter(conversation => 
    conversation.recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conversation.lastMessage && conversation.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleBackToConversations = () => {
    setShowConversationList(true);
  };

  // Mock data (same as before)
  const mockConversations = [
    // ... (same mock data as before)
  ];

  const mockMessages = {
    // ... (same mock data as before)
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="messenger-container">
      <div className={`messenger-grid ${isMobileView && !showConversationList ? 'single-column' : ''}`}>
        {/* Conversation List */}
        {(showConversationList || !isMobileView) && (
          <div className="conversation-list">
            <div className="conversation-header">
              <h2 className="text-xl font-bold">Messages</h2>
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="conversation-items">
              {filteredConversations.length === 0 ? (
                <div className="empty-state">
                  <p>No conversations found</p>
                </div>
              ) : (
                <ul>
                  {filteredConversations.map((conversation) => (
                    <li 
                      key={conversation.id}
                      className={`conversation-item ${
                        activeConversation?.id === conversation.id ? 'active' : ''
                      }`}
                      onClick={() => setActiveConversation(conversation)}
                    >
                      <div className="avatar-container">
                        <div className="avatar">
                          {conversation.recipient.avatar ? (
                            <img src={conversation.recipient.avatar} alt={conversation.recipient.name} />
                          ) : (
                            <span>{conversation.recipient.name.charAt(0)}</span>
                          )}
                        </div>
                        {conversation.recipient.role && (
                          <span className={`role-badge ${conversation.recipient.role.toLowerCase()}`}>
                            {conversation.recipient.role.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="conversation-details">
                        <div className="conversation-header">
                          <h3>{conversation.recipient.name}</h3>
                          {conversation.lastMessage && (
                            <span className="timestamp">
                              {formatTimestamp(conversation.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        {conversation.lastMessage && (
                          <p className="last-message">
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="unread-count">{conversation.unreadCount}</div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        
        {/* Message Area */}
        <div className={`message-area ${!activeConversation ? 'empty-state' : ''}`}>
          {activeConversation ? (
            <>
              <div className="message-header">
                {isMobileView && (
                  <button 
                    className="back-button"
                    onClick={handleBackToConversations}
                  >
                    <FaTimes />
                  </button>
                )}
                <div className="user-info">
                  <div className="avatar">
                    {activeConversation.recipient.avatar ? (
                      <img src={activeConversation.recipient.avatar} alt={activeConversation.recipient.name} />
                    ) : (
                      <span>{activeConversation.recipient.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3>{activeConversation.recipient.name}</h3>
                    <p className="user-role">
                      {activeConversation.recipient.role}
                    </p>
                  </div>
                </div>
                <div className="dropdown">
                  <button className="menu-button">
                    <FaEllipsisV />
                  </button>
                  <div className="dropdown-content">
                    <button>Mark as Unread</button>
                    <button>Block User</button>
                    <button className="delete">Delete Conversation</button>
                  </div>
                </div>
              </div>
              
              <div className="messages-container">
                <div className="messages">
                  {messages.length === 0 ? (
                    <div className="empty-messages">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isCurrentUser = message.sender.id === user.id;
                      return (
                        <div
                          key={message.id}
                          className={`message ${isCurrentUser ? 'sent' : 'received'}`}
                        >
                          {!isCurrentUser && (
                            <div className="message-avatar">
                              {message.sender.avatar ? (
                                <img src={message.sender.avatar} alt={message.sender.name} />
                              ) : (
                                <span>{message.sender.name.charAt(0)}</span>
                              )}
                            </div>
                          )}
                          <div className="message-content">
                            <p>{message.content}</p>
                            <div className="message-footer">
                              <span>{formatTimestamp(message.timestamp)}</span>
                              {isCurrentUser && (
                                <span className={`read-status ${message.read ? 'read' : ''}`}>
                                  <BsCheck2All />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              <form onSubmit={handleSendMessage} className="message-input">
                <button
                  type="button"
                  className="attach-button"
                  title="Attach image"
                >
                  <FaImage />
                </button>
                <button
                  type="button"
                  className="attach-button"
                  title="Attach file"
                >
                  <FaFile />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  className="send-button"
                  disabled={!newMessage.trim() || isSending}
                >
                  {isSending ? (
                    <div className="spinner"></div>
                  ) : (
                    <FaPaperPlane />
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="empty-message-area">
              <div className="empty-content">
                <h3>Select a conversation</h3>
                <p>Choose a conversation from the list to start messaging</p>
                <div className="empty-illustration">
                  <img 
                    src="https://via.placeholder.com/200?text=Select+a+Chat" 
                    alt="Select a conversation" 
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messenger;