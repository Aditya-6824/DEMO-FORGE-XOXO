import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, LayoutTemplate, Star, ArrowRight } from 'lucide-react'

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
}

export function Templates() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<any[]>([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const mockTpls = [
      { id:'1', category:'fintech', title:'Stripe Payments API', description:'Walk through creating a payment intent and confirming a charge end-to-end.', icon: '💳' },
      { id:'2', category:'api', title:'REST Authentication API', description:'Register, login, and fetch a user profile using a JWT auth API.', icon: '🔐' },
      { id:'3', category:'ai', title:'OpenAI Chat Completions', description:'Send prompts to GPT-4 and receive AI-generated responses.', icon: '🤖' },
      { id:'4', category:'fintech', title:'Rewards & Incentives API', description:'Browse a rewards catalog, select items, and redeem points via API.', icon: '🎁' },
      { id:'5', category:'devops', title:'Webhook Integration', description:'Register a webhook endpoint, trigger an event, and receive the payload.', icon: '⚡' }
    ]
    setTemplates(mockTpls)
  }, [])

  const filtered = templates.filter(t => filter === 'all' || t.category === filter)

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)', position:'relative' }}>
      
      {/* Dynamic Background Flare */}
      <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:800, height:600, background:'var(--secondary)', filter:'blur(200px)', opacity:0.03, pointerEvents:'none' }} />

      {/* NAVBAR */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
        style={{
          height:70, background:'rgba(255,255,255,0.01)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.05)',
          display:'flex', alignItems:'center', padding:'0 40px', gap:16, position:'sticky', top:0, zIndex:100
        }}>
        <motion.button whileHover={{ color: '#fff' }} onClick={() => navigate('/dashboard')} style={{ background:'transparent', border:'none', color:'var(--text-secondary)', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:14, fontWeight:600, transition:'color 0.2s' }}>
          <ChevronLeft size={16} /> Back to Dashboard
        </motion.button>
        <div style={{ width:1, height:24, background:'rgba(255,255,255,0.1)' }} />
        <div style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:8 }}>
          <LayoutTemplate size={16} color="var(--accent)" /> Templates
        </div>
      </motion.div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'80px 40px' }}>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration: 0.6 }} style={{ textAlign:'center', marginBottom:60 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(0, 240, 255, 0.05)', border:'1px solid rgba(0, 240, 255, 0.2)', color:'var(--accent)', padding:'6px 16px', borderRadius:20, fontSize:12, fontWeight:700, marginBottom:24, boxShadow:'0 0 20px var(--accent-subtle)' }}>
            <Star size={14} fill="currentColor" /> CURATED WORKFLOWS
          </div>
          <h1 style={{ fontSize:'clamp(40px, 5vw, 56px)', fontWeight:800, color:'var(--text-primary)', margin:'0 0 16px 0', fontFamily:'var(--app-font-display)', letterSpacing:'-0.02em' }}>
            Start with a Template
          </h1>
          <p style={{ fontSize:18, color:'var(--text-secondary)', maxWidth:600, margin:'0 auto', lineHeight:1.6 }}>
            Deploy professional-grade API workflows in seconds. Fully customizable, interactive, and beautifully designed.
          </p>
        </motion.div>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2, duration:0.6 }} style={{ display:'flex', gap:12, justifyContent:'center', marginBottom:48, flexWrap:'wrap' }}>
          {['all', 'fintech', 'api', 'ai', 'devops'].map(cat => (
            <motion.button key={cat} 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(cat)} style={{
              background: filter === cat ? 'var(--text-primary)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${filter === cat ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
              color: filter === cat ? '#000' : 'var(--text-secondary)',
              padding:'10px 24px', borderRadius:999, fontSize:14, fontWeight:700, cursor:'pointer', textTransform:'capitalize',
              transition:'none', boxShadow: filter === cat ? '0 0 24px var(--text-primary)' : 'none'
            }}>
              {cat === 'all' ? 'All Templates' : cat}
            </motion.button>
          ))}
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" animate="show" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:24 }}>
          {filtered.map(t => (
            <motion.div key={t.id} variants={itemVariant} className="glass-panel glare-effect" style={{
              borderRadius:24, padding:32, display:'flex', flexDirection:'column', gap:20, cursor:'pointer', position:'relative', overflow:'hidden'
            }}
            whileHover={{ y: -8, borderColor: 'rgba(255,255,255,0.15)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
            >
              <div style={{ width:64, height:64, borderRadius:16, background:'rgba(255,255,255,0.02)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(255,255,255,0.05)', fontSize:28, boxShadow:'inset 0 1px 0 rgba(255,255,255,0.1)' }}>
                {t.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', margin:'0 0 12px 0', fontFamily:'var(--app-font-display)', letterSpacing:'-0.01em' }}>{t.title}</h3>
                <p style={{ fontSize:15, color:'var(--text-secondary)', margin:0, lineHeight:1.6 }}>{t.description}</p>
              </div>
              <div style={{ marginTop:'auto', paddingTop:24, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                <motion.button whileHover={{ background:'rgba(255,255,255,0.08)' }} style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)', color:'var(--text-primary)', padding:'14px', borderRadius:12, fontSize:14, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:8, cursor:'pointer' }}>
                  Use Template <ArrowRight size={16} color="var(--accent)" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
