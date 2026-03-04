import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

interface Section {
  heading: string
  body: string
}

interface LegalPageProps {
  title: string
  subtitle: string
  lastUpdated: string
  sections: Section[]
}

export default function LegalPage({ title, subtitle, lastUpdated, sections }: LegalPageProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-[800px] mx-auto px-8 h-16 flex items-center gap-4">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-serif font-bold text-primary text-lg">Hope Catalyst</span>
        </div>
      </header>

      <div className="pt-16 max-w-[800px] mx-auto px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-4">Legal</p>
          <h1 className="text-3xl font-serif font-bold text-primary mb-3">{title}</h1>
          <p className="text-sm text-gray-400 mb-2">{subtitle}</p>
          <p className="text-xs text-gray-300 mb-12">Last updated: {lastUpdated}</p>

          <div className="space-y-10">
            {sections.map((s, i) => (
              <div key={i} className="border-t border-gray-100 pt-8">
                <h2 className="font-serif font-bold text-primary text-lg mb-3">{s.heading}</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 mt-16 pt-6 flex items-center justify-between">
            <p className="text-xs text-gray-300">© {new Date().getFullYear()} Hope Catalyst</p>
            <a href="https://instagram.com/osegonte.webdev" target="_blank" rel="noreferrer"
              className="text-xs text-gray-200 hover:text-gray-400 transition-colors tracking-widest uppercase">
              osegonte.webdev
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}