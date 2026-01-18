'use client';

import React, { useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Minimize2 } from 'lucide-react';
import { useChat } from './useChat';
import ChatMessage from './ChatMessage';

const Chatbot = () => {
    const { messages, isLoading, isOpen, toggleChat, sendMessage } = useChat();
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
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            <div
                className={`bg-white rounded-2xl shadow-2xl w-[90vw] md:w-[400px] mb-4 overflow-hidden border border-gray-200 transition-all duration-300 origin-bottom-right pointer-events-auto ${isOpen
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 translate-y-10 pointer-events-none'
                    }`}
                style={{ maxHeight: 'min(600px, 80vh)' }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-gov-blue-700 to-gov-blue-600 p-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Jan Seva Sahayak</h3>
                            <p className="text-xs text-blue-100 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                Online • Healthcare
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleChat}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                            aria-label="Minimize chat"
                        >
                            <Minimize2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="h-[400px] overflow-y-auto p-4 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-200">
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

            {/* Float Button */}
            <button
                onClick={toggleChat}
                className={`bg-gov-blue-600 hover:bg-gov-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center pointer-events-auto ${isOpen ? 'rotate-90 scale-0 opacity-0' : 'scale-100 opacity-100'}`}
                aria-label="Open chat"
            >
                <MessageSquare className="w-8 h-8" />
            </button>

            {/* Close Button implementation when open is tricky with the pure CSS toggle approach if we hide the main button, 
                so usually we either keep the main button visible or have a close button on the window. 
                Here I minimized the window with a minimize button, but let's also add a floating close button if the window is open 
                to match the "transform" logic above or just keep the window minimize button. 
                Actually, let's make the floating button morph.
            */}
            <button
                onClick={toggleChat}
                className={`absolute bottom-0 right-0 bg-gray-800 hover:bg-gray-900 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform pointer-events-auto ${isOpen ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 -rotate-90'}`}
                aria-label="Close chat"
            >
                <X className="w-8 h-8" />
            </button>

        </div>
    );
};

export default Chatbot;
