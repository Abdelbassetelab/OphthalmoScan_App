import { render, screen, fireEvent } from '@testing-library/react';
import AssistantChatbot from '../components/ui/AssistantChatbot';

// Mock the styled-components
jest.mock('styled-components', () => {
  const originalModule = jest.requireActual('styled-components');
  return {
    ...originalModule,
    // Mock the keyframes function
    keyframes: () => 'animation-keyframes',
  };
});

describe('AssistantChatbot', () => {
  it('renders the chat button', () => {
    render(<AssistantChatbot />);
    const chatButton = screen.getByRole('button', { name: /open chat assistant/i });
    expect(chatButton).toBeInTheDocument();
  });

  it('opens the chat window when button is clicked', () => {
    render(<AssistantChatbot />);
    const chatButton = screen.getByRole('button', { name: /open chat assistant/i });
    
    // Initially the chat window should be hidden
    expect(screen.queryByText('OphthalmoScan Assistant')).not.toBeVisible();
    
    // Click the button to open the chat
    fireEvent.click(chatButton);
    
    // Now the chat window should be visible
    expect(screen.getByText('OphthalmoScan Assistant')).toBeVisible();
  });

  it('shows welcome message when opened', () => {
    render(<AssistantChatbot />);
    const chatButton = screen.getByRole('button', { name: /open chat assistant/i });
    
    // Open the chat
    fireEvent.click(chatButton);
    
    // Check for the welcome message
    expect(screen.getByText(/Hello! I'm your OphthalmoScan assistant/i)).toBeInTheDocument();
  });

  it('allows sending a message', () => {
    render(<AssistantChatbot />);
    const chatButton = screen.getByRole('button', { name: /open chat assistant/i });
    
    // Open the chat
    fireEvent.click(chatButton);
    
    // Type a message
    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Hello, can you help me?' } });
    
    // Send the message
    const sendButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendButton);
    
    // The message should be visible in the chat
    expect(screen.getByText('Hello, can you help me?')).toBeInTheDocument();
  });
});
