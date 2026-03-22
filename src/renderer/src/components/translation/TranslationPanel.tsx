import React, { useState } from 'react'
import { Languages, ArrowLeftRight, Copy, RefreshCw, Check } from 'lucide-react'
import { TranslationService } from '../../services/TranslationService'
import type { TranslationResult } from '../../types'

export const TranslationPanel: React.FC = () => {
  const [sourceText, setSourceText] = useState('')
  const [sourceLang, setSourceLang] = useState('auto')
  const [targetLang, setTargetLang] = useState('zh-CN')
  const [result, setResult] = useState<TranslationResult | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleTranslate = async () => {
    if (!sourceText.trim()) return
    setIsTranslating(true)
    setError('')
    try {
      const res = await TranslationService.translate({
        text: sourceText,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang
      })
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Translation failed')
    } finally {
      setIsTranslating(false)
    }
  }

  const handleSwap = () => {
    if (result) {
      setSourceText(result.translatedText)
      setSourceLang(targetLang)
      setTargetLang(sourceLang === 'auto' ? 'en' : sourceLang)
      setResult(null)
    }
  }

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.translatedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const langs = TranslationService.SUPPORTED_LANGUAGES

  return (
    <div className="flex flex-col h-full p-4 gap-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <Languages size={20} className="text-blue-500" />
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">AI Translation</h2>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className="flex-1 px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-1 focus:ring-blue-400"
        >
          <option value="auto">Auto-detect</option>
          {langs.map((l) => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>

        <button
          onClick={handleSwap}
          disabled={!result}
          className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-700 disabled:opacity-40 transition-colors"
          title="Swap languages"
        >
          <ArrowLeftRight size={16} />
        </button>

        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="flex-1 px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-1 focus:ring-blue-400"
        >
          {langs.map((l) => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 flex flex-col gap-3 min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Source Text</label>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) handleTranslate()
            }}
            placeholder="Enter text to translate... (Ctrl+Enter to translate)"
            className="flex-1 p-3 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-1 focus:ring-blue-400 resize-none"
          />
        </div>

        <button
          onClick={handleTranslate}
          disabled={isTranslating || !sourceText.trim()}
          className="flex items-center justify-center gap-2 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl transition-colors font-medium text-sm"
        >
          {isTranslating ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Translating...
            </>
          ) : (
            <>
              <Languages size={16} />
              Translate
            </>
          )}
        </button>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {result && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Translation</label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="flex-1 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-y-auto text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed whitespace-pre-wrap">
              {result.translatedText}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-400 text-center">
        Powered by your configured AI provider · Ctrl+Enter to translate
      </p>
    </div>
  )
}
