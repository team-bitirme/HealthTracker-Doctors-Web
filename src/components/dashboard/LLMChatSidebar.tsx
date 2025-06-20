'use client';

import { useState, useEffect, useRef } from 'react';
import { useLLMStore, LLMMessage } from '@/store/llmStore';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  TrashIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function LLMChatSidebar() {
  const {
    isOpen,
    isLoading,
    isGeneratingReport,
    messages,
    closeSidebar,
    sendMessage,
    clearMessages,
  } = useLLMStore();

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading || isGeneratingReport) return;

    const message = newMessage.trim();
    setNewMessage('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-[960px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="flex items-center space-x-2 text-white">
            <SparklesIcon className="w-6 h-6" />
            <h2 className="text-lg font-semibold">AI Asistan</h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={clearMessages}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Konuşmayı Temizle"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
            <button
              onClick={closeSidebar}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Kapat"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100vh-140px)]">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <SparklesIcon className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                AI Asistan'a Hoş Geldiniz
              </h3>
              <p className="text-gray-500 max-w-xs">
                Tıbbi sorularınızı sorun, tedavi önerileri alın ve rehberlik için destek alın.
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  formatTime={formatTime}
                />
              ))}

              {(isLoading || isGeneratingReport) && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <SparklesIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-2xl p-3">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm text-gray-500 ml-2">
                      {isGeneratingReport ? 'Hasta raporu hazırlanıyor...' : 'AI düşünüyor...'}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="AI asistana sorunuzu yazın..."
                className="w-full resize-none border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32"
                rows={1}
                disabled={isLoading || isGeneratingReport}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading || isGeneratingReport}
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

interface MessageBubbleProps {
  message: LLMMessage;
  formatTime: (timestamp: string) => string;
}

function MessageBubble({ message, formatTime }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser
          ? 'bg-blue-500'
          : 'bg-gradient-to-br from-blue-500 to-purple-600'
      }`}>
        {isUser ? (
          <span className="text-white text-sm font-medium">S</span>
        ) : (
          <SparklesIcon className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block max-w-[85%] rounded-2xl p-3 ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
                        <div className="text-sm markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Özel stil overrides
                  h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-3 text-gray-900 border-b border-gray-300 pb-2" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2 text-gray-900 mt-4" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-1 text-gray-900 mt-3" {...props} />,
                  p: ({node, ...props}) => <p className="mb-3 text-gray-900 leading-relaxed" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1 ml-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1 ml-2" {...props} />,
                  li: ({node, ...props}) => <li className="text-sm text-gray-900 leading-relaxed" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                  em: ({node, ...props}) => <em className="italic text-gray-900" {...props} />,
                  code: ({node, inline, ...props}: any) =>
                    inline ? (
                      <code className="bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded text-xs font-mono font-medium" {...props} />
                    ) : (
                      <code className="block bg-gray-800 text-green-400 p-3 rounded-lg text-xs font-mono overflow-x-auto mb-3 border" {...props} />
                    ),
                  pre: ({node, ...props}) => <pre className="bg-gray-800 text-green-400 p-3 rounded-lg mb-3 overflow-x-auto border" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-400 pl-4 italic mb-3 bg-blue-50 py-2 text-gray-700" {...props} />,
                  table: ({node, ...props}) => <div className="overflow-x-auto mb-3"><table className="w-full border-collapse border border-gray-300 text-sm" {...props} /></div>,
                  th: ({node, ...props}) => <th className="border border-gray-300 px-3 py-2 bg-gray-100 font-semibold text-left text-gray-900" {...props} />,
                  td: ({node, ...props}) => <td className="border border-gray-300 px-3 py-2 text-gray-900" {...props} />,
                  hr: ({node, ...props}) => <hr className="border-gray-300 my-4" {...props} />,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <p className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}