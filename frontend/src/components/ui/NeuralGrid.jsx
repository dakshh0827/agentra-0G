import React from 'react'

export default function NeuralGrid() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: `
          linear-gradient(rgba(180, 92, 202, 0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(180, 92, 202, 0.025) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />
  )
}