import { useState } from 'react'
import { Palette } from 'lucide-react'

function App() {
  const [color, setColor] = useState('bg-blue-500')

  const colors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-rose-500',
    'bg-amber-500',
    'bg-cyan-500',
  ]

  const handleClick = () => {
    const next = colors[Math.floor(Math.random() * colors.length)]
    setColor(next)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3">
          <Palette className="w-8 h-8 text-gray-700" />
          <h1 className="text-4xl font-bold text-gray-800">Hello Designer!</h1>
        </div>
        <p className="text-gray-600 max-w-md mx-auto">
          Welcome to Design Studio. This is a live React app powered by Vite and Tailwind CSS.
          Click the button below to see interactivity in action.
        </p>
        <button
          onClick={handleClick}
          className={`${color} text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95`}
        >
          Change Color
        </button>
        <p className="text-sm text-gray-400">
          Tip: Ask your AI assistant to help you build any UI you can imagine!
        </p>
      </div>
    </div>
  )
}

export default App
