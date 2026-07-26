import React, { useState } from 'react'
import {
  Play,
  ToggleLeft,
  ToggleRight,
  Terminal,
  Shield,
  FileText,
  Activity,
  MessageSquare
} from 'lucide-react'
import FileManager from './FileManager'

export default function Sidebar({
  role,
  setRole,
  prompt,
  setPrompt,
  selectedFiles = [],
  setSelectedFiles,
  isRunning,
  onRun,
  chatLog = [],
  useMockMode,
  setUseMockMode,
}) {
  const [activeTab, setActiveTab] = useState('input')

  return (
    <aside className="relative h-full w-[360px] shrink-0 overflow-hidden border-r border-slate-800/80 bg-slate-950/95 text-slate-100 shadow-[8px_0_40px_rgba(2,6,23,0.5)] backdrop-blur-xl flex flex-col">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-size-[48px_48px] opacity-25" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-950/20 via-slate-900/10 to-transparent" />

      <div className="relative z-10 flex h-full flex-col">

        {/* Header */}
        <header className="flex flex-col items-center justify-center border-b border-slate-800/80 bg-slate-950/90 px-5 py-5 text-center relative">
          <div className="absolute top-3 right-3">
            <button
              type="button"
              onClick={() => setUseMockMode(!useMockMode)}
              className="flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/80 px-2 py-1 text-[10px] text-slate-300 transition-colors hover:border-cyan-500/40 hover:text-white cursor-pointer"
              title="Toggle Local Simulation Engine (Ctrl+M)"
            >
              <span className="text-[10px] text-slate-400 font-medium">
                Mock
              </span>

              {useMockMode ? (
                <ToggleRight className="h-4 w-4 text-cyan-400" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-slate-400" />
              )}
            </button>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            AgentAccord v2.0
          </h1>

          <p className="mt-1 text-xs text-slate-400 font-medium tracking-wide">
            Sentient 1v1 Dialectic Engine
          </p>
        </header>


        {/* Navigation Tabs */}
        <nav className="flex border-b border-slate-800/80 bg-slate-950/60 p-1.5 gap-1 shrink-0">

          {/* Setup Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('input')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'input'
                ? 'border border-cyan-500/40 bg-cyan-950/50 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Setup</span>
          </button>


          {/* Dialogue Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('dialogue')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold tracking-wide transition-all cursor-pointer relative ${
              activeTab === 'dialogue'
                ? 'border border-cyan-500/40 bg-cyan-950/50 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />

            <span>Dialogue</span>

            {chatLog.length > 0 && (
              <span className="ml-1 h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </button>

        </nav>


        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* =========================================
              SETUP TAB
          ========================================= */}

          {activeTab === 'input' && (
            <div className="space-y-4 animate-fadeIn">

              {/* File Manager */}
              <FileManager
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
              />


              {/* Role Input */}
              <div className="space-y-1.5">

                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  YOUR ROLE
                </label>

                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isRunning}
                  placeholder="e.g., CEO of Apex Labs, Mayor of New York"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition-all focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 disabled:opacity-50"
                />

              </div>


              {/* Proposal Input */}
              <div className="space-y-1.5">

                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  YOUR PROPOSAL
                </label>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isRunning}
                  rows={4}
                  placeholder="e.g., Cut R&D by 20% immediately to boost quarterly margins"
                  className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition-all focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 disabled:opacity-50"
                />

              </div>


              {/* Run Button */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('dialogue')
                  onRun()
                }}
                disabled={isRunning}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/90 py-3 text-xs font-bold uppercase tracking-wider text-slate-200 shadow-md transition-all hover:border-cyan-500/50 hover:bg-slate-800 hover:text-white hover:shadow-cyan-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >

                {isRunning ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />

                    <span>
                      DEBATING IN PROGRESS...
                    </span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current text-slate-300" />

                    <span>
                      INITIATE DEBATE
                    </span>
                  </>
                )}

              </button>

            </div>
          )}


          {/* =========================================
              DIALOGUE TAB
          ========================================= */}

          {activeTab === 'dialogue' && (
            <div className="space-y-4 animate-fadeIn">

              {/* Dialogue Header */}
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/60 pb-2">

                <span className="flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-cyan-400" />

                  Dialogue Stream
                </span>

                <span className="flex items-center gap-1 text-slate-400">

                  <Activity
                    className={`h-3 w-3 ${
                      isRunning
                        ? 'animate-pulse text-rose-400'
                        : 'text-slate-500'
                    }`}
                  />

                  {isRunning
                    ? 'Live Stream'
                    : 'Idle'}
                </span>

              </div>


              {/* =========================================
                  DIALOGUE CONTENT
              ========================================= */}

              <div className="space-y-3">

                {/* =====================================
                    LOADING STATE

                    Shows while the debate is running
                    and no messages have arrived yet.
                ===================================== */}

                {isRunning && chatLog.length === 0 ? (

                  <div className="flex flex-col items-center justify-center rounded-2xl border border-cyan-500/20 bg-slate-900/40 px-4 py-10 text-center">

                    {/* Animated Loader */}
                    <div className="relative mb-5">

                      {/* Outer Ring */}
                      <div className="h-12 w-12 rounded-full border-2 border-cyan-500/20" />

                      {/* Spinning Ring */}
                      <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-400" />

                      {/* Glow */}
                      <div className="absolute inset-2 rounded-full bg-cyan-400/10 blur-md animate-pulse" />

                      {/* Activity Icon */}
                      <Activity className="absolute inset-0 m-auto h-5 w-5 text-cyan-400 animate-pulse" />

                    </div>


                    {/* Loader Title */}
                    <p className="text-sm font-semibold text-slate-200">
                      Debate in Progress
                    </p>


                    {/* Loader Description */}
                    <p className="mt-1 text-[11px] text-slate-500">
                      The agents are analyzing your proposal...
                    </p>


                    {/* Animated Dots */}
                    <div className="mt-5 flex items-center gap-1.5">

                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" />

                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:150ms]" />

                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:300ms]" />

                    </div>

                  </div>

                ) : chatLog.length === 0 ? (

                  /* =====================================
                      EMPTY STATE
                  ===================================== */

                  <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 px-4 py-8 text-center text-xs text-slate-400 space-y-2">

                    <Shield className="mx-auto h-6 w-6 text-slate-500" />

                    <p className="font-semibold text-slate-300">
                      No Active Debate
                    </p>

                    <p className="text-[11px] text-slate-500">
                      Configure your Role and Proposal in the Setup tab and click Initiate Debate.
                    </p>

                  </div>

                ) : (

                  /* =====================================
                      CHAT MESSAGES
                  ===================================== */

                  chatLog.map((turn, idx) => (

                    <article
                      key={idx}
                      className="space-y-1.5 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3.5 backdrop-blur-sm transition-all hover:border-slate-700"
                    >

                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">

                        <span
                          className="h-2.5 w-2.5 rounded-full shadow-sm"
                          style={{
                            backgroundColor: turn.color
                          }}
                        />

                        <span
                          style={{
                            color: turn.color
                          }}
                        >
                          {turn.speaker || turn.name}
                        </span>

                      </div>

                      <p className="pl-3.5 text-xs leading-relaxed text-slate-300 font-normal">
                        {turn.text}
                      </p>

                    </article>

                  ))

                )}

              </div>

            </div>
          )}

        </div>


        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950 px-4 py-2.5 text-center shrink-0">

          <p className="text-[11px] text-slate-500 font-mono tracking-tight">
            Ctrl+M toggles mock mode
          </p>

        </footer>

      </div>

    </aside>
  )
}

