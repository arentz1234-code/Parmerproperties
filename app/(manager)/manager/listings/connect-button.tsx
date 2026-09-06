'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'

interface ConnectButtonProps {
  platform: string
}

export function ConnectButton({ platform }: ConnectButtonProps) {
  const [toast, setToast] = useState(false)

  function handleConnect() {
    setToast(true)
    setTimeout(() => setToast(false), 3000)
  }

  return (
    <div className="relative">
      <button
        onClick={handleConnect}
        className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <ExternalLink size={13} />
        Connect
      </button>
      {toast && (
        <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white text-center shadow-lg z-10">
          {platform} integration coming soon
        </div>
      )}
    </div>
  )
}
