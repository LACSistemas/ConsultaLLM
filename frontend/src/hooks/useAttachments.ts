import { useMutation } from '@tanstack/react-query'
import { uploadAttachment } from '@/api/attachments'

export function useUploadAttachment(chatId: string) {
  return useMutation({
    mutationFn: (file: File) => uploadAttachment(chatId, file),
  })
}
