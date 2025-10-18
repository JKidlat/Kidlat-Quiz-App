import React, { useMemo, useState, useEffect } from 'react'

export default function QuestionCard({ question, index, total, onAnswer, onNext }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)

  // combine and shuffle answers; use question text + answers as dependency
  const allAnswers = useMemo(() => {
    if (!question) return []
    const arr = [question.correct_answer, ...question.incorrect_answers]
    // Fisher-Yates shuffle (in-place)
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [question?.question, question?.correct_answer, question?.incorrect_answers?.join('|')])

  // Reset selected state when question changes
  useEffect(() => {
    setSelected(null)
    setRevealed(false)
  }, [question])

  function handleSelect(ans) {
    if (revealed) return
    setSelected(ans)
    setRevealed(true)
    onAnswer(ans)
  }

  function next() {
    // prevent clicking next without answering
    if (!revealed) return
    onNext()
  }

  if (!question) return null

  return (
    <div className="space-y-4" role="region" aria-live="polite">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">Question {index + 1} / {total}</div>
      </div>

      <div className="p-4 border rounded">
        <div className="mb-4 font-medium">{question.question}</div>

        <div className="grid gap-3">
          {allAnswers.map((ans, i) => {
            const isCorrect = ans === question.correct_answer
            const isSelected = selected === ans

            let classes = 'p-3 border rounded text-left w-full'
            if (revealed) {
              if (isCorrect) classes += ' bg-green-50 border-green-400'
              else if (isSelected) classes += ' bg-red-50 border-red-400'
              else classes += ' bg-white'
            } else {
              classes += ' hover:bg-gray-50 cursor-pointer'
            }

            return (
              <button
                key={`${ans}-${i}`}
                className={classes}
                onClick={() => handleSelect(ans)}
                disabled={revealed}
                type="button"
              >
                {ans}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm">
          {revealed ? (selected === question.correct_answer ? 'Correct!' : `Wrong — correct: ${question.correct_answer}`) : ''}
        </div>
        <div>
          <button
            onClick={next}
            disabled={!revealed}
            className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
            type="button"
          >
            {index + 1 === total ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
