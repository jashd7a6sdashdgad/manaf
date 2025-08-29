'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FileUpload } from './FileUpload';
import { CourseSelector } from './CourseSelector';
import { FileAttachment, Course } from '@/types/chat';
import { generateSmartQuestions } from '@/lib/smartQuestions';

import { Message } from '@/types/chat';

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: FileAttachment[], course?: Course) => void;
  isLoading: boolean;
  messages: Message[];
}


export function ChatInput({ onSendMessage, isLoading, messages }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || attachments.length > 0) && !isLoading) {
      onSendMessage(
        message, 
        attachments.length > 0 ? attachments : undefined,
        selectedCourse || undefined
      );
      setMessage('');
      setAttachments([]);
      setSelectedCourse(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleAddAttachment = (attachment: FileAttachment) => {
    setAttachments(prev => [...prev, attachment]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const toggleListening = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const handleSmartQuestion = () => {
    const questions = generateSmartQuestions(messages, 1);
    const question = questions[0];
    if (question) {
      setMessage(question);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };


  return (
    <motion.div
      className="glass rounded-2xl p-4 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Course and File Upload */}
        <div className="flex flex-wrap gap-2">
          <CourseSelector
            selectedCourse={selectedCourse}
            onCourseChange={setSelectedCourse}
            disabled={isLoading}
          />
          <FileUpload
            attachments={attachments}
            onAddAttachment={handleAddAttachment}
            onRemoveAttachment={handleRemoveAttachment}
            disabled={isLoading}
          />
        </div>
        
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift + Enter for new line)"
            className={cn(
              "w-full resize-none rounded-xl border border-border bg-background/50 px-4 py-3 pr-24 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200",
              "min-h-[44px] max-h-[120px] scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
            )}
            disabled={isLoading}
            rows={1}
          />
          
          <div className="absolute right-2 top-2 flex items-center gap-1">
            <motion.button
              type="button"
              onClick={handleSmartQuestion}
              className="p-2 rounded-lg hover:bg-yellow-100 hover:text-yellow-600 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-400 transition-colors"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Get a smart question"
            >
              <Lightbulb size={16} />
            </motion.button>
            
            {recognitionRef.current && (
              <motion.button
                type="button"
                onClick={toggleListening}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isListening
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </motion.button>
            )}
            
            <motion.button
              type="submit"
              disabled={(!message.trim() && attachments.length === 0) || isLoading}
              className={cn(
                "p-2 rounded-lg transition-colors",
                (message.trim() || attachments.length > 0) && !isLoading
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
              whileHover={(message.trim() || attachments.length > 0) && !isLoading ? { scale: 1.05 } : {}}
              whileTap={(message.trim() || attachments.length > 0) && !isLoading ? { scale: 0.95 } : {}}
              title="Send message"
            >
              <Send size={16} />
            </motion.button>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-xs">
          <div className="text-muted-foreground">
            {isListening ? (
              <motion.span
                className="flex items-center gap-1 text-red-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                Listening...
              </motion.span>
            ) : (
              "Press Enter to send, Shift + Enter for new line"
            )}
          </div>
        </div>
      </form>
    </motion.div>
  );
}