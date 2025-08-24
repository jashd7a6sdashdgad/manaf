'use client';

import { useTheme } from '@/hooks/useTheme';
import { useChat } from '@/hooks/useChat';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { motion } from 'framer-motion';

export function ChatInterface() {
  const { theme, toggleTheme } = useTheme();
  const { messages, isLoading, sendMessage, clearChat } = useChat();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 transition-colors duration-300">
      <div className="container mx-auto max-w-4xl h-screen flex flex-col px-4 sm:px-6 lg:px-8">
        <ChatHeader 
          theme={theme} 
          onToggleTheme={toggleTheme} 
          onClearChat={clearChat}
          messageCount={messages.length}
          messages={messages}
          onSendMessage={sendMessage}
        />
        
        <motion.div 
          className="flex-1 flex flex-col overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 glass rounded-xl mb-4">
              <ChatMessages messages={messages} isLoading={isLoading} />
            </div>
          </div>
          
          <div className="pb-4">
            <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}