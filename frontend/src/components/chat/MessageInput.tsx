import { useState, useRef } from 'react'
import { MessageSquare, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import AttachmentChip from '@/components/attachments/AttachmentChip'
import type { Attachment } from '@/types'

interface MessageInputProps {
  onSend: (message: string, attachmentIds: string[]) => void
  onUpload: (file: File) => Promise<Attachment>
  isPending: boolean
}

export default function MessageInput({ onSend, onUpload, isPending }: MessageInputProps) {
  const [text, setText] = useState('')
  const [pendingFiles, setPendingFiles] = useState<{ file: File; attachment?: Attachment }[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploading(true)
    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const attachment = await onUpload(file)
          return { file, attachment }
        })
      )
      setPendingFiles((prev) => [...prev, ...uploaded])
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (!text.trim() || isPending) return
    const ids = pendingFiles.map((f) => f.attachment?.id).filter(Boolean) as string[]
    onSend(text.trim(), ids)
    setText('')
    setPendingFiles([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit()
    }
  }

  return (
    <div className="p-4 border-t border-slate-200 bg-white/60 backdrop-blur-sm">
      {pendingFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {pendingFiles.map((f, i) => (
            <AttachmentChip
              key={i}
              filename={f.file.name}
              onRemove={() => removeFile(i)}
            />
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Textarea
            placeholder="Digite sua pergunta... (Ctrl+Enter para enviar)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isPending}
            className="min-h-[80px] max-h-[200px] resize-none text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isPending}
            title="Anexar PDF ou XLSX"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!text.trim() || isPending || uploading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6"
          >
            {isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <MessageSquare className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.xlsx,.xls"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
