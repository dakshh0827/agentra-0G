import React from 'react'

export default function NeuralGrid() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 opacity-5"
      style={{
        backgroundImage: `
          linear-gradient(rgba(180, 92, 202, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(180, 92, 202, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100px 100px',
      }}
    />
  )
}


