'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, FileText, FileDown, Hash, X, Calendar, BookOpen, Clock, MessageSquare } from 'lucide-react';
import { Message } from '@/types/chat';
import { 
  generateExportData, 
  exportToJSON, 
  exportToText, 
  exportToMarkdown, 
  downloadFile, 
  shareContent,
  ExportData as ExportDataType
} from '@/lib/exportUtils';
import { cn } from '@/lib/utils';

interface ExportDataProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
}

export function ExportData({ isOpen, onClose, messages }: ExportDataProps) {
  const [exportData, setExportData] = useState<ExportDataType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'text' | 'markdown'>('markdown');

  const handleGenerateExport = async () => {
    setIsGenerating(true);
    try {
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = generateExportData(messages);
      setExportData(data);
    } catch (error) {
      console.error('Failed to generate export:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!exportData) return;

    const timestamp = new Date().toISOString().split('T')[0];
    let content: string;
    let filename: string;
    let mimeType: string;

    switch (selectedFormat) {
      case 'json':
        content = exportToJSON(exportData);
        filename = `university-chat-export-${timestamp}.json`;
        mimeType = 'application/json';
        break;
      case 'text':
        content = exportToText(exportData);
        filename = `university-chat-export-${timestamp}.txt`;
        mimeType = 'text/plain';
        break;
      case 'markdown':
        content = exportToMarkdown(exportData);
        filename = `university-chat-export-${timestamp}.md`;
        mimeType = 'text/markdown';
        break;
    }

    downloadFile(content, filename, mimeType);
  };

  const handleShare = async () => {
    if (!exportData) return;

    let content: string;
    let title: string;

    switch (selectedFormat) {
      case 'json':
        content = exportToJSON(exportData);
        title = 'University Chat Export (JSON)';
        break;
      case 'text':
        content = exportToText(exportData);
        title = 'University Chat Export (Text)';
        break;
      case 'markdown':
        content = exportToMarkdown(exportData);
        title = 'University Chat Export (Markdown)';
        break;
    }

    const shared = await shareContent(content, title);
    if (!shared) {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(content);
        alert('Export copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        alert('Could not share or copy export. Please try downloading instead.');
      }
    }
  };

  const formatOptions = [
    {
      key: 'markdown' as const,
      label: 'Markdown',
      description: 'Structured format with formatting',
      icon: Hash,
      extension: '.md'
    },
    {
      key: 'text' as const,
      label: 'Plain Text',
      description: 'Simple readable format',
      icon: FileText,
      extension: '.txt'
    },
    {
      key: 'json' as const,
      label: 'JSON',
      description: 'Machine-readable data format',
      icon: FileDown,
      extension: '.json'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-4 sm:inset-8 md:inset-16 lg:inset-24 z-50 rounded-2xl border border-border bg-background/95 backdrop-blur-md shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Export Academic Data</h2>
                  <p className="text-sm text-muted-foreground">
                    Export your conversations, study sessions, and academic progress
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {!exportData ? (
                <div className="text-center space-y-6">
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Ready to Export</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Generate a comprehensive export of your university chat data including 
                        conversations, study sessions, course progress, and academic insights.
                      </p>
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={handleGenerateExport}
                    disabled={isGenerating}
                    className={cn(
                      "px-6 py-3 rounded-lg font-medium transition-colors",
                      isGenerating
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                    whileHover={!isGenerating ? { scale: 1.02 } : {}}
                    whileTap={!isGenerating ? { scale: 0.98 } : {}}
                  >
                    {isGenerating ? 'Generating Export...' : 'Generate Export'}
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Export Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-card border border-border">
                      <div className="flex items-center space-x-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">Messages</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {exportData.conversations.totalMessages}
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-card border border-border">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">Study Time</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {exportData.studySessions.totalStudyTime}
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-card border border-border">
                      <div className="flex items-center space-x-2 mb-2">
                        <BookOpen className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium">Sessions</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {exportData.studySessions.sessions.length}
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-card border border-border">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium">Files</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {exportData.metadata.totalFiles}
                      </div>
                    </div>
                  </div>

                  {/* Format Selection */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Export Format</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {formatOptions.map((format) => {
                        const Icon = format.icon;
                        const isSelected = selectedFormat === format.key;
                        
                        return (
                          <motion.button
                            key={format.key}
                            onClick={() => setSelectedFormat(format.key)}
                            className={cn(
                              "p-4 rounded-lg border text-left transition-all",
                              isSelected
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border hover:border-border/60 hover:bg-accent"
                            )}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center space-x-3">
                              <Icon className="w-5 h-5" />
                              <div>
                                <div className="font-medium">
                                  {format.label}
                                  <span className="text-xs text-muted-foreground ml-1">
                                    {format.extension}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format.description}
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      onClick={handleDownload}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Download size={18} />
                      <span>Download Export</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={handleShare}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Share2 size={18} />
                      <span>Share Export</span>
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}