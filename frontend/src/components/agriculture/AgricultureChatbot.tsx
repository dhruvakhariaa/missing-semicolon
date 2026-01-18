'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, MessageCircle, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export function AgricultureChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Namaste! I am your AI Agri-Assistant. I know about your crops and land. How can I help you today?", sender: 'bot', timestamp: new Date() }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg: Message = {
            id: Date.now(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            const farmerId = localStorage.getItem('farmerId');
            const res = await fetch('http://localhost:3002/api/agriculture/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg.text, farmerId })
            });
            const data = await res.json();

            if (data.success) {
                const botMsg: Message = {
                    id: Date.now() + 1,
                    text: data.reply,
                    sender: 'bot',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, botMsg]);
            } else {
                throw new Error(data.message || 'Failed to get response');
            }
        } catch (error: any) {
            console.error("Chat Error:", error);
            let userFriendlyError = "Connection failed. Please ensure the backend server is running.";

            if (error.message) userFriendlyError += ` (Details: ${error.message})`;

            const errorMsg: Message = {
                id: Date.now() + 1,
                text: `⚠️ ${userFriendlyError}`,
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            {isOpen && (
                <Card className="w-[350px] h-[500px] mb-4 shadow-2xl border-none flex flex-col pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-sky-700 p-4 rounded-t-xl flex justify-between items-center text-white shadow-md">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                                <Bot className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Agri-Sahayak AI</h3>
                                <p className="text-[10px] text-blue-100 opacity-90">Context-Aware Support</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 text-sm rounded-2xl shadow-sm ${msg.sender === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                        }`}
                                >
                                    {msg.sender === 'bot' && (
                                        <p className="text-[10px] font-bold text-blue-600 mb-1 flex items-center gap-1">
                                            <Bot className="h-3 w-3" /> AI Assistant
                                        </p>
                                    )}
                                    <p className="leading-relaxed">{msg.text}</p>
                                    <p className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-75"></span>
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-150"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100 rounded-b-xl">
                        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-full border focus-within:ring-2 ring-blue-100 transition-all">
                            <input
                                type="text"
                                className="flex-1 bg-transparent border-none focus:outline-none px-3 text-sm text-gray-700 placeholder:text-gray-400"
                                placeholder="Describe your issue..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <Button
                                size="icon"
                                className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm shrink-0"
                                onClick={handleSend}
                                disabled={isLoading || !inputText.trim()}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Toggle Button */}
            <Button
                size="lg"
                className={`rounded-full shadow-xl h-14 w-14 p-0 pointer-events-auto transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 hover:scale-110'} bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white`}
                onClick={() => setIsOpen(true)}
            >
                <MessageCircle className="h-7 w-7" />
            </Button>
        </div>
    );
}
