import React from 'react'

export default function Loader() {
  return (
    <div className="flex items-center justify-center py-6" aria-hidden="true">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900" />
    </div>
  )
}