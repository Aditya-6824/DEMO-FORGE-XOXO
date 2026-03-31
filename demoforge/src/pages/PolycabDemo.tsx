import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IPhoneMockup } from 'react-device-mockup'
import { ShieldCheck, Database, Zap } from 'lucide-react'
import { ApiPanel } from '../components/devices/ApiPanel'

const POLY_ACCENT = '#EF4444' // Polycab Red

const steps = [
  {
    id: 'intro',
    title: "Welcome to Polycab Loyalty",
    subtitle: "Customer Authentication Flow",
    description: "This interactive demo walks you through the secure customer login process using the Polycab Loyalty API. See how mobile-based authentication is handled in real-time.",
    deviceType: 'iphone',
    screenBg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    content: `
      <div style="padding: 40px 20px; color: white; font-family: sans-serif; text-align: center;">
        <div style="background: #EF4444; width: 60px; height: 60px; border-radius: 12px; margin: 0 auto 20px; display: flex; alignItems: center; justifyContent: center; fontSize: 24px; fontWeight: bold;">P</div>
        <h2 style="font-size: 24px; margin-bottom: 8px;">Polycab Experts</h2>
        <p style="color: #94a3b8; font-size: 14px;">Log in to access your rewards and points dashboard.</p>
        <div style="margin-top: 40px; background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); text-align: left;">
          <label style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Mobile Number</label>
          <div style="font-size: 16px; margin-top: 4px; color: #cbd5e1;">999XXXXX88</div>
        </div>
      </div>
    `
  },
  {
    id: 'api-call',
    title: "Request Live Login",
    subtitle: "POST /loginCustomer",
    description: "The application sends the customer credentials to the Oracle Cloud API Gateway. This is a LIVE request routed through our secure proxy.",
    deviceType: 'api',
    apiMethod: 'POST',
    apiEndpoint: 'https://o5anzw2wmjmwoxxydtld6a2ifq.apigateway.ap-mumbai-1.oci.customer-oci.com/polycab/loyalty/v1/login/loginCustomer',
    apiRequest: JSON.stringify({ mobileNumber: "9999999999", password: "demo-password" }, null, 2),
    screenBg: '#0f172a',
    content: `
      <div style="padding: 40px 20px; color: white; font-family: sans-serif;">
         <div style="display: flex; justify-content: center; margin-bottom: 20px;">
           <div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border-radius: 50%; color: #EF4444;">
             <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" style="animation: pulse 2s infinite;"><path d="M12 11V6a2 2 0 114 0v5m1 4a5 5 0 11-10 0v-3a5 5 0 0110 0v3z"/></svg>
           </div>
         </div>
         <h3 style="text-align: center; margin-bottom: 8px;">Securing Session...</h3>
         <p style="text-align: center; color: #94a3b8; font-size: 13px;">Executing Cloud Function via Oracle OCI</p>
      </div>
    `
  },
  {
    id: 'success',
    title: "Points Dashboard",
    subtitle: "Authenticated Session",
    description: "Upon successful login, the app retrieves the user's loyalty balance. This view represents the 'Success' state of the application.",
    deviceType: 'iphone',
    screenBg: 'white',
    content: `
      <div style="padding: 0; color: #1e293b; font-family: sans-serif;">
        <div style="height: 120px; background: #EF4444; border-radius: 0 0 24px 24px; padding: 20px; color: white;">
          <div style="font-size: 12px; opacity: 0.8;">Account Balance</div>
          <div style="font-size: 28px; font-weight: 800; margin-top: 4px;">1,250 <span style="font-size: 14px; font-weight: 400;">Points</span></div>
        </div>
        <div style="padding: 20px;">
          <h4 style="font-size: 14px; color: #64748b; margin-bottom: 12px;">Program Benefits</h4>
          <div style="background: #f8fafc; padding: 12px; border-radius: 12px; display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; background: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px;">🎁</div>
            <div>
              <div style="font-size: 14px; font-weight: 600;">Platinum Member</div>
              <div style="font-size: 11px; color: #94a3b8;">15% Extra on wiring orders</div>
            </div>
          </div>
        </div>
      </div>
    `
  }
]

