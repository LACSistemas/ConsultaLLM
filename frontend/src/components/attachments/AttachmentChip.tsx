import { FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AttachmentChipProps {
  filename: string
  onRemove: () => void
}

export default function AttachmentChip({ filename, onRemove }: AttachmentChipProps) {
  return (
    <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-sm text-blue-700">
      <FileText className="h-3.5 w-3.5 flex-shrink-0" />
      <span className="max-w-[140px] truncate">{filename}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 p-0 text-blue-500 hover:text-red-500 hover:bg-transparent"
        onClick={onRemove}
        type="button"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}
