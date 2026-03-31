import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { ChevronLeft, BarChart2, TrendingUp, Users, Clock, Eye } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
}

export function DemoAnalytics() {
  const navigate = useNavigate()
  const [demos, setDemos] = useState<{id:string; title:string}[]>([])
  const [selectedDemo, setSelectedDemo] = useState<string>('all')
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    supabase.from('demos').select('id, title').then(res => {
      if (res.data) setDemos(res.data)
    })
    
    // Generate mock last 30 days data
    const data = []
    let base = 50
    for(let i=30; i>=0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      base = base + Math.floor(Math.random() * 20) - 5
      if (base < 10) base = 10
      data.push({
        name: d.toLocaleDateString('en-US', { month:'short', day:'numeric' }),
        views: base,
        completion: Math.min(100, Math.floor(base * 0.7 + Math.random() * 10))
      })
    }
    setChartData(data)
  }, [])

  const totalViews = chartData.reduce((acc, curr) => acc + curr.views, 0)
  
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)', position:'relative' }}>
        
      {/* Background Flare */}
      <div style={{ position:'absolute', top:100, left:-100, width:600, height:600, background:'var(--accent)', filter:'blur(200px)', opacity:0.04, pointerEvents:'none' }} />

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
          <BarChart2 size={16} color="var(--accent)" /> Analytics
        </div>
        
        <div style={{ marginLeft:'auto' }}>
          <select value={selectedDemo} onChange={e => setSelectedDemo(e.target.value)} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'var(--text-primary)', padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:600, outline:'none', cursor:'pointer', transition:'border 0.3s' }}>
            <option value="all">All Demos</option>
            {demos.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
          </select>
        </div>
      </motion.div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'60px 40px' }}>
        
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }} style={{ marginBottom:48 }}>
          <h1 style={{ fontSize:36, fontWeight:800, color:'var(--text-primary)', margin:'0 0 8px 0', fontFamily:'var(--app-font-display)', letterSpacing:'-0.02em' }}>Analytics Overview</h1>
          <p style={{ fontSize:16, color:'var(--text-secondary)' }}>Track engagement and drop-offs across your API demos.</p>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" animate="show" style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:24, marginBottom:40 }}>
          <StatBox title="Total Views" value={totalViews.toLocaleString()} icon={<Eye size={20} color="var(--accent)" />} trend="+12.5%" />
          <StatBox title="Avg. Completion" value="68.2%" icon={<TrendingUp size={20} color="var(--success)" />} trend="+4.1%" />
          <StatBox title="Unique Visitors" value={Math.floor(totalViews * 0.8).toLocaleString()} icon={<Users size={20} color="var(--secondary)" />} trend="+8.2%" />
          <StatBox title="Avg. Time" value="1m 45s" icon={<Clock size={20} color="var(--warning)" />} trend="-2s" />
        </motion.div>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.3, duration: 0.6 }} className="glass-panel" style={{ borderRadius:24, padding:40, border:'1px solid rgba(255,255,255,0.05)', position:'relative' }}>
          <div style={{ fontSize:20, fontWeight:700, color:'var(--text-primary)', marginBottom:32, fontFamily:'var(--app-font-display)', letterSpacing:'-0.01em' }}>Views over time (Last 30 Days)</div>
          <div style={{ height:400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top:5, right:20, bottom:5, left:0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={16} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dx={-16} />
                <Tooltip 
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ background:'rgba(16, 20, 35, 0.9)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, color:'var(--text-primary)', boxShadow:'0 10px 40px rgba(0,0,0,0.5)', padding:'12px 16px' }}
                  itemStyle={{ color:'var(--accent)', fontWeight:600, fontSize:14 }}
                  labelStyle={{ color:'var(--text-secondary)', marginBottom:8, fontSize:12, fontWeight:600, textTransform:'uppercase' }}
                />
                <Area type="monotone" dataKey="views" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" animationDuration={1500} animationEasing="ease" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function StatBox({title, value, icon, trend}:any) {
  const isPos = trend.startsWith('+')
  return (
    <motion.div variants={itemVariant} className="glass-panel" style={{ borderRadius:24, padding:32, border:'1px solid rgba(255,255,255,0.03)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div style={{ width:48, height:48, borderRadius:16, background:'rgba(255,255,255,0.03)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(255,255,255,0.05)', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
          {icon}
        </div>
        <div style={{ fontSize:12, fontWeight:700, padding:'6px 12px', borderRadius:20, background: isPos ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: isPos ? 'var(--success)' : 'var(--warning)', border: `1px solid ${isPos ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
          {trend}
        </div>
      </div>
      <div style={{ fontSize:32, fontWeight:800, color:'var(--text-primary)', marginBottom:8, fontFamily:'var(--app-font-display)', letterSpacing:'-0.02em' }}>{value}</div>
      <div style={{ fontSize:14, color:'var(--text-secondary)', fontWeight:500 }}>{title}</div>
    </motion.div>
  )
}
