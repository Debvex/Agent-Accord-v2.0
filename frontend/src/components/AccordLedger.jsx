import { Award, X } from 'lucide-react'

export default function AccordLedger({ title, summary, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl backdrop-blur-xl bg-gray-900/80 border border-amber-500/30 rounded-2xl p-8 shadow-2xl shadow-amber-500/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-gray-400 text-sm mt-1">Egalitarian Compromise Reached</p>
        </div>

        <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 mb-6">
          <p className="text-gray-200 leading-relaxed text-sm whitespace-pre-wrap">{summary}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
            <div className="text-blue-400 text-lg font-bold">4</div>
            <div className="text-gray-400 text-xs">Debate Turns</div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
            <div className="text-emerald-400 text-lg font-bold">2</div>
            <div className="text-gray-400 text-xs">Agents</div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
            <div className="text-amber-400 text-lg font-bold">1</div>
            <div className="text-gray-400 text-xs">Accord</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 rounded-xl font-semibold text-sm text-white transition-all shadow-lg shadow-amber-500/20"
        >
          ACKNOWLEDGE ACCORD
        </button>
      </div>
    </div>
  )
}
