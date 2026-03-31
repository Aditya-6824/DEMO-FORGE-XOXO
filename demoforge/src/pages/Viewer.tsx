import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { IPhoneMockup } from 'react-device-mockup'
import { supabase } from '../lib/supabase'
import { ChevronLeft, ChevronRight, Share2, Check, ExternalLink, Code2 } from 'lucide-react'
import { ApiPanel } from '../components/devices/ApiPanel'
import { MacBookFrame } from '../components/devices/MacBookFrame'
import { BrowserFrame } from '../components/devices/BrowserFrame'

interface Demo { id:string; title:string; company_name:string; company_logo:string|null; status:string; api_mode?:'mock'|'live'; brandColor?:string; shareId:string }
interface Step {
  id:string; step_order:number; title:string; subtitle:string; device_type:string;
  screen_content:string; screen_bg:string; browser_url:string; tab_title:string;
  api_method:string; api_endpoint:string; api_request:string; api_response:string;
  api_status_code:number; api_response_ms:number; api_mode?:'mock'|'live'; api_headers?:string; chain_path?:string;
}

const smoothEase = [0.16, 1, 0.3, 1]

export function Viewer() {
  const { id } = useParams<{ id: string }>()
  const [demo, setDemo] = useState<Demo | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [idx, setIdx] = useState(0)
  const [direction, setDirection] = useState(1)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [showShare, setShowShare] = useState(false)
  
  const [chainData, setChainData] = useState<any>({})
  const [liveData, setLiveData] = useState<Record<string, { body:string, status:number, ms:number, curl:string }>>({})

  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from('demos').select('*').eq('shareId', id).single().then(res => res.error ? supabase.from('demos').select('*').eq('id', id).single() : res),
    ]).then(([d]) => {
      if (!d.data) { setNotFound(true); setLoading(false); return }
      setDemo(d.data)
      supabase.from('demo_steps').select('*').eq('demo_id', d.data.id).order('step_order')
        .then(s => { setSteps(s.data || []); setLoading(false) })
    })
  }, [id])

  const resolveChainedString = (input: string) => {
    if (!input) return input;
    let res = input;
    Object.keys(chainData).forEach(k => {
      if (res.includes(k)) {
        res = res.replace(k, chainData[k]);
      }
    });
    return res;
  }

  const runLiveApi = useCallback(async (step: Step) => {
    try {
      const headers = JSON.parse(step.api_headers || '{}')
      const targetUrl = resolveChainedString(step.api_endpoint)
      const bodyStr = resolveChainedString(step.api_request)
      
      const res = await fetch('http://localhost:3001/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl, method: step.api_method, headers, body: bodyStr
        })
      })
      const data = await res.json()
      
      setLiveData(prev => ({
        ...prev,
        [step.id]: {
          body: typeof data.data === 'object' ? JSON.stringify(data.data, null, 2) : String(data.data),
          status: data.status,
          ms: data.latency,
          curl: data.curlCommand
        }
      }))

      if (step.chain_path) {
        try {
          const path = step.chain_path.replace('$.', '');
          const val = path.split('.').reduce((acc:any, part:string) => acc && acc[part], data.data);
          if (val) {
            setChainData((prev:any) => ({ ...prev, [step.chain_path!]: val }));
          }
        } catch(e) {}
      }
    } catch(e) {}
  }, [chainData])

  const goTo = useCallback((next: number) => {
    if (next < 0 || next >= steps.length) return
    setDirection(next > idx ? 1 : -1)
    setIdx(next); 
    if (steps[next].device_type === 'api' && steps[next].api_mode === 'live') {
      runLiveApi(steps[next]);
    }
  }, [steps, idx, runLiveApi])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goTo(idx + 1) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(idx - 1) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [idx, goTo])

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/demo/${demo?.shareId || demo?.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div style={fullCenter}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ width:40, height:40, borderRadius:'50%', border:'3px solid rgba(0, 240, 255, 0.2)', borderTopColor:'var(--accent)' }} />
      <div style={{ color:'var(--text-secondary)', marginTop:24, fontSize:15, fontWeight:500, letterSpacing:'0.05em' }}>PREPARING DEMO</div>
    </div>
  )

  if (notFound || !demo || steps.length === 0) return (
    <div style={fullCenter}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <div style={{ fontSize: 28, fontWeight: 800, color:'var(--text-primary)', marginBottom: 8, fontFamily:'var(--app-font-display)' }}>Demo not found</div>
      <div style={{ fontSize: 16, color:'var(--text-secondary)' }}>This link may be invalid or the demo was removed.</div>
    </div>
  )

  const step = steps[idx]
  const isFirst = idx === 0
  const isLast  = idx === steps.length - 1
  const progressPercent = ((idx + 1) / steps.length) * 100

  const renderDevice = () => {
    switch (step.device_type) {
      case 'iphone':
        return (
          <div style={{ filter: 'drop-shadow(0 32px 80px rgba(0,0,0,0.85))' }}>
            <IPhoneMockup screenType="island" screenWidth={320} frameColor="#111">
              <div style={{ width:'100%', height:'100%', background: step.screen_bg||'#000', overflow:'hidden' }} dangerouslySetInnerHTML={{ __html: step.screen_content }} />
            </IPhoneMockup>
          </div>
        )
      case 'macbook':
        return <div style={{ filter: 'drop-shadow(0 40px 100px rgba(0,0,0,0.85))' }}><MacBookFrame content={step.screen_content} bgColor={step.screen_bg} url={step.browser_url} /></div>
      case 'browser':
        return <div style={{ filter: 'drop-shadow(0 40px 100px rgba(0,0,0,0.85))' }}><BrowserFrame content={step.screen_content} bgColor={step.screen_bg} url={step.browser_url} tabTitle={step.tab_title} /></div>
      case 'api': {
        const live = liveData[step.id]
        return (
          <div style={{ display:'flex', alignItems:'center', gap:32, flexWrap:'wrap', justifyContent:'center', perspective: 1000 }}>
            <div style={{ filter:'drop-shadow(0 32px 64px rgba(0,0,0,0.9))', flexShrink: 0, transform:'rotateY(5deg)' }}>
              <IPhoneMockup screenType="island" screenWidth={280} frameColor="#111">
                <div style={{ width:'100%', height:'100%', background: step.screen_bg||'#000', overflow:'hidden' }} dangerouslySetInnerHTML={{ __html: step.screen_content }} />
              </IPhoneMockup>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, flexShrink:0 }}>
              <span style={{ fontSize:10, color:'var(--accent)', fontWeight:800, letterSpacing:'0.15em', textShadow:'0 0 10px var(--accent-glow)' }}>API RUN</span>
              <div style={{ width:60, height:2, background:'linear-gradient(90deg,var(--accent),var(--secondary))', borderRadius:1, boxShadow:'0 0 8px var(--accent)' }} />
              <svg width="12" height="8" viewBox="0 0 10 7" fill="var(--secondary)"><path d="M5 7L0 0h10z"/></svg>
            </div>
            <div style={{ flex:1, maxWidth:560, minWidth:320, display:'flex', flexDirection:'column', gap:10, transform:'rotateY(-5deg)' }}>
              <div style={{ background:'rgba(255,255,255,0.02)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:24, padding:24, boxShadow:'0 32px 64px rgba(0,0,0,0.6)' }}>
                <ApiPanel
                  method={step.api_method} endpoint={resolveChainedString(step.api_endpoint)}
                  requestBody={resolveChainedString(step.api_request)} 
                  responseBody={live ? live.body : step.api_response}
                  statusCode={live ? live.status : step.api_status_code} 
                  responseMs={live ? live.ms : step.api_response_ms}
                  stepKey={step.id}
                />
              </div>
            </div>
          </div>
        )
      }
      default: return (
        <div style={{ background:'rgba(255,255,255,0.02)', backdropFilter:'blur(20px)', borderRadius:24, padding:48, textAlign:'center', border:'1px solid rgba(255,255,255,0.05)', maxWidth:600, boxShadow:'0 32px 80px rgba(0,0,0,0.8)' }}>
          <h2 style={{ fontSize:32, fontWeight:800, marginBottom:16, fontFamily:'var(--app-font-display)', letterSpacing:'-0.02em', color:'var(--text-primary)' }}>{step.title}</h2>
          <div dangerouslySetInnerHTML={{ __html: step.description||step.screen_content }} style={{ fontSize:18, color:'var(--text-secondary)', lineHeight:1.6 }} />
        </div>
      )
    }
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 100 : -100, opacity: 0, scale: 0.96 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 100 : -100, opacity: 0, scale: 0.96 })
  }

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:'var(--bg-base)', overflow:'hidden', position:'relative' }}>
      
      {/* Background Flare */}
      <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:800, height:800, background:'var(--accent)', filter:'blur(250px)', opacity:0.04, pointerEvents:'none' }} />

      {/* Progress Bar Top */}
      <div style={{ height:3, width:'100%', background:'rgba(255,255,255,0.05)', position:'absolute', top:0, left:0, zIndex:1000 }}>
        <div style={{ height:'100%', width:`${progressPercent}%`, background:'linear-gradient(90deg, var(--accent), var(--secondary))', transition:'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow:'0 0 10px var(--accent)' }} />
      </div>

      {demo.status === 'draft' && (
        <div style={{ background:'rgba(245,158,11,0.1)', borderBottom:'1px solid rgba(245,158,11,0.2)', padding:'10px 20px', textAlign:'center', marginTop:3 }}>
          <span style={{ color:'var(--warning)', fontSize:13, fontWeight:700, letterSpacing:'0.05em' }}>⚠ DRAFT MODE — NOT PUBLIC</span>
        </div>
      )}

      {/* TOP BAR */}
      <div style={{
        height:64, background:'transparent', borderBottom:'1px solid rgba(255,255,255,0.05)',
        display:'flex', alignItems:'center', padding:'0 32px', gap:16, flexShrink:0, zIndex:10, marginTop: demo.status === 'draft' ? 0 : 3
      }}>
        {demo.company_logo
          ? <img src={demo.company_logo} style={{ height:32, borderRadius:8, objectFit:'contain' }} alt="" />
          : (
            <div style={{
              width:36, height:36, borderRadius:10, background:demo.brandColor||'linear-gradient(135deg, var(--accent), var(--secondary))',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:16, fontWeight:800, color:'#000', flexShrink:0, fontFamily:'var(--app-font-display)'
            }}>
              {(demo.company_name || demo.title).charAt(0).toUpperCase()}
            </div>
          )
        }
        <div style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)', fontFamily:'var(--app-font-display)', letterSpacing:'-0.01em' }}>
          {demo.company_name || demo.title}
        </div>

        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:20 }}>
          <span style={{ fontSize:14, color:'var(--text-secondary)', fontWeight:600 }}>
            {idx+1} <span style={{color:'var(--text-muted)'}}>/ {steps.length}</span>
          </span>
          <motion.button 
            whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
            onClick={() => setShowShare(true)} style={{
            display:'flex', alignItems:'center', gap:8,
            background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'var(--text-primary)',
            padding:'8px 16px', borderRadius:999, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
          }}>
            <Share2 size={14} /> Share
          </motion.button>
        </div>
      </div>

      {/* MAIN STAGE */}
      <div style={{
        flex:1, display:'flex', alignItems:'center', justifyContent:'center',
        padding:'40px', overflow:'hidden', position:'relative'
      }}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={idx}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: 'absolute', display:'flex', alignItems:'center', justifyContent:'center', width:'100%', height:'100%'
            }}
          >
            {renderDevice()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* BOTTOM NAV */}
      <div style={{
        height:100, background:'rgba(255,255,255,0.01)', borderTop:'1px solid rgba(255,255,255,0.05)', backdropFilter:'blur(20px)',
        display:'flex', alignItems:'center', padding:'0 40px', gap:32, flexShrink:0, zIndex:10
      }}>
        <motion.button 
          whileHover={!isFirst ? { scale:1.1, background:'rgba(255,255,255,0.08)' } : {}} whileTap={!isFirst ? { scale:0.9 } : {}}
          onClick={() => goTo(idx-1)} disabled={isFirst} style={{
          width:56, height:56, borderRadius:16, flexShrink:0, cursor: isFirst ? 'not-allowed' : 'pointer',
          background: isFirst ? 'transparent' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${isFirst ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
          color: isFirst ? 'var(--text-muted)' : 'var(--text-primary)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <ChevronLeft size={24} />
        </motion.button>

        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:16, maxWidth:600, margin:'0 auto' }}>
          <div style={{ textAlign:'center' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ fontSize:20, fontWeight:700, color:'var(--text-primary)', lineHeight:1.2, fontFamily:'var(--app-font-display)', letterSpacing:'-0.01em' }}>{step.title}</div>
                {step.subtitle && <div style={{ fontSize:15, color:'var(--text-secondary)', marginTop:6 }}>{step.subtitle}</div>}
              </motion.div>
            </AnimatePresence>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {steps.map((_, i) => (
              <div
                key={i}
                onClick={() => goTo(i)}
                style={{
                  height:8, borderRadius:4, width: i === idx ? 32 : 8,
                  background: i === idx ? 'var(--text-primary)' : i < idx ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)',
                  cursor:'pointer', transition:'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: i === idx ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
                }}
              />
            ))}
          </div>
        </div>

        <motion.button 
          whileHover={!isLast ? { scale:1.05, boxShadow:'0 0 32px var(--accent-glow)' } : {}} whileTap={!isLast ? { scale:0.95 } : {}}
          onClick={() => goTo(idx+1)} disabled={isLast} style={{
          width:56, height:56, borderRadius:16, flexShrink:0, cursor: isLast ? 'not-allowed' : 'pointer',
          background: isLast ? 'transparent' : 'var(--text-primary)',
          border: 'none', color: isLast ? 'var(--text-muted)' : '#000',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <ChevronRight size={24} />
        </motion.button>
      </div>

      {/* SHARE MODAL */}
      <AnimatePresence>
        {showShare && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(10px)' }}>
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background:'var(--bg-elevated)', padding:40, borderRadius:24, width:480, border:'1px solid rgba(255,255,255,0.1)', boxShadow:'0 40px 100px rgba(0,0,0,0.8)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32 }}>
                <h3 style={{ fontSize:24, fontWeight:800, fontFamily:'var(--app-font-display)' }}>Share <span style={{ color:'var(--accent)' }}>Demo</span></h3>
                <button onClick={() => setShowShare(false)} style={{ background:'transparent', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:24 }}>&times;</button>
              </div>
              
              <div style={{ marginBottom:24 }}>
                <label style={{ fontSize:13, color:'var(--text-secondary)', fontWeight:600 }}>Public Link</label>
                <div style={{ display:'flex', gap:12, marginTop:10 }}>
                  <input readOnly value={`${window.location.origin}/demo/${demo?.shareId || demo?.id}`} style={{ flex:1, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'var(--text-primary)', padding:'12px 16px', borderRadius:12, outline:'none' }} />
                  <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={copyLink} style={{ background:'var(--text-primary)', color:'#000', border:'none', borderRadius:12, padding:'0 24px', cursor:'pointer', fontWeight:700 }}>{copied ? 'Copied' : 'Copy'}</motion.button>
                </div>
              </div>

              <div style={{ marginBottom:32 }}>
                <label style={{ fontSize:13, color:'var(--text-secondary)', fontWeight:600 }}>Embed IFRAME</label>
                <div style={{ display:'flex', gap:12, marginTop:10 }}>
                  <input readOnly value={`<iframe src="${window.location.origin}/demo/${demo?.shareId || demo?.id}" width="100%" height="600" frameborder="0"></iframe>`} style={{ flex:1, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', color:'var(--text-primary)', padding:'12px 16px', borderRadius:12, outline:'none' }} />
                  <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={() => { navigator.clipboard.writeText(`<iframe src="${window.location.origin}/demo/${demo?.shareId || demo?.id}" width="100%" height="600" frameborder="0"></iframe>`); alert('Embedded!') }} style={{ background:'rgba(255,255,255,0.05)', color:'var(--text-primary)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'0 24px', cursor:'pointer' }}><Code2 size={18}/></motion.button>
                </div>
              </div>

              <div style={{ display:'flex', gap:16 }}>
                <motion.button whileHover={{ scale:1.02, background:'#1A8CD8' }} whileTap={{ scale:0.98 }} style={{ flex:1, display:'flex', gap:8, alignItems:'center', justifyContent:'center', padding:'14px', background:'#1DA1F2', color:'white', border:'none', borderRadius:12, cursor:'pointer', fontWeight:600 }} onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.origin}/demo/${demo?.shareId || demo?.id}`)}><ExternalLink size={16}/> Twitter</motion.button>
                <motion.button whileHover={{ scale:1.02, background:'#0854A0' }} whileTap={{ scale:0.98 }} style={{ flex:1, display:'flex', gap:8, alignItems:'center', justifyContent:'center', padding:'14px', background:'#0A66C2', color:'white', border:'none', borderRadius:12, cursor:'pointer', fontWeight:600 }} onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.origin}/demo/${demo?.shareId || demo?.id}`)}><ExternalLink size={16}/> LinkedIn</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const fullCenter: React.CSSProperties = {
  height: '100vh', background: 'var(--bg-base)',
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
}
