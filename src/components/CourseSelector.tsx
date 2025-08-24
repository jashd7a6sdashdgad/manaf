'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen, X } from 'lucide-react';
import { Course } from '@/types/chat';
import { cn } from '@/lib/utils';

interface CourseSelectorProps {
  selectedCourse: Course | null;
  onCourseChange: (course: Course | null) => void;
  disabled?: boolean;
}

// Predefined university courses
const UNIVERSITY_COURSES: Course[] = [
  { id: 'cs101', name: 'Introduction to Computer Science', code: 'CS 101', color: 'blue', credits: 3, professor: 'Dr. Smith' },
  { id: 'math201', name: 'Calculus II', code: 'MATH 201', color: 'green', credits: 4, professor: 'Dr. Johnson' },
  { id: 'eng102', name: 'English Composition', code: 'ENG 102', color: 'purple', credits: 3, professor: 'Prof. Wilson' },
  { id: 'hist101', name: 'World History', code: 'HIST 101', color: 'amber', credits: 3, professor: 'Dr. Brown' },
  { id: 'bio201', name: 'General Biology', code: 'BIO 201', color: 'emerald', credits: 4, professor: 'Dr. Davis' },
  { id: 'chem101', name: 'General Chemistry', code: 'CHEM 101', color: 'red', credits: 4, professor: 'Prof. Lee' },
  { id: 'phys101', name: 'Physics I', code: 'PHYS 101', color: 'indigo', credits: 4, professor: 'Dr. Garcia' },
  { id: 'psyc101', name: 'Introduction to Psychology', code: 'PSYC 101', color: 'pink', credits: 3, professor: 'Dr. Martinez' },
  { id: 'econ101', name: 'Microeconomics', code: 'ECON 101', color: 'orange', credits: 3, professor: 'Prof. Taylor' },
  { id: 'art110', name: 'Art Appreciation', code: 'ART 110', color: 'violet', credits: 2, professor: 'Dr. Anderson' },
];

const getCourseColor = (colorName: string) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-100 border-blue-200',
    green: 'text-green-600 bg-green-100 border-green-200',
    purple: 'text-purple-600 bg-purple-100 border-purple-200',
    amber: 'text-amber-600 bg-amber-100 border-amber-200',
    emerald: 'text-emerald-600 bg-emerald-100 border-emerald-200',
    red: 'text-red-600 bg-red-100 border-red-200',
    indigo: 'text-indigo-600 bg-indigo-100 border-indigo-200',
    pink: 'text-pink-600 bg-pink-100 border-pink-200',
    orange: 'text-orange-600 bg-orange-100 border-orange-200',
    violet: 'text-violet-600 bg-violet-100 border-violet-200',
  };
  return colors[colorName as keyof typeof colors] || colors.blue;
};

export function CourseSelector({ selectedCourse, onCourseChange, disabled }: CourseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg border border-border/20 hover:border-border/40 transition-colors",
          selectedCourse ? getCourseColor(selectedCourse.color) : "bg-background text-muted-foreground",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        {selectedCourse ? (
          <>
            <BookOpen size={16} />
            <div className="text-left">
              <div className="text-sm font-medium">{selectedCourse.code}</div>
              <div className="text-xs opacity-75 truncate max-w-32">{selectedCourse.name}</div>
            </div>
          </>
        ) : (
          <>
            <BookOpen size={16} />
            <span className="text-sm">Select Course</span>
          </>
        )}
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform",
          isOpen && "rotate-180"
        )} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 w-80 rounded-xl border border-border bg-background shadow-lg z-20 max-h-80 overflow-y-auto"
            >
              <div className="p-2 space-y-1">
                {/* Clear Selection */}
                <button
                  onClick={() => {
                    onCourseChange(null);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors flex items-center space-x-2"
                >
                  <X size={16} />
                  <span className="text-sm">No Course</span>
                </button>
                
                <div className="border-t border-border my-1" />
                
                {/* Course Options */}
                {UNIVERSITY_COURSES.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => {
                      onCourseChange(course);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between",
                      selectedCourse?.id === course.id
                        ? getCourseColor(course.color)
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <BookOpen size={16} />
                      <div>
                        <div className="text-sm font-medium">{course.code}</div>
                        <div className="text-xs text-muted-foreground">{course.name}</div>
                        {course.professor && (
                          <div className="text-xs text-muted-foreground">{course.professor}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {course.credits} credits
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Course Badge Component
export function CourseBadge({ course, size = 'md' }: { course: Course; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  
  return (
    <div className={cn(
      "inline-flex items-center space-x-1.5 rounded-full font-medium border",
      sizeClasses,
      getCourseColor(course.color)
    )}>
      <BookOpen className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      <span>{course.code}</span>
    </div>
  );
}