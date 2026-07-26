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
  ExternalLink,
  Share2,
  FileBox
} from 'lucide-react'

// Initial documents list (empty by default)
const INITIAL_FILES = []

function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

function getFileIcon(filename) {
  const ext = (filename || '').split('.').pop().toLowerCase()
  if (ext === 'pdf') return <FileText className="h-4 w-4 text-rose-400 shrink-0" />
  if (['txt', 'md', 'doc', 'docx'].includes(ext)) return <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
  if (['json', 'js', 'py', 'ts', 'html', 'css'].includes(ext)) return <FileCode className="h-4 w-4 text-purple-400 shrink-0" />
  if (['csv', 'xlsx', 'xls'].includes(ext)) return <FileSpreadsheet className="h-4 w-4 text-emerald-400 shrink-0" />
  return <FileBox className="h-4 w-4 text-amber-400 shrink-0" />
}

export default function FileManager({ selectedFiles, setSelectedFiles }) {
  const [internalFiles, setInternalFiles] = useState(INITIAL_FILES)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sharedId, setSharedId] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const fileInputRef = useRef(null)

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null)

  // Use props if provided, otherwise internal fallback
  const fileList = selectedFiles !== undefined ? selectedFiles : internalFiles
  const updateFileList = setSelectedFiles || setInternalFiles

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSelectFile = (file) => {
    // Revoke previous PDF preview URL
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl)
      setPdfPreviewUrl(null)
    }

    setSelectedFile(file)

    const ext = (file?.name || '')
      .split('.')
      .pop()
      .toLowerCase()

    const isPdf =
      file?.isPdf ||
      ext === 'pdf' ||
      file?.type === 'application/pdf'

    if (isPdf && file?.rawFile instanceof Blob) {
      const url = URL.createObjectURL(file.rawFile)

      setPdfPreviewUrl(url)
    }
  }

  // Process uploaded files
  const processUploadedFiles = (fileListToProcess) => {
    if (!fileListToProcess || fileListToProcess.length === 0) {
      return
    }

    const files = Array.from(fileListToProcess)

    files.forEach((file) => {
      const ext = file.name
        .split('.')
        .pop()
        .toLowerCase()

      const isPdf =
        ext === 'pdf' ||
        file.type === 'application/pdf'

      if (isPdf) {
        const newFileObj = {
          id: `file-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 7)}`,

          name: file.name,

          size: file.size,

          type: 'application/pdf',

          isPdf: true,

          lastModified:
            file.lastModified || Date.now(),

          // Keep the actual File
          rawFile: file,

          // Don't convert PDF to text
          content: null,
        }

        updateFileList((prev) => [
          newFileObj,
          ...(prev || []).filter(
            (f) => f.name !== file.name
          ),
        ])

        showToast(`Uploaded "${file.name}"`)

        return
      }

      // Text files
      const reader = new FileReader()

      reader.onload = (e) => {
        const newFileObj = {
          id: `file-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 7)}`,

          name: file.name,

          size: file.size,

          type: file.type || 'text/plain',

          isPdf: false,

          lastModified:
            file.lastModified || Date.now(),

          content: e.target.result || '',

          rawFile: file,
        }

        updateFileList((prev) => [
          newFileObj,
          ...(prev || []).filter(
            (f) => f.name !== file.name
          ),
        ])

        showToast(`Uploaded "${file.name}"`)
      }

      reader.readAsText(file)
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

  // Delete file
  const handleDeleteFile = (id, name, e) => {
    if (e) e.stopPropagation()
    updateFileList((prev) => (prev || []).filter((f) => (f.id ? f.id !== id : f.name !== name)))
    if (selectedFile && (selectedFile.id === id || selectedFile.name === name)) {
      setSelectedFile(null)
    }
    showToast(`Deleted "${name}"`)
  }

  const handleCopyContent = (content) => {
    if (!content) return
    navigator.clipboard.writeText(typeof content === 'string' ? content : JSON.stringify(content, null, 2))
    setCopied(true)
    showToast('Content copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenInNewTab = (file, e) => {
    e?.preventDefault()
    e?.stopPropagation()

    if (!file) {
      console.error('No file selected')
      return
    }

    // We only need the original File object.
    // It is stored when the PDF is uploaded.
    const originalFile = file.rawFile

    if (!(originalFile instanceof Blob)) {
      console.error('Original PDF File is missing:', file)
      showToast('PDF file is not available')
      return
    }

    // Create a temporary URL for the original PDF
    const pdfUrl = URL.createObjectURL(originalFile)

    // Use an anchor element instead of window.open().
    // This is triggered directly by the user's click.
    const link = document.createElement('a')

    link.href = pdfUrl
    link.target = '_blank'
    link.rel = 'noopener noreferrer'

    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)

    // Keep URL alive for the new browser tab
    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl)
    }, 5 * 60 * 1000)
  }

  // Share file / Copy link
  const handleShareFile = async (file, e) => {
    if (e) e.stopPropagation()
    let blobUrl = null

    if (file.rawFile instanceof File) {
      blobUrl = URL.createObjectURL(file.rawFile)
    }

    const shareData = {
      title: file.name,
      text: `Document: ${file.name}`,
      url: blobUrl || window.location.href
    }

    if (navigator.share && blobUrl) {
      try {
        await navigator.share(shareData)
        setSharedId(file.id || file.name)
        showToast(`Shared "${file.name}"`)
        setTimeout(() => setSharedId(null), 2000)
        return
      } catch (err) { }
    }

    // Copy Content or URL fallback
    const textToCopy = (typeof file.content === 'string' && !file.content.startsWith('data:') && file.content.length < 20000)
      ? file.content
      : (blobUrl || file.name)

    navigator.clipboard.writeText(textToCopy)
    setSharedId(file.id || file.name)
    showToast(`Copied content/link of "${file.name}" to clipboard!`)
    setTimeout(() => setSharedId(null), 2000)
  }

  const filteredFiles = (fileList || []).filter((f) =>
    (f.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (



    <div className="flex flex-col text-slate-100 relative">
      {/* Notification Toast */}
      {toastMessage && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-xl bg-cyan-950/95 text-cyan-300 border border-cyan-500/50 shadow-2xl text-[11px] font-semibold backdrop-blur-md animate-fadeIn flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.csv,.xlsx,.xls,.doc,.docx,.json"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Drag & Drop Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative cursor-pointer overflow-hidden rounded-xl border border-dashed p-3.5 text-center transition-all ${isDragOver
          ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
          : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
          }`}
      >
        <div className="flex flex-col items-center justify-center gap-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 text-cyan-400 transition-transform group-hover:scale-110">
            <UploadCloud className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200">
              Upload Context Documents
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Supports PDF, TXT, Excel, Word, JSON
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar & Header */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/80 py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-cyan-500/50"
          />
        </div>
        <span className="shrink-0 rounded-full border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-[10px] text-slate-400 font-mono">
          {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
        </span>
      </div>

      {/* Uploaded Files List */}
      <div className="mt-2.5 max-h-48 overflow-y-auto space-y-1.5 pr-1">
        {filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800/60 bg-slate-900/30 p-4 text-center text-slate-500">
            <AlertCircle className="mb-1 h-4 w-4 text-slate-600" />
            <p className="text-xs">No documents uploaded</p>
          </div>
        ) : (
          filteredFiles.map((file, idx) => (
            <div
              key={file.id || file.name || idx}
              onClick={() => handleSelectFile(file)}
              className="group flex items-center justify-between gap-2 rounded-xl border border-slate-800/80 bg-slate-900/60 p-2 transition-all hover:border-cyan-500/40 hover:bg-slate-900/90 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-950">
                  {getFileIcon(file.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {formatBytes(file.size)}
                  </p>
                </div>
              </div>

              {/* Action Buttons: View, Open in New Tab, Share & Delete */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectFile(file)
                  }}
                  className="flex h-6.5 w-6.5 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/80 text-slate-400 transition-colors hover:border-cyan-500/50 hover:bg-cyan-950/40 hover:text-cyan-300 cursor-pointer"
                  title="View Document"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleOpenInNewTab(file, e)}
                  className="flex h-6.5 w-6.5 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/80 text-slate-400 transition-colors hover:border-purple-500/50 hover:bg-purple-950/40 hover:text-purple-300 cursor-pointer"
                  title="Open in New Tab"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleShareFile(file, e)}
                  className="flex h-6.5 w-6.5 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/80 text-slate-400 transition-colors hover:border-emerald-500/50 hover:bg-emerald-950/40 hover:text-emerald-300 cursor-pointer"
                  title="Share File / Copy Link"
                >
                  {sharedId === (file.id || file.name) ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Share2 className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteFile(file.id, file.name, e)}
                  className="flex h-6.5 w-6.5 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/80 text-slate-400 transition-colors hover:border-rose-500/50 hover:bg-rose-950/40 hover:text-rose-400 cursor-pointer"
                  title="Delete File"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Document Content Viewer Modal */}
      {selectedFile && (() => {
        const ext = (selectedFile.name || '').split('.').pop().toLowerCase()
        const isPdf = selectedFile.isPdf || ext === 'pdf' || selectedFile.type === 'application/pdf'

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md animate-fadeIn">
            <div className="flex w-full max-w-4xl h-[85vh] flex-col rounded-2xl border border-slate-800 bg-slate-900/95 text-slate-100 shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-5 py-4 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900">
                    {getFileIcon(selectedFile.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-slate-100">
                        {selectedFile.name}
                      </h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border uppercase ${isPdf
                        ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                        : 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60'
                        }`}>
                        {isPdf ? 'PDF' : ext.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {formatBytes(selectedFile.size)} • Document Viewer
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleOpenInNewTab(selectedFile, e)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-700 hover:text-white cursor-pointer"
                    title="Open in Standalone Window"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Open in Tab</span>
                  </button>

                  {!isPdf && selectedFile.content && (
                    <button
                      type="button"
                      onClick={() => handleCopyContent(selectedFile.content)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-700 hover:text-white cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Content</span>
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

              {/* Modal Body */}
              {isPdf ? (
                <div className="flex-1 bg-slate-950 p-2 overflow-hidden flex flex-col">
                  <object
                    data={selectedFile.content}
                    type="application/pdf"
                    className="w-full h-full rounded-xl border border-slate-800/80 bg-slate-900"
                  >
                    <iframe
                      src={selectedFile.content}
                      title={selectedFile.name}
                      className="w-full h-full rounded-xl border border-slate-800/80 bg-slate-900"
                    />
                  </object>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-5 font-mono text-xs text-slate-300 leading-relaxed bg-slate-950/60 selection:bg-cyan-500/30">
                  <pre className="whitespace-pre-wrap break-words">{selectedFile.content}</pre>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/80 px-5 py-3 text-[11px] text-slate-400 shrink-0">
                <span>
                  {isPdf
                    ? 'PDF Document Viewer'
                    : typeof selectedFile.content === 'string'
                      ? `Lines: ${selectedFile.content.split('\n').length}`
                      : 'Document Preview'}
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


