'use client';

import { Message } from '@/types/chat';

interface QuestionTemplate {
  type: 'analytical' | 'practical' | 'creative' | 'critical' | 'exploratory';
  pattern: string;
  keywords: string[];
  subjects: string[];
}

// Question templates for different types of intelligent questions
const QUESTION_TEMPLATES: QuestionTemplate[] = [
  // Analytical questions
  {
    type: 'analytical',
    pattern: "How would you analyze the relationship between {subject1} and {subject2} in the context of {topic}?",
    keywords: ['relationship', 'analysis', 'compare', 'contrast', 'correlation'],
    subjects: ['concepts', 'theories', 'methods', 'approaches', 'perspectives']
  },
  {
    type: 'analytical',
    pattern: "What are the underlying assumptions behind {topic}, and how do they influence our understanding?",
    keywords: ['assumptions', 'underlying', 'foundation', 'basis', 'premise'],
    subjects: ['theories', 'models', 'frameworks', 'concepts', 'ideas']
  },
  {
    type: 'analytical',
    pattern: "Can you break down {topic} into its fundamental components and explain how they interact?",
    keywords: ['components', 'break down', 'fundamental', 'interact', 'structure'],
    subjects: ['systems', 'processes', 'concepts', 'theories', 'models']
  },

  // Practical questions
  {
    type: 'practical',
    pattern: "How would you apply {concept} to solve a real-world problem in {field}?",
    keywords: ['apply', 'real-world', 'practical', 'implement', 'solve'],
    subjects: ['concepts', 'theories', 'methods', 'principles', 'strategies']
  },
  {
    type: 'practical',
    pattern: "What are the practical implications of {finding} for {application}?",
    keywords: ['implications', 'practical', 'application', 'impact', 'consequences'],
    subjects: ['research', 'discoveries', 'theories', 'concepts', 'findings']
  },
  {
    type: 'practical',
    pattern: "How would you design an experiment to test {hypothesis} in {context}?",
    keywords: ['experiment', 'test', 'design', 'methodology', 'investigate'],
    subjects: ['hypotheses', 'theories', 'assumptions', 'claims', 'ideas']
  },

  // Creative questions
  {
    type: 'creative',
    pattern: "What if we approached {problem} from a completely different angle, such as {perspective}?",
    keywords: ['different angle', 'perspective', 'creative', 'innovative', 'alternative'],
    subjects: ['problems', 'challenges', 'situations', 'scenarios', 'issues']
  },
  {
    type: 'creative',
    pattern: "How might {concept} evolve or transform in the next decade given {trend}?",
    keywords: ['evolve', 'transform', 'future', 'trend', 'development'],
    subjects: ['concepts', 'technologies', 'theories', 'fields', 'approaches']
  },
  {
    type: 'creative',
    pattern: "What unexpected connections can you find between {topic1} and {topic2}?",
    keywords: ['unexpected', 'connections', 'relationships', 'patterns', 'links'],
    subjects: ['topics', 'concepts', 'fields', 'ideas', 'theories']
  },

  // Critical thinking questions
  {
    type: 'critical',
    pattern: "What are the potential limitations or weaknesses in the current understanding of {topic}?",
    keywords: ['limitations', 'weaknesses', 'gaps', 'flaws', 'shortcomings'],
    subjects: ['theories', 'models', 'approaches', 'concepts', 'understandings']
  },
  {
    type: 'critical',
    pattern: "How might {bias} influence our interpretation of {evidence} in {field}?",
    keywords: ['bias', 'influence', 'interpretation', 'perspective', 'viewpoint'],
    subjects: ['evidence', 'data', 'findings', 'research', 'observations']
  },
  {
    type: 'critical',
    pattern: "What alternative explanations could account for {phenomenon} besides {current_theory}?",
    keywords: ['alternative', 'explanations', 'theories', 'hypotheses', 'possibilities'],
    subjects: ['phenomena', 'observations', 'results', 'findings', 'events']
  },

  // Exploratory questions
  {
    type: 'exploratory',
    pattern: "What aspects of {topic} remain unexplored or poorly understood?",
    keywords: ['unexplored', 'poorly understood', 'gaps', 'unknown', 'mysterious'],
    subjects: ['topics', 'fields', 'phenomena', 'concepts', 'areas']
  },
  {
    type: 'exploratory',
    pattern: "How does {topic} connect to broader themes in {field} or {discipline}?",
    keywords: ['broader', 'themes', 'connect', 'relate', 'integrate'],
    subjects: ['topics', 'concepts', 'ideas', 'theories', 'findings']
  },
  {
    type: 'exploratory',
    pattern: "What new questions emerge when we consider {topic} from an interdisciplinary perspective?",
    keywords: ['interdisciplinary', 'perspective', 'new questions', 'emerge', 'combine'],
    subjects: ['topics', 'fields', 'disciplines', 'approaches', 'methods']
  }
];

