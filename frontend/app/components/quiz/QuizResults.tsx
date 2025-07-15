'use client'

import React from 'react'
import QuizPieChart from './QuizPieChart'
import { Target, Clock, CheckCircle, XCircle, TrendingUp, RotateCcw } from 'lucide-react'
import { QuizSubmissionResponse } from './types'

interface QuizResultsProps {
  results: QuizSubmissionResponse
  onRetakeQuiz: () => void
}

export default function QuizResults({ results, onRetakeQuiz }: QuizResultsProps) {
  const scoreColor = results.score >= 80 
    ? 'text-green-600' 
    : results.score >= 60 
    ? 'text-yellow-600' 
    : 'text-red-600'
  
  const scoreMessage = results.score >= 80
    ? 'Excellent Performance!'
    : results.score >= 60
    ? 'Good Job!'
    : 'Keep Practicing!'

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Score Summary Card */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="text-center mb-8">
          <Target className="mx-auto h-16 w-16 text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Results</h1>
          <p className="text-gray-600">{scoreMessage}</p>
        </div>

        {/* Pie Chart Visualization */}
        <div className="flex flex-col items-center mb-8">
          <QuizPieChart correct={results.correct_answers} wrong={results.wrong_answers} />
          <div className="flex gap-8 mt-4">
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded-full bg-green-400 border border-green-600"></span>
              <span className="text-green-700 font-semibold">Correct: {results.correct_answers}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded-full bg-red-300 border border-red-600"></span>
              <span className="text-red-700 font-semibold">Wrong: {results.wrong_answers}</span>
            </div>
          </div>
          <div className="mt-2 text-gray-500 text-sm">{results.correct_answers} out of {results.total_questions} questions correct</div>
        </div>

        {/* Topic Badge */}
        <div className="text-center mb-4">
          <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
            {results.topic}
          </span>
        </div>
        <div className="text-center mb-2">
          <span className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
            Difficulty: {results.difficulty}
          </span>
        </div>
        <div className="text-center mb-2">
          <span className="inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
            Duration: {formatDuration(results.duration_seconds)}
          </span>
        </div>
      </div>

      {/* All Attempted Questions Review */}
      {results.all_questions && results.all_questions.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            Review All Questions
          </h2>
          <div className="space-y-6">
            {results.all_questions.map((q, index) => (
              <div key={index} className={`border-l-4 p-4 rounded-r-lg ${q.is_correct ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Question {index + 1}: {q.question}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className={`${q.is_correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} p-3 rounded-lg`}>
                    <div className="text-sm font-medium mb-1">Your Answer:</div>
                    <div>{q.user_answer}</div>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <div className="text-sm font-medium text-green-800 mb-1">Correct Answer:</div>
                    <div className="text-green-700">{q.correct_answer}</div>
                  </div>
                </div>
                {q.explanation && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 mb-1">Explanation:</div>
                    <div className="text-blue-700 text-sm leading-relaxed">{q.explanation}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Perfect Score Celebration */}
      {results.score === 100 && (
        <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg shadow-lg p-6 mb-6 text-white text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2">Perfect Score!</h2>
          <p className="text-lg">Outstanding performance! You've mastered this topic.</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={onRetakeQuiz}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Take Another Quiz
        </button>
      </div>

      {/* Submission Info */}
      <div className="text-center mt-6 text-sm text-gray-500">
        Completed on {new Date(results.submitted_at).toLocaleString()}
      </div>
    </div>
  )
}
