import React from 'react';
import { Bot, User as UserIcon } from 'lucide-react';
import { Message } from './useChat';

interface ChatMessageProps {
    message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isBot = message.sender === 'bot';

    return (
        <div className={`flex gap-3 mb-4 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isBot ? 'bg-gov-blue-100 text-gov-blue-600' : 'bg-gray-200 text-gray-600'}`}>
                {isBot ? <Bot className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isBot
                    ? 'bg-gray-100 text-gray-800 rounded-tl-none'
                    : 'bg-gov-blue-600 text-white rounded-tr-none'
                }`}>
                {/* Simple formatting for line breaks and bullet points */}
                <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                        __html: message.text
                            .replace(/\n/g, '<br/>')
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    }}
                />
                <span className={`text-[10px] mt-1 block opacity-70 ${isBot ? 'text-gray-500' : 'text-blue-100'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
};

export default ChatMessage;
