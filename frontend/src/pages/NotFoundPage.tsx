import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-300 mb-4">404</h1>
        <p className="text-xl text-slate-600 mb-6">Página não encontrada</p>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600">
          <Link to="/chat">Voltar ao início</Link>
        </Button>
      </div>
    </div>
  )
}
