'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, ExternalLink } from 'lucide-react';
import { YouTubeVideoInfo } from '@/lib/youtubeUtils';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface YouTubePreviewProps {
  videoInfo: YouTubeVideoInfo;
  className?: string;
}

export function YouTubePreview({ videoInfo, className }: YouTubePreviewProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    window.open(videoInfo.videoUrl, '_blank', 'noopener,noreferrer');
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <motion.div
      className={cn(
        "relative group cursor-pointer rounded-xl overflow-hidden bg-background border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300",
        className
      )}
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden">
        {!imageError ? (
          <Image
            src={videoInfo.thumbnailUrl}
            alt="YouTube video thumbnail"
            width={320}
            height={180}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
            <div className="text-white text-center">
              <Play size={32} className="mx-auto mb-2" />
              <p className="text-sm font-medium">YouTube Video</p>
            </div>
          </div>
        )}

        {/* Play Button Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/30 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play size={24} fill="currentColor" />
          </motion.div>
        </motion.div>

        {/* YouTube Badge */}
        <div className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-md font-semibold flex items-center gap-1">
          <Play size={10} fill="currentColor" />
          YouTube
        </div>
      </div>

      {/* Video Info */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground mb-1 truncate">
              YouTube Video
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Click to watch on YouTube
            </p>
          </div>
          
          {/* External Link Icon */}
          <motion.div
            className="ml-3 text-muted-foreground"
            animate={{ rotate: isHovered ? 15 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ExternalLink size={16} />
          </motion.div>
        </div>
      </div>

      {/* Hover Effect Border */}
      <motion.div
        className="absolute inset-0 border-2 border-red-500/50 rounded-xl pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
}