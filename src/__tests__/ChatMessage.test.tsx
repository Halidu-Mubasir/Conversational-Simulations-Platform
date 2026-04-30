import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatMessage from '../../components/ChatMessage';
import { ChatRole } from '../../types';

const baseMessage = {
  role: 'model' as const,
  text: 'Hello, how can I help you?',
  timestamp: new Date(),
  id: 'msg-1',
};

describe('ChatMessage', () => {
  it('renders user message correctly', () => {
    const userMessage = { ...baseMessage, role: ChatRole.USER };
    render(
      <ChatMessage
        message={userMessage}
        personaName="Test Persona"
        personaImageSeed="test-seed"
      />
    );
    expect(screen.getByText('Hello, how can I help you?')).toBeInTheDocument();
  });

  it('renders model message correctly', () => {
    const modelMessage = { ...baseMessage, role: ChatRole.MODEL };
    render(
      <ChatMessage
        message={modelMessage}
        personaName="Test Persona"
        personaImageSeed="test-seed"
      />
    );
    expect(screen.getByText('Hello, how can I help you?')).toBeInTheDocument();
  });

  it('renders system message in italic style', () => {
    const systemMessage = {
      ...baseMessage,
      role: ChatRole.SYSTEM,
      text: 'System notification',
    };
    const { container } = render(
      <ChatMessage
        message={systemMessage}
        personaName="Test Persona"
        personaImageSeed="test-seed"
      />
    );
    expect(screen.getByText('System notification')).toBeInTheDocument();
    const italicText = container.querySelector('em, .italic');
    expect(italicText).toBeInTheDocument();
  });

  it('displays persona avatar for model messages', () => {
    const modelMessage = { ...baseMessage, role: ChatRole.MODEL };
    const { container } = render(
      <ChatMessage
        message={modelMessage}
        personaName="Socrates"
        personaImageSeed="socrates"
      />
    );
    const avatar = container.querySelector('img[alt="Socrates"]');
    expect(avatar).toBeInTheDocument();
  });

  it('does not display avatar for user messages', () => {
    const userMessage = { ...baseMessage, role: ChatRole.USER };
    const { container } = render(
      <ChatMessage
        message={userMessage}
        personaName="Test Persona"
        personaImageSeed="test-seed"
      />
    );
    const avatar = container.querySelector('img');
    expect(avatar).toBeNull();
  });

  it('does not display avatar for system messages', () => {
    const systemMessage = { ...baseMessage, role: ChatRole.SYSTEM };
    const { container } = render(
      <ChatMessage
        message={systemMessage}
        personaName="Test Persona"
        personaImageSeed="test-seed"
      />
    );
    const avatar = container.querySelector('img');
    expect(avatar).toBeNull();
  });

  it('user messages have user styling', () => {
    const userMessage = { ...baseMessage, role: ChatRole.USER };
    const { container } = render(
      <ChatMessage
        message={userMessage}
        personaName="Test Persona"
        personaImageSeed="test-seed"
      />
    );
    const bubble = container.querySelector('.bg-primary-500');
    expect(bubble).toBeInTheDocument();
  });

  it('model messages have model styling', () => {
    const modelMessage = { ...baseMessage, role: ChatRole.MODEL };
    const { container } = render(
      <ChatMessage
        message={modelMessage}
        personaName="Test Persona"
        personaImageSeed="test-seed"
      />
    );
    const bubble = container.querySelector('.dark\\:bg-neutral-700');
    expect(bubble).toBeInTheDocument();
  });
});
