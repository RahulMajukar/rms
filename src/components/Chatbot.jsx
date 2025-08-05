import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Get user info from localStorage on mount
  useEffect(() => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const userData = JSON.parse(userString);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
    }
  }, []);

  // Auto-open chat on component mount with a delay
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        // setIsOpen(true);
        // Add initial greeting based on user info
        const greeting = `Hi ${user.name || getUserRoleTitle(user)}! How can I help you today?`;
        addBotMessage(greeting);
        
        // Add quick options after greeting
        setTimeout(() => {
          addBotMessage(
            <div>
              <p className="mb-2">Choose an option or type your question:</p>
              <div className="flex flex-wrap gap-0 mt-2">
                <QuickOption label="View Forms" onClick={() => handleQuickOption('forms')} />
                <QuickOption label="New Inspection" onClick={() => handleQuickOption('new-inspection')} />
                <QuickOption label="Dashboard" onClick={() => handleQuickOption('dashboard')} />
                <QuickOption label="Help" onClick={() => handleQuickOption('help')} />
              </div>
            </div>
          );
        }, 1000);
      }, 1500); // 1.5 second delay

      return () => clearTimeout(timer);
    }
  }, [user]);

  const QuickOption = ({ label, onClick }) => (
    <button 
      onClick={onClick}
      className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium rounded-full px-3 py-1 text-sm flex items-center transition-colors"
    >
      <span className="w-2 h-2 bg-blue-800 rounded-full mr-2"></span>
      {label}
    </button>
  );

  const handleQuickOption = (option) => {
    // Add user "message" showing they selected this option
    setMessages(prev => [...prev, { 
      sender: 'user', 
      content: option === 'forms' ? 'View Forms' : 
               option === 'new-inspection' ? 'New Inspection' : 
               option === 'dashboard' ? 'Dashboard' : 'Help'
    }]);

    // Handle different options
    switch (option) {
      case 'forms':
        addBotMessage(
          <div>
            <p>Here are links to your forms:</p>
            <ul className="mt-2 ml-4 list-disc">
              <li className="mb-1">
                <a href="/forms" className="text-blue-800 underline hover:text-blue-700" onClick={(e) => { e.preventDefault(); navigate('/forms'); }}>
                  All Forms
                </a>
              </li>
              <li className="mb-1">
                <a href="/forms/drafted" className="text-blue-800 underline hover:text-blue-700" onClick={(e) => { e.preventDefault(); navigate('/forms/drafted'); }}>
                  Draft Forms
                </a>
              </li>
              <li>
                <a href="/forms/approved" className="text-blue-800 underline hover:text-blue-700" onClick={(e) => { e.preventDefault(); navigate('/forms/approved'); }}>
                  Approved Forms
                </a>
              </li>
            </ul>
          </div>
        );
        break;
      case 'new-inspection':
        addBotMessage(
          <div>
            <p>You can create a new inspection form by clicking the link below:</p>
            <div className="mt-2">
              <a 
                href="/inspection-form" 
                className="inline-block bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                onClick={(e) => { e.preventDefault(); navigate('/inspection-form'); }}
              >
                Create New Form
              </a>
            </div>
          </div>
        );
        break;
      case 'dashboard':
        addBotMessage(
          <div>
            <p>You can access your dashboard here:</p>
            <div className="mt-2">
              <a 
                href="/dashboard" 
                className="inline-block bg-blue-800 text-white px-3 py-1 rounded hover:bg-background transition-colors"
                onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        );
        break;
      case 'help':
        addBotMessage(
          <div>
            <p>How can I help you today? Here are some common topics:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <QuickOption label="Form Status" onClick={() => handleHelpOption('status')} />
              <QuickOption label="Editing Forms" onClick={() => handleHelpOption('editing')} />
              <QuickOption label="Approvals" onClick={() => handleHelpOption('approvals')} />
              <QuickOption label="Contact Support" onClick={() => handleHelpOption('contact')} />
            </div>
          </div>
        );
        break;
      default:
        break;
    }
  };

  const handleHelpOption = (topic) => {
    setMessages(prev => [...prev, { 
      sender: 'user', 
      content: topic === 'status' ? 'Form Status' : 
               topic === 'editing' ? 'Editing Forms' : 
               topic === 'approvals' ? 'Approvals' : 'Contact Support'
    }]);

    switch (topic) {
      case 'status':
        addBotMessage("You can check the status of your forms on the Forms page. Forms can be in Draft, Submitted, Approved, or Rejected status.");
        break;
      case 'editing':
        addBotMessage("You can edit forms that are in Draft status. Once submitted, forms can only be edited by users with appropriate permissions.");
        break;
      case 'approvals':
        addBotMessage("Forms need to be approved by an AVP user. After submission, they will review the form and either approve or reject it with comments.");
        break;
      case 'contact':
        addBotMessage("For technical support, please email support@agigreenpac.com or call our helpdesk at 1-800-555-1234.");
        break;
      default:
        break;
    }
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getUserRoleTitle = (user) => {
    if (!user) return 'Guest';
    
    // Extract role from user object
    const role = user.role?.toLowerCase() || '';
    
    if (role.includes('operator')) return 'Operator';
    if (role.includes('avp')) return 'AVP';
    if (role.includes('qa')) return 'QA Manager';
    if (role.includes('master')) return 'Master Admin';
    
    // If custom name is available, use it
    if (user.name) return user.name;
    
    return 'User';
  };

  const addBotMessage = (content) => {
    setIsBotTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', content }]);
      setIsBotTyping(false);
    }, 800);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (inputValue.trim() === '') return;
    
    // Add user message
    setMessages(prev => [...prev, { sender: 'user', content: inputValue }]);
    
    // Process user message and generate bot response
    const botResponse = generateResponse(inputValue);
    setInputValue('');
    
    // Add bot response after a delay
    addBotMessage(botResponse);
  };

  const generateResponse = (message) => {
    const normalizedMessage = message.toLowerCase();
    
    // Check for navigation requests
    if (normalizedMessage.includes('forms') || normalizedMessage.includes('inspection')) {
      return (
        <div>
          <p>You can access forms here:</p>
          <div className="mt-2">
            <a 
              href="/forms" 
              className="inline-block bg-blue-800 text-white px-3 py-1 rounded hover:bg-background transition-colors mr-2"
              onClick={(e) => { e.preventDefault(); navigate('/forms'); }}
            >
              All Forms
            </a>
            <a 
              href="/inspection-form/new" 
              className="inline-block bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
              onClick={(e) => { e.preventDefault(); navigate('/inspection-form/new'); }}
            >
              New Form
            </a>
          </div>
        </div>
      );
    } else if (normalizedMessage.includes('dashboard')) {
      return (
        <div>
          <p>You can access your dashboard here:</p>
          <div className="mt-2">
            <a 
              href="/dashboard" 
              className="inline-block bg-blue-800 text-white px-3 py-1 rounded hover:bg-background transition-colors"
              onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      );
    }
    
    // Simple text responses
    if (normalizedMessage.includes('hello') || normalizedMessage.includes('hi')) {
      return 'Hello! How can I assist you today?';
    } else if (normalizedMessage.includes('help')) {
      return (
        <div>
          <p>I can help with various topics. What do you need assistance with?</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <QuickOption label="Form Status" onClick={() => handleHelpOption('status')} />
            <QuickOption label="Editing Forms" onClick={() => handleHelpOption('editing')} />
            <QuickOption label="Approvals" onClick={() => handleHelpOption('approvals')} />
            <QuickOption label="Contact Support" onClick={() => handleHelpOption('contact')} />
          </div>
        </div>
      );
    } else if (normalizedMessage.includes('logout') || normalizedMessage.includes('log out')) {
      return 'To log out, click the "Logout" button at the top right corner of the page.';
    } else if (normalizedMessage.includes('thank')) {
      return "You're welcome! If you need anything else, I'm here to help.";
    } else if (normalizedMessage.includes('settings')) {
      return 'You can adjust your settings by clicking on the "Settings" icon located in the top right corner.';
    } else if (normalizedMessage.includes('profile')) {
      return 'To view or edit your profile, click on your name in the top right corner and select "Profile".';
    } else if (normalizedMessage.includes('error') || normalizedMessage.includes('issue')) {
      return  "I'm sorry to hear you're experiencing an issue. Can you describe the problem in more detail so I can assist you better?";
    } else if (normalizedMessage.includes('contact')) {
      return 'You can contact support by sending an email to support@agigreenpac.com or by calling our helpdesk at 1-800-555-1234.';
    } else if (normalizedMessage.includes('notification') || normalizedMessage.includes('alert')) {
      return 'To view your notifications, click on the bell icon in the top right corner of the page.';
    } else if (normalizedMessage.includes('save')) {
      return "Don't forget to save your work regularly by clicking the \"Save Changes\" button at the bottom of the form!";
    } else {
      return (
        <div>
          <p>I'm not sure I understand. Could you please try asking in a different way?</p>
          <div className="mt-2">
            <p>Or select one of these options:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <QuickOption label="View Forms" onClick={() => handleQuickOption('forms')} />
              <QuickOption label="New Inspection" onClick={() => handleQuickOption('new-inspection')} />
              <QuickOption label="Help" onClick={() => handleQuickOption('help')} />
            </div>
          </div>
        </div>
      );
    }
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className="fixed bottom-16 right-6 z-50">
      {/* Chat button */}
      <button 
        onClick={toggleChat}
        className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 shadow-lg flex items-center justify-center w-14 h-14"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
      
      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 flex flex-col">
          {/* Chat header */}
          <div className="bg-blue-800 text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-medium">AGI Support</h3>
            <button onClick={toggleChat} className="text-white hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Chat messages */}
          <div className="flex-1 p-4 overflow-y-auto max-h-96">
            <div className="space-y-3">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-3/4 p-3 rounded-lg ${
                      msg.sender === 'user' 
                        ? 'bg-blue-800 text-white rounded-br-none' 
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isBotTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 p-3 rounded-lg rounded-bl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Chat input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-2">
            <div className="flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
              <button 
                type="submit"
                className="bg-blue-800 text-white px-4 py-2 rounded-r-lg hover:bg-background focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;