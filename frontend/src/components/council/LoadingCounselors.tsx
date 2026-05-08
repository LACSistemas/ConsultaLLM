import { Card, CardContent, CardHeader } from '@/components/ui/card'

const SKELETONS = [
  { border: 'border-l-blue-200', bg: 'bg-blue-50' },
  { border: 'border-l-green-200', bg: 'bg-green-50' },
  { border: 'border-l-purple-200', bg: 'bg-purple-50' },
]

export default function LoadingCounselors() {
  return (
    <div className="mb-6">
      <div className="h-6 bg-slate-200 rounded w-48 mx-auto mb-4 animate-pulse" />
      <div className="grid gap-4 md:grid-cols-3">
        {SKELETONS.map((s, i) => (
          <Card key={i} className={`animate-pulse border-l-4 ${s.border} ${s.bg}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-300 rounded" />
                <div className="h-5 bg-gray-300 rounded w-28" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded" />
                <div className="h-4 bg-gray-300 rounded" />
                <div className="h-4 bg-gray-300 rounded w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-4 h-32 bg-yellow-100 border-2 border-yellow-300 rounded-lg animate-pulse" />
    </div>
  )
}