export default function PolycabDemo() {
  const [idx, setIdx] = useState(0)
  const isFirst = idx === 0
  const isLast = idx === steps.length - 1
  const step = steps[idx]

  // Real API State
  const [liveResult, setLiveResult] = useState<{ body: string, status: number, ms: number } | null>(null)
  const [loading, setLoading] = useState(false)

  const runLiveCall = async () => {
    if (loading) return
    setLoading(true)
    try {
      const start = Date.now()
      const res = await fetch('http://localhost:3001/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: step.apiEndpoint,
          method: step.apiMethod,
          headers: { 'Content-Type': 'application/json' },
          body: step.apiRequest
        })
      })
      const data = await res.json()
      setLiveResult({
        body: typeof data.data === 'object' ? JSON.stringify(data.data, null, 2) : String(data.data),
        status: data.status,
        ms: Date.now() - start
      })
    } catch (e: any) {
      setLiveResult({ body: JSON.stringify({ error: "Connection Failed", details: e.message }), status: 500, ms: 0 })
    } finally {
      setLoading(false)
    }
  }

  // Effect to trigger real API call when hitting the API step
  useEffect(() => {
    if (step.id === 'api-call') {
      runLiveCall()
    } else {
      setLiveResult(null)
    }
  }, [idx])

  return (
    <div style={{ minHeight: '100vh', background: '#080B15', color: '#F0F4FF', fontFamily: 'Inter, sans-serif', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ height: 72, padding: '0 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, background: POLY_ACCENT, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>P</div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>Polycab Loyalty Demo</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748B' }}><ShieldCheck size={16} /> SSL Verified</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748B' }}><Database size={16} /> Live Cloud Sync</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        {/* Left Side: Device */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
           <AnimatePresence mode="wait">
             <motion.div
               key={idx}
               initial={{ opacity: 0, x: -20, scale: 0.95 }}
               animate={{ opacity: 1, x: 0, scale: 1 }}
               exit={{ opacity: 0, x: 20, scale: 0.95 }}
               transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
               style={{ display: 'flex', alignItems: 'center', gap: 40 }}
             >
               {step.deviceType === 'iphone' ? (
                 <div style={{ filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.5))' }}>
                   <IPhoneMockup screenType="island" screenWidth={320} frameColor="#101014">
                      <div style={{ width: '100%', height: '100%', background: step.screenBg }} dangerouslySetInnerHTML={{ __html: step.content }} />
                   </IPhoneMockup>
                 </div>
               ) : (
                 <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                   <div style={{ filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.5))' }}>
                     <IPhoneMockup screenType="island" screenWidth={240} frameColor="#101014">
                        <div style={{ width: '100%', height: '100%', background: step.screenBg }} dangerouslySetInnerHTML={{ __html: step.content }} />
                     </IPhoneMockup>
                   </div>
                   <div style={{ width: 400, opacity: 1 }}>
                     <ApiPanel 
                        method={step.apiMethod!}
                        endpoint={step.apiEndpoint!}
                        requestBody={step.apiRequest!}
                        responseBody={liveResult?.body || '{\n  "message": "Initializing Cloud Session..."\n}'}
                        statusCode={liveResult?.status || 102}
                        responseMs={liveResult?.ms || 0}
                        stepKey={idx.toString()}
                     />
                   </div>
                 </div>
               )}
             </motion.div>
           </AnimatePresence>
        </div>

        {/* Right Side: Step Info */}
        <div style={{ width: 440, background: 'rgba(255,255,255,0.01)', borderLeft: '1px solid rgba(255,255,255,0.05)', padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: 40 }}>
             <span style={{ fontSize: 13, fontWeight: 700, color: POLY_ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Step {idx + 1} of {steps.length}</span>
             <h2 style={{ fontSize: 32, fontWeight: 800, color: 'white', marginTop: 8, marginBottom: 16 }}>{step.title}</h2>
             <p style={{ fontSize: 17, lineHeight: 1.6, color: '#94A3B8' }}>{step.description}</p>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
             <button 
                onClick={() => setIdx(Math.max(0, idx - 1))}
                disabled={isFirst}
                style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: isFirst ? '#475569' : 'white', borderRadius: 12, cursor: isFirst ? 'not-allowed' : 'pointer', fontWeight: 600 }}
             >
               Previous
             </button>
             <button 
                onClick={() => setIdx(Math.min(steps.length - 1, idx + 1))}
                style={{ flex: 2, padding: '16px', background: isLast ? 'rgba(255,255,255,0.9)' : POLY_ACCENT, border: 'none', color: isLast ? '#000' : 'white', borderRadius: 12, cursor: 'pointer', fontWeight: 700, boxShadow: isLast ? 'none' : '0 10px 20px rgba(239, 68, 68, 0.3)' }}
             >
               {isLast ? "Restart Demo" : "Next Step"}
             </button>
          </div>

          <div style={{ marginTop: 60, display: 'flex', gap: 12 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ height: 4, flex: 1, background: i <= idx ? POLY_ACCENT : 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 40, background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, fontSize: 12, fontWeight: 700, color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Zap size={14} /> POWERED BY DEMOFORGE ENGINE</div>
      </div>
    </div>
  )
}
