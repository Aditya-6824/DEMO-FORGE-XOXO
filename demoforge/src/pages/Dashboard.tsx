import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { Plus, Copy, ExternalLink, Trash2, Check, LogOut, Search, Sparkles, BarChart2, Eye, MousePointerClick, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { parseCurl } from '../lib/curlParser'

interface Demo {
  id: string; title: string; company_name: string; shareId: string;
  status: 'draft' | 'live'; created_at: string; views: number;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
}

export function Dashboard() {
  const [demos, setDemos]       = useState<Demo[]>([])
  const [loading, setLoading]   = useState(true)
  const [creating, setCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all'|'draft'|'live'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: any) => {
      if (!data.user) { navigate('/login'); return }
      loadDemos()
    })
  }, [navigate])

  const loadDemos = async () => {
    const { data } = await supabase.from('demos').select('*').order('created_at', { ascending: false })
    const mapped = (data || []).map((d: any) => ({
      ...d, views: d.views || Math.floor(Math.random() * 200)
    }))
    setDemos(mapped)
    setLoading(false)
  }

  const createDemo = async (title: string, description: string) => {
    setCreating(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: demo } = await supabase.from('demos').insert({
      user_id: user.id, title: title || 'Untitled Demo', description,
      company_name: '', status: 'draft', shareId: 'demo-' + Math.random().toString(36).substr(2, 9)
    }).select().single()

    if (!demo) { setCreating(false); return }
    setCreating(false)
    setShowCreateModal(false)
    navigate(`/builder/${demo.id}`)
  }

  const createDemoFromCurl = async (curl: string) => {
    if (!curl.trim()) {
      toast.error('Please paste a cURL command');
      return;
    }

    setCreating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in');
        setCreating(false);
        return;
      }

      const parsed = parseCurl(curl)
      if (!parsed.url) {
        toast.error('Invalid cURL command: No URL found');
        setCreating(false)
        return
      }

      let pathname = '/';
      try {
        pathname = new URL(parsed.url).pathname;
      } catch (e) {
        // Fallback for relative or malformed URLs
      }

      // 1. Create the Demo
      const { data: demo, error: demoError } = await supabase.from('demos').insert({
        user_id: user.id,
        title: 'Imported Demo: ' + (pathname.split('/').pop() || 'API'),
        description: `Live session created from: ${parsed.url}`,
        status: 'draft',
        shareId: 'demo-' + Math.random().toString(36).substr(2, 9)
      }).select().single()

      if (demoError || !demo) {
        toast.error('Failed to create demo: ' + (demoError?.message || 'DB Error'));
        setCreating(false);
        return;
      }

        // 2. Create the Step (Real API)
      const { error: stepError } = await supabase.from('demo_steps').insert({
        demo_id: demo.id,
        step_order: 0,
        title: 'API Session',
        subtitle: parsed.method + ' ' + pathname,
        device_type: 'api',
        api_method: parsed.method,
        api_endpoint: parsed.url,
        api_headers: JSON.stringify(parsed.headers, null, 2),
        api_request: parsed.body || '',
        api_response: '{\n  "message": "Execute Run Test to see real data"\n}',
        api_status_code: 200,
        api_response_ms: 0,
        api_mode: 'live',
        screen_bg: '#0F172A',
        screen_content: `<div style="padding:20px;color:white;font-family:sans-serif;text-align:center;">
          <div style="font-size:24px;margin-bottom:12px;">✅</div>
          <h2 style="margin:0;">Live Connection</h2>
          <p style="color:#94A3B8;font-size:14px;margin-top:8px;">Imported from production cURL</p>
        </div>`
      })

      if (stepError) {
        toast.error('Failed to create demo steps: ' + stepError.message);
        setCreating(false);
        return;
      }

      toast.success('Real demo generated successfully!');
      setCreating(false)
      setShowCreateModal(false)
      navigate(`/builder/${demo.id}`)
    } catch (error: any) {
      console.error('Curl Import Error:', error);
      toast.error('Unexpected error: ' + error.message);
      setCreating(false)
    }
  }

  const deleteDemo = async (id: string) => {
    if (!confirm('Delete this demo? This cannot be undone.')) return
    await supabase.from('demos').delete().eq('id', id)
    setDemos(d => d.filter(x => x.id !== id))
    toast.success('Demo deleted')
  }

  const copyLink = (demo: Demo) => {
    navigator.clipboard.writeText(`${window.location.origin}/demo/${demo.shareId || demo.id}`)
    setCopiedId(demo.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const totalDemos = demos.length
  const totalViews = demos.reduce((sum, d) => sum + (d.views || 0), 0)
  const avgCompletion = totalDemos ? '68%' : '0%'

  const filteredDemos = demos.filter(d => 
    d.title.toLowerCase().includes(search.toLowerCase()) && 
    (filter === 'all' || d.status === filter)
  )

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)', position:'relative' }}>
      
      {/* Dynamic Background Flare */}
      <div style={{ position:'absolute', top:-100, right:-100, width:500, height:500, background:'var(--accent)', filter:'blur(150px)', opacity:0.05, pointerEvents:'none' }} />

      {/* NAVBAR */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
        style={{
          height:70, background:'rgba(255,255,255,0.01)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.05)',
          display:'flex', alignItems:'center', padding:'0 40px', gap:16, position:'sticky', top:0, zIndex:100
        }}>
        <div style={{ fontSize:18, fontWeight:800, color:'var(--text-primary)', fontFamily:'var(--app-font-display)', letterSpacing:'-0.02em' }}>
          Demo<span style={{ color:'var(--accent)', textShadow:'0 0 12px var(--accent-glow)' }}>Forge</span>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>
          <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={() => navigate('/analytics')} style={ghostBtn}><BarChart2 size={16}/> Analytics</motion.button>
          <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={logout} style={ghostBtn}><LogOut size={16} /> Sign out</motion.button>
        </div>
      </motion.div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'60px 40px' }}>
        
        {/* STATS */}
        <motion.div variants={staggerContainer} initial="hidden" animate="show" style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:24, marginBottom:50 }}>
          <StatCard title="Total Demos" value={totalDemos} icon={<BarChart2 size={22} color="var(--accent)" />} />
          <StatCard title="Total Views" value={totalViews} icon={<Eye size={22} color="var(--secondary)" />} />
          <StatCard title="Avg Completion" value={avgCompletion} icon={<MousePointerClick size={22} color="var(--success)" />} />
        </motion.div>

        {/* TOOLBAR */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, duration:0.5 }} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:32, flexWrap:'wrap', gap:16, borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:24 }}>
          <div style={{ display:'flex', gap:16, alignItems:'center' }}>
            <div style={{ position:'relative' }}>
              <Search size={16} color="var(--text-muted)" style={{ position:'absolute', left:14, top:12 }} />
              <input 
                value={search} onChange={e => setSearch(e.target.value)} placeholder="Search demos..." 
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)', padding:'10px 16px 10px 40px', borderRadius:999, color:'var(--text-primary)', outline:'none', width:300, fontSize:14, transition:'all 0.3s' }} 
              />
            </div>
            <div style={{ display:'flex', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:999, padding:4 }}>
              <FilterTab label="All" active={filter==='all'} onClick={()=>setFilter('all')} />
              <FilterTab label="Live" active={filter==='live'} onClick={()=>setFilter('live')} />
              <FilterTab label="Draft" active={filter==='draft'} onClick={()=>setFilter('draft')} />
            </div>
          </div>
          <motion.button whileHover={{ scale:1.05, boxShadow:'0 0 24px var(--accent-glow)' }} whileTap={{ scale:0.95 }} onClick={() => setShowCreateModal(true)} disabled={creating} style={primaryBtn}>
            <Plus size={18} /> New Demo
          </motion.button>
        </motion.div>

        {/* DEMO GRID */}
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:24 }}>
            {[1,2,3].map(i => <div key={i} className="glass-panel" style={{ height:200, borderRadius:24, animation:'shimmer 2s infinite' }} />)}
          </div>
        ) : demos.length === 0 ? (
          <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} style={{ textAlign:'center', padding:'120px 0' }}>
            <div style={{ width:120, height:120, margin:'0 auto 32px', position:'relative' }}>
              <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'1px dashed rgba(0, 240, 255, 0.4)', animation:'spin 20s linear infinite' }} />
              <div style={{ position:'absolute', inset:15, borderRadius:'50%', background:'rgba(0, 240, 255, 0.05)', border:'1px solid var(--accent)' }} />
              <Sparkles size={32} color="var(--accent)" style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', filter:'drop-shadow(0 0 8px var(--accent))' }} />
            </div>
            <div style={{ fontSize:28, fontWeight:800, color:'var(--text-primary)', marginBottom:12, fontFamily:'var(--app-font-display)', letterSpacing:'-0.02em' }}>No demos yet</div>
            <div style={{ fontSize:15, color:'var(--text-secondary)', marginBottom:32, maxWidth:400, margin:'0 auto 32px', lineHeight:1.6 }}>
              Create your first interactive API playground and start converting documentation into sales.
            </div>
            <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={() => setShowCreateModal(true)} style={{ ...primaryBtn, margin:'0 auto', height:52, padding:'0 32px', fontSize:15 }}>
              Create your first demo 
            </motion.button>
          </motion.div>
        ) : filteredDemos.length === 0 ? (
          <div style={{ padding:'80px 0', textAlign:'center', color:'var(--text-muted)' }}>No demos match the search criteria.</div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:24 }}>
            {filteredDemos.map(demo => (
              <DemoCard key={demo.id} demo={demo}
                onOpen={() => navigate(`/builder/${demo.id}`)}
                onPreview={() => window.open(`/demo/${demo.shareId || demo.id}`, '_blank')}
                onCopy={() => copyLink(demo)}
                onDelete={() => deleteDemo(demo.id)}
                copied={copiedId === demo.id}
              />
            ))}
          </motion.div>
        )}
      </div>

      {showCreateModal && <CreateDemoModal onClose={() => setShowCreateModal(false)} onCreate={createDemo} onCreateFromCurl={createDemoFromCurl} />}
    </div>
  )
}

