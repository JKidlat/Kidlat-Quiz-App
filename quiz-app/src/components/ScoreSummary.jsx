import React from 'react'

export default function ScoreSummary({ score, total, answersLog = [], onRestart }) {
  const percentage = total ? Math.round((score / total) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold">Results</h2>
        <p className="mt-2">You scored <strong>{score}</strong> out of {total} ({percentage}%)</p>
      </div>

      <div className="space-y-2 max-h-64 overflow-auto p-2 border rounded">
        {answersLog.length === 0 && <div className="text-sm text-gray-600">No answers recorded.</div>}
        {answersLog.map((a, i) => (
          <div key={i} className={`p-2 rounded ${a.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="font-medium">{a.question}</div>
            <div className="text-sm">Your answer: <span className="font-semibold">{a.selected}</span></div>
            {!a.isCorrect && <div className="text-sm">Correct: <span className="font-semibold">{a.correct}</span></div>}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={onRestart} className="px-4 py-2 bg-blue-600 text-white rounded">Restart</button>
      </div>
    </div>
  )
}
