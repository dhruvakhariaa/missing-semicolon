import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import api from '@/lib/api';

export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export const useChat = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Namaste! I am your Jan Seva health assistant. How can I help you today?',
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;

        const newUserMessage: Message = {
            id: Date.now().toString(),
            text,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMessage]);
        setIsLoading(true);

        try {
            // Use the configured API client instead of raw axios if possible, 
            // but for now direct axios usage with the base URL logic is fine or extending api.ts
            // reusing the logic from api.ts effectively:
            const response = await api.post('/chat', {
                message: text,
                sessionId
            });

            if (response.data.success) {
                const newBotMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: response.data.message,
                    sender: 'bot',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, newBotMessage]);
                if (response.data.sessionId && !sessionId) {
                    setSessionId(response.data.sessionId);
                }
            }
        } catch (error) {
            console.error('Chat Error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Sorry, I am having trouble connecting to the server. Please try again later.',
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        messages,
        isLoading,
        isOpen,
        toggleChat,
        sendMessage
    };
};
