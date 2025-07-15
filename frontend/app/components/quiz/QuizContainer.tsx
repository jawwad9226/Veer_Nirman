'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import QuizSetup from './QuizSetup'
import QuizTaking from './QuizTaking'
import QuizResults from './QuizResults'
import { QuizResponse, QuizSubmissionResponse } from './types'
import { generateQuiz, submitQuiz } from './api'

type QuizStep = 'setup' | 'taking' | 'results'

export default function QuizContainer({ assessmentProps, clearAssessmentProps }: { assessmentProps?: any, clearAssessmentProps?: () => void }) {
  const [currentStep, setCurrentStep] = useState<QuizStep>('setup')
  const [quiz, setQuiz] = useState<QuizResponse | null>(null)
  const [results, setResults] = useState<QuizSubmissionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)

  // Auto-start quiz if assessmentProps are present
  useEffect(() => {
    if (assessmentProps && currentStep === 'setup') {
      handleStartQuiz(
        assessmentProps.topic,
        assessmentProps.difficulty,
        assessmentProps.numQuestions,
        assessmentProps.timedMode,
        assessmentProps.customData
      );
      if (clearAssessmentProps) clearAssessmentProps();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentProps]);

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

      // --- Send analytics summary to backend (non-blocking) ---
      const analyticsPayload = {
        quiz_id: quiz.metadata.quiz_id,
        topic: quiz.metadata.topic,
        difficulty: quiz.metadata.difficulty,
        score: resultsData.score,
        correct_answers: resultsData.correct_answers,
        wrong_answers: resultsData.wrong_answers,
        total_questions: resultsData.total_questions,
        duration_seconds: resultsData.duration_seconds,
        submitted_at: resultsData.submitted_at,
        // Optionally add user_id if available (for admin analytics)
      }
      // Fire and forget, don't block UI
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analyticsPayload),
        credentials: 'include',
      }).catch((err) => {
        // Log but don't alert user
        console.warn('Failed to send analytics:', err)
      })
      // --- End analytics ---
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
