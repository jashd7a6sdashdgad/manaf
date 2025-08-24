export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  base64?: string;
  url?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  color: string;
  credits: number;
  professor?: string;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLoading?: boolean;
  attachments?: FileAttachment[];
  course?: Course;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: Date;
}

export interface StudySession {
  id: string;
  startTime: Date;
  endTime?: Date;
  course?: Course;
  messageCount: number;
  isActive: boolean;
}

export interface StudyStats {
  totalSessions: number;
  totalTime: number;
  averageSessionTime: number;
  mostStudiedCourse: string;
  todayTime: number;
  weekTime: number;
  gpa?: number;
}