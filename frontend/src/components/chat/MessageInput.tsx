import { useState, useRef } from 'react'
import { MessageSquare, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import AttachmentChip from '@/components/attachments/AttachmentChip'
import type { Attachment } from '@/types'

interface MessageInputProps {
  onSend: (message: string, attachmentIds: string[]) => Promise<void>
  onUpload: (file: File) => Promise<Attachment>
  onDeleteAttachment: (attachmentId: string) => Promise<void>
  isPending: boolean
}

export default function MessageInput({
  onSend,
  onUpload,
  onDeleteAttachment,
  isPending,
}: MessageInputProps) {
  const [text, setText] = useState('')
  const [pendingFiles, setPendingFiles] = useState<{ file: File; attachment?: Attachment }[]>([])
  const [uploading, setUploading] = useState(false)
  const [attachmentError, setAttachmentError] = useState<string>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    setAttachmentError(undefined)
    const uploaded: { file: File; attachment: Attachment }[] = []
    try {
      for (const file of files) {
        const attachment = await onUpload(file)
        uploaded.push({ file, attachment })
      }
      setPendingFiles((previous) => [...previous, ...uploaded])
    } catch {
      await Promise.allSettled(
        uploaded.map(({ attachment }) => onDeleteAttachment(attachment.id))
      )
      setAttachmentError('Não foi possível enviar os anexos. Verifique o formato e os limites.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeFile = async (index: number) => {
    const pendingFile = pendingFiles[index]
    if (!pendingFile?.attachment) return

    setAttachmentError(undefined)
    try {
      await onDeleteAttachment(pendingFile.attachment.id)
      setPendingFiles((previous) => previous.filter((_, itemIndex) => itemIndex !== index))
    } catch {
      setAttachmentError('Não foi possível remover o anexo do servidor.')
    }
  }

  const handleSubmit = async () => {
    if (!text.trim() || isPending) return
    const ids = pendingFiles.map((file) => file.attachment?.id).filter(Boolean) as string[]
    setAttachmentError(undefined)
    try {
      await onSend(text.trim(), ids)
      setText('')
      setPendingFiles([])
    } catch {
      setAttachmentError('A mensagem não foi enviada. Os anexos foram mantidos para nova tentativa.')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit()
    }
  }

  return (
    <div className="p-4 border-t border-slate-200 bg-white/60 backdrop-blur-sm">
      {attachmentError && (
        <p className="mb-3 text-sm text-red-600" role="alert">
          {attachmentError}
        </p>
      )}

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
        accept=".pdf,.xlsx"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
