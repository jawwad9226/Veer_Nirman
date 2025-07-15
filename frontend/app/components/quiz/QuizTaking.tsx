'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Bookmark, ChevronLeft, ChevronRight, Loader, Clock, AlertTriangle, Check, Eye, EyeOff } from 'lucide-react'
import { QuizQuestion, QuizResponse } from './types'
import { bookmarkQuestion } from './api'

interface QuizTakingProps {
  quiz: QuizResponse
  onSubmitQuiz: (answers: string[], all_questions: any[]) => void
  loading: boolean
}

export default function QuizTaking({ quiz, onSubmitQuiz, loading }: QuizTakingProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[]>(
    new Array(quiz.questions.length).fill('')
  )
  const timedMode = quiz.metadata.timed_mode || false
  const [timeRemaining, setTimeRemaining] = useState(
    timedMode ? (quiz.metadata.time_limit_seconds || quiz.questions.length * 120) : 0
  )
  const [showExplanations, setShowExplanations] = useState(false)
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set())

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  // Timer effect
  useEffect(() => {
    if (!timedMode || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          const all_questions = quiz.questions.map((q, idx) => {
            const user_answer = userAnswers[idx]
            return {
              question: q.question,
              user_answer: user_answer || '',
              correct_answer: q.answer,
              explanation: q.explanation,
              is_correct: user_answer === q.answer
            }
          })
          onSubmitQuiz(userAnswers, all_questions)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timedMode, timeRemaining, userAnswers, onSubmitQuiz, quiz.questions])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  const getTimeColor = useCallback(() => {
    if (!timedMode) return 'text-gray-600'
    const totalTime = quiz.questions.length * 120
    const timeUsed = (totalTime - timeRemaining) / totalTime
    if (timeUsed > 0.8) return 'text-red-600'
    if (timeUsed > 0.6) return 'text-yellow-600'
    return 'text-green-600'
  }, [timedMode, timeRemaining, quiz.questions.length])

  const handleAnswerChange = (answer: string) => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = answer
    setUserAnswers(newAnswers)
  }

  const handleBookmark = async (question: QuizQuestion) => {
    try {
      await bookmarkQuestion({
        question_id: question.id,
        question: question.question,
        answer: question.answer,
        explanation: question.explanation,
        topic: quiz.metadata.topic,
        user_id: 'current_user' // TODO: Get from auth context
      })
      setBookmarkedQuestions(prev => new Set(prev).add(question.id))
      // Show success message with better UX
      const successDiv = document.createElement('div')
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      successDiv.textContent = '✓ Question bookmarked!'
      document.body.appendChild(successDiv)
      setTimeout(() => document.body.removeChild(successDiv), 3000)
    } catch (error) {
      console.error('Failed to bookmark question:', error)
      // Show error message with better UX
      const errorDiv = document.createElement('div')
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      errorDiv.textContent = '✗ Failed to bookmark question'
      document.body.appendChild(errorDiv)
      setTimeout(() => document.body.removeChild(errorDiv), 3000)
    }
  }

  const handlePrevious = () => {
    setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
  }

  const handleNext = () => {
    setCurrentQuestionIndex(Math.min(quiz.questions.length - 1, currentQuestionIndex + 1))
  }

  const handleSubmit = () => {
    // Build all_questions array for review
    const all_questions = quiz.questions.map((q, idx) => {
      const user_answer = userAnswers[idx]
      return {
        question: q.question,
        user_answer: user_answer || '',
        correct_answer: q.answer,
        explanation: q.explanation,
        is_correct: user_answer === q.answer
      }
    })
    // Pass both answers and all_questions for review
    onSubmitQuiz(userAnswers, all_questions)
  }

  const isAnswered = (index: number) => userAnswers[index] !== ''
  const allAnswered = userAnswers.every(answer => answer !== '')
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Enhanced Progress Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Question <span className="font-bold text-blue-600">{currentQuestionIndex + 1}</span> of <span className="font-bold">{quiz.questions.length}</span>
            </div>
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
              {quiz.metadata.topic} • {quiz.metadata.difficulty}
            </div>
          </div>
          
          {timedMode && (
            <div className={`flex items-center space-x-2 ${getTimeColor()}`}>
              <Clock className="h-5 w-5" />
              <span className="text-lg font-bold">{formatTime(timeRemaining)}</span>
              {timeRemaining < 300 && ( // 5 minutes warning
                <AlertTriangle className="h-5 w-5 text-red-500 animate-bounce" />
              )}
            </div>
          )}
        </div>
        
        {/* Enhanced Progress Bar */}
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
            </div>
          </div>
          <div className="absolute right-0 top-0 text-xs font-medium text-gray-600 mt-1">
            {Math.round(progress)}% Complete
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Question Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Navigation</h3>
            <div className="grid grid-cols-4 lg:grid-cols-3 gap-2">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                    index === currentQuestionIndex
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-110'
                      : isAnswered(index)
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                  {isAnswered(index) && (
                    <Check className="absolute -top-1 -right-1 h-4 w-4 bg-green-600 text-white rounded-full p-0.5" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-600 mb-2">Progress</div>
              <div className="text-2xl font-bold text-blue-600">
                {userAnswers.filter(a => a !== '').length}/{quiz.questions.length}
              </div>
              <div className="text-xs text-gray-500">Questions Answered</div>
            </div>

            {/* Show Explanations Toggle */}
            <button
              onClick={() => setShowExplanations(!showExplanations)}
              className="w-full mt-4 flex items-center justify-center space-x-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
            >
              {showExplanations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showExplanations ? 'Hide' : 'Show'} Hints</span>
            </button>
          </div>
        </div>

        {/* Main Question Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Question Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 leading-relaxed mb-2">
                    {currentQuestion.question}
                  </h2>
                  {currentQuestion.topic && (
                    <div className="text-sm text-gray-600">
                      Topic: <span className="font-medium">{currentQuestion.topic}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleBookmark(currentQuestion)}
                  className={`ml-4 p-2 rounded-lg transition-colors ${
                    bookmarkedQuestions.has(currentQuestion.id)
                      ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                      : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  title="Bookmark this question"
                >
                  <Bookmark className={`h-6 w-6 ${bookmarkedQuestions.has(currentQuestion.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Answer Options */}
            <div className="p-6">
              <div className="space-y-4">
                {Object.entries(currentQuestion.options).map(([key, value]) => (
                  <label 
                    key={key} 
                    className={`group flex items-start space-x-4 cursor-pointer p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                      userAnswers[currentQuestionIndex] === key
                        ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestionIndex}`}
                      value={key}
                      checked={userAnswers[currentQuestionIndex] === key}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      className="h-5 w-5 text-blue-600 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium mr-3 ${
                          userAnswers[currentQuestionIndex] === key
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'
                        }`}>
                          {key}
                        </span>
                        <span className="text-gray-900 font-medium">{value}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Show explanation if enabled and available */}
              {showExplanations && currentQuestion.explanation && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm font-medium text-yellow-800 mb-1">💡 Hint:</div>
                  <div className="text-sm text-yellow-700">{currentQuestion.explanation}</div>
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-100">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="flex items-center px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                Previous
              </button>

              {isLastQuestion ? (
                <button
                  onClick={handleSubmit}
                  disabled={!allAnswered || loading}
                  className="flex items-center px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  {loading ? (
                    <>
                      <Loader className="h-5 w-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Submit Quiz
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Next
                  <ChevronRight className="h-5 w-5 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
