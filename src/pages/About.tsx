import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function About() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-8 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <img src="/logo-dark.svg" alt="Hope Catalyst" className="h-7 w-auto"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <span className="font-serif font-bold text-primary text-lg">Hope Catalyst</span>
        </div>
      </header>

      <div className="pt-16">

        {/* Hero */}
        <section className="bg-primary text-white py-24 px-8">
          <div className="max-w-[800px] mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xs font-bold tracking-[0.2em] uppercase text-white/50 mb-6"
            >
              About Us
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-8"
            >
              Turning hope into opportunity, one student at a time.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-white/70 leading-relaxed max-w-2xl"
            >
              Hope Catalyst exists to bridge the gap between ambition and access — ensuring that financial barriers 
              never stand between a Nigerian student and their education.
            </motion.p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 px-8 border-b border-gray-100">
          <div className="max-w-[800px] mx-auto grid md:grid-cols-2 gap-16">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-5">Our Mission</p>
              <p className="text-gray-700 leading-relaxed">
                We provide direct, transparent school fee assistance to verified Nigerian students. 
                Every payment goes directly to the institution — no middlemen, no cash handouts. 
                Just education, funded.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-5">Our Approach</p>
              <p className="text-gray-700 leading-relaxed">
                Students submit their request with school documentation. Our team verifies each case 
                individually, communicates with the institution, and processes payment directly. 
                Every step is tracked and visible to the applicant.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-8 border-b border-gray-100">
          <div className="max-w-[800px] mx-auto">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-12">What We Stand For</p>
            <div className="grid md:grid-cols-3 gap-12">
              {[
                { title: 'Transparency', body: 'Every naira is accounted for. Students and donors can see exactly where money goes.' },
                { title: 'Dignity', body: 'We treat every applicant with respect. Financial hardship is not a character flaw.' },
                { title: 'Accountability', body: 'We verify every request and confirm every payment before marking it complete.' },
              ].map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <h3 className="font-serif font-bold text-primary text-lg mb-3">{v.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{v.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer credit */}
        <div className="border-t border-gray-100 py-6 px-8 flex items-center justify-between max-w-[1200px] mx-auto">
          <p className="text-xs text-gray-300">© {new Date().getFullYear()} Hope Catalyst</p>
          <a href="https://instagram.com/osegonte.webdev" target="_blank" rel="noreferrer"
            className="text-xs text-gray-200 hover:text-gray-400 transition-colors tracking-widest uppercase">
            osegonte.webdev
          </a>
        </div>
      </div>
    </div>
  )
}