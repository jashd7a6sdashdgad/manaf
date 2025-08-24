'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, FileText, Image as ImageIcon, FileUp, X } from 'lucide-react';
import { FileAttachment } from '@/types/chat';
import Image from 'next/image';

interface FileUploadProps {
  attachments: FileAttachment[];
  onAddAttachment: (attachment: FileAttachment) => void;
  onRemoveAttachment: (id: string) => void;
  disabled?: boolean;
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

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export function FileUpload({ attachments, onAddAttachment, onRemoveAttachment, disabled }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        continue;
      }
      
      try {
        const base64 = await convertFileToBase64(file);
        
        const attachment: FileAttachment = {
          id: `file_${Date.now()}_${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          base64
        };
        
        onAddAttachment(attachment);
      } catch (error) {
        console.error('Error processing file:', error);
        alert(`Error processing file "${file.name}"`);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!disabled && e.dataTransfer.files) {
      await handleFileSelect(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-3">
      {/* File Upload Button */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt,.rtf,.ppt,.pptx,.xls,.xlsx"
          onChange={(e) => {
            if (e.target.files) {
              handleFileSelect(e.target.files);
              e.target.value = '';
            }
          }}
          className="hidden"
        />
        
        <motion.button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/20 hover:border-border/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Paperclip size={16} />
          <span className="text-sm">Attach Files</span>
        </motion.button>
      </div>

      {/* Drag & Drop Zone */}
      {isDragOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-4 border-2 border-dashed border-primary rounded-2xl flex items-center justify-center z-10 bg-background/80 backdrop-blur-sm"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <FileUp className="w-12 h-12 mx-auto mb-3 text-primary" />
            <p className="text-lg font-semibold">Drop files here to upload</p>
            <p className="text-sm text-muted-foreground">Supports documents, images, presentations (max 10MB)</p>
          </div>
        </motion.div>
      )}

      {/* Attachment Previews */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            {attachments.map((attachment) => {
              const IconComponent = getFileIcon(attachment.type);
              
              return (
                <motion.div
                  key={attachment.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group rounded-lg border border-border/20 p-3 bg-card"
                >
                  <button
                    onClick={() => onRemoveAttachment(attachment.id)}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                  
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
                        <IconComponent size={20} />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global drag handlers */}
      <div
        className="fixed inset-0 pointer-events-none"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />
    </div>
  );
}