'use client';

import { useState } from 'react';
import { ResearchQuery, ValidationError } from '../types/models';
import { validateResearchQuery, getFieldError } from '../utils/validation';
import LoadingSpinner from './LoadingSpinner';

interface ResearchQueryFormProps {
  onSubmit: (query: ResearchQuery) => Promise<void>;
  isSubmitting: boolean;
}

export default function ResearchQueryForm({ onSubmit, isSubmitting }: ResearchQueryFormProps) {
  const [formData, setFormData] = useState<Partial<ResearchQuery>>({
    query: '',
    user_id: 'demo_user',
    priority: 1
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleInputChange = (field: keyof ResearchQuery, value: string | number) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    
    // Real-time validation for touched fields
    if (touched[field]) {
      const validation = validateResearchQuery(updatedData);
      setErrors(validation.errors);
    }
  };

  const handleBlur = (field: keyof ResearchQuery) => {
    setTouched({ ...touched, [field]: true });
    const validation = validateResearchQuery(formData);
    setErrors(validation.errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      query: true,
      user_id: true,
      priority: true
    });

    const validation = validateResearchQuery(formData);
    setErrors(validation.errors);

    if (validation.isValid && formData.query && formData.user_id) {
      await onSubmit({
        query: formData.query,
        user_id: formData.user_id,
        priority: formData.priority || 1,
        metadata: formData.metadata
      });
    }
  };

  const getInputClassName = (fieldName: string) => {
    const hasError = getFieldError(errors, fieldName) && touched[fieldName];
    const baseClasses = "w-full px-4 py-3 bg-black/20 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent resize-none transition-colors";
    
    if (hasError) {
      return `${baseClasses} border-red-500 focus:ring-red-500`;
    }
    return `${baseClasses} border-white/20 focus:ring-green-500`;
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Query Field */}
        <div>
          <label htmlFor="research-query" className="block text-sm font-medium text-gray-300 mb-3">
            Research Query *
          </label>
          <textarea
            id="research-query"
            value={formData.query || ''}
            onChange={(e) => handleInputChange('query', e.target.value)}
            onBlur={() => handleBlur('query')}
            placeholder="Enter your research question or hypothesis (e.g., 'Analyze the impact of AI on scientific research productivity')"
            className={getInputClassName('query')}
            rows={4}
            disabled={isSubmitting}
          />
          {getFieldError(errors, 'query') && touched.query && (
            <p className="mt-2 text-sm text-red-400 flex items-center">
              <span className="mr-1">⚠️</span>
              {getFieldError(errors, 'query')}
            </p>
          )}
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>Include research-oriented keywords for better results</span>
            <span>{(formData.query || '').length}/1000</span>
          </div>
        </div>

        {/* User ID Field */}
        <div>
          <label htmlFor="user-id" className="block text-sm font-medium text-gray-300 mb-3">
            User ID *
          </label>
          <input
            id="user-id"
            type="text"
            value={formData.user_id || ''}
            onChange={(e) => handleInputChange('user_id', e.target.value)}
            onBlur={() => handleBlur('user_id')}
            placeholder="Enter your user ID"
            className={getInputClassName('user_id')}
            disabled={isSubmitting}
          />
          {getFieldError(errors, 'user_id') && touched.user_id && (
            <p className="mt-2 text-sm text-red-400 flex items-center">
              <span className="mr-1">⚠️</span>
              {getFieldError(errors, 'user_id')}
            </p>
          )}
        </div>

        {/* Priority Field */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-3">
            Priority Level
          </label>
          <select
            id="priority"
            value={formData.priority || 1}
            onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
            onBlur={() => handleBlur('priority')}
            className={getInputClassName('priority')}
            disabled={isSubmitting}
          >
            <option value={1}>1 - Low Priority</option>
            <option value={2}>2 - Below Normal</option>
            <option value={3}>3 - Normal</option>
            <option value={4}>4 - High Priority</option>
            <option value={5}>5 - Urgent</option>
          </select>
          {getFieldError(errors, 'priority') && touched.priority && (
            <p className="mt-2 text-sm text-red-400 flex items-center">
              <span className="mr-1">⚠️</span>
              {getFieldError(errors, 'priority')}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || errors.length > 0}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <LoadingSpinner size="sm" color="white" />
              <span>Initiating Research...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>🚀</span>
              <span>Start Research Workflow</span>
            </div>
          )}
        </button>

        {/* Validation Summary */}
        {errors.length > 0 && Object.keys(touched).length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <h4 className="text-red-400 font-medium mb-2">Please fix the following issues:</h4>
            <ul className="text-sm text-red-300 space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2">•</span>
                  {error.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
}