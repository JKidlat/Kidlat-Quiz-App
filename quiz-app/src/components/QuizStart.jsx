import React, { useState, useEffect } from 'react'

export default function QuizStart({ categories = [], onStart, defaultConfig = {} }) {
  const [amount, setAmount] = useState(defaultConfig.amount || 10)
  const [category, setCategory] = useState(defaultConfig.category || '')
  const [difficulty, setDifficulty] = useState(defaultConfig.difficulty || '')
  const [localError, setLocalError] = useState(null)

  useEffect(() => {
    setLocalError(null)
  }, [amount, category, difficulty])

  function validate() {
    if (!Number.isInteger(amount) || amount < 1 || amount > 50) {
      return 'Number of questions must be an integer between 1 and 50.'
    }
    return null
  }

  function handleSubmit(e) {
    e.preventDefault()
    const v = validate()
    if (v) {
      setLocalError(v)
      return
    }
    onStart({ amount, category, difficulty })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-labelledby="start-title">
      <h2 id="start-title" className="text-lg font-medium">Start a new quiz</h2>

      <div>
        <label className="block text-sm font-medium">Number of questions</label>
        <input
          type="number"
          min="1"
          max="50"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-1 p-2 border rounded w-32"
          aria-label="number of questions"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 p-2 border rounded w-full"
          aria-label="category"
        >
          <option value="">Any</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Difficulty</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="mt-1 p-2 border rounded w-full"
          aria-label="difficulty"
        >
          <option value="">Any</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {localError && <div className="text-red-600 text-sm">{localError}</div>}

      <div className="pt-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Start Quiz
        </button>
      </div>
    </form>
  )
}
