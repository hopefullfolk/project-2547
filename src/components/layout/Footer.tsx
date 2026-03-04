import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface FooterProps {
  onOpenModal: () => void
  onCheckStatus: () => void
}

function AccordionSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-t border-white/10">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between py-5 text-left">
        <span className="text-xs font-bold tracking-[0.15em] uppercase text-white">{title}</span>
        <ChevronDown className={`w-4 h-4 text-white/50 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-60 mb-4' : 'max-h-0'}`}>
        <ul className="space-y-3 pb-2">{children}</ul>
      </div>
    </div>
  )
}

export default function Footer({ onOpenModal, onCheckStatus }: FooterProps) {
  const navigate = useNavigate()

  const scrollTo = (id: string) => {
    const el = document.querySelector(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else { navigate('/'); setTimeout(() => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' }), 150) }
  }

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-[1200px] mx-auto px-8 lg:px-12">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 py-16 lg:py-20">

          {/* Left — Brand */}
          <div>
            <div className="mb-8">
              <img src="/logo.svg" alt="Hope Catalyst" className="h-9 w-auto" />
            </div>
            <p className="text-sm text-white/60 leading-relaxed max-w-sm">
              Supporting Nigerian students with transparent, verified school fee payments. Every naira, accounted for.
            </p>
          </div>

          {/* Right — Accordions */}
          <div className="lg:pl-16">

            <AccordionSection title="How It Works">
              <li>
                <button onClick={onOpenModal} className="text-sm text-white/60 hover:text-white transition-colors text-left">
                  Submit a Request
                </button>
              </li>
              <li>
                <button onClick={onCheckStatus} className="text-sm text-white/60 hover:text-white transition-colors text-left">
                  Check Your Status
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('#how-it-works')} className="text-sm text-white/60 hover:text-white transition-colors text-left">
                  Payment Process
                </button>
              </li>
            </AccordionSection>

            <AccordionSection title="Organisation">
              <li>
                <button onClick={() => navigate('/about')} className="text-sm text-white/60 hover:text-white transition-colors text-left">
                  About Hope Catalyst
                </button>
              </li>
              <li>
                <a href="mailto:support@hopecatalyst.org" className="text-sm text-white/60 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
            </AccordionSection>

            <AccordionSection title="Legal">
              <li><button onClick={() => navigate('/privacy')} className="text-sm text-white/60 hover:text-white transition-colors text-left">Privacy Policy</button></li>
              <li><button onClick={() => navigate('/terms')} className="text-sm text-white/60 hover:text-white transition-colors text-left">Terms of Service</button></li>
              <li><button onClick={() => navigate('/data-protection')} className="text-sm text-white/60 hover:text-white transition-colors text-left">Data Protection</button></li>
            </AccordionSection>

            <div className="border-t border-white/10" />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">© {new Date().getFullYear()} Hope Catalyst. All rights reserved.</p>
          <a href="https://instagram.com/osegonte.webdev" target="_blank" rel="noreferrer"
            className="text-xs text-white/20 hover:text-white/50 transition-colors tracking-widest uppercase">
            osegonte.webdev
          </a>
        </div>

      </div>
    </footer>
  )
}