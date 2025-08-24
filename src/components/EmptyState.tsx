'use client';

import { MessageSquare, BookOpen, Brain, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

export function EmptyState() {
  const suggestions = [
    {
      icon: BookOpen,
      text: "Help me understand this concept",
      example: "Explain quantum physics in simple terms"
    },
    {
      icon: Brain,
      text: "Create a study plan",
      example: "Make a study schedule for my finals"
    },
    {
      icon: Lightbulb,
      text: "Solve a problem",
      example: "Help me with this math problem"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md mx-auto"
      >
        <div className="mb-6">
          <motion.div
            className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <MessageSquare size={32} />
          </motion.div>
          
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Welcome to Your Study Assistant
          </h2>
          
          <p className="text-muted-foreground">
            I&apos;m here to help with your studies, assignments, and academic questions. 
            Start a conversation below!
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground mb-3">
            Try asking me:
          </p>
          
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-left hover:bg-muted/80 transition-colors cursor-default"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <suggestion.icon size={18} className="text-primary flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-foreground">
                  {suggestion.text}
                </div>
                <div className="text-xs text-muted-foreground">
                  &ldquo;{suggestion.example}&rdquo;
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}