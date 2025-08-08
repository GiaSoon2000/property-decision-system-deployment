import API_ENDPOINTS from '../../config';
// frontend/src/pages/Chat.js
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
// import { useAuth } from './../hooks/useAuth'; // Your auth context

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
//   const { currentUser } = useAuth();

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      const isScrolledToBottom = 
        container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
      if (isScrolledToBottom) {
        scrollToBottom();
      }
    }
  }, [messages]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = {
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(msg => ({
        isUser: msg.type === 'user',
        message: msg.content
      }));

      const context = {
        property_id: window.location.pathname.split('/').pop(),
        current_page: window.location.pathname,
      };

      const response = await fetch(API_ENDPOINTS.CHAT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
          context: context,
          history: chatHistory
        }),
        credentials: 'include',
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage = {
        type: 'assistant',
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        type: 'error',
        content: 'Sorry, there was an error processing your request.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="tw-min-h-screen tw-pt-20 tw-pb-8 tw-px-4 tw-bg-gray-50">
      <div className="tw-max-w-2xl tw-mx-auto tw-flex tw-flex-col tw-h-[calc(100vh-120px)]">
        <div className="tw-bg-white tw-rounded-lg tw-shadow-lg tw-flex tw-flex-col tw-h-full">
          <div className="tw-p-4 tw-border-b tw-flex tw-justify-between tw-items-center">
            <h2 className="tw-text-lg tw-font-semibold">Property Assistant</h2>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="tw-text-sm tw-text-gray-500 hover:tw-text-gray-700"
              >
                Clear Chat
              </button>
            )}
          </div>

          <div 
            ref={messagesContainerRef}
            className="tw-flex-1 tw-overflow-y-auto tw-p-4 tw-space-y-4"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`tw-flex ${message.type === 'user' ? 'tw-justify-end' : 'tw-justify-start'}`}
              >
                <div
                  className={`tw-max-w-[80%] tw-p-3 tw-rounded-lg ${
                    message.type === 'user'
                      ? 'tw-bg-emerald-500 tw-text-white'
                      : 'tw-bg-gray-100 tw-text-gray-800'
                  }`}
                >
                  <div className="tw-text-left">
                    <ReactMarkdown
                      components={{
                        // Style the headers and bold text
                        strong: ({node, ...props}) => <span className="tw-font-bold" {...props} />,
                        h1: ({node, ...props}) => <h1 className="tw-text-xl tw-font-bold tw-mb-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="tw-text-lg tw-font-bold tw-mb-2" {...props} />,
                        h3: ({node, ...props}) => <h3 className="tw-text-md tw-font-bold tw-mb-2" {...props} />,
                        p: ({node, ...props}) => <p className="tw-mb-2" {...props} />,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  {message.calculations && (
                    <div className="tw-mt-2 tw-p-2 tw-bg-white tw-rounded">
                      <h4 className="tw-font-semibold">Calculation Results:</h4>
                      <pre className="tw-text-sm">{JSON.stringify(message.calculations, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="tw-flex tw-justify-start">
                <div className="tw-bg-gray-100 tw-p-3 tw-rounded-lg">
                  <span className="tw-animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="tw-p-4 tw-border-t">
            <div className="tw-flex tw-space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about properties or calculations..."
                className="tw-flex-1 tw-p-2 tw-border tw-rounded tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-emerald-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="tw-px-4 tw-py-2 tw-bg-emerald-500 tw-text-white tw-rounded hover:tw-bg-emerald-600 disabled:tw-bg-emerald-300 tw-transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;