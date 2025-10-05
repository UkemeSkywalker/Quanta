import { ResearchQuery, ValidationError, FormValidationResult } from '../types/models';

export const validateResearchQuery = (query: Partial<ResearchQuery>): FormValidationResult => {
  const errors: ValidationError[] = [];

  // Validate query field
  if (!query.query) {
    errors.push({ field: 'query', message: 'Research query is required' });
  } else if (query.query.trim().length < 10) {
    errors.push({ field: 'query', message: 'Query must be at least 10 characters long' });
  } else if (query.query.trim().length > 1000) {
    errors.push({ field: 'query', message: 'Query must be less than 1000 characters' });
  } else if (!query.query.trim()) {
    errors.push({ field: 'query', message: 'Query cannot be empty or only whitespace' });
  } else {
    // Check for research-oriented language
    const researchIndicators = ['analyze', 'study', 'research', 'investigate', 'examine', 'explore', 'compare', 'evaluate', 'assess', 'what', 'how', 'why', 'when', 'where'];
    if (!researchIndicators.some(indicator => query.query!.toLowerCase().includes(indicator))) {
      errors.push({ field: 'query', message: 'Query should contain research-oriented language (e.g., analyze, study, investigate, etc.)' });
    }
  }

  // Validate user_id field
  if (!query.user_id) {
    errors.push({ field: 'user_id', message: 'User ID is required' });
  } else if (!query.user_id.trim()) {
    errors.push({ field: 'user_id', message: 'User ID cannot be empty' });
  }

  // Validate priority field
  if (query.priority !== undefined) {
    if (query.priority < 1 || query.priority > 5) {
      errors.push({ field: 'priority', message: 'Priority must be between 1 and 5' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getFieldError = (errors: ValidationError[], fieldName: string): string | undefined => {
  const error = errors.find(err => err.field === fieldName);
  return error?.message;
};