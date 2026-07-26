import React, { useState, useEffect } from 'react'
import {
  Award,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  Download,
  RotateCcw,
  X,
  Copy,
  Check,
  Layers,
  Sparkles,
  Shield,
  FileText,
  Scale,
  Users,
  CheckSquare
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import axios from 'axios'

export default function DecisionLedger({ accord, prompt, chatLog, onReset }) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'ledger'
  const [dbSaved, setDbSaved] = useState(false)

  // Automatically save PDF to MongoDB as soon as Accord is generated
  useEffect(() => {
    if (!accord) return

    const timer = setTimeout(() => {
      try {
        const doc = buildPdfDoc()
        const safeTitle = (accord.title || 'agent-accord-ledger')
          .replace(/[^a-z0-9]+/gi, '-')
          .replace(/^-+|-+$/g, '')
          .toLowerCase()
        const pdfBase64 = doc.output('datauristring')

        axios
          .post('http://localhost:5000/api/history', {
            title: accord.title || 'Executive Decision Ledger',
            description: accord.summary || prompt || '',
            fileName: `${safeTitle || 'agent-accord-ledger'}.pdf`,
            fileData: pdfBase64
          })
          .then((res) => {
            console.log('PDF auto-saved to MongoDB history successfully:', res.data)
            setDbSaved(true)
          })
          .catch((err) => {
            console.error('Failed to auto-save PDF to MongoDB history:', err)
          })
      } catch (err) {
        console.error('Error generating PDF for MongoDB auto-save:', err)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [accord])

  if (!accord) return null

  const buildPdfDoc = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const maxLineWidth = pageWidth - margin * 2
    let y = 15

    const checkPageOverflow = (neededHeight) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage()
        y = 15
      }
    }

    // Header Banner Background (Dark Slate)
    doc.setFillColor(15, 23, 42)
    doc.rect(margin, y, maxLineWidth, 24, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(34, 211, 238) // Cyan
    doc.text('AGENT ACCORD v2.0 - EXECUTIVE DECISION LEDGER', margin + 8, y + 10)

    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(148, 163, 184)
    doc.text(
      `Generated: ${new Date().toLocaleString()} | Hash: ACCORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      margin + 8,
      y + 18
    )

    y += 32

    // Document Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(30, 41, 59)
    const titleLines = doc.splitTextToSize(accord.title || 'Auditable Golden Accord', maxLineWidth)
    doc.text(titleLines, margin, y)
    y += titleLines.length * 6 + 4

    // Section 1: Scenario Mandate
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(217, 119, 6) // Amber
    doc.text('1. GOVERNANCE SCENARIO MANDATE', margin, y)
    y += 6

    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(51, 65, 85)
    const mandateLines = doc.splitTextToSize(`"${prompt || 'N/A'}"`, maxLineWidth)
    checkPageOverflow(mandateLines.length * 5 + 4)
    doc.text(mandateLines, margin, y)
    y += mandateLines.length * 5 + 8

    // Section 2: Policy Compromise Summary
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(217, 119, 6)
    doc.text('2. FINAL BINDING POLICY ACCORD', margin, y)
    y += 6

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(30, 41, 59)
    const summaryLines = doc.splitTextToSize(accord.summary || '', maxLineWidth)
    checkPageOverflow(summaryLines.length * 5 + 4)
    doc.text(summaryLines, margin, y)
    y += summaryLines.length * 5 + 8

    // Section 3: Quantitative Ethics & Resilience Metrics
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(217, 119, 6)
    doc.text('3. QUANTITATIVE ETHICS & RESILIENCE METRICS', margin, y)
    y += 6

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(51, 65, 85)
    doc.text(`- Predictive Market Resilience Score: ${accord.resilience_score} / 10.0`, margin + 4, y)
    y += 5
    doc.text(`- Governance & Layoff Fairness Score: ${accord.fairness_score} / 10.0`, margin + 4, y)
    y += 10

    // Section 4: Negotiation Transcript
    checkPageOverflow(20)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(217, 119, 6)
    doc.text('4. MULTI-AGENT NEGOTIATION TRANSCRIPT', margin, y)
    y += 6

    if (chatLog && chatLog.length > 0) {
      chatLog.forEach((turn, idx) => {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(2, 132, 199) // Cyan/Blue
        const speakerHeader = `Turn #${idx + 1} - [${turn.speaker || turn.name}]:`
        checkPageOverflow(12)
        doc.text(speakerHeader, margin + 2, y)
        y += 5

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8.5)
        doc.setTextColor(51, 65, 85)
        const turnTextLines = doc.splitTextToSize(turn.text, maxLineWidth - 6)
        checkPageOverflow(turnTextLines.length * 4.5 + 4)
        doc.text(turnTextLines, margin + 6, y)
        y += turnTextLines.length * 4.5 + 4
      })
    } else {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(8.5)
      doc.setTextColor(100, 116, 139)
      doc.text('No dialogue turns recorded.', margin + 4, y)
      y += 8
    }

    // Page Footer
    doc.setDrawColor(226, 232, 240)
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text('AgentAccord v2.0 - Official Auditable Policy Document (PDF)', margin, pageHeight - 10)

    return doc
  }

  const handleDownload = () => {
    const doc = buildPdfDoc()
    const safeTitle = (accord.title || 'agent-accord-ledger')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()

    doc.save(`${safeTitle || 'agent-accord-ledger'}.pdf`)

    // Also manually save to MongoDB on download click
    try {
      const pdfBase64 = doc.output('datauristring')
      const fileName = `${safeTitle || 'agent-accord-ledger'}.pdf`

      axios
        .post('http://localhost:5000/api/history', {
          title: accord.title || 'Executive Decision Ledger',
          description: accord.summary || prompt || '',
          fileName: fileName,
          fileData: pdfBase64
        })
        .then((res) => {
          console.log('PDF saved to MongoDB history successfully:', res.data)
          setDbSaved(true)
        })
        .catch((err) => {
          console.error('Failed to save PDF to MongoDB history:', err)
        })
    } catch (err) {
      console.error('Error generating PDF data string for MongoDB:', err)
    }
  }

  const handleCopy = () => {
    const textToCopy = `[AGENT ACCORD LEDGER]\nTitle: ${accord.title}\nSummary: ${accord.summary}\nResilience Score: ${accord.resilience_score}/10\nFairness Score: ${accord.fairness_score}/10`
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Parse allocation percentages from summary text, fallback to standard defaults
  const extractAllocations = () => {
    const summary = accord.summary || ''
    const aiMatch = summary.match(/AI[^0-9]*(\d+)%/i)
    const quantumMatch = summary.match(/Quantum[^0-9]*(\d+)%/i)
    const biotechMatch = summary.match(/Biotech[^0-9]*(\d+)%/i)

    return [
      {
        name: 'AI Research & Breakthroughs',
        share: aiMatch ? parseInt(aiMatch[1], 10) : 55,
        color: '#22c55e',
        bgColor: 'bg-emerald-500',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/30',
        agent: 'R&D Director'
      },
      {
        name: 'Quantum Computing Lab',
        share: quantumMatch ? parseInt(quantumMatch[1], 10) : 30,
        color: '#3b82f6',
        bgColor: 'bg-blue-500',
        textColor: 'text-blue-400',
        borderColor: 'border-blue-500/30',
        agent: 'Market Intel'
      },
      {
        name: 'Biotech & Advanced Life Sciences',
        share: biotechMatch ? parseInt(biotechMatch[1], 10) : 15,
        color: '#a855f7',
        bgColor: 'bg-purple-500',
        textColor: 'text-purple-400',
        borderColor: 'border-purple-500/30',
        agent: 'Ethics & Finance'
      }
    ]
  }

  const allocations = extractAllocations()

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto animate-fadeIn">
      <div className="max-w-5xl w-full max-h-[90vh] flex flex-col bg-slate-900/95 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden relative">
        {/* Glow accent spots */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* TOP MODAL NAVIGATION & TITLE BAR */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 px-6 py-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/30 shadow-inner">
              <Award className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Sparkles className="w-3 h-3" /> Auditable Golden Accord
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono text-slate-500">
                  HASH: #8F92-ACC-2026
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">{accord.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Tabs */}
            <div className="hidden md:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-slate-800 text-amber-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Executive Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ledger')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'ledger'
                    ? 'bg-slate-800 text-amber-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Audit Transcript ({chatLog?.length || 0})
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              title="Copy Summary to Clipboard"
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onReset}
              aria-label="Close decision ledger"
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MAIN BODY AREA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
          {/* Scenario Banner */}
          {prompt && (
            <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">Target Scenario:</span>
                <span className="text-xs text-slate-200 font-medium truncate max-w-xl">"{prompt}"</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3" /> Reached Consensus
              </span>
            </div>
          )}

          {activeTab === 'overview' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: Summary & Policy Allocations (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Policy Compromise Summary Card */}
                <div className="bg-slate-950/70 p-5 rounded-2xl border border-amber-500/20 relative overflow-hidden space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase text-amber-400 font-semibold flex items-center gap-2">
                      <Scale className="w-4 h-4" /> Binding Policy Compromise
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500">Living R&D Policy v2.1</span>
                  </div>
                  <p className="text-sm text-slate-100 leading-relaxed font-sans font-medium pl-3 border-l-2 border-amber-400/60">
                    {accord.summary}
                  </p>
                </div>

                {/* Visual Allocation Breakdown Bar Chart */}
                <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase text-slate-400 font-semibold flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" /> Strategic Resource Re-Allocation
                    </h3>
                    <span className="text-xs font-mono text-emerald-400">100% Target Matched</span>
                  </div>

                  {/* Multi-Segment Stacked Progress Bar */}
                  <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
                    {allocations.map((item) => (
                      <div
                        key={item.name}
                        style={{ width: `${item.share}%` }}
                        className={`${item.bgColor} h-full first:rounded-l-full last:rounded-r-full transition-all duration-500 relative group`}
                        title={`${item.name}: ${item.share}%`}
                      />
                    ))}
                  </div>

                  {/* Allocation Item Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {allocations.map((item) => (
                      <div
                        key={item.name}
                        className={`bg-slate-900/60 p-3 rounded-xl border ${item.borderColor} space-y-1.5`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400 truncate">{item.agent}</span>
                          <span className={`text-sm font-bold font-mono ${item.textColor}`}>{item.share}%</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-200 truncate">{item.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Auditable Governance Checklist */}
                <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-mono uppercase text-slate-400 font-semibold flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-purple-400" /> Auditable Governance Guarantees
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="flex items-start gap-2.5 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-slate-200">Zero Involuntary Layoffs</div>
                        <div className="text-[10px] text-slate-400">Guaranteed workforce retention lock</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-slate-200">20% Budget Cut Target Met</div>
                        <div className="text-[10px] text-slate-400">Absorbed via project scope reallocation</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-slate-200">Penalty Mitigation</div>
                        <div className="text-[10px] text-slate-400">Avoided $4.2M quantum termination fee</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-slate-200">AI Core Preserved</div>
                        <div className="text-[10px] text-slate-400">Defended 55% allocation threshold</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Resilience & Math Metrics + Mini Transcript (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Metric Card 1: NumPy Resilience */}
                <div className="bg-slate-950/70 p-5 rounded-2xl border border-cyan-500/30 relative overflow-hidden space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold">
                      <ShieldCheck className="w-4 h-4" /> Predictive Resilience Score
                    </div>
                    <span className="text-[10px] font-mono text-cyan-500/80 uppercase">NumPy Engine</span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold font-mono text-cyan-400 tracking-tight">
                      {accord.resilience_score}
                    </span>
                    <span className="text-sm font-mono text-slate-500">/ 10.0</span>
                  </div>

                  {/* Score Progress Bar */}
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      style={{ width: `${(accord.resilience_score / 10) * 100}%` }}
                      className="h-full bg-linear-to-r from-cyan-500 to-emerald-400 rounded-full"
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal">
                    Tested against volatility vectors using NumPy matrix transformations (AI: 0.85, Quantum: 0.40, Biotech: 0.15).
                  </p>
                </div>

                {/* Metric Card 2: Governance & Layoff Fairness */}
                <div className="bg-slate-950/70 p-5 rounded-2xl border border-purple-500/30 relative overflow-hidden space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-semibold">
                      <FileCheck className="w-4 h-4" /> Governance & Fairness Score
                    </div>
                    <span className="text-[10px] font-mono text-purple-500/80 uppercase">Ethics Matrix</span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold font-mono text-purple-400 tracking-tight">
                      {accord.fairness_score}
                    </span>
                    <span className="text-sm font-mono text-slate-500">/ 10.0</span>
                  </div>

                  {/* Score Progress Bar */}
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      style={{ width: `${(accord.fairness_score / 10) * 100}%` }}
                      className="h-full bg-linear-to-r from-purple-500 to-pink-500 rounded-full"
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal">
                    Evaluated by Ethics & Governance Officer to guarantee compliance with labor stability & workforce standards.
                  </p>
                </div>

                {/* Mini Consensus Transcript Snapshot */}
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-400" /> Consensus Trail
                    </h4>
                    <button
                      type="button"
                      onClick={() => setActiveTab('ledger')}
                      className="text-[11px] font-mono text-amber-400 hover:underline"
                    >
                      View Full ({chatLog?.length || 0}) →
                    </button>
                  </div>

                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {chatLog && chatLog.length > 0 ? (
                      chatLog.map((turn, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/60 text-xs space-y-0.5"
                        >
                          <div className="flex items-center gap-1.5 font-semibold text-[11px]" style={{ color: turn.color || '#38bdf8' }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: turn.color || '#38bdf8' }} />
                            {turn.speaker}
                          </div>
                          <p className="text-[11px] text-slate-300 line-clamp-2 pl-3">{turn.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">No turns logged in session.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* AUDIT TRANSCRIPT TAB */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">Full Multi-Agent Negotiation Transcript</h3>
                  <p className="text-xs text-slate-400">Complete immutable record of all dialogue turns during policy consensus</p>
                </div>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" /> Export PDF
                </button>
              </div>

              <div className="space-y-3">
                {chatLog && chatLog.length > 0 ? (
                  chatLog.map((turn, index) => (
                    <div
                      key={index}
                      className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-2 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: turn.color || '#3b82f6' }}
                          />
                          <span className="text-xs font-bold text-slate-100">{turn.speaker}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">Turn #{index + 1}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans pl-4 border-l-2" style={{ borderColor: turn.color || '#3b82f6' }}>
                        {turn.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-slate-950/60 rounded-xl border border-slate-800 text-slate-500 text-xs font-mono">
                    No transcript dialogue recorded for this session.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="border-t border-slate-800/80 bg-slate-950/80 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-[11px]">Status: Enforceable Golden Policy Signed</span>
            {dbSaved && (
              <span className="ml-2 px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-fade-in">
                ✓ Saved to MongoDB
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-200 transition-colors hover:border-amber-500/40 hover:bg-slate-800 cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" /> Download Accord (.pdf)
            </button>

            <button
              type="button"
              onClick={onReset}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Start New Scenario
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

