'use client';

import { Message } from '@/types/chat';
import { User, Bot, FileText, Image as ImageIcon, FileUp, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CourseBadge } from './CourseSelector';
import { YouTubePreview } from './YouTubePreview';
import { extractYouTubeUrls, getYouTubeVideoInfo } from '@/lib/youtubeUtils';
import Image from 'next/image';
import { useTTS } from '@/lib/ttsUtils';
import { useState, useEffect } from 'react';

interface ChatMessageProps {
  message: Message;
  isVoiceEnabled?: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return ImageIcon;
  if (type.includes('pdf') || type.includes('document') || type.includes('text')) return FileText;
  return FileUp;
};

const isImageFile = (type: string): boolean => {
  return type.startsWith('image/');
};

export function ChatMessage({ message, isVoiceEnabled = false }: ChatMessageProps) {
  const isUser = message.sender === 'user';
  const formattedTime = message.timestamp.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Voice controls for bot messages
  const { speak, stop, pause, resume, isSpeaking, isPaused, isSupported } = useTTS();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPausedState, setIsPausedState] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Extract YouTube URLs from message content
  const youtubeUrls = extractYouTubeUrls(message.content);
  const youtubeVideos = youtubeUrls.map(url => getYouTubeVideoInfo(url)).filter(Boolean);

  // Voice control functions
  const handlePlayVoice = async () => {
    if (!isSupported() || !message.content) return;
    
    try {
      setIsPlaying(true);
      setIsPausedState(false);
      await speak(message.content);
    } catch (error) {
      console.error('Error playing voice:', error);
    } finally {
      setIsPlaying(false);
      setIsPausedState(false);
    }
  };

  const handlePauseVoice = () => {
    pause();
    setIsPausedState(true);
  };

  const handleResumeVoice = () => {
    resume();
    setIsPausedState(false);
  };

  const handleStopVoice = () => {
    stop();
    setIsPlaying(false);
    setIsPausedState(false);
  };

  // Auto-play voice if enabled and this is a bot message
  useEffect(() => {
    if (isClient && isVoiceEnabled && !isUser && message.content && !isPlaying) {
      handlePlayVoice();
    }
  }, [isClient, isVoiceEnabled, message.id]);

  // Update playing state based on TTS status
  useEffect(() => {
    if (!isClient) return;
    
    const checkStatus = () => {
      setIsPlaying(isSpeaking());
      setIsPausedState(isPaused());
    };

    const interval = setInterval(checkStatus, 100);
    return () => clearInterval(interval);
  }, [isClient, isSpeaking, isPaused]);

  return (
    <motion.div
      className={cn(
        "flex items-start gap-3 group",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
          isUser
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
            : "bg-secondary text-secondary-foreground border border-border"
        )}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div
        className={cn(
          "flex flex-col max-w-[80%] sm:max-w-[70%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 group-hover:shadow-md",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-background border border-border rounded-bl-md"
          )}
        >
          {/* Course Badge */}
          {message.course && (
            <div className="mb-2">
              <CourseBadge course={message.course} size="sm" />
            </div>
          )}
          
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words flex-1">
              {message.content}
            </p>
            
            {/* Voice controls for bot messages */}
            {!isUser && isClient && isSupported() && (
              <div className="flex items-center gap-1 flex-shrink-0">
                {isPlaying ? (
                  <>
                    {isPausedState ? (
                      <motion.button
                        onClick={handleResumeVoice}
                        className="p-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                        title="Resume voice"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Play size={14} />
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={handlePauseVoice}
                        className="p-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                        title="Pause voice"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Pause size={14} />
                      </motion.button>
                    )}
                    <motion.button
                      onClick={handleStopVoice}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="Stop voice"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <VolumeX size={14} />
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    onClick={handlePlayVoice}
                    className="p-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                    title="Play voice"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Volume2 size={14} />
                  </motion.button>
                )}
              </div>
            )}
          </div>

          {/* YouTube Previews */}
          {youtubeVideos.length > 0 && (
            <div className="mt-3 space-y-3">
              {youtubeVideos.map((video, index) => (
                <YouTubePreview
                  key={`${video!.videoId}-${index}`}
                  videoInfo={video!}
                  className="max-w-sm"
                />
              ))}
            </div>
          )}
          
          {/* File Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.attachments.map((attachment) => {
                const IconComponent = getFileIcon(attachment.type);
                
                return (
                  <motion.div
                    key={attachment.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-2 rounded-lg border border-border/20 bg-background/50"
                  >
                    <div className="flex items-center space-x-3">
                      {isImageFile(attachment.type) && attachment.base64 ? (
                        <div className="relative">
                          <Image
                            src={attachment.base64}
                            alt={attachment.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded border"
                          />
                        </div>
                      ) : (
                        <div className="p-2 rounded bg-primary/10 text-primary">
                          <IconComponent size={16} />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.size)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
        
        <div
          className={cn(
            "text-xs text-muted-foreground mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            isUser ? "text-right" : "text-left"
          )}
        >
          {formattedTime}
        </div>
      </div>
    </motion.div>
  );
}