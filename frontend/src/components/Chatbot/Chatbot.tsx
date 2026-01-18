'use client';

import React, { useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { useChat, type Language } from './useChat';
import ChatMessage from './ChatMessage';

export default function Chatbot() {
    const { messages, isLoading, isOpen, language, setLanguage, toggleChat, sendMessage } = useChat();
    const [input, setInput] = React.useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage(input);
        setInput('');
    };

    return (
        <>
            {/* Chat Window - Independently positioned */}
            {isOpen && (
                <div
                    className="fixed bottom-24 right-6 z-50 bg-white rounded-2xl shadow-2xl w-[90vw] md:w-[400px] overflow-hidden border border-gray-200"
                    style={{ maxHeight: 'min(600px, 70vh)' }}
                >
                    {/* Header */}
                    <div className="bg-gov-blue-600 text-white px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <div>
                                <h3 className="font-semibold text-sm">Jan Seva Sahayak</h3>
                                <p className="text-xs text-gov-blue-100">Online • Healthcare</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Language Selector */}
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as Language)}
                                className="bg-gov-blue-700 text-white text-xs px-2 py-1 rounded border border-gov-blue-500 focus:outline-none focus:ring-1 focus:ring-white"
                            >
                                <option value="english">English</option>
                                <option value="hindi">हिंदी</option>
                                <option value="gujarati">ગુજરાતી</option>
                            </select>
                            <button
                                onClick={toggleChat}
                                className="text-white hover:bg-gov-blue-700 p-1 rounded"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="h-[350px] overflow-y-auto p-4 bg-gray-50">
                        {messages.map((msg) => (
                            <ChatMessage key={msg.id} message={msg} />
                        ))}
                        {isLoading && (
                            <div className="flex gap-2 items-center mb-4 text-gray-400 text-sm ml-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about health, appointments..."
                                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gov-blue-500 focus:border-gov-blue-500 outline-none transition-all placeholder:text-gray-400 text-sm"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="absolute right-2 p-2 bg-gov-blue-600 text-white rounded-lg hover:bg-gov-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <p className="text-[10px] text-gray-400">
                                AI-generated responses. For medical emergencies, call 108.
                            </p>
                        </div>
                    </form>
                </div>
            )}

            {/* Floating Toggle Button - Independently positioned, minimal size */}
            <button
                onClick={toggleChat}
                className="fixed bottom-6 right-6 z-50 bg-gov-blue-600 hover:bg-gov-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
                aria-label={isOpen ? "Close chat" : "Open chat"}
            >
                {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
            </button>
        </>
    );
}
