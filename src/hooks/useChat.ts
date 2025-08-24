'use client';

import { useState, useEffect, useCallback } from 'react';
import { Message, ChatSession, FileAttachment, Course } from '@/types/chat';

const WEBHOOK_URL = 'https://n8n.1000273.xyz/webhook/69228360-b893-4738-be51-d683de042c25';
const USE_POST_METHOD = false; // Using GET method for n8n compatibility

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const stored = localStorage.getItem(`chat-session-${sessionId}`);
    if (stored) {
      try {
        const session: ChatSession = JSON.parse(stored);
        setMessages(session.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } catch (error) {
        console.error('Failed to load chat session:', error);
      }
    }
  }, [sessionId]);

  const saveSession = useCallback((messages: Message[]) => {
    const session: ChatSession = {
      id: sessionId,
      messages,
      createdAt: new Date()
    };
    localStorage.setItem(`chat-session-${sessionId}`, JSON.stringify(session));
  }, [sessionId]);

  const sendMessage = useCallback(async (content: string, attachments?: FileAttachment[], course?: Course) => {
    if (isLoading || (!content.trim() && !attachments?.length)) return;

    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: content.trim() || (attachments?.length ? `📎 Sent ${attachments.length} file(s)` : ''),
      sender: 'user',
      timestamp: new Date(),
      attachments,
      course
    };

    const loadingMessage: Message = {
      id: `loading-${Date.now()}`,
      content: '',
      sender: 'bot',
      timestamp: new Date(),
      isLoading: true
    };

    const newMessages = [...messages, userMessage, loadingMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      let response: Response;
      
      console.log('Sending to webhook:', WEBHOOK_URL);
      console.log('Message content:', content.trim());
      console.log('Using POST method:', USE_POST_METHOD);
      
      if (USE_POST_METHOD) {
        // POST method with JSON body
        response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content.trim(),
            sessionId,
            attachments,
            course: course?.code || null
          }),
        });
      } else {
        // GET method - try most basic n8n format
        const url = new URL(WEBHOOK_URL);
        url.searchParams.append('chatInput', content.trim());
        url.searchParams.append('sessionId', sessionId);

        console.log('Final GET URL:', url.toString());
        
        response = await fetch(url.toString(), {
          method: 'GET',
        });
      }

      console.log('Response status:', response.status);
      console.log('Response headers:');
      for (const [key, value] of response.headers.entries()) {
        console.log(`  ${key}: ${value}`);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // Handle streaming response from n8n
      const responseText = await response.text();
      console.log('Raw response received:', responseText);
      console.log('Response length:', responseText.length);
      
      // Create bot message
      const botMessageId = `bot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      let botResponseContent = '';
      
      // Parse streaming JSON format to extract plain text content
      const lines = responseText.split('\n').filter(line => line.trim());
      console.log('Response lines:', lines);
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line.trim());
            console.log('Parsed line:', data);
            
            // Extract content from different streaming message types
            if (data.type === 'item' && data.content) {
              botResponseContent += data.content;
            } else if (data.type === 'message' && data.content) {
              botResponseContent += data.content;
            } else if (data.content) {
              botResponseContent += data.content;
            } else if (data.message) {
              botResponseContent += data.message;
            } else if (data.text) {
              botResponseContent += data.text;
            }
            
            // Stop processing if we hit an error
            if (data.type === 'error') {
              console.log('Stream error detected:', data);
              break;
            }
          } catch (parseError) {
            console.warn('Failed to parse streaming line:', line, parseError);
            // If it's not JSON, might be plain text
            if (!line.startsWith('{')) {
              botResponseContent += line + '\n';
            }
          }
        }
      }
      
      // Fallback - if no content extracted from streaming, try parsing whole response
      if (!botResponseContent || botResponseContent.trim() === '') {
        try {
          const jsonResponse = JSON.parse(responseText);
          if (jsonResponse.response) {
            botResponseContent = jsonResponse.response;
          } else if (jsonResponse.message) {
            botResponseContent = jsonResponse.message;
          } else if (jsonResponse.content) {
            botResponseContent = jsonResponse.content;
          }
        } catch {
          // Last resort - use raw text
          botResponseContent = responseText || 'Sorry, I received an empty response. Please try again.';
        }
      }
      
      // Clean up the content - remove any JSON artifacts
      botResponseContent = botResponseContent.trim();
      
      console.log('Final bot response content:', botResponseContent);
      
      // Create final bot message
      const finalBotMessage: Message = {
        id: botMessageId,
        content: botResponseContent,
        sender: 'bot',
        timestamp: new Date()
      };
      
      // Update messages - remove loading message and add bot response
      const finalMessages = [...messages, userMessage, finalBotMessage];
      setMessages(finalMessages);
      saveSession(finalMessages);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      let errorContent = 'Connection error. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          errorContent = 'Webhook not found or not active. Please check if the n8n workflow is activated and the webhook URL is correct.';
        } else {
          errorContent = `Connection error: ${error.message}. Please check your webhook URL or try again.`;
        }
      }
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: errorContent,
        sender: 'bot',
        timestamp: new Date()
      };

      const finalMessages = [...messages, userMessage, errorMessage];
      setMessages(finalMessages);
      saveSession(finalMessages);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, sessionId, saveSession]);

  const clearChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(`chat-session-${sessionId}`);
  }, [sessionId]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    sessionId
  };
}