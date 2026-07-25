import { useEffect, useRef } from 'react'
import { MessageSquare } from 'lucide-react'

export default function LiveTranscript({ transcript }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [transcript])

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-800/50 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-300">Live Transcript</span>
        <span className="ml-auto text-xs text-gray-500 font-mono">{transcript.length} turns</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {transcript.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600 text-sm">Waiting for debate to begin...</p>
          </div>
        )}

        {transcript.map((entry, idx) => (
          <div key={idx} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs font-semibold" style={{ color: entry.color }}>
                {entry.name}
              </span>
              <span className="text-xs text-gray-600 ml-auto font-mono">{entry.timestamp}</span>
            </div>
            <div
              className="pl-4 border-l-2 text-sm leading-relaxed text-gray-300"
              style={{ borderColor: entry.color + '40' }}
            >
              {entry.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
