'use client'

import React, { useState, useEffect } from 'react'
import { Brain, Clock, Target, TrendingUp, Bookmark } from 'lucide-react'

// Types based on our backend API
interface QuizQuestion {
  id: string
  question: string
  options: { [key: string]: string }
  answer: string
  explanation?: string
  topic?: string
  difficulty?: string
  created_at?: string
}

interface QuizResponse {
  questions: QuizQuestion[]
  metadata: {
    quiz_id: string
    topic: string
    difficulty: string
    generated_at: string
    total_questions: number
    ai_generated: boolean
  }
}

interface QuizSubmissionResponse {
  score: number
  correct_answers: number
  wrong_answers: number
  total_questions: number
  duration_seconds: number
  wrong_questions: Array<{
    question_index: number
    question: string
    user_answer: string
    correct_answer: string
    explanation: string
  }>
  difficulty: string
  topic: string
  submitted_at: string
}

const API_BASE = 'http://localhost:8001/api'

export default function QuizInterface() {
  const [currentStep, setCurrentStep] = useState<'setup' | 'quiz' | 'results'>('setup')
  const [topics, setTopics] = useState<string[]>([])
  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [numQuestions, setNumQuestions] = useState(3)
  const [quiz, setQuiz] = useState<QuizResponse | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [results, setResults] = useState<QuizSubmissionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)

  // Load topics on component mount
  useEffect(() => {
    loadTopics()
  }, [])

  const loadTopics = async () => {
    try {
      const response = await fetch(`${API_BASE}/topics`)
      const data = await response.json()
      setTopics(data.topics)
      if (data.topics.length > 0) {
        setSelectedTopic(data.topics[0])
      }
    } catch (error) {
      console.error('Failed to load topics:', error)
    }
  }

  const generateQuiz = async () => {
    if (!selectedTopic || !selectedDifficulty) return

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          difficulty: selectedDifficulty,
          numQuestions: numQuestions
        })
      })

      if (!response.ok) throw new Error('Failed to generate quiz')

      const quizData = await response.json()
      setQuiz(quizData)
      setUserAnswers(new Array(quizData.questions.length).fill(''))
      setCurrentQuestionIndex(0)
      setStartTime(new Date())
      setCurrentStep('quiz')
    } catch (error) {
      console.error('Failed to generate quiz:', error)
      alert('Failed to generate quiz. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const submitQuiz = async () => {
    if (!quiz || !startTime) return

    setLoading(true)
    try {
      const endTime = new Date()
      const response = await fetch(`${API_BASE}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz_id: quiz.metadata.quiz_id,
          answers: userAnswers,
          topic: selectedTopic,
          difficulty: selectedDifficulty,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString()
        })
      })

      if (!response.ok) throw new Error('Failed to submit quiz')

      const resultsData = await response.json()
      setResults(resultsData)
      setCurrentStep('results')
    } catch (error) {
      console.error('Failed to submit quiz:', error)
      alert('Failed to submit quiz. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const bookmarkQuestion = async (question: QuizQuestion) => {
    try {
      await fetch(`${API_BASE}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: question.id,
          question: question.question,
          answer: question.answer,
          explanation: question.explanation,
          topic: selectedTopic,
          user_id: 'current_user' // In production, get from auth
        })
      })
      alert('Question bookmarked successfully!')
    } catch (error) {
      console.error('Failed to bookmark question:', error)
    }
  }

  const resetQuiz = () => {
    setCurrentStep('setup')
    setQuiz(null)
    setResults(null)
    setUserAnswers([])
    setCurrentQuestionIndex(0)
    setStartTime(null)
  }

  // Setup Step
  if (currentStep === 'setup') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <Brain className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NCC Assessment</h1>
          <p className="text-gray-600">Test your NCC knowledge with AI-generated questions</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {topics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Difficulty</option>
              <option value="Easy">Easy (3 questions)</option>
              <option value="Medium">Medium (5 questions)</option>
              <option value="Hard">Hard (8 questions)</option>
            </select>
          </div>

          <button
            onClick={generateQuiz}
            disabled={!selectedTopic || !selectedDifficulty || loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Generating Quiz...' : 'Start Quiz'}
          </button>
        </div>
      </div>
    )
  }

  // Quiz Step
  if (currentStep === 'quiz' && quiz) {
    const currentQuestion = quiz.questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

    return (
      <div className="max-w-3xl mx-auto p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            <span>{selectedTopic} - {selectedDifficulty}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex-1">
              {currentQuestion.question}
            </h2>
            <button
              onClick={() => bookmarkQuestion(currentQuestion)}
              className="ml-4 p-2 text-gray-400 hover:text-blue-600"
              title="Bookmark this question"
            >
              <Bookmark className="h-5 w-5" />
            </button>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {Object.entries(currentQuestion.options).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  value={key}
                  checked={userAnswers[currentQuestionIndex] === key}
                  onChange={(e) => {
                    const newAnswers = [...userAnswers]
                    newAnswers[currentQuestionIndex] = e.target.value
                    setUserAnswers(newAnswers)
                  }}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="font-medium text-gray-700">{key}.</span>
                <span className="text-gray-900">{value}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <button
              onClick={submitQuiz}
              disabled={userAnswers.some(answer => !answer) || loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(Math.min(quiz.questions.length - 1, currentQuestionIndex + 1))}
              disabled={!userAnswers[currentQuestionIndex]}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Next
            </button>
          )}
        </div>
      </div>
    )
  }

  // Results Step
  if (currentStep === 'results' && results) {
    const scoreColor = results.score >= 80 ? 'text-green-600' : results.score >= 60 ? 'text-yellow-600' : 'text-red-600'
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Score Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="text-center mb-6">
            <Target className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Results</h1>
            <div className={`text-6xl font-bold ${scoreColor} mb-2`}>
              {Math.round(results.score)}%
            </div>
            <p className="text-gray-600">
              {results.correct_answers} out of {results.total_questions} correct
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{results.correct_answers}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{results.wrong_answers}</div>
              <div className="text-sm text-gray-600">Wrong</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(results.duration_seconds / 60)}m
              </div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
          </div>
        </div>

        {/* Wrong Questions Review */}
        {results.wrong_questions.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Wrong Answers</h2>
            <div className="space-y-4">
              {results.wrong_questions.map((wrongQ, index) => (
                <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-900 mb-2">{wrongQ.question}</h3>
                  <div className="text-sm space-y-1">
                    <div className="text-red-600">Your answer: {wrongQ.user_answer}</div>
                    <div className="text-green-600">Correct answer: {wrongQ.correct_answer}</div>
                    <div className="text-gray-600 italic">{wrongQ.explanation}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={resetQuiz}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Take Another Quiz
          </button>
        </div>
      </div>
    )
  }

  return null
}
