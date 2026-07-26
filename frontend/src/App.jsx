import React, { useState, useEffect, useRef } from 'react'
import Scene from './components/Scene'
import Sidebar from './components/Sidebar'
import DecisionLedger from './components/DecisionLedger'
import HistoryPage from './components/HistoryPage'
import axios from 'axios'

export default function App() {
  const [currentView, setCurrentView] = useState(
    window.location.pathname === '/history' ? 'history' : 'app'
  )
  const [role, setRole] = useState('CEO of Apex Labs')
  const [prompt, setPrompt] = useState('Cut R&D by 20% immediately to boost quarterly margins')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [activeSpeaker, setActiveSpeaker] = useState(null)
  const [chatLog, setChatLog] = useState([])
  const [accord, setAccord] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [useMockMode, setUseMockMode] = useState(false)

  const eventSourceRef = useRef(null)

  // Listen to browser Back/Forward buttons and URL updates
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/history') {
        setCurrentView('history')
      } else {
        setCurrentView('app')
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigateToHistory = () => {
    window.history.pushState({}, '', '/history')
    setCurrentView('history')
  }

  const navigateToApp = () => {
    window.history.pushState({}, '', '/')
    setCurrentView('app')
  }

  // Hackathon Fail-Safe keyboard shortcut (Ctrl + M)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'm') {
        e.preventDefault()
        setUseMockMode((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleRun = () => {
    setIsRunning(true)
    setChatLog([])
    setAccord(null)
    setActiveSpeaker(null)

    if (useMockMode) {
      runMockNegotiation()
    } else {
      runLiveSSENegotiation()
    }
  }

  // Live SSE Connection to FastAPI backend endpoint
  const runLiveSSENegotiation = async () => {
    let filePath = ''
    if (selectedFiles && selectedFiles.length > 0) {
      for (const file of selectedFiles) {
        try {
          const formData = new FormData()
          formData.append('file', file)
          const uploadRes = await axios.post('http://localhost:8000/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          if (uploadRes.data?.path && !filePath) {
            filePath = uploadRes.data.path
          }
        } catch (err) {
          console.warn('Backend file upload failed for file:', file.name, err)
        }
      }
    }


    const url = `http://localhost:8000/negotiate?role=${encodeURIComponent(role)}&prompt=${encodeURIComponent(prompt)}${filePath ? `&file_path=${encodeURIComponent(filePath)}` : ''}`
    const es = new EventSource(url)
    eventSourceRef.current = es

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'turn') {
          setActiveSpeaker(data.speaker || data.name)
          setChatLog((prev) => [...prev, data])
        } else if (data.type === 'accord') {
          setAccord(data)
          setActiveSpeaker(null)
          setIsRunning(false)
          es.close()
        }
      } catch (err) {
        console.error('Error parsing SSE payload:', err)
      }
    }

    es.onerror = (err) => {
      console.warn('SSE Error / Backend offline. Falling back to Mock Mode simulation.', err)
      es.close()
      runMockNegotiation()
    }
  }

  // Local Mock Simulation Engine (1v1 Debate between User Role & Egalitarian Challenger)
  const runMockNegotiation = () => {
    const userRoleText = role || 'CEO of Apex Labs'
    const mockTurns = [
      {
        type: 'turn',
        speaker: userRoleText,
        roleKey: 'proxy',
        color: '#38bdf8',
        text: `As ${userRoleText}, I present our policy directive: '${prompt}'. This initiative is critical for operational efficiency and strategic positioning.`
      },
      {
        type: 'turn',
        speaker: 'Egalitarian Conscience',
        roleKey: 'challenger',
        color: '#f43f5e',
        text: `Cross-referencing live industry benchmarks and ethical frameworks: abrupt execution of '${prompt}' risks critical talent attrition and partnership SLAs. We must establish safeguard thresholds.`
      },
      {
        type: 'turn',
        speaker: userRoleText,
        roleKey: 'proxy',
        color: '#38bdf8',
        text: `Acknowledging the market data: we can structure a staged budget re-allocation holding core AI at 55% while maintaining zero engineering layoffs.`
      },
      {
        type: 'turn',
        speaker: 'Egalitarian Conscience',
        roleKey: 'challenger',
        color: '#f43f5e',
        text: `Synthesizing consensus: The proposed 2-phase restructuring satisfies risk mitigation goals while fulfilling the mandate of ${userRoleText}.`
      }
    ]

    let step = 0
    const interval = setInterval(() => {
      if (step < mockTurns.length) {
        const turn = mockTurns[step]
        setActiveSpeaker(turn.speaker)
        setChatLog((prev) => [...prev, turn])
        step++
      } else {
        clearInterval(interval)
        setActiveSpeaker(null)
        setAccord({
          title: 'Egalitarian Policy Accord v2.0',
          summary: `1v1 Dialectic Compromise Reached between ${userRoleText} & Egalitarian Conscience: Budget optimization achieved with zero involuntary layoffs and protected core R&D SLAs.`,
          resilience_score: 8.9,
          fairness_score: 9.5
        })
        setIsRunning(false)
      }
    }, 2400)
  }

  const handleReset = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    setIsRunning(false)
    setActiveSpeaker(null)
    setChatLog([])
    setAccord(null)
  }

  if (currentView === 'history') {
    return <HistoryPage onBack={navigateToApp} />
  }

  return (
    <div className="flex h-screen w-screen bg-slate-950 overflow-hidden relative">
      {/* Control Panel Sidebar */}
      <Sidebar
        role={role}
        setRole={setRole}
        prompt={prompt}
        setPrompt={setPrompt}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        isRunning={isRunning}
        onRun={handleRun}
        chatLog={chatLog}
        useMockMode={useMockMode}
        setUseMockMode={setUseMockMode}
        onOpenHistory={navigateToHistory}
      />

      {/* 3D Visual Stage Canvas - 1v1 Dialectic Stage */}
      <div className="flex-1 h-full relative">
        <Scene
          userRole={role || 'Institutional Advocate'}
          activeSpeaker={activeSpeaker}
          hideLabels={Boolean(accord)}
        />

        {/* Mock Mode Overlay Indicator Badge */}
        {useMockMode && (
          <div className="absolute top-4 right-4 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg flex items-center gap-1.5 z-20">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Mock Mode Active (Ctrl + M)
          </div>
        )}
      </div>

      {/* Golden Document Decision Ledger Modal */}
      <DecisionLedger
        accord={accord}
        prompt={prompt}
        chatLog={chatLog}
        onReset={handleReset}
      />
    </div>
  )
}

