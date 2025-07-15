'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Brain, Loader, Clock, Users, Target, Zap, ChevronDown, Upload, FileText, BookOpen, Edit3, Sparkles } from 'lucide-react'
import { QUIZ_DIFFICULTIES } from './types'
import { getTopics } from './api'

interface QuizSetupProps {
  onStartQuiz: (topic: string, difficulty: string, numQuestions: number, timedMode: boolean, customData?: { customTopic?: string, fileContent?: string, fileType?: string }) => void
  loading: boolean
  assessmentTopic?: {
    title: string;
    subtopics: string[];
    topicsCovered: string[];
  }
}

export default function QuizSetup({ onStartQuiz, loading, assessmentTopic }: QuizSetupProps) {
  const [topics, setTopics] = useState<string[]>([])
  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [timedMode, setTimedMode] = useState(false)
  const [loadingTopics, setLoadingTopics] = useState(true)
  
  // Custom topic and file upload states
  const [topicMode, setTopicMode] = useState<'predefined' | 'custom' | 'upload'>('predefined')
  const [customTopic, setCustomTopic] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState('')
  const [processingFile, setProcessingFile] = useState(false)
  const [customNumQuestions, setCustomNumQuestions] = useState(5)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Loading entertainment states
  const [currentFactIndex, setCurrentFactIndex] = useState(0)
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [aiStep, setAiStep] = useState(0)

  // Fun facts for entertainment
  const funFacts = [
    "🎯 NCC was established in 1948 to develop character, discipline, and leadership!",
    "🌟 Over 1.5 million cadets are enrolled in NCC across India!",
    "🏆 NCC motto is 'Unity and Discipline' - Ekta aur Anushasan!",
    "⚡ NCC has three wings: Army, Navy, and Air Force!",
    "🎖️ NCC cadets can get preference in defense services recruitment!",
    "🚁 NCC organizes adventure activities like trekking, flying, and sailing!",
    "📚 NCC helps in personality development and nation building!",
    "🎪 Republic Day parade features the best NCC cadets from across India!"
  ]

  const motivationalQuotes = [
    "\"Success is not final, failure is not fatal: it is the courage to continue that counts.\" - Winston Churchill",
    "\"The only impossible journey is the one you never begin.\" - Tony Robbins", 
    "\"Believe you can and you're halfway there.\" - Theodore Roosevelt",
    "\"Don't watch the clock; do what it does. Keep going.\" - Sam Levenson",
    "\"Success is walking from failure to failure with no loss of enthusiasm.\" - Winston Churchill"
  ]

  // AI Process simulation
  useEffect(() => {
    if (loading) {
      setAiStep(0)
      const stepInterval = setInterval(() => {
        setAiStep((prev) => (prev < 4 ? prev + 1 : 4))
      }, 1500)
      return () => clearInterval(stepInterval)
    }
  }, [loading])

  // Entertainment components
  const FunFactCarousel = () => {
    useEffect(() => {
      if (loading) {
        const interval = setInterval(() => {
          setCurrentFactIndex((prev) => (prev + 1) % funFacts.length)
        }, 3000)
        return () => clearInterval(interval)
      }
    }, [loading])

    return (
      <div className="text-indigo-700 font-medium text-center animate-in slide-in-from-right duration-500">
        {funFacts[currentFactIndex]}
      </div>
    )
  }

  const AIProcessStep = ({ step, stepIndex }: { step: string; stepIndex: number }) => {
    const isActive = stepIndex <= aiStep
    const isCompleted = stepIndex < aiStep
    
    return (
      <div className="flex items-center space-x-3">
        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
          isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
        }`}>
          {isCompleted && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
        <span className={`text-sm ${
          isCompleted ? 'text-green-700 line-through' : isActive ? 'text-blue-700 font-medium' : 'text-gray-500'
        }`}>
          {step}
        </span>
        {isActive && !isCompleted && <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>}
        {isCompleted && <span className="text-green-600 text-xs">✓</span>}
      </div>
    )
  }

  const MotivationalQuote = () => {
    useEffect(() => {
      if (loading) {
        const interval = setInterval(() => {
          setCurrentQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length)
        }, 4000)
        return () => clearInterval(interval)
      }
    }, [loading])

    return (
      <div className="text-orange-700 text-center italic animate-in fade-in duration-700">
        {motivationalQuotes[currentQuoteIndex]}
      </div>
    )
  }

  useEffect(() => {
    if (!assessmentTopic) {
      loadTopics()
    }
  }, [assessmentTopic])

  const loadTopics = async () => {
    try {
      console.log('Loading topics...')
      const data = await getTopics()
      console.log('Topics loaded:', data)
      setTopics(data.topics)
      if (data.topics.length > 0) {
        setSelectedTopic(data.topics[0])
      }
    } catch (error) {
      console.error('Failed to load topics:', error)
      // Show user-friendly error message
      setTopics(['NCC General', 'Leadership']) // Fallback topics
      setSelectedTopic('NCC General')
    } finally {
      setLoadingTopics(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    setProcessingFile(true)

    try {
      const text = await file.text()
      setFileContent(text)
      setTopicMode('upload')
      setCustomTopic(file.name.replace(/\.[^/.]+$/, "")) // Remove file extension
    } catch (error) {
      console.error('Error reading file:', error)
      alert('Error reading file. Please try again.')
    } finally {
      setProcessingFile(false)
    }
  }

  const handleTopicModeChange = (mode: 'predefined' | 'custom' | 'upload') => {
    setTopicMode(mode)
    // Clear previous selections when switching modes
    if (mode === 'predefined') {
      setCustomTopic('')
      setUploadedFile(null)
      setFileContent('')
      // Keep selectedTopic for predefined mode
    } else {
      setSelectedTopic('') // Clear predefined topic when switching to other modes
      if (mode === 'custom') {
        setUploadedFile(null)
        setFileContent('')
      } else if (mode === 'upload') {
        setCustomTopic('')
      }
    }
  }

  const getEffectiveTopic = () => {
    if (assessmentTopic) return assessmentTopic.title
    if (topicMode === 'custom') return customTopic
    if (topicMode === 'upload') return uploadedFile?.name || customTopic
    return selectedTopic
  }

  const handleStartQuiz = () => {
    const effectiveTopic = getEffectiveTopic()
    if (!effectiveTopic || !selectedDifficulty) return
    let numQuestions = 3
    let customData = undefined
    if (assessmentTopic) {
      // Use default or max questions for assessment
      const difficultyConfig = QUIZ_DIFFICULTIES.find(d => d.value === selectedDifficulty)
      numQuestions = difficultyConfig?.maxQuestions || 3
      // Optionally pass subtopics/topicsCovered if needed for backend
      customData = {
        subtopics: assessmentTopic.subtopics,
        topicsCovered: assessmentTopic.topicsCovered
      }
    } else if (topicMode === 'upload') {
      numQuestions = customNumQuestions
      customData = {
        fileContent,
        fileType: uploadedFile?.type || 'text'
      }
    } else if (topicMode === 'custom') {
      numQuestions = customNumQuestions
      customData = {
        customTopic
      }
    } else {
      // For predefined topics, use the difficulty-based questions
      const difficultyConfig = QUIZ_DIFFICULTIES.find(d => d.value === selectedDifficulty)
      numQuestions = difficultyConfig?.maxQuestions || 5
    }
    onStartQuiz(effectiveTopic, selectedDifficulty, numQuestions, timedMode, customData)
  }

  const selectedDifficultyConfig = QUIZ_DIFFICULTIES.find(d => d.value === selectedDifficulty)

  if (!assessmentTopic && loadingTopics) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 shadow-xl">
          <div className="text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></div>
              <Brain className="relative mx-auto h-16 w-16 text-white z-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-2">Loading Assessment Center</h2>
            <p className="text-gray-600 mb-6">Preparing your personalized quiz experience...</p>
            <div className="flex justify-center">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-6xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <Brain className="relative mx-auto h-20 w-20 text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text z-10" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-6 mb-4">
            NCC Assessment Center
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Challenge yourself with AI-powered questions tailored to your knowledge level
          </p>
        </div>
        {/* Main grid: setup panel and info panel as siblings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Setup Panel (topic selection or assessment summary) */}
          <div className="col-span-2 space-y-8">
            {/* If assessmentTopic is present, show summary instead of topic selection UI */}
            {assessmentTopic ? (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-blue-900 mb-2 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                  Assessment for: <span className="ml-2">{assessmentTopic.title}</span>
                </h3>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Subtopics:</span>
                  <ul className="list-disc list-inside ml-4 text-gray-700">
                    {assessmentTopic.subtopics.map((sub, i) => (
                      <li key={i}>{sub}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Topics Covered:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {assessmentTopic.topicsCovered.map((topic, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md">{topic}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // ...existing topic mode selection UI...
              <>
                {/* Topic Mode Selection */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-4">
                    Choose Topic Source
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Predefined Topics */}
                    <button
                      onClick={() => handleTopicModeChange('predefined')}
                      className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                        topicMode === 'predefined'
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center mb-3">
                        <BookOpen className={`h-6 w-6 mr-3 ${topicMode === 'predefined' ? 'text-blue-600' : 'text-gray-500'}`} />
                        <h3 className={`font-semibold ${topicMode === 'predefined' ? 'text-blue-700' : 'text-gray-800'}`}>
                          NCC Topics
                        </h3>
                      </div>
                      <p className={`text-sm ${topicMode === 'predefined' ? 'text-blue-600' : 'text-gray-600'}`}>
                        Choose from {topics.length} official NCC curriculum topics
                      </p>
                      {topicMode === 'predefined' && selectedTopic && (
                        <div className="mt-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          Selected: {selectedTopic}
                        </div>
                      )}
                    </button>

                    {/* Custom Topic */}
                    <button
                      onClick={() => handleTopicModeChange('custom')}
                      className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                        topicMode === 'custom'
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center mb-3">
                        <Edit3 className={`h-6 w-6 mr-3 ${topicMode === 'custom' ? 'text-blue-600' : 'text-gray-500'}`} />
                        <h3 className={`font-semibold ${topicMode === 'custom' ? 'text-blue-700' : 'text-gray-800'}`}>
                          Custom Topic
                        </h3>
                      </div>
                      <p className={`text-sm ${topicMode === 'custom' ? 'text-blue-600' : 'text-gray-600'}`}>
                        Enter your own topic for specialized quizzes
                      </p>
                    </button>

                    {/* Upload File */}
                    <button
                      onClick={() => handleTopicModeChange('upload')}
                      className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                        topicMode === 'upload'
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center mb-3">
                        <Upload className={`h-6 w-6 mr-3 ${topicMode === 'upload' ? 'text-blue-600' : 'text-gray-500'}`} />
                        <h3 className={`font-semibold ${topicMode === 'upload' ? 'text-blue-700' : 'text-gray-800'}`}>
                          Upload Material
                        </h3>
                      </div>
                      <p className={`text-sm ${topicMode === 'upload' ? 'text-blue-600' : 'text-gray-600'}`}>
                        Upload documents for AI-generated questions
                      </p>
                    </button>
                  </div>

                  {/* Topic Selection Based on Mode */}
                  {topicMode === 'predefined' && (
                    <div className="mb-6 animate-in slide-in-from-top duration-300">
                      <label className="block text-lg font-semibold text-gray-800 mb-4">
                        Select NCC Topic
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {topics.map((topic, index) => (
                          <button
                            key={topic}
                            onClick={() => setSelectedTopic(topic)}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-md transform hover:scale-[1.02] ${
                              selectedTopic === topic
                                ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`font-medium text-sm md:text-base ${
                                selectedTopic === topic ? 'text-blue-700' : 'text-gray-800'
                              }`}>
                                {topic}
                              </span>
                              {selectedTopic === topic && (
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                      {!selectedTopic && (
                        <p className="text-sm text-gray-500 mt-2 text-center">
                          👆 Please select a topic to continue
                        </p>
                      )}
                    </div>
                  )}

                  {topicMode === 'custom' && (
                    <div className="mb-6">
                      <label className="block text-lg font-semibold text-gray-800 mb-4">
                        Enter Custom Topic
                      </label>
                      <input
                        type="text"
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        placeholder="e.g., Military History, Leadership Skills, etc."
                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg"
                      />
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Questions (1-15)
                        </label>
                        <input
                          type="number"
                          value={customNumQuestions}
                          onChange={(e) => setCustomNumQuestions(parseInt(e.target.value) || 5)}
                          min="1"
                          max="15"
                          className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                    </div>
                  )}

                  {topicMode === 'upload' && (
                    <div className="mb-6">
                      <label className="block text-lg font-semibold text-gray-800 mb-4">
                        Upload Study Material
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileUpload}
                          accept=".txt,.pdf,.doc,.docx"
                          className="hidden"
                        />
                        {uploadedFile ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-center space-x-2">
                              <FileText className="h-8 w-8 text-green-600" />
                              <span className="text-lg font-medium text-gray-700">
                                {uploadedFile.name}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              File ready for AI analysis
                            </p>
                            <div className="flex justify-center space-x-3">
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-blue-600 hover:text-blue-700 text-sm"
                              >
                                Replace file
                              </button>
                              <button
                                onClick={() => {
                                  setUploadedFile(null)
                                  setFileContent('')
                                }}
                                className="text-red-600 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                            <div>
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Click to upload
                              </button>
                              <p className="text-sm text-gray-500 mt-1">
                                or drag and drop
                              </p>
                            </div>
                            <p className="text-xs text-gray-500">
                              Supports: TXT, PDF, DOC, DOCX
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {topicMode === 'upload' && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Number of Questions (1-15)
                          </label>
                          <input
                            type="number"
                            value={customNumQuestions}
                            onChange={(e) => setCustomNumQuestions(parseInt(e.target.value) || 5)}
                            min="1"
                            max="15"
                            className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Difficulty Selection */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                Choose Difficulty Level
                {(topicMode === 'custom' || topicMode === 'upload') && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    (Custom content allows up to 15 questions)
                  </span>
                )}
              </label>
              <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-3">
                {QUIZ_DIFFICULTIES.map((difficulty) => (
                  <button
                    key={difficulty.value}
                    onClick={() => setSelectedDifficulty(difficulty.value)}
                    className={`w-full p-4 md:p-6 rounded-xl border-2 transition-all duration-200 text-left text-base md:text-lg
                      ${selectedDifficulty === difficulty.value
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                      `}
                    style={{ minHeight: 'auto' }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-semibold ${selectedDifficulty === difficulty.value ? 'text-blue-700' : 'text-gray-800'} text-base md:text-lg`}>
                          {difficulty.label}
                        </h3>
                        <p className={`text-xs md:text-sm mt-1 ${selectedDifficulty === difficulty.value ? 'text-blue-600' : 'text-gray-600'}`}> 
                          {difficulty.description}
                        </p>
                      </div>
                      <div className={`text-xl md:text-2xl font-bold ${selectedDifficulty === difficulty.value ? 'text-blue-600' : 'text-gray-400'}`}> 
                        {difficulty.maxQuestions}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quiz Options */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                Quiz Options
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={timedMode}
                    onChange={(e) => setTimedMode(e.target.checked)}
                    className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-700 font-medium">Timed Mode</span>
                    <span className="text-sm text-gray-500 ml-2">(Recommended for practice)</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartQuiz}
              disabled={
                !getEffectiveTopic() ||
                !selectedDifficulty ||
                loading ||
                (!assessmentTopic && topicMode === 'predefined' && !selectedTopic) ||
                (!assessmentTopic && topicMode === 'custom' && !customTopic.trim()) ||
                (!assessmentTopic && topicMode === 'upload' && !uploadedFile)
              }
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader className="h-6 w-6 animate-spin mr-3" />
                  {assessmentTopic
                    ? 'Generating Your Quiz...'
                    : topicMode === 'upload'
                      ? 'Analyzing Your Content...'
                      : 'Generating Your Quiz...'}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Zap className="h-6 w-6 mr-3" />
                  {assessmentTopic
                    ? 'Start Assessment'
                    : topicMode === 'upload'
                      ? 'Generate AI Quiz from Material'
                      : 'Start Assessment'}
                </div>
              )}
            </button>

            {/* Loading Entertainment Section */}
            {loading && (
              <div className="mt-8 space-y-6 animate-in fade-in duration-500">
                {/* Fun Facts Carousel */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-2xl p-6 border border-indigo-200">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    Did You Know? 🤔
                  </h3>
                  <div className="relative overflow-hidden h-16">
                    <div className="animate-pulse space-y-2">
                      <FunFactCarousel />
                    </div>
                  </div>
                </div>

                {/* AI Process Visualization */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">
                    🤖 AI is Working Hard For You...
                  </h3>
                  <div className="space-y-3">
                    <AIProcessStep step="Analyzing your topic" stepIndex={0} />
                    <AIProcessStep step="Generating smart questions" stepIndex={1} />
                    <AIProcessStep step="Creating multiple choice options" stepIndex={2} />
                    <AIProcessStep step="Adding explanations" stepIndex={3} />
                    <AIProcessStep step="Final quality check" stepIndex={4} />
                  </div>
                </div>

                {/* Motivational Quotes */}
                <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-2xl p-6 border border-orange-200">
                  <h3 className="text-lg font-semibold text-orange-900 mb-4">
                    💪 Stay Motivated
                  </h3>
                  <MotivationalQuote />
                </div>

                {/* Progress Animation */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-900 font-medium">Quiz Generation Progress</span>
                    <span className="text-blue-700 text-sm">Almost there!</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3 mb-3">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full animate-progress"></div>
                  </div>
                  <div className="text-center text-blue-700 text-sm">
                    <div className="flex items-center justify-center space-x-2">
                      <span>🧠</span>
                      <span>Creating the perfect quiz for you...</span>
                      <span>⚡</span>
                    </div>
                  </div>
                </div>

                {/* Preparation Tips */}
                <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-2xl p-6 border border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-4">
                    💡 While You Wait - Quick Tips!
                  </h3>
                  <div className="space-y-2 text-yellow-800 text-sm">
                    <div className="flex items-center space-x-2">
                      <span>🎯</span>
                      <span>Read each question carefully before answering</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>⏰</span>
                      <span>Take your time - there's no rush unless it's timed mode</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>🔖</span>
                      <span>Use the bookmark feature for questions you want to review</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>🧠</span>
                      <span>Trust your first instinct - it's usually correct!</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Tips */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4">💡 Quick Tips</h3>
              <ul className="space-y-2 text-sm text-green-800">
                <li>• {topicMode === 'upload' ? 'Upload clear, well-structured content for better questions' : 'Read each question carefully'}</li>
                <li>• Use the bookmark feature for review</li>
                <li>• {topicMode === 'custom' ? 'Be specific with your custom topic for better results' : 'Navigate freely between questions'}</li>
                <li>• {timedMode ? 'Manage your time wisely' : 'Take your time to think'}</li>
                {topicMode === 'upload' && <li>• Our AI analyzes your content to create relevant questions</li>}
              </ul>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">📊 Your Progress</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">0</div>
                <div className="text-sm text-purple-700">Assessments Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
