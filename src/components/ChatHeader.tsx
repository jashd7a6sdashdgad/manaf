'use client';

import { useState } from 'react';
import { Moon, Sun, Trash2, GraduationCap, MessageCircle, Timer, Download, Youtube, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { StudyTracker } from './StudyTracker';
import { ExportData } from './ExportData';
import { Message } from '@/types/chat';

interface ChatHeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onClearChat: () => void;
  messageCount: number;
  messages: Message[];
  onSendMessage?: (content: string) => void;
}

export function ChatHeader({ theme, onToggleTheme, onClearChat, messageCount, messages, onSendMessage }: ChatHeaderProps) {
  const [isStudyTrackerOpen, setIsStudyTrackerOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handleYouTubeTest = () => {
    if (onSendMessage) {
      onSendMessage("Here are some test YouTube videos:\n\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ\n\nhttps://youtu.be/oHg5SJYRHA0\n\nhttps://www.youtube.com/watch?v=9bZkp7q19f0");
    }
  };

  const handleIQTest = () => {
    window.open('https://iqtestfree.io/', '_blank', 'noopener,noreferrer');
  };

  return (
    <>
    <motion.header 
      className="p-4 border-b border-border/20 bg-background/80 backdrop-blur-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">
              University Chat Assistant
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Your AI study companion
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {messageCount > 0 && (
            <motion.div 
              className="flex items-center gap-1 text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <MessageCircle size={14} />
              {messageCount} message{messageCount !== 1 ? 's' : ''}
            </motion.div>
          )}
          
          <motion.button
            onClick={handleYouTubeTest}
            className="p-2 rounded-lg hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
            title="Test YouTube Preview"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Youtube size={18} />
          </motion.button>

          <motion.button
            onClick={handleIQTest}
            className="p-2 rounded-lg hover:bg-purple-100 hover:text-purple-600 dark:hover:bg-purple-900/20 dark:hover:text-purple-400 transition-colors"
            title="Take IQ Test"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Brain size={18} />
          </motion.button>

          <motion.button
            onClick={() => setIsStudyTrackerOpen(true)}
            className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            title="Study Tracker"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Timer size={18} />
          </motion.button>
          
          {messageCount > 0 && (
            <motion.button
              onClick={() => setIsExportOpen(true)}
              className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              title="Export Data"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={18} />
            </motion.button>
          )}
          
          {messageCount > 0 && (
            <motion.button
              onClick={onClearChat}
              className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Clear chat"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 size={18} />
            </motion.button>
          )}
          
          <motion.button
            onClick={onToggleTheme}
            className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </motion.button>
        </div>
      </div>
    </motion.header>

    <StudyTracker
      isOpen={isStudyTrackerOpen}
      onClose={() => setIsStudyTrackerOpen(false)}
    />
    
    <ExportData
      isOpen={isExportOpen}
      onClose={() => setIsExportOpen(false)}
      messages={messages}
    />
    </>
  );
}