import { useState, useCallback } from 'react'
import { Upload, Play, FileText, X, Zap } from 'lucide-react'

export default function SetupModal({ onFileUploaded, onStartDebate, uploadedFile, useMockMode }) {
  const [role, setRole] = useState('')
  const [prompt, setPrompt] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [localFile, setLocalFile] = useState(null)

  const handleFileUpload = useCallback(async (file) => {
    if (!file) return
    setLocalFile(file)
    setIsUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        onFileUploaded({ name: file.name, path: data.path })
      }
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setIsUploading(false)
    }
  }, [onFileUploaded])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }, [handleFileUpload])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleInputChange = (e) => {
    const file = e.target.files[0]
    if (file) handleFileUpload(file)
  }

  const handleSubmit = () => {
    if (role.trim() && prompt.trim() && (uploadedFile || useMockMode)) {
      onStartDebate(role.trim(), prompt.trim())
    }
  }

  const canStart = role.trim() && prompt.trim() && (uploadedFile || useMockMode)

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-950 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl backdrop-blur-xl bg-gray-900/60 border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            AgentAccord v2.0
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Sentient 1v1 Dialectic Engine</p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all mb-6 ${
            isDragging
              ? 'border-blue-400 bg-blue-500/10'
              : uploadedFile
              ? 'border-emerald-500/50 bg-emerald-500/5'
              : 'border-gray-600 hover:border-gray-500'
          }`}
        >
          {uploadedFile ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">{uploadedFile.name}</span>
              <span className="text-xs text-gray-500">uploaded</span>
            </div>
          ) : (
            <div>
              <Upload className="w-8 h-8 mx-auto text-gray-500 mb-2" />
              <p className="text-gray-400 text-sm">Drop a PDF or TXT file here</p>
              <label className="mt-2 inline-block px-4 py-1.5 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-sm text-gray-300 cursor-pointer transition-colors">
                Browse Files
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </label>
              {isUploading && <p className="text-blue-400 text-xs mt-2 animate-pulse">Uploading...</p>}
              {useMockMode && <p className="text-amber-400 text-xs mt-2">Optional in mock mode</p>}
            </div>
          )}
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wider">
              Your Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., CEO of Apex Labs, Mayor of New York"
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wider">
              Your Proposal
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Cut R&D by 20% immediately to boost quarterly margins"
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all resize-none"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canStart}
          className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            canStart
              ? 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white shadow-lg shadow-blue-500/20'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Play className="w-4 h-4" />
          INITIATE DEBATE
        </button>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>Ctrl+M toggles mock mode</span>
          {useMockMode && (
            <span className="flex items-center gap-1 text-amber-400">
              <Zap className="w-3 h-3" /> Mock Mode Active
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
