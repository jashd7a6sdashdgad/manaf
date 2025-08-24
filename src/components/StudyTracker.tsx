'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, Square, BarChart3, X, Clock, Target, TrendingUp } from 'lucide-react';
import { StudySession, StudyStats, Course } from '@/types/chat';
import { CourseBadge } from './CourseSelector';
import { cn } from '@/lib/utils';

interface StudyTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  currentCourse?: Course;
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

export function StudyTracker({ isOpen, onClose, currentCourse }: StudyTrackerProps) {
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load study sessions from localStorage
  useEffect(() => {
    try {
      const sessions = JSON.parse(localStorage.getItem('universityChatStudySessions') || '[]');
      const parsedSessions = sessions.map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined,
      }));
      setStudySessions(parsedSessions);
    } catch (error) {
      console.warn('Could not load study sessions:', error);
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (currentSession) {
      timerRef.current = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentSession]);

  const startSession = (course?: Course) => {
    if (currentSession) {
      endSession();
    }

    const newSession: StudySession = {
      id: `session_${Date.now()}`,
      startTime: new Date(),
      course: course || currentCourse,
      messageCount: 0,
      isActive: true,
    };

    setCurrentSession(newSession);
    setSessionTimer(0);
  };

  const endSession = () => {
    if (!currentSession) return;

    const endedSession: StudySession = {
      ...currentSession,
      endTime: new Date(),
      isActive: false,
    };

    setStudySessions(prev => [...prev, endedSession]);
    setCurrentSession(null);
    setSessionTimer(0);

    // Save to localStorage
    try {
      const existingSessions = JSON.parse(localStorage.getItem('universityChatStudySessions') || '[]');
      const updatedSessions = [...existingSessions, endedSession];
      localStorage.setItem('universityChatStudySessions', JSON.stringify(updatedSessions));
    } catch (error) {
      console.warn('Could not save study session:', error);
    }
  };

  const calculateStats = (): StudyStats => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    let totalTime = 0;
    let todayTime = 0;
    let weekTime = 0;
    const courseTimes: { [key: string]: number } = {};

    studySessions.forEach(session => {
      if (session.endTime) {
        const duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);
        totalTime += duration;

        if (session.startTime >= todayStart) {
          todayTime += duration;
        }
        if (session.startTime >= weekStart) {
          weekTime += duration;
        }

        if (session.course) {
          courseTimes[session.course.code] = (courseTimes[session.course.code] || 0) + duration;
        }
      }
    });

    const mostStudiedCourse = Object.keys(courseTimes).reduce((a, b) => 
      courseTimes[a] > courseTimes[b] ? a : b, 'None'
    );

    return {
      totalSessions: studySessions.length,
      totalTime,
      averageSessionTime: studySessions.length > 0 ? Math.floor(totalTime / studySessions.length) : 0,
      mostStudiedCourse,
      todayTime,
      weekTime,
    };
  };

  const stats = calculateStats();

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
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-80 z-50 border-l border-border bg-background backdrop-blur-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center space-x-2">
                <Timer className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Study Tracker</h2>
              </div>
              
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Current Session */}
              {currentSession ? (
                <div className="p-4 rounded-xl border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full animate-pulse bg-green-500" />
                      <span className="font-semibold text-green-700 dark:text-green-400">
                        Active Session
                      </span>
                    </div>
                    <button
                      onClick={endSession}
                      className="px-3 py-1 rounded-lg text-sm bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-400 transition-colors"
                    >
                      End Session
                    </button>
                  </div>
                  
                  {currentSession.course && (
                    <div className="mb-3">
                      <CourseBadge course={currentSession.course} size="sm" />
                    </div>
                  )}
                  
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {formatDuration(sessionTimer)}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-500">
                    {currentSession.messageCount} messages
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-border bg-card">
                  <div className="text-center space-y-3">
                    <Target className="w-8 h-8 mx-auto text-muted-foreground" />
                    <div>
                      <p className="font-semibold">No Active Session</p>
                      <p className="text-sm text-muted-foreground">
                        Start studying to track your progress
                      </p>
                    </div>
                    <button
                      onClick={() => startSession()}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Play className="w-4 h-4 inline mr-2" />
                      Start Session
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-card border border-border">
                  <div className="text-lg font-bold">
                    {formatDuration(stats.todayTime)}
                  </div>
                  <div className="text-xs text-muted-foreground">Today</div>
                </div>
                
                <div className="p-3 rounded-lg bg-card border border-border">
                  <div className="text-lg font-bold">
                    {formatDuration(stats.weekTime)}
                  </div>
                  <div className="text-xs text-muted-foreground">This Week</div>
                </div>
                
                <div className="p-3 rounded-lg bg-card border border-border">
                  <div className="text-lg font-bold">
                    {stats.totalSessions}
                  </div>
                  <div className="text-xs text-muted-foreground">Sessions</div>
                </div>
                
                <div className="p-3 rounded-lg bg-card border border-border">
                  <div className="text-lg font-bold">
                    {formatDuration(stats.averageSessionTime)}
                  </div>
                  <div className="text-xs text-muted-foreground">Average</div>
                </div>
              </div>

              {/* Most Studied Course */}
              {stats.mostStudiedCourse !== 'None' && (
                <div className="p-3 rounded-lg bg-card border border-border">
                  <div className="text-sm font-medium flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span>Most Studied: {stats.mostStudiedCourse}</span>
                  </div>
                </div>
              )}

              {/* Recent Sessions */}
              {studySessions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Recent Sessions</span>
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {studySessions.slice(-5).reverse().map((session) => (
                      <div
                        key={session.id}
                        className="p-3 rounded-lg bg-card border border-border text-sm"
                      >
                        {session.course && (
                          <div className="mb-1">
                            <CourseBadge course={session.course} size="sm" />
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {session.endTime ? formatDuration(
                              Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000)
                            ) : 'In Progress'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {session.startTime.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
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