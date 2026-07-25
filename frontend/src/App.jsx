import { useState, useEffect, useCallback, useRef } from 'react'
import SetupModal from './components/SetupModal'
import Stage3D from './components/Stage3D'
import LiveTranscript from './components/LiveTranscript'
import AccordLedger from './components/AccordLedger'
import { mockDebateData } from './mockData'

function App() {
  const [phase, setPhase] = useState('setup')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [role, setRole] = useState('')
  const [prompt, setPrompt] = useState('')
  const [activeSpeaker, setActiveSpeaker] = useState(null)
  const [transcript, setTranscript] = useState([])
  const [accord, setAccord] = useState(null)
  const [useMockMode, setUseMockMode] = useState(false)
  const mockIntervalRef = useRef(null)
  const mockIndexRef = useRef(0)

  const handleFileUploaded = (fileData) => {
    setUploadedFile(fileData)
  }

  const handleStartDebate = (roleVal, promptVal) => {
    setRole(roleVal)
    setPrompt(promptVal)
    setPhase('debate')
    setTranscript([])
    setAccord(null)
    setActiveSpeaker(null)

    if (useMockMode) {
      startMockDebate()
    } else {
      startLiveDebate(roleVal, promptVal)
    }
  }

  const startLiveDebate = async (roleVal, promptVal) => {
    const params = new URLSearchParams({
      role: roleVal,
      prompt: promptVal,
      file_path: uploadedFile.path
    })

    const eventSource = new EventSource(`http://localhost:8000/negotiate?${params}`)

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'turn') {
        setActiveSpeaker(data.speaker)
        setTranscript(prev => [...prev, {
          speaker: data.speaker,
          name: data.name,
          color: data.color,
          text: data.text,
          timestamp: new Date().toLocaleTimeString()
        }])
      } else if (data.type === 'accord') {
        setActiveSpeaker(null)
        setAccord({
          title: data.title,
          summary: data.summary
        })
        setPhase('accord')
        eventSource.close()
      }
    }

    eventSource.onerror = () => {
      console.error('SSE connection error')
      eventSource.close()
    }
  }

  const startMockDebate = () => {
    mockIndexRef.current = 0
    mockIntervalRef.current = setInterval(() => {
      if (mockIndexRef.current < mockDebateData.length) {
        const entry = mockDebateData[mockIndexRef.current]

        if (entry.type === 'turn') {
          setActiveSpeaker(entry.speaker)
          setTranscript(prev => [...prev, {
            speaker: entry.speaker,
            name: entry.name,
            color: entry.color,
            text: entry.text,
            timestamp: new Date().toLocaleTimeString()
          }])
        } else if (entry.type === 'accord') {
          setActiveSpeaker(null)
          setAccord({ title: entry.title, summary: entry.summary })
          setPhase('accord')
          clearInterval(mockIntervalRef.current)
        }

        mockIndexRef.current++
      }
    }, 4000)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault()
        setUseMockMode(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    return () => {
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current)
      }
    }
  }, [])

  return (
    <div className="w-screen h-screen bg-gray-950 text-white overflow-hidden relative">
      {phase === 'setup' && (
        <SetupModal
          onFileUploaded={handleFileUploaded}
          onStartDebate={handleStartDebate}
          uploadedFile={uploadedFile}
          useMockMode={useMockMode}
        />
      )}

      {(phase === 'debate' || phase === 'accord') && (
        <div className="w-full h-full flex">
          <div className="flex-1 relative">
            <Stage3D activeSpeaker={activeSpeaker} phase={phase} />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-gray-400 font-mono">
                {useMockMode ? 'MOCK MODE' : 'LIVE'} — {role}
              </span>
            </div>
          </div>
          <div className="w-96 border-l border-gray-800/50 flex flex-col">
            <LiveTranscript transcript={transcript} />
          </div>
        </div>
      )}

      {phase === 'accord' && accord && (
        <AccordLedger
          title={accord.title}
          summary={accord.summary}
          onClose={() => setPhase('debate')}
        />
      )}
    </div>
  )
}

export default App
