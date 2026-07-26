import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  History as HistoryIcon,
  Download,
  Trash2,
  Search,
  RefreshCw,
  FileText,
  Calendar,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'
import axios from 'axios'

export default function HistoryPage({ onBack }) {
  const [historyItems, setHistoryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get('http://localhost:5000/api/history')
      if (response.data?.success) {
        setHistoryItems(response.data.data || [])
      } else {
        setHistoryItems([])
      }
    } catch (err) {
      console.error('Error fetching history:', err)
      setError('Failed to connect to MongoDB server. Ensure your backend server on port 5000 is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title || 'this history record'}"?`)) {
      return
    }

    try {
      await axios.delete(`http://localhost:5000/api/history/${id}`)
      setHistoryItems((prev) => prev.filter((item) => item._id !== id))
    } catch (err) {
      console.error('Error deleting record:', err)
      alert('Failed to delete history item.')
    }
  }

  const handleDownloadPdf = async (item) => {
    try {
      // Fetch single item by ID to get binary fileData if omitted in list
      const res = await axios.get(`http://localhost:5000/api/history/${item._id}`)
      const fullItem = res.data?.data || item

      const pdfData = fullItem.pdfFile?.fileData

      if (!pdfData) {
        alert('No binary PDF data found for this history record.')
        return
      }

      let blob
      if (typeof pdfData === 'string') {
        // If string (base64 or data uri)
        const base64Str = pdfData.includes(',') ? pdfData.split(',')[1] : pdfData
        const byteCharacters = atob(base64Str)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        blob = new Blob([byteArray], { type: 'application/pdf' })
      } else if (pdfData.data) {
        // Buffer object from Mongoose { type: 'Buffer', data: [...] }
        const byteArray = new Uint8Array(pdfData.data)
        blob = new Blob([byteArray], { type: 'application/pdf' })
      }

      if (blob) {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fullItem.pdfFile?.fileName || `${(fullItem.title || 'history-accord').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Error downloading PDF:', err)
      alert('Failed to download PDF file.')
    }
  }

  const filteredItems = historyItems.filter((item) => {
    const query = searchQuery.toLowerCase()
    return (
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.pdfFile?.fileName && item.pdfFile.fileName.toLowerCase().includes(query))
    )
  })

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden font-sans">
      {/* Background Cyber Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-size-[48px_48px] opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-cyan-950/20 via-slate-900/10 to-transparent" />

      {/* Header Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/90 text-slate-300 hover:text-white hover:border-cyan-500/40 transition-colors cursor-pointer text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to App
          </button>

          <div className="h-6 w-[1px] bg-slate-800" />

          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <HistoryIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                Executive Decision History
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  MongoDB Cloud
                </span>
              </h1>
              <p className="text-xs text-slate-400">Auditable Golden Accords & Stored PDF Documents</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            title="Refresh History List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col space-y-6">
        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history records by title, summary, or PDF file name..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Total Records: <span className="font-bold text-cyan-400">{filteredItems.length}</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold">Connection Error</p>
              <p className="text-red-300/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mb-3" />
            <p className="text-xs font-mono">Loading history records from MongoDB...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center bg-slate-900/30 rounded-2xl border border-slate-800/60 p-8">
            <div className="p-4 rounded-full bg-slate-900 border border-slate-800 mb-4 text-slate-600">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-300">No History Records Found</h3>
            <p className="text-xs text-slate-500 max-w-md mt-1">
              {searchQuery
                ? 'No history matches your search query. Try clearing the filter.'
                : 'Run a negotiation debate and export an Executive Decision Ledger to store your first PDF history record in MongoDB.'}
            </p>
          </div>
        ) : (
          /* History Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="group relative bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(34,211,238,0.1)] hover:-translate-y-0.5"
              >
                <div>
                  {/* Card Top Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      <Sparkles className="w-3 h-3" /> Accord PDF Record
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDelete(item._id, item.title)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete Record from MongoDB"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-white tracking-tight line-clamp-2 mb-2 group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                      {item.description}
                    </p>
                  )}
                </div>

                <div>
                  {/* Metadata Bar */}
                  <div className="border-t border-slate-800/80 pt-3 mt-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <span className="flex items-center gap-1 text-slate-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> PDF Stored
                    </span>
                  </div>

                  {/* Download Action Button */}
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(item)}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" /> Download Saved PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
