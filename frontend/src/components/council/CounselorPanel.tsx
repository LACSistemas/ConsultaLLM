import type { CounselorResponse } from '@/types'
import CounselorCard from './CounselorCard'

interface CounselorPanelProps {
  counselors: CounselorResponse[]
}

export default function CounselorPanel({ counselors }: CounselorPanelProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-slate-700 mb-3 text-center">
        Perspectivas dos Conselheiros
      </h3>
      <div className="grid gap-4 md:grid-cols-3">
        {counselors.map((c, i) => (
          <CounselorCard key={i} counselor={c} />
        ))}
      </div>
    </div>
  )
}
