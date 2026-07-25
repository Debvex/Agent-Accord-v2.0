import React, { useState, useRef } from 'react'
import {
  UploadCloud,
  FileText,
  Trash2,
  Eye,
  X,
  Search,
  AlertCircle,
  FileCode,
  FileSpreadsheet,
  File,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react'

// Default sample documents pre-populated into the Knowledge Base
const INITIAL_FILES = [
  {
    id: 'doc-1',
    name: 'r_and_d_budget_2026.txt',
    size: 1262,
    type: 'text/plain',
    lastModified: Date.now() - 86400000 * 2,
    content: `CONFIDENTIAL - AGENTACCORD GOVERNANCE FRAMEWORK
FY2026 R&D BUDGET ALLOCATION & CONSTRAINTS MATRIX

1. EXECUTIVE MANDATE
Due to economic volatility, the executive committee requires an immediate 20% reduction in aggregate R&D expenditure for FY2026.

2. MINIMUM OPERATING THRESHOLDS & CONTRACTUAL CONSTRAINTS
- AI Initiative: Minimum required allocation ratio is 45% of total budget. Cutting below 45% breaches enterprise partnership SLAs.
- Quantum Computing: Early termination fee for IBM Quantum hardware access contracts is $4.2M. Maintaining at least 25% allocation avoids penalty triggers.
- Biotech / Synthetic Biology: Flexible project scope. Refocusing Biotech into 15% budget retains core IP while absorbing cost cuts.

3. WORKFORCE GOVERNANCE REQUIREMENT
All budget reallocations must guarantee ZERO involuntary engineering layoffs across AI, Quantum, and Biotech divisions.`
  },
  {
    id: 'doc-2',
    name: 'market_shock_vectors_2026.json',
    size: 640,
    type: 'application/json',
    lastModified: Date.now() - 86400000,
    content: `{
  "scenario": "Q3 Volatility Shock",
  "weights": {
    "AI_Initiatives": 0.85,
    "Quantum_Computing": 0.40,
    "Biotech_Research": 0.15
  },
  "resilience_baseline": 8.0,
  "fairness_target": 9.0
}`
  }
]

function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  if (ext === 'pdf') return <FileText className="h-4 w-4 text-rose-500" />
  if (['txt', 'md', 'doc', 'docx'].includes(ext)) return <FileText className="h-4 w-4 text-cyan-400" />
  if (['json', 'js', 'py', 'ts', 'html', 'css'].includes(ext)) return <FileCode className="h-4 w-4 text-emerald-400" />
  if (['csv', 'xlsx', 'xls'].includes(ext)) return <FileSpreadsheet className="h-4 w-4 text-amber-400" />
  return <File className="h-4 w-4 text-purple-400" />
}

