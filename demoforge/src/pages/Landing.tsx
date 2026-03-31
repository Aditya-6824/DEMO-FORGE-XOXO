import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Zap, Smartphone, Sparkles, Link as LinkIcon, BarChart3, Workflow, Play, Settings, Share2 } from 'lucide-react'

const smoothEase: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* GLOW BACKGROUNDS */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <motion.div 
          animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.2, 1] }} 
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '-10%', left: '20%', width: '600px', height: '600px', background: 'var(--secondary-glow)', filter: 'blur(120px)', borderRadius: '50%' }} 
        />
        <motion.div 
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [1.2, 1, 1.2] }} 
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '20%', right: '-10%', width: '500px', height: '500px', background: 'var(--accent-glow)', filter: 'blur(100px)', borderRadius: '50%' }} 
        />
      </div>

      {/* NAVBAR */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: smoothEase }}
        style={{
          position: 'sticky', top: 0, zIndex: 100, height: 72, padding: '0 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(2, 4, 10, 0.6)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent), var(--secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 800, color: '#000', fontFamily: 'var(--app-font-display)',
            boxShadow: '0 0 16px var(--accent-glow)'
          }}>DF</div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--app-font-display)' }}>
            Demo<span style={{color: 'var(--text-secondary)'}}>Forge</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <motion.button whileHover={{ y: -1, color: '#fff' }} onClick={() => navigate('/login')} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.2s' }}>
            Sign In
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: '0 0 24px var(--accent-glow)' }} 
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/signup')} 
            style={{ 
              background: 'var(--text-primary)', border: 'none', color: '#000', 
              padding: '10px 20px', borderRadius: 999, fontSize: 14, fontWeight: 700, 
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 
            }}>
            Get Started <ChevronRight size={16} />
          </motion.button>
        </div>
      </motion.nav>

      {/* HERO SECTION */}
      <div style={{ position: 'relative', padding: '120px 20px 80px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: smoothEase }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.2)',
              borderRadius: 999, padding: '8px 20px', fontSize: 13, color: 'var(--accent)',
              marginBottom: 40, fontWeight: 600, boxShadow: '0 0 20px var(--accent-subtle)'
            }}>
            <Sparkles size={14} /> Interactive API Demo Builder
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: smoothEase }}
            style={{
              fontSize: 'clamp(44px, 6vw, 80px)', fontWeight: 800, lineHeight: 1.05,
              marginBottom: 28, letterSpacing: '-0.03em'
            }}>
            Your API deserves a<br/><span className="shimmer-text">better first impression.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: smoothEase }}
            style={{ fontSize: 20, color: 'var(--text-secondary)', maxWidth: 640, lineHeight: 1.6, marginBottom: 48, fontWeight: 400 }}>
            Turn complex API endpoints into interactive, step-by-step product demos. Real requests, real responses, delivered in a beautiful shareable link.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: smoothEase }}
            style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: '0 0 32px var(--accent-glow)' }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/signup')} 
              style={{
                background: 'var(--accent)', border: 'none', color: '#000',
                padding: '0 32px', height: 56, borderRadius: 999, fontSize: 16, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
              }}>
              Start building free <ChevronRight size={18} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.08)' }} whileTap={{ scale: 0.95 }}
              style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)',
                padding: '0 32px', height: 56, borderRadius: 999, fontSize: 16, fontWeight: 600,
                cursor: 'pointer', backdropFilter: 'blur(10px)'
              }}>
              See how it works ↓
            </motion.button>
          </motion.div>
        </div>

        {/* HERO VISUAL — pure API panel, no device mockup sizing issues */}
        <motion.div 
          initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.5, ease: smoothEase }}
          style={{ marginTop: 80, position: 'relative', width: '100%', maxWidth: 900 }}>
          
          <motion.div 
            animate={{ y: [-6, 6, -6] }} transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
            className="glass-panel"
            style={{
              borderRadius: 20, overflow: 'hidden',
              boxShadow: '0 40px 100px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}>
            
            {/* Window chrome */}
            <div style={{ height: 48, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 10, background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', gap: 7 }}>
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8,
                  padding: '5px 14px', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--app-font-mono)',
                  display: 'flex', alignItems: 'center', gap: 6
                }}>
                  <span style={{ color: 'var(--success)' }}>●</span> app.demoforge.io/demo/get-balance
                </div>
              </div>
            </div>

            {/* API Demo Content — a generic rewards/balance API */}
            <div style={{ display: 'flex', minHeight: 380 }}>
              {/* Left: Step info */}
              <div style={{ flex: '0 0 320px', borderRight: '1px solid rgba(255,255,255,0.05)', padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', animation: 'livePulse 2s infinite' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)', letterSpacing: '0.1em' }}>LIVE DEMO</span>
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--app-font-display)', letterSpacing: '-0.01em', marginBottom: 8 }}>Check Wallet Balance</div>
                  <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Fetch the available balance in your admin wallet using a single POST request.</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Step 1', 'Step 2', 'Step 3'].map((s, i) => (
                    <div key={s} style={{
                      padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                      background: i === 0 ? 'var(--text-primary)' : 'rgba(255,255,255,0.05)',
                      color: i === 0 ? '#000' : 'var(--text-muted)',
                      border: `1px solid ${i === 0 ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
                    }}>{s}</div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, display: 'flex', gap: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>KEYBOARD: ← → to navigate</div>
                </div>
              </div>

              {/* Right: API Response */}
              <div style={{ flex: 1, padding: 28, fontFamily: 'var(--app-font-mono)', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 13, textShadow: '0 0 10px var(--accent-glow)' }}>POST</span>
                    <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>/api/v1/oauth/api</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--success)', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>200</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>~87ms</span>
                  </div>
                </div>

                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.12em', fontWeight: 700 }}>REQUEST</div>
                <pre style={{ margin: 0, padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
{`{
  "query": `}<span style={{ color: '#9ECE6A' }}>"plumProAPI.mutation.getBalance"</span>{`,
  "tag": `}<span style={{ color: '#9ECE6A' }}>"plumProAPI"</span>{`,
  "variables": { "data": { "balance": `}<span style={{ color: '#E8A272' }}>1</span>{` } }
}`}
                </pre>

                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.12em', fontWeight: 700 }}>RESPONSE</div>
                <AnimatedResponse />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* STATS BAR instead of fake company logos */}
      <div style={{ padding: '48px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(24px, 8vw, 80px)', flexWrap: 'wrap' }}>
          <StatBadge value="3 min" label="Average setup time" />
          <StatBadge value="1-click" label="Share with prospects" />
          <StatBadge value="Real" label="API calls, not mocks" />
          <StatBadge value="Free" label="No credit card needed" />
        </div>
      </div>

      {/* HOW TO CREATE A DEMO — step by step */}
      <div style={{ padding: '120px 24px', maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: smoothEase }} style={{ textAlign: 'center', marginBottom: 80 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(157, 0, 255, 0.06)', border: '1px solid rgba(157, 0, 255, 0.2)', color: 'var(--secondary)', padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 24 }}>
            <Play size={14} /> HOW IT WORKS
          </div>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, marginBottom: 20, letterSpacing: '-0.02em' }}>
            Create a demo in <span className="shimmer-text">3 steps.</span>
          </h2>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            Go from API documentation to a shareable interactive experience in minutes, not weeks.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
          <HowStep 
            num="01" 
            icon={<Settings size={24} />}
            title="Define your endpoints" 
            desc="Create a new demo, then add steps. For each step, configure the HTTP method, URL, headers, and request body. You can also import from an OpenAPI spec."
            delay={0.1}
          />
          <HowStep 
            num="02" 
            icon={<Play size={24} />}
            title="Preview & test live" 
            desc="Hit 'Test API' in the builder to fire real requests through our secure proxy. See the exact status code, latency, and response body your prospects will see."
            delay={0.2}
          />
          <HowStep 
            num="03" 
            icon={<Share2 size={24} />}
            title="Share the link" 
            desc="Set the demo to Live, copy the public URL, and send it anywhere — embed in docs, drop in an email, or share on social. No login required for viewers."
            delay={0.3}
          />
        </div>
      </div>

      {/* FEATURES GRID */}
      <div style={{ padding: '80px 24px 140px', maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: smoothEase }}
            style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, marginBottom: 20, letterSpacing: '-0.02em' }}>
            Built for API teams.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1, ease: smoothEase }}
            style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
            Everything you need to turn documentation into interactive experiences that convert.
          </motion.p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
          <FeatureCard icon={<Zap size={22} />} title="Live API Proxy" desc="Every step fires a real HTTP request through our secure proxy server. Real status codes, real latency, real payloads." delay={0.1} />
          <FeatureCard icon={<Sparkles size={22} />} title="OpenAPI Import" desc="Paste an OpenAPI spec URL. DemoForge parses endpoints and auto-generates interactive demo steps from it." delay={0.2} />
          <FeatureCard icon={<Smartphone size={22} />} title="Device Frames" desc="Display your demo inside iPhone, MacBook, or Chrome browser frames for a polished, realistic look." delay={0.3} />
          <FeatureCard icon={<LinkIcon size={22} />} title="Instant Share Links" desc="Every demo gets a unique public URL. No login walls for viewers — just direct access." delay={0.4} />
          <FeatureCard icon={<BarChart3 size={22} />} title="Engagement Analytics" desc="Track views, step completion rates, average time on demo, and exactly where prospects drop off." delay={0.5} />
          <FeatureCard icon={<Workflow size={22} />} title="Response Chaining" desc="Pipe the output of one API call into the next step's request — build fully connected, stateful workflows." delay={0.6} />
        </div>
      </div>

      {/* CTA SECTION */}
      <div style={{ padding: '120px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--secondary-glow)', filter: 'blur(150px)', opacity: 0.5, zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 32, padding: '80px 40px', backdropFilter: 'blur(20px)' }}>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, marginBottom: 24, letterSpacing: '-0.02em' }}>Ready to build your first demo?</h2>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>Create an account, define your API endpoints, and share a beautiful interactive experience in minutes.</p>
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: '0 0 32px var(--accent-glow)' }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/signup')} 
            style={{ background: 'var(--text-primary)', border: 'none', color: '#000', padding: '0 40px', height: 60, borderRadius: 999, fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Start building for free <ChevronRight size={18} />
          </motion.button>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, color: 'var(--text-secondary)', background: 'var(--bg-base)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontFamily: 'var(--app-font-display)', color: 'var(--text-primary)' }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, var(--accent), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: 11 }}>DF</div>
          DemoForge
        </div>
        <div style={{ display: 'flex', gap: 32, fontWeight: 500 }}>
          <motion.span whileHover={{ color: '#fff' }} onClick={() => navigate('/templates')} style={{ cursor: 'pointer' }}>Templates</motion.span>
          <motion.span whileHover={{ color: '#fff' }} style={{ cursor: 'pointer' }}>Docs</motion.span>
        </div>
        <div style={{ color: 'var(--text-muted)' }}>© {new Date().getFullYear()} DemoForge</div>
      </footer>

    </div>
  )
}

// --- Subcomponents ---

function StatBadge({ value, label }: { value: string, label: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--app-font-display)', letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>{label}</div>
    </motion.div>
  )
}

function HowStep({ num, icon, title, desc, delay }: { num: string, icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: smoothEase }}
      className="glass-panel"
      style={{ borderRadius: 24, padding: 40, border: '1px solid rgba(255,255,255,0.03)', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', top: 20, right: 24, fontSize: 64, fontWeight: 900, color: 'rgba(255,255,255,0.03)', fontFamily: 'var(--app-font-display)', lineHeight: 1 }}>{num}</div>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(157, 0, 255, 0.08)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28, border: '1px solid rgba(157, 0, 255, 0.15)' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, fontFamily: 'var(--app-font-display)', letterSpacing: '-0.01em' }}>{title}</h3>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{desc}</p>
    </motion.div>
  )
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay, ease: smoothEase }}
      whileHover={{ y: -5, background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}
      className="glass-panel"
      style={{
        borderRadius: 24, padding: 40, border: '1px solid rgba(255,255,255,0.03)',
        transition: 'border 0.3s'
      }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: '1px solid rgba(0, 240, 255, 0.2)' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, letterSpacing: '-0.01em' }}>{title}</h3>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
    </motion.div>
  )
}

// Typing animation — now shows Xoxoday-style balance response
function AnimatedResponse() {
  const [lines, setLines] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setLines(1), 400),
      setTimeout(() => setLines(2), 700),
      setTimeout(() => setLines(3), 1000),
      setTimeout(() => setLines(4), 1300),
      setTimeout(() => setLines(5), 1600),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <pre style={{ margin: 0, padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10, fontSize: 12, color: 'var(--text-secondary)', flex: 1, lineHeight: 1.6 }}>
      {`{`}<br/>
      <AnimatePresence>
        {lines > 0 && <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>  <span style={{ color: '#9ECE6A' }}>"code"</span>: <span style={{ color: '#E8A272' }}>0</span>,<br/></motion.span>}
        {lines > 1 && <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>  <span style={{ color: '#9ECE6A' }}>"message"</span>: <span style={{ color: '#9ECE6A' }}>"Success"</span>,<br/></motion.span>}
        {lines > 2 && <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>  <span style={{ color: '#9ECE6A' }}>"data"</span>: {'{'}<br/></motion.span>}
        {lines > 3 && <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>    <span style={{ color: '#9ECE6A' }}>"points"</span>: <span style={{ color: '#E8A272' }}>15000</span>,<br/>    <span style={{ color: '#9ECE6A' }}>"currency"</span>: <span style={{ color: '#9ECE6A' }}>"USD"</span>,<br/>    <span style={{ color: '#9ECE6A' }}>"value"</span>: <span style={{ color: '#E8A272' }}>150.00</span><br/></motion.span>}
        {lines > 4 && <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>  {'}'}<br/>{`}`}</motion.span>}
      </AnimatePresence>
    </pre>
  )
}
