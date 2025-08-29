'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Trash2, GraduationCap, MessageCircle, Timer, Download, Youtube, Brain, Volume2, VolumeX, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { StudyTracker } from './StudyTracker';
import { ExportData } from './ExportData';
import { Message } from '@/types/chat';
import { useTTS } from '@/lib/ttsUtils';
import { cn } from '@/lib/utils';
import { generateSmartQuestions } from '@/lib/smartQuestions';

interface ChatHeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onClearChat: () => void;
  messageCount: number;
  messages: Message[];
  onSendMessage?: (content: string) => void;
  isVoiceEnabled: boolean;
  onVoiceToggle: (enabled: boolean) => void;
}

export function ChatHeader({ theme, onToggleTheme, onClearChat, messageCount, messages, onSendMessage, isVoiceEnabled, onVoiceToggle }: ChatHeaderProps) {
  const [isStudyTrackerOpen, setIsStudyTrackerOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { isSupported } = useTTS();

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleYouTubeTest = () => {
    if (onSendMessage) {
      onSendMessage("Here are some test YouTube videos:\n\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ\n\nhttps://youtu.be/oHg5SJYRHA0\n\nhttps://www.youtube.com/watch?v=9bZkp7q19f0");
    }
  };

  const handleIQTest = () => {
    window.open('https://iqtestfree.io/', '_blank', 'noopener,noreferrer');
  };

  const toggleVoice = () => {
    onVoiceToggle(!isVoiceEnabled);
  };

  const handleSmartQuestions = () => {
    if (onSendMessage) {
      const questions = generateSmartQuestions(messages, 3);
      const questionText = questions.map((q, i) => `${i + 1}. ${q}`).join('\n\n');
      onSendMessage(`💡 Here are some smart questions to explore further:\n\n${questionText}\n\nChoose any of these questions or ask your own!`);
    }
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
          {/* IQ Test Button */}
          <motion.button
            onClick={handleIQTest}
            className="p-2 rounded-lg hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors"
            title="Take IQ Test"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Brain size={18} />
          </motion.button>

          {/* Voice Toggle Button */}
          {isClient && isSupported() && (
            <motion.button
              onClick={toggleVoice}
              className="p-2 rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground"
              title="Enable Voice Response"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isVoiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </motion.button>
          )}

          {/* Smart Questions Button */}
          <motion.button
            onClick={handleSmartQuestions}
            className="p-2 rounded-lg hover:bg-yellow-100 hover:text-yellow-600 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-400 transition-colors"
            title="Generate Smart Questions"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Lightbulb size={18} />
          </motion.button>

          {/* Study Tracker Button */}
          <motion.button
            onClick={() => setIsStudyTrackerOpen(true)}
            className="p-2 rounded-lg hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-colors"
            title="Study Tracker"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <GraduationCap size={18} />
          </motion.button>

          {/* Export Data Button */}
          <motion.button
            onClick={() => setIsExportOpen(true)}
            className="p-2 rounded-lg hover:bg-purple-100 hover:text-purple-600 dark:hover:bg-purple-900/20 dark:hover:text-purple-400 transition-colors"
            title="Export Data"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download size={18} />
          </motion.button>

          {/* YouTube Test Button */}
          <motion.button
            onClick={handleYouTubeTest}
            className="p-2 rounded-lg hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
            title="Test YouTube Links"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Youtube size={18} />
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            onClick={onToggleTheme}
            className={cn(
              "p-2 rounded-lg transition-colors",
              theme === 'dark' 
                ? "hover:bg-yellow-100 hover:text-yellow-600 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-400"
                : "hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-900/20 dark:hover:text-gray-400"
            )}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          {/* Clear Chat Button */}
          <motion.button
            onClick={onClearChat}
            className="p-2 rounded-lg hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
            title="Clear Chat"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 size={18} />
          </motion.button>
        </div>
      </div>

      {/* Message Count */}
      <div className="mt-2 text-xs text-muted-foreground">
        {messageCount} message{messageCount !== 1 ? 's' : ''} in chat
      </div>
    </motion.header>

    {/* Study Tracker Modal */}
    {isStudyTrackerOpen && (
      <StudyTracker onClose={() => setIsStudyTrackerOpen(false)} />
    )}

    {/* Export Data Modal */}
    {isExportOpen && (
      <ExportData onClose={() => setIsExportOpen(false)} />
    )}
    </>
  );
}