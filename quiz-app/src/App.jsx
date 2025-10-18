import React, { useEffect, useState } from 'react'
import QuizStart from './components/QuizStart'
import QuestionCard from './components/QuestionCard'
import ScoreSummary from './components/ScoreSummary'
import Loader from './components/Loader'

const API_BASE = 'https://opentdb.com'

export default function App() {
  const [stage, setStage] = useState('start') // 'start' | 'quiz' | 'results'
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // quiz config chosen by user
  const [config, setConfig] = useState({ amount: 10, category: '', difficulty: '' })

  // quiz data & progress
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answersLog, setAnswersLog] = useState([])

  useEffect(() => {
    // fetch categories once on mount
    async function fetchCategories() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${API_BASE}/api_category.php`)
        if (!res.ok) throw new Error(`Network error ${res.status}`)
        const data = await res.json()
        // API returns { trivia_categories: [ { id, name }, ... ] }
        setCategories(Array.isArray(data.trivia_categories) ? data.trivia_categories : [])
      } catch (err) {
        setError('Failed to load categories. Please check your connection.')
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // helper to decode HTML entities returned by OpenTDB
  function decodeHTML(str) {
    if (!str) return ''
    const txt = document.createElement('textarea')
    txt.innerHTML = str
    return txt.value
  }

  async function startQuiz(newConfig) {
    setConfig(newConfig)
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        amount: String(newConfig.amount || 10),
        type: 'multiple'
      })
      // category should be numeric id; only append if provided
      if (newConfig.category) params.append('category', String(newConfig.category))
      if (newConfig.difficulty) params.append('difficulty', newConfig.difficulty)

      const url = `${API_BASE}/api.php?${params.toString()}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Network error ${res.status}`)
      const data = await res.json()

      // response_code semantics (OpenTDB):
      // 0 = success, 1 = no results, 2 = invalid parameter, 3 = token not found, 4 = token empty
      if (!data || typeof data.response_code === 'undefined') {
        throw new Error('Unexpected API response.')
      }
      if (data.response_code === 1) {
        throw new Error('No questions available for your selection. Try different options.')
      }
      if (data.response_code !== 0) {
        throw new Error('Quiz API returned an error (code ' + data.response_code + ').')
      }
      if (!Array.isArray(data.results) || data.results.length === 0) {
        throw new Error('No questions returned by the API.')
      }

      // decode HTML entities (questions and answers are HTML encoded)
      const decoded = data.results.map((q) => ({
        ...q,
        question: decodeHTML(q.question),
        correct_answer: decodeHTML(q.correct_answer),
        incorrect_answers: q.incorrect_answers.map(decodeHTML)
      }))

      setQuestions(decoded)
      setCurrentIndex(0)
      setScore(0)
      setAnswersLog([])
      setStage('quiz')
    } catch (err) {
      setError(err.message || 'Failed to fetch questions.')
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  function handleAnswer(selected) {
    const current = questions[currentIndex]
    if (!current) return
    const isCorrect = selected === current.correct_answer
    if (isCorrect) setScore((s) => s + 1)

    setAnswersLog((log) => [
      ...log,
      {
        question: current.question,
        selected,
        correct: current.correct_answer,
        isCorrect
      }
    ])
  }

  function handleNext() {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1)
    } else {
      setStage('results')
    }
  }

  function handleRestart() {
    setStage('start')
    setQuestions([])
    setAnswersLog([])
    setScore(0)
    setCurrentIndex(0)
    setConfig({ amount: 10, category: '', difficulty: '' })
    setError(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Trivia Quiz App</h1>

        {loading && <Loader />}

        {error && (
          <div className="mb-4 text-red-600" role="alert">
            Error: {error}
          </div>
        )}

        {!loading && stage === 'start' && (
          <QuizStart
            categories={categories}
            defaultConfig={config}
            onStart={startQuiz}
          />
        )}

        {!loading && stage === 'quiz' && questions.length > 0 && (
          <QuestionCard
            question={questions[currentIndex]}
            index={currentIndex}
            total={questions.length}
            onAnswer={handleAnswer}
            onNext={handleNext}
          />
        )}

        {!loading && stage === 'results' && (
          <ScoreSummary
            score={score}
            total={questions.length}
            answersLog={answersLog}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  )
}