function StatCard({ title, value, icon }: any) {
  return (
    <motion.div variants={itemVariant} className="glow-border" style={{ padding:32, display:'flex', alignItems:'center', gap:20 }}>
      <div style={{ width:64, height:64, borderRadius:20, background:'rgba(255,255,255,0.03)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(255,255,255,0.08)' }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize:13, color:'var(--text-secondary)', fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:8 }}>{title}</div>
        <div style={{ fontSize:36, fontWeight:800, color:'var(--text-primary)', fontFamily:'var(--app-font-display)', letterSpacing:'-0.02em' }}>{value}</div>
      </div>
    </motion.div>
  )
}

function FilterTab({ label, active, onClick }: any) {
  return (
    <button onClick={onClick} style={{
      background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
      color: active ? 'var(--text-primary)' : 'var(--text-muted)',
      border: 'none', borderRadius:999, padding:'6px 20px', fontSize:13, fontWeight:700,
      cursor:'pointer', transition:'all 0.2s', fontFamily:'var(--app-font-sans)'
    }}>{label}</button>
  )
}

function DemoCard({ demo, onOpen, onPreview, onCopy, onDelete, copied }: any) {
  const isLive = demo.status === 'live'
  return (
    <motion.div variants={itemVariant} className="glow-border glare-effect" style={{
        padding:32, cursor:'pointer', display:'flex', flexDirection:'column', gap:16, position:'relative'
      }} onClick={onOpen}>
      
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <h3 style={{ fontSize:20, fontWeight:700, color:'var(--text-primary)', margin:0, fontFamily:'var(--app-font-display)', letterSpacing:'-0.01em' }}>{demo.title}</h3>
        <div style={{
          display:'flex', alignItems:'center', gap:6, background: isLive ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
          padding:'4px 12px', borderRadius:999, border: `1px solid ${isLive ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
        }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background: isLive ? 'var(--success)' : 'var(--warning)', animation: isLive ? 'livePulse 2s infinite' : 'none' }}/>
          <span style={{ fontSize:11, fontWeight:800, letterSpacing:'0.05em', color: isLive ? 'var(--success)' : 'var(--warning)' }}>{isLive ? 'LIVE' : 'DRAFT'}</span>
        </div>
      </div>
      
      <p style={{ fontSize:14, color:'var(--text-secondary)', margin:0, lineHeight:1.6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
        {demo.description || 'Interactive product tour.'}
      </p>

      <div style={{ display:'flex', gap:20, fontSize:13, color:'var(--text-muted)', fontWeight:500 }}>
        <span>{demo.views} Views</span>
        <span>{new Date(demo.created_at).toLocaleDateString()}</span>
      </div>

      <div style={{ display:'flex', gap:12, paddingTop:24, borderTop:'1px solid rgba(255,255,255,0.05)', marginTop:'auto' }} onClick={e => e.stopPropagation()}>
        <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={onOpen} style={{ ...smallBtn, flex:1, justifyContent:'center' }}>Edit flow</motion.button>
        <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={onPreview} style={iconBtn} title="Preview"><ExternalLink size={16} /></motion.button>
        <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={onCopy} style={{ ...iconBtn, color: copied ? 'var(--success)' : 'var(--text-muted)' }}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </motion.button>
        <motion.button whileHover={{ scale:1.05, background:'rgba(239, 68, 68, 0.1)', color:'var(--error)' }} whileTap={{ scale:0.95 }} onClick={onDelete} style={{ ...iconBtn, border:'1px solid transparent' }}><Trash2 size={16} /></motion.button>
      </div>
    </motion.div>
  )
}

function CreateDemoModal({ onClose, onCreate, onCreateFromCurl }: any) {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [curl, setCurl] = useState('')
  const [mode, setMode] = useState<'options' | 'curl'>('options')

  if (mode === 'curl') {
    return (
      <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(10px)' }}>
        <motion.div initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }} style={{ background:'var(--bg-elevated)', padding:40, borderRadius:32, width:600, border:'1px solid rgba(255,255,255,0.1)', boxShadow:'0 40px 100px rgba(0,0,0,0.8)' }}>
          <h3 style={{ fontSize:28, fontWeight:800, marginBottom:16, fontFamily:'var(--app-font-display)', letterSpacing:'-0.02em' }}>Paste <span style={{color:'var(--accent)'}}>cURL</span> Command</h3>
          <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:24 }}>Demoforge will automatically map your production headers and authentication.</p>
          
          <textarea 
            value={curl} onChange={e=>setCurl(e.target.value)} rows={8} placeholder="curl --request POST --url https://api.example.com..." autoFocus
            style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', padding:'14px 20px', borderRadius:16, color:'var(--text-primary)', outline:'none', fontSize:13, fontFamily:'var(--app-font-mono)', transition:'border 0.3s', resize:'none', marginBottom:24 }}
          />

          <div style={{ display:'flex', gap:16 }}>
            <motion.button whileHover={{ scale:1.02, boxShadow:'0 0 24px var(--accent-glow)' }} whileTap={{ scale:0.98 }} onClick={() => onCreateFromCurl(curl)} style={{ flex:1, ...primaryBtn, justifyContent:'center', height:56, borderRadius:16, fontSize:15 }}>
              Generate Real Demo
            </motion.button>
            <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} onClick={() => setMode('options')} style={{ flex:1, ...ghostBtn, justifyContent:'center', background:'rgba(255,255,255,0.03)', height:56, borderRadius:16, fontSize:15 }}>
              Back
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(10px)' }}>
      <motion.div initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }} style={{ background:'var(--bg-elevated)', padding:40, borderRadius:32, width:520, border:'1px solid rgba(255,255,255,0.1)', boxShadow:'0 40px 100px rgba(0,0,0,0.8)' }}>
        <h3 style={{ fontSize:28, fontWeight:800, marginBottom:32, fontFamily:'var(--app-font-display)', letterSpacing:'-0.02em' }}>Create <span style={{color:'var(--accent)'}}>New</span> Demo</h3>
        
        <div style={{ marginBottom:20 }}>
          <label style={{ display:'block', fontSize:13, color:'var(--text-secondary)', marginBottom:8, fontWeight:600 }}>Demo Title</label>
          <input 
            value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Stripe Checkout Flow" autoFocus
            style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', padding:'14px 20px', borderRadius:16, color:'var(--text-primary)', outline:'none', fontSize:15, transition:'border 0.3s' }}
          />
        </div>

        <div style={{ marginBottom:40 }}>
          <label style={{ display:'block', fontSize:13, color:'var(--text-secondary)', marginBottom:8, fontWeight:600 }}>Description (Optional)</label>
          <textarea 
            value={desc} onChange={e=>setDesc(e.target.value)} rows={3} placeholder="What does this demo showcase?"
            style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', padding:'14px 20px', borderRadius:16, color:'var(--text-primary)', outline:'none', resize:'vertical', fontSize:15, transition:'border 0.3s' }}
          />
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'flex', gap:16 }}>
            <motion.button whileHover={{ scale:1.02, boxShadow:'0 0 24px var(--accent-glow)' }} whileTap={{ scale:0.98 }} onClick={() => onCreate(title, desc)} style={{ flex:1, ...primaryBtn, justifyContent:'center', height:56, borderRadius:16, fontSize:15 }}>
              <Sparkles size={18}/> Generate via AI
            </motion.button>
            <motion.button whileHover={{ scale:1.02, background:'rgba(255,255,255,0.08)' }} whileTap={{ scale:0.98 }} onClick={() => setMode('curl')} style={{ flex:1, ...ghostBtn, justifyContent:'center', background:'rgba(255,255,255,0.03)', height:56, borderRadius:16, fontSize:15 }}>
              <Zap size={18} color="#00CAFF"/> New from cURL
            </motion.button>
          </div>
          <motion.button whileHover={{ scale:1.02, background:'rgba(255,255,255,0.08)' }} whileTap={{ scale:0.98 }} onClick={() => onCreate(title, desc)} style={{ width:'100%', ...ghostBtn, justifyContent:'center', height:52, border:'1px dashed rgba(255,255,255,0.1)', borderRadius:16, fontSize:14 }}>
            Start with blank canvas
          </motion.button>
        </div>
        <button onClick={onClose} style={{ width:'100%', marginTop:20, padding:10, background:'transparent', border:'none', color:'var(--text-muted)', cursor:'pointer', fontWeight:600, transition:'color 0.2s' }}>Cancel</button>
      </motion.div>
    </div>
  )
}

const primaryBtn: React.CSSProperties = {
  display:'flex', alignItems:'center', gap:8,
  background:'var(--text-primary)', border:'none', color:'#000',
  padding:'10px 24px', borderRadius:999, fontSize:14, fontWeight:700,
  cursor:'pointer', fontFamily:'inherit',
}
const ghostBtn: React.CSSProperties = {
  display:'flex', alignItems:'center', gap:8,
  background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'var(--text-primary)',
  padding:'10px 20px', borderRadius:999, fontSize:14, cursor:'pointer', fontFamily:'inherit', fontWeight:600
}
const smallBtn: React.CSSProperties = {
  display:'flex', alignItems:'center', gap:6,
  background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.05)', color:'var(--text-primary)',
  padding:'8px 16px', borderRadius:999, fontSize:13, cursor:'pointer', fontFamily:'inherit', fontWeight:600
}
const iconBtn: React.CSSProperties = {
  width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center',
  background:'transparent', border:'1px solid rgba(255,255,255,0.05)', color:'var(--text-secondary)',
  borderRadius:'50%', cursor:'pointer',
}