// Extract key topics and concepts from conversation
function extractTopics(messages: Message[]): string[] {
  const topics = new Set<string>();
  
  messages.forEach(message => {
    if (message.content) {
      // Extract course-related topics
      if (message.course) {
        topics.add(message.course.name);
        topics.add(message.course.code);
      }
      
      // Extract common academic terms
      const academicTerms = [
        'theory', 'concept', 'method', 'approach', 'analysis', 'research',
        'study', 'experiment', 'hypothesis', 'conclusion', 'evidence',
        'data', 'results', 'findings', 'implications', 'applications'
      ];
      
      academicTerms.forEach(term => {
        if (message.content.toLowerCase().includes(term)) {
          topics.add(term);
        }
      });
    }
  });
  
  return Array.from(topics);
}

// Generate context-aware questions
export function generateSmartQuestions(messages: Message[], count: number = 3): string[] {
  if (messages.length === 0) {
    return [
      "What academic topic would you like to explore today?",
      "What subject are you currently studying or researching?",
      "What questions do you have about your coursework?"
    ];
  }

  const topics = extractTopics(messages);
  const recentContent = messages.slice(-3).map(m => m.content).join(' ').toLowerCase();
  
  // Filter templates based on conversation context
  const relevantTemplates = QUESTION_TEMPLATES.filter(template => {
    // Check if template keywords match recent conversation
    return template.keywords.some(keyword => 
      recentContent.includes(keyword) || 
      topics.some(topic => topic.toLowerCase().includes(keyword))
    );
  });

  // If no relevant templates, use general ones
  const templatesToUse = relevantTemplates.length > 0 ? relevantTemplates : QUESTION_TEMPLATES;
  
  const questions: string[] = [];
  const usedTypes = new Set<string>();
  
  // Generate diverse questions
  for (let i = 0; i < count && i < templatesToUse.length; i++) {
    let attempts = 0;
    let question = '';
    
    while (attempts < 10 && (!question || questions.includes(question))) {
      const template = templatesToUse[Math.floor(Math.random() * templatesToUse.length)];
      
      // Ensure diversity in question types
      if (usedTypes.has(template.type) && usedTypes.size < count) {
        attempts++;
        continue;
      }
      
      question = template.pattern
        .replace('{topic}', topics[Math.floor(Math.random() * topics.length)] || 'this subject')
        .replace('{subject1}', template.subjects[Math.floor(Math.random() * template.subjects.length)])
        .replace('{subject2}', template.subjects[Math.floor(Math.random() * template.subjects.length)])
        .replace('{concept}', topics[Math.floor(Math.random() * topics.length)] || 'this concept')
        .replace('{field}', topics[Math.floor(Math.random() * topics.length)] || 'this field')
        .replace('{finding}', topics[Math.floor(Math.random() * topics.length)] || 'this finding')
        .replace('{application}', topics[Math.floor(Math.random() * topics.length)] || 'practical applications')
        .replace('{hypothesis}', topics[Math.floor(Math.random() * topics.length)] || 'this hypothesis')
        .replace('{context}', topics[Math.floor(Math.random() * topics.length)] || 'this context')
        .replace('{problem}', topics[Math.floor(Math.random() * topics.length)] || 'this problem')
        .replace('{perspective}', template.subjects[Math.floor(Math.random() * template.subjects.length)])
        .replace('{trend}', topics[Math.floor(Math.random() * topics.length)] || 'current trends')
        .replace('{topic1}', topics[Math.floor(Math.random() * topics.length)] || 'this topic')
        .replace('{topic2}', topics[Math.floor(Math.random() * topics.length)] || 'another topic')
        .replace('{phenomenon}', topics[Math.floor(Math.random() * topics.length)] || 'this phenomenon')
        .replace('{current_theory}', topics[Math.floor(Math.random() * topics.length)] || 'current theories')
        .replace('{discipline}', topics[Math.floor(Math.random() * topics.length)] || 'this discipline')
        .replace('{bias}', 'confirmation bias, selection bias, or other cognitive biases')
        .replace('{evidence}', 'the evidence or data');
      
      attempts++;
    }
    
    if (question && !questions.includes(question)) {
      questions.push(question);
      usedTypes.add(template.type);
    }
  }
  
  // Fill remaining slots with general questions if needed
  while (questions.length < count) {
    const generalQuestions = [
      "What aspects of this topic would you like to explore further?",
      "How does this relate to your current studies or research?",
      "What practical applications can you think of for this concept?",
      "What questions remain unanswered about this topic?",
      "How might this knowledge be applied in different contexts?"
    ];
    
    const randomQuestion = generalQuestions[Math.floor(Math.random() * generalQuestions.length)];
    if (!questions.includes(randomQuestion)) {
      questions.push(randomQuestion);
    }
  }
  
  return questions.slice(0, count);
}

// Generate a single smart question
export function generateSmartQuestion(messages: Message[]): string {
  const questions = generateSmartQuestions(messages, 1);
  return questions[0] || "What would you like to explore next?";
}
