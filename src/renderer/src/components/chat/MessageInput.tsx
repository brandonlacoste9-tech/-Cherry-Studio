import React, { useState, useCallback, useRef } from 'react'
import { Send, Paperclip, X, Square } from 'lucide-react'
import { DocumentService } from '../../services/DocumentService'
import type { MessageAttachment } from '../../types'

interface MessageInputProps {
  onSend: (content: string, attachments?: MessageAttachment[]) => void
  disabled?: boolean
  sendWithEnter?: boolean
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  sendWithEnter = true
}) => {
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState<MessageAttachment[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = useCallback(() => {
    const trimmed = content.trim()
    if (!trimmed && attachments.length === 0) return
    onSend(trimmed, attachments.length > 0 ? attachments : undefined)
    setContent('')
    setAttachments([])
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [content, attachments, onSend])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (sendWithEnter && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return
    const newAttachments: MessageAttachment[] = []
    for (const file of Array.from(files)) {
      const doc = await DocumentService.processFile(file)
      newAttachments.push({
        id: doc.id,
        name: file.name,
        type: DocumentService.isImageType(file.type)
          ? 'image'
          : file.name.endsWith('.pdf')
          ? 'pdf'
          : 'document',
        mimeType: file.type,
        data: doc.content,
        size: file.size
      })
    }
    setAttachments((prev) => [...prev, ...newAttachments])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg px-2 py-1 text-sm"
            >
              {att.type === 'image' ? (
                <img
                  src={att.data}
                  alt={att.name}
                  className="w-6 h-6 object-cover rounded"
                />
              ) : (
                <Paperclip size={14} />
              )}
              <span className="max-w-[120px] truncate text-zinc-700 dark:text-zinc-300">
                {att.name}
              </span>
              <button
                onClick={() => removeAttachment(att.id)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        className={`relative flex items-end gap-2 rounded-xl border ${
          isDragging
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-950'
            : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800'
        } px-4 py-3 transition-colors`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors shrink-0 mb-1"
          title="Attach file"
        >
          <Paperclip size={18} />
        </button>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? 'Waiting for response...' : 'Send a message...'}
          rows={1}
          className="flex-1 bg-transparent resize-none outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm leading-relaxed max-h-[200px] overflow-y-auto"
        />

        <button
          onClick={handleSend}
          disabled={disabled || (!content.trim() && attachments.length === 0)}
          className={`shrink-0 mb-1 p-1.5 rounded-lg transition-colors ${
            disabled || (!content.trim() && attachments.length === 0)
              ? 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
              : 'text-white bg-blue-500 hover:bg-blue-600'
          }`}
          title={sendWithEnter ? 'Send (Enter)' : 'Send'}
        >
          {disabled ? <Square size={16} /> : <Send size={16} />}
        </button>
      </div>

      <div className="flex items-center justify-between mt-1.5 px-1">
        <p className="text-xs text-zinc-400">
          {sendWithEnter ? 'Enter to send · Shift+Enter for new line' : 'Shift+Enter to send'}
        </p>
        <p className="text-xs text-zinc-400">{content.length > 0 ? `${content.length} chars` : ''}</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={DocumentService.getAcceptedFileTypes()}
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
    </div>
  )
}
