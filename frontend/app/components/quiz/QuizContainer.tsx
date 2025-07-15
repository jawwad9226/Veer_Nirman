'use client'

import React, { useState } from 'react'
import QuizSetup from './QuizSetup'
import QuizTaking from './QuizTaking'
import QuizResults from './QuizResults'
import { QuizResponse, QuizSubmissionResponse } from './types'
import { generateQuiz, submitQuiz } from './api'

type QuizStep = 'setup' | 'taking' | 'results'

export default function QuizContainer() {
  const [currentStep, setCurrentStep] = useState<QuizStep>('setup')
  const [quiz, setQuiz] = useState<QuizResponse | null>(null)
  const [results, setResults] = useState<QuizSubmissionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)

  const handleStartQuiz = async (
    topic: string, 
    difficulty: string, 
    numQuestions: number, 
    timedMode: boolean = false,
    customData?: { customTopic?: string, fileContent?: string, fileType?: string }
  ) => {
    setLoading(true)
    try {
      const quizData = await generateQuiz(topic, difficulty, numQuestions, timedMode, customData)
      setQuiz(quizData)
      setStartTime(new Date())
      setCurrentStep('taking')
    } catch (error) {
      console.error('Failed to generate quiz:', error)
      alert('Failed to generate quiz. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Accepts answers and all_questions for review
  const handleSubmitQuiz = async (answers: string[], all_questions?: any[]) => {
    if (!quiz || !startTime) return

    setLoading(true)
    try {
      const endTime = new Date()
      const submission = {
        quiz_id: quiz.metadata.quiz_id,
        answers,
        topic: quiz.metadata.topic,
        difficulty: quiz.metadata.difficulty,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString()
      }

      const resultsData = await submitQuiz(submission)
      // Merge all_questions into results for frontend review
      setResults({ ...resultsData, all_questions })
      setCurrentStep('results')
    } catch (error) {
      console.error('Failed to submit quiz:', error)
      alert('Failed to submit quiz. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRetakeQuiz = () => {
    setCurrentStep('setup')
    setQuiz(null)
    setResults(null)
    setStartTime(null)
  }

  return (
    <div className="header-aware-content bg-gray-50 py-8">
      {currentStep === 'setup' && (
        <QuizSetup 
          onStartQuiz={handleStartQuiz}
          loading={loading}
        />
      )}

      {currentStep === 'taking' && quiz && (
        <QuizTaking
          quiz={quiz}
          onSubmitQuiz={handleSubmitQuiz}
          loading={loading}
        />
      )}

      {currentStep === 'results' && results && (
        <QuizResults
          results={results}
          onRetakeQuiz={handleRetakeQuiz}
        />
      )}
    </div>
  )
}
