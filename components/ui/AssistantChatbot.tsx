'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  X, 
  Send, 
  MessageSquare, 
  Stethoscope
} from 'lucide-react';
import Image from 'next/image';
import styled, { keyframes } from 'styled-components';

// Types
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface AssistantChatbotProps {
  initialOpen?: boolean;
}

// Animations
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// Styled Components
const ChatbotContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const ChatButton = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0A84FF 0%, #0055D4 100%);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(10, 132, 255, 0.3);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(10, 132, 255, 0.4);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.3), 0 4px 12px rgba(10, 132, 255, 0.3);
  }
`;

const ChatWindow = styled.div<{ isOpen: boolean }>`
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  display: ${props => (props.isOpen ? 'flex' : 'none')};
  flex-direction: column;
  overflow: hidden;
  animation: ${slideIn} 0.3s ease-out;

  @media (max-width: 480px) {
    width: 320px;
    height: 450px;
    bottom: 70px;
  }

  @media (max-width: 350px) {
    width: 280px;
  }
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #0A84FF 0%, #0055D4 100%);
  color: white;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ChatTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
`;

const ChatControls = styled.div`
  display: flex;
  gap: 10px;
`;

const ControlButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  &:focus {
    outline: none;
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageBubble = styled.div<{ sender: 'user' | 'assistant' }>`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: ${props => props.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};
  background-color: ${props => props.sender === 'user' ? '#0A84FF' : '#F0F2F5'};
  color: ${props => props.sender === 'user' ? 'white' : '#1E1E1E'};
  align-self: ${props => props.sender === 'user' ? 'flex-end' : 'flex-start'};
  word-wrap: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.3s ease-out;
`;

const MessageTime = styled.div<{ sender: 'user' | 'assistant' }>`
  font-size: 10px;
  margin-top: 4px;
  color: ${props => props.sender === 'user' ? 'rgba(255, 255, 255, 0.7)' : '#888'};
  text-align: ${props => props.sender === 'user' ? 'right' : 'left'};
`;

const InputArea = styled.div`
  display: flex;
  padding: 15px;
  border-top: 1px solid #E5E7EB;
  background-color: #F9FAFB;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #E5E7EB;
  border-radius: 20px;
  outline: none;
  font-size: 14px;
  background-color: white;
  transition: border-color 0.2s;

  &:focus {
    border-color: #0A84FF;
    box-shadow: 0 0 0 2px rgba(10, 132, 255, 0.2);
  }

  &::placeholder {
    color: #9CA3AF;
  }
`;

const SendButton = styled.button<{ isActive: boolean }>`
  margin-left: 8px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: ${props => props.isActive ? '#0A84FF' : '#E5E7EB'};
  color: ${props => props.isActive ? 'white' : '#9CA3AF'};
  cursor: ${props => props.isActive ? 'pointer' : 'default'};
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.isActive ? '#0055D4' : '#E5E7EB'};
  }

  &:focus {
    outline: none;
    box-shadow: ${props => props.isActive ? '0 0 0 2px rgba(10, 132, 255, 0.3)' : 'none'};
  }
`;

// Helper functions
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Sample responses for demonstration
const sampleResponses = [
  "I'm here to help with any questions about your eye health or using the OphthalmoScan platform.",
  "You can ask me about scheduling eye exams, understanding your scan results, or managing your eye care.",
  "Please note that I'm just an assistant and not a replacement for professional medical advice.",
  "I can help you navigate the platform or explain medical terms related to ophthalmology.",
  "How else can I assist you with your eye care needs today?"
];

const getRandomResponse = (): string => {
  return sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
};

// Main Component
const AssistantChatbot: React.FC<AssistantChatbotProps> = ({ initialOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      content: "Hello! I'm your OphthalmoScan assistant. How can I help you today?",
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const minimizeChat = () => {
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      sendMessage();
    }
  };

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: generateId(),
        content: getRandomResponse(),
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  return (
    <ChatbotContainer>
      <ChatWindow isOpen={isOpen} aria-hidden={!isOpen}>
        <ChatHeader>
          <ChatTitle>
            <Stethoscope size={20} />
            <span>OphthalmoScan Assistant</span>
          </ChatTitle>
          <ChatControls>
            <ControlButton 
              onClick={minimizeChat}
              aria-label="Minimize chat"
            >
              <ChevronDown size={18} />
            </ControlButton>
            <ControlButton 
              onClick={minimizeChat}
              aria-label="Close chat"
            >
              <X size={18} />
            </ControlButton>
          </ChatControls>
        </ChatHeader>
        
        <ChatMessages>
          {messages.map(message => (
            <div key={message.id}>
              <MessageBubble sender={message.sender}>
                {message.content}
                <MessageTime sender={message.sender}>
                  {formatTime(message.timestamp)}
                </MessageTime>
              </MessageBubble>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </ChatMessages>
        
        <InputArea>
          <ChatInput
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            aria-label="Chat message input"
          />
          <SendButton 
            isActive={!!inputValue.trim()} 
            onClick={sendMessage}
            disabled={!inputValue.trim()}
            aria-label="Send message"
          >
            <Send size={18} />
          </SendButton>
        </InputArea>
      </ChatWindow>
      
      <ChatButton
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
        aria-expanded={isOpen}
      >
        {isOpen ? <ChevronDown size={24} /> : <MessageSquare size={24} />}
      </ChatButton>
    </ChatbotContainer>
  );
};

export default AssistantChatbot;