export default function FileManager() {
  const [files, setFiles] = useState(INITIAL_FILES)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef(null)

  // Handle uploading multiple files (supporting text and PDF documents)
  const processUploadedFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return

    const ArrayOfFiles = Array.from(fileList)

    ArrayOfFiles.forEach((file) => {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      const reader = new FileReader()

      reader.onload = (e) => {
        const fileContent = e.target.result || ''
        const fileObj = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          size: file.size,
          type: file.type || (isPdf ? 'application/pdf' : 'text/plain'),
          isPdf: isPdf,
          lastModified: file.lastModified || Date.now(),
          content: fileContent
        }
        setFiles((prev) => [fileObj, ...prev.filter((f) => f.name !== file.name)])
      }

      if (isPdf) {
        reader.readAsDataURL(file)
      } else {
        reader.readAsText(file)
      }
    })
  }

  const handleFileInputChange = (e) => {
    processUploadedFiles(e.target.files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDeleteFile = (id, name, e) => {
    e.stopPropagation()
    setFiles((prev) => prev.filter((f) => f.id !== id))
    if (selectedFile?.id === id) {
      setSelectedFile(null)
    }
  }

  const handleCopyContent = (content) => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Opens any document (PDF or text) cleanly in a new browser tab
  const handleOpenInNewTab = (file, e) => {
    if (e) e.stopPropagation()

    if (typeof file.content === 'string' && file.content.startsWith('data:')) {
      try {
        const parts = file.content.split(';base64,')
        const contentType = parts[0].split(':')[1] || 'application/pdf'
        const raw = window.atob(parts[1])
        const rawLength = raw.length
        const uInt8Array = new Uint8Array(rawLength)
        for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i)
        }
        const blob = new Blob([uInt8Array], { type: contentType })
        const blobUrl = URL.createObjectURL(blob)
        window.open(blobUrl, '_blank')
      } catch (err) {
        const win = window.open('', '_blank')
        if (win) {
          win.document.write(`<html><head><title>${file.name}</title></head><body style="margin:0;"><iframe src="${file.content}" style="width:100vw;height:100vh;border:none;"></iframe></body></html>`)
        }
      }
    } else {
      const blob = new Blob([file.content || ''], { type: file.type || 'text/plain' })
      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl, '_blank')
    }
  }

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  )


  return (
    <div className="flex h-full flex-col text-slate-100">
      {/* Hidden file input supporting multiple selection */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Multi-File Upload Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative cursor-pointer overflow-hidden rounded-xl border border-dashed p-4 text-center transition-all ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
            : 'border-slate-700/80 bg-slate-900/50 hover:border-slate-500 hover:bg-slate-900/80'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800/80 text-cyan-400 transition-transform group-hover:scale-110">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-200">
              Click or drag & drop files here
            </p>
            <p className="text-[10px] text-slate-400">
              Upload multiple text, json, csv, or policy documents
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar & Stats Header */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/80 py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-cyan-500/50"
          />
        </div>
        <span className="shrink-0 rounded-full border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-[10px] text-slate-400">
          {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
        </span>
      </div>

      {/* Uploaded Files List */}
      <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800/60 bg-slate-900/30 p-6 text-center text-slate-500">
            <AlertCircle className="mb-2 h-5 w-5 text-slate-600" />
            <p className="text-xs">No documents found</p>
            <p className="text-[10px] text-slate-600">Upload files above to populate the repository</p>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => setSelectedFile(file)}
              className="group flex items-center justify-between gap-2 rounded-xl border border-slate-800/80 bg-slate-900/60 p-2.5 transition-all hover:border-cyan-500/40 hover:bg-slate-900/90 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-950">
                  {getFileIcon(file.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-200 group-hover:text-cyan-300">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>{formatBytes(file.size)}</span>
                    <span>•</span>
                    <span>{new Date(file.lastModified).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: View, Open in New Tab & Delete */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedFile(file)
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/80 text-slate-400 transition-colors hover:border-cyan-500/50 hover:bg-cyan-950/40 hover:text-cyan-300"
                  title="View File Content"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleOpenInNewTab(file, e)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/80 text-slate-400 transition-colors hover:border-purple-500/50 hover:bg-purple-950/40 hover:text-purple-300"
                  title="Open in New Tab"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteFile(file.id, file.name, e)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/80 text-slate-400 transition-colors hover:border-rose-500/50 hover:bg-rose-950/40 hover:text-rose-400"
                  title="Delete File"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* File Content Viewer Modal */}
      {selectedFile && (() => {
        const isPdf = selectedFile.isPdf ||
                      selectedFile.type === 'application/pdf' ||
                      selectedFile.name?.toLowerCase().endsWith('.pdf') ||
                      (typeof selectedFile.content === 'string' && selectedFile.content.startsWith('data:application/pdf'))

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fadeIn">
            <div className={`flex w-full flex-col rounded-2xl border border-slate-800 bg-slate-900/95 text-slate-100 shadow-2xl overflow-hidden transition-all ${
              isPdf ? 'max-w-4xl h-[85vh]' : 'max-w-2xl h-[80vh]'
            }`}>
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-5 py-4 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900">
                    {getFileIcon(selectedFile.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-slate-100">
                        {selectedFile.name}
                      </h3>
                      {isPdf && (
                        <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/30">
                          PDF
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {formatBytes(selectedFile.size)} • Uploaded {new Date(selectedFile.lastModified).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleOpenInNewTab(selectedFile, e)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-700 hover:text-white cursor-pointer"
                    title="Open in New Tab"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Open in Tab</span>
                  </button>
                  {!isPdf && (
                    <button
                      type="button"
                      onClick={() => handleCopyContent(selectedFile.content)}
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
                    onClick={() => setSelectedFile(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>


              {/* Modal Content Preview Area */}
              {isPdf ? (
                <div className="flex-1 bg-slate-950 p-2 overflow-hidden flex flex-col">
                  <iframe
                    src={selectedFile.content}
                    title={selectedFile.name}
                    className="w-full h-full rounded-xl border border-slate-800/80 bg-slate-900"
                  />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-5 font-mono text-xs text-slate-300 leading-relaxed bg-slate-950/60">
                  <pre className="whitespace-pre-wrap break-words">{selectedFile.content}</pre>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/80 px-5 py-3 text-[11px] text-slate-400 shrink-0">
                <span>
                  {isPdf
                    ? 'PDF Document Viewer'
                    : `Lines: ${typeof selectedFile.content === 'string' ? selectedFile.content.split('\n').length : 1}`}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="rounded-lg bg-cyan-600 px-4 py-1.5 font-medium text-white transition-colors hover:bg-cyan-500 cursor-pointer"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

