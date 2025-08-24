'use client';

import { Message, StudySession, StudyStats, Course } from '@/types/chat';

export interface ExportData {
  conversations: {
    messages: Message[];
    totalMessages: number;
    dateRange: {
      start: string;
      end: string;
    };
    courseBreakdown: { [courseCode: string]: number };
  };
  studySessions: {
    sessions: StudySession[];
    stats: StudyStats;
    totalStudyTime: string;
    courseBreakdown: { [courseCode: string]: number };
  };
  metadata: {
    exportDate: string;
    exportType: string;
    totalFiles: number;
    appVersion: string;
  };
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

export const getStudySessions = (): StudySession[] => {
  try {
    const sessions = JSON.parse(localStorage.getItem('universityChatStudySessions') || '[]');
    return sessions.map((session: any) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: session.endTime ? new Date(session.endTime) : undefined,
    }));
  } catch (error) {
    console.warn('Could not load study sessions:', error);
    return [];
  }
};

export const getAllChatSessions = (): Message[] => {
  const allMessages: Message[] = [];
  
  // Get all chat session keys from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('chat-session-')) {
      try {
        const session = JSON.parse(localStorage.getItem(key) || '{}');
        if (session.messages) {
          const messages = session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          allMessages.push(...messages);
        }
      } catch (error) {
        console.warn(`Could not load session ${key}:`, error);
      }
    }
  }
  
  // Sort by timestamp
  return allMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

export const generateExportData = (messages: Message[]): ExportData => {
  const studySessions = getStudySessions();
  const allMessages = messages.length > 0 ? messages : getAllChatSessions();
  
  // Calculate conversation statistics
  const courseBreakdown: { [courseCode: string]: number } = {};
  let totalFiles = 0;
  
  allMessages.forEach(message => {
    if (message.course) {
      courseBreakdown[message.course.code] = (courseBreakdown[message.course.code] || 0) + 1;
    }
    if (message.attachments) {
      totalFiles += message.attachments.length;
    }
  });

  const dateRange = {
    start: allMessages.length > 0 ? allMessages[0].timestamp.toISOString() : new Date().toISOString(),
    end: allMessages.length > 0 ? allMessages[allMessages.length - 1].timestamp.toISOString() : new Date().toISOString()
  };

  // Calculate study session statistics
  const studySessionCourseBreakdown: { [courseCode: string]: number } = {};
  let totalStudyTime = 0;

  studySessions.forEach(session => {
    if (session.endTime && session.course) {
      const duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);
      totalStudyTime += duration;
      studySessionCourseBreakdown[session.course.code] = (studySessionCourseBreakdown[session.course.code] || 0) + duration;
    }
  });

  const studyStats: StudyStats = {
    totalSessions: studySessions.length,
    totalTime: totalStudyTime,
    averageSessionTime: studySessions.length > 0 ? Math.floor(totalStudyTime / studySessions.length) : 0,
    mostStudiedCourse: Object.keys(studySessionCourseBreakdown).reduce((a, b) => 
      studySessionCourseBreakdown[a] > studySessionCourseBreakdown[b] ? a : b, 'None'
    ),
    todayTime: 0, // Will be calculated separately if needed
    weekTime: 0   // Will be calculated separately if needed
  };

  return {
    conversations: {
      messages: allMessages,
      totalMessages: allMessages.length,
      dateRange,
      courseBreakdown
    },
    studySessions: {
      sessions: studySessions,
      stats: studyStats,
      totalStudyTime: formatDuration(totalStudyTime),
      courseBreakdown: studySessionCourseBreakdown
    },
    metadata: {
      exportDate: new Date().toISOString(),
      exportType: 'university-academic-export',
      totalFiles,
      appVersion: '1.0.0'
    }
  };
};

export const exportToJSON = (data: ExportData): string => {
  return JSON.stringify(data, null, 2);
};

