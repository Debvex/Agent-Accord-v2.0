import React, { useState, useRef, useEffect } from 'react'
import {
  Play,
  ToggleLeft,
  ToggleRight,
  Terminal,
  Shield,
  FileText,
  Activity,
  Upload,
  File,
  X,
  MessageSquare,
  Eye,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react'

export default function Sidebar({
  role,
  setRole,
  prompt,
  setPrompt,
  selectedFile,
  setSelectedFile,
  selectedFiles = [],
  setSelectedFiles,
  isRunning,
  onRun,
  chatLog = [],
  useMockMode,
  setUseMockMode,
}) {
  const [activeTab, setActiveTab] = useState('input')
  const [isDragOver, setIsDragOver] = useState(false)
  const [previewFile, setPreviewFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewText, setPreviewText] = useState(null)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef(null)

  // Normalize files array state
  const currentFileList = selectedFiles.length > 0 ? selectedFiles : (selectedFile ? [selectedFile] : [])

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleCopyContent = (text) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Convert Base64 Data URL to a clean Blob Object
  const dataURLtoBlob = (dataurl) => {
    try {
      const arr = dataurl.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new Blob([u8arr], { type: mime })
    } catch (e) {
      console.error('Error converting base64 to blob', e)
      return null
    }
  }

  // Safely open PDF/Text in a new browser tab
  const handleOpenInNewTab = (file, e) => {
    if (e) e.stopPropagation()

    let blobUrl = null

    if (file instanceof File || file instanceof Blob) {
      blobUrl = URL.createObjectURL(file)
    } else if (typeof file.content === 'string') {
      if (file.content.startsWith('data:')) {
        const blob = dataURLtoBlob(file.content)
        if (blob) blobUrl = URL.createObjectURL(blob)
      } else {
        const blob = new Blob([file.content], { type: file.type || 'text/plain' })
        blobUrl = URL.createObjectURL(blob)
      }
    }

    if (blobUrl) {
      window.open(blobUrl, '_blank')
    } else {
      alert('Unable to open file in new tab.')
    }
  }

  // Safely preview PDF or Text document in the Modal
  const handlePreviewPdf = (fileObj, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!fileObj) return

    // Clean up previous blob URL if needed
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }

    setPreviewFile(fileObj)

    const isPdf =
      (fileObj.name || '').toLowerCase().endsWith('.pdf') ||
      fileObj.type === 'application/pdf'

    // Handle actual browser File / Blob objects
    if (fileObj instanceof File || fileObj instanceof Blob) {
      if (isPdf) {
        const blobUrl = URL.createObjectURL(fileObj)
        setPreviewUrl(blobUrl)
        setPreviewText(null)
      } else {
        const reader = new FileReader()
        reader.onload = (evt) => {
          setPreviewText(evt.target.result)
          setPreviewUrl(null)
        }
        reader.readAsText(fileObj)
      }
    }
    // Handle JSON file objects (e.g., stored with { name, content, type })
    else if (fileObj && fileObj.content) {
      if (isPdf) {
        if (fileObj.content.startsWith('data:')) {
          const blob = dataURLtoBlob(fileObj.content)
          if (blob) {
            const blobUrl = URL.createObjectURL(blob)
            setPreviewUrl(blobUrl)
          } else {
            setPreviewUrl(fileObj.content)
          }
        } else {
          const blob = new Blob([fileObj.content], { type: 'application/pdf' })
          const blobUrl = URL.createObjectURL(blob)
          setPreviewUrl(blobUrl)
        }
        setPreviewText(null)
      } else {
        setPreviewText(fileObj.content)
        setPreviewUrl(null)
      }
    }
  }

  const closePreview = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewFile(null)
    setPreviewUrl(null)
    setPreviewText(null)
  }

  const handleFileChange = (e) => {
    const rawFiles = Array.from(e.target.files || [])
    const validFiles = rawFiles.filter((file) => {
      const ext = file.name.split('.').pop().toLowerCase()
      return ext === 'pdf' || ext === 'txt'
    })

    if (validFiles.length > 0) {
      if (setSelectedFiles) {
        setSelectedFiles((prev) => {
          const existingNames = new Set((prev || []).map((f) => f.name))
          const newUnique = validFiles.filter((f) => !existingNames.has(f.name))
          return [...(prev || []), ...newUnique]
        })
      } else if (setSelectedFile) {
        setSelectedFile(validFiles[0])
      }
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const rawFiles = Array.from(e.dataTransfer.files || [])
    const validFiles = rawFiles.filter((file) => {
      const ext = file.name.split('.').pop().toLowerCase()
      return ext === 'pdf' || ext === 'txt'
    })

    if (validFiles.length > 0) {
      if (setSelectedFiles) {
        setSelectedFiles((prev) => {
          const existingNames = new Set((prev || []).map((f) => f.name))
          const newUnique = validFiles.filter((f) => !existingNames.has(f.name))
          return [...(prev || []), ...newUnique]
        })
      } else if (setSelectedFile) {
        setSelectedFile(validFiles[0])
      }
    }
  }

  const handleRemoveFile = (indexToRemove) => {
    if (setSelectedFiles) {
      setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove))
    } else if (setSelectedFile) {
      setSelectedFile(null)
    }
  }

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
              <span className="text-[10px] text-slate-400 font-medium">Mock</span>
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
          {activeTab === 'input' && (
            <div className="space-y-5 animate-fadeIn">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt"
                className="hidden"
                onChange={handleFileChange}
              />

              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragOver(true)
                }}
                onDragLeave={() => setIsDragOver(false)}
                className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
                  isDragOver
                    ? 'border-cyan-400 bg-cyan-950/30'
                    : 'border-slate-700/70 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/60'
                }`}
              >
                {currentFileList.length > 0 ? (
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                        Uploaded Documents ({currentFileList.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[10px] font-medium text-cyan-400 hover:underline cursor-pointer"
                      >
                        + Add More
                      </button>
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                      {currentFileList.map((file, idx) => (
                        <div
                          key={`${file.name}-${idx}`}
                          className="flex items-center justify-between w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-xs"
                        >
                          <div
                            onClick={(e) => handlePreviewPdf(file, e)}
                            className="flex items-center gap-2 truncate cursor-pointer group/item hover:text-cyan-300 transition-colors flex-1"
                            title="Click to preview document"
                          >
                            <File className="h-4 w-4 text-cyan-400 shrink-0" />
                            <span className="truncate text-slate-200 font-medium group-hover/item:text-cyan-300">
                              {file.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => handlePreviewPdf(file, e)}
                              className="text-slate-400 hover:text-cyan-300 transition-colors p-1 cursor-pointer"
                              title="Preview Document"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleOpenInNewTab(file, e)}
                              className="text-slate-400 hover:text-cyan-300 transition-colors p-1 cursor-pointer"
                              title="Open PDF in New Tab"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(idx)}
                              className="text-slate-400 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                              title="Remove file"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-slate-400 group-hover:text-cyan-400 transition-colors mb-2" />
                    <p className="text-xs text-slate-300 font-medium mb-3">
                      Drop PDF or TXT files here
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg border border-slate-700 bg-slate-800/90 px-4 py-1.5 text-xs font-semibold text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-800 hover:text-white cursor-pointer"
                    >
                      Browse Files
                    </button>
                  </>
                )}
              </div>

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
                    <span>DEBATING IN PROGRESS...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current text-slate-300" />
                    <span>INITIATE DEBATE</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'dialogue' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/60 pb-2">
                <span className="flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                  Dialogue Stream
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Activity className={`h-3 w-3 ${isRunning ? 'animate-pulse text-rose-400' : 'text-slate-500'}`} />
                  {isRunning ? 'Live Stream' : 'Idle'}
                </span>
              </div>

              <div className="space-y-3">
                {chatLog.length === 0 ? (
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 px-4 py-8 text-center text-xs text-slate-400 space-y-2">
                    <Shield className="mx-auto h-6 w-6 text-slate-500" />
                    <p className="font-semibold text-slate-300">No Active Debate</p>
                    <p className="text-[11px] text-slate-500">
                      Configure your Role and Proposal in the Setup tab and click Initiate Debate.
                    </p>
                  </div>
                ) : (
                  chatLog.map((turn, idx) => (
                    <article key={idx} className="space-y-1.5 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3.5 backdrop-blur-sm transition-all hover:border-slate-700">
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                        <span className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ backgroundColor: turn.color }} />
                        <span style={{ color: turn.color }}>{turn.speaker || turn.name}</span>
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

        {/* Document Viewer Modal */}
        {previewFile && (previewUrl || previewText) && (() => {
          const isPdf = (previewFile.name || '').toLowerCase().endsWith('.pdf') || previewFile.type === 'application/pdf'
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md animate-fadeIn">
              <div className="flex w-full max-w-4xl h-[85vh] flex-col rounded-2xl border border-slate-800 bg-slate-900/95 text-slate-100 shadow-2xl overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-5 py-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5 text-cyan-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-100">{previewFile.name}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                          isPdf
                            ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                            : 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60'
                        }`}>
                          {isPdf ? 'PDF' : 'TXT'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Document Viewer</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleOpenInNewTab(previewFile, e)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-700 hover:text-white cursor-pointer"
                      title="Open in New Tab"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Open in Tab</span>
                    </button>
                    {!isPdf && previewText && (
                      <button
                        type="button"
                        onClick={() => handleCopyContent(previewText)}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-700 hover:text-white cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={closePreview}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Modal Preview Body */}
                {isPdf ? (
                  <div className="flex-1 bg-slate-950 p-2 overflow-hidden flex flex-col">
                    <object
                      data={previewUrl}
                      type="application/pdf"
                      className="w-full h-full rounded-xl border border-slate-800/80 bg-slate-900"
                    >
                      <iframe
                        src={previewUrl}
                        title={previewFile.name}
                        className="w-full h-full rounded-xl border border-slate-800/80 bg-slate-900"
                      />
                    </object>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-5 font-mono text-xs text-slate-300 leading-relaxed bg-slate-950/60">
                    <pre className="whitespace-pre-wrap break-words">{previewText}</pre>
                  </div>
                )}

                {/* Modal Footer */}
                <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/80 px-5 py-3 text-[11px] text-slate-400 shrink-0">
                  <span>
                    {isPdf
                      ? 'PDF Document Viewer'
                      : `Lines: ${typeof previewText === 'string' ? previewText.split('\n').length : 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={closePreview}
                    className="rounded-lg bg-cyan-600 px-4 py-1.5 font-medium text-white transition-colors hover:bg-cyan-500 cursor-pointer"
                  >
                    Close Viewer
                  </button>
                </div>
              </div>
            </div>
          )
        })()}

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