export const exportToText = (data: ExportData): string => {
  let output = '';
  
  output += '=== UNIVERSITY CHAT ASSISTANT - ACADEMIC EXPORT ===\n\n';
  output += `Export Date: ${new Date(data.metadata.exportDate).toLocaleString()}\n`;
  output += `Total Messages: ${data.conversations.totalMessages}\n`;
  output += `Total Study Sessions: ${data.studySessions.sessions.length}\n`;
  output += `Total Study Time: ${data.studySessions.totalStudyTime}\n`;
  output += `Total Files Shared: ${data.metadata.totalFiles}\n\n`;

  // Course breakdown
  if (Object.keys(data.conversations.courseBreakdown).length > 0) {
    output += '=== COURSE MESSAGE BREAKDOWN ===\n';
    Object.entries(data.conversations.courseBreakdown).forEach(([course, count]) => {
      output += `${course}: ${count} messages\n`;
    });
    output += '\n';
  }

  // Study session breakdown
  if (Object.keys(data.studySessions.courseBreakdown).length > 0) {
    output += '=== COURSE STUDY TIME BREAKDOWN ===\n';
    Object.entries(data.studySessions.courseBreakdown).forEach(([course, time]) => {
      output += `${course}: ${formatDuration(time)}\n`;
    });
    output += '\n';
  }

  // Recent study sessions
  if (data.studySessions.sessions.length > 0) {
    output += '=== RECENT STUDY SESSIONS ===\n';
    data.studySessions.sessions.slice(-10).forEach(session => {
      const duration = session.endTime 
        ? formatDuration(Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000))
        : 'In Progress';
      output += `${session.startTime.toLocaleString()} - ${session.course?.name || 'General'} (${duration})\n`;
    });
    output += '\n';
  }

  // Conversation history
  output += '=== CONVERSATION HISTORY ===\n\n';
  data.conversations.messages.forEach(message => {
    const timestamp = message.timestamp.toLocaleString();
    const sender = message.sender === 'user' ? 'You' : 'Assistant';
    const course = message.course ? ` [${message.course.code}]` : '';
    const attachments = message.attachments && message.attachments.length > 0 
      ? ` (📎 ${message.attachments.length} file${message.attachments.length > 1 ? 's' : ''})`
      : '';
    
    output += `[${timestamp}]${course} ${sender}${attachments}:\n`;
    output += `${message.content}\n\n`;
  });

  return output;
};

export const exportToMarkdown = (data: ExportData): string => {
  let output = '';
  
  output += '# University Chat Assistant - Academic Export\n\n';
  output += `**Export Date:** ${new Date(data.metadata.exportDate).toLocaleString()}\n\n`;
  
  // Summary statistics
  output += '## 📊 Summary Statistics\n\n';
  output += `- **Total Messages:** ${data.conversations.totalMessages}\n`;
  output += `- **Total Study Sessions:** ${data.studySessions.sessions.length}\n`;
  output += `- **Total Study Time:** ${data.studySessions.totalStudyTime}\n`;
  output += `- **Total Files Shared:** ${data.metadata.totalFiles}\n`;
  output += `- **Date Range:** ${new Date(data.conversations.dateRange.start).toLocaleDateString()} - ${new Date(data.conversations.dateRange.end).toLocaleDateString()}\n\n`;

  // Course breakdown
  if (Object.keys(data.conversations.courseBreakdown).length > 0) {
    output += '## 📚 Course Message Breakdown\n\n';
    Object.entries(data.conversations.courseBreakdown).forEach(([course, count]) => {
      output += `- **${course}:** ${count} messages\n`;
    });
    output += '\n';
  }

  // Study session breakdown
  if (Object.keys(data.studySessions.courseBreakdown).length > 0) {
    output += '## ⏱️ Course Study Time Breakdown\n\n';
    Object.entries(data.studySessions.courseBreakdown).forEach(([course, time]) => {
      output += `- **${course}:** ${formatDuration(time)}\n`;
    });
    output += '\n';
  }

  // Study sessions
  if (data.studySessions.sessions.length > 0) {
    output += '## 📈 Recent Study Sessions\n\n';
    data.studySessions.sessions.slice(-10).forEach(session => {
      const duration = session.endTime 
        ? formatDuration(Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000))
        : 'In Progress';
      output += `- **${session.startTime.toLocaleString()}** - ${session.course?.name || 'General'} (${duration})\n`;
    });
    output += '\n';
  }

  // Conversation history
  output += '## 💬 Conversation History\n\n';
  data.conversations.messages.forEach(message => {
    const timestamp = message.timestamp.toLocaleString();
    const sender = message.sender === 'user' ? '👤 **You**' : '🤖 **Assistant**';
    const course = message.course ? ` \`${message.course.code}\`` : '';
    const attachments = message.attachments && message.attachments.length > 0 
      ? ` 📎 *${message.attachments.length} file${message.attachments.length > 1 ? 's' : ''}*`
      : '';
    
    output += `### ${sender}${course} - *${timestamp}*${attachments}\n\n`;
    output += `${message.content}\n\n`;
    
    if (message.attachments && message.attachments.length > 0) {
      output += '**Attachments:**\n';
      message.attachments.forEach(attachment => {
        output += `- ${attachment.name} (${(attachment.size / 1024).toFixed(1)}KB)\n`;
      });
      output += '\n';
    }
  });

  return output;
};

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const shareContent = async (content: string, title: string): Promise<boolean> => {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: content
      });
      return true;
    } catch (error) {
      console.warn('Error sharing:', error);
      return false;
    }
  }
  return false;
